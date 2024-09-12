# IEeseeMinter


## IncorrectTokenURILength

```solidity
error IncorrectTokenURILength()
```

## InvalidConstructor

```solidity
error InvalidConstructor()
```

## random

```solidity
function random() external view returns (contract IEeseeRandom)
```

## lazyMintCollections

```solidity
function lazyMintCollections(address, address, uint256) external view returns (contract IEeseeNFTLazyMint)
```

## lazyMint

```solidity
function lazyMint(uint256 collectionID, address owner, struct LazyMintCollectionMetadata collectionMetadata, struct LazyMintTokenMetadata tokenMetadata, address recipient) external returns (contract IERC721 collection, uint256 tokenID)
```

## deployDropCollection

```solidity
function deployDropCollection(struct DropMetadata metadata, uint32 mintLimit, uint32 mintStartTimestamp, struct IEeseeNFTDrop.StageOptions[] stages) external returns (contract IERC721 collection)
```


