// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "../interfaces/IEeseeNFTLazyMint.sol";
import "../interfaces/IEeseeNFTDrop.sol";
import "../interfaces/IEeseeMinter.sol";

// Because of the contract size limit we need a sepparate contract to mint NFTs.
contract EeseeMinter is IEeseeMinter {
    ///@dev Contract implementations for Clonable
    address public immutable EeseeNFTLazyMintImplementation;
    address public immutable EeseeNFTDropImplementation;
    ///@dev Contract that provides random.
    IEeseeRandom public immutable random;
    ///@dev GSN trusted forwarder used in NFTs.
    address public trustedForwarder;

    /** 
     * @dev Maps msg.senders to collection owners to collection IDs to NFT collections.
     * Note: We use owners in a mapping to avoid NFT censorship. 
     * If we did not include owners, malicious users would be able to frontrun collectionIDs to block other users' colelctions from being created.
     * msg.senders are also included in a mapping as a method of access control.
     */
    mapping(address => mapping(address => mapping(uint256 => IEeseeNFTLazyMint))) public lazyMintCollections;
    
    constructor(
        address _EeseeNFTLazyMintImplementation, 
        address _EeseeNFTDropImplementation,
        IEeseeRandom _random,
        address _trustedForwarder
    ) {
        if(
            _EeseeNFTLazyMintImplementation == address(0) || 
            _EeseeNFTDropImplementation == address(0) ||
            address(_random) == address(0)
        ) revert InvalidConstructor();

        EeseeNFTLazyMintImplementation = _EeseeNFTLazyMintImplementation;
        EeseeNFTDropImplementation = _EeseeNFTDropImplementation;
        random = _random;
        trustedForwarder = _trustedForwarder;
    }

    /**
     * @dev Deploys NFT collection contract if there isn't one and mints token to it. Emits {Mint} event.
     * @param collectionID - Unique collection identificator. Note: different {owner}s can share the same collectionID for different collections.
     * @param owner - The owner of the NFT collection contract. Is only used on deploy.
     * @param collectionMetadata - Collection metadata info. (name for a collection, symbol of the collection and contract URI for opensea).
     * @param tokenMetadata - Token metadata info. (URI of the minted token, receiver of royalties for this token and amount of royalties received from each sale. [10000 = 100%]).
     * @param recipient - Receiver of NFT.
     
     * @return collection - Address of the collection the NFT was minted to.
     * @return tokenID - ID of token minted.
     */
    function lazyMint(
        uint256 collectionID, 
        address owner,
        LazyMintCollectionMetadata calldata collectionMetadata,
        LazyMintTokenMetadata calldata tokenMetadata,
        address recipient
    ) external returns (IERC721 collection, uint256 tokenID){
        IEeseeNFTLazyMint _collection = lazyMintCollections[msg.sender][owner][collectionID];
        if(address(_collection) == address(0)){
            _collection = IEeseeNFTLazyMint(Clones.clone(EeseeNFTLazyMintImplementation));
            _collection.initialize(
                collectionID, 
                owner,
                address(this),
                collectionMetadata,
                trustedForwarder
            );
            lazyMintCollections[msg.sender][owner][collectionID] = _collection;
        }

        tokenID = _collection.mintSingle(recipient, tokenMetadata);
        collection = IERC721(address(_collection));
    }

    /**
     * @dev Deploys a new drop collection contract.
     * @param metadata.name - The name for a collection.
     * @param metadata.symbol - The symbol of the collection.
     * @param metadata.baseURI - Collection metadata URI.
     * @param metadata.revealedURI - NFT URI after drops reveal.
     * @param metadata.contractURI - Contract URI for opensea's royalties.
     * @param metadata.royaltyReceiver - Receiver of royalties from each NFT sale.
     * @param metadata.royaltyFeeNumerator - Amount of royalties to collect from each NFT sale. [10000 = 100%].
     * @param mintLimit - NFT mint cap.
     * @param mintStartTimestamp - Mint start timestamp.
     * @param stages - Options for the NFT sale stages.

     * @return collection - Drops collection address.
     */
    function deployDropCollection(
        DropMetadata calldata metadata,
        uint32 mintLimit,
        uint32 mintStartTimestamp,
        IEeseeNFTDrop.StageOptions[] calldata stages
    ) external returns(IERC721 collection){
        IEeseeNFTDrop dropCollection = IEeseeNFTDrop(Clones.clone(EeseeNFTDropImplementation));
        dropCollection.initialize(
            metadata,
            mintLimit,
            mintStartTimestamp,
            stages,
            random,
            msg.sender,
            trustedForwarder
        );
        collection = IERC721(address(dropCollection));
    }
}
