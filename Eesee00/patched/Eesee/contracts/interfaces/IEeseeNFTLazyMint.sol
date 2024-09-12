// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "../types/LazyMintMetadata.sol";

interface IEeseeNFTLazyMint {
    function contractURI() external view returns (string memory);
    function collectionID() external view returns (uint256);
    function owner() external view returns (address);
    function minter() external view returns (address);
    
    function initialize(
        uint256 _collectionID,
        address _owner,
        address _minter,
        LazyMintCollectionMetadata calldata metadata,
        address trustedForwarder
    ) external;

    function mintSingle(address recipient, LazyMintTokenMetadata calldata metadata) external returns(uint256 tokenId);
}