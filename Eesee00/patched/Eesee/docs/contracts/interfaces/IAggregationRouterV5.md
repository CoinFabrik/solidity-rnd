# IAggregationRouterV5


## SwapDescription

```solidity
struct SwapDescription {
  contract IERC20 srcToken;
  contract IERC20 dstToken;
  address payable srcReceiver;
  address payable dstReceiver;
  uint256 amount;
  uint256 minReturnAmount;
  uint256 flags;
}
```
## swap

```solidity
function swap(address executor, struct IAggregationRouterV5.SwapDescription desc, bytes permit, bytes data) external payable returns (uint256 returnAmount, uint256 spentAmount)
```


