// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "./IEeseeAccessManager.sol";
import "./IEeseeMarketplaceRouter.sol";
import "./IAggregationRouterV5.sol";

interface IEeseeSwap {
    /** 
     * @dev Struct used for NFT swap.
     * {swapData} - 1inch swap data to swap ESE for needed token.
     * {marketplaceRoutersData} - Addresses with data to call marketplace routers with. 
    */
    struct SwapParams{
        bytes swapData;
        MarketplaceRouterData[] marketplaceRoutersData;
    }

    struct MarketplaceRouterData{
        IEeseeMarketplaceRouter router;
        bytes data;
    }

    event ReceiveAsset(
        Asset assetBought,
        IERC20 indexed tokenSpent,
        uint256 spent,
        address indexed recipient
    ); 

    error EthDepositRejected();
    error InvalidRecipient();
    error InvalidSwapDescription();
    error SwapNotSuccessful(); 
    error InvalidAmount();
    error TransferNotSuccessful();
    error InvalidConstructor();
    error CallerNotAuthorized();

    function ESE() external view returns(IERC20);
    function OneInchRouter() external view returns(address);
    function accessManager() external view returns(IEeseeAccessManager);
    function PAUSER_ROLE() external view returns(bytes32);

    function swapTokensForAssets(
        SwapParams calldata swapParams,
        address recipient
    ) external returns(Asset[] memory assets, IERC20 dstToken, uint256 returnAmount, uint96 dust);

    function pause() external;
    function unpause() external;
}