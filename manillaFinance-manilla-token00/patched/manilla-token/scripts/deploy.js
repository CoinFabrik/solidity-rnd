// scripts/deploy.js
async function main() {
   const symbol = "MNLA"
   const name = "Manilla Finance"
   const adminAccount = "0x0Ad4ba864105B4bb4d2B532F88bB49808E748c74"
   const Manilla = await ethers.getContractFactory("Manilla");
   const amount = "1000000000000000000000000000"//1 * Math.pow(10, 27)
   const manilla = await Manilla.deploy(name, symbol, amount, adminAccount);
   await manilla.deployed();
 
   console.log("Manilla Token deployed to:", manilla.address);
   
 }
 
 main()
   .then(() => process.exit(0))
   .catch((error) => {
     console.error(error);
     process.exit(1);
   });

   // npx hardhat verify --network  0x9aaf75518A474378A85B710cC4b1923063008F28 "Manilla Finance" "MNLA" "1000000000000000000000000000" 0x0Ad4ba864105B4bb4d2B532F88bB49808E748c74
 