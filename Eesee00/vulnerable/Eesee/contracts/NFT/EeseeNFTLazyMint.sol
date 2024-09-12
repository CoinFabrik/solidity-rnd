// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import 'erc721a-upgradeable/contracts/ERC721AUpgradeable.sol';
import "@opengsn/contracts/src/ERC2771Recipient.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../interfaces/IEeseeNFTLazyMint.sol";

contract EeseeNFTLazyMint is Initializable, IEeseeNFTLazyMint, ERC721AUpgradeable, ERC2981, ERC2771Recipient {
    ///@dev tokenId => tokenURI.
    mapping(uint256 => string) private tokenURIs;
    ///@dev Opensea royalty and NFT collection info.
    string public contractURI;
    ///@dev Collection ID that is used to match collections in minting contract.
    uint256 public collectionID;
    ///@dev Owner address. Note: Owner doesn't have any special rights.
    address public owner;
    ///@dev Minter contract.
    address public minter;

    modifier onlyMinter() {
        require(msg.sender == minter, "Caller is not the minter");
        _;
    }
    
    function initialize(
        uint256 _collectionID,
        address _owner,
        address _minter,
        LazyMintCollectionMetadata calldata metadata,
        address trustedForwarder
    ) external initializer initializerERC721A {
        collectionID = _collectionID;
        owner = _owner;
        minter = _minter;

        __ERC721A_init(metadata.name, metadata.symbol);
        contractURI = metadata.contractURI;

        _setTrustedForwarder(trustedForwarder);
    }
    
    // ============ View Functions ============

    /**
     * @dev Returns tokenId's token URI.
     * @param tokenId - Token ID to check.
     
     * @return string Token URI.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        return tokenURIs[tokenId];
    }

    // ============ Write Functions ============

    /**
     * @dev Mints 1 NFT and sends it to the {recipient}.
     * @param recipient - Receiver of NFTs.
     * @param metadata - URI of the minted token, receiver of royalties for this token and amount of royalties received from each sale. [10000 = 100%]
     
     * @return tokenId - ID of token minted.
     * Note: This function can only be called minter.
     */
    function mintSingle(address recipient, LazyMintTokenMetadata calldata metadata) external onlyMinter returns(uint256 tokenId) {
        tokenId = _nextTokenId();
        _safeMint(recipient, 1);
        tokenURIs[tokenId] = metadata.URI;
        _setTokenRoyalty(tokenId, metadata.royaltyReceiver, metadata.royaltyFeeNumerator);
    }

    // ============ Internal Functions ============

    function _msgSenderERC721A() internal view override returns (address) {
        return _msgSender();
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    // ============ supportsInterface ============

    function supportsInterface(bytes4 interfaceId) public view override(ERC721AUpgradeable, ERC2981) returns (bool) {
        return ERC721AUpgradeable.supportsInterface(interfaceId) || ERC2981.supportsInterface(interfaceId);
    }
}