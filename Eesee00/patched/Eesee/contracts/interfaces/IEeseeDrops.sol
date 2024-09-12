// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./IEeseeNFTDrop.sol";
import "./IEeseeMinter.sol";
import "./IEeseeStaking.sol";

interface IEeseeDrops {
    /**
     * @dev Drop:
     * {collection} - IERC721 contract address.
     * {earningsCollector} - Address that collects earnings from this drop.
     * {fee} - Fee sent to {feeSplitter}.
     * {mintPrices} - Prices for each mint during each stage.
     */
    struct Drop {
        uint96 fee;
        IERC721 collection;
        address earningsCollector;
        uint96[] mintPrices;
    }

    event ListDrop(
        uint256 indexed ID, 
        IERC721 indexed collection, 
        address indexed earningsCollector
    );
    // Note: fromTokenID is inclusive
    event MintDrop(
        uint256 indexed ID, 
        IERC721 indexed collection, 
        address indexed recipient,
        uint256 fromTokenID,
        uint32 quantity,
        uint96 mintPrice
    );
    event AddVolumeReverted(
        uint96 untrackedVolume,
        address indexed recipient
    );
    event CollectFee(
        address indexed to,
        uint96 amount
    );
    event ChangeFee(
        uint96 indexed previousFee, 
        uint96 indexed newFee
    );
    event ChangeFeeSplitter(
        address indexed previousFeeSplitter, 
        address indexed newFeeSplitter
    );

    error InvalidConstructor();
    error InvalidEarningsCollector();
    error InvalidQuantity();
    error FeeTooHigh();
    error CallerNotAuthorized();
    error InvalidArrayLengths();
    error InvalidFee();
    error InvalidFeeSplitter();
    error InvalidRecipient();
    error InvalidDropID();
    
    function drops(uint256) external view returns(
        uint96 fee,
        IERC721 collection,
        address earningsCollector
    );

    function getMintPrices(uint256 ID) external view returns(uint96[] memory);

    function ESE() external view returns(IERC20);
    function staking() external view returns(IEeseeStaking);
    function minter() external view returns(IEeseeMinter);
    function accessManager() external view returns(IEeseeAccessManager);
    function ADMIN_ROLE() external view returns(bytes32);

    function fee() external view returns(uint96);
    function feeSplitter() external view returns(address);

    function listDrop(
        DropMetadata calldata metadata,
        IEeseeNFTDrop.StageOptions[] calldata stages,
        uint96[] calldata mintPrices,
        uint32 mintLimit,
        uint32 mintStartTimestamp, 
        address earningsCollector,
        uint96 expectedFee
    ) external returns (uint256 ID, IERC721 collection);
    function mintDrops(
        uint256[] calldata IDs, 
        uint32[] calldata quantities, 
        bytes32[][] calldata merkleProofs,
        address recipient,
        bytes calldata permit
    ) external returns(uint96 mintPrice);

    function changeFee(uint96 _fee) external;
    function changeFeeSplitter(address _feeSplitter) external;
}