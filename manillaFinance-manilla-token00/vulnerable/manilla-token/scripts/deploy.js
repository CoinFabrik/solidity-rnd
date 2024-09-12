// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const ethers  = require("ethers")
async function main() {
  const tokenName  = "Manilla Finance"
  const tokenSymbol = "MNLA"
  const adminAccount = "0x161e1BA0b5884A8331D497d7f5a398688D309f62"
  const amount = "1000000000000000000000000000"
  const manillaContract = await hre.ethers.getContractFactory("Manilla");
  const manilla = await manillaContract.deploy(tokenName, tokenSymbol, ethers.BigNumber.from(amount), adminAccount);

  await manilla.deployed();

  console.log(
`Manilla Conract deployed to ${manilla.address}`
  );
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});