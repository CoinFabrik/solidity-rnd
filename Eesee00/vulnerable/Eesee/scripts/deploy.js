// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { network, run, ethers } = require("hardhat");
const { getContractAddress } = require('@ethersproject/address')

var i = 0
async function verify(contract, constructorArguments, name){
    console.log('...Deploying ' + name)
    await contract.deployTransaction.wait(4);
    console.log('...Verifying on block explorer ' + name)
    try {
        await run("verify:verify", {
            address: contract.address,
            constructorArguments: constructorArguments,
            contract: name
        })
    } catch (error) {
        console.log(error)
    }
    console.log(i)
    i = i + 1
}
async function main() {
    const [signer] = await ethers.getSigners();

    const _AssetTransfer = await hre.ethers.getContractFactory("AssetTransfer");
    const assetTransfer = await _AssetTransfer.deploy()
    await verify(assetTransfer, [], "contracts/libraries/AssetTransfer.sol:AssetTransfer")

    const ESE = await ethers.getContractFactory("ESE");
    const accessManager = await ethers.getContractFactory("EeseeAccessManager");
    const minter = await ethers.getContractFactory("EeseeMinter");
    const eeseeRandom = await ethers.getContractFactory("EeseeRandom");
    const pool = await ethers.getContractFactory("EeseeMining");
    const eeseeNFTDrop = await ethers.getContractFactory("EeseeNFTDrop");
    const eeseeNFTLazyMint = await ethers.getContractFactory("EeseeNFTLazyMint");
    const eesee = await ethers.getContractFactory("Eesee", {libraries: { AssetTransfer: assetTransfer.address }});
    const swap = await ethers.getContractFactory("EeseeSwap");
    const eeseeDrops = await ethers.getContractFactory("EeseeDrops");
    const staking = await ethers.getContractFactory("EeseeStaking");
    const feeSplitter = await ethers.getContractFactory("EeseeFeeSplitter");
    const paymaster = await ethers.getContractFactory("EeseePaymaster");
    const Mock1InchExecutor = await ethers.getContractFactory("Mock1InchExecutor");
    const Mock1InchRouter = await ethers.getContractFactory("Mock1InchRouter");
    const eeseeOpenseaRouter = await ethers.getContractFactory("EeseeOpenseaRouter");
    const eeseeRaribleRouter = await ethers.getContractFactory("EeseeRaribleRouter");
    const eesee1inch = await ethers.getContractFactory("EeseePeriphery"); 

    let args

    let oneInchRouter
    let trustedForwarder
    let relayHub
    let royaltyEngine
    let vrfCoordinator
    let keyHash
    let minimumRequestConfirmations
    let callbackGasLimit
    let mock1InchExecutor
    let seaport
    let exchangeV2Core
    if(network.name === 'goerli'){
        const transactionCount = await signer.getTransactionCount()
        const futureESE = getContractAddress({
            from: signer.address,
            nonce: transactionCount + 2
        })
        //goerli testnet
        args = [futureESE]
        mock1InchExecutor = await Mock1InchExecutor.deploy(...args);
        await verify(mock1InchExecutor, args, "contracts/test/Mock1InchExecutor.sol:Mock1InchExecutor")

        const mock1InchRouter = await Mock1InchRouter.deploy();
        await verify(mock1InchRouter, [], "contracts/test/Mock1InchRouter.sol:Mock1InchRouter")

        oneInchRouter = mock1InchRouter.address
        trustedForwarder = '0xB2b5841DBeF766d4b521221732F9B618fCf34A87'
        relayHub = '0x7DDa9Bf2C0602a96c06FA5996F715C7Acfb8E7b0'
        royaltyEngine = '0xEF770dFb6D5620977213f55f99bfd781D04BBE15'
        vrfCoordinator = '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D'
        keyHash = '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15'//150 gwei hash
        minimumRequestConfirmations = 3
        callbackGasLimit = 100000

        seaport = '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC'
        exchangeV2Core = '0x02afbD43cAD367fcB71305a2dfB9A3928218f0c1'
    }else if(network.name === 'ethereum'){
        oneInchRouter = '0x1111111254eeb25477b68fb85ed929f73a960582'
        trustedForwarder = '0xB2b5841DBeF766d4b521221732F9B618fCf34A87'
        relayHub = '0x8f812FAE28a3Aa634d97659091D6540FABD234F5'
        royaltyEngine = '0x0385603ab55642cb4Dd5De3aE9e306809991804f'
        vrfCoordinator = '0x271682DEB8C4E0901D1a1550aD2e64D568E69909'
        keyHash = '0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef'//200 gwei hash
        minimumRequestConfirmations = 13
        callbackGasLimit = 100000

        seaport = "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC"
        exchangeV2Core = '0x9757F2d2b135150BBeb65308D4a91804107cd8D6'
    }else if(network.name === 'polygon'){
        oneInchRouter = '0x1111111254eeb25477b68fb85ed929f73a960582'
        trustedForwarder = '0xB2b5841DBeF766d4b521221732F9B618fCf34A87'
        relayHub = '0xfCEE9036EDc85cD5c12A9De6b267c4672Eb4bA1B'
        royaltyEngine = '0x28EdFcF0Be7E86b07493466e7631a213bDe8eEF2'
        vrfCoordinator = '0xAE975071Be8F8eE67addBC1A82488F1C24858067'
        keyHash = '0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93'//200 gwei hash
        minimumRequestConfirmations = 13
        callbackGasLimit = 100000
        seaport = '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC'
        exchangeV2Core = '0x12b3897a36fDB436ddE2788C06Eff0ffD997066e'
    }else{
        return
    }

    const _eeseeOpenseaRouter = await eeseeOpenseaRouter.deploy(seaport)
    await verify(_eeseeOpenseaRouter, [seaport], "contracts/periphery/routers/EeseeOpenseaRouter.sol:EeseeOpenseaRouter")
    const _eeseeRaribleRouter = await eeseeRaribleRouter.deploy(exchangeV2Core)
    await verify(_eeseeRaribleRouter, [exchangeV2Core], "contracts/periphery/routers/EeseeRaribleRouter.sol:EeseeRaribleRouter")

    const _accessManager = await accessManager.deploy()
    await verify(_accessManager, [], "contracts/admin/EeseeAccessManager.sol:EeseeAccessManager")

    const _eeseeNFTDrop = await eeseeNFTDrop.deploy()
    await verify(_eeseeNFTDrop, [], "contracts/NFT/EeseeNFTDrop.sol:EeseeNFTDrop")
    const _eeseeNFTLazyMint = await eeseeNFTLazyMint.deploy()
    await verify(_eeseeNFTLazyMint, [], "contracts/NFT/EeseeNFTLazyMint.sol:EeseeNFTLazyMint")


    args = [
        {
            vrfCoordinator,
            keyHash,
            minimumRequestConfirmations,
            callbackGasLimit
        },
        _accessManager.address
    ]
    const _eeseeRandom = await eeseeRandom.deploy(...args)
    await verify(_eeseeRandom, args, "contracts/random/EeseeRandom.sol:EeseeRandom")

    let month = 60*60*24*365/12
    args = [
        [{//presale
            cliff: month*6,
            duration: month*18,
            TGEMintShare: 1000
        },
        {//private sale
            cliff: month*6,
            duration: month*18,
            TGEMintShare: 1000
        },
        {//public sale
            cliff: month*2,
            duration: month*10,
            TGEMintShare: 1500
        },
        {//teamAndAdvisors
            cliff: month*10,
            duration: month*38,
            TGEMintShare: 10000
        },
        {//marketplaceMining
            cliff: 0,
            duration: month*70,
            TGEMintShare: 0
        },
        {//marketing and partnerships
            cliff: month*6,
            duration: month*36,
            TGEMintShare: 0
        },
        {//staking
            cliff: 0,
            duration: month*36,
            TGEMintShare: 0
        }]
    ]
    const _ESE = await ESE.deploy(...args)//0
    await verify(_ESE, args, "contracts/token/ESE.sol:ESE")
    

    args = [_ESE.address, _accessManager.address, trustedForwarder]
    const _pool = await pool.deploy(...args)//1
    await verify(_pool, args, "contracts/rewards/EeseeMining.sol:EeseeMining")


    args = [_eeseeNFTLazyMint.address, _eeseeNFTDrop.address, _eeseeRandom.address, trustedForwarder]
    const _minter = await minter.deploy(...args)//2
    await verify(_minter, args, "contracts/NFT/EeseeMinter.sol:EeseeMinter")


    args = [_ESE.address, oneInchRouter]
    const _swap = await swap.deploy(...args)//3
    await verify(_swap, args, "contracts/periphery/EeseeSwap.sol:EeseeSwap")


    args = [
        _ESE.address, 
        [
            {volumeBreakpoint: ethers.utils.parseEther('100'), rewardRateFlexible: ethers.utils.parseEther((0.12/31536000).toFixed(18)), rewardRateLocked: ethers.utils.parseEther((0.18/31536000).toFixed(18))},//1
            {volumeBreakpoint: ethers.utils.parseEther('250'), rewardRateFlexible: ethers.utils.parseEther((0.13/31536000).toFixed(18)), rewardRateLocked: ethers.utils.parseEther((0.19/31536000).toFixed(18))},//2
            {volumeBreakpoint: ethers.utils.parseEther('500'), rewardRateFlexible: ethers.utils.parseEther((0.14/31536000).toFixed(18)), rewardRateLocked: ethers.utils.parseEther((0.20/31536000).toFixed(18))},//3
            {volumeBreakpoint: ethers.utils.parseEther('1000'), rewardRateFlexible: ethers.utils.parseEther((0.15/31536000).toFixed(18)), rewardRateLocked: ethers.utils.parseEther((0.22/31536000).toFixed(18))},//4
            {volumeBreakpoint: ethers.utils.parseEther('2000'), rewardRateFlexible: ethers.utils.parseEther((0.16/31536000).toFixed(18)), rewardRateLocked: ethers.utils.parseEther((0.24/31536000).toFixed(18))},//5
            {volumeBreakpoint: ethers.utils.parseEther('6000'), rewardRateFlexible: ethers.utils.parseEther((0.18/31536000).toFixed(18)), rewardRateLocked: ethers.utils.parseEther((0.26/31536000).toFixed(18))},//6
            {volumeBreakpoint: ethers.utils.parseEther('15000'), rewardRateFlexible: ethers.utils.parseEther((0.20/31536000).toFixed(18)), rewardRateLocked: ethers.utils.parseEther((0.28/31536000).toFixed(18))},//7
            {volumeBreakpoint: ethers.utils.parseEther('40000'), rewardRateFlexible: ethers.utils.parseEther((0.22/31536000).toFixed(18)), rewardRateLocked: ethers.utils.parseEther((0.30/31536000).toFixed(18))},//8
            {volumeBreakpoint: ethers.utils.parseEther('100000'), rewardRateFlexible: ethers.utils.parseEther((0.24/31536000).toFixed(18)), rewardRateLocked: ethers.utils.parseEther((0.32/31536000).toFixed(18))},//9
            {volumeBreakpoint: ethers.utils.parseEther('1000000000000000000'), rewardRateFlexible:ethers.utils.parseEther((0.26/31536000).toFixed(18)), rewardRateLocked:ethers.utils.parseEther((0.35/31536000).toFixed(18))}//10
        ],
        _accessManager.address,
        trustedForwarder
    ]
    let _staking = await staking.deploy(...args)//4
    await verify(_staking, args, "contracts/rewards/EeseeStaking.sol:EeseeStaking")


    args = [
        _ESE.address, 
        [
            '0xEa6E311c2365F67218EFdf19C6f24296cdBF0058',//company //TODO:
            _pool.address, //mining
            '0xA7b7DDF752Ed3A9785F747a3694760bB8994e15F',//dao//TODO:
            _staking.address//stakingPool
        ],
        [
            5,
            3,
            1,
            1
        ]
    ]
    let _feeSplitter = await feeSplitter.deploy(...args)//5
    await verify(_feeSplitter, args, "contracts/admin/EeseeFeeSplitter.sol:EeseeFeeSplitter")


    args = [
        _ESE.address, 
        _staking.address,
        _swap.address,
        _minter.address,
        _eeseeRandom.address,
        _feeSplitter.address, 
        royaltyEngine,
        _accessManager.address,
        trustedForwarder
    ]
    const _eesee = await eesee.deploy(...args)
    await verify(_eesee, args, "contracts/marketplace/Eesee.sol:Eesee")


    args = [
        _ESE.address, 
        _feeSplitter.address, 
        _minter.address, 
        _staking.address, 
        _accessManager.address, 
        trustedForwarder
    ]
    const _eeseeDrops = await eeseeDrops.deploy(...args)
    await verify(_eeseeDrops, args, "contracts/marketplace/EeseeDrops.sol:EeseeDrops")


    args = [
        _ESE.address, 
        relayHub,
        trustedForwarder, 
        _accessManager.address
    ]
    let _paymaster = await paymaster.deploy(...args)
    await verify(_paymaster, args, "contracts/periphery/EeseePaymaster.sol:EeseePaymaster")

    args = [
        _eesee.address, 
        _eeseeDrops.address,
        oneInchRouter,
        trustedForwarder
    ]
    let _eesee1inch = await eesee1inch.deploy(...args)
    await verify(_eesee1inch, args, "contracts/periphery/EeseePeriphery.sol:EeseePeriphery")

    await _staking.grantVolumeUpdater(_eesee.address)
    await _staking.grantVolumeUpdater(_eeseeDrops.address)

    await _paymaster.approveContract(_eesee.address)
    await _paymaster.approveContract(_eeseeDrops.address)
    await _paymaster.approveContract(_pool.address)
    await _paymaster.approveContract(_staking.address)
    await _paymaster.approveContract(_eesee1inch.address)

    //tx = await _ESE.addVestingBeneficiaries(0, []) //    await tx.wait()
    //tx = await _ESE.addVestingBeneficiaries(1, []) //     await tx.wait()
    //tx = await _ESE.addVestingBeneficiaries(2, []) //     await tx.wait()
    let tx = await _ESE.addVestingBeneficiaries(3, [{addr: signer.address, amount: '1000000000000000000000000000'}])
    await tx.wait()

    tx = await _ESE.addVestingBeneficiaries(4, [{addr: _pool.address, amount: '450000000000000000000000000'}])
    await tx.wait()
    //tx =  await _ESE.addVestingBeneficiaries(5, []) //     await tx.wait()
    tx = await _ESE.addVestingBeneficiaries(6, [{addr:_staking.address, amount: '80000000000000000000000000'}])
    await tx.wait()

    tx = await _ESE.initialize()
    await tx.wait()

    if(network.name === 'goerli'){
        await _ESE.transfer(mock1InchExecutor.address, '1000000000000000000000000')
        await _ESE.approve(_eesee.address, '1000000000000000000000000000000')
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
