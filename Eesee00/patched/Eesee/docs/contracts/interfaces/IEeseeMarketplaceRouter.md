# IEeseeMarketplaceRouter


## TransferNotSuccessful

```solidity
error TransferNotSuccessful()
```

## InsufficientFunds

```solidity
error InsufficientFunds()
```

## EthDepositRejected

```solidity
error EthDepositRejected()
```

## CallerNotAuthorized

```solidity
error CallerNotAuthorized()
```

## accessManager

```solidity
function accessManager() external view returns (contract IEeseeAccessManager)
```

## PAUSER_ROLE

```solidity
function PAUSER_ROLE() external view returns (bytes32)
```

## purchaseAsset

```solidity
function purchaseAsset(bytes data, address recipient) external payable returns (struct Asset asset, uint256 spent)
```

## pause

```solidity
function pause() external
```

## unpause

```solidity
function unpause() external
```


