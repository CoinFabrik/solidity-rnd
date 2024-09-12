# EeseeDrops


## MintDropReturnParams

```solidity
struct MintDropReturnParams {
  uint96 mintPrice;
  uint96 feeAmount;
  address earningsCollector;
}
```
## drops

```solidity
struct IEeseeDrops.Drop[] drops
```

_An array of all existing drops._

## ESE

```solidity
contract IERC20 ESE
```

_ESE token this contract uses._

## minter

```solidity
contract IEeseeMinter minter
```

_Contract that mints NFTs_

## staking

```solidity
contract IEeseeStaking staking
```

_Eesee staking contract. Tracks volume for this contract._

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

## fee

```solidity
uint96 fee
```

_Fee that is collected to {feeSplitter} from each fulfilled drop. [10000 == 100%]_

## feeSplitter

```solidity
address feeSplitter
```

_Address the {fee}s are sent to._

## listDrop

```solidity
function listDrop(struct DropMetadata metadata, struct IEeseeNFTDrop.StageOptions[] stages, uint96[] mintPrices, uint32 mintLimit, uint32 mintStartTimestamp, address earningsCollector, uint96 expectedFee) external returns (uint256 ID, contract IERC721 collection)
```

_Deploys new NFT collection and lists it to users for minting. Emits {ListDrop} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| metadata | struct DropMetadata |  |
| stages | struct IEeseeNFTDrop.StageOptions[] | - Options for sales stages. |
| mintPrices | uint96[] | - An array of drop prices for each stage in ESE. |
| mintLimit | uint32 | - Max amount of NFTs that can be minted. |
| mintStartTimestamp | uint32 | - Timestamp when minting starts. |
| earningsCollector | address | - Address to send NFT sale earnings to. |
| expectedFee | uint96 | - Expected fee for drop lot to avoid race condition with {changeFee}. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - ID of a drop created. |
| collection | contract IERC721 | - Address of NFT collection contract. |

## mintDrops

```solidity
function mintDrops(uint256[] IDs, uint32[] quantities, bytes32[][] merkleProofs, address recipient, bytes permit) external returns (uint96 mintPrice)
```

_Mints NFTs from a drop. Emits {MintDrop} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| IDs | uint256[] | - IDs of drops to mint NFTs from. |
| quantities | uint32[] | - Amounts of NFTs to mint in each drop. |
| merkleProofs | bytes32[][] | - Merkle proofs for a {recipient} to mint NFTs. |
| recipient | address | - Address receiving NFT. Note: Must be in a Merkle Tree. |
| permit | bytes | - Abi-encoded ESE permit data containing approveAmount, deadline, v, r and s. Set to empty bytes to skip permit. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| mintPrice | uint96 | - Amount of ESE tokens spent on minting. |

## changeFee

```solidity
function changeFee(uint96 _fee) external
```

_Changes fee. Emits {ChangeFee} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _fee | uint96 | - New fee. Note: This function can only be called by ADMIN_ROLE. |

## changeFeeSplitter

```solidity
function changeFeeSplitter(address _feeSplitter) external
```

_Changes feeSplitter. Emits {ChangeFeeSplitter} event._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _feeSplitter | address | - New fee. Note: This function can only be called by ADMIN_ROLE. |

## getDropsLength

```solidity
function getDropsLength() external view returns (uint256 length)
```

_Get length of the drops array._

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| length | uint256 | - Length of the drops array. |

## getMintPrices

```solidity
function getMintPrices(uint256 ID) external view returns (uint96[])
```

_Returns the mint prices for specified drop._

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ID | uint256 | - ID of drop to check. |

### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint96[] | mintPrices - NFT Mint prices. |


# Inherited from ReentrancyGuard



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



# Inherited from IEeseeDrops

## drops

```solidity
function drops(uint256) external view returns (uint96 fee, contract IERC721 collection, address earningsCollector)
```

## ESE

```solidity
function ESE() external view returns (contract IERC20)
```

## staking

```solidity
function staking() external view returns (contract IEeseeStaking)
```

## minter

```solidity
function minter() external view returns (contract IEeseeMinter)
```

## accessManager

```solidity
function accessManager() external view returns (contract IEeseeAccessManager)
```

## ADMIN_ROLE

```solidity
function ADMIN_ROLE() external view returns (bytes32)
```

## fee

```solidity
function fee() external view returns (uint96)
```

## feeSplitter

```solidity
function feeSplitter() external view returns (address)
```


## ListDrop

```solidity
event ListDrop(uint256 ID, contract IERC721 collection, address earningsCollector)
```

## MintDrop

```solidity
event MintDrop(uint256 ID, contract IERC721 collection, address recipient, uint256 fromTokenID, uint32 quantity, uint96 mintPrice)
```

## AddVolumeReverted

```solidity
event AddVolumeReverted(uint96 untrackedVolume, address recipient)
```

## CollectFee

```solidity
event CollectFee(address to, uint96 amount)
```

## ChangeFee

```solidity
event ChangeFee(uint96 previousFee, uint96 newFee)
```

## ChangeFeeSplitter

```solidity
event ChangeFeeSplitter(address previousFeeSplitter, address newFeeSplitter)
```


