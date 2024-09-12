const mainnetAddresses = require("../addresses/mainnet.json")
const goerliAddresses = require("../addresses/goerli.json")

const addresses =
	process.env.NETWORK === "mainnet" ? mainnetAddresses : goerliAddresses

const nftContracts = [
	addresses.SATE_NFT_ADDRESS,
	addresses.LMVX_NFT_ADDRESS,
	addresses.STLM_NFT_ADDRESS,
	addresses.STPAL_NFT_ADDRESS,
	addresses.STPN_NFT_ADDRESS
]

const nftLevels = [8, 4, 4, 2, 1]

// update this with deployed WarpedTokenManager contract address
const WarpedTokenManagerContractAddress =
	"0x55eFf57554295176438ceC16013e1E78bEAaA293"

// update this with WarpedTaxHandler contract address from the log of WarpedTokenManager contract deploy script
const WarpedTaxHandlerContractAddress =
	"0xcd08A345EDDdcC881E1a716495be1c110E39E2A7"

// update this with WarpedTreasuryHandler contract address from the log of WarpedTokenManager contract deploy script

const WarpedTreasuryHandlerContractAddress =
	"0x7d31cf7FdD5F15F1a9Ad69d17818716b7933f219"

module.exports = {
	mainnetAddresses,
	goerliAddresses,
	addresses,
	nftContracts,
	nftLevels,
	WarpedTokenManagerContractAddress,
	WarpedTaxHandlerContractAddress,
	WarpedTreasuryHandlerContractAddress
}
