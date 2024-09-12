# IEeseeStaking


## _TierData

```solidity
struct _TierData {
  uint256 volumeBreakpoint;
  uint64 rewardRateFlexible;
  uint64 rewardRateLocked;
}
```
## TierData

_TierData:
{volumeBreakpoint} - Max volume to apply rewardRateFlexible/rewardRateLocked for.
{rewardRate} - Reward per token per second. [10^18 = 1]_

```solidity
struct TierData {
  uint256 volumeBreakpoint;
  mapping(bool => uint64) rewardRate;
}
```
## UserInfo

```solidity
struct UserInfo {
  uint96 amount;
  uint96 reward;
  uint32 unlockTime;
  uint32 rewardID;
  uint256 rewardDebt;
}
```
## InvalidConstructor

```solidity
error InvalidConstructor()
```

## InvalidRecipient

```solidity
error InvalidRecipient()
```

## InvalidDuration

```solidity
error InvalidDuration()
```

## InvalidTiersLength

```solidity
error InvalidTiersLength()
```

## InsufficientStake

```solidity
error InsufficientStake()
```

## CallerNotAuthorized

```solidity
error CallerNotAuthorized()
```

## CallerNotVolumeUpdater

```solidity
error CallerNotVolumeUpdater()
```

## AlreadyGranted

```solidity
error AlreadyGranted()
```

## VolumeUpdaterNotGranted

```solidity
error VolumeUpdaterNotGranted()
```

## WithdrawalNotAvailable

```solidity
error WithdrawalNotAvailable()
```

## InvalidBreakpoint

```solidity
error InvalidBreakpoint()
```

## InvalidRewardRate

```solidity
error InvalidRewardRate()
```

## InvalidRewardID

```solidity
error InvalidRewardID()
```

## DepositFlexible

```solidity
event DepositFlexible(address user, uint96 amount)
```

## DepositLocked

```solidity
event DepositLocked(address user, uint96 amount, uint32 unlockTime)
```

## WithdrawFlexible

```solidity
event WithdrawFlexible(address sender, address recipient, uint96 amount)
```

## WithdrawLocked

```solidity
event WithdrawLocked(address sender, address recipient, uint96 amount)
```

## AddVolume

```solidity
event AddVolume(address volumeUpdater, address user, uint96 amount)
```

## UpdateRewardRates

```solidity
event UpdateRewardRates(uint64[] rewardRatesFlexible, uint64[] rewardRatesLocked)
```

## ChangeDuration

```solidity
event ChangeDuration(uint32 previousDuration, uint32 newDuration)
```

## GrantVolumeUpdater

```solidity
event GrantVolumeUpdater(address account)
```

## RevokeVolumeUpdater

```solidity
event RevokeVolumeUpdater(address account)
```

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
function userInfo(bool isLocked, address user) external view returns (uint96 amount, uint96 reward, uint32 unlockTime, uint32 rewardRateID, uint256 rewardDebt)
```

## totalDeposits

```solidity
function totalDeposits() external view returns (uint96)
```

## tierInfo

```solidity
function tierInfo(uint256 _tier) external view returns (struct IEeseeStaking._TierData)
```

## duration

```solidity
function duration() external view returns (uint32)
```

## deposit

```solidity
function deposit(uint96 amount, uint32 lockDuration, uint32 currentRewardID, bytes permit) external
```

## withdraw

```solidity
function withdraw(bool isLocked, uint96 amount, address recipient) external returns (uint96 ESEReceived)
```

## addVolume

```solidity
function addVolume(uint96 delta, address _address) external
```

## pendingReward

```solidity
function pendingReward(bool isLocked, address _user) external view returns (uint96)
```

## tier

```solidity
function tier(uint256 _volume) external view returns (uint256)
```

## updateRewardRates

```solidity
function updateRewardRates(uint64[] rewardRatesFlexible, uint64[] rewardRatesLocked) external
```

## changeDuration

```solidity
function changeDuration(uint32 _duration) external
```

## grantVolumeUpdater

```solidity
function grantVolumeUpdater(address _address) external
```

## revokeVolumeUpdater

```solidity
function revokeVolumeUpdater(address _address) external
```


