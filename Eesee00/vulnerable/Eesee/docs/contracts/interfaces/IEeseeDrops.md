# IEeseeDrops


## Drop

_Drop:
{collection} - IERC721 contract address.
{earningsCollector} - Address that collects earnings from this drop.
{fee} - Fee sent to {feeSplitter}.
{mintPrices} - Prices for each mint during each stage._

```solidity
struct Drop {
  uint96 fee;
  contract IERC721 collection;
  address earningsCollector;
  uint96[] mintPrices;
}
```
## ListDrop

```solidity
event ListDrop(uint256 ID, contract IERC721 collection, address earningsCollector)
```

## MintDrop

```solidity
event MintDrop(uint256 ID, contract IERC721 collection, address recipient, uint256 fromTokenID, uint32 quantity, uint96 mintPrice)
```

## CollectFee

```solidity
event CollectFee(address to, uint96 amount)
```

## ChangeFee

```solidity
event ChangeFee(uint96 previousFee, uint96 newFee)
```

## InvalidConstructor

```solidity
error InvalidConstructor()
```

## InvalidEarningsCollector

```solidity
error InvalidEarningsCollector()
```

## InvalidQuantity

```solidity
error InvalidQuantity()
```

## FeeTooHigh

```solidity
error FeeTooHigh()
```

## CallerNotAuthorized

```solidity
error CallerNotAuthorized()
```

## InvalidArrayLengths

```solidity
error InvalidArrayLengths()
```

## drops

```solidity
function drops(uint256) external view returns (uint96 fee, contract IERC721 collection, address earningsCollector)
```

## getMintPrices

```solidity
function getMintPrices(uint256 ID) external view returns (uint96[])
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

## listDrop

```solidity
function listDrop(struct DropMetadata metadata, struct IEeseeNFTDrop.StageOptions[] stages, uint96[] mintPrices, uint32 mintLimit, uint32 mintStartTimestamp, address earningsCollector) external returns (uint256 ID, contract IERC721 collection)
```

## mintDrops

```solidity
function mintDrops(uint256[] IDs, uint32[] quantities, bytes32[][] merkleProofs, address recipient, bytes permit) external returns (uint96 mintPrice)
```


