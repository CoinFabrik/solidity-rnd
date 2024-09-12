# DeedzCoin Smart Contract

The DeedzCoin smart contract is a decentralized application (DApp) written in Solidity, the programming language for Ethereum smart contracts. It serves as the underlying code for the DeedzCoin cryptocurrency, enabling token transfers and locking functionality.

# Specifications
### Project Overview
The Deedz Coin Smart Contract is designed to manage token locking functionality and extends the functionality of the ERC20, Ownable, and SupplierRole contracts. Its primary purpose is to provide a secure and flexible mechanism for locking and distributing tokens. This contract is essential for various use cases, including team token vesting, partnership lock-up agreements, and community token rewards, where tokens need to be locked for specific periods to achieve specific project objectives.

### Functional, Technical Details and Requirements
Functional and Technical Details can be found in the [Details.pdf](./docs/Details.pdf) document.

## Getting Started
```bash
# install dependencies
$ npm install

# run tests
$ npm run test
```

## Deployment
1. Deploy DeedzCoin on your Ethereum network.
2. Specify the initial supplier address during deployment.

## Usage
To use the DeedzCoin smart contract, follow these steps:

## Ownership
- The contract owner can transfer the supplier role.

## Token Transfers
- Users can transfer DeedzCoin tokens as per ERC-20 standards.

## Supplier Role and Token Locking
- **Supplier Role:** The contract introduces a "supplier" role with privileges for token management.
- **Token Locking:** The supplier role can lock tokens for specific reasons, amount, and duration..
- **Locking Enhancements:** Suppliers can extend lock durations with `extendLock` and increase locked token amounts  with `increaseLockAmount`.

Monitor events emitted by the contract to track token transfers and locking events.

## Tests
Tests are found in the `./test/` folder.

Tests Error Scenarios can be found in the [Test-Scenarios.pdf](./docs/Tests.pdf) document.

Both positive and negative cases are covered, and test coverage is 100%.

## Contracts
Solidity smart contracts are found in `./contracts/`.

## Deploy
Deploy script can be found in the `deploy.js` folder.

Rename `./.env.sample` to `./.env` in the project root.
To add the Supplier Address, assign the following variable
```
SUPPLIER_ADDRESS=...
```
example:
```bash
$ npm run deploy -- localhost
```

## License

The DeedzCoin smart contract is released under the MIT License.

## Acknowledgments

This smart contract was developed based on the OpenZeppelin framework, a widely adopted library for secure smart contract development on Ethereum.
