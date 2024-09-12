// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import '../libraries/LibDirectTransfer.sol';
import '../interfaces/IExchangeV2Core.sol';

contract MockExchangeV2Core is IExchangeV2Core {
    constructor() {

    }
     function directPurchase(LibDirectTransfer.Purchase calldata direct) external payable {

     }
}