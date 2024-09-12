# IEesee


## Lot

_Lot:
{maxTickets} - Amount of tickets sold in this lot. 
{bonusTickets} - Bonus tickets in the lot.
{ticketsBought} - Amount of tickets bought (not including bonus).
{ticketPrice} - Price of a single ticket.

{transactions} - BuyTickets transactions.
{endTimestamp} - lot expiration timestamp. type(uint32).max = 4294967295s = 2106 years.
{fee} - Fee sent to {feeSplitter}.

{closed} - Is lot closed with a function call as opposed to expired.
{assetClaimed} - Is Asset claimed/reclaimed.
{tokensClaimed} - Are tokens claimed.
{buyout} - Indicationg if the lot was bought out by a single address.

{owner} - Lot creator.
{asset} - Asset sold in this lot. 

{intervals} - Exclusive upper bounds for amount of tickets for each BuyTickets transaction.
{recipients} - The address the tickets in the interval were bought for.
{ticketsHeldByAddress} - Total amount of tickets held by address (not including bonus).
{bonusTicketsHeldByAddress} - Amount of bonus tickets held by address._

```solidity
struct Lot {
  uint32 maxTickets;
  uint32 bonusTickets;
  uint32 ticketsBought;
  uint96 ticketPrice;
  uint32 transactions;
  uint32 endTimestamp;
  uint32 fee;
  bool closed;
  bool buyout;
  bool assetClaimed;
  bool tokensClaimed;
  address owner;
  struct Asset asset;
  mapping(uint32 => uint32) intervals;
  mapping(uint32 => address) recipients;
  mapping(address => uint32) ticketsHeldByAddress;
  mapping(address => uint32) bonusTicketsHeldByAddress;
}
```
## LotParams

_LotParams:
{maxTickets} - Amount of tickets sold in this lot. 
{ticketPrice} - Price of a single ticket.
{duration} - Duration of a lot (in seconds).
{owner} - Lot owner.
{signer} - Signer of signature or msg.sender to disable signature check. 
{signatureData} - ABI-encoded data with nonce, deadline and signature bytes. If signer == msg.sender can be set to any value._

```solidity
struct LotParams {
  uint32 maxTickets;
  uint96 ticketPrice;
  uint32 duration;
  address owner;
  address signer;
  bytes signatureData;
}
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

## CallerNotOwner

```solidity
error CallerNotOwner(uint256 ID)
```

## CallerNotWinner

```solidity
error CallerNotWinner(uint256 ID)
```

## CallerNotAuthorized

```solidity
error CallerNotAuthorized()
```

## AssetAlreadyClaimed

```solidity
error AssetAlreadyClaimed(uint256 ID)
```

## TokensAlreadyClaimed

```solidity
error TokensAlreadyClaimed(uint256 ID)
```

## LotAlreadyFulfilled

```solidity
error LotAlreadyFulfilled(uint256 ID)
```

## LotNotFulfilled

```solidity
error LotNotFulfilled(uint256 ID)
```

## LotExpired

```solidity
error LotExpired(uint256 ID)
```

## LotNotExpired

```solidity
error LotNotExpired(uint256 ID)
```

## LotNotExists

```solidity
error LotNotExists(uint256 ID)
```

## DurationTooLow

```solidity
error DurationTooLow(uint64 minDuration)
```

## DurationTooHigh

```solidity
error DurationTooHigh(uint64 maxDuration)
```

## MaxTicketsTooLow

```solidity
error MaxTicketsTooLow()
```

## MaxTicketsTooHigh

```solidity
error MaxTicketsTooHigh()
```

## TicketPriceTooLow

```solidity
error TicketPriceTooLow()
```

## BuyAmountTooLow

```solidity
error BuyAmountTooLow()
```

## FeeTooHigh

```solidity
error FeeTooHigh()
```

## ExpiredDeadline

```solidity
error ExpiredDeadline()
```

## ESEOverflow

```solidity
error ESEOverflow()
```

## AllTicketsBought

```solidity
error AllTicketsBought()
```

## NoTicketsHeld

```solidity
error NoTicketsHeld(uint256 ID)
```

## NoTicketsBought

```solidity
error NoTicketsBought(uint256 ID)
```

## InvalidArrayLengths

```solidity
error InvalidArrayLengths()
```

## InvalidMsgValue

```solidity
error InvalidMsgValue()
```

## InvalidRecipient

```solidity
error InvalidRecipient()
```

## InvalidAmount

```solidity
error InvalidAmount()
```

## InvalidDuration

```solidity
error InvalidDuration()
```

## InvalidOwner

```solidity
error InvalidOwner()
```

## InvalidAsset

```solidity
error InvalidAsset()
```

## InvalidToken

```solidity
error InvalidToken()
```

## InvalidTokenID

```solidity
error InvalidTokenID()
```

## InvalidInterface

```solidity
error InvalidInterface()
```

## InvalidSignature

```solidity
error InvalidSignature()
```

## InvalidData

```solidity
error InvalidData()
```

## NonceUsed

```solidity
error NonceUsed()
```

## TransferNotSuccessful

```solidity
error TransferNotSuccessful()
```

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

## createLots

```solidity
function createLots(struct Asset[] assets, struct IEesee.LotParams[] params) external payable returns (uint256[] IDs)
```

## createLotsAndBuyTickets

```solidity
function createLotsAndBuyTickets(struct Asset[] assets, struct IEesee.LotParams[] params, uint32[] amounts, address recipient, bytes permit) external payable returns (uint256[] IDs, uint96 tokensSpent)
```

## buyTickets

```solidity
function buyTickets(uint256[] ID, uint32[] amount, address recipient, bytes permit) external returns (uint96 tokensSpent)
```

## receiveAssets

```solidity
function receiveAssets(uint256[] IDs, address recipient) external returns (struct Asset[] assets)
```

## receiveTokens

```solidity
function receiveTokens(uint256[] IDs, address recipient) external returns (uint96 amount)
```

## reclaimAssets

```solidity
function reclaimAssets(uint256[] IDs, address recipient) external returns (struct Asset[] assets)
```

## reclaimTokens

```solidity
function reclaimTokens(uint256[] IDs, address recipient) external returns (uint96 amount)
```

## swapTokensForAssets

```solidity
function swapTokensForAssets(struct SwapParams swapParams, address recipient) external returns (struct Asset[] assets, contract IERC20 dstToken, uint256 returnAmount, uint96 dust)
```

## getLotsLength

```solidity
function getLotsLength() external view returns (uint256 length)
```

## getLotTicketHolder

```solidity
function getLotTicketHolder(uint256 ID, uint32 ticket) external view returns (address)
```

## getLotTicketsHeldByAddress

```solidity
function getLotTicketsHeldByAddress(uint256 ID, address _address) external view returns (uint32)
```

## getLotBonusTicketsHeldByAddress

```solidity
function getLotBonusTicketsHeldByAddress(uint256 ID, address _address) external view returns (uint32)
```

## getBuyTicketsRecipient

```solidity
function getBuyTicketsRecipient(uint256 ID, uint32 transaction) external view returns (address)
```

## changeMinDuration

```solidity
function changeMinDuration(uint64 _minDuration) external
```

## changeMaxDuration

```solidity
function changeMaxDuration(uint64 _maxDuration) external
```

## changeFee

```solidity
function changeFee(uint32 _fee) external
```


