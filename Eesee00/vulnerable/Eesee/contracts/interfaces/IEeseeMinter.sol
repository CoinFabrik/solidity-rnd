// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../interfaces/IEeseeNFTDrop.sol";
import "../interfaces/IEeseeNFTLazyMint.sol";

interface IEeseeMinter {
    error IncorrectTokenURILength();
    error InvalidConstructor();
    function random() external view returns(IEeseeRandom);
    function lazyMintCollections(address,address,uint256) view external returns(IEeseeNFTLazyMint);
    function lazyMint(
        uint256 collectionID, 
        address owner,
        LazyMintCollectionMetadata calldata collectionMetadata,
        LazyMintTokenMetadata calldata tokenMetadata,
        address recipient
    ) external returns (IERC721 collection, uint256 tokenID);
    function deployDropCollection(
        DropMetadata calldata metadata, 
        uint32 mintLimit,
        uint32 mintStartTimestamp, 
        IEeseeNFTDrop.StageOptions[] calldata stages
    ) external returns(IERC721 collection);
}
