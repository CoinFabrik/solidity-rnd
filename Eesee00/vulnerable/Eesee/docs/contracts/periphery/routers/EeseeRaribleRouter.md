# EeseeRaribleRouter


## exchangeV2Core

```solidity
contract IExchangeV2Core exchangeV2Core
```

_Main rarible marketplace contract's address._

## ERC20NotSupported

```solidity
error ERC20NotSupported()
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


# Inherited from ERC721Holder

## onERC721Received

```solidity
function onERC721Received(address, address, uint256, bytes) public virtual returns (bytes4)
```

_See {IERC721Receiver-onERC721Received}.

Always returns `IERC721Receiver.onERC721Received.selector`._



