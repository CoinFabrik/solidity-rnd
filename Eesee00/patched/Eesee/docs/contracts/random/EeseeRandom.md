# EeseeRandom


## random

```solidity
struct Random[] random
```

_Random words and timestamps received from Chainlink._

## accessManager

```solidity
contract IEeseeAccessManager accessManager
```

_Access manager for Eesee contract ecosystem._

## performUpkeepTimestamp

```solidity
uint64 performUpkeepTimestamp
```

_Last performUpkeep call timestamp._

## subscriptionID

```solidity
uint64 subscriptionID
```

_Chainlink VRF V2 subscription ID._

## automationInterval

```solidity
uint32 automationInterval
```

_Chainlink Keeper performUpkeep() call frequency._

## RETURN_INTERVAL

```solidity
uint48 RETURN_INTERVAL
```

_In case Chainlink VRF request fails to get delivered 24 hours after the lot was closed, unlock Reclaim functions._

## callbackGasLimit

```solidity
uint32 callbackGasLimit
```

_Chainlink VRF V2 gas limit to call fulfillRandomWords()._

## vrfCoordinator

```solidity
contract VRFCoordinatorV2Interface vrfCoordinator
```

_Chainlink VRF V2 coordinator._

## performUpkeep

```solidity
function performUpkeep(bytes) external
```

_Calls Chainlink's requestRandomWords._

## performUpkeep

```solidity
function performUpkeep() external
```

_Calls Chainlink's requestRandomWords.
Note: This function can only be called by PERFORM_UPKEEP_ROLE._

## changeCallbackGasLimit

```solidity
function changeCallbackGasLimit(uint32 _callbackGasLimit) external
```

_Changes callbackGasLimit. Emits {ChangeCallbackGasLimit} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _callbackGasLimit | uint32 | - New callbackGasLimit. Note: This function can only be called by ADMIN_ROLE. |

## changeAutomationInterval

```solidity
function changeAutomationInterval(uint32 _automationInterval) external
```

_Changes automationInterval. Emits {ChangeAutomationInterval} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _automationInterval | uint32 | - New automationInterval. Note: This function can only be called by ADMIN_ROLE. |

## getRandomFromTimestamp

```solidity
function getRandomFromTimestamp(uint256 _timestamp) external view returns (uint256 word, uint256 timestamp)
```

## checkUpkeep

```solidity
function checkUpkeep(bytes) public view returns (bool upkeepNeeded, bytes)
```

_This function is called by Chainlink Keeper to determine if performUpkeep() needs to be called._


# Inherited from VRFConsumerBaseV2

## rawFulfillRandomWords

```solidity
function rawFulfillRandomWords(uint256 requestId, uint256[] randomWords) external
```



# Inherited from IEeseeRandom

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


