// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

enum AssetType {
    ERC721,
    ERC1155,
    ERC20,
    Native,
    ESE,
    ERC721LazyMint
}
/**
 * @dev Asset:
 * {token} - Token contract address.
 * {tokenID} - Token ID. 
 * {amount} - Amount of tokens transfered. 
 * {assetType} - Asset interface type. 
 * {data} - Additional data included with the asset. 
 */
struct Asset {
    address token;
    uint256 tokenID;
    uint256 amount;
    AssetType assetType;
    bytes data;
}