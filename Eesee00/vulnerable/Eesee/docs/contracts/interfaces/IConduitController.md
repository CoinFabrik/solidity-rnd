# IConduitController

ConduitControllerInterface contains all external function interfaces,
        structs, events, and errors for the conduit controller.


## ConduitProperties

_Track the conduit key, current owner, new potential owner, and open
     channels for each deployed conduit._

```solidity
struct ConduitProperties {
  bytes32 key;
  address owner;
  address potentialOwner;
  address[] channels;
  mapping(address => uint256) channelIndexesPlusOne;
}
```
## NewConduit

```solidity
event NewConduit(address conduit, bytes32 conduitKey)
```

_Emit an event whenever a new conduit is created._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The newly created conduit. |
| conduitKey | bytes32 | The conduit key used to create the new conduit. |

## OwnershipTransferred

```solidity
event OwnershipTransferred(address conduit, address previousOwner, address newOwner)
```

_Emit an event whenever conduit ownership is transferred._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which ownership has been                      transferred. |
| previousOwner | address | The previous owner of the conduit. |
| newOwner | address | The new owner of the conduit. |

## PotentialOwnerUpdated

```solidity
event PotentialOwnerUpdated(address newPotentialOwner)
```

_Emit an event whenever a conduit owner registers a new potential
     owner for that conduit._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newPotentialOwner | address | The new potential owner of the conduit. |

## InvalidCreator

```solidity
error InvalidCreator()
```

_Revert with an error when attempting to create a new conduit using a
     conduit key where the first twenty bytes of the key do not match the
     address of the caller._

## InvalidInitialOwner

```solidity
error InvalidInitialOwner()
```

_Revert with an error when attempting to create a new conduit when no
     initial owner address is supplied._

## NewPotentialOwnerAlreadySet

```solidity
error NewPotentialOwnerAlreadySet(address conduit, address newPotentialOwner)
```

_Revert with an error when attempting to set a new potential owner
     that is already set._

## NoPotentialOwnerCurrentlySet

```solidity
error NoPotentialOwnerCurrentlySet(address conduit)
```

_Revert with an error when attempting to cancel ownership transfer
     when no new potential owner is currently set._

## NoConduit

```solidity
error NoConduit()
```

_Revert with an error when attempting to interact with a conduit that
     does not yet exist._

## ConduitAlreadyExists

```solidity
error ConduitAlreadyExists(address conduit)
```

_Revert with an error when attempting to create a conduit that
     already exists._

## CallerIsNotOwner

```solidity
error CallerIsNotOwner(address conduit)
```

_Revert with an error when attempting to update channels or transfer
     ownership of a conduit when the caller is not the owner of the
     conduit in question._

## NewPotentialOwnerIsZeroAddress

```solidity
error NewPotentialOwnerIsZeroAddress(address conduit)
```

_Revert with an error when attempting to register a new potential
     owner and supplying the null address._

## CallerIsNotNewPotentialOwner

```solidity
error CallerIsNotNewPotentialOwner(address conduit)
```

_Revert with an error when attempting to claim ownership of a conduit
     with a caller that is not the current potential owner for the
     conduit in question._

## ChannelOutOfRange

```solidity
error ChannelOutOfRange(address conduit)
```

_Revert with an error when attempting to retrieve a channel using an
     index that is out of range._

## createConduit

```solidity
function createConduit(bytes32 conduitKey, address initialOwner) external returns (address conduit)
```

Deploy a new conduit using a supplied conduit key and assigning
        an initial owner for the deployed conduit. Note that the first
        twenty bytes of the supplied conduit key must match the caller
        and that a new conduit cannot be created if one has already been
        deployed using the same conduit key.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduitKey | bytes32 | The conduit key used to deploy the conduit. Note that                     the first twenty bytes of the conduit key must match                     the caller of this contract. |
| initialOwner | address | The initial owner to set for the new conduit. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The address of the newly deployed conduit. |

## updateChannel

```solidity
function updateChannel(address conduit, address channel, bool isOpen) external
```

Open or close a channel on a given conduit, thereby allowing the
        specified account to execute transfers against that conduit.
        Extreme care must be taken when updating channels, as malicious
        or vulnerable channels can transfer any ERC20, ERC721 and ERC1155
        tokens where the token holder has granted the conduit approval.
        Only the owner of the conduit in question may call this function.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to open or close the channel. |
| channel | address | The channel to open or close on the conduit. |
| isOpen | bool | A boolean indicating whether to open or close the channel. |

## transferOwnership

```solidity
function transferOwnership(address conduit, address newPotentialOwner) external
```

Initiate conduit ownership transfer by assigning a new potential
        owner for the given conduit. Once set, the new potential owner
        may call `acceptOwnership` to claim ownership of the conduit.
        Only the owner of the conduit in question may call this function.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to initiate ownership transfer. |
| newPotentialOwner | address | The new potential owner of the conduit. |

## cancelOwnershipTransfer

```solidity
function cancelOwnershipTransfer(address conduit) external
```

Clear the currently set potential owner, if any, from a conduit.
        Only the owner of the conduit in question may call this function.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to cancel ownership transfer. |

## acceptOwnership

```solidity
function acceptOwnership(address conduit) external
```

Accept ownership of a supplied conduit. Only accounts that the
        current owner has set as the new potential owner may call this
        function.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to accept ownership. |

## ownerOf

```solidity
function ownerOf(address conduit) external view returns (address owner)
```

Retrieve the current owner of a deployed conduit.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to retrieve the associated owner. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The owner of the supplied conduit. |

## getKey

```solidity
function getKey(address conduit) external view returns (bytes32 conduitKey)
```

Retrieve the conduit key for a deployed conduit via reverse
        lookup.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to retrieve the associated conduit                key. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduitKey | bytes32 | The conduit key used to deploy the supplied conduit. |

## getConduit

```solidity
function getConduit(bytes32 conduitKey) external view returns (address conduit, bool exists)
```

Derive the conduit associated with a given conduit key and
        determine whether that conduit exists (i.e. whether it has been
        deployed).

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduitKey | bytes32 | The conduit key used to derive the conduit. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The derived address of the conduit. |
| exists | bool | A boolean indicating whether the derived conduit has been                 deployed or not. |

## getPotentialOwner

```solidity
function getPotentialOwner(address conduit) external view returns (address potentialOwner)
```

Retrieve the potential owner, if any, for a given conduit. The
        current owner may set a new potential owner via
        `transferOwnership` and that owner may then accept ownership of
        the conduit in question via `acceptOwnership`.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to retrieve the potential owner. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| potentialOwner | address | The potential owner, if any, for the conduit. |

## getChannelStatus

```solidity
function getChannelStatus(address conduit, address channel) external view returns (bool isOpen)
```

Retrieve the status (either open or closed) of a given channel on
        a conduit.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to retrieve the channel status. |
| channel | address | The channel for which to retrieve the status. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| isOpen | bool | The status of the channel on the given conduit. |

## getTotalChannels

```solidity
function getTotalChannels(address conduit) external view returns (uint256 totalChannels)
```

Retrieve the total number of open channels for a given conduit.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to retrieve the total channel count. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalChannels | uint256 | The total number of open channels for the conduit. |

## getChannel

```solidity
function getChannel(address conduit, uint256 channelIndex) external view returns (address channel)
```

Retrieve an open channel at a specific index for a given conduit.
        Note that the index of a channel can change as a result of other
        channels being closed on the conduit.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to retrieve the open channel. |
| channelIndex | uint256 | The index of the channel in question. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| channel | address | The open channel, if any, at the specified channel index. |

## getChannels

```solidity
function getChannels(address conduit) external view returns (address[] channels)
```

Retrieve all open channels for a given conduit. Note that calling
        this function for a conduit with many channels will revert with
        an out-of-gas error.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| conduit | address | The conduit for which to retrieve open channels. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| channels | address[] | An array of open channels on the given conduit. |

## getConduitCodeHashes

```solidity
function getConduitCodeHashes() external view returns (bytes32 creationCodeHash, bytes32 runtimeCodeHash)
```

_Retrieve the conduit creation code and runtime code hashes._


