# EeseeOpenseaRouter


## seaport

```solidity
contract ISeaport seaport
```

_Main opensea marketplace contract's address_

## ConduitDoesntExist

```solidity
error ConduitDoesntExist()
```

## purchaseAsset

```solidity
function purchaseAsset(bytes data, address recipient) external payable returns (struct Asset asset, uint256 spent)
```

_Buys NFT for {nftPrice} from Opensea marketplace and sends it to {recipient}_

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | bytes | - Encoded OpenseaStructs.BasicOrderParameters struct needed for rarible contracts. |
| recipient | address | - Address where to send nft. |

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



