# AssetType

```solidity
enum AssetType {
  ERC721,
  ERC1155,
  ERC20,
  Native,
  ESE,
  ERC721LazyMint
}
```
# Asset

_Asset:
{token} - Token contract address.
{tokenID} - Token ID. 
{amount} - Amount of tokens transfered. 
{assetType} - Asset interface type. 
{data} - Additional data included with the asset._

```solidity
struct Asset {
  address token;
  uint256 tokenID;
  uint256 amount;
  enum AssetType assetType;
  bytes data;
}
```
