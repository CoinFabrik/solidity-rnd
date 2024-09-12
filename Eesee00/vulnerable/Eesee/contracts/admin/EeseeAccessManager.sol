// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "../interfaces/IEeseeAccessManager.sol";

contract EeseeAccessManager is IEeseeAccessManager {
    bytes32 public constant ADMIN_ROLE = 0x00;
    mapping(bytes32 => mapping(address => bool)) private _roles;

    /**
     * @dev Modifier that checks that an account has {ADMIN_ROLE}.
     */
    modifier onlyAdmin() {
        if(!hasRole(ADMIN_ROLE, msg.sender)) revert CallerNotAdmin();
        _;
    }

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Retrurns if {account} has {role}.
     * @param role - Role to check.
     * @param account - Account to check.

     * @return true if {account} has been granted {role}.
     */
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }

    /**
     * @dev Grants {role} to {account}. If {account} had not been already granted {role}, emits a {RoleGranted} event.
     * @param role - Role to grant.
     * @param account - Account to grant role to.

     * Note: This function can only be called by the ADMIN_ROLE.
     */
    function grantRole(bytes32 role, address account) external onlyAdmin {
        _grantRole(role, account);
    }

    function _grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            _roles[role][account] = true;
            emit RoleGranted(role, account);
        }
    }

    /**
     * @dev Revokes {role} from {account}. If {account} had been granted {role}, emits a {RoleRevoked} event.
     * @param role - Role to revoke.
     * @param account - Account to revoke role from.

     * Note: This function can only be called by the ADMIN_ROLE.
     */
    function revokeRole(bytes32 role, address account) external onlyAdmin {
        if (hasRole(role, account)) {
            _roles[role][account] = false;
            emit RoleRevoked(role, account);
        }
    }
}
