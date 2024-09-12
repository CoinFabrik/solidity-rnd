const { expect } = require('chai');
const { ethers } = require('hardhat');
const assert = require('assert');
const zeroAddress = "0x0000000000000000000000000000000000000000"
describe('eeseeFeeSplitter', function () {
    let erc20, eeseeFeeSplitter
    let signer, miningPool, companyTreasury, daoTreasury, stakingPool, acc1, companyTreasuryNew
    this.beforeAll(async () => {
        [signer, miningPool, companyTreasury, daoTreasury, stakingPool, acc1, companyTreasuryNew] = await ethers.getSigners()
        const mockERC20ContractFactory = await hre.ethers.getContractFactory('MockERC20')
        const eeseeFeeSplitterContractFactory = await hre.ethers.getContractFactory('EeseeFeeSplitter')
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");
        accessManager = await _eeseeAccessManager.deploy();
        await accessManager.deployed()

        erc20 = await mockERC20ContractFactory.deploy('10000000000000')
        await erc20.deployed()
        eeseeFeeSplitter = await eeseeFeeSplitterContractFactory.deploy(
            erc20.address,
            [
                companyTreasury.address,
                miningPool.address,
                daoTreasury.address,
                stakingPool.address
            ],
            [
                '5',
                '3',
                '1',
                '1'
            ]
        )
        await eeseeFeeSplitter.deployed()
    })
    it('Init', async () => {
        assert.equal((await eeseeFeeSplitter.payees(0)).toString(), companyTreasury.address, "payees is correct")
        assert.equal((await eeseeFeeSplitter.shares(companyTreasury.address)).toString(), '5', "shares is correct")
        assert.equal((await eeseeFeeSplitter.released(companyTreasury.address)).toString(), '0', "released is correct")

        assert.equal((await eeseeFeeSplitter.payees(1)).toString(), miningPool.address, "payees is correct")
        assert.equal((await eeseeFeeSplitter.shares(miningPool.address)).toString(), '3', "shares is correct")
        assert.equal((await eeseeFeeSplitter.released(miningPool.address)).toString(), '0', "released is correct")

        assert.equal((await eeseeFeeSplitter.payees(2)).toString(), daoTreasury.address, "payees is correct")
        assert.equal((await eeseeFeeSplitter.shares(daoTreasury.address)).toString(), '1', "shares is correct")
        assert.equal((await eeseeFeeSplitter.released(daoTreasury.address)).toString(), '0', "released is correct")

        assert.equal((await eeseeFeeSplitter.payees(3)).toString(), stakingPool.address, "payees is correct")
        assert.equal((await eeseeFeeSplitter.shares(stakingPool.address)).toString(), '1', "shares is correct")
        assert.equal((await eeseeFeeSplitter.released(stakingPool.address)).toString(), '0', "released is correct")

        assert.equal((await eeseeFeeSplitter.totalShares()).toString(), '10', "totalShares is correct")
        assert.equal((await eeseeFeeSplitter.totalReleased()).toString(), '0', "totalReleased is correct")
    })
    it('Can split payment', async () => {
        await expect(eeseeFeeSplitter.connect(signer).release(signer.address)).to.be.revertedWithCustomError(eeseeFeeSplitter, 'NoShares')
        await expect(eeseeFeeSplitter.connect(companyTreasury).release(companyTreasury.address)).to.not.emit(eeseeFeeSplitter, "PaymentReleased")
        await erc20.transfer(eeseeFeeSplitter.address, '100000000')

        const companyTreasuryBalanceBefore = await erc20.balanceOf(companyTreasury.address)
        await expect(eeseeFeeSplitter.connect(companyTreasury).release(companyTreasury.address))
        .to.emit(erc20, 'Transfer')
        .withArgs(eeseeFeeSplitter.address, companyTreasury.address, '50000000')
        .and.to.emit(eeseeFeeSplitter, 'PaymentReleased')
        .withArgs(companyTreasury.address, '50000000')
        const companyTreasuryBalanceAfter = await erc20.balanceOf(companyTreasury.address)
        assert.equal(companyTreasuryBalanceAfter.toString(), companyTreasuryBalanceBefore.add(ethers.BigNumber.from('50000000')).toString(), "companyTreasury balance is correct")
        assert.equal((await eeseeFeeSplitter.released(companyTreasury.address)).toString(), '50000000', "released is correct")

        const miningPoolBalanceBefore = await erc20.balanceOf(miningPool.address)
        await expect(eeseeFeeSplitter.connect(signer).release(miningPool.address))
        .to.emit(erc20, 'Transfer')
        .withArgs(eeseeFeeSplitter.address, miningPool.address, '30000000')
        .and.to.emit(eeseeFeeSplitter, 'PaymentReleased')
        .withArgs(miningPool.address, '30000000')
        const miningPoolBalanceAfter = await erc20.balanceOf(miningPool.address)
        assert.equal(miningPoolBalanceAfter.toString(), miningPoolBalanceBefore.add(ethers.BigNumber.from('30000000')).toString(), "miningPool balance is correct")
        assert.equal((await eeseeFeeSplitter.released(miningPool.address)).toString(), '30000000', "released is correct")

        const daoTreasuryBalanceBefore = await erc20.balanceOf(daoTreasury.address)
        await expect(eeseeFeeSplitter.connect(signer).release(daoTreasury.address))
        .to.emit(erc20, 'Transfer')
        .withArgs(eeseeFeeSplitter.address, daoTreasury.address, '10000000')
        .and.to.emit(eeseeFeeSplitter, 'PaymentReleased')
        .withArgs(daoTreasury.address, '10000000')
        const daoTreasuryBalanceAfter = await erc20.balanceOf(daoTreasury.address)
        assert.equal(daoTreasuryBalanceAfter.toString(), daoTreasuryBalanceBefore.add(ethers.BigNumber.from('10000000')).toString(), "daoTreasury balance is correct")
        assert.equal((await eeseeFeeSplitter.released(daoTreasury.address)).toString(), '10000000', "released is correct")

        const stakingPoolBalanceBefore = await erc20.balanceOf(stakingPool.address)
        await expect(eeseeFeeSplitter.connect(signer).release(stakingPool.address))
        .and.to.emit(erc20, 'Transfer')
        .withArgs(eeseeFeeSplitter.address, stakingPool.address, '10000000')
        .and.to.emit(eeseeFeeSplitter, 'PaymentReleased')
        .withArgs(stakingPool.address, '10000000')
        const stakingPoolBalanceAfter = await erc20.balanceOf(stakingPool.address)
        assert.equal(stakingPoolBalanceAfter.toString(), stakingPoolBalanceBefore.add(ethers.BigNumber.from('10000000')).toString(), "stakingPool balance is correct")
        assert.equal((await eeseeFeeSplitter.totalReleased()).toString(), '100000000', "totalReleased is correct")
        assert.equal((await eeseeFeeSplitter.released(stakingPool.address)).toString(), '10000000', "released is correct")
    })

    it('Invalid constructor', async () => {
        const eeseeFeeSplitterContractFactory = await hre.ethers.getContractFactory('EeseeFeeSplitter')
        await expect(eeseeFeeSplitterContractFactory.deploy(
            zeroAddress,
            [
                companyTreasury.address,
                miningPool.address,
                daoTreasury.address,
                stakingPool.address
            ],
            [
                '5',
                '3',
                '1',
                '1'
            ]
        )).to.be.revertedWithCustomError(eeseeFeeSplitter, "InvalidESE")

        await expect(eeseeFeeSplitterContractFactory.deploy(
            erc20.address,
            [],
            []
        )).to.be.revertedWithCustomError(eeseeFeeSplitter, "InvalidLength")

        await expect(eeseeFeeSplitterContractFactory.deploy(
            erc20.address,
            [companyTreasury.address],
            ['5', '2']
        )).to.be.revertedWithCustomError(eeseeFeeSplitter, "InvalidLength")

        await expect(eeseeFeeSplitterContractFactory.deploy(
            erc20.address,
            [zeroAddress],
            ['5']
        )).to.be.revertedWithCustomError(eeseeFeeSplitter, "InvalidPayee")

        await expect(eeseeFeeSplitterContractFactory.deploy(
            erc20.address,
            [companyTreasury.address],
            ['0']
        )).to.be.revertedWithCustomError(eeseeFeeSplitter, "InvalidShare")

        await expect(eeseeFeeSplitterContractFactory.deploy(
            erc20.address,
            [companyTreasury.address, companyTreasury.address],
            ['1', '1']
        )).to.be.revertedWithCustomError(eeseeFeeSplitter, "PayeeAlreadyInitialized")

        await expect(eeseeFeeSplitterContractFactory.deploy(
            erc20.address,
            [companyTreasury.address, miningPool.address],
            ['10000', '1']
        )).to.be.revertedWithCustomError(eeseeFeeSplitter, "InvalidShares")
    })

})