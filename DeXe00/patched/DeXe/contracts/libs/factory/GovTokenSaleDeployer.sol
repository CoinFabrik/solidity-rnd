// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Create2.sol";

import "../../gov/ERC20/ERC20Sale.sol";

library GovTokenSaleDeployer {
    function deployToken(
        address poolProxy,
        address tokenSaleProxy,
        bytes32 salt,
        ERC20Sale.ConstructorParams calldata tokenParams
    ) external returns (address) {
        ERC20Sale token = new ERC20Sale{salt: salt}();

        token.__ERC20Sale_init(poolProxy, tokenSaleProxy, tokenParams);

        return address(token);
    }

    function predictTokenAddress(bytes32 salt) external view returns (address) {
        bytes32 bytecodeHash = keccak256(type(ERC20Sale).creationCode);

        return Create2.computeAddress(salt, bytecodeHash);
    }
}
