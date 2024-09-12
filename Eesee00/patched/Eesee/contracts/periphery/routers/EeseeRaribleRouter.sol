// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../interfaces/IEeseeMarketplaceRouter.sol";
import "../../interfaces/IExchangeV2Core.sol";
import "../../libraries/LibDirectTransfer.sol";

contract EeseeRaribleRouter is IEeseeMarketplaceRouter, ERC721Holder, Pausable {
    using SafeERC20 for IERC20;

    ///@dev Main rarible marketplace contract's address.
    IExchangeV2Core public immutable exchangeV2Core;
    ///@dev Access manager for Eesee contract ecosystem.
    IEeseeAccessManager public immutable accessManager;
    ///@dev Pauser role in {accessManager}.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    ///@dev Rarible version constants.
    bytes4 constant private V1 = bytes4(keccak256("V1"));
    bytes4 constant private V2 = bytes4(keccak256("V2"));
    bytes4 constant private V3_SELL = bytes4(keccak256("V3_SELL"));
    ///@dev Rarible's constant for nftAssetClass check. This router can only buy ERC721 assets.
    bytes4 constant private ERC721 = bytes4(keccak256("ERC721"));
    
    error ERC20NotSupported();
    error InvalidDataType();
    error InvalidAssetClass();

    modifier onlyPauser(){
        if(!accessManager.hasRole(PAUSER_ROLE, msg.sender)) revert CallerNotAuthorized();
        _;
    }

    constructor(IExchangeV2Core _exchangeV2Core, IEeseeAccessManager _accessManager) {
        exchangeV2Core = _exchangeV2Core;
        accessManager = _accessManager;
    }

    receive() external payable {
        //Reject deposits from EOA
        if (msg.sender == tx.origin) revert EthDepositRejected();
    }

    // ============ External Write Functions ============

    /**
     * @dev Buys NFT for {nftPrice} from Rarible marketplace and sends it to {recipient}.
     * @param data - Encoded LibDirectTransfer.Purchase struct needed for rarible contracts.
     * @param recipient - Address to send nft to.
     *
     * @return asset - Asset received.
     * @return spent - Tokens spent.
     */
    function purchaseAsset(bytes calldata data, address recipient) external payable whenNotPaused returns (Asset memory asset, uint256 spent) {
        LibDirectTransfer.Purchase memory purchase = abi.decode(data, (LibDirectTransfer.Purchase)); 
        if (address(purchase.paymentToken) != address(0)) revert ERC20NotSupported();
        if (purchase.nftAssetClass != ERC721) revert InvalidAssetClass();

        uint96 fee = getFee(purchase.sellOrderDataType, purchase.buyOrderData);
        spent = (10000 + fee) * purchase.sellOrderPaymentAmount / 10000;
        if (msg.value < spent) revert InsufficientFunds();
        exchangeV2Core.directPurchase{value: spent}(purchase);

        if(spent != msg.value){
            unchecked {
                (bool success, ) = msg.sender.call{value: msg.value - spent}("");
                if(!success) revert TransferNotSuccessful();
            }
        }

        (address token, uint256 tokenID) = abi.decode(purchase.nftData, (address, uint256));
        asset = Asset({
            token: token,
            tokenID: tokenID,
            amount: 1,
            assetType: AssetType.ERC721,
            data: ""
        });
        IERC721(token).safeTransferFrom(address(this), recipient, tokenID);
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

    // ============ Internal View Functions ============

    function getFee(bytes4 dataType, bytes memory buyOrderData) internal pure returns (uint96 fee){
        if(dataType == V1){
            LibDirectTransfer.DataV1 memory buyOrder = abi.decode(buyOrderData, (LibDirectTransfer.DataV1));
            fee = calculateFee(buyOrder.originFees);
        } else if(dataType == V2){
            LibDirectTransfer.DataV2 memory buyOrder = abi.decode(buyOrderData, (LibDirectTransfer.DataV2));
            fee = calculateFee(buyOrder.originFees);
        } else if(dataType == V3_SELL){
            LibDirectTransfer.DataV3_BUY memory buyOrder = abi.decode(buyOrderData, (LibDirectTransfer.DataV3_BUY));
            fee = calculateFeeV3(buyOrder.originFeeFirst, buyOrder.originFeeSecond);
        } else revert InvalidDataType();
    }

    function calculateFee(LibDirectTransfer.Part[] memory originFees) internal pure returns (uint96 fee){
        for (uint256 i; i < originFees.length;) {
            fee += originFees[i].value;
            unchecked { ++i; }
        }
    }

    function calculateFeeV3(uint256 dataFirst, uint256 dataSecond) internal pure returns(uint96 fee) {
        return uint96(dataFirst >> 160) + uint96(dataSecond >> 160);
    }
}
