# IEeseeNFTDrop


## SaleStage

_SaleStage:
{startTimestamp} - Timestamp when this stage starts.
{addressMintedAmount} - Amount of nfts minted by address.
{stageOptions} - Additional options for this stage._

```solidity
struct SaleStage {
  uint32 startTimestamp;
  mapping(address => uint32) addressMintedAmount;
  struct IEeseeNFTDrop.StageOptions stageOptions;
}
```
## StageOptions

_StageOptions:
{duration} - Duration of mint stage.
{perAddressMintLimit} - Mint limit for one address.
{allowListMerkleRoot} - Root of merkle tree for allowlist._

```solidity
struct StageOptions {
  uint32 duration;
  uint32 perAddressMintLimit;
  bytes32 allowListMerkleRoot;
}
```
## MintTimestampNotInFuture

```solidity
error MintTimestampNotInFuture()
```

## PresaleStageLimitExceeded

```solidity
error PresaleStageLimitExceeded()
```

## MintLimitExceeded

```solidity
error MintLimitExceeded()
```

## MintingNotStarted

```solidity
error MintingNotStarted()
```

## MintingEnded

```solidity
error MintingEnded()
```

## InvalidProof

```solidity
error InvalidProof()
```

## InvalidStage

```solidity
error InvalidStage()
```

## ZeroSaleStageDuration

```solidity
error ZeroSaleStageDuration()
```

## initialize

```solidity
function initialize(struct DropMetadata metadata, uint32 _mintLimit, uint32 mintStartTimestamp, struct IEeseeNFTDrop.StageOptions[] salesOptions, contract IEeseeRandom _random, address _minter, address trustedForwarder) external
```

## baseURI

```solidity
function baseURI() external view returns (string)
```

## revealedURI

```solidity
function revealedURI() external view returns (string)
```

## contractURI

```solidity
function contractURI() external view returns (string)
```

## mintLimit

```solidity
function mintLimit() external view returns (uint32)
```

## random

```solidity
function random() external view returns (contract IEeseeRandom)
```

## getSaleStage

```solidity
function getSaleStage() external view returns (uint8 index)
```

## stages

```solidity
function stages(uint256) external view returns (uint32 startTimestamp, struct IEeseeNFTDrop.StageOptions stageOptions)
```

## nextTokenId

```solidity
function nextTokenId() external view returns (uint256)
```

## verifyCanMint

```solidity
function verifyCanMint(uint8 saleStageIndex, address claimer, bytes32[] merkleProof) external view returns (bool)
```

## mint

```solidity
function mint(address recipient, uint32 quantity, bytes32[] merkleProof) external
```


