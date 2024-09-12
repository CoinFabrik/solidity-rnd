# IRoyaltyEngineV1

_Lookup engine interface_


## getRoyalty

```solidity
function getRoyalty(address tokenAddress, uint256 tokenId, uint256 value) external returns (address payable[] recipients, uint256[] amounts)
```

Get the royalty for a given token (address, id) and value amount.  Does not cache the bps/amounts.  Caches the spec for a given token address

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddress | address | - The address of the token |
| tokenId | uint256 | - The id of the token |
| value | uint256 | - The value you wish to get the royalty of

## getRoyaltyView

```solidity
function getRoyaltyView(address tokenAddress, uint256 tokenId, uint256 value) external view returns (address payable[] recipients, uint256[] amounts)
```

View only version of getRoyalty

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddress | address | - The address of the token |
| tokenId | uint256 | - The id of the token |
| value | uint256 | - The value you wish to get the royalty of


# Inherited from IERC165

## supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._


