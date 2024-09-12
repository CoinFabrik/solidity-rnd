const DeedzCoin = artifacts.require("DeedzCoin");

module.exports = function (deployer) {
  // Deploy the DeedzCoin contract
  deployer.deploy(DeedzCoin, "0x71B830bb34a289eAbA80F285fe8625E4C69Db50C").then(() => {
    // Additional tasks after deployment (e.g., interacting with the contract)
    // ...
  });
};
