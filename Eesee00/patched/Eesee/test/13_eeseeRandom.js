const { expect } = require("chai");
const assert = require("assert");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, network } = require("hardhat");

describe("eeseeRandom", function () {
    let ERC20;
    let mockVRF;
    let signer, acc2, acc3
    let accessManager
    let eeseeRandom

    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const oneAddress = "0x0000000000000000000000000000000000000001"
    let snapshotId
    this.beforeAll(async() => {
        [signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector, royaltyCollector] = await ethers.getSigners()
        const _MockERC20 = await hre.ethers.getContractFactory("MockERC20");
        const _mockVRF = await hre.ethers.getContractFactory("MockVRFCoordinator");
        const _eeseeRandom = await hre.ethers.getContractFactory("EeseeRandom");
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");
        

        ERC20 = await _MockERC20.deploy('20000000000000000000000000000')
        await ERC20.deployed()

        mockVRF = await _mockVRF.deploy()
        await mockVRF.deployed()

        accessManager = await _eeseeAccessManager.connect(acc8).deploy();
        await accessManager.deployed()

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
        await accessManager.connect(acc8).grantRole('0x2a2c268c7cd0f39b7cc90b7a2a94e8493b3e1a763a91e9860bf316284c8e155f', signer.address)
    })

    it('calls performUpkeep', async () => {
        const timestamp = (await ethers.provider.getBlock()).timestamp
        await expect(eeseeRandom.connect(acc3)["performUpkeep(bytes)"]("0x00"))
        .to.emit(eeseeRandom, "RequestWords")
        .withArgs(0)

        await expect(mockVRF.fulfillWords(0)).to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)
        assert.notEqual((await eeseeRandom.random(0)).timestamp, 0, 'timestamp')
        assert.notEqual((await eeseeRandom.random(0)).timestamp, 0, 'timestamp')

        assert.equal((await eeseeRandom.getRandomFromTimestamp(timestamp)).timestamp.toString(), (await eeseeRandom.random(0)).timestamp.toString())
    })

    it('cannot call performUpkeep if time is not passed', async () => {
        await expect(eeseeRandom.connect(acc3)["performUpkeep(bytes)"]("0x00"))
        .to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
    })

    it('calls performUpkeep after time and getRandomFromTimestamp is ok', async () => {
        await time.increase(12*60*60)
        const timestamp1 = (await ethers.provider.getBlock()).timestamp
        assert.equal((await eeseeRandom.getRandomFromTimestamp(timestamp1)).timestamp.toString(), '0')
        await expect(eeseeRandom.connect(acc3)["performUpkeep(bytes)"]("0x00"))
        .to.emit(eeseeRandom, "RequestWords")
        .withArgs(1)
        await expect(mockVRF.fulfillWords(1)).to.emit(eeseeRandom, "FulfillRandomWords").withArgs(1)
        const timestamp2 = (await ethers.provider.getBlock()).timestamp
        assert.equal((await eeseeRandom.random(1)).timestamp, timestamp2, 'timestamp')
        assert.equal((await eeseeRandom.getRandomFromTimestamp(timestamp1)).timestamp.toString(), timestamp2, 'getRandomFromTimestamp is correct')
        assert.equal((await eeseeRandom.getRandomFromTimestamp(timestamp2)).timestamp.toString(), '0', 'getRandomFromTimestamp is correct')
    })

    it('can call performUpkeep if admin', async () => {
        await expect(eeseeRandom.connect(acc2)["performUpkeep()"]()).to.be.revertedWithCustomError(eeseeRandom, "CallerNotAuthorized")
        await expect(eeseeRandom.connect(acc3)["performUpkeep(bytes)"]("0x00"))
        .to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
        await expect(eeseeRandom.connect(signer)["performUpkeep()"]())
        .to.emit(eeseeRandom, "RequestWords")
        .withArgs(2)
    })

    it('changesAutomationInterval', async () => {
        await expect(eeseeRandom.connect(acc2).changeAutomationInterval('1')).to.be.revertedWithCustomError(eeseeRandom, "CallerNotAuthorized")
        await expect(eeseeRandom.connect(acc8).changeAutomationInterval(24*60*60 + 1)).to.be.revertedWithCustomError(eeseeRandom, "InvalidAutomationInterval")
        const newValue = 3600
        await expect(eeseeRandom.connect(acc8).changeAutomationInterval(newValue))
        .to.emit(eeseeRandom, "ChangeAutomationInterval")
        .withArgs(12*60*60, newValue)
        assert.equal(newValue, await eeseeRandom.automationInterval(), "automationInterval has changed")
    })

    it('changesCallbackGasLimit', async () => {
        await expect(eeseeRandom.connect(acc2).changeCallbackGasLimit('1')).to.be.revertedWithCustomError(eeseeRandom, "CallerNotAuthorized")
        
        const newValue = 1111111
        await expect(eeseeRandom.connect(acc8).changeCallbackGasLimit(newValue))
        .to.emit(eeseeRandom, "ChangeCallbackGasLimit")
        .withArgs(100000, newValue)
        
        assert.equal(newValue, await eeseeRandom.callbackGasLimit(), "callbackGasLimit has changed")
    })

    it('reverts constructor', async () => {
        const _eeseeRandom = await hre.ethers.getContractFactory("EeseeRandom");
        await expect(_eeseeRandom.deploy(
            {
                vrfCoordinator: mockVRF.address,
                keyHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                minimumRequestConfirmations: 1,
                callbackGasLimit: 100000
            },
            zeroAddress
        )).to.be.revertedWithCustomError(eeseeRandom, "InvalidAccessManager")
        await eeseeRandom.deployed()
    })
});
