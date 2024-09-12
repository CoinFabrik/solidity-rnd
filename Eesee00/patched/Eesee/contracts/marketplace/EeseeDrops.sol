// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@opengsn/contracts/src/ERC2771Recipient.sol";
import "../interfaces/IEeseeDrops.sol";

contract EeseeDrops is IEeseeDrops, ERC2771Recipient, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // We create a struct to avoid stack too deep error.
    struct MintDropReturnParams {
        uint96 mintPrice; 
        uint96 feeAmount;
        address earningsCollector; 
    }

    ///@dev An array of all existing drops.
    Drop[] public drops;

    ///@dev ESE token this contract uses.
    IERC20 public immutable ESE;
    ///@dev Contract that mints NFTs
    IEeseeMinter public immutable minter;
    ///@dev Eesee staking contract. Tracks volume for this contract.
    IEeseeStaking public immutable staking;
    ///@dev Access manager for Eesee contract ecosystem.
    IEeseeAccessManager public immutable accessManager;
    ///@dev Admin role af defined in {accessManager}.
    bytes32 public immutable ADMIN_ROLE;

    ///@dev Denominator for fee.
    uint96 private constant DENOMINATOR = 10000;
    ///@dev Fee that is collected to {feeSplitter} from each fulfilled drop. [10000 == 100%]
    uint96 public fee = 600;
    ///@dev Address the {fee}s are sent to.
    address public feeSplitter;

    modifier onlyAdmin(){
        if(!accessManager.hasRole(ADMIN_ROLE, _msgSender())) revert CallerNotAuthorized();
        _;
    }

    constructor(
        IERC20 _ESE,
        address _feeSplitter,
        IEeseeMinter _minter, 
        IEeseeStaking _staking,
        IEeseeAccessManager _accessManager,
        address trustedForwarder
    ) {
        if(
            address(_ESE) == address(0) || 
            address(_feeSplitter) == address(0) ||
            address(_minter) == address(0) ||
            address(_staking) == address(0) ||
            address(_accessManager) == address(0)
        ) revert InvalidConstructor();

        ESE = _ESE;
        feeSplitter = _feeSplitter;
        minter = _minter;
        staking = _staking;

        accessManager = _accessManager;
        ADMIN_ROLE = _accessManager.ADMIN_ROLE();

        _setTrustedForwarder(trustedForwarder);
    }

    // ============ External Write Functions ============

    /**
     * @dev Deploys new NFT collection and lists it to users for minting. Emits {ListDrop} event.
     * @param metadata.name - Name for a collection.
     * @param metadata.symbol - Collection symbol.
     * @param metadata.baseURI - Base URI before drops reveal.
     * @param metadata.revealedURI - Base URI after drops reveal.
     * @param metadata.contractURI - URI to store collection metadata in.
     * @param metadata.royaltyReceiver - Receiver of royalties from each NFT sale.
     * @param metadata.royaltyFeeNumerator - Amount of royalties to collect from each NFT sale. [10000 = 100%].
     * @param stages - Options for sales stages.
     * @param mintPrices - An array of drop prices for each stage in ESE.
     * @param mintLimit - Max amount of NFTs that can be minted.
     * @param mintStartTimestamp - Timestamp when minting starts.
     * @param earningsCollector - Address to send NFT sale earnings to.
     * @param expectedFee - Expected fee for drop lot to avoid race condition with {changeFee}. 

     * @return ID - ID of a drop created.
     * @return collection - Address of NFT collection contract.
     */
    function listDrop(
        DropMetadata calldata metadata,
        IEeseeNFTDrop.StageOptions[] calldata stages,
        uint96[] calldata mintPrices,
        uint32 mintLimit,
        uint32 mintStartTimestamp, 
        address earningsCollector,
        uint96 expectedFee
    ) external returns (uint256 ID, IERC721 collection){
        if(stages.length != mintPrices.length) revert InvalidArrayLengths();
        if(earningsCollector == address(0)) revert InvalidEarningsCollector();
        if(expectedFee != fee) revert InvalidFee();

        collection = minter.deployDropCollection(
            metadata,
            mintLimit,
            mintStartTimestamp,
            stages
        );

        ID = drops.length;
        drops.push(Drop({
            collection: collection,
            earningsCollector: earningsCollector,
            fee: expectedFee,
            mintPrices: mintPrices
        }));

        emit ListDrop(ID, collection, earningsCollector);
    }

    /**
     * @dev Mints NFTs from a drop. Emits {MintDrop} event.
     * @param IDs - IDs of drops to mint NFTs from.
     * @param quantities - Amounts of NFTs to mint in each drop.
     * @param merkleProofs - Merkle proofs for a {recipient} to mint NFTs.
     * @param recipient - Address receiving NFT. Note: Must be in a Merkle Tree.
     * @param permit - Abi-encoded ESE permit data containing approveAmount, deadline, v, r and s. Set to empty bytes to skip permit.

     * @return mintPrice - Amount of ESE tokens spent on minting.
     */
    function mintDrops(
        uint256[] calldata IDs, 
        uint32[] calldata quantities,
        bytes32[][] calldata merkleProofs,
        address recipient,
        bytes calldata permit
    ) external nonReentrant returns(uint96 mintPrice){
        if(recipient == address(0)) revert InvalidRecipient();
        if(IDs.length != quantities.length || IDs.length != merkleProofs.length) revert InvalidArrayLengths();

        address msgSender = _msgSender();
        if(permit.length != 0){
            (uint256 approveAmount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) = abi.decode(permit, (uint256, uint256, uint8, bytes32, bytes32));
            IERC20Permit(address(ESE)).permit(msgSender, address(this), approveAmount, deadline, v, r, s);
        }

        uint96 feeAmount;
        for(uint256 i; i < IDs.length;){
            MintDropReturnParams memory returnParams = _mintDrop(IDs[i], quantities[i], merkleProofs[i], recipient);
            mintPrice += returnParams.mintPrice;
            uint96 collectorEarnings;
            unchecked{
                collectorEarnings = returnParams.mintPrice - returnParams.feeAmount;
                feeAmount += returnParams.feeAmount;
                ++i;
            }
            if(collectorEarnings > 0) ESE.safeTransferFrom(msgSender, returnParams.earningsCollector, collectorEarnings);
        }

        if(mintPrice == 0) return 0;
        if(feeAmount > 0){
            address _feeSplitter = feeSplitter;
            ESE.safeTransferFrom(msgSender, _feeSplitter, feeAmount);
            emit CollectFee(_feeSplitter, feeAmount);
        }
        try staking.addVolume(mintPrice, recipient) {} catch {
            emit AddVolumeReverted(mintPrice, recipient);
        }
    }

    // ============ Admin Methods ============

    /**
     * @dev Changes fee. Emits {ChangeFee} event.
     * @param _fee - New fee.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function changeFee(uint96 _fee) external onlyAdmin {
        if(_fee > 5000) revert FeeTooHigh();

        emit ChangeFee(fee, _fee);
        fee = _fee;
    }

    /**
     * @dev Changes feeSplitter. Emits {ChangeFeeSplitter} event.
     * @param _feeSplitter - New fee.
     * Note: This function can only be called by ADMIN_ROLE.
     */
    function changeFeeSplitter(address _feeSplitter) external onlyAdmin {
        if(_feeSplitter == address(0)) revert InvalidFeeSplitter();

        emit ChangeFeeSplitter(feeSplitter, _feeSplitter);
        feeSplitter = _feeSplitter;
    }

    // ============ External View Functions ============

    /**
     * @dev Get length of the drops array.
     * @return length - Length of the drops array.
     */
    function getDropsLength() external view returns(uint256 length) {
        length = drops.length;
    }

    /**
     * @dev Returns the mint prices for specified drop.
     * @param ID - ID of drop to check.
     * @return mintPrices - NFT Mint prices.
     */
    function getMintPrices(uint256 ID) external view returns(uint96[] memory) {
        return drops[ID].mintPrices;
    }

    // ============ Internal Write Functions ============

    function _mintDrop(
        uint256 ID, 
        uint32 quantity,
        bytes32[] calldata merkleProof,
        address recipient
    ) internal returns(MintDropReturnParams memory returnParams){
        if(ID >= drops.length) revert InvalidDropID();
        if(quantity == 0) revert InvalidQuantity();
        Drop storage drop = drops[ID];

        IERC721 collection = drop.collection;
        IEeseeNFTDrop _drop = IEeseeNFTDrop(address(collection));
        uint256 nextTokenId = _drop.nextTokenId();
        _drop.mint(recipient, quantity, merkleProof);

        {
        uint96 mintPrice = drop.mintPrices[_drop.getSaleStage()];
        if(mintPrice > 0){
            uint96 _mintPrice = mintPrice * quantity;
            returnParams.mintPrice = _mintPrice;
            returnParams.earningsCollector = drop.earningsCollector;
            returnParams.feeAmount = _mintPrice * drop.fee / DENOMINATOR;
        }
        }

        emit MintDrop(ID, collection, recipient, nextTokenId, quantity, returnParams.mintPrice);
    }
}