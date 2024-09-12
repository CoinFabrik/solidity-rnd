require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("solidity-coverage");

const secret =
  "0x046b78412f6091c160c10dbe7b36844f01b592c165d7e24c3164c950eb6596b6";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.18", // any version you want
    settings: {
      optimizer: { enabled: true, runs: 1000 },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: [secret],
      gas: "auto",
      gasPrice: 1000000000, // 1 gwei
      gasMultiplier: 1.5,
    },
    // rinkeby: {
    //   url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [secret],
    // },
    // ropsten: {
    //   url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [secret],
    // },
    // mainnet: {
    //   url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [secret],
    // },
  },
};
