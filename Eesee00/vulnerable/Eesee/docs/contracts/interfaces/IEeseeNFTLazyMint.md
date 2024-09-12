# IEeseeNFTLazyMint


## contractURI

```solidity
function contractURI() external view returns (string)
```

## collectionID

```solidity
function collectionID() external view returns (uint256)
```

## owner

```solidity
function owner() external view returns (address)
```

## minter

```solidity
function minter() external view returns (address)
```

## initialize

```solidity
function initialize(uint256 _collectionID, address _owner, address _minter, struct LazyMintCollectionMetadata metadata, address trustedForwarder) external
```

## mintSingle

```solidity
function mintSingle(address recipient, struct LazyMintTokenMetadata metadata) external returns (uint256 tokenId)
```


