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

