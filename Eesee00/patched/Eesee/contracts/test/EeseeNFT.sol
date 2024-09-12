// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import 'erc721a-upgradeable/contracts/ERC721AUpgradeable.sol';
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../types/DropMetadata.sol";

contract EeseeNFT is Initializable, ERC721AUpgradeable, ERC2981 {
    ///@dev baseURI this contract uses,
    string public URI;
    ///@dev Opensea royalty and NFT collection info
    string public contractURI;

    error SetURIForNonexistentToken();
    error SetRoyaltyForNonexistentToken();
    
    function initialize(
        DropMetadata calldata metadata,
        uint256 mintAmount,
        address mintRecipient
    ) external initializer initializerERC721A {
        __ERC721A_init(metadata.name, metadata.symbol);
        if(metadata.royaltyReceiver != address(0) && metadata.royaltyFeeNumerator != 0){
            _setDefaultRoyalty(metadata.royaltyReceiver, metadata.royaltyFeeNumerator);
        }
        _safeMint(mintRecipient, mintAmount);

        URI = metadata.baseURI;
        contractURI = metadata.contractURI;
    }

    // ============ View Functions ============

    /**
     * @dev Returns next token ID to be minted.
     
     * @return uint256 Token ID.
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId();
    }

    // ============ Internal Functions ============

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    function _baseURI() internal view override returns (string memory) {
        return URI;
    }

    // ============ supportsInterface ============

    function supportsInterface(bytes4 interfaceId) public view override(ERC721AUpgradeable, ERC2981) returns (bool) {
        return ERC721AUpgradeable.supportsInterface(interfaceId) || ERC2981.supportsInterface(interfaceId);
    }
}