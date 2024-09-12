# Eesee


## lots

```solidity
struct IEesee.Lot[] lots
```

_An array of all existing lots._

## ESE

```solidity
contract IERC20 ESE
```

_ESE token this contract uses._

## staking

```solidity
contract IEeseeStaking staking
```

_Eesee staking contract. Tracks volume for this contract._

## random

```solidity
contract IEeseeRandom random
```

_Contract that provides random._

## feeSplitter

```solidity
address feeSplitter
```

_Address the {fee}s are sent to._

## accessManager

```solidity
contract IEeseeAccessManager accessManager
```

_Access manager for Eesee contract ecosystem._

## minDuration

```solidity
uint64 minDuration
```

_Min and max durations for a lot._

## maxDuration

```solidity
uint64 maxDuration
```

## fee

```solidity
uint32 fee
```

_Fee that is collected to {feeSplitter} from each fulfilled lot. [10000 == 100%]_

## createLots

```solidity
function createLots(struct Asset[] assets, struct IEesee.LotParams[] params) public payable returns (uint256[] IDs)
```

_Creates lots with assets from sender's balance. Emits {CreateLot} events for each created lot._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | struct Asset[] | - Assets to list. Note: The sender must have them approved for this contract. |
| params | struct IEesee.LotParams[] |  |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of lots created. |

## buyTickets

```solidity
function buyTickets(uint256[] IDs, uint32[] amounts, address recipient, bytes permit) public returns (uint96 tokensSpent)
```

_Buys tickets to participate in a lot. Emits {BuyTicket} event for each ticket bought._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of lots to buy tickets for. |
| amounts | uint32[] | - Amounts of tickets to buy in each lot. |
| recipient | address | - Recipient of tickets. |
| permit | bytes | - Abi-encoded ESE permit data containing approveAmount, deadline, v, r and s. Set to empty bytes to skip permit. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokensSpent | uint96 | - ESE tokens spent. |

## createLotsAndBuyTickets

```solidity
function createLotsAndBuyTickets(struct Asset[] assets, struct IEesee.LotParams[] params, uint32[] amounts, address recipient, bytes permit) external payable returns (uint256[] IDs, uint96 tokensSpent)
```

_Creates lots and buys tickets in them. Emits {CreateLot} for each lot created and {BuyTicket} event for each ticket bought._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | struct Asset[] | - Assets to list. Note: The sender must have them approved for this contract. |
| params | struct IEesee.LotParams[] | - Parameters for lots. |
| amounts | uint32[] | - Amounts of tickets to buy in each lot. |
| recipient | address | - Recipient of tickets. |
| permit | bytes | - Abi-encoded ESE permit data containing approveAmount, deadline, v, r and s. Set to empty bytes to skip permit. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of created lots. |
| tokensSpent | uint96 | - ESE tokens spent. |

## receiveAssets

```solidity
function receiveAssets(uint256[] IDs, address recipient) external returns (struct Asset[] assets)
```

_Receive assets the sender won from lots. Emits {ReceiveAsset} event for each of the asset received._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of lots to claim assets in. |
| recipient | address | - Address to send Assets to. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | struct Asset[] | - Assets received. |

## receiveTokens

```solidity
function receiveTokens(uint256[] IDs, address recipient) external returns (uint96 amount)
```

_Receive ESE the sender has earned from lots. Emits {ReceiveTokens} event for each of the claimed lot. 
Note: If the lot has expired, it takes 24 hours before {reclaimTokens} becomes available. 
If a random number is received in this timeframe, a winner is chosen and {receiveTokens} becomes avaliable for the winner to be called instead. 
In such case, a winner wins all collected ESE tokens instead of asset._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of lots to claim tokens in. |
| recipient | address | - Address to send tokens to. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint96 | - ESE received. |

## reclaimAssets

```solidity
function reclaimAssets(uint256[] IDs, address recipient) external returns (struct Asset[] assets)
```

_Reclaim assets from expired lots. Emits {ReclaimAsset} event for each lot ID._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of lots to reclaim assets in. |
| recipient | address | - Address to send assets to. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | struct Asset[] | - Assets reclaimed. |

## reclaimTokens

```solidity
function reclaimTokens(uint256[] IDs, address recipient) external returns (uint96 amount)
```

_Reclaim ESE from expired lots. Emits {ReclaimTokens} event for each lot ID._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of lots to reclaim tokens in. |
| recipient | address | - Address to send tokens to. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint96 | - ESE received. Note: This function will only be available after 24 hours after the lot has ended/expired and if no random number was received in this 24 hour timeframe. |

## swapTokensForAssets

```solidity
function swapTokensForAssets(struct SwapParams swapParams, address recipient) external returns (struct Asset[] assets, contract IERC20 dstToken, uint256 returnAmount, uint96 dust)
```

_Swap ESE in {swap}'s balance for specified assets on other marketplaces. Is intended to be used with {multicall} function. WARNING: Never send ESE to {swap} directly, or you will loose them._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| swapParams | struct SwapParams | - SwapParams struct containing 1inch swap data to swap ESE for needed token and addresses with data to call marketplace routers with. |
| recipient | address | - Address to send tokens to. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | struct Asset[] | - Assets received. |
| dstToken | contract IERC20 | - Token used in swap. |
| returnAmount | uint256 | - Amount of {dstToken}s received. |
| dust | uint96 | - ESE amount received |

## getLotsLength

```solidity
function getLotsLength() external view returns (uint256 length)
```

_Get length of the lots array._

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| length | uint256 | - Length of the lots array. |

## getLotTicketHolder

```solidity
function getLotTicketHolder(uint256 ID, uint32 ticket) external view returns (address)
```

_Get the holder of the specified ticket in lot._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - ID of the lot. |
| ticket | uint32 | - Ticket index. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address - Ticket holder. |

## getLotTicketsHeldByAddress

```solidity
function getLotTicketsHeldByAddress(uint256 ID, address _address) external view returns (uint32)
```

_Get amount of tickets held by address in a lot._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - ID of the lot. |
| _address | address | - Holder address. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | uint32 - Tickets held by {_address}. |

## getLotBonusTicketsHeldByAddress

```solidity
function getLotBonusTicketsHeldByAddress(uint256 ID, address _address) external view returns (uint32)
```

_Get amount of bonus tickets held by address in a lot._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - ID of the lot. |
| _address | address | - Holder address. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | uint32 - Tickets held by {_address}. |

## getBuyTicketsRecipient

```solidity
function getBuyTicketsRecipient(uint256 ID, uint32 transaction) external view returns (address)
```

_Get the recipient of tickets in specified {transaction}._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - ID of the lot. |
| transaction | uint32 | - Index of the transaction in a lot. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address - The sender of the tickets in {transaction}. |

## changeMinDuration

```solidity
function changeMinDuration(uint64 _minDuration) external
```

_Changes minDuration. Emits {ChangeMinDuration} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _minDuration | uint64 | - New minDuration. Note: This function can only be called by ADMIN_ROLE. |

## changeMaxDuration

```solidity
function changeMaxDuration(uint64 _maxDuration) external
```

_Changes maxDuration. Emits {ChangeMaxDuration} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _maxDuration | uint64 | - New maxDuration. Note: This function can only be called by ADMIN_ROLE. |

## changeFee

```solidity
function changeFee(uint32 _fee) external
```

_Changes fee. Emits {ChangeFee} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _fee | uint32 | - New fee. Note: This function can only be called by ADMIN_ROLE. |


# Inherited from Multicall

## multicall

```solidity
function multicall(bytes[] data) external payable returns (bytes[] results)
```

_Allows calling multiple contract functions in a single call:_

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | bytes[] | - ABI-encoded data describing the call. |



# Inherited from EIP712

## eip712Domain

```solidity
function eip712Domain() public view virtual returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)
```

_See {EIP-5267}.

_Available since v4.9.__



# Inherited from IERC5267


## EIP712DomainChanged

```solidity
event EIP712DomainChanged()
```

_MAY be emitted to signal that the domain could have changed._


# Inherited from ERC1155Holder

## onERC1155Received

```solidity
function onERC1155Received(address, address, uint256, uint256, bytes) public virtual returns (bytes4)
```

## onERC1155BatchReceived

```solidity
function onERC1155BatchReceived(address, address, uint256[], uint256[], bytes) public virtual returns (bytes4)
```



# Inherited from ERC1155Receiver

## supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._



# Inherited from ERC721Holder

## onERC721Received

```solidity
function onERC721Received(address, address, uint256, bytes) public virtual returns (bytes4)
```

_See {IERC721Receiver-onERC721Received}.

Always returns `IERC721Receiver.onERC721Received.selector`._



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



# Inherited from IEesee

## lots

```solidity
function lots(uint256) external view returns (uint32 maxTickets, uint32 bonusTickets, uint32 ticketsBought, uint96 ticketPrice, uint32 transactions, uint32 endTimestamp, uint32 fee, bool closed, bool buyout, bool assetClaimed, bool tokensClaimed, address owner, struct Asset asset)
```

## ESE

```solidity
function ESE() external view returns (contract IERC20)
```

## staking

```solidity
function staking() external view returns (contract IEeseeStaking)
```

## random

```solidity
function random() external view returns (contract IEeseeRandom)
```

## accessManager

```solidity
function accessManager() external view returns (contract IEeseeAccessManager)
```

## minDuration

```solidity
function minDuration() external view returns (uint64)
```

## maxDuration

```solidity
function maxDuration() external view returns (uint64)
```

## fee

```solidity
function fee() external view returns (uint32)
```

## feeSplitter

```solidity
function feeSplitter() external view returns (address)
```


## CreateLot

```solidity
event CreateLot(uint256 ID, struct Asset asset, address owner, uint32 maxTickets, uint96 ticketPrice, uint32 endTimestamp)
```

## ConsumeNonce

```solidity
event ConsumeNonce(uint256 ID, address signer, uint256 nonce)
```

## BuyTickets

```solidity
event BuyTickets(uint256 ID, address recipient, uint32 lowerBound, uint32 ticketAmount, uint96 tokensSpent, uint32 bonusTickets)
```

## ReceiveAsset

```solidity
event ReceiveAsset(uint256 ID, address winner, address recipient, struct Asset asset)
```

## ReceiveTokens

```solidity
event ReceiveTokens(uint256 ID, address claimer, address recipient, uint96 amount)
```

## ReclaimAsset

```solidity
event ReclaimAsset(uint256 ID, address owner, address recipient, struct Asset asset)
```

## ReclaimTokens

```solidity
event ReclaimTokens(uint256 ID, address claimer, address recipient, uint96 amount)
```

## CollectRoyalty

```solidity
event CollectRoyalty(address recipient, uint96 amount)
```

## CollectFee

```solidity
event CollectFee(address to, uint96 amount)
```

## ChangeMinDuration

```solidity
event ChangeMinDuration(uint64 previousMinDuration, uint64 newMinDuration)
```

## ChangeMaxDuration

```solidity
event ChangeMaxDuration(uint64 previousMaxDuration, uint64 newMaxDuration)
```

## ChangeFee

```solidity
event ChangeFee(uint32 previousFee, uint32 newFee)
```


