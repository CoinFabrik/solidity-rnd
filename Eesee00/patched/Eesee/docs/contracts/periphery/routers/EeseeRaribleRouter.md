# EeseeRaribleRouter


## exchangeV2Core

```solidity
contract IExchangeV2Core exchangeV2Core
```

_Main rarible marketplace contract's address._

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

## ERC20NotSupported

```solidity
error ERC20NotSupported()
```

## InvalidDataType

```solidity
error InvalidDataType()
```

## InvalidAssetClass

```solidity
error InvalidAssetClass()
```

## purchaseAsset

```solidity
function purchaseAsset(bytes data, address recipient) external payable returns (struct Asset asset, uint256 spent)
```

_Buys NFT for {nftPrice} from Rarible marketplace and sends it to {recipient}._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | bytes | - Encoded LibDirectTransfer.Purchase struct needed for rarible contracts. |
| recipient | address | - Address to send nft to. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | struct Asset | - Asset received. |
| spent | uint256 | - Tokens spent. |

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


# Inherited from ERC721Holder

## onERC721Received

```solidity
function onERC721Received(address, address, uint256, bytes) public virtual returns (bytes4)
```

_See {IERC721Receiver-onERC721Received}.

Always returns `IERC721Receiver.onERC721Received.selector`._



# Inherited from IEeseeMarketplaceRouter

## accessManager

```solidity
function accessManager() external view returns (contract IEeseeAccessManager)
```

## PAUSER_ROLE

```solidity
function PAUSER_ROLE() external view returns (bytes32)
```



