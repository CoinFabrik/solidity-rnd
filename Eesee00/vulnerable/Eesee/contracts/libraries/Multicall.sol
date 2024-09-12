// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

abstract contract Multicall {
    error CallReverted();

    /**
     * @dev Allows calling multiple contract functions in a single call:
     * @param data - ABI-encoded data describing the call.
     *
     * @param results - ABI-encoded return data for each function call.
     */
    function multicall(bytes[] calldata data) external payable returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i; i < data.length;) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            if (!success) {
                if (result.length == 0) revert();
                assembly {
                    revert(add(32, result), mload(result))
                }
            }

            results[i] = result;
            unchecked{ ++i; }
        }
    }
}