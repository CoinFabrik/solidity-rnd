// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract Mock1InchExecutorWETH {
    IERC20 private immutable outToken;

    constructor(IERC20 _outToken){
        outToken = _outToken;
    }
    function execute(address msgSender, bytes memory data, uint256 amount) external payable {
        uint256 _amount = abi.decode(data, (uint256));
        if(_amount > 0){
            outToken.transfer(msg.sender, _amount);
            return;
        }
        outToken.transfer(msg.sender, amount*(10**10));
    }
}