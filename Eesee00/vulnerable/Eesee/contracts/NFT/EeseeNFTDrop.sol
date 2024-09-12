// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "../interfaces/IEeseeNFTDrop.sol";
import 'erc721a-upgradeable/contracts/ERC721AUpgradeable.sol';
import "@opengsn/contracts/src/ERC2771Recipient.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract EeseeNFTDrop is Initializable, IEeseeNFTDrop, ERC721AUpgradeable, ERC2981, ERC2771Recipient {
    ///@dev Base URI this contract uses while not revealed.
    string public baseURI;
    ///@dev Base URI this contract uses after reveal.
    string public revealedURI;
    ///@dev Opensea royalty and NFT collection info.
    string public contractURI;
    ///@dev Mint cap.
    uint32 public mintLimit;
    ///@dev Info about sale stages.
    SaleStage[] public stages;
    ///@dev Contract that provides random.
    IEeseeRandom public random;
    ///@dev Minter contract.
    address public minter;

    modifier onlyMinter() {
        require(msg.sender == minter, "Caller is not the minter");
        _;
    }

    function initialize(
        DropMetadata calldata metadata,
        uint32 _mintLimit,
        uint32 mintStartTimestamp, 
        StageOptions[] calldata salesOptions,
        IEeseeRandom _random,
        address _minter,
        address trustedForwarder
    ) external initializer initializerERC721A {
        __ERC721A_init(metadata.name, metadata.symbol);
        minter = _minter;
        
        baseURI = metadata.baseURI;
        revealedURI = metadata.revealedURI;
        contractURI = metadata.contractURI;
        mintLimit = _mintLimit;
        if(metadata.royaltyReceiver != address(0) && metadata.royaltyFeeNumerator != 0){
            _setDefaultRoyalty(metadata.royaltyReceiver, metadata.royaltyFeeNumerator);
        }
        _setMintStageOptions(mintStartTimestamp, salesOptions);
        
        random = _random;

        _setTrustedForwarder(trustedForwarder);
    }

    // ============ View Functions ============

    /**
     * @dev Returns tokenId's token URI. If there is no URI in tokenURIs uses baseURI.
     * @param tokenId - Token ID to check.
     
     * @return string Token URI.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        uint256 r_word; uint256 r_timestamp;
        unchecked{
            SaleStage storage stage = stages[stages.length - 1];
            (r_word, r_timestamp) = random.getRandomFromTimestamp(stage.startTimestamp + stage.stageOptions.duration);
        }
        if(r_timestamp == 0) {
            string memory URI = baseURI;
            return bytes(URI).length != 0 ? string(abi.encodePacked(URI, _toString(tokenId))) : '';
        }else{
            string memory URI = revealedURI;
            return bytes(URI).length != 0 ? string(abi.encodePacked(URI, _toString((tokenId + r_word) % totalSupply()))) : '';
        }
    }

    /**
     * @dev Verifies that a user is in allowlist of saleStageIndex sale stage.
     * @param saleStageIndex - Index of the sale stage.
     * @param claimer - Address of a user.
     * @param merkleProof - Merkle proof of stage's merkle tree.
     
     * @return bool true if user in stage's allowlist.
     */
    function verifyCanMint(uint8 saleStageIndex, address claimer, bytes32[] calldata merkleProof) public view returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(claimer))));
        return MerkleProof.verify(merkleProof, stages[saleStageIndex].stageOptions.allowListMerkleRoot, leaf);
    }

    /**
     * @dev Returns current sale stages index. Note: If all stages ended returns stages.length; 
     
     * @return index - Index of current sale stage.
     */
    function getSaleStage() public view returns (uint8 index) {
        uint256 length = stages.length;
        for(uint8 i; i < length;) {
            SaleStage storage stage = stages[i];
            unchecked{
                uint256 startTimestamp = stage.startTimestamp;
                if (block.timestamp >= startTimestamp && (block.timestamp < startTimestamp + stage.stageOptions.duration)){
                    return i;
                }
                ++i; 
            }
        }
        return uint8(length);
    }

    /**
     * @dev Returns next token ID to be minted.
     
     * @return uint256 Token ID.
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId();
    }

    // ============ Write Functions ============

    /**
     * @dev Mints nfts for recipient in the merkle tree.
     * @param recipient - Address of recipient.
     * @param quantity - Amount of nfts to mint.
     * @param merkleProof - Merkle tree proof of recipient.

     * Note: This function can only be called by owner.
     */
    function mint(address recipient, uint32 quantity, bytes32[] calldata merkleProof) external onlyMinter {
        if(block.timestamp < stages[0].startTimestamp) revert MintingNotStarted();
        uint256 length = stages.length;
        unchecked{
            SaleStage storage lastStage = stages[length - 1];
            if(block.timestamp >= lastStage.startTimestamp + lastStage.stageOptions.duration) revert MintingEnded(); 
        }
        
        uint8 saleStageIndex = getSaleStage();
        StageOptions storage stageOptions = stages[saleStageIndex].stageOptions;
        if(stageOptions.allowListMerkleRoot != bytes32(0) && !verifyCanMint(saleStageIndex, recipient, merkleProof)) revert InvalidProof();

        uint32 _addressMintedAmount = stages[saleStageIndex].addressMintedAmount[recipient] + quantity;
        uint32 perAddressMintLimit = stageOptions.perAddressMintLimit;
        if(perAddressMintLimit != 0 && _addressMintedAmount > perAddressMintLimit) revert MintLimitExceeded();

        _safeMint(recipient, quantity);
        uint32 _mintLimit = mintLimit;
        if(_mintLimit != 0 && totalSupply() > _mintLimit) revert MintLimitExceeded();
        stages[saleStageIndex].addressMintedAmount[recipient] = _addressMintedAmount;
    }

    // ============ Internal Functions ============

    function _msgSenderERC721A() internal view override returns (address) {
        return _msgSender();
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    function _setMintStageOptions(uint32 mintStartTimestamp, StageOptions[] calldata stageOptions) internal {
        if(block.timestamp >= mintStartTimestamp) revert MintTimestampNotInFuture();
        if(stageOptions.length > 5 || stageOptions.length == 0) revert PresaleStageLimitExceeded();

        uint32 timePassed = mintStartTimestamp;
        for(uint8 i; i < stageOptions.length;) {
            if(stageOptions[i].duration == 0) revert ZeroSaleStageDuration();
            
            SaleStage storage presale = stages.push();
            presale.startTimestamp = timePassed;
            timePassed += stageOptions[i].duration;
            presale.stageOptions = stageOptions[i];
            unchecked{ ++i; }
        }
    }

    // ============ supportsInterface ============

    function supportsInterface(bytes4 interfaceId) public view override(ERC721AUpgradeable, ERC2981) returns (bool) {
        return ERC721AUpgradeable.supportsInterface(interfaceId) || ERC2981.supportsInterface(interfaceId);
    }
}
