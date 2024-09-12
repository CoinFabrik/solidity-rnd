const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');
  const assert = require("assert");
  const { getContractAddress } = require('@ethersproject/address')
  describe("eeseeNFTDrop", function () {
    const presaleStages = [
        {
            duration: 86400,
            perAddressMintLimit: 0,
            allowListMerkleRoot: '' // adds merkle root in befor all hook
        },
        {
            duration: 86400,
            perAddressMintLimit: 5,
            allowListMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
        },
        {
            duration: 86400,
            perAddressMintLimit: 0,
            allowListMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
        },
        {
            duration: 86400,
            perAddressMintLimit: 0,
            allowListMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
        },
        {
            duration: 86400,
            perAddressMintLimit: 0,
            allowListMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
        }
    ]
    const presalesDuration0 = [
        {
            duration: 0,
            perAddressMintLimit: 0,
            allowListMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
        }
    ]
    const getProof = (tree, address) => {
        let proof = null
        for (const [i, v] of tree.entries()) {
            if (v[0] === address) {
                proof = tree.getProof(i);
              }
        }
        return proof
    }
    let ESE;
    let eeseeNFTDrop;
    let signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, feeCollector, royaltyCollector;
    let currentTimestamp;
    let merkleTreeOfPresale1;
    let mockVRF;
    let eeseeRandom;
    let leaves = []
    //after one year
    const timeNow = Math.round((new Date()).getTime() / 1000);
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const oneAddress = "0x0000000000000000000000000000000000000001"
  
    this.beforeAll(async() => {
        [signer, acc2, acc3, acc4, acc5, acc6, acc7, earningsCollector, feeCollector, royaltyCollector] = await ethers.getSigners()
        ticketBuyers = [acc2,acc3, acc4, acc5, acc6,  acc7]
        const _mockVRF = await hre.ethers.getContractFactory("MockVRFCoordinator");
        const _eeseeRandom = await hre.ethers.getContractFactory("EeseeRandom");
        const _ESE = await hre.ethers.getContractFactory("ESE");
        const _eeseeNFTDrop = await hre.ethers.getContractFactory("EeseeNFTDrop")
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");

        let accessManager = await _eeseeAccessManager.deploy();
        await accessManager.deployed()

        ESE = await _ESE.deploy([{
                cliff: 0,
                duration: 0,
                TGEMintShare: 10000
            }
        ])
        await ESE.deployed()
        await ESE.addVestingBeneficiaries(0, [{addr: signer.address, amount: '1000000000000000000000000'}])
        await ESE.initialize()

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

        currentTimestamp = (await ethers.provider.getBlock()).timestamp;
        for (let j = 0; j < 9; j ++) {
            const wallet = ethers.Wallet.createRandom().connect(ethers.provider)
            leaves.push([
                wallet.address
            ])
        }
        leaves.push([acc2.address])
        merkleTreeOfPresale1 = StandardMerkleTree.of(leaves, ['address'])
        presaleStages[0].allowListMerkleRoot = merkleTreeOfPresale1.root
        eeseeNFTDrop = await _eeseeNFTDrop.deploy()
        await eeseeNFTDrop.deployed()
        await eeseeNFTDrop.initialize(
            {
                name: 'ABCDFG',
                symbol: 'ABC',
                baseURI: 'base/',
                revealedURI: "revealedURI/",
                contractURI: '/',
                royaltyReceiver: royaltyCollector.address, 
                royaltyFeeNumerator: 300,
            },
            35, 
            currentTimestamp + 86400,
            presaleStages,
            eeseeRandom.address, 
            signer.address,
            zeroAddress
        )
        await eeseeRandom["performUpkeep(bytes)"]("0x")
        await mockVRF.fulfillWords(0, {gasLimit: '30000000'})
    })

    it('Options are set correctly', async () => {
        assert.equal(await eeseeNFTDrop.supportsInterface('0x5b5e139f'), true)//metadata
        assert.equal(await eeseeNFTDrop.supportsInterface('0x80ac58cd'), true)//erc721
        assert.equal(await eeseeNFTDrop.supportsInterface('0x2a55205a'), true)//ERC2981
        assert.equal(await eeseeNFTDrop.supportsInterface('0x00000000'), false)
        let timePassed = ethers.BigNumber.from(currentTimestamp).add(ethers.BigNumber.from(86400))
        for(let i = 0; i < presaleStages.length; i++){
            const presaleStageInfo = await eeseeNFTDrop.stages(i)
            Object.keys(presaleStages[i]).forEach((presaleStageKey) => {
                assert.equal(presaleStages[i][presaleStageKey].toString(), presaleStageInfo.stageOptions[presaleStageKey].toString(), `Presale option ${presaleStageKey} is correct.`)
            })
            assert.equal(presaleStageInfo.startTimestamp.toString(), timePassed.toString(), `Presale ${i} start timestamp is correct`)
            timePassed = timePassed.add(presaleStageInfo.stageOptions.duration)
            timePassed = timePassed
        }
        assert.equal(await eeseeNFTDrop.minter(), signer.address)

        await expect(eeseeNFTDrop.initialize({
                name: 'ABCDFG',
                symbol: 'ABC',
                baseURI: 'base/',
                revealedURI: "revealedURI/",
                contractURI: '/',
                royaltyReceiver: royaltyCollector.address, 
                royaltyFeeNumerator: 300,
            },
            35, 
            currentTimestamp + 86400,
            presaleStages,
            eeseeRandom.address, 
            signer.address,
            zeroAddress)).to.be.revertedWith("Initializable: contract is already initialized")
            await expect(eeseeNFTDrop.tokenURI(2)).to.be.revertedWithCustomError(eeseeNFTDrop, "URIQueryForNonexistentToken")
    })
    it('Can\'t mint if it hasn\'t started yet.', async () => {
        await expect(eeseeNFTDrop.connect(signer).mint(acc2.address, 10, []))
        .to.be.revertedWithCustomError(eeseeNFTDrop, 'MintingNotStarted')
        assert.equal(await eeseeNFTDrop.getSaleStage(), 5, "getSaleStage is correct")
    })
    it('Can mint in presale stage if in allowlist', async () => {
        // Presale 1
        await time.increase(86401)
        const invalidMerkleTree = StandardMerkleTree.of([...leaves, [acc3.address]], ['address'])
        await expect(eeseeNFTDrop.connect(signer).mint(acc3.address, 10, getProof(invalidMerkleTree, acc3.address)))
        .to.be.revertedWithCustomError(eeseeNFTDrop, 'InvalidProof')
        await expect(eeseeNFTDrop.connect(signer).mint(acc2.address,10, getProof(merkleTreeOfPresale1, acc2.address)))
        .to.emit(eeseeNFTDrop, "Transfer")
        .withArgs('0x0000000000000000000000000000000000000000', acc2.address, 1)
        .to.emit(eeseeNFTDrop, "Transfer")
        .withArgs('0x0000000000000000000000000000000000000000', acc2.address, 10)
        assert.equal(await eeseeNFTDrop.getSaleStage(), 0, "getSaleStage is correct")
    })
    it('Can\'t mint more than per address limit', async () => {
        // Presale 2
        await time.increase(86401)
        await expect(eeseeNFTDrop.connect(signer).mint(acc3.address, 10, []))
        .to.be.revertedWithCustomError(eeseeNFTDrop, 'MintLimitExceeded')
        await expect(eeseeNFTDrop.connect(signer).mint(acc3.address, 5, []))
        .to.emit(eeseeNFTDrop, "Transfer")
        .withArgs('0x0000000000000000000000000000000000000000', acc3.address, 11)
        .to.emit(eeseeNFTDrop, "Transfer")
        .withArgs('0x0000000000000000000000000000000000000000', acc3.address, 15)
        await expect(eeseeNFTDrop.connect(signer).mint(acc3.address, 1, []))
        .to.be.revertedWithCustomError(eeseeNFTDrop, 'MintLimitExceeded')
        await expect(eeseeNFTDrop.connect(signer).mint(acc2.address, 5, []))
        .to.emit(eeseeNFTDrop, "Transfer")
        .withArgs('0x0000000000000000000000000000000000000000', acc2.address, 16)
        .to.emit(eeseeNFTDrop, "Transfer")
        .withArgs('0x0000000000000000000000000000000000000000', acc2.address, 20)
        assert.equal(await eeseeNFTDrop.getSaleStage(), 1, "getSaleStage is correct")
    })
    it('Does not distributes tokenIDs if not finished', async () => {
        assert.equal(await eeseeNFTDrop.tokenURI(1), 'base/1')
        assert.equal(await eeseeNFTDrop.tokenURI(2), 'base/2')

        await eeseeRandom["performUpkeep(bytes)"]("0x")
        await mockVRF.fulfillWords(1, {gasLimit: '30000000'})

        assert.equal(await eeseeNFTDrop.tokenURI(1), 'base/1')
        assert.equal(await eeseeNFTDrop.tokenURI(2), 'base/2')
    })
    it('Can\'t mint more than mint limit', async () => {
        // Presale 3
        await time.increase(86401)
        assert.equal(await eeseeNFTDrop.getSaleStage(), 2, "getSaleStage is correct")
        // Public stage
        await time.increase(86401)
        assert.equal(await eeseeNFTDrop.getSaleStage(), 3, "getSaleStage is correct")
        await time.increase(86401)
        await expect(eeseeNFTDrop.connect(signer).mint(acc2.address, 36, []))
        .to.be.revertedWithCustomError(eeseeNFTDrop, 'MintLimitExceeded')
        await expect(eeseeNFTDrop.connect(signer).mint(acc2.address, 5, []))
        .to.emit(eeseeNFTDrop, "Transfer")
        .withArgs('0x0000000000000000000000000000000000000000', acc2.address, anyValue)
        .to.emit(eeseeNFTDrop, "Transfer")
        .withArgs('0x0000000000000000000000000000000000000000', acc2.address, anyValue)
        assert.equal(await eeseeNFTDrop.getSaleStage(), 4, "getSaleStage is correct")
    })
    it('Can\'t mint after mint ended', async () => {
        // Mint ended
        await time.increase(86401)
        assert.equal(await eeseeNFTDrop.getSaleStage(), 5, "getSaleStage is correct")
        await expect(eeseeNFTDrop.connect(signer).mint(acc2.address, 10, []))
        .to.be.revertedWithCustomError(eeseeNFTDrop, 'MintingEnded')
    })
    
    it('Distributes tokenIDs', async () => {
        assert.equal(await eeseeNFTDrop.tokenURI(1), 'base/1')
        assert.equal(await eeseeNFTDrop.tokenURI(2), 'base/2')

        await eeseeRandom["performUpkeep(bytes)"]("0x")
        await mockVRF.fulfillWords(2, {gasLimit: '30000000'})

        assert.equal(await eeseeNFTDrop.tokenURI(1), `revealedURI/${1+2}`)
        assert.equal(await eeseeNFTDrop.tokenURI(2), `revealedURI/${2+2}`)

        assert.equal(await eeseeNFTDrop.tokenURI(23), `revealedURI/${0}`)//23+2 = 25 % 25 = 0
        assert.equal(await eeseeNFTDrop.tokenURI(24), `revealedURI/${1}`)//24+2 = 26 % 25 = 1
    })

    it('Can transfer', async () => {
        await expect(eeseeNFTDrop.connect(acc2).transferFrom(acc2.address, signer.address, 1)).to.emit(eeseeNFTDrop, "Transfer")
        .withArgs(acc2.address, signer.address, 1)
    })

    it('Cant mint if not minter', async () => {
        await expect(eeseeNFTDrop.connect(acc2).mint(acc2.address, 5, [])).to.be.revertedWith("Caller is not the minter")
    })

    it('Royalty info is correct', async () => {
        for(let i = 1 ; i <= 35; i ++ ){ 
            const royaltyInfo = await eeseeNFTDrop.royaltyInfo(i, 100)
            assert.equal(royaltyInfo[0].toString(), royaltyCollector.address, 'Royalty address reciever is correct')
            assert.equal(royaltyInfo[1].toString(), '3', 'Royalty amount is correct')
        }
    })

    it('initializer reverts', async () => {
        const _eeseeNFTDrop = await hre.ethers.getContractFactory("EeseeNFTDrop")
        currentTimestamp = (await ethers.provider.getBlock()).timestamp;

        eeseeNFTDrop = await _eeseeNFTDrop.deploy()
        await expect(eeseeNFTDrop.initialize(
            {
                name: 'ABCDFG',
                symbol: 'ABC',
                baseURI: '/',
                revealedURI: "revealedURI/",
                contractURI: '/',
                royaltyReceiver: royaltyCollector.address, 
                royaltyFeeNumerator: 300,
            },
            35, 
            currentTimestamp - 86400,
            presaleStages,
            eeseeRandom.address, 
            signer.address,
            zeroAddress
        )).to.be.revertedWithCustomError(_eeseeNFTDrop, 'MintTimestampNotInFuture')

        await expect(eeseeNFTDrop.initialize(
            {
                name: 'ABCDFG',
                symbol: 'ABC',
                baseURI: '/',
                revealedURI: "revealedURI/",
                contractURI: '/',
                royaltyReceiver: royaltyCollector.address, 
                royaltyFeeNumerator: 300,
            },
            35, 
            currentTimestamp + 86400,
            presalesDuration0,
            eeseeRandom.address, 
            signer.address,
            zeroAddress
        )).to.be.revertedWithCustomError(_eeseeNFTDrop, 'ZeroSaleStageDuration')
        await expect(eeseeNFTDrop.initialize(
            {
                name: 'ABCDFG',
                symbol: 'ABC',
                baseURI: '/',
                revealedURI: "revealedURI/",
                contractURI: '/',
                royaltyReceiver: royaltyCollector.address, 
                royaltyFeeNumerator: 300,
            },
            35, 
            currentTimestamp + 86400,
            [...presaleStages, presaleStages[0]],
            eeseeRandom.address, 
            signer.address,
            zeroAddress
        )).to.be.revertedWithCustomError(_eeseeNFTDrop, 'PresaleStageLimitExceeded')

        await expect(eeseeNFTDrop.initialize(
            {
                name: 'ABCDFG',
                symbol: 'ABC',
                baseURI: '/',
                revealedURI: "revealedURI/",
                contractURI: '/',
                royaltyReceiver: royaltyCollector.address, 
                royaltyFeeNumerator: 300,
            },
            35, 
            currentTimestamp + 86400,
            [],
            eeseeRandom.address, 
            signer.address,
            zeroAddress
        )).to.be.revertedWithCustomError(_eeseeNFTDrop, 'PresaleStageLimitExceeded')
    })
    it('tokenURI with null strings', async () => {
        currentTimestamp = (await ethers.provider.getBlock()).timestamp;

        await expect(eeseeNFTDrop.initialize(
            {
                name: 'ABCDFG',
                symbol: 'ABC',
                baseURI: '',
                revealedURI: "",
                contractURI: '/',
                royaltyReceiver: zeroAddress, //0
                royaltyFeeNumerator: 300,
            },
            35, 
            currentTimestamp + 5,
            [{
                duration: 86400,
                perAddressMintLimit: 0,
                allowListMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
            }],
            eeseeRandom.address, 
            signer.address,
            zeroAddress
        )).to.not.be.reverted

        await time.increase(10)

        await eeseeNFTDrop.connect(signer).mint(acc2.address, 1, [])
        assert.equal(await eeseeNFTDrop.tokenURI(1), '', "tokenURI is correct")

        await time.increase(86400)

        await eeseeRandom["performUpkeep(bytes)"]("0x")
        await mockVRF.fulfillWords(3, {gasLimit: '30000000'})
        assert.equal(await eeseeNFTDrop.tokenURI(1), '', "tokenURI is correct")
    })
});
