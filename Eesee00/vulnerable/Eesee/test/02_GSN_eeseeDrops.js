const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers")
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const assert = require("assert");
  const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');
  const { getContractAddress } = require('@ethersproject/address')
  const { GsnTestEnvironment } = require("@opengsn/dev")
  const { RelayProvider } = require('@opengsn/provider')
  
  describe("eeseeDrops", function () {
    if(network.name != 'testnet') return
    let ESE;
    let ERC20;
    let signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector;
    let _signer
    let ticketBuyers;
    let minter
    let staking
    let eeseeDrops
    let signers
    let eeseeNFTDrop
    const zeroAddress = "0x0000000000000000000000000000000000000000"

    const getProof = (tree, address) => {
        let proof = null
        for (const [i, v] of tree.entries()) {
            if (v[0] === address) {
                proof = tree.getProof(i);
              }
        }
        return proof
    }
    this.beforeAll(async() => {
        let env = await GsnTestEnvironment.startGsn('localhost');

        [signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector] = await hre.ethers.getSigners()
        ticketBuyers = [acc2,acc3, acc4, acc5, acc6,  acc7]
        
        // Deploys
        const _mockVRF = await hre.ethers.getContractFactory("MockVRFCoordinator");
        const _eeseeRandom = await hre.ethers.getContractFactory("EeseeRandom");
        const _ESE = await hre.ethers.getContractFactory("ESE");
        const _MockERC20 = await hre.ethers.getContractFactory("MockERC20");
        const _NFT = await hre.ethers.getContractFactory("EeseeNFT");
        const _NFTDrop = await hre.ethers.getContractFactory("EeseeNFTDrop");
        const _NFTlazyMint = await hre.ethers.getContractFactory("EeseeNFTLazyMint");
        const _minter = await hre.ethers.getContractFactory("EeseeMinter");
        const _eeseeDrops = await hre.ethers.getContractFactory("EeseeDrops")
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");
        eeseeNFTDrop = await hre.ethers.getContractFactory("EeseeNFTDrop")

        let accessManager = await _eeseeAccessManager.deploy();
        await accessManager.deployed()

        ESE = await _ESE.deploy([{
                cliff: 0,
                duration: 0,
                TGEMintShare: 10000
            }
        ])

        await ESE.deployed()
        await ESE.addVestingBeneficiaries(0, [{addr: signer.address, amount: '2000000000000000000000000'}])
        await ESE.initialize()

        ERC20 = await _MockERC20.deploy('20000000000000000000000000000')
        await ERC20.deployed()

        mockVRF = await _mockVRF.deploy()
        await mockVRF.deployed()
        
        eeseeRandom = await _eeseeRandom.deploy(
            {
                vrfCoordinator: mockVRF.address,
                keyHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                minimumRequestConfirmations: 1,
                callbackGasLimit: 100000
            },
            accessManager.address
        )
        await eeseeRandom.deployed()
        // PERFORM_UPKEEP_ROLE
        await accessManager.grantRole('0x2a2c268c7cd0f39b7cc90b7a2a94e8493b3e1a763a91e9860bf316284c8e155f', signer.address)

        const NFTDrop = await _NFTDrop.deploy()
        const NFTLazyMint = await _NFTlazyMint.deploy()
        minter = await _minter.deploy(NFTLazyMint.address, NFTDrop.address, eeseeRandom.address, env.contractsDeployment.forwarderAddress)
        await minter.deployed()

        staking = await _eeseeStaking.deploy(
            ESE.address, 
            [{volumeBreakpoint: 500, rewardRateFlexible: 500000, rewardRateLocked: 500000}], 
            accessManager.address,
            env.contractsDeployment.forwarderAddress
        )
        await staking.deployed()

        eeseeDrops = await _eeseeDrops.deploy(
            ESE.address,
            feeCollector.address,
            minter.address,
            staking.address,
            accessManager.address,
            env.contractsDeployment.forwarderAddress
        )
        await eeseeDrops.deployed()

        await staking.grantVolumeUpdater(eeseeDrops.address)

        for (let i = 0; i < ticketBuyers.length; i++) {
            await ESE.transfer(ticketBuyers[i].address, '10000000000000000000000')
            await ESE.connect(ticketBuyers[i]).approve(eeseeDrops.address, '10000000000000000000000')
        }

        await ESE.transfer(acc8.address, '100000000000000000000')
        await ESE.connect(acc8).approve(eeseeDrops.address, '100000000000000000000')

        // GSN
        let gsnProvider = RelayProvider.newProvider({
            provider: hre.ethers.provider, 
            config: {
                chainId: 31337,
                verbose: false,
                loggerConfiguration: { logLevel: 'error'},
                forwarderAddress: env.contractsDeployment.forwarderAddress,
                paymasterAddress: env.contractsDeployment.paymasterAddress,
                auditorsCount: 0
            }
        })
        await gsnProvider.init()
                
        const accounts = []
        const _signers = await hre.ethers.getSigners()
        for (let i = 0; i < _signers.length; i++) {
            accounts[i] = _signers[i].address
        }
        const etherProvider = new ethers.providers.Web3Provider(gsnProvider)

        let rest
        signers = await Promise.all(accounts.map(async (val) => {
            const obj = await SignerWithAddress.create(etherProvider.getSigner(val))
            return obj
        }));
        [signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector, ...rest] = signers;
        ticketBuyers = [acc2, acc3, acc4, acc5, acc6, acc7];
        [_signer, _acc2, _acc3, _acc4, _acc5, _acc6, _acc7, _acc8, _acc9, _feeCollector, ...rest] = _signers;
        console.log('FIN')
    })
    it('drops', async () => {
        await eeseeDrops.connect(signer).changeFee('1000')
        const leaves = []
        leaves.push([acc2.address])
        leaves.push([acc3.address])
        leaves.push([acc8.address])
        merkleTree = StandardMerkleTree.of(leaves, ['address'])
        const presaleStages = [
            {
                name: 'Presale Stage 1',
                mintFee: 0,
                duration: 86400,
                perAddressMintLimit: 5,
                allowListMerkleRoot: merkleTree.root
            },
            {
                name: 'Presale Stage 2',
                mintFee: ethers.utils.parseUnits('0.02', 'ether'),
                duration: 86400,
                perAddressMintLimit: 5,
                allowListMerkleRoot: merkleTree.root
            },
            {
                name: 'Public Stage',
                mintFee: ethers.utils.parseUnits('0.03', 'ether'),
                duration: 86400,
                perAddressMintLimit: 0,
                allowListMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
            }
        ]

        let tx = await eeseeDrops.connect(acc8).listDrop(
            {
                name: "apes",
                symbol:"bayc",
                baseURI: "base/",
                revealedURI: "revealed/",
                contractURI:'contract/',
                royaltyReceiver: acc8.address,
                royaltyFeeNumerator: 300
            },
            presaleStages,
            [0, ethers.utils.parseUnits('0.02', 'ether'), ethers.utils.parseUnits('0.03', 'ether')],
            10,
            await time.latest() + 100,
            acc8.address,
        )
        let receipt = await tx.wait()
        let args = receipt.events.filter((x)=>{ return x.event=='ListDrop' })[0].args
        assert.equal(args[0].toString(), '0', "ID is correct")
        assert.equal(args[2].toString(), acc8.address.toString(), "signer is correct")

        const ID = 0
        const listing = await eeseeDrops.drops(ID);
        assert.equal(listing.earningsCollector, acc8.address, "earningsCollector is correct")
        assert.equal(listing.fee.toString(), (await eeseeDrops.fee()).toString(), "Fee is correct")

        assert.equal(await eeseeDrops.getDropsLength(), 1, "Length is correct")

        await expect(eeseeDrops.connect(acc2).mintDrops(
            [0], [2], [getProof(merkleTree, acc2.address)], acc2.address, '0x'
        )).to.be.revertedWithCustomError(eeseeNFTDrop, "MintingNotStarted")
    })

    it('presale 1', async () => {
        await time.increase(100)
        let balanceBefore = await ESE.balanceOf(acc2.address)
        let collectorBalanceBefore = await ESE.balanceOf(acc8.address)
        let feeBalanceBefore = await ESE.balanceOf(feeCollector.address)

        const tx = await eeseeDrops.connect(acc3).mintDrops(
            [0], [2], [getProof(merkleTree, acc3.address)], acc3.address, '0x'
        )
        const receipt = await tx.wait()
        const args = receipt.events.filter((x)=>{ return x.event=='MintDrop' })[0].args
        assert.equal(args[0].toString(), '0', "ID is correct")
        assert.equal(args[2].toString(), acc3.address.toString(), "signer is correct")
        assert.equal(args[3].toString(), '1', "correct")
        assert.equal(args[4].toString(), '2', "correct")
        assert.equal(args[5].toString(), '0', "correct")

        let balanceAfter = await ESE.balanceOf(acc2.address)
        let collectorBalanceAfter = await ESE.balanceOf(acc8.address)
        let feeBalanceAfter = await ESE.balanceOf(feeCollector.address)

        assert.equal(await staking.volume(acc2.address), 0, "Volume is correct")
        assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), 0, "Price paid is correct")
        assert.equal(BigInt(collectorBalanceBefore) - BigInt(collectorBalanceAfter), 0, "Amount collected is correct")
        assert.equal(BigInt(feeBalanceBefore) - BigInt(feeBalanceAfter), 0, "Fee is correct")

        const invalidMerkleTree = StandardMerkleTree.of([[acc4.address]], ['address'])
        await expect(eeseeDrops.connect(acc4).mintDrops(
            [0], [2], [getProof(invalidMerkleTree, acc4.address)], acc4.address, '0x'
        )).to.be.revertedWithCustomError(eeseeNFTDrop, "InvalidProof")
    })

    it('admin', async () => {
        let newValue = 1
        const fee = await eeseeDrops.fee() 
        await expect(eeseeDrops.connect(acc2).changeFee(newValue)).to.be.revertedWithCustomError(eeseeDrops, "CallerNotAuthorized")
        await expect(eeseeDrops.connect(signer).changeFee('10001')).to.be.revertedWithCustomError(eeseeDrops, "FeeTooHigh")
        await expect(eeseeDrops.connect(_signer).changeFee(newValue))
        .to.emit(eeseeDrops, "ChangeFee")
        .withArgs(fee, newValue)
        assert.equal(newValue, await eeseeDrops.fee(), "fee has changed")
    })
})