# EeseePeriphery


## ESE

```solidity
contract IERC20 ESE
```

_ESE token this contract uses._

## Eesee

```solidity
contract IEesee Eesee
```

_Eesee contract._

## EeseeDrops

```solidity
contract IEeseeDrops EeseeDrops
```

_Eesee drop contract._

## random

```solidity
contract IEeseeRandom random
```

_Contract that provides Eesee with random._

## OneInchRouter

```solidity
address OneInchRouter
```

_1inch router used for token swaps._

## returnInterval

```solidity
uint48 returnInterval
```

_In case Chainlink VRF request fails to get delivered {returnInterval} seconds after the lot was closed, unlock Reclaim functions._

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

## EthDepositRejected

```solidity
error EthDepositRejected()
```

## InvalidSwapDescription

```solidity
error InvalidSwapDescription()
```

## InvalidMsgValue

```solidity
error InvalidMsgValue()
```

## SwapNotSuccessful

```solidity
error SwapNotSuccessful()
```

## PartialFillNotAllowed

```solidity
error PartialFillNotAllowed()
```

## InvalidAsset

```solidity
error InvalidAsset()
```

## InvalidConstructor

```solidity
error InvalidConstructor()
```

## LotNotExists

```solidity
error LotNotExists()
```

## LotNotFulfilled

```solidity
error LotNotFulfilled()
```

## LotExpired

```solidity
error LotExpired()
```

## NoTicketsBought

```solidity
error NoTicketsBought()
```

## CallerNotAuthorized

```solidity
error CallerNotAuthorized()
```

## buyTicketsWithSwap

```solidity
function buyTicketsWithSwap(uint256[] IDs, uint32[] amounts, bytes swapData, address recipient) external payable returns (uint256 tokensSpent, uint96 dust)
```

_Buys tickets in Eesee contract with any token using 1inch router and swapping it for ESE. Note: Set compatibility and disableEstimate to true and partialFill to false in 1inch API._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of lots to buy tickets for. |
| amounts | uint32[] | - Amounts of tickets to buy in each lot. |
| swapData | bytes | - Data for 1inch swap. |
| recipient | address | - Recipient of tickets and dust refund. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokensSpent | uint256 | - Tokens spent. |
| dust | uint96 | - ESE token dust returned to recipient. |

## createLotsAndBuyTicketsWithSwap

```solidity
function createLotsAndBuyTicketsWithSwap(struct Asset[] assets, struct IEesee.LotParams[] params, uint32 expectedFee, uint32[] amounts, bytes swapData, address recipient) external payable returns (uint256[] IDs, uint256 tokensSpent, uint96 dust)
```

_Creates ESE lot and buy tickets in Eesee contract with any token using 1inch router and swapping it for ESE. Note: Set compatibility and disableEstimate to true and partialFill to false in 1inch API._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | struct Asset[] | - Assets being listed. |
| params | struct IEesee.LotParams[] | - Parameters for a lot. |
| expectedFee | uint32 |  |
| amounts | uint32[] | - Amounts of tickets to buy in each lot. |
| swapData | bytes | - Data for 1inch swap. |
| recipient | address | - Recipient of tickets and dust refund. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of created lots. |
| tokensSpent | uint256 | - Tokens spent. |
| dust | uint96 | - ESE token dust returned to recipient. |

## mintDropsWithSwap

```solidity
function mintDropsWithSwap(uint256[] IDs, uint32[] quantities, bytes32[][] merkleProofs, bytes swapData, address recipient) external payable returns (uint256 tokensSpent, uint96 dust)
```

_Mints NFTs for a drop with any token using 1inch. Emits {MintDrop} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of drops to mint NFTs from. |
| quantities | uint32[] | - Amounts of NFTs to mint in each drop. |
| merkleProofs | bytes32[][] | - Merkle proofs for a user to mint NFTs. |
| swapData | bytes | - Amount of approved tickets with signed permit. |
| recipient | address | - Recipient of NFT and dust refund. Note: Must be in Merkle Tree |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokensSpent | uint256 | - Amount of tokens spent for swap to ESE. |
| dust | uint96 | - Amount of ESE tokens sent back after paying {mintPrice}. |

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

## getLotWinner

```solidity
function getLotWinner(uint256 ID) external view returns (address winner, bool isAssetWinner)
```

_Get the winner of eesee lot. Return address(0) if no winner found._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - ID of the lot. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| winner | address | - Lot winner. Returns address(0) if no winner chosen. |
| isAssetWinner | bool | - True if winner recieves asset. False if winner receives ESE tokens. |


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



