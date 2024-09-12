# LibDirectTransfer


## Purchase

```solidity
struct Purchase {
  address sellOrderMaker;
  uint256 sellOrderNftAmount;
  bytes4 nftAssetClass;
  bytes nftData;
  uint256 sellOrderPaymentAmount;
  address paymentToken;
  uint256 sellOrderSalt;
  uint256 sellOrderStart;
  uint256 sellOrderEnd;
  bytes4 sellOrderDataType;
  bytes sellOrderData;
  bytes sellOrderSignature;
  uint256 buyOrderPaymentAmount;
  uint256 buyOrderNftAmount;
  bytes buyOrderData;
}
```
## Part

```solidity
struct Part {
  address payable account;
  uint96 value;
}
```
## DataV1

```solidity
struct DataV1 {
  struct LibDirectTransfer.Part[] payouts;
  struct LibDirectTransfer.Part[] originFees;
}
```
## DataV2

```solidity
struct DataV2 {
  struct LibDirectTransfer.Part[] payouts;
  struct LibDirectTransfer.Part[] originFees;
  bool isMakeFill;
}
```
## DataV3_BUY

```solidity
struct DataV3_BUY {
  uint256 payouts;
  uint256 originFeeFirst;
  uint256 originFeeSecond;
  bytes32 marketplaceMarker;
}
```
## DataV3_SELL

```solidity
struct DataV3_SELL {
  uint256 payouts;
  uint256 originFeeFirst;
  uint256 originFeeSecond;
  uint256 maxFeesBasePoint;
  bytes32 marketplaceMarker;
}
```

