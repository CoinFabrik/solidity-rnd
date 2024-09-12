// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "../types/Random.sol";

/// @dev Adapted form Openzeppelin's { Arrays } library. Uses and array of {Random} structs and works with exclusive upper bound instead of inclusive.
library RandomArray {
    /**
     * @dev Adapted form Openzeppelin's { findUpperBound } function.
     */
    function findUpperBound(Random[] storage array, uint256 timestamp) internal view returns (Random memory _random) {
        uint256 high = array.length;
        unchecked{
            if (high == 0 || timestamp >= array[high - 1].timestamp) {
                return _random;
            }
        }

        uint256 low;
        while (low < high) {
            uint256 mid = Math.average(low, high);

            // Note that mid will always be strictly less than high (i.e. it will be a valid array index)
            // because Math.average rounds down (it does integer division with truncation).
            if (array[mid].timestamp > timestamp) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        // At this point `low` is the exclusive upper bound.
        _random = array[low];
    }
}