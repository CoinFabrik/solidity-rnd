# EeseeMining


## Claim

_Claim:
{rewardID} - RewardID the tokens are claimed for.
{balance} - Amount of tokens to claim. 
{merkleProof} - Merkle proof to verify claim._

```solidity
struct Claim {
  uint128 rewardID;
  uint128 balance;
  bytes32[] merkleProof;
}
```
## ESE

```solidity
contract IERC20 ESE
```

_ESE token._

## rewardID

```solidity
uint128 rewardID
```

_Current reward ID._

## rewardRoot

```solidity
mapping(uint128 => bytes32) rewardRoot
```

_Maps {rewardID} to its merkle root._

## isClaimed

```solidity
mapping(address => mapping(uint128 => bool)) isClaimed
```

_Has address claimed reward for {rewardID}._

## accessManager

```solidity
contract IEeseeAccessManager accessManager
```

_Access manager for Eesee contract ecosystem._

## MERKLE_ROOT_UPDATER_ROLE

```solidity
bytes32 MERKLE_ROOT_UPDATER_ROLE
```

_Merkle root updater role in {accessManager}._

## RewardAdded

```solidity
event RewardAdded(uint128 rewardID, bytes32 merkleRoot)
```

## RewardClaimed

```solidity
event RewardClaimed(uint128 rewardID, address claimer, uint128 amount)
```

## InvalidMerkleProof

```solidity
error InvalidMerkleProof()
```

## AlreadyClaimed

```solidity
error AlreadyClaimed()
```

## CallerNotAuthorized

```solidity
error CallerNotAuthorized()
```

## InvalidConstructor

```solidity
error InvalidConstructor()
```

## MerkleRootNotExists

```solidity
error MerkleRootNotExists()
```

## claimRewards

```solidity
function claimRewards(struct EeseeMining.Claim[] claims, address claimer) external returns (uint256 rewards)
```

_Claims rewards for multiple {rewardID}s. Emits {RewardClaimed} event for each reward claimed._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| claims | struct EeseeMining.Claim[] | - Claim structs. |
| claimer | address | - Address to claim rewards for. |

## addReward

```solidity
function addReward(bytes32 merkleRoot) external
```

_Adds new merkle root and advances to the next {rewardID}. Emits {RewardAdded} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| merkleRoot | bytes32 | - Merkle root. Note: This function can only be called by the MERKLE_ROOT_UPDATER_ROLE. |

## getRewards

```solidity
function getRewards(address claimer, struct EeseeMining.Claim[] claims) external view returns (uint128 rewards)
```

_Verifies {claims} and returns rewards to be claimed from {claims}._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| claimer | address | - Address to check. |
| claims | struct EeseeMining.Claim[] | - Claims to check. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| rewards | uint128 | - Rewards to be claimed. |

## verifyClaim

```solidity
function verifyClaim(address claimer, struct EeseeMining.Claim claim) public view returns (bool)
```

_Verifies {claim} for {claimer}._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| claimer | address | - Address to verify claim for. |
| claim | struct EeseeMining.Claim | - Claim to verify. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool - Does {claim} exist in merkle root. |


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



