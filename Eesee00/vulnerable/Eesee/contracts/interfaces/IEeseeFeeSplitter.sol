// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEeseeFeeSplitter {
    event PaymentReleased(address indexed to, uint256 amount);

    error InvalidESE();
    error InvalidLength();
    error InvalidPayee();
    error InvalidShare();
    error PayeeAlreadyInitialized();
    error NoShares();
    error InvalidShares();

    function ESE() external view returns (IERC20);

    function totalShares() external view returns (uint256);
    function totalReleased() external view returns (uint256);

    function shares(address) external view returns (uint256);
    function released(address) external view returns (uint256);
    function payees(uint256) external view returns (address);

    function release(address account) external returns(uint256 payment);
}
