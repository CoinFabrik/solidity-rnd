// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "../types/DropMetadata.sol";
import "../interfaces/IEeseeRandom.sol";

interface IEeseeNFTDrop {
    /**
     * @dev SaleStage:
     * {startTimestamp} - Timestamp when this stage starts.
     * {addressMintedAmount} - Amount of nfts minted by address.
     * {stageOptions} - Additional options for this stage.
     */
    struct SaleStage {
        uint32 startTimestamp;
        mapping(address => uint32) addressMintedAmount;
        StageOptions stageOptions;
    }	 
    /**
     * @dev StageOptions:
     * {duration} - Duration of mint stage.
     * {perAddressMintLimit} - Mint limit for one address.
     * {allowListMerkleRoot} - Root of merkle tree for allowlist.
     */
    struct StageOptions {     
        uint32 duration;
        uint32 perAddressMintLimit;
        bytes32 allowListMerkleRoot;
    }

    error MintTimestampNotInFuture();
    error PresaleStageLimitExceeded();
    error MintLimitExceeded();
    error MintingNotStarted();
    error MintingEnded();
    error InvalidProof();
    error InvalidStage();
    error ZeroSaleStageDuration();

    function initialize(
        DropMetadata calldata metadata,
        uint32 _mintLimit,
        uint32 mintStartTimestamp, 
        StageOptions[] calldata salesOptions,
        IEeseeRandom _random,
        address _minter,
        address trustedForwarder
    ) external;

    function baseURI() external view returns (string memory);
    function revealedURI() external view returns (string memory);
    function contractURI() external view returns (string memory);
    function mintLimit() external view returns (uint32);
    function random() external view returns (IEeseeRandom);

    function getSaleStage() external view returns (uint8 index);
    function stages(uint256) external view returns (uint32 startTimestamp, StageOptions memory stageOptions);
    
    function nextTokenId() external view returns (uint256);
    function verifyCanMint(uint8 saleStageIndex, address claimer, bytes32[] calldata merkleProof) external view returns (bool);

    function mint(address recipient, uint32 quantity, bytes32[] calldata merkleProof) external;
}
