// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "./IEeseeMinter.sol";
import "./IEeseeRandom.sol";
import "./IEeseeStaking.sol";
import "./IEeseeSwap.sol";
import "./IRoyaltyEngineV1.sol";
import "../types/Asset.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IEesee {
    /**
     * @dev Lot:
     * {maxTickets} - Amount of tickets sold in this lot. 
     * {bonusTickets} - Bonus tickets in the lot.
     * {ticketsBought} - Amount of tickets bought (not including bonus).
     * {ticketPrice} - Price of a single ticket.

     * {transactions} - BuyTickets transactions.
     * {endTimestamp} - lot expiration timestamp. type(uint32).max = 4294967295s = 2106 years.
     * {fee} - Fee sent to {feeSplitter}.

     * {closed} - Is lot closed with a function call as opposed to expired.
     * {assetClaimed} - Is Asset claimed/reclaimed.
     * {tokensClaimed} - Are tokens claimed.
     * {buyout} - Indicationg if the lot was bought out by a single address.

     * {owner} - Lot creator.
     * {asset} - Asset sold in this lot. 

     * {intervals} - Exclusive upper bounds for amount of tickets for each BuyTickets transaction.
     * {recipients} - The address the tickets in the interval were bought for.
     * {ticketsHeldByAddress} - Total amount of tickets held by address (not including bonus).
     * {bonusTicketsHeldByAddress} - Amount of bonus tickets held by address.
     */
    struct Lot {
        uint32 maxTickets;
        uint32 bonusTickets;
        uint32 ticketsBought;
        uint96 ticketPrice;

        uint32 transactions;
        uint32 endTimestamp;
        uint32 fee;

        bool closed;
        bool buyout;
        bool assetClaimed;
        bool tokensClaimed;

        address owner;
        Asset asset;

        mapping(uint32 => uint32) intervals;
        mapping(uint32 => address) recipients;
        mapping(address => uint32) ticketsHeldByAddress;
        mapping(address => uint32) bonusTicketsHeldByAddress;
    }

    /**
     * @dev LotParams:
     * {maxTickets} - Amount of tickets sold in this lot. 
     * {ticketPrice} - Price of a single ticket.
     * {duration} - Duration of a lot (in seconds).
     * {owner} - Lot owner.
     * {signer} - Signer of signature or msg.sender to disable signature check. 
     * {signatureData} - ABI-encoded data with nonce, deadline and signature bytes. If signer == msg.sender can be set to any value.
     */
    struct LotParams{
        uint32 maxTickets;
        uint96 ticketPrice;
        uint32 duration;
        address owner;

        address signer;
        bytes signatureData;
    }

    event CreateLot(
        uint256 indexed ID,
        Asset asset,
        address indexed owner,
        uint32 maxTickets, 
        uint96 ticketPrice,
        uint32 endTimestamp
    );

    event ConsumeNonce(
        uint256 indexed ID,
        address indexed signer,
        uint256 indexed nonce
    );

    //Note: lowerBound is inclusive
    event BuyTickets(
        uint256 indexed ID,
        address indexed recipient,
        uint32 indexed lowerBound,
        uint32 ticketAmount,
        uint96 tokensSpent,
        uint32 bonusTickets
    );


    event ReceiveAsset(
        uint256 indexed ID,
        address indexed winner,
        address indexed recipient,
        Asset asset
    );

    event ReceiveTokens(
        uint256 indexed ID,
        address indexed claimer,
        address indexed recipient,
        uint96 amount
    );


    event ReclaimAsset(
        uint256 indexed ID,
        address indexed owner,
        address indexed recipient,
        Asset asset
    );

    event ReclaimTokens(
        uint256 indexed ID,
        address indexed claimer,
        address indexed recipient,
        uint96 amount
    );


    event CollectRoyalty(
        address indexed recipient,
        uint96 amount
    );

    event CollectFee(
        address indexed to,
        uint96 amount
    );


    event ChangeMinDuration(
        uint64 indexed previousMinDuration,
        uint64 indexed newMinDuration
    );

    event ChangeMaxDuration(
        uint64 indexed previousMaxDuration,
        uint64 indexed newMaxDuration
    );

    event ChangeFee(
        uint32 indexed previousFee, 
        uint32 indexed newFee
    );

    error CallerNotOwner(uint256 ID);
    error CallerNotWinner(uint256 ID);
    error CallerNotAuthorized();

    error AssetAlreadyClaimed(uint256 ID);
    error TokensAlreadyClaimed(uint256 ID);

    error LotAlreadyFulfilled(uint256 ID);
    error LotNotFulfilled(uint256 ID);
    error LotExpired(uint256 ID);
    error LotNotExpired(uint256 ID);
    error LotNotExists(uint256 ID);

    error DurationTooLow(uint64 minDuration);
    error DurationTooHigh(uint64 maxDuration);
    error MaxTicketsTooLow();
    error MaxTicketsTooHigh();
    error TicketPriceTooLow();
    error BuyAmountTooLow();
    error FeeTooHigh();
    error ExpiredDeadline();
    error ESEOverflow();

    error AllTicketsBought();
    error NoTicketsHeld(uint256 ID);
    error NoTicketsBought(uint256 ID);

    error InvalidArrayLengths();
    error InvalidMsgValue();
    error InvalidRecipient();
    error InvalidAmount();
    error InvalidDuration();
    error InvalidOwner();
    error InvalidAsset();
    error InvalidToken();
    error InvalidTokenID();
    error InvalidInterface();
    error InvalidSignature();
    error InvalidData();

    error NonceUsed();
    error TransferNotSuccessful();

    function lots(uint256) external view returns(
        uint32 maxTickets,
        uint32 bonusTickets,
        uint32 ticketsBought,
        uint96 ticketPrice,

        uint32 transactions,
        uint32 endTimestamp,
        uint32 fee,

        bool closed,
        bool buyout,
        bool assetClaimed,
        bool tokensClaimed,

        address owner,
        Asset memory asset
    );

    function ESE() external view returns(IERC20);
    function staking() external view returns(IEeseeStaking);
    function random() external view returns(IEeseeRandom);
    function accessManager() external view returns(IEeseeAccessManager);

    function minDuration() external view returns(uint64);
    function maxDuration() external view returns(uint64);
    function fee() external view returns(uint32);
    function feeSplitter() external view returns(address);

    function createLots(
        Asset[] calldata assets, 
        LotParams[] calldata params
    ) external payable returns(uint256[] memory IDs);

    function createLotsAndBuyTickets(
        Asset[] calldata assets, 
        LotParams[] calldata params, 
        uint32[] calldata amounts, 
        address recipient,
        bytes calldata permit
    ) external payable returns(uint256[] memory IDs, uint96 tokensSpent);

    function buyTickets(uint256[] calldata ID, uint32[] calldata amount, address recipient, bytes calldata permit) external returns(uint96 tokensSpent);

    function receiveAssets(uint256[] calldata IDs, address recipient) external returns(Asset[] memory assets);
    function receiveTokens(uint256[] calldata IDs, address recipient) external returns(uint96 amount);

    function reclaimAssets(uint256[] calldata IDs, address recipient) external returns(Asset[] memory assets);
    function reclaimTokens(uint256[] calldata IDs, address recipient) external returns(uint96 amount);

    function swapTokensForAssets(
        SwapParams calldata swapParams, 
        address recipient
    ) external returns(Asset[] memory assets, IERC20 dstToken, uint256 returnAmount, uint96 dust);

    function getLotsLength() external view returns(uint256 length);
    function getLotTicketHolder(uint256 ID, uint32 ticket) external view returns(address);
    function getLotTicketsHeldByAddress(uint256 ID, address _address) external view returns(uint32);
    function getLotBonusTicketsHeldByAddress(uint256 ID, address _address) external view returns(uint32);
    function getBuyTicketsRecipient(uint256 ID, uint32 transaction) external view returns(address);

    function changeMinDuration(uint64 _minDuration) external;
    function changeMaxDuration(uint64 _maxDuration) external;
    function changeFee(uint32 _fee) external;
}
