// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @dev Implementation of the {IERC20} interface with automatic vesting mechanism and EIP-2612 permit.
 */
contract ESE is ERC20Permit, ERC20Burnable {
    struct Beneficiary{
        uint256 amount;
        address addr;
    }

    struct VestingParams{
        uint256 amount;
        uint128 cliff;
        uint128 duration;// Duration without cliff
        mapping(address => uint256) amounts;
    }

    struct ConstructorVestingParams{
        uint32 cliff;
        uint32 duration;
        uint16 TGEMintShare;
    }
    
    ///@dev Vesting parameters. Mappings are more gas efficient than arrays.
    mapping(uint256 => VestingParams) public vestingStages;
    ///@dev Info on how many vesting stages there are in total.
    uint256 public vestingStagesLength;

    ///@dev Token generation event.
    uint256 public TGE;
    ///@dev Tokens already released by vesting.
    mapping(address => uint256) private _released;
    ///@dev Maps stage to its TGE mint share.
    mapping(uint256 => uint256) private _TGEMintShares;
    ///@dev Is beneficiary added to the specified stage.
    mapping(uint256 => mapping(address => bool)) private _isBeneficiaryAdded;

    ///@dev Total tokens that will be generated by vesting.
    uint256 private _totalVesting;
    ///@dev Total tokens were released by vesting.
    uint256 private _totalReleased;
    ///@dev Address who can add vesting beneficiaries and initialize this contract.
    address private _initializer;
    uint256 private constant denominator = 10000;

    event Initialize(uint256 TGE);

    modifier onlyBeforeInitialization() {
        require(TGE == 0, "ESE: Already initialized");
        require(msg.sender == _initializer, "ESE: Caller not _initializer");
        _;
    }

    // =========== Initialization ===========

    constructor(ConstructorVestingParams[] memory _vestingStages) ERC20("eesee","$ESE") ERC20Permit("eesee") {
        require(_vestingStages.length <= 10, "ESE: Invalid vesting stages");

        uint256 _denominator = denominator;
        for (uint256 i; i < _vestingStages.length;) {
            VestingParams storage crowdsale = vestingStages[i];
            crowdsale.cliff = _vestingStages[i].cliff;
            crowdsale.duration = _vestingStages[i].duration;

            uint256 TGEMintShare = _vestingStages[i].TGEMintShare;
            require(TGEMintShare <= _denominator, "ESE: Invalid TGEMintShare");
            _TGEMintShares[i] = TGEMintShare;

            unchecked{ ++i; }
        }

        _initializer = msg.sender;
        vestingStagesLength = _vestingStages.length;
    }

    /**
     * @dev Adds new vesting beneficiaries to {vestingStages}. Mints new tokens according to {_TGEMintShares} variable.
     * @param stage - vestingStages index to add beneficiaries for.
     * @param beneficiaries - Beneficiary structs containing beneficiaries's addresses and vesting amounts. 
     * Note: Can only be called in an unitialized state by {_initializer}.
     */
    function addVestingBeneficiaries(uint256 stage, Beneficiary[] calldata beneficiaries) external onlyBeforeInitialization {
        require(stage < vestingStagesLength, "ESE: Invalid stage");
        VestingParams storage crowdsale = vestingStages[stage];
        uint256 TGEMintShare = _TGEMintShares[stage];
        uint256 _denominator = denominator;

        uint256 addedVestingAmount;
        for(uint256 i; i < beneficiaries.length;){
            address beneficiary = beneficiaries[i].addr;
            require(!_isBeneficiaryAdded[stage][beneficiary], "ESE: Beneficiary already added");
            _isBeneficiaryAdded[stage][beneficiary] = true;
            uint256 amount = beneficiaries[i].amount;

            uint256 TGEMint = amount * TGEMintShare / _denominator;
            if(TGEMint != 0){
                _mint(beneficiary, TGEMint);
            }

            uint256 vestingAmount = amount - TGEMint;
            crowdsale.amounts[beneficiary] = vestingAmount;
            addedVestingAmount += vestingAmount;
            unchecked{ ++i; }
        }
        crowdsale.amount += addedVestingAmount;
        _totalVesting += addedVestingAmount;

        // 96 bits are enough for our case.
        if(super.totalSupply() + _totalVesting > type(uint96).max) revert ("ESE: Overflow");
    }

    /**
     * @dev Initializes this contract. Token transfers are not available until this function is called. Emits {Initialize} event.
     * Note: Can only be called in an unitialized state by {_initializer}.
     */
    function initialize() external onlyBeforeInitialization {
        TGE = block.timestamp;
        emit Initialize(block.timestamp);
    }
    
    // =========== View Functions ===========

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view override returns (uint256) {
        unchecked{
            return super.totalSupply() + _totalReleasableAmount() - _totalReleased;
        }
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view override returns (uint256) {
        unchecked{
            return super.balanceOf(account) + _releasableAmount(account);
        }
    }

    /**
     * @dev Info on how many tokens have already been vested during 3 vesting periods in total.
     */
    function totalVestedAmount(uint256 stage) external view returns(uint256){
        require(stage < vestingStagesLength, "ESE: Invalid stage");
        return _totalVestedAmount(vestingStages[stage]);
    }

    /**
     * @dev Info on how many tokens have already been vested during 3 vesting periods for account.
     */
    function vestedAmount(uint256 stage, address account) external view returns(uint256){
        require(stage < vestingStagesLength, "ESE: Invalid stage");
        return _vestedAmount(vestingStages[stage], account);
    }

    // =========== Internal Functions ===========

    /**
     * @dev Mint vested tokens for from address. Update _totalReleased, _released[from] variables.
     */
    function _beforeTokenTransfer(address from, address /*to*/, uint256 /*amount*/) internal override {
        if(from != address(0)){
            require(TGE != 0, "ESE: Not initialized");
            uint256 releasableAmount = _releasableAmount(from);
            _mint(from, releasableAmount);
            unchecked {
                if(releasableAmount > 0){
                    _totalReleased += releasableAmount;
                    _released[from] += releasableAmount;
                }
            }
        }
    }

    /**
     * @dev Calculates the amount that has already vested but hasn't been released yet.
     */
    function _totalReleasableAmount() internal view returns(uint256 amount){
        unchecked{
            uint256 length = vestingStagesLength;
            for(uint256 i; i < length; ++i){
                amount += _totalVestedAmount(vestingStages[i]);
            }
        }
    }

    /**
     * @dev Calculates the amount that has already vested for a given vesting period in total.
     * @param vesting - Vesting period to check.
     */
    function _totalVestedAmount(VestingParams storage vesting) internal view returns (uint256) {
        uint256 amount = vesting.amount;
        if(amount == 0) {
            return 0;
        }

        unchecked {
            // Overflow not possible: vesting.cliff & vesting.duration are limited by 32 bits.
            uint256 start = TGE + vesting.cliff;
            if (block.timestamp < start) {
                return 0;
            }

            uint256 duration = vesting.duration;
            if (block.timestamp >= start + duration) {
                return amount;
            }

            // Overflow not possible: Max ESE amount is limited by type(uint96).max.
            return amount * (block.timestamp - start) / duration;
        }
    }

    /**
     * @dev Calculates the amount that has already vested but hasn't been released yet for an account.
     * @param account - Address to check.
     */
    function _releasableAmount(address account) internal view returns(uint256 amount){
        unchecked{
            uint256 length = vestingStagesLength;
            for(uint256 i; i < length; ++i){
                amount += _vestedAmount(vestingStages[i], account);
            }
            amount -= _released[account];
        }
    }

    /**
     * @dev Calculates the amount that has already vested for a given vesting period for an account.
     * @param vesting - Vesting period to check.
     * @param account - Address to check.
     */
    function _vestedAmount(VestingParams storage vesting, address account) internal view returns (uint256) {
        uint256 amount = vesting.amounts[account];
        if(amount == 0) {
            return 0;
        }

        unchecked {
            // Overflow not possible: vesting.cliff & vesting.duration are limited by 32 bits.
            uint256 start = TGE + vesting.cliff;
            if (block.timestamp < start) {
                return 0;
            }

            uint256 duration = vesting.duration;
            if (block.timestamp >= start + duration) {
                return amount;
            }

            // Overflow not possible: Max ESE amount is limited by type(uint96).max.
            return amount * (block.timestamp - start) / duration;
        }
    }
}
