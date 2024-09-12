// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "../interfaces/IEesee.sol";
import "../libraries/AssetTransfer.sol";
import "../libraries/Multicall.sol";

contract Eesee is IEesee, ERC2771Recipient, ERC721Holder, ERC1155Holder, EIP712, Multicall {
    using AssetTransfer for Asset;
    using SafeERC20 for IERC20;

    ///@dev An array of all existing lots.
    Lot[] public lots;

    ///@dev ESE token this contract uses.
    IERC20 public immutable ESE;
    ///@dev Eesee staking contract. Tracks volume for this contract.
    IEeseeStaking public immutable staking;
    ///@dev Contract that is used to swap ESE for NFTs.
    IEeseeSwap private immutable swap;
    ///@dev Contract that mints NFTs.
    IEeseeMinter private immutable minter;
    ///@dev Contract that provides random.
    IEeseeRandom public immutable random;
    ///@dev Address the {fee}s are sent to.
    address public immutable feeSplitter;
    ///@dev Access manager for Eesee contract ecosystem.
    IEeseeAccessManager public immutable accessManager;
    ///@dev Admin role af defined in {accessManager}.
    bytes32 private immutable ADMIN_ROLE;
    ///@dev True if lot nonce has already been used.
    mapping(address => mapping(uint256 => bool)) private nonceUsed;

    ///@dev Min and max durations for a lot.
    uint64 public minDuration = 1 days;
    uint64 public maxDuration = 30 days;
    ///@dev In case Chainlink VRF request fails to get delivered 24 hours after the lot was closed, unlock Reclaim functions.
    uint32 private constant returnInterval = 24 hours;
    ///@dev Max ESE in existence.
    uint96 private constant maxESE = 1_000_000_000 * 10^18;
    ///@dev Denominator for fee variables.
    uint32 private constant denominator = 10000;
    ///@dev Fee that is collected to {feeSplitter} from each fulfilled lot. [10000 == 100%]
    uint32 public fee = 600;

    ///@dev The Royalty Engine is a contract that provides an easy way for any marketplace to look up royalties for any given token contract.
    IRoyaltyEngineV1 immutable private royaltyEngine;

    modifier onlyAdmin(){
        if(!accessManager.hasRole(ADMIN_ROLE, _msgSender())) revert CallerNotAuthorized();
        _;
    }

    constructor(
        IERC20 _ESE,
        IEeseeStaking _staking,
        IEeseeSwap _swap,
        IEeseeMinter _minter,
        IEeseeRandom _random,
        address _feeSplitter,
        IRoyaltyEngineV1 _royaltyEngine,
        IEeseeAccessManager _accessManager,
        address trustedForwarder
    ) EIP712("Eesee", "1") {
        ESE = _ESE;
        staking = _staking;
        swap = _swap;
        minter = _minter;
        random = _random;

        feeSplitter = _feeSplitter;
        royaltyEngine = _royaltyEngine;

        accessManager = _accessManager;
        ADMIN_ROLE = _accessManager.ADMIN_ROLE();

        _setTrustedForwarder(trustedForwarder);
    }

    // ============ External Methods ============

    /**
     * @dev Creates lots with assets from sender's balance. Emits {CreateLot} events for each created lot.
     * @param assets - Assets to list. Note: The sender must have them approved for this contract.
     * @param params.maxTickets - Max amount of tickets that can be bought by participants.
     * @param params.ticketPrice - Prices for a single ticket.
     * @param params.duration - Durations of lots. Can be in range [minDuration, maxDuration].
     * @param params.owner - Owners of the lots. Owners can claim tokens after winning or reclaim assets if not enough people bought the tickets. 
     * @param params.signer - Signer of {signature} or msg.sender to disable {signature} check. 
     * @param params.nonce - Unique random nonce for {signer}. Can be set to any value if signer == msg.sender.
     * @param params.deadline - {signature} deadline. Can be set to any value if signer == msg.sender.
     * @param params.signature - Signature bytes data. Can be set to any value if signer == msg.sender.

     * @return IDs - IDs of lots created.
     */
    function createLots(
        Asset[] calldata assets,
        LotParams[] calldata params
    ) public payable returns(uint256[] memory IDs){
        if(assets.length != params.length) revert InvalidArrayLengths();
        IDs = new uint256[](assets.length);

        address msgSender = _msgSender();
        bytes32 domainSeparatorV4 = _domainSeparatorV4();
        address _ESE = address(ESE);
        for(uint256 i; i < assets.length;) {
            (address signer, uint256 nonce) = assets[i].transferAssetFrom(params[i], msgSender, domainSeparatorV4, _ESE);
            IDs[i] = _createLot(assets[i], params[i]);

            if(msgSender != signer){
                if(nonceUsed[signer][nonce]) revert NonceUsed();
                nonceUsed[signer][nonce] = true;
                emit ConsumeNonce(IDs[i], signer, nonce);
            } 
            unchecked{ ++i; }
        }
    }

    /**
     * @dev Buys tickets to participate in a lot. Emits {BuyTicket} event for each ticket bought.
     * @param IDs - IDs of lots to buy tickets for.
     * @param amounts - Amounts of tickets to buy in each lot.
     * @param recipient - Recipient of tickets.
     * @param permit - Abi-encoded ESE permit data containing approveAmount, deadline, v, r and s. Set to empty bytes to skip permit.

     * @return tokensSpent - ESE tokens spent.
     */
    function buyTickets(
        uint256[] memory IDs, 
        uint32[] calldata amounts, 
        address recipient,
        bytes calldata permit
    ) public returns(uint96 tokensSpent){
        if(IDs.length != amounts.length) revert InvalidArrayLengths();
        if(recipient == address(0)) revert InvalidRecipient();

        for(uint256 i; i < IDs.length;){
            tokensSpent += _buyTickets(IDs[i], amounts[i], recipient);
            unchecked{ ++i; }
        }

        IERC20 _ESE = ESE;
        address msgSender = _msgSender();
        if(permit.length != 0){
            (uint256 approveAmount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) = abi.decode(permit, (uint256, uint256, uint8, bytes32, bytes32));
            IERC20Permit(address(_ESE)).permit(msgSender, address(this), approveAmount, deadline, v, r, s);
        }
        _ESE.safeTransferFrom(msgSender, address(this), tokensSpent);
        try staking.addVolume(tokensSpent, recipient) {} catch {}
    }

    /**
     * @dev Creates lots and buys tickets in them. Emits {CreateLot} for each lot created and {BuyTicket} event for each ticket bought.
     * @param assets - Assets to list. Note: The sender must have them approved for this contract.
     * @param params - Parameters for lots.
     * @param amounts - Amounts of tickets to buy in each lot.
     * @param recipient - Recipient of tickets.
     * @param permit - Abi-encoded ESE permit data containing approveAmount, deadline, v, r and s. Set to empty bytes to skip permit.

     * @return IDs - IDs of created lots.
     * @return tokensSpent - ESE tokens spent.
     */
    function createLotsAndBuyTickets(
        Asset[] calldata assets, 
        LotParams[] calldata params, 
        uint32[] calldata amounts, 
        address recipient,
        bytes calldata permit
    ) external payable returns(uint256[] memory IDs, uint96 tokensSpent){
        IDs = createLots(assets, params);
        tokensSpent = buyTickets(IDs, amounts, recipient, permit);
    }

    /**
     * @dev Receive assets the sender won from lots. Emits {ReceiveAsset} event for each of the asset received.
     * @param IDs - IDs of lots to claim assets in.
     * @param recipient - Address to send Assets to. 
     
     * @return assets - Assets received.
     */
    function receiveAssets(uint256[] calldata IDs, address recipient) external returns(Asset[] memory assets){
        if(recipient == address(0)) revert InvalidRecipient();
        assets = new Asset[](IDs.length);

        address msgSender = _msgSender();
        IEeseeMinter _minter = minter;
        for(uint256 i; i < IDs.length;){
            uint256 ID = IDs[i];
            Lot storage lot = lots[ID];
            uint32 endTimestamp = lot.endTimestamp;
            if(endTimestamp == 0) revert LotNotExists(ID);
            uint32 ticketsBought = lot.ticketsBought;
            if(ticketsBought == 0) revert NoTicketsBought(ID);

            if(lot.buyout){ // In case the tickets in a lot were bought out by a single address, we don't need to wait for Chainlink VRF.
                if(msgSender != lot.recipients[0]) revert CallerNotWinner(ID); 
            } else {
                (uint256 r_word, uint256 r_timestamp) = random.getRandomFromTimestamp(endTimestamp);
                if(r_timestamp == 0) revert LotNotFulfilled(ID);
                unchecked{ if(r_timestamp > endTimestamp + returnInterval) revert LotExpired(ID); }

                unchecked {
                    // Perform circular bit shift to add entropy to winners in the same batch.
                    uint256 IDmod256 = ID % 256;
                    uint256 circularShiftWord = (r_word << IDmod256) | (r_word >> (256 - IDmod256));
                    address winner = _getLotTicketHolder(lot, uint32(circularShiftWord % (ticketsBought + lot.bonusTickets)));         
                    if(msgSender != winner) revert CallerNotWinner(ID);
                }
            }

            if(lot.assetClaimed) revert AssetAlreadyClaimed(ID);
            Asset memory asset = lot.asset;
            if(lot.tokensClaimed){ 
                delete lots[ID]; 
            }else{
                lot.assetClaimed = true;
            }
            assets[i] = asset.transferAssetTo(recipient, _minter);

            emit ReceiveAsset(ID, msgSender, recipient, assets[i]);
            unchecked{ ++i; }
        }
    }

    /**
     * @dev Receive ESE the sender has earned from lots. Emits {ReceiveTokens} event for each of the claimed lot. 
     * Note: If the lot has expired, it takes 24 hours before {reclaimTokens} becomes available. 
     * If a random number is received in this timeframe, a winner is chosen and {receiveTokens} becomes avaliable for the winner to be called instead. 
     * In such case, a winner wins all collected ESE tokens instead of asset.
     * @param IDs - IDs of lots to claim tokens in.
     * @param recipient - Address to send tokens to.
     
     * @return amount - ESE received.
     */
    function receiveTokens(uint256[] calldata IDs, address recipient) external returns(uint96 amount){
        if(recipient == address(0)) revert InvalidRecipient();

        address msgSender = _msgSender();
        IERC20 _ESE = ESE;
        uint96 feeAmount;
        for(uint256 i; i < IDs.length;){
            uint256 ID = IDs[i];
            Lot storage lot = lots[ID];
            address owner = lot.owner;
            if(owner == address(0)) revert LotNotExists(ID);
            uint32 ticketsBought = lot.ticketsBought;
            if(ticketsBought == 0) revert NoTicketsBought(ID);

            bool collectRoyalties;
            AssetType assetType = lot.asset.assetType;
            if(lot.buyout){ // In case the tickets in a lot were bought out by a single address, we don't need to wait for Chainlink VRF.
                if(assetType == AssetType.ESE){
                    if(msgSender != lot.recipients[0]) revert CallerNotWinner(ID);
                } else {
                    if(msgSender != owner) revert CallerNotOwner(ID);
                    if(assetType == AssetType.ERC721 || assetType == AssetType.ERC1155) collectRoyalties = true;
                }
            } else {
                uint256 r_word; 
                {
                uint256 r_timestamp;
                uint32 endTimestamp = lot.endTimestamp;
                (r_word, r_timestamp) = random.getRandomFromTimestamp(endTimestamp);
                if(r_timestamp == 0) revert LotNotFulfilled(ID);
                unchecked{ if(r_timestamp > endTimestamp + returnInterval) revert LotExpired(ID); }
                }

                if(!lot.closed || assetType == AssetType.ESE){ // In case we used ESE as an asset or the listing has expired, the winner claims the tokens.
                    unchecked {
                        // Perform circular bit shift to add entropy to winners in the same batch.
                        uint256 IDmod256 = ID % 256;
                        uint256 circularShiftWord = (r_word << IDmod256) | (r_word >> (256 - IDmod256));
                        address winner = _getLotTicketHolder(lot, uint32(circularShiftWord % (ticketsBought + lot.bonusTickets)));
                        if(msgSender != winner) revert CallerNotWinner(ID);
                    }
                }else{
                    if(msgSender != owner) revert CallerNotOwner(ID);
                    if(assetType == AssetType.ERC721 || assetType == AssetType.ERC1155) collectRoyalties = true;
                }
            }
            
            // For _amount to overflow there must be more than type.max(uint96) tokens in existence, which is not the case for ESE.
            unchecked {
                uint96 _amount = lot.ticketPrice * ticketsBought;
                if(collectRoyalties){
                    _amount -= _collectRoyalties(lot.asset.token, lot.asset.tokenID, _amount, owner, _ESE);
                }
                // Project fees
                uint96 _feeAmount = uint96(uint256(_amount) * lot.fee / denominator);
                feeAmount += _feeAmount;
                _amount -= _feeAmount;

                amount += _amount; 
                ++i;

                emit ReceiveTokens(ID, msgSender, recipient, _amount);
            }

            if(lot.tokensClaimed) revert TokensAlreadyClaimed(ID);
            if(lot.assetClaimed || assetType == AssetType.ESE) {
                delete lots[ID];
            } else {
                lot.tokensClaimed = true;
            }
        }
        // Transfer later to save gas
        if(feeAmount > 0){
            address _feeSplitter = feeSplitter;
            _ESE.safeTransfer(_feeSplitter, feeAmount);
            emit CollectFee(_feeSplitter, feeAmount);
        }
        _ESE.safeTransfer(recipient, amount);
    }

    /**
     * @dev Reclaim assets from expired lots. Emits {ReclaimAsset} event for each lot ID.
     * @param IDs - IDs of lots to reclaim assets in.
     * @param recipient - Address to send assets to.
     
     * @return assets - Assets reclaimed.
     */
    function reclaimAssets(uint256[] calldata IDs, address recipient) external returns(Asset[] memory assets){
        if(recipient == address(0)) revert InvalidRecipient();
        assets = new Asset[](IDs.length);

        address msgSender = _msgSender();
        IEeseeMinter _minter = minter;
        for(uint256 i; i < IDs.length;){
            uint256 ID = IDs[i];
            Lot storage lot = lots[ID];
            address owner = lot.owner;
            if(owner == address(0)) revert LotNotExists(ID);
            if(msgSender != owner) revert CallerNotOwner(ID);
            if(lot.buyout) revert LotAlreadyFulfilled(ID);
            if(lot.assetClaimed) revert AssetAlreadyClaimed(ID);

            uint32 endTimestamp = lot.endTimestamp;
            if(lot.closed) {
                (,uint256 r_timestamp) = random.getRandomFromTimestamp(endTimestamp);
                if(r_timestamp == 0){ // Chainlink VRF wasn't called.
                    unchecked{ if(block.timestamp <= endTimestamp + returnInterval) revert LotNotExpired(ID); }
                } else { // Chainlink VRF was called.
                    unchecked{ if(r_timestamp <= endTimestamp + returnInterval) revert LotAlreadyFulfilled(ID); }
                }
            } else if(block.timestamp <= endTimestamp) revert LotNotExpired(ID);

            Asset memory asset = lot.asset;
            if(lot.ticketsBought == 0) { 
                delete lots[ID];
            }else{
                lot.assetClaimed = true;
            }
            assets[i] = asset.transferAssetTo(recipient, _minter);

            emit ReclaimAsset(ID, msgSender, recipient, assets[i]);
            unchecked{ ++i; }
        }
    }

    /**
     * @dev Reclaim ESE from expired lots. Emits {ReclaimTokens} event for each lot ID.
     * @param IDs - IDs of lots to reclaim tokens in.
     * @param recipient - Address to send tokens to.
     
     * @return amount - ESE received.
     * Note: This function will only be available after 24 hours after the lot has ended/expired and if no random number was received in this 24 hour timeframe.
     */
    function reclaimTokens(uint256[] calldata IDs, address recipient) external returns(uint96 amount){
        if(recipient == address(0)) revert InvalidRecipient();

        address msgSender = _msgSender();
        for(uint256 i; i < IDs.length;){
            uint256 ID = IDs[i];
            Lot storage lot = lots[ID];
            uint96 ticketPrice = lot.ticketPrice;
            if(ticketPrice == 0) revert LotNotExists(ID);
            uint32 ticketsHeldByAddress = lot.ticketsHeldByAddress[msgSender];
            if(ticketsHeldByAddress == 0) revert NoTicketsHeld(ID);
            if(lot.buyout) revert LotAlreadyFulfilled(ID);

            uint32 endTimestamp = lot.endTimestamp;
            (,uint256 r_timestamp) = random.getRandomFromTimestamp(endTimestamp);
            if(r_timestamp == 0){ // Chainlink VRF wasn't called.
                unchecked{ if(block.timestamp <= endTimestamp + returnInterval) revert LotNotExpired(ID); }
            } else { // Chainlink VRF was called.
                unchecked{ if(r_timestamp <= endTimestamp + returnInterval) revert LotAlreadyFulfilled(ID); }
            }

            unchecked {
                uint96 _amount = ticketPrice * ticketsHeldByAddress;
                amount += _amount;
                ++i;

                lot.ticketsBought -= ticketsHeldByAddress;
                lot.ticketsHeldByAddress[msgSender] = 0;

                emit ReclaimTokens(ID, msgSender, recipient, _amount);
            }
            if(lot.ticketsBought == 0 && (lot.assetClaimed || lot.asset.assetType == AssetType.ESE)) delete lots[ID];
        }
        // Transfer later to save some gas
        ESE.safeTransfer(recipient, amount);
    }

    /**
     * @dev Swap ESE in {swap}'s balance for specified assets on other marketplaces. Is intended to be used with {multicall} function. WARNING: Never send ESE to {swap} directly, or you will loose them.
     * @param swapParams - SwapParams struct containing 1inch swap data to swap ESE for needed token and addresses with data to call marketplace routers with.
     * @param recipient - Address to send tokens to.
     
     * @return assets - Assets received.
     * @return dstToken - Token used in swap.
     * @return returnAmount - Amount of {dstToken}s received.
     * @return dust - ESE amount received
     */
    function swapTokensForAssets(
        SwapParams calldata swapParams, 
        address recipient
    ) external returns(Asset[] memory assets, IERC20 dstToken, uint256 returnAmount, uint96 dust){
        (assets, dstToken, returnAmount, dust) = swap.swapTokensForAssets(swapParams, recipient);
    }

    // ============ Getters ============

    /**
     * @dev Get length of the lots array.
     * @return length - Length of the lots array.
     */
    function getLotsLength() external view returns(uint256 length) {
        length = lots.length;
    }

    /**
     * @dev Get the holder of the specified ticket in lot.
     * @param ID - ID of the lot.
     * @param ticket - Ticket index.
     
     * @return address - Ticket holder.
     */
    function getLotTicketHolder(uint256 ID, uint32 ticket) external view returns(address) {
        return _getLotTicketHolder(lots[ID], ticket);
    }
    
    /**
     * @dev Get amount of tickets held by address in a lot.
     * @param ID - ID of the lot.
     * @param _address - Holder address.
     
     * @return uint32 - Tickets held by {_address}.
     */
    function getLotTicketsHeldByAddress(uint256 ID, address _address) external view returns(uint32) {
        return lots[ID].ticketsHeldByAddress[_address];
    }

    /**
     * @dev Get amount of bonus tickets held by address in a lot.
     * @param ID - ID of the lot.
     * @param _address - Holder address.
     
     * @return uint32 - Tickets held by {_address}.
     */
    function getLotBonusTicketsHeldByAddress(uint256 ID, address _address) external view returns(uint32) {
        return lots[ID].bonusTicketsHeldByAddress[_address];
    }

    /**
     * @dev Get the recipient of tickets in specified {transaction}.
     * @param ID - ID of the lot.
     * @param transaction - Index of the transaction in a lot.
     
     * @return address - The sender of the tickets in {transaction}.
     */
    function getBuyTicketsRecipient(uint256 ID, uint32 transaction) external view returns(address) {
        return lots[ID].recipients[transaction];
    }

    // ============ Internal Methods ============

    function _createLot(Asset calldata asset, LotParams calldata params) internal returns(uint256 ID){
        if(params.duration < minDuration) revert DurationTooLow(minDuration);
        if(params.duration > maxDuration) revert DurationTooHigh(maxDuration);
        if(params.maxTickets == 0) revert MaxTicketsTooLow();
        if(params.maxTickets > 1_000_000_000) revert MaxTicketsTooHigh();
        if(params.ticketPrice == 0) revert TicketPriceTooLow();
        if(params.owner == address(0)) revert InvalidOwner();
        if(params.ticketPrice * params.maxTickets > maxESE) revert ESEOverflow();

        ID = lots.length;
        Lot storage lot = lots.push();
        lot.asset = asset;
        lot.owner = params.owner;
        lot.maxTickets = params.maxTickets;
        lot.ticketPrice = params.ticketPrice;
        lot.fee = fee; // We save fees at the time of lot's creation to not have any control over existing lots' fees

        unchecked{
            uint32 endTimestamp = uint32(block.timestamp) + params.duration;
            lot.endTimestamp = endTimestamp;

            emit CreateLot(ID, asset, params.owner, params.maxTickets, params.ticketPrice, endTimestamp);
        }
    }

    function _buyTickets(uint256 ID, uint32 amount, address recipient) internal returns(uint96 tokensSpent){
        if(amount == 0) revert BuyAmountTooLow();
        Lot storage lot = lots[ID];
        uint32 maxTickets = lot.maxTickets;
        if(maxTickets == 0) revert LotNotExists(ID);

        uint32 _ticketsBought = lot.ticketsBought;
        uint32 ticketsBought = amount + _ticketsBought;
        if(ticketsBought > maxTickets) revert AllTicketsBought();
        if(block.timestamp > lot.endTimestamp) revert LotExpired(ID);

        unchecked{
            uint32 bonus;
            { // Scope to avoid Stack Too Deep error
            uint256 _bonus = (uint256(amount) * amount) / (uint256(4) * maxTickets);
            bonus = uint32(_bonus);
            }
            uint32 _bonusTickets = lot.bonusTickets;
            uint32 bonusTickets = _bonusTickets + bonus;
            lot.bonusTickets = bonusTickets;
        
            uint32 ticketsHeldByAddress = amount + lot.ticketsHeldByAddress[recipient];
            lot.bonusTicketsHeldByAddress[recipient] += bonus;
            lot.ticketsHeldByAddress[recipient] = ticketsHeldByAddress;
            lot.ticketsBought = ticketsBought;

            uint32 transactions = lot.transactions;
            lot.recipients[transactions] = recipient;
            lot.intervals[transactions] = ticketsBought + bonusTickets;
            lot.transactions = ++transactions;

            if(ticketsBought == maxTickets){
                lot.endTimestamp = uint32(block.timestamp);
                lot.closed = true;

                if(ticketsHeldByAddress == maxTickets){
                    lot.buyout = true;
                }
            }
        
            tokensSpent = lot.ticketPrice * amount;
            // Lower Bound is inclusive
            emit BuyTickets(ID, recipient, _ticketsBought + _bonusTickets, amount, tokensSpent, bonus);
        }
    }

    function _collectRoyalties(
        address collection, 
        uint256 tokenID, 
        uint96 value, 
        address lotOwner, 
        IERC20 _ESE
    ) internal returns(uint96 royaltyAmount) {
        (address payable[] memory recipients, uint256[] memory amounts) = royaltyEngine.getRoyalty(collection, tokenID, value);
        for(uint256 i; i < recipients.length;){
            uint96 amount = uint96(amounts[i]); // Won't overflow because otherwise there needs to be more than type(uint96).max ESE tokens in existence.
            //There is no reason to collect royalty from owner if it goes to owner
            if (recipients[i] != address(0) && recipients[i] != lotOwner && amount != 0){
                _ESE.safeTransfer(recipients[i], amount);
                unchecked {
                    royaltyAmount += amount;
                }
                emit CollectRoyalty(recipients[i], amount);
            }
            unchecked{ ++i; }
        }
    }

    /**
     * @dev Adapted form Openzeppelin's { _findUpperBound } function.
     */
    function _getLotTicketHolder(Lot storage lot, uint32 ticket) internal view returns (address) {
        uint32 high = lot.transactions;
        unchecked{
            if (high == 0 || ticket >= lot.intervals[high - 1]) {
                return address(0);
            }
        }

        uint32 low;
        while (low < high) {
            // (a + b) / 2 can overflow.
            uint32 mid = (low & high) + (low ^ high) / 2;

            // Note that mid will always be strictly less than high (i.e. it will be a valid array index)
            // because mid rounds down (it does integer division with truncation).
            if (lot.intervals[mid] > ticket) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        // At this point `low` is the exclusive upper bound.
        return lot.recipients[low];
    }

    // ============ Admin Methods ============

    /**
     * @dev Changes minDuration. Emits {ChangeMinDuration} event.
     * @param _minDuration - New minDuration.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function changeMinDuration(uint64 _minDuration) external onlyAdmin {
        if(_minDuration >= maxDuration) revert InvalidDuration();

        emit ChangeMinDuration(minDuration, _minDuration);
        minDuration = _minDuration;
    }

    /**
     * @dev Changes maxDuration. Emits {ChangeMaxDuration} event.
     * @param _maxDuration - New maxDuration.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function changeMaxDuration(uint64 _maxDuration) external onlyAdmin {
        if(_maxDuration <= minDuration) revert InvalidDuration();

        emit ChangeMaxDuration(maxDuration, _maxDuration);
        maxDuration = _maxDuration;
    }

    /**
     * @dev Changes fee. Emits {ChangeFee} event.
     * @param _fee - New fee.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function changeFee(uint32 _fee) external onlyAdmin {
        if(_fee > denominator) revert FeeTooHigh();

        emit ChangeFee(fee, _fee);
        fee = _fee;
    }
}