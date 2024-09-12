// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "./IEeseeAccessManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../types/Asset.sol";

interface IEeseeMarketplaceRouter {
    error TransferNotSuccessful();
    error InsufficientFunds();
    error EthDepositRejected();
    error CallerNotAuthorized();

    function accessManager() external view returns(IEeseeAccessManager);
    function PAUSER_ROLE() external view returns(bytes32);

    function purchaseAsset(bytes calldata data, address recipient) external payable returns (Asset memory asset, uint256 spent);

    function pause() external;
    function unpause() external;
}