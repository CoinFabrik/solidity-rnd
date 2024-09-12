# AssetTransfer


## TransferNotSuccessful

```solidity
error TransferNotSuccessful()
```

## InvalidAsset

```solidity
error InvalidAsset()
```

## InvalidAmount

```solidity
error InvalidAmount()
```

## InvalidToken

```solidity
error InvalidToken()
```

## InvalidTokenID

```solidity
error InvalidTokenID()
```

## InvalidMsgValue

```solidity
error InvalidMsgValue()
```

## InvalidInterface

```solidity
error InvalidInterface()
```

## InvalidSignature

```solidity
error InvalidSignature()
```

## ExpiredDeadline

```solidity
error ExpiredDeadline()
```

## InvalidData

```solidity
error InvalidData()
```

## transferAssetFrom

```solidity
function transferAssetFrom(struct Asset asset, struct IEesee.LotParams params, address msgSender, bytes32 domainSeparatorV4, address ESE) external returns (address signer, uint256 nonce)
```

## transferAssetTo

```solidity
function transferAssetTo(struct Asset asset, address to, contract IEeseeMinter minter) external returns (struct Asset)
```


