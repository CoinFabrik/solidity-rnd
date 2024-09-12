require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config({path: "./.env"})

module.exports = {
  solidity: "0.8.4",
  networks: {
    testnet: {
      url: process.env.testnet_url,
      accounts: [process.env.privateKey]
    },
    mainnet: {
      url: process.env.mainnet_url,
      accounts: [process.env.privateKey]
  },
  },
  etherscan: {
    apiKey: process.env.apiKey,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
};