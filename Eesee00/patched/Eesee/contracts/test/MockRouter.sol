// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "../types/Asset.sol";

contract MockRouter {
    function purchaseAsset(bytes calldata /*data*/, address /*recipient*/) external payable returns (Asset memory /*asset*/, uint256 /*spent*/) {
        revert();
    }
}
