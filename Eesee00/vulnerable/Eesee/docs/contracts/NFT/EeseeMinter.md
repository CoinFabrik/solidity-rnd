# EeseeMinter


## EeseeNFTLazyMintImplementation

```solidity
address EeseeNFTLazyMintImplementation
```

_Contract implementations for Clonable_

## EeseeNFTDropImplementation

```solidity
address EeseeNFTDropImplementation
```

## random

```solidity
contract IEeseeRandom random
```

_Contract that provides random._

## trustedForwarder

```solidity
address trustedForwarder
```

_GSN trusted forwarder used in NFTs._

## lazyMintCollections

```solidity
mapping(address => mapping(address => mapping(uint256 => contract IEeseeNFTLazyMint))) lazyMintCollections
```

_Maps msg.senders to collection owners to collection IDs to NFT collections.
Note: We use owners in a mapping to avoid NFT censorship. 
If we did not include owners, malicious users would be able to frontrun collectionIDs to block other users' colelctions from being created.
msg.senders are also included in a mapping as a method of access control._

## lazyMint

```solidity
function lazyMint(uint256 collectionID, address owner, struct LazyMintCollectionMetadata collectionMetadata, struct LazyMintTokenMetadata tokenMetadata, address recipient) external returns (contract IERC721 collection, uint256 tokenID)
```

_Deploys NFT collection contract if there isn't one and mints token to it. Emits {Mint} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collectionID | uint256 | - Unique collection identificator. Note: different {owner}s can share the same collectionID for different collections. |
| owner | address | - The owner of the NFT collection contract. Is only used on deploy. |
| collectionMetadata | struct LazyMintCollectionMetadata | - Collection metadata info. (name for a collection, symbol of the collection and contract URI for opensea). |
| tokenMetadata | struct LazyMintTokenMetadata | - Token metadata info. (URI of the minted token, receiver of royalties for this token and amount of royalties received from each sale. [10000 = 100%]). |
| recipient | address | - Receiver of NFT. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| collection | contract IERC721 | - Address of the collection the NFT was minted to. |
| tokenID | uint256 | - ID of token minted. |

## deployDropCollection

```solidity
function deployDropCollection(struct DropMetadata metadata, uint32 mintLimit, uint32 mintStartTimestamp, struct IEeseeNFTDrop.StageOptions[] stages) external returns (contract IERC721 collection)
```

_Deploys a new drop collection contract._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| metadata | struct DropMetadata |  |
| mintLimit | uint32 | - NFT mint cap. |
| mintStartTimestamp | uint32 | - Mint start timestamp. |
| stages | struct IEeseeNFTDrop.StageOptions[] | - Options for the NFT sale stages. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| collection | contract IERC721 | - Drops collection address. |


# Inherited from IEeseeMinter

## random

```solidity
function random() external view returns (contract IEeseeRandom)
```

## lazyMintCollections

```solidity
function lazyMintCollections(address, address, uint256) external view returns (contract IEeseeNFTLazyMint)
```



