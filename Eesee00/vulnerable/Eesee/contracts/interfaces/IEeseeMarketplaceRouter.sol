// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../types/Asset.sol";

interface IEeseeMarketplaceRouter {
    error TransferNotSuccessful();
    error InsufficientFunds();
    error EthDepositRejected();

    function purchaseAsset(bytes calldata data, address recipient) external payable returns (Asset memory asset, uint256 spent);
}