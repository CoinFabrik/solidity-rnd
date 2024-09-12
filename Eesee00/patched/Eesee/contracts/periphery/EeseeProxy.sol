// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "../interfaces/IEeseeProxy.sol";

contract EeseeProxy is IEeseeProxy {
    /**
     * @dev Call any external contract function.
     * @param to - Address to call.
     * @param data - Data to call {to} with.
     
     * @return bytes - Return data received from a call.
     */
    function callExternal(address to, bytes calldata data) external payable returns (bytes memory){
        (bool success, bytes memory result) = to.call{value: msg.value}(data);
        if (!success) {
            if (result.length == 0) revert();
            assembly {
                revert(add(32, result), mload(result))
            }
        }
        return result;
    }
}