import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { deployments, ethers } from 'hardhat';
import { GVrsw, Vrsw, VGlobalMinter } from '../typechain-types';
import { time, mine } from '@nomicfoundation/hardhat-network-helpers';

describe('vGlobalMinter 1', function () {
    let vrsw: Vrsw;
    let gVrsw: GVrsw;
    let minter: VGlobalMinter;
    let accounts: SignerWithAddress[];

    beforeEach(async () => {
        // init
        accounts = await ethers.getSigners();
        await deployments.fixture(['all']);
        minter = await ethers.getContract('globalMinter');
        vrsw = await ethers.getContractAt('Vrsw', await minter.vrsw());
        gVrsw = await ethers.getContractAt('GVrsw', await minter.gVrsw());

        // skip time to emissionStart
        await time.setNextBlockTimestamp(
            ethers.BigNumber.from(await minter.emissionStartTs()).add(60)
        );
    });

    it('cannot deploy globalMinter with emission timestamp in the past', async () => {
        const minterFactory = await ethers.getContractFactory('VGlobalMinter');
        await mine();
        await expect(
            minterFactory.deploy(await time.latest(), vrsw.address)
        ).to.revertedWith('invalid emission start timestamp');
    });

    it('cannot deploy globalMinter with zero vrsw token', async () => {
        const minterFactory = await ethers.getContractFactory('VGlobalMinter');
        await mine();
        await expect(
            minterFactory.deploy(
                (await time.latest()) + 2,
                ethers.constants.AddressZero
            )
        ).to.revertedWith('zero address');
    });

    it('addChainMinter can be called only by owner', async () => {
        await expect(
            minter.connect(accounts[1]).addChainMinter()
        ).to.revertedWith('Ownable: caller is not the owner');
    });

    it('nextEpochTransfer can be called only by owner', async () => {
        await expect(
            minter.connect(accounts[1]).nextEpochTransfer()
        ).to.revertedWith('Ownable: caller is not the owner');
    });

    it('setEpochParams can be called only by owner', async () => {
        await expect(
            minter.connect(accounts[1]).setEpochParams('1', '1')
        ).to.revertedWith('Ownable: caller is not the owner');
    });

    it('gVRSW.mint can be called only by global minter', async () => {
        await expect(
            gVrsw.mint(accounts[0].address, ethers.utils.parseEther('1000'))
        ).to.revertedWith('Only minter');
    });

    it('arbitraryTransfer works', async () => {
        const amount = ethers.utils.parseEther('10');
        const minterBalanceBefore = await vrsw.balanceOf(minter.address);
        const accountBalanceBefore = await vrsw.balanceOf(accounts[1].address);
        await minter.arbitraryTransfer(accounts[1].address, amount);
        const minterBalanceAfter = await vrsw.balanceOf(minter.address);
        const accountBalanceAfter = await vrsw.balanceOf(accounts[1].address);
        expect(minterBalanceAfter).to.be.equal(minterBalanceBefore.sub(amount));
        expect(accountBalanceAfter).to.be.equal(
            accountBalanceBefore.add(amount)
        );
    });

    it('arbitraryTransfer fails when amount is greater than unlockedBalance', async () => {
        const amount = (await minter.unlockedBalance()).add(
            ethers.utils.parseEther('10')
        );
        await expect(
            minter.arbitraryTransfer(accounts[1].address, amount)
        ).to.revertedWith('not enough unlocked tokens');
    });

    it('arbitraryTransfer fails when amount is zero', async () => {
        await expect(
            minter.arbitraryTransfer(accounts[1].address, 0)
        ).to.revertedWith('amount must be positive');
    });

    it('arbitraryTransfer fails when called not by owner', async () => {
        const amount = (await minter.unlockedBalance()).add(
            ethers.utils.parseEther('10')
        );
        await expect(
            minter
                .connect(accounts[1])
                .arbitraryTransfer(accounts[1].address, amount)
        ).to.revertedWith('Ownable: caller is not the owner');
    });

    it('newVesting fails when called not by owner', async () => {
        const amount = (await minter.unlockedBalance()).add(
            ethers.utils.parseEther('10')
        );
        await expect(
            minter
                .connect(accounts[1])
                .newVesting(
                    accounts[0].address,
                    await time.latest(),
                    100,
                    amount
                )
        ).to.revertedWith('Ownable: caller is not the owner');
    });

    it('newVesting fails when amount is greater than unlockedBalance', async () => {
        const amount = (await minter.unlockedBalance()).add(
            ethers.utils.parseEther('10')
        );
        await expect(
            minter.newVesting(
                accounts[0].address,
                await time.latest(),
                100,
                amount
            )
        ).to.revertedWith('not enough unlocked tokens');
    });

    it('newVesting fails when amount is zero', async () => {
        await expect(
            minter.newVesting(accounts[0].address, await time.latest(), 100, 0)
        ).to.revertedWith('amount must be positive');
    });

    it('newVesting works', async () => {
        const amount = ethers.utils.parseEther('10');
        const minterBalanceBefore = await vrsw.balanceOf(minter.address);
        await mine();
        const start = (await time.latest()) + 1;
        await minter.newVesting(accounts[1].address, start, 1, amount);
        await minter.newVesting(accounts[2].address, start + 10, 1, amount);
        await mine();
        const minterBalanceAfter = await vrsw.balanceOf(minter.address);
        const vestingWalletAddress = await minter.vestingWallets(0);
        const vVestingWalletFactory = await ethers.getContractFactory(
            'vVestingWallet'
        );
        const vestingWallet =
            vVestingWalletFactory.attach(vestingWalletAddress);
        const vestingWallets = await minter.getAllVestingWallets();
        expect(vestingWallets[0]).to.be.equal(vestingWalletAddress);
        expect(vestingWallets[1]).to.be.equal(await minter.vestingWallets(1));
        expect(minterBalanceAfter).to.equal(
            minterBalanceBefore.sub(amount.mul(2))
        );
        expect(await vestingWallet.beneficiary()).to.equal(accounts[1].address);
        expect(await vestingWallet.start()).to.equal(start);
        expect(await vestingWallet.duration()).to.equal('1');
        expect(await vestingWallet.released()).to.equal('0');
        expect(await vestingWallet.releasable()).to.equal(amount);
        const accountBalanceBefore = await vrsw.balanceOf(accounts[1].address);
        await vestingWallet.connect(accounts[1]).release();
        const accountBalanceAfter = await vrsw.balanceOf(accounts[1].address);
        expect(accountBalanceAfter).to.equal(accountBalanceBefore.add(amount));
    });

    it('addChainMinter works', async () => {
        const balanceBefore = await gVrsw.balanceOf(accounts[0].address);
        await minter.addChainMinter();
        const balanceAfter = await gVrsw.balanceOf(accounts[0].address);
        expect(balanceBefore).to.be.equal('0');
        expect(balanceAfter).to.be.equal(ethers.utils.parseEther('1000000000'));
    });

    it('setEpochParams works', async () => {
        // with epoch transition call
        await minter.setEpochParams('1296000', '648000');
        expect(await minter.nextEpochPreparationTime()).to.be.equal(648000);
        expect(await minter.nextEpochDuration()).to.be.equal(1296000);

        // without epoch transition call
        await minter.setEpochParams('1296', '648');
        expect(await minter.nextEpochPreparationTime()).to.be.equal(648);
        expect(await minter.nextEpochDuration()).to.be.equal(1296);
    });

    it('setEpochParams fails when preparation time is more than epoch duration', async () => {
        await expect(minter.setEpochParams('2', '3')).to.revertedWith(
            'preparationTime >= epochDuration'
        );
    });

    it('setEpochParams fails when preparation time or epoch duration are zero', async () => {
        await expect(minter.setEpochParams('0', '0')).to.revertedWith(
            'must be greater than zero'
        );
        await expect(minter.setEpochParams('2', '0')).to.revertedWith(
            'must be greater than zero'
        );
    });

    it('epochTransition works when epoch params has changed', async () => {
        await minter.setEpochParams('1296', '648');
        await time.setNextBlockTimestamp(
            ethers.BigNumber.from(await time.latest())
                .add(await minter.epochDuration())
                .sub('100')
        );
        expect(await minter.nextEpochPreparationTime()).to.be.equal(648);
        expect(await minter.nextEpochDuration()).to.be.equal(1296);
        await minter.nextEpochTransfer();
        expect(await minter.nextEpochPreparationTime()).to.be.equal(0);
        expect(await minter.nextEpochDuration()).to.be.equal(0);
    });
});

describe('vGlobalMinter 2', function () {
    let vrsw: Vrsw;
    let gVrsw: GVrsw;
    let minter: VGlobalMinter;
    let accounts: SignerWithAddress[];

    beforeEach(async () => {
        // init
        accounts = await ethers.getSigners();
        await deployments.fixture(['all']);
        minter = await ethers.getContract('globalMinter');
        vrsw = await ethers.getContractAt('Vrsw', await minter.vrsw());
        gVrsw = await ethers.getContractAt('GVrsw', await minter.gVrsw());
    });

    it('nextEpochTransfer works', async () => {
        // epoch #0
        const balanceBefore = await vrsw.balanceOf(accounts[0].address);
        await minter.nextEpochTransfer();
        const balanceAfter = await vrsw.balanceOf(accounts[0].address);
        expect(balanceAfter).to.be.above(balanceBefore);

        // epoch #1
        await time.setNextBlockTimestamp(
            ethers.BigNumber.from(await minter.emissionStartTs())
                .add(await minter.epochDuration())
                .sub(await minter.epochPreparationTime())
        );
        await minter.nextEpochTransfer();
        const balanceAfter2 = await vrsw.balanceOf(accounts[0].address);
        expect(balanceAfter2).to.be.above(balanceAfter);
        expect(balanceAfter2.sub(balanceAfter)).to.be.below(
            balanceAfter.sub(balanceBefore)
        );
    });

    it('nextEpochTransfer fails when its not preparation time', async () => {
        await time.setNextBlockTimestamp(await minter.emissionStartTs());
        await expect(minter.nextEpochTransfer()).to.revertedWith('Too early');
    });
});
