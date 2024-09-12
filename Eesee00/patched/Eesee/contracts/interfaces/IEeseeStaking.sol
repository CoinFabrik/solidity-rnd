// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IEeseeAccessManager.sol";

interface IEeseeStaking {
    struct _TierData{
        uint256 volumeBreakpoint;
        uint64 rewardRateFlexible;
        uint64 rewardRateLocked;
    }

    /**
     * @dev TierData:
     * {volumeBreakpoint} - Max volume to apply rewardRateFlexible/rewardRateLocked for.
     * {rewardRate} - Reward per token per second. [10^18 = 1]
     */
    struct TierData{
        uint256 volumeBreakpoint;
        mapping(bool => uint64) rewardRate;
    }

    struct UserInfo{
        uint96 amount;
        uint96 reward;
        uint32 unlockTime;
        uint32 rewardID;
        uint256 rewardDebt;
    }

    error InvalidConstructor();
    error InvalidRecipient();
    error InvalidDuration();
    error InvalidTiersLength();
    error InsufficientStake();
    error CallerNotAuthorized();
    error CallerNotVolumeUpdater();
    error AlreadyGranted();
    error VolumeUpdaterNotGranted();
    error WithdrawalNotAvailable();
    error InvalidBreakpoint();
    error InvalidRewardRate();
    error InvalidRewardID();

    event DepositFlexible(address indexed user, uint96 amount);
    event DepositLocked(address indexed user, uint96 amount, uint32 unlockTime);
    
    event WithdrawFlexible(address indexed sender, address indexed recipient, uint96 amount);
    event WithdrawLocked(address indexed sender, address indexed recipient, uint96 amount);

    event AddVolume(address indexed volumeUpdater, address indexed user, uint96 amount);

    event UpdateRewardRates(uint64[] rewardRatesFlexible, uint64[] rewardRatesLocked);
    event ChangeDuration(uint32 indexed previousDuration, uint32 indexed newDuration);
    event GrantVolumeUpdater(address indexed account);
    event RevokeVolumeUpdater(address indexed account);

    function ESE() external view returns(IERC20);
    function volumeUpdaters(address) external view returns(bool);
    function accessManager() external view returns(IEeseeAccessManager);
    function ADMIN_ROLE() external view returns(bytes32);

    function volume(address) external view returns(uint256);
    function userInfo(bool isLocked, address user) external view returns(uint96 amount, uint96 reward, uint32 unlockTime, uint32 rewardRateID, uint256 rewardDebt);

    function totalDeposits() external view returns(uint96);
    function tierInfo(uint256 _tier) external view returns(_TierData memory);
    function duration() external view returns(uint32);

    function deposit(uint96 amount, uint32 lockDuration, uint32 currentRewardID, bytes calldata permit) external;
    function withdraw(bool isLocked, uint96 amount, address recipient) external returns (uint96 ESEReceived);
    function addVolume(uint96 delta, address _address) external;
    
    function pendingReward(bool isLocked, address _user) external view returns (uint96);
    function tier(uint256 _volume) external view returns (uint256);

    function updateRewardRates(uint64[] calldata rewardRatesFlexible, uint64[] calldata rewardRatesLocked) external;
    function changeDuration(uint32 _duration) external;
    function grantVolumeUpdater(address _address) external;
    function revokeVolumeUpdater(address _address) external;
}