// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

/// @author: manifold.xyz

import '../libraries/LibDirectTransfer.sol';
/**
 * @dev Lookup engine interface
 */
interface IExchangeV2Core {
    function directPurchase(LibDirectTransfer.Purchase calldata direct) external payable;
}