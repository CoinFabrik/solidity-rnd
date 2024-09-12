// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.21;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IEeseeFeeSplitter.sol";

/**
 * @title EeseeFeeSplitter
 * @dev This contract can be used when payments need to be received by a group
 * of contracts and split proportionately to some number of shares they own.
 * Addapted from Openzeppelin's PaymentSplitter.
 */
contract EeseeFeeSplitter is IEeseeFeeSplitter {
    using SafeERC20 for IERC20;

    ///@dev ESE token.
    IERC20 public immutable ESE;

    ///@dev Total shares from all payees.
    uint256 public immutable totalShares;
    ///@dev Total ESE tokens released.
    uint256 public totalReleased;

    ///@dev Payees' shares.
    mapping(address => uint256) public shares;
    ///@dev Payees' released ESE tokens.
    mapping(address => uint256) public released;
    ///@dev Payee accounts.
    address[] public payees;

    constructor(IERC20 _ESE, address[] memory _payees, uint256[] memory _shares) {
        if(address(_ESE) == address(0)) revert InvalidESE();

        uint256 payeesLength = _payees.length;
        if(payeesLength == 0 || payeesLength != _shares.length) revert InvalidLength();

        uint256 _totalShares;
        for (uint256 i = 0; i < payeesLength; i++) {
            address payee =_payees[i];
            uint256 share = _shares[i]; 

            if(payee == address(0)) revert InvalidPayee(); 
            if(share == 0) revert InvalidShare(); 
            if(shares[payee] != 0) revert PayeeAlreadyInitialized(); 
            
            payees.push(payee);
            shares[payee] = share;
            _totalShares += share;
        }

        // Note: Using high _totalShares might cause overflow, so we are limiting it to 10000.
        if(_totalShares > 10000) revert InvalidShares(); 
        totalShares = _totalShares;
        ESE = _ESE;
    }

    /**
     * @dev Release one of the payee's proportional payment.
     * @param account Whose payments will be released.
     */
    function release(address account) external returns(uint256 payment){
        if(shares[account] == 0) revert NoShares();

        uint256 _released = released[account];
        uint256 _totalReleased = totalReleased;

        unchecked{
            uint256 totalReceived = ESE.balanceOf(address(this)) + _totalReleased;
            payment = totalReceived * shares[account] / totalShares - _released;
            if(payment == 0) return 0;

            released[account] = _released + payment;
            totalReleased = _totalReleased + payment;
        }

        ESE.safeTransfer(account, payment);
        emit PaymentReleased(account, payment);
    }
}