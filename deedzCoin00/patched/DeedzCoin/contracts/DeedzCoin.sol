// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract SupplierRole {
    error NotSupplier();
    address private _supplier;

    function setSupplier(address supplierAddress) internal {
        _supplier = supplierAddress;
    }

    function supplier() public view returns (address) {
        return _supplier;
    }

    event SupplierRoleTransferred(
        address indexed previousSupplier,
        address indexed newSupplier
    );

    modifier onlySupplier() {
        if (msg.sender != _supplier) {
            revert NotSupplier();
        }
        _;
    }
}

contract DeedzCoin is ERC20, Ownable, SupplierRole {
    uint256 internal constant TOTAL_SUPPLY =
        500_000_000_000_000_000_000_000_000;

    /**
     * @dev Reasons why a user's tokens have been locked
     */
    mapping(address => bytes32[]) public lockReason;

    /**
     * @dev locked token structure
     */
    struct LockToken {
        uint256 amount;
        uint256 validity;
        bool claimed;
    }

    /**
     * @dev Records data of all the tokens Locked
     */
    event Locked(
        address indexed addressOf,
        bytes32 indexed reason,
        uint256 amount,
        uint256 validity
    );

    /**
     * @dev Records data of all the tokens unlocked
     */
    event Unlocked(
        address indexed addressOf,
        bytes32 indexed reason,
        uint256 amount
    );

    /**
     * @dev Holds number & validity of tokens locked for a given reason for
     *      a specified address
     */
    mapping(address => mapping(bytes32 => LockToken)) public locked;

    /**
     * @dev constructor to mint initial tokens
     * Shall update to _mint once openzepplin updates their npm package.
     */
    constructor(address supplierAddress) ERC20("DEEDZ COIN", "DEEDZ") {
        setSupplier(supplierAddress);
        //Transfer(address(0), 0x367edD7806d157F3881c0A884E7634A4e100Aea2, _totalSupply);//MEW address here
        _mint(supplier(), TOTAL_SUPPLY); //MEW address here
    }

    function _transferSupplierRole(address newSupplier) internal {
        address oldSupplier = supplier();
        setSupplier(newSupplier);
        emit SupplierRoleTransferred(oldSupplier, supplier());
        _transfer(oldSupplier, newSupplier, balanceOf(oldSupplier));
    }

    error Invalid_SupplierZeroAddress();

    function transferSupplierRole(address newSupplier) external onlyOwner {
        if (newSupplier == address(0)) {
            revert Invalid_SupplierZeroAddress();
        }
        _transferSupplierRole(newSupplier);
    }

    error Invalid_TransferTimeInThePast(uint256 time);
    error Invalid_TransferToZeroAddress(address to);
    error Invalid_TokensAlreadyLocked(uint256 amount);
    error Invalid_TransferAmountZero(uint256 amount);

    /**
     * @dev Transfers and Locks a specified amount of tokens for a specified reason and until a specific time.
     *      The lock time is given as an actual timestamp.
     * @param to The address to which tokens are to be transferred
     * @param reason The reason for locking tokens
     * @param amount The number of tokens to be transferred and locked
     * @param time The lock time as an actual timestamp
     * @return A boolean indicating whether the transfer and lock operation was successful
     */
    function transferWithLockActualTime(
        address to,
        bytes32 reason,
        uint256 amount,
        uint256 time
    ) public onlySupplier returns (bool) {
        if (time <= block.timestamp) {
            revert Invalid_TransferTimeInThePast(time);
        }
        if (to == address(0)) {
            revert Invalid_TransferToZeroAddress(to);
        }
        uint256 lockedTokens = tokensLocked(to, reason);
        if (lockedTokens != 0) {
            revert Invalid_TokensAlreadyLocked(lockedTokens);
        }
        if (amount == 0) {
            revert Invalid_TransferAmountZero(amount);
        }
        uint256 validUntil = time;
        if (locked[to][reason].amount == 0) {
            lockReason[to].push(reason);
        }
        transfer(address(this), amount);
        locked[to][reason] = LockToken(amount, validUntil, false);
        emit Locked(to, reason, amount, validUntil);
        return true;
    }

    /**
     * @dev Transfers and Locks a specified amount of tokens,
     *      for a specified reason and time
     * @param to adress to which tokens are to be transfered
     * @param reason The reason to lock tokens
     * @param amount Number of tokens to be transfered and locked
     * @param time Lock time in seconds
     */
    function transferWithLock(
        address to,
        bytes32 reason,
        uint256 amount,
        uint256 time
    ) external onlySupplier returns (bool) {
        uint256 validUntil = block.timestamp + time; //solhint-disable-line
        if (to == address(0)) {
            revert Invalid_TransferToZeroAddress(to);
        }
        uint256 lockedTokens = tokensLocked(to, reason);
        if (lockedTokens != 0) {
            revert Invalid_TokensAlreadyLocked(lockedTokens);
        }
        if (amount == 0) {
            revert Invalid_TransferAmountZero(amount);
        }

        if (locked[to][reason].amount == 0) lockReason[to].push(reason);

        transfer(address(this), amount);
        locked[to][reason] = LockToken(amount, validUntil, false);

        emit Locked(to, reason, amount, validUntil);
        return true;
    }

    /**
     * @dev Returns tokens locked for a specified address for a
     *      specified reason
     *
     * @param addressOf The address whose tokens are locked
     * @param reason The reason to query the lock tokens for
     */
    function tokensLocked(
        address addressOf,
        bytes32 reason
    ) public view returns (uint256 amount) {
        if (!locked[addressOf][reason].claimed)
            amount = locked[addressOf][reason].amount;
    }

    /**
     * @dev Returns tokens locked for a specified address for a
     *      specified reason at a specific time
     *
     * @param addressOf The address whose tokens are locked
     * @param reason The reason to query the lock tokens for
     * @param time The timestamp to query the lock tokens for
     */
    function tokensLockedAtTime(
        address addressOf,
        bytes32 reason,
        uint256 time
    ) external view returns (uint256 amount) {
        if (locked[addressOf][reason].validity > time)
            amount = locked[addressOf][reason].amount;
    }

    /**
     * @dev Returns total tokens held by an address (locked + transferable)
     * @param addressOf The address to query the total balance of
     */
    function totalBalanceOf(
        address addressOf
    ) external view returns (uint256 amount) {
        amount = balanceOf(addressOf);

        for (uint256 i = 0; i < lockReason[addressOf].length; i++) {
            amount = amount + tokensLocked(addressOf, lockReason[addressOf][i]);
        }
    }

    error Invalid_TokensNotLocked(uint256 amount);

    /**
     * @dev Extends lock for a specified reason and time
     * @param addressOf The address whose tokens are locked
     * @param reason The reason to lock tokens
     * @param time Lock extension time in seconds
     */
    function extendLock(
        address addressOf,
        bytes32 reason,
        uint256 time
    ) external onlySupplier returns (bool) {
        uint256 lockedTokens = tokensLocked(addressOf, reason);
        if (lockedTokens <= 0) {
            revert Invalid_TokensNotLocked(lockedTokens);
        }
        locked[addressOf][reason].validity =
            locked[addressOf][reason].validity +
            time;

        emit Locked(
            addressOf,
            reason,
            locked[addressOf][reason].amount,
            locked[addressOf][reason].validity
        );
        return true;
    }

    /**
     * @dev Increase number of tokens locked for a specified reason
     * @param addressOf The address whose tokens are locked
     * @param reason The reason to lock tokens
     * @param amount Number of tokens to be increased
     */
    function increaseLockAmount(
        address addressOf,
        bytes32 reason,
        uint256 amount
    ) external onlySupplier returns (bool) {
        uint256 lockedTokens = tokensLocked(addressOf, reason);
        if (lockedTokens <= 0) {
            revert Invalid_TokensNotLocked(lockedTokens);
        }
        transfer(address(this), amount);

        locked[addressOf][reason].amount =
            amount +
            locked[addressOf][reason].amount;

        emit Locked(
            addressOf,
            reason,
            locked[addressOf][reason].amount,
            locked[addressOf][reason].validity
        );
        return true;
    }

    /**
     * @dev Returns unlockable tokens for a specified address for a specified reason
     * @param addressOf The address to query the the unlockable token count of
     * @param reason The reason to query the unlockable tokens for
     */
    function tokensUnlockable(
        address addressOf,
        bytes32 reason
    ) public view returns (uint256 amount) {
        if (
            locked[addressOf][reason].validity <= block.timestamp &&
            !locked[addressOf][reason].claimed
        )
            //solhint-disable-line
            amount = locked[addressOf][reason].amount;
    }

    /**
     * @dev Unlocks the unlockable tokens of a specified address
     * @param addressOf Address of user, claiming back unlockable tokens
     */
    function unlock(
        address addressOf
    ) external returns (uint256 unlockableTokens) {
        uint256 lockedTokens;

        for (uint256 i = 0; i < lockReason[addressOf].length; i++) {
            lockedTokens = tokensUnlockable(
                addressOf,
                lockReason[addressOf][i]
            );
            if (lockedTokens > 0) {
                unlockableTokens = lockedTokens + unlockableTokens;
                locked[addressOf][lockReason[addressOf][i]].claimed = true;
                emit Unlocked(
                    addressOf,
                    lockReason[addressOf][i],
                    lockedTokens
                );
            }
        }

        if (unlockableTokens > 0) transfer(addressOf, unlockableTokens);
    }

    /**
     * @dev Gets the unlockable tokens of a specified address
     * @param addressOf The address to query the the unlockable token count of
     */
    function getUnlockableTokens(
        address addressOf
    ) external view returns (uint256 unlockableTokens) {
        for (uint256 i = 0; i < lockReason[addressOf].length; i++) {
            unlockableTokens =
                unlockableTokens +
                tokensUnlockable(addressOf, lockReason[addressOf][i]);
        }
    }
}
