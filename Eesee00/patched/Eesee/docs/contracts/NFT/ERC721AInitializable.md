# ERC721A__IERC721Receiver

_Interface of ERC721 token receiver._


## onERC721Received

```solidity
function onERC721Received(address operator, address from, uint256 tokenId, bytes data) external returns (bytes4)
```


# ERC721AInitializable

_Implementation of the [ERC721](https://eips.ethereum.org/EIPS/eip-721)
Non-Fungible Token Standard, including the Metadata extension.
Optimized for lower gas during batch mints.

Token IDs are minted in sequential order (e.g. 0, 1, 2, 3, ...)
starting from `_startTokenId()`.

Assumptions:

- An owner cannot have more than 2**64 - 1 (max value of uint64) of supply.
- The maximum token ID cannot exceed 2**256 - 1 (max value of uint256)._


## TokenApprovalRef

```solidity
struct TokenApprovalRef {
  address value;
}
```
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

## supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
[EIP section](https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified)
to learn more about how these ids are created.

This function call must use less than 30000 gas._

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

## tokenURI

```solidity
function tokenURI(uint256 tokenId) public view virtual returns (string)
```

_Returns the Uniform Resource Identifier (URI) for `tokenId` token._

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

_Gives permission to `to` to transfer `tokenId` token to another account.
The approval is cleared when the token is transferred.

Only a single account can be approved at a time, so approving the
zero address clears previous approvals.

Requirements:

- The caller must own the token or be an approved operator.
- `tokenId` must exist.

Emits an {Approval} event._

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


# Inherited from IERC721A


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


