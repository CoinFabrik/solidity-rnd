# IEeseeSwap


## SwapParams

_Struct used for NFT swap.
{swapData} - 1inch swap data to swap ESE for needed token.
{marketplaceRoutersData} - Addresses with data to call marketplace routers with._

```solidity
struct SwapParams {
  bytes swapData;
  struct IEeseeSwap.MarketplaceRouterData[] marketplaceRoutersData;
}
```
## MarketplaceRouterData

```solidity
struct MarketplaceRouterData {
  contract IEeseeMarketplaceRouter router;
  bytes data;
}
```
## ReceiveAsset

```solidity
event ReceiveAsset(struct Asset assetBought, contract IERC20 tokenSpent, uint256 spent, address recipient)
```

## EthDepositRejected

```solidity
error EthDepositRejected()
```

## InvalidRecipient

```solidity
error InvalidRecipient()
```

## InvalidSwapDescription

```solidity
error InvalidSwapDescription()
```

## SwapNotSuccessful

```solidity
error SwapNotSuccessful()
```

## InvalidAmount

```solidity
error InvalidAmount()
```

## TransferNotSuccessful

```solidity
error TransferNotSuccessful()
```

## InvalidConstructor

```solidity
error InvalidConstructor()
```

## CallerNotAuthorized

```solidity
error CallerNotAuthorized()
```

## ESE

```solidity
function ESE() external view returns (contract IERC20)
```

## OneInchRouter

```solidity
function OneInchRouter() external view returns (address)
```

## accessManager

```solidity
function accessManager() external view returns (contract IEeseeAccessManager)
```

## PAUSER_ROLE

```solidity
function PAUSER_ROLE() external view returns (bytes32)
```

## swapTokensForAssets

```solidity
function swapTokensForAssets(struct IEeseeSwap.SwapParams swapParams, address recipient) external returns (struct Asset[] assets, contract IERC20 dstToken, uint256 returnAmount, uint96 dust)
```

## pause

```solidity
function pause() external
```

## unpause

```solidity
function unpause() external
```


