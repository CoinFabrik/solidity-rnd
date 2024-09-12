# EeseePaymaster

A paymaster allowing addresses holding ESE tokens to pay for a GSN transaction.


## ESE

```solidity
contract IERC20 ESE
```

_ESE token this contract uses._

## nonces

```solidity
mapping(address => uint256) nonces
```

_Nonces for each address._

## accessManager

```solidity
contract IEeseeAccessManager accessManager
```

_Access manager for Eesee contract ecosystem._

## SIGNER_ROLE

```solidity
bytes32 SIGNER_ROLE
```

_Signer role in {accessManager}._

## ADMIN_ROLE

```solidity
bytes32 ADMIN_ROLE
```

_Admin role af defined in {accessManager}._

## approvedContracts

```solidity
mapping(address => bool) approvedContracts
```

_Contracts approved for use._

## Refilled

```solidity
event Refilled(address sender, uint256 eth)
```

## TokensCharged

```solidity
event TokensCharged(address payer, uint256 nonce, uint256 gasUseWithPost, uint256 tokenActualCharge, uint256 ethActualCharge, uint256 actualDiscount)
```

## Withdrawn

```solidity
event Withdrawn(address to, uint256 amount)
```

## ApproveContract

```solidity
event ApproveContract(address _contract)
```

## RevokeContractApproval

```solidity
event RevokeContractApproval(address _contract)
```

## InvalidConstructor

```solidity
error InvalidConstructor()
```

## ExpiredDeadline

```solidity
error ExpiredDeadline()
```

## InvalidSender

```solidity
error InvalidSender()
```

## InvalidSignature

```solidity
error InvalidSignature()
```

## ActualChargeHigher

```solidity
error ActualChargeHigher()
```

## CallerNotAuthorized

```solidity
error CallerNotAuthorized()
```

## AddressNotApproved

```solidity
error AddressNotApproved()
```

## AlreadyApproved

```solidity
error AlreadyApproved()
```

## withdrawTokens

```solidity
function withdrawTokens(address target) external returns (uint256 amount)
```

_Withdraws ESE collected from users._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | - Recipient address. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | - amount of ESE transfered to {target}. Note: This function can only be called by ADMIN_ROLE. |

## approveContract

```solidity
function approveContract(address _address) external
```

_Approves contract for use. Emits {ApproveContract} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _address | address | - New approvedContract. Note: This function can only be called by ADMIN_ROLE. |

## revokeContractApproval

```solidity
function revokeContractApproval(address _address) external
```

_Revokes contract approval from {_address}. Emits {RevokeContractApproval} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _address | address | - Address to revoke approval from. Note: This function can only be called by ADMIN_ROLE. |

## versionPaymaster

```solidity
function versionPaymaster() external pure returns (string)
```

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | version The SemVer string of this Paymaster's version. |

## getGasAndDataLimits

```solidity
function getGasAndDataLimits() public pure returns (struct IPaymaster.GasAndDataLimits limits)
```

Return the Gas Limits for Paymaster's functions and maximum msg.data length values for this Paymaster.
This function allows different paymasters to have different properties without changes to the RelayHub.

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| limits | struct IPaymaster.GasAndDataLimits | An instance of the `GasAndDataLimits` struct ##### `acceptanceBudget` If the transactions consumes more than `acceptanceBudget` this Paymaster will be charged for gas no matter what. Transaction that gets rejected after consuming more than `acceptanceBudget` gas is on this Paymaster's expense. Should be set to an amount gas this Paymaster expects to spend deciding whether to accept or reject a request. This includes gas consumed by calculations in the `preRelayedCall`, `Forwarder` and the recipient contract. :warning: **Warning** :warning: As long this value is above `preRelayedCallGasLimit` (see defaults in `BasePaymaster`), the Paymaster is guaranteed it will never pay for rejected transactions. If this value is below `preRelayedCallGasLimit`, it might might make Paymaster open to a "griefing" attack. The relayers should prefer lower `acceptanceBudget`, as it improves their chances of being compensated. From a Relay's point of view, this is the highest gas value a bad Paymaster may cost the relay, since the paymaster will pay anything above that value regardless of whether the transaction succeeds or reverts. Specifying value too high might make the call rejected by relayers (see `maxAcceptanceBudget` in server config). ##### `preRelayedCallGasLimit` The max gas usage of preRelayedCall. Any revert of the `preRelayedCall` is a request rejection by the paymaster. As long as `acceptanceBudget` is above `preRelayedCallGasLimit`, any such revert is not payed by the paymaster. ##### `postRelayedCallGasLimit` The max gas usage of postRelayedCall. The Paymaster is not charged for the maximum, only for actually used gas. Note that an OOG will revert the inner transaction, but the paymaster will be charged for it anyway. |


# Inherited from EIP712

## eip712Domain

```solidity
function eip712Domain() public view virtual returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)
```

_See {EIP-5267}.

_Available since v4.9.__



# Inherited from IERC5267


## EIP712DomainChanged

```solidity
event EIP712DomainChanged()
```

_MAY be emitted to signal that the domain could have changed._


# Inherited from BasePaymaster

## getRelayHub

```solidity
function getRelayHub() public view returns (address)
```

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address |  |

## supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

## setRelayHub

```solidity
function setRelayHub(contract IRelayHub hub) public
```

The owner of the Paymaster can change the instance of the RelayHub this Paymaster works with.
:warning: **Warning** :warning: The deposit on the previous RelayHub must be withdrawn first.

## setTrustedForwarder

```solidity
function setTrustedForwarder(address forwarder) public virtual
```

The owner of the Paymaster can change the instance of the Forwarder this Paymaster works with.
the Recipients must trust this Forwarder as well in order for the configuration to remain functional.

## getTrustedForwarder

```solidity
function getTrustedForwarder() public view virtual returns (address)
```

:warning: **Warning** :warning: using incorrect Forwarder may cause the Paymaster to agreeing to pay for invalid transactions.

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address |  |

## withdrawRelayHubDepositTo

```solidity
function withdrawRelayHubDepositTo(uint256 amount, address payable target) public
```

Withdraw deposit from the RelayHub.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount to be subtracted from the sender. |
| target | address payable | The target to which the amount will be transferred. |

## preRelayedCall

```solidity
function preRelayedCall(struct GsnTypes.RelayRequest relayRequest, bytes signature, bytes approvalData, uint256 maxPossibleGas) external returns (bytes, bool)
```

Called by the Relay in view mode and later by the `RelayHub` on-chain to validate that
the Paymaster agrees to pay for this call.

The request is considered to be rejected by the Paymaster in one of the following conditions:
 - `preRelayedCall()` method reverts
 - the `Forwarder` reverts because of nonce or signature error
 - the `Paymaster` returned `rejectOnRecipientRevert: true` and the recipient contract reverted
   (and all that did not consume more than `acceptanceBudget` gas).

In any of the above cases, all Paymaster calls and the recipient call are reverted.
In any other case the Paymaster will pay for the gas cost of the transaction.
Note that even if `postRelayedCall` is reverted the Paymaster will be charged.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| relayRequest | struct GsnTypes.RelayRequest | - the full relay request structure |
| signature | bytes | - user's EIP712-compatible signature of the `relayRequest`. Note that in most cases the paymaster shouldn't try use it at all. It is always checked by the forwarder immediately after preRelayedCall returns. |
| approvalData | bytes | - extra dapp-specific data (e.g. signature from trusted party) |
| maxPossibleGas | uint256 | - based on values returned from `getGasAndDataLimits` the RelayHub will calculate the maximum possible amount of gas the user may be charged for. In order to convert this value to wei, the Paymaster has to call "relayHub.calculateCharge()" |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes |  |
| [1] | bool |  |

## postRelayedCall

```solidity
function postRelayedCall(bytes context, bool success, uint256 gasUseWithoutPost, struct GsnTypes.RelayData relayData) external
```

This method is called after the actual relayed function call.
It may be used to record the transaction (e.g. charge the caller by some contract logic) for this call.

Revert in this functions causes a revert of the client's relayed call (and preRelayedCall(), but the Paymaster
is still committed to pay the relay for the entire transaction.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| context | bytes | The call context, as returned by the preRelayedCall |
| success | bool | `true` if the relayed call succeeded, false if it reverted |
| gasUseWithoutPost | uint256 | The actual amount of gas used by the entire transaction, EXCEPT        the gas used by the postRelayedCall itself. |
| relayData | struct GsnTypes.RelayData | The relay params of the request. can be used by relayHub.calculateCharge() |



# Inherited from Ownable

## owner

```solidity
function owner() public view virtual returns (address)
```

_Returns the address of the current owner._

## renounceOwnership

```solidity
function renounceOwnership() public virtual
```

_Leaves the contract without owner. It will not be possible to call
`onlyOwner` functions. Can only be called by the current owner.

NOTE: Renouncing ownership will leave the contract without an owner,
thereby disabling any functionality that is only available to the owner._

## transferOwnership

```solidity
function transferOwnership(address newOwner) public virtual
```

_Transfers ownership of the contract to a new account (`newOwner`).
Can only be called by the current owner._


## OwnershipTransferred

```solidity
event OwnershipTransferred(address previousOwner, address newOwner)
```


