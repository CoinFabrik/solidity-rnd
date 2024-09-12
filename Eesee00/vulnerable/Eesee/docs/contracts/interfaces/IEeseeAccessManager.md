# IEeseeAccessManager


## RoleGranted

```solidity
event RoleGranted(bytes32 role, address account)
```

## RoleRevoked

```solidity
event RoleRevoked(bytes32 role, address account)
```

## CallerNotAdmin

```solidity
error CallerNotAdmin()
```

## hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```

## ADMIN_ROLE

```solidity
function ADMIN_ROLE() external view returns (bytes32)
```

## grantRole

```solidity
function grantRole(bytes32 role, address account) external
```

## revokeRole

```solidity
function revokeRole(bytes32 role, address account) external
```


