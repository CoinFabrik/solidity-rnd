# IEeseeRandom


## ChainlinkContructorArgs

_Because of the Stack too deep error, we combine some constructor arguments into a single stuct_

```solidity
struct ChainlinkContructorArgs {
  address vrfCoordinator;
  bytes32 keyHash;
  uint16 minimumRequestConfirmations;
  uint32 callbackGasLimit;
}
```
## RequestWords

```solidity
event RequestWords(uint256 requestID)
```

## FulfillRandomWords

```solidity
event FulfillRandomWords(uint256 randomWord)
```

## ChangeAutomationInterval

```solidity
event ChangeAutomationInterval(uint32 previousAutomationInterval, uint32 newAutomationInterval)
```

## ChangeCallbackGasLimit

```solidity
event ChangeCallbackGasLimit(uint32 previousCallbackGasLimit, uint32 newCallbackGasLimit)
```

## ApproveContract

```solidity
event ApproveContract(address _contract)
```

## CallerNotAuthorized

```solidity
error CallerNotAuthorized()
```

## InvalidAutomationInterval

```solidity
error InvalidAutomationInterval()
```

## UpkeepNotNeeded

```solidity
error UpkeepNotNeeded()
```

## CallOnTheSameBlock

```solidity
error CallOnTheSameBlock()
```

## InvalidAccessManager

```solidity
error InvalidAccessManager()
```

## RETURN_INTERVAL

```solidity
function RETURN_INTERVAL() external view returns (uint48)
```

## vrfCoordinator

```solidity
function vrfCoordinator() external view returns (contract VRFCoordinatorV2Interface)
```

## accessManager

```solidity
function accessManager() external view returns (contract IEeseeAccessManager)
```

## performUpkeepTimestamp

```solidity
function performUpkeepTimestamp() external view returns (uint64)
```

## automationInterval

```solidity
function automationInterval() external view returns (uint32)
```

## subscriptionID

```solidity
function subscriptionID() external view returns (uint64)
```

## callbackGasLimit

```solidity
function callbackGasLimit() external view returns (uint32)
```

## random

```solidity
function random(uint256) external view returns (uint256 word, uint256 timestamp)
```

## getRandomFromTimestamp

```solidity
function getRandomFromTimestamp(uint256 _timestamp) external view returns (uint256 word, uint256 timestamp)
```

## changeCallbackGasLimit

```solidity
function changeCallbackGasLimit(uint32 _callbackGasLimit) external
```

## changeAutomationInterval

```solidity
function changeAutomationInterval(uint32 _automationInterval) external
```


