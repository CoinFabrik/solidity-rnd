// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Token2 is ERC20 {
    constructor(
        address _founder,
        uint256 _initialSupply
    ) ERC20('Token2', 'T2') {
        _mint(_founder, _initialSupply);
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
