// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

contract MockETHSender {
    receive() external payable {

    }

    function send(address to, uint256 amount) external{
        to.call{value:amount}("");
    }
}