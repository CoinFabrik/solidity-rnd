// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@opengsn/contracts/src/ERC2771Recipient.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IAggregationRouterV5.sol";
import "../interfaces/IEesee.sol";
import "../interfaces/IEeseeDrops.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EeseePeriphery is ERC2771Recipient, Pausable {
    using SafeERC20 for IERC20;

    ///@dev ESE token this contract uses.
    IERC20 public immutable ESE;
    ///@dev Eesee contract.
    IEesee public immutable Eesee;
    ///@dev Eesee drop contract.
    IEeseeDrops public immutable EeseeDrops;
    ///@dev Contract that provides Eesee with random.
    IEeseeRandom public immutable random;
    ///@dev 1inch router used for token swaps.
    address immutable public OneInchRouter;
    ///@dev In case Chainlink VRF request fails to get delivered {returnInterval} seconds after the lot was closed, unlock Reclaim functions.
    uint48 public immutable returnInterval;
    ///@dev Access manager for Eesee contract ecosystem.
    IEeseeAccessManager public immutable accessManager;
    ///@dev Pauser role in {accessManager}.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    error EthDepositRejected();
    error InvalidSwapDescription();
    error InvalidMsgValue();
    error SwapNotSuccessful();
    error PartialFillNotAllowed();
    error InvalidAsset();
    error InvalidConstructor();
    error LotNotExists();
    error LotNotFulfilled();
    error LotExpired();
    error NoTicketsBought();
    error CallerNotAuthorized();

    modifier onlyPauser(){
        if(!accessManager.hasRole(PAUSER_ROLE, _msgSender())) revert CallerNotAuthorized();
        _;
    }

    constructor(
        IEesee _Eesee,
        IEeseeDrops _EeseeDrops,
        address _OneInchRouter,
        IEeseeAccessManager _accessManager,
        address trustedForwarder
    ) {
        if(
            address(_Eesee) == address(0) ||
            address(_EeseeDrops) == address(0) ||
            _OneInchRouter == address(0) ||
            address(_accessManager) == address(0)
        ) revert InvalidConstructor();

        Eesee = _Eesee;
        random = Eesee.random();
        returnInterval = random.RETURN_INTERVAL();

        EeseeDrops = _EeseeDrops;

        ESE = Eesee.ESE();
        OneInchRouter = _OneInchRouter;
        accessManager = _accessManager;

        ESE.approve(address(_Eesee), type(uint256).max);
        ESE.approve(address(_EeseeDrops), type(uint256).max);

        _setTrustedForwarder(trustedForwarder);
    }

    receive() external payable {
        //Reject deposits from EOA
        if (_msgSender() == tx.origin) revert EthDepositRejected();
    }

    // ============ External Write Functions ============

    /**
     * @dev Buys tickets in Eesee contract with any token using 1inch router and swapping it for ESE. Note: Set compatibility and disableEstimate to true and partialFill to false in 1inch API.
     * @param IDs - IDs of lots to buy tickets for.
     * @param amounts - Amounts of tickets to buy in each lot.
     * @param swapData - Data for 1inch swap.
     * @param recipient - Recipient of tickets and dust refund.
    
     * @return tokensSpent - Tokens spent.
     * @return dust - ESE token dust returned to recipient.
     */
    function buyTicketsWithSwap(
        uint256[] calldata IDs,
        uint32[] calldata amounts, 
        bytes calldata swapData, 
        address recipient
    ) external payable whenNotPaused returns(uint256 tokensSpent, uint96 dust){
        uint256 returnAmount;
        (returnAmount, tokensSpent) = _swap(swapData);
        uint96 ESEPaid = Eesee.buyTickets(IDs, amounts, recipient, "");
        dust = _refund(uint96(returnAmount), ESEPaid, recipient);
    }

    /**
     * @dev Creates ESE lot and buy tickets in Eesee contract with any token using 1inch router and swapping it for ESE. Note: Set compatibility and disableEstimate to true and partialFill to false in 1inch API.
     * @param assets - Assets being listed.
     * @param params - Parameters for a lot.
     * @param amounts - Amounts of tickets to buy in each lot.
     * @param swapData - Data for 1inch swap.
     * @param recipient - Recipient of tickets and dust refund.
    
     * @return IDs - IDs of created lots. 
     * @return tokensSpent - Tokens spent.
     * @return dust - ESE token dust returned to recipient.
     */
    function createLotsAndBuyTicketsWithSwap(
        Asset[] calldata assets,
        IEesee.LotParams[] calldata params,
        uint32 expectedFee,
        uint32[] calldata amounts, 
        bytes calldata swapData, 
        address recipient
    ) external payable whenNotPaused returns(uint256[] memory IDs, uint256 tokensSpent, uint96 dust){
        uint256 returnAmount;
        (returnAmount, tokensSpent) = _swap(swapData);

        for(uint256 i; i < assets.length;){
            if(assets[i].assetType == AssetType.Native) revert InvalidAsset();
            unchecked {
                ++i;
            }
        }
        // Can't define a new "uint96 ESEPaid" variable because of the stack too deep error, so we use "dust" to avoid it.
        (IDs, dust) = Eesee.createLotsAndBuyTickets(assets, params, expectedFee, amounts, recipient, "");
        dust = _refund(uint96(returnAmount), dust, recipient);
    }

    /**
     * @dev Mints NFTs for a drop with any token using 1inch. Emits {MintDrop} event.
     * @param IDs - IDs of drops to mint NFTs from.
     * @param quantities - Amounts of NFTs to mint in each drop.
     * @param merkleProofs - Merkle proofs for a user to mint NFTs.
     * @param swapData - Amount of approved tickets with signed permit.
     * @param recipient - Recipient of NFT and dust refund. Note: Must be in Merkle Tree

     * @return tokensSpent - Amount of tokens spent for swap to ESE.
     * @return dust - Amount of ESE tokens sent back after paying {mintPrice}.
     */
    function mintDropsWithSwap(
        uint256[] calldata IDs,
        uint32[] calldata quantities, 
        bytes32[][] calldata merkleProofs,
        bytes calldata swapData,
        address recipient
    ) external payable whenNotPaused returns(uint256 tokensSpent, uint96 dust){
        uint256 returnAmount;
        (returnAmount, tokensSpent) = _swap(swapData);
        uint96 ESEPaid = EeseeDrops.mintDrops(IDs, quantities, merkleProofs, recipient, "");
        dust = _refund(uint96(returnAmount), ESEPaid, recipient);
    }

    // ============ Admin Methods ============

    /**
    * @dev Called by the PAUSER_ROLE to pause, triggers stopped state.
    */
    function pause() onlyPauser external {
        _pause();
    }

    /**
     * @dev Called by the PAUSER_ROLE to unpause, returns to normal state.
     */
    function unpause() onlyPauser external {
        _unpause();
    }

    // =============== External View Functions ==================

    /**
     * @dev Get the winner of eesee lot. Return address(0) if no winner found.
     * @param ID - ID of the lot.
     
     * @return winner - Lot winner. Returns address(0) if no winner chosen.
     * @return isAssetWinner - True if winner recieves asset. False if winner receives ESE tokens.
     */
    function getLotWinner(uint256 ID) external view returns(address winner, bool isAssetWinner) {
        (bool success, bytes memory data) = address(Eesee).staticcall(abi.encodeWithSelector(IEesee.lots.selector, ID));
        if(!success) revert LotNotExists();

        AssetType assetType;
        {
        bool buyout;
        assembly {
            buyout := mload(add(data, 288))
            assetType := mload(add(data, 544))
        }
        if(buyout){
            return (Eesee.getBuyTicketsRecipient(ID, 0), assetType != AssetType.ESE);
        }
        }

        uint256 randomWord;
        {
        uint32 endTimestamp;
        assembly {
            endTimestamp := mload(add(data, 192))
        }
        if(endTimestamp == 0) revert LotNotExists();
        
        uint256 randomTimestamp;
        (randomWord, randomTimestamp) = random.getRandomFromTimestamp(endTimestamp);
        if(randomTimestamp == 0) revert LotNotFulfilled();
        unchecked{ if(randomTimestamp > endTimestamp + returnInterval) revert LotExpired(); }
        }

        uint32 ticketsBought;
        uint32 bonusTickets;
        assembly {
            ticketsBought := mload(add(data, 96))
            bonusTickets := mload(add(data, 64))
        }
        if(ticketsBought == 0) revert NoTicketsBought();

        bool closed;
        assembly {
            closed := mload(add(data, 256))
        }

        unchecked {
            uint256 IDmod256 = ID % 256;
            uint256 circularShiftWord = (randomWord << IDmod256) | (randomWord  >> (256 - IDmod256));
            return (Eesee.getLotTicketHolder(ID, uint32(circularShiftWord % (ticketsBought + bonusTickets))), (closed && assetType != AssetType.ESE));
        }
    }

    // =============== Internal Write Functions ===============

    function _swap(bytes calldata swapData) internal returns(uint256 returnAmount, uint256 tokensSpent){
        (,IAggregationRouterV5.SwapDescription memory desc,) = abi.decode(swapData[4:], (address, IAggregationRouterV5.SwapDescription, bytes));
        if(
            bytes4(swapData[:4]) != IAggregationRouterV5.swap.selector || 
            desc.srcToken == ESE || 
            desc.dstToken != ESE || 
            desc.amount == 0 ||
            desc.dstReceiver != address(this)
        ) revert InvalidSwapDescription();
        
        if(address(desc.srcToken) == address(0) || address(desc.srcToken) == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)){
            if(msg.value != desc.amount) revert InvalidMsgValue();
        }else{
            if(msg.value != 0) revert InvalidMsgValue();
            desc.srcToken.safeTransferFrom(_msgSender(), address(this), desc.amount);
            desc.srcToken.safeIncreaseAllowance(OneInchRouter, desc.amount);
        }

        (bool success, bytes memory data) = OneInchRouter.call{value: msg.value}(swapData);
        if(!success) revert SwapNotSuccessful();
        (returnAmount, tokensSpent) = abi.decode(data, (uint256, uint256));
        if(tokensSpent != desc.amount) revert PartialFillNotAllowed();
    }

    function _refund(uint96 returnAmount, uint96 ESEPaid, address recipient) internal returns(uint96 dust){
        if(returnAmount != ESEPaid){
            unchecked{ dust = returnAmount - ESEPaid; }
            ESE.safeTransfer(recipient, dust);
        }
    }

    // =============== Internal View Functions ===============
    
    function _msgSender() internal view override(Context, ERC2771Recipient) returns (address) {
        return ERC2771Recipient._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Recipient) returns (bytes calldata) {
        return ERC2771Recipient._msgData();
    }
}