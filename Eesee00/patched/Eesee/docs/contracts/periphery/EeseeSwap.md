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

## accessManager

```solidity
contract IEeseeAccessManager accessManager
```

_Access manager for Eesee contract ecosystem._

## PAUSER_ROLE

```solidity
bytes32 PAUSER_ROLE
```

_Pauser role in {accessManager}._

## swapTokensForAssets

```solidity
function swapTokensForAssets(struct IEeseeSwap.SwapParams swapParams, address recipient) external returns (struct Asset[] assets, contract IERC20 dstToken, uint256 returnAmount, uint96 dust)
```

_Swap ESE tokens and receive assets the sender chooses. Emits {ReceiveAsset} event for each of the asset received._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| swapParams | struct IEeseeSwap.SwapParams | - Struct containing 1inch swap data to swap ESE for needed token and addresses with data to call marketplace routers with. Leave empty if want to receive ESE. |
| recipient | address | - Address to send rewards to. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | struct Asset[] | - Assets received. |
| dstToken | contract IERC20 | - Token used in swap. |
| returnAmount | uint256 | - Amount of {dstToken}s received. |
| dust | uint96 | - ESE dust returned to {recipient}. |

## pause

```solidity
function pause() external
```

_Called by the PAUSER_ROLE to pause, triggers stopped state._

## unpause

```solidity
function unpause() external
```

_Called by the PAUSER_ROLE to unpause, returns to normal state._


# Inherited from Pausable

## paused

```solidity
function paused() public view virtual returns (bool)
```

_Returns true if the contract is paused, and false otherwise._


## Paused

```solidity
event Paused(address account)
```

_Emitted when the pause is triggered by `account`._

## Unpaused

```solidity
event Unpaused(address account)
```

_Emitted when the pause is lifted by `account`._


# Inherited from IEeseeSwap

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


## ReceiveAsset

```solidity
event ReceiveAsset(struct Asset assetBought, contract IERC20 tokenSpent, uint256 spent, address recipient)
```


