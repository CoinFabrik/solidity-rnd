// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MockRecipient is ERC721Holder {
    receive() external payable {
        revert();
    }
}