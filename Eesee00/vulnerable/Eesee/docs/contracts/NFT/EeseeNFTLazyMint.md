# EeseeNFTLazyMint


## contractURI

```solidity
string contractURI
```

_Opensea royalty and NFT collection info._

## collectionID

```solidity
uint256 collectionID
```

_Collection ID that is used to match collections in minting contract._

## owner

```solidity
address owner
```

_Owner address. Note: Owner doesn't have any special rights._

## minter

```solidity
address minter
```

_Minter contract._

## initialize

```solidity
function initialize(uint256 _collectionID, address _owner, address _minter, struct LazyMintCollectionMetadata metadata, address trustedForwarder) external
```

## tokenURI

```solidity
function tokenURI(uint256 tokenId) public view virtual returns (string)
```

_Returns tokenId's token URI._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | - Token ID to check. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | string Token URI. |

## mintSingle

```solidity
function mintSingle(address recipient, struct LazyMintTokenMetadata metadata) external returns (uint256 tokenId)
```

_Mints 1 NFT and sends it to the {recipient}._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | - Receiver of NFTs. |
| metadata | struct LazyMintTokenMetadata | - URI of the minted token, receiver of royalties for this token and amount of royalties received from each sale. [10000 = 100%] |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | - ID of token minted. Note: This function can only be called minter. |

## supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```


# Inherited from ERC2771Recipient

## getTrustedForwarder

```solidity
function getTrustedForwarder() public view virtual returns (address forwarder)
```

:warning: **Warning** :warning: The Forwarder can have a full control over your Recipient. Only trust verified Forwarder.
Method is not a required method to allow Recipients to trust multiple Forwarders. Not recommended yet.

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| forwarder | address | The address of the Forwarder contract that is being used. |

## isTrustedForwarder

```solidity
function isTrustedForwarder(address forwarder) public view virtual returns (bool)
```

:warning: **Warning** :warning: The Forwarder can have a full control over your Recipient. Only trust verified Forwarder.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| forwarder | address | The address of the Forwarder contract that is being used. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | isTrustedForwarder `true` if the Forwarder is trusted to forward relayed transactions by this Recipient. |



# Inherited from ERC2981

## royaltyInfo

```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice) public view virtual returns (address, uint256)
```

_Returns how much royalty is owed and to whom, based on a sale price that may be denominated in any unit of
exchange. The royalty amount is denominated and should be paid in that same unit of exchange._



# Inherited from ERC721AUpgradeable

## totalSupply

```solidity
function totalSupply() public view virtual returns (uint256)
```

_Returns the total number of tokens in existence.
Burned tokens will reduce the count.
To get the total number of tokens minted, please see {_totalMinted}._

## balanceOf

```solidity
function balanceOf(address owner) public view virtual returns (uint256)
```

_Returns the number of tokens in `owner`'s account._

## name

```solidity
function name() public view virtual returns (string)
```

_Returns the token collection name._

## symbol

```solidity
function symbol() public view virtual returns (string)
```

_Returns the token collection symbol._

## ownerOf

```solidity
function ownerOf(uint256 tokenId) public view virtual returns (address)
```

_Returns the owner of the `tokenId` token.

Requirements:

- `tokenId` must exist._

## approve

```solidity
function approve(address to, uint256 tokenId) public payable virtual
```

_Gives permission to `to` to transfer `tokenId` token to another account. See {ERC721A-_approve}.

Requirements:

- The caller must own the token or be an approved operator._

## getApproved

```solidity
function getApproved(uint256 tokenId) public view virtual returns (address)
```

_Returns the account approved for `tokenId` token.

Requirements:

- `tokenId` must exist._

## setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) public virtual
```

_Approve or remove `operator` as an operator for the caller.
Operators can call {transferFrom} or {safeTransferFrom}
for any token owned by the caller.

Requirements:

- The `operator` cannot be the caller.

Emits an {ApprovalForAll} event._

## isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) public view virtual returns (bool)
```

_Returns if the `operator` is allowed to manage all of the assets of `owner`.

See {setApprovalForAll}._

## transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) public payable virtual
```

_Transfers `tokenId` from `from` to `to`.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `tokenId` token must be owned by `from`.
- If the caller is not `from`, it must be approved to move this token
by either {approve} or {setApprovalForAll}.

Emits a {Transfer} event._

## safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) public payable virtual
```

_Equivalent to `safeTransferFrom(from, to, tokenId, '')`._

## safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data) public payable virtual
```

_Safely transfers `tokenId` token from `from` to `to`.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `tokenId` token must exist and be owned by `from`.
- If the caller is not `from`, it must be approved to move this token
by either {approve} or {setApprovalForAll}.
- If `to` refers to a smart contract, it must implement
{IERC721Receiver-onERC721Received}, which is called upon a safe transfer.

Emits a {Transfer} event._



# Inherited from IERC721AUpgradeable


## Transfer

```solidity
event Transfer(address from, address to, uint256 tokenId)
```

_Emitted when `tokenId` token is transferred from `from` to `to`._

## Approval

```solidity
event Approval(address owner, address approved, uint256 tokenId)
```

_Emitted when `owner` enables `approved` to manage the `tokenId` token._

## ApprovalForAll

```solidity
event ApprovalForAll(address owner, address operator, bool approved)
```

_Emitted when `owner` enables or disables
(`approved`) `operator` to manage all of its assets._

## ConsecutiveTransfer

```solidity
event ConsecutiveTransfer(uint256 fromTokenId, uint256 toTokenId, address from, address to)
```

_Emitted when tokens in `fromTokenId` to `toTokenId`
(inclusive) is transferred from `from` to `to`, as defined in the
[ERC2309](https://eips.ethereum.org/EIPS/eip-2309) standard.

See {_mintERC2309} for more details._


# Inherited from IEeseeNFTLazyMint

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



# Inherited from Initializable


## Initialized

```solidity
event Initialized(uint8 version)
```

_Triggered when the contract has been initialized or reinitialized._


