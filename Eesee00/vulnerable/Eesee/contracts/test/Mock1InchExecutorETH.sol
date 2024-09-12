// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Mock1InchExecutorETH {
    receive() external payable {

    }
    function execute(address msgSender, bytes memory data, uint256 amount) external payable {
        uint256 _amount = abi.decode(data, (uint256));
        if(_amount > 0){
            (bool success, ) = msg.sender.call{value: _amount}("");
            require(success, "Failed to send Ether");
            return;
        }
        (bool _success, ) = msg.sender.call{value: amount*(10**10)}("");
        require(_success, "Failed to send Ether");
    }
}