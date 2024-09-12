// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IEeseeSwap.sol";

contract EeseeSwap is IEeseeSwap, Pausable {
    using SafeERC20 for IERC20;
    ///@dev ESE token this contract uses.
    IERC20 public immutable ESE;
    ///@dev 1inch router used for token swaps.
    address immutable public OneInchRouter;
    ///@dev Access manager for Eesee contract ecosystem.
    IEeseeAccessManager public immutable accessManager;
    ///@dev Pauser role in {accessManager}.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    modifier onlyPauser(){
        if(!accessManager.hasRole(PAUSER_ROLE, msg.sender)) revert CallerNotAuthorized();
        _;
    }

    constructor(IERC20 _ESE, address _OneInchRouter, IEeseeAccessManager _accessManager) {
        if(
            address(_ESE) == address(0) ||
            _OneInchRouter == address(0) ||
            address(_accessManager) == address(0)
        ) revert InvalidConstructor();

        ESE = _ESE;
        OneInchRouter = _OneInchRouter;
        accessManager = _accessManager;
        _ESE.approve(_OneInchRouter, type(uint256).max);
    }

    receive() external payable {
        //Reject deposits from EOA
        if (msg.sender == tx.origin) revert EthDepositRejected();
    }

    // ============ External Write Functions ============

    /**
     * @dev Swap ESE tokens and receive assets the sender chooses. Emits {ReceiveAsset} event for each of the asset received.
     * @param swapParams - Struct containing 1inch swap data to swap ESE for needed token and addresses with data to call marketplace routers with. Leave empty if want to receive ESE.
     * @param recipient - Address to send rewards to.

     * @return assets - Assets received.
     * @return dstToken - Token used in swap.
     * @return returnAmount - Amount of {dstToken}s received.
     * @return dust - ESE dust returned to {recipient}.
     */
    function swapTokensForAssets(
        SwapParams calldata swapParams,
        address recipient
    ) external whenNotPaused returns(Asset[] memory assets, IERC20 dstToken, uint256 returnAmount, uint96 dust){
        if(recipient == address(0)) revert InvalidRecipient();
        (dstToken, returnAmount, dust) = _swapESE(swapParams.swapData, recipient);
        (assets, returnAmount) = _purchaseAssetFromRouter(dstToken, returnAmount, swapParams.marketplaceRoutersData, recipient);
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

    // ============ Internal Write Functions ============

    function _swapESE(bytes calldata swapData, address dustRecipient) internal returns (IERC20 dstToken, uint256 returnAmount, uint96 dust) {
        uint256 balanceESE = ESE.balanceOf(address(this));

        if(swapData.length != 0){
            (,IAggregationRouterV5.SwapDescription memory desc,) = abi.decode(swapData[4:], (address, IAggregationRouterV5.SwapDescription, bytes));
            if(
                bytes4(swapData[:4]) != IAggregationRouterV5.swap.selector || 
                desc.srcToken != ESE ||
                desc.dstToken == ESE ||
                desc.dstReceiver != address(this)
            ) revert InvalidSwapDescription();
            dstToken = desc.dstToken;

            (bool success, bytes memory data) = OneInchRouter.call(swapData);
            if(!success) revert SwapNotSuccessful(); 

            uint256 tokensSpent;
            (returnAmount, tokensSpent) = abi.decode(data, (uint256, uint256));
            if(tokensSpent != balanceESE) {
                dust = uint96(balanceESE - tokensSpent);
                ESE.safeTransfer(dustRecipient, dust);
            }
        }else{
            dstToken = ESE;
            returnAmount = balanceESE;
        }
    }

    function _purchaseAssetFromRouter(
        IERC20 dstToken, 
        uint256 returnAmount, 
        MarketplaceRouterData[] calldata marketplaceRoutersData,
        address recipient
    ) internal returns(Asset[] memory assets, uint256){
        uint256 marketplaceRoutersLength = marketplaceRoutersData.length;
        assets = new Asset[](marketplaceRoutersLength);

        bool isETH = (address(dstToken) == address(0) || address(dstToken) == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE));
        for(uint256 i; i < marketplaceRoutersLength;) {
            uint256 spent;
            if(isETH) {
                (assets[i], spent) = marketplaceRoutersData[i].router.purchaseAsset{value: returnAmount}(marketplaceRoutersData[i].data, recipient);
                returnAmount -= spent;
            } else {
                dstToken.safeTransfer(address(marketplaceRoutersData[i].router), returnAmount);
                (assets[i], spent) = marketplaceRoutersData[i].router.purchaseAsset(marketplaceRoutersData[i].data, recipient);
                returnAmount -= spent;
            }

            emit ReceiveAsset(assets[i], dstToken, spent, recipient);
            unchecked{ ++i; }
        }
        
        if(returnAmount > 0){
            if(isETH){
                (bool sent, ) = recipient.call{value: returnAmount}("");
                if(!sent) revert TransferNotSuccessful();
            }else{
                dstToken.safeTransfer(recipient, returnAmount);
            }
        }
        return (assets, returnAmount);
    }
}