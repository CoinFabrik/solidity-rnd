# Manilla Token Smart Contract

This repository contains the smart contract implementation for the Manilla Token, an ERC20-compliant token built on the Ethereum blockchain.

## Getting Started

To use and deploy the Manilla Token smart contract, you can follow the steps below.

### Prerequisites

- Node.js and npm must be installed on your system.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/manilla-token.git


2. Navigate to the project directory:
   ```bash
   cd manilla-token

3. Install the required dependencies:
    ```bash
    npm install

### Environment Configuration
   To use the Manilla Token smart contract, you need to set up your environment by creating a `.env` file in the project directory with the following configuration:

    ```plaintext
    privateKey = YOUR_PRIVATE_KEY_HERE
    apiKey = YOUR_API_KEY_HERE
    testnet_url = YOUR_TESTNET_URL_HERE
    mainnet_url = YOUR_MAINNET_URL_HERE

### Execution
1. Smart Contract Compilation
    ```bash
    npm run compile:contract

2. Deploying to mainnet
    ```bash
    npm run deploy:mainnet

3. Deploying to testnet
    ```bash
    npm run deploy:testnet

4. Verification Mainnet
    ```bash
    npx hardhat verify --network mainnet {deployed mainnet token contract address} "Manilla Finance" "MNLA" "1000000000000000000000000000" {admin account}

5. Verification Testnet
    ```bash
    npx hardhat verify --network testnet {deployed token testnet contract address} "Manilla Finance" "MNLA" "1000000000000000000000000000" {admin account}


   






