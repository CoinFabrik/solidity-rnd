# SwapParams

_Struct used for NFT swap.
{swapData} - 1inch swap data to swap ESE for needed token.
{marketplaceRoutersData} - Addresses with data to call marketplace routers with._

```solidity
struct SwapParams {
  bytes swapData;
  struct MarketplaceRouterData[] marketplaceRoutersData;
}
```
# MarketplaceRouterData

```solidity
struct MarketplaceRouterData {
  contract IEeseeMarketplaceRouter router;
  bytes data;
}
```
# IEeseeSwap


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

## ESE

```solidity
function ESE() external view returns (contract IERC20)
```

## OneInchRouter

```solidity
function OneInchRouter() external view returns (address)
```

## swapTokensForAssets

```solidity
function swapTokensForAssets(struct SwapParams swapParams, address recipient) external returns (struct Asset[] assets, contract IERC20 dstToken, uint256 returnAmount, uint96 dust)
```


