// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
@title Interface for vGlobalMinter contract, which handles VRSW and gVRSW tokens distribution.
*/
interface IvGlobalMinter {
    /**
     * @notice Emitted when a new staker factory is set.
     * @param stakerFactoryAddress is the address of the new staker factory.
     */
    event NewStakerFactory(address stakerFactoryAddress);

    /**
     * @notice Emitted when a new vVestingWallet contract is created.
     * @param vestingWallet The address of the vesting wallet.
     * @param beneficiary The address of the beneficiary of the vesting contract.
     * @param startTs The start timestamp of the vesting contract.
     * @param duration The duration of the vesting contract.
     */
    event NewVesting(
        address vestingWallet,
        address beneficiary,
        uint256 startTs,
        uint256 duration
    );

    /**
     * @notice Emitted when rewards are transferred to an address.
     * @param to The address receiving the rewards.
     * @param amount The amount of rewards transferred.
     */
    event TransferRewards(address to, uint256 amount);

    /**
     * @notice Adds new vChainMinter. Should be called whenever new vChainMinter
     * is deployed on the new chain. Currently the transfers between chains are
     * done manually using intermediary wallet (contracts owner).
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     */
    function addChainMinter() external;

    /**
     * @notice Transfers to vChainMinters necessary amount of VRSW tokens for the
     * next mining epoch according to the schedule defined in EmissionMath library.
     * Currently the transfers are done manually using intermediary wallet (contracts owner).
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     */
    function nextEpochTransfer() external;

    /**
     * @notice Changes minting epoch duration and preparation time.
     * @param _epochDuration The duration (in seconds) of the epoch starting from the next
     * @param _epochPreparationTime The time (in seconds) before the next epoch for transfering
     * tokens.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     */
    function setEpochParams(
        uint256 _epochDuration,
        uint256 _epochPreparationTime
    ) external;

    /**
     * @notice Creates a new vVestingWallet contract for the given beneficiary.
     * @param beneficiary The address of the beneficiary of the vesting contract.
     * @param startTs The start timestamp of the vesting contract.
     * @param duration The duration of the vesting contract.
     * @param amount The amount of tokens to be vested.
     * @return vestingWallet The address of the new vesting wallet.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     */
    function newVesting(
        address beneficiary,
        uint256 startTs,
        uint256 duration,
        uint256 amount
    ) external returns (address vestingWallet);

    /**
     * @notice Transfers a specified amount of tokens to a recipient.
     *
     * This function allows the owner of the contract to transfer a specified
     * amount of unlocked tokens to a recipient address. The caller must be the
     * owner of the contract, and the current timestamp must be later than the
     * contract's emission start time.
     *
     * @param to The address of the recipient to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     * - The current timestamp must be later than the contract's emission start time.
     * - The contract must have enough unlocked tokens to transfer.
     */
    function arbitraryTransfer(address to, uint256 amount) external;
}
