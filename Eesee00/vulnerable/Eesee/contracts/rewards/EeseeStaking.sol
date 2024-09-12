// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";
import "../interfaces/IEeseeStaking.sol";

// Adapted from Pancakeswap's SmartChefV2, adding multiple staking schemes and volume tier mechanic.
contract EeseeStaking is IEeseeStaking, ERC2771Recipient {
    using SafeERC20 for IERC20;

    ///@dev ESE token to use in staking.
    IERC20 public immutable ESE;
    ///@dev Addresses that can update volume. It can be useful to us to have multiple volume updaters.
    //Note: It makes sense to have it as a role in accessManager, however it saves gas on updateVolume() if we store it here. 
    mapping(address => bool) public volumeUpdaters;
    ///@dev Access manager for Eesee contract ecosystem.
    IEeseeAccessManager public immutable accessManager;
    ///@dev Admin role af defined in {accessManager}.
    bytes32 public immutable ADMIN_ROLE;

    ///@dev Tier data describing volume breakpoints & rewardRates.
    TierData[] private tierData;
    ///@dev Volume for each user on Eesee marketplace.
    mapping(address => uint256) public volume;
    ///@dev Maps isLocked bool to user to struct containing user data.
    mapping(bool => mapping(address => UserInfo)) public userInfo;
    ///@dev Maps isLocked bool to tier to accTokenPerShare.
    mapping(bool => mapping(uint256 => uint96)) private accTokenPerShare;
    ///@dev Maps isLocked bool to tier to last reward block for that tier.
    mapping(bool => mapping(uint256 => uint64)) private lastRewardTimestamp;

    ///@dev Total ESE staked in this contract (not including rewards).
    uint96 public totalDeposits;
    ///@dev Min locked staking duration.
    uint64 public duration = 90 days;
    ///@dev Denominator for reward rates.
    uint64 constant private denominator = 1 ether;

    modifier onlyAdmin(){
        if(!accessManager.hasRole(ADMIN_ROLE, _msgSender())) revert CallerNotAuthorized();
        _;
    }

    constructor(address _ESE, _TierData[] memory _tierData, IEeseeAccessManager _accessManager, address trustedForwarder) {
        if( 
            _ESE == address(0) ||
            address(_accessManager) == address(0)
        ) revert InvalidConstructor();

        if(_tierData.length == 0 || _tierData.length > 10) revert InvalidTiersLength();
        for(uint256 i; i < _tierData.length;){
            _TierData memory current = _tierData[i];
            if(i != 0){
                _TierData memory previous;
                unchecked{ previous = _tierData[i - 1]; }
                if(previous.volumeBreakpoint >= current.volumeBreakpoint) revert InvalidBreakpoint();
                if(previous.rewardRateFlexible > current.rewardRateFlexible) revert InvalidRewardRate();
                if(previous.rewardRateLocked > current.rewardRateLocked) revert InvalidRewardRate();
            }

            TierData storage __tierData = tierData.push();
            __tierData.volumeBreakpoint = current.volumeBreakpoint;
            __tierData.rewardRate[false] = current.rewardRateFlexible;
            __tierData.rewardRate[true] = current.rewardRateLocked;
            unchecked{ ++i; }
        }
        ESE = IERC20(_ESE);

        accessManager = _accessManager;
        ADMIN_ROLE = _accessManager.ADMIN_ROLE();

        _setTrustedForwarder(trustedForwarder);
    }

    // ========= Write Functions ========

    /**
     * @dev Stakes ESE tokens. If {isLocked} == false, the user can withdraw tokens anytime. Else, the user can withdraw their tokens after {duration} seconds.
     * @param isLocked - True to stake with locked scheme.
     * @param amount - Amount of ESE tokens to stake.
     * @param permit - Abi-encoded ESE permit data containing approveAmount, deadline, v, r and s. Set to empty bytes to skip permit.
     */
    function deposit(bool isLocked, uint96 amount, bytes calldata permit) external {
        address msgSender = _msgSender();
        IERC20 _ESE = ESE;
        if(permit.length != 0){
            (uint256 approveAmount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) = abi.decode(permit, (uint256, uint256, uint8, bytes32, bytes32));
            IERC20Permit(address(_ESE)).permit(msgSender, address(this), approveAmount, deadline, v, r, s);
        }

        uint256 _tier = tier(volume[msgSender]);
        _updatePool(isLocked, _tier);
        uint256 _accTokenPerShare = accTokenPerShare[isLocked][_tier];

        unchecked {
            UserInfo storage user = userInfo[isLocked][msgSender];
            uint96 userAmount = user.amount;
            if (userAmount > 0) {
                user.reward += uint96((_accTokenPerShare * userAmount - user.rewardDebt) / denominator);
            }
            if (amount > 0) {
                userAmount += amount;
                user.amount = userAmount;
                totalDeposits += amount;
                ESE.safeTransferFrom(msgSender, address(this), amount);

                if(isLocked){
                    uint64 unlockTime = uint64(block.timestamp) + duration;
                    user.unlockTime = unlockTime;
                    emit DepositLocked(msgSender, amount, unlockTime);
                }else{
                    emit DepositFlexible(msgSender, amount);
                }
            }
            user.rewardDebt = _accTokenPerShare * userAmount;
        }
    }

    /**
     * @dev Withdraws staked ESE tokens, collects rewards and sends them to {recipient}. Pass 0 to {amount} to only receive rewards.
     * @param isLocked - Set to true to withdraw from locked scheme. Can only be done if the stake has unlocked (block.timestamp < user.unlockTime).
     * @param amount - Amount of ESE tokens to unstake.
     * @param recipient - ESE receiver.

     * @return ESEReceived - Amount of ESE tokens sent.
       Note: If there are not enough tokens in the contract, only part of pending tokens will be sent. 
       The other tokens will be available after the balance of this contract has increased.
     */
    function withdraw(bool isLocked, uint96 amount, address recipient) external returns (uint96 ESEReceived){
        if(recipient == address(0)) revert InvalidRecipient();
        address msgSender = _msgSender();
        UserInfo storage user = userInfo[isLocked][msgSender];
        if(isLocked && block.timestamp < user.unlockTime) revert WithdrawalNotAvailable();
        uint96 userAmount = user.amount;
        if(amount > userAmount) revert InsufficientStake();

        uint256 _tier = tier(volume[msgSender]);
        _updatePool(isLocked, _tier);

        uint256 _accTokenPerShare = accTokenPerShare[isLocked][_tier];
        unchecked{
            uint96 reward = uint96((_accTokenPerShare * userAmount - user.rewardDebt) / denominator + user.reward);

            uint96 _totalDeposits = totalDeposits;
            uint96 availableReward = uint96(ESE.balanceOf(address(this))) - _totalDeposits;
            if(availableReward < reward){
                user.reward = reward - availableReward;
                reward = availableReward;
            }else{
                user.reward = 0;
            }

            if (amount > 0) {
                userAmount -= amount;
                user.amount = userAmount;
                totalDeposits = _totalDeposits - amount;
            }

            ESEReceived = reward + amount;
            if (ESEReceived > 0) {
                ESE.safeTransfer(recipient, ESEReceived);
                if(isLocked){
                    emit WithdrawLocked(msgSender, recipient, ESEReceived);
                }else{
                    emit WithdrawFlexible(msgSender, recipient, ESEReceived);
                }
            }
            user.rewardDebt = _accTokenPerShare * userAmount;
        }
    }

    /**
     * @dev Adds {_volume} to an {_address}'es volume.
     * @param _volume - Volume to add.
     * @param _address - Address to update.
     * Note: This function can only be called by volumeUpdater.
     */
    function addVolume(uint96 _volume, address _address) external {
        if(volumeUpdaters[msg.sender] == false) revert CallerNotVolumeUpdater(); // We don't want this to have any GSN related logic because this function is called by our contracts.

        uint256 volumeBefore = volume[_address];
        uint256 volumeAfter;
        unchecked{ volumeAfter = volumeBefore + _volume; }
        
        uint256 tierBefore = tier(volumeBefore);
        uint256 tierAfter = tier(volumeAfter);

        UserInfo storage userFlexible = userInfo[false][_address];
        uint256 amountFlexible = userFlexible.amount;
        if(amountFlexible != 0){
            _updatePool(false, tierBefore);
            if(tierBefore != tierAfter){
                _updatePool(false, tierAfter);
                unchecked {
                    uint96 accTokenPerShareFlexibleDifference = accTokenPerShare[false][tierAfter] - accTokenPerShare[false][tierBefore];
                    if(accTokenPerShareFlexibleDifference != 0){
                        userFlexible.rewardDebt += amountFlexible * accTokenPerShareFlexibleDifference;
                    }
                }
            }
        }

        UserInfo storage userLocked = userInfo[true][_address];
        uint256 amountLocked = userLocked.amount;
        if(amountLocked != 0){
            _updatePool(true, tierBefore);
            if(tierBefore != tierAfter){
                _updatePool(true, tierAfter);
                unchecked {
                    uint96 accTokenPerShareLockedDifference = accTokenPerShare[true][tierAfter] - accTokenPerShare[true][tierBefore];
                    if(accTokenPerShareLockedDifference != 0){
                        userLocked.rewardDebt += amountLocked * accTokenPerShareLockedDifference;
                    }
                }
            }
        }

        volume[_address] = volumeAfter;
    }

    // ========= View Functions ========

    /**
     * @dev Returns ESE tokens earned by {_user}. Note: Does not take unlockTime or current contract reward balance into account.
     * @param _user - Address to check.

     * @return uint96 - Amount of ESE tokens ready to be collected.
     */
    function pendingReward(bool isLocked, address _user) external view returns (uint96){
        UserInfo storage user = userInfo[isLocked][_user];

        uint256 _tier = tier(volume[_user]);
        unchecked {
            uint256 adjustedTokenPerShare = (block.timestamp - lastRewardTimestamp[isLocked][_tier]) * tierData[_tier].rewardRate[isLocked] + accTokenPerShare[isLocked][_tier];
            return uint96((adjustedTokenPerShare * user.amount - user.rewardDebt) / denominator + user.reward);
        }
    }

    /**
     * @dev Returns the info on specified tier.
     * @param _tier - Tier to get info for.

     * @return _tierData - uint256 volumeBreakpoint, uint64 rewardRateFlexible, uint64 rewardRateLocked.
     */
    function tierInfo(uint256 _tier) external view returns (_TierData memory _tierData){
        _tierData.volumeBreakpoint = tierData[_tier].volumeBreakpoint;
        _tierData.rewardRateFlexible = tierData[_tier].rewardRate[false];
        _tierData.rewardRateLocked = tierData[_tier].rewardRate[true];
    }

    /**
     * @dev Returns the tier from volume.
     * @param _volume - Volume to check tier for.

     * @return uint256 - Tier ID.
     */
    function tier(uint256 _volume) public view returns (uint256){
        // We could have implemented binary search here, but there will be more users with lower volumes, making it suboptimal.
        unchecked{
            uint256 length = tierData.length - 1;
            for(uint256 i; i < length; ++i) {
                if(_volume < tierData[i].volumeBreakpoint){
                    return i;
                }
            }
            return length;
        }
    }

    //================ Internal Functions ==================

    function _updatePool(bool isLocked, uint256 _tier) internal {
        uint64 _lastRewardTimestamp = lastRewardTimestamp[isLocked][_tier];
        if(block.timestamp == _lastRewardTimestamp) return;
        
        unchecked{ accTokenPerShare[isLocked][_tier] += uint96((block.timestamp - _lastRewardTimestamp) * tierData[_tier].rewardRate[isLocked]); }
        lastRewardTimestamp[isLocked][_tier] = uint64(block.timestamp);
    }

    //================ Admin ==================

    /**
     * @dev Changes the reward rates for all staking schemes and tiers.
     * @param rewardRatesFlexible - New reward per token per second for flexible scheme.
     * @param rewardRatesLocked - New reward per token per second for locked scheme.
     * Note: This function rewardRatesLocked only be called by ADMIN_ROLE.
     */
    function updateRewardRates(
        uint64[] calldata rewardRatesFlexible, 
        uint64[] calldata rewardRatesLocked
    ) external onlyAdmin {
        uint256 tierLength = tierData.length;
        if(rewardRatesFlexible.length != tierLength) revert InvalidTiersLength();
        if(rewardRatesLocked.length != tierLength) revert InvalidTiersLength();

        for(uint256 i; i < tierLength;){
            _updatePool(false, i);
            _updatePool(true, i);
            unchecked { ++i; }
        }

        for(uint256 i; i < tierLength;){
            if(i != 0){
                unchecked{
                    if(rewardRatesFlexible[i - 1] > rewardRatesFlexible[i]) revert InvalidRewardRate();
                    if(rewardRatesLocked[i - 1] > rewardRatesLocked[i]) revert InvalidRewardRate();
                }
            }

            tierData[i].rewardRate[false] = rewardRatesFlexible[i];
            tierData[i].rewardRate[true] = rewardRatesLocked[i];

            unchecked{ ++i; }
        }
        emit UpdateRewardRates(rewardRatesFlexible, rewardRatesLocked);
    }

    /**
     * @dev Changes duration for locked staking. Emits {ChangeDuration} event.
     * @param _duration - New duration.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function changeDuration(uint64 _duration) external onlyAdmin {
        if(_duration > 5*365 days) revert InvalidDuration();
        emit ChangeDuration(duration, _duration);
        duration = _duration;
    }

    /**
     * @dev Grants rights to update volume to {_address}. Emits {GrantVolumeUpdater} event.
     * @param _address - New volumeUpdater.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function grantVolumeUpdater(address _address) external onlyAdmin {
        if(volumeUpdaters[_address]) revert AlreadyGranted();
        volumeUpdaters[_address] = true;
        emit GrantVolumeUpdater(_address);
    }

    /**
     * @dev Revokes rights to update volume from {_address}. Emits {RevokeVolumeUpdater} event.
     * @param _address - Address to revoke volumeUpdater from.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function revokeVolumeUpdater(address _address) external onlyAdmin {
        if(!volumeUpdaters[_address]) revert VolumeUpdaterNotGranted();
        volumeUpdaters[_address] = false;
        emit RevokeVolumeUpdater(_address);
    }
}
