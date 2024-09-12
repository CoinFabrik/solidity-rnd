// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "../interfaces/IEeseeProxy.sol";

interface IEeseeProxy  {
    function callExternal(address to, bytes calldata data) external payable returns (bytes memory);
}