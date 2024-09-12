# EeseeAccessManager


## ADMIN_ROLE

```solidity
bytes32 ADMIN_ROLE
```

## hasRole

```solidity
function hasRole(bytes32 role, address account) public view returns (bool)
```

_Retrurns if {account} has {role}._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role | bytes32 | - Role to check. |
| account | address | - Account to check. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true if {account} has been granted {role}. |

## grantRole

```solidity
function grantRole(bytes32 role, address account) external
```

_Grants {role} to {account}. If {account} had not been already granted {role}, emits a {RoleGranted} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role | bytes32 | - Role to grant. |
| account | address | - Account to grant role to.

## revokeRole

```solidity
function revokeRole(bytes32 role, address account) external
```

_Revokes {role} from {account}. If {account} had been granted {role}, emits a {RoleRevoked} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| role | bytes32 | - Role to revoke. |
| account | address | - Account to revoke role from.


# Inherited from IEeseeAccessManager

## ADMIN_ROLE

```solidity
function ADMIN_ROLE() external view returns (bytes32)
```


## RoleGranted

```solidity
event RoleGranted(bytes32 role, address account)
```

## RoleRevoked

```solidity
event RoleRevoked(bytes32 role, address account)
```

