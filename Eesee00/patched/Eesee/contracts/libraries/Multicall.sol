// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

abstract contract Multicall {
    ///@dev Adapted from OpenZeppelin's ReentrancyGuard to add third state and to only trigger for payable multicalls.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private constant VALUE_SPENT = 3;
    uint256 private _status;

    error InvalidValueCall();
    error InvalidMsgValue();
    error ReentrantCall();

    modifier nonPayable() {
        // Can only receive value if called with multicall with msg.value.
        if(msg.value != 0 && _status == NOT_ENTERED) revert InvalidMsgValue();
        _;
    }

    constructor() {
        _status = NOT_ENTERED;
    }

    // ============ External Write Functions ============

    /**
     * @dev Allows calling multiple contract functions in a single call:
     * @param data - ABI-encoded data describing the call.
     *
     * @param results - ABI-encoded return data for each function call.
     * Note: Can only call functions using msg.value once.
     */
    function multicall(bytes[] calldata data) external payable returns (bytes[] memory results) {
        if(msg.value != 0){
            if(_status != NOT_ENTERED) revert ReentrantCall();
            _status = ENTERED;
        }

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

        if(msg.value != 0) {
            // Cannot call payable multicall without spending value.
            if(_status != VALUE_SPENT) revert InvalidValueCall();
            _status = NOT_ENTERED;
        }
    }

    // ============ Internal Write Functions ============

    ///@dev Allows the function to be both payable and non payable depending on value left.
    function _checkValueLeft(uint256 valueLeft) internal {
        if(msg.value == 0) return;

        uint256 status = _status;
        if(status == VALUE_SPENT) revert InvalidValueCall();
        
        if(valueLeft == 0){
            if(status == ENTERED) _status = VALUE_SPENT;
        } else if(status == NOT_ENTERED || valueLeft != msg.value) revert InvalidMsgValue();
    }
}