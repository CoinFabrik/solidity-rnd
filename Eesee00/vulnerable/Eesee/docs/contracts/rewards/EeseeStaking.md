# EeseeStaking


## ESE

```solidity
contract IERC20 ESE
```

_ESE token to use in staking._

## volumeUpdaters

```solidity
mapping(address => bool) volumeUpdaters
```

_Addresses that can update volume. It can be useful to us to have multiple volume updaters._

## accessManager

```solidity
contract IEeseeAccessManager accessManager
```

_Access manager for Eesee contract ecosystem._

## ADMIN_ROLE

```solidity
bytes32 ADMIN_ROLE
```

_Admin role af defined in {accessManager}._

## volume

```solidity
mapping(address => uint256) volume
```

_Volume for each user on Eesee marketplace._

## userInfo

```solidity
mapping(bool => mapping(address => struct IEeseeStaking.UserInfo)) userInfo
```

_Maps isLocked bool to user to struct containing user data._

## totalDeposits

```solidity
uint96 totalDeposits
```

_Total ESE staked in this contract (not including rewards)._

## duration

```solidity
uint64 duration
```

_Min locked staking duration._

## deposit

```solidity
function deposit(bool isLocked, uint96 amount, bytes permit) external
```

_Stakes ESE tokens. If {isLocked} == false, the user can withdraw tokens anytime. Else, the user can withdraw their tokens after {duration} seconds._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| isLocked | bool | - True to stake with locked scheme. |
| amount | uint96 | - Amount of ESE tokens to stake. |
| permit | bytes | - Abi-encoded ESE permit data containing approveAmount, deadline, v, r and s. Set to empty bytes to skip permit. |

## withdraw

```solidity
function withdraw(bool isLocked, uint96 amount, address recipient) external returns (uint96 ESEReceived)
```

_Withdraws staked ESE tokens, collects rewards and sends them to {recipient}. Pass 0 to {amount} to only receive rewards._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| isLocked | bool | - Set to true to withdraw from locked scheme. Can only be done if the stake has unlocked (block.timestamp < user.unlockTime). |
| amount | uint96 | - Amount of ESE tokens to unstake. |
| recipient | address | - ESE receiver. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| ESEReceived | uint96 | - Amount of ESE tokens sent.        Note: If there are not enough tokens in the contract, only part of pending tokens will be sent.         The other tokens will be available after the balance of this contract has increased. |

## addVolume

```solidity
function addVolume(uint96 _volume, address _address) external
```

_Adds {_volume} to an {_address}'es volume._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _volume | uint96 | - Volume to add. |
| _address | address | - Address to update. Note: This function can only be called by volumeUpdater. |

## pendingReward

```solidity
function pendingReward(bool isLocked, address _user) external view returns (uint96)
```

_Returns ESE tokens earned by {_user}. Note: Does not take unlockTime or current contract reward balance into account._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| isLocked | bool |  |
| _user | address | - Address to check. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint96 | uint96 - Amount of ESE tokens ready to be collected. |

## tierInfo

```solidity
function tierInfo(uint256 _tier) external view returns (struct IEeseeStaking._TierData _tierData)
```

_Returns the info on specified tier._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tier | uint256 | - Tier to get info for. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tierData | struct IEeseeStaking._TierData | - uint256 volumeBreakpoint, uint64 rewardRateFlexible, uint64 rewardRateLocked. |

## tier

```solidity
function tier(uint256 _volume) public view returns (uint256)
```

_Returns the tier from volume._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _volume | uint256 | - Volume to check tier for. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 - Tier ID. |

## updateRewardRates

```solidity
function updateRewardRates(uint64[] rewardRatesFlexible, uint64[] rewardRatesLocked) external
```

_Changes the reward rates for all staking schemes and tiers._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| rewardRatesFlexible | uint64[] | - New reward per token per second for flexible scheme. |
| rewardRatesLocked | uint64[] | - New reward per token per second for locked scheme. Note: This function rewardRatesLocked only be called by ADMIN_ROLE. |

## changeDuration

```solidity
function changeDuration(uint64 _duration) external
```

_Changes duration for locked staking. Emits {ChangeDuration} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _duration | uint64 | - New duration. Note: This function can only be called by ADMIN_ROLE. |

## grantVolumeUpdater

```solidity
function grantVolumeUpdater(address _address) external
```

_Grants rights to update volume to {_address}. Emits {GrantVolumeUpdater} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _address | address | - New volumeUpdater. Note: This function can only be called by ADMIN_ROLE. |

## revokeVolumeUpdater

```solidity
function revokeVolumeUpdater(address _address) external
```

_Revokes rights to update volume from {_address}. Emits {RevokeVolumeUpdater} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _address | address | - Address to revoke volumeUpdater from. Note: This function can only be called by ADMIN_ROLE. |


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



# Inherited from IEeseeStaking

## ESE

```solidity
function ESE() external view returns (contract IERC20)
```

## volumeUpdaters

```solidity
function volumeUpdaters(address) external view returns (bool)
```

## accessManager

```solidity
function accessManager() external view returns (contract IEeseeAccessManager)
```

## ADMIN_ROLE

```solidity
function ADMIN_ROLE() external view returns (bytes32)
```

## volume

```solidity
function volume(address) external view returns (uint256)
```

## userInfo

```solidity
function userInfo(bool isLocked, address user) external view returns (uint96 amount, uint96 reward, uint64 unlockTime, uint256 rewardDebt)
```

## totalDeposits

```solidity
function totalDeposits() external view returns (uint96)
```

## duration

```solidity
function duration() external view returns (uint64)
```


## DepositFlexible

```solidity
event DepositFlexible(address user, uint96 amount)
```

## DepositLocked

```solidity
event DepositLocked(address user, uint96 amount, uint64 unlockTime)
```

## WithdrawFlexible

```solidity
event WithdrawFlexible(address sender, address recipient, uint96 amount)
```

## WithdrawLocked

```solidity
event WithdrawLocked(address sender, address recipient, uint96 amount)
```

## UpdateRewardRates

```solidity
event UpdateRewardRates(uint64[] rewardRatesFlexible, uint64[] rewardRatesLocked)
```

## ChangeDuration

```solidity
event ChangeDuration(uint64 previousDuration, uint64 newDuration)
```

## GrantVolumeUpdater

```solidity
event GrantVolumeUpdater(address account)
```

## RevokeVolumeUpdater

```solidity
event RevokeVolumeUpdater(address account)
```


