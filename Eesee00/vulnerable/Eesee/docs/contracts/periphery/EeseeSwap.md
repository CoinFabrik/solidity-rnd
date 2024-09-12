# EeseeSwap


## ESE

```solidity
contract IERC20 ESE
```

_ESE token this contract uses._

## OneInchRouter

```solidity
address OneInchRouter
```

_1inch router used for token swaps._

## swapTokensForAssets

```solidity
function swapTokensForAssets(struct SwapParams swapParams, address recipient) external returns (struct Asset[] assets, contract IERC20 dstToken, uint256 returnAmount, uint96 dust)
```

_Swap ESE tokens and receive assets the sender chooses. Emits {ReceiveAsset} event for each of the asset received._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| swapParams | struct SwapParams | - Struct containing 1inch swap data to swap ESE for needed token and addresses with data to call marketplace routers with. Leave empty if want to receive ESE. |
| recipient | address | - Address to send rewards to. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | struct Asset[] | - Assets received. |
| dstToken | contract IERC20 | - Token used in swap. |
| returnAmount | uint256 | - Amount of {dstToken}s received. |
| dust | uint96 | - ESE dust returned to {recipient}. |


# Inherited from IEeseeSwap

## ESE

```solidity
function ESE() external view returns (contract IERC20)
```

## OneInchRouter

```solidity
function OneInchRouter() external view returns (address)
```


## ReceiveAsset

```solidity
event ReceiveAsset(struct Asset assetBought, contract IERC20 tokenSpent, uint256 spent, address recipient)
```


