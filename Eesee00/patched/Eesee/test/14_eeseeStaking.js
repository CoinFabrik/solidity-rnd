const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const assert = require("assert");
  const { getContractAddress } = require('@ethersproject/address')
  const createPermit = require('./utils/createPermit')
  describe("eeseeStaking", function () {
    let ESE;
    let eesee;
    let signer, acc2, acc3
    let staking
    let accessManager
    let snapshotId
    const zeroAddress = "0x0000000000000000000000000000000000000000"
  
    this.beforeAll(async() => {
        [signer, acc2, acc3, acc4, acc5, eesee] = await ethers.getSigners()
        const _ESE = await hre.ethers.getContractFactory("ESE");
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");

        accessManager = await _eeseeAccessManager.deploy();
        await accessManager.deployed()

        const transactionCount = await signer.getTransactionCount()
        const futureStakingAddress = getContractAddress({
          from: signer.address,
          nonce: transactionCount + 3
        })
        
        ESE = await _ESE.deploy([{
                cliff: 0,
                duration: 0,
                TGEMintShare: 10000
            }
        ])
        await ESE.deployed()
        await ESE.addVestingBeneficiaries(0, [
            {addr: signer.address, amount: '100000000000000000000000000'}, 
            {addr: acc2.address, amount: '100000000000000000000' },
            {addr: futureStakingAddress, amount: '2000000000000000000000000'},
            {addr: acc4.address, amount: '1000000000000000000000'},
            {addr: acc5.address, amount: '1000000000000000000000'}
        ])
        await ESE.initialize(0)

        staking = await _eeseeStaking.deploy(
            ESE.address, 
            [{volumeBreakpoint: 1000, rewardRateFlexible: ethers.utils.parseUnits('0.0001', 'ether'), rewardRateLocked: ethers.utils.parseUnits('0.0002', 'ether')}, {volumeBreakpoint: 2000, rewardRateFlexible: ethers.utils.parseUnits('0.001', 'ether'), rewardRateLocked: ethers.utils.parseUnits('0.002', 'ether')}], 
            accessManager.address,
            zeroAddress
        )
        await staking.deployed()
        
        await staking.grantVolumeUpdater(eesee.address)

        await ESE.connect(acc2).approve(staking.address, '100000000000000000000')
        await ESE.approve(staking.address, '99999999999999999999999999999')
    })
    it('Inits', async () => {
        assert.equal((await staking.duration()).toString(), 60*60*24*90, "duration is correct")
        assert.equal(await staking.accessManager(), accessManager.address, "accessManager is correct")
        assert.equal(await staking.ADMIN_ROLE(), '0x0000000000000000000000000000000000000000000000000000000000000000', "ADMIN_ROLE is correct")
        assert.equal((await staking.ESE()).toString(), ESE.address, "ESE is correct")
        assert.equal(await staking.volumeUpdaters(eesee.address), true, "eesee is correct")
        assert.equal((await staking.tierInfo(0)).volumeBreakpoint.toString(), 1000, "volume breakpoint is correct")
        assert.equal((await staking.tierInfo(0)).rewardRateFlexible.toString(), ethers.utils.parseUnits('0.0001', 'ether'), "rewardRateFlexible is correct")
        assert.equal((await staking.tierInfo(0)).rewardRateLocked.toString(), ethers.utils.parseUnits('0.0002', 'ether'), "rewardRateLocked is correct")
    })
    it('Stakes Flexible with permit', async () => {
        snapshotId = await network.provider.send('evm_snapshot')
        const currentTimestamp = (await ethers.provider.getBlock()).timestamp
        const deadline = currentTimestamp + 10000
        const permit = await createPermit(signer, staking, '2', deadline, ESE)

        const params_ = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['2', deadline, permit.v, permit.r, permit.s]
          );

        await ESE.approve(staking.address, 0)
        const rewardID = await staking.rewardID()
        const volume = await staking.volume(signer.address)
        const tier = await staking.tier(volume)
        assert.equal((await staking.tierInfo(tier)).rewardRateFlexible.toString(), ethers.utils.parseUnits('0.0001', 'ether'), "Reward rate is correct")
        
        await expect(staking.deposit(0, 0, rewardID, params_)).to.not.emit(staking, "DepositFlexible")

        const permit_ = await createPermit(signer, staking, '2', deadline, ESE)
        const params__ = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['2', deadline, permit_.v, permit_.r, permit_.s]
          );

        //const timestamp = (await ethers.provider.getBlock()).timestamp + 1
        await expect(staking.connect(signer).deposit(1, 0, rewardID, params__))
            .to.emit(staking, "DepositFlexible")
            .withArgs(signer.address, 1)
        const stakeTimestamp = (await ethers.provider.getBlock()).timestamp

        await time.increase(50000)
        const _timestamp = (await ethers.provider.getBlock()).timestamp
        assert.equal((await staking.pendingReward(false, signer.address)).toString(), Math.floor((_timestamp - stakeTimestamp) * 0.0001), "earned is correct")

        assert.equal((await staking.userInfo(false, signer.address)).amount.toString(), '1', "stake is correct")
        assert.equal((await staking.userInfo(false, signer.address)).reward.toString(), '0', "reward is correct")
        assert.equal((await staking.userInfo(false, signer.address)).unlockTime.toString(), '0', "unlockTime is correct")
        assert.equal((await staking.volume(signer.address)).toString(), '0', "volume is correct")
        assert.equal((await staking.totalDeposits()).toString(), '1', "totalDeposits is correct")
    
        // Update volume
        await expect(staking.connect(signer).addVolume(1000, signer.address)).to.be.revertedWithCustomError(staking, 'CallerNotVolumeUpdater')
        await expect(staking.connect(eesee).addVolume(1, signer.address)).to.emit(staking, "AddVolume").withArgs(eesee.address, signer.address, 1)
        assert.equal((await staking.volume(signer.address)).toString(), "1", "Volume is correct")

        await staking.connect(eesee).addVolume(1000, signer.address)

        //const __timestamp = (await ethers.provider.getBlock()).timestamp + 1
        await expect(staking.deposit(1, 0, rewardID, '0x'))
            .to.emit(staking, "DepositFlexible")
            .withArgs(signer.address, 1)
        const earnedBefore = await staking.pendingReward(false, signer.address)
        const _stakeTimestamp = (await ethers.provider.getBlock()).timestamp

        await time.increase(50000)
        const ___timestamp = (await ethers.provider.getBlock()).timestamp

        assert.equal((await staking.pendingReward(false, signer.address)).toString(), (earnedBefore.add((2*Math.floor((___timestamp - _stakeTimestamp) * 0.001)).toString())).toString(), "earned is correct")
        assert.equal((await staking.userInfo(false, signer.address)).amount.toString(), '2', "stake is correct")
        assert.equal((await staking.userInfo(false, signer.address)).reward.toString(), earnedBefore.toString(), "reward is correct")
        assert.equal((await staking.volume(signer.address)).toString(), '1001', "volume is correct")
        assert.equal((await staking.tier(await staking.volume(signer.address))).toString(), 1, "tier is correct")
        assert.equal((await staking.totalDeposits()).toString(), '2', "totalDeposits is correct")
        await network.provider.send("evm_revert", [snapshotId])
    })

    it('Stakes Flexible', async () => {
        const volume = await staking.volume(signer.address)
        const tier = await staking.tier(volume)
        const rewardID = await staking.rewardID()
        assert.equal((await staking.tierInfo(tier)).rewardRateFlexible.toString(), ethers.utils.parseUnits('0.0001', 'ether'), "Reward rate is correct")
        await expect(staking.deposit(0, 0, rewardID, '0x')).to.not.emit(staking, "DepositFlexible")

        //const timestamp = (await ethers.provider.getBlock()).timestamp + 1
        await expect(staking.deposit(1, 0, rewardID, '0x'))
            .to.emit(staking, "DepositFlexible")
            .withArgs(signer.address, 1)
        const stakeTimestamp = (await ethers.provider.getBlock()).timestamp

        await time.increase(50000)
        const _timestamp = (await ethers.provider.getBlock()).timestamp
        assert.equal((await staking.pendingReward(false, signer.address)).toString(), Math.floor((_timestamp - stakeTimestamp) * 0.0001), "earned is correct")

        assert.equal((await staking.userInfo(false, signer.address)).amount.toString(), '1', "stake is correct")
        assert.equal((await staking.userInfo(false, signer.address)).reward.toString(), '0', "reward is correct")
        assert.equal((await staking.userInfo(false, signer.address)).unlockTime.toString(), '0', "unlockTime is correct")
        assert.equal((await staking.volume(signer.address)).toString(), '0', "volume is correct")
        assert.equal((await staking.totalDeposits()).toString(), '1', "totalDeposits is correct")

        // Update volume
        await expect(staking.connect(signer).addVolume(1000, signer.address)).to.be.revertedWithCustomError(staking, 'CallerNotVolumeUpdater')
        await expect(staking.connect(eesee).addVolume(1, signer.address)).to.emit(staking, "AddVolume").withArgs(eesee.address,  signer.address, 1)
        assert.equal((await staking.volume(signer.address)).toString(), "1", "Volume is correct")
        await expect(staking.connect(eesee).addVolume(1000, signer.address)).to.emit(staking, "AddVolume").withArgs(eesee.address, signer.address, 1000)

        //const __timestamp = (await ethers.provider.getBlock()).timestamp + 1
        await expect(staking.deposit(1, 0, rewardID, '0x'))
            .to.emit(staking, "DepositFlexible")
            .withArgs(signer.address, 1)
        const earnedBefore = await staking.pendingReward(false, signer.address)
        const _stakeTimestamp = (await ethers.provider.getBlock()).timestamp

        await time.increase(50000)
        const ___timestamp = (await ethers.provider.getBlock()).timestamp

        assert.equal((await staking.pendingReward(false, signer.address)).toString(), (earnedBefore.add((2*Math.floor((___timestamp - _stakeTimestamp)* 0.001)).toString())).toString(), "earned is correct")
        assert.equal((await staking.userInfo(false, signer.address)).amount.toString(), '2', "stake is correct")
        assert.equal((await staking.userInfo(false, signer.address)).reward.toString(), earnedBefore.toString(), "reward is correct")
        assert.equal((await staking.volume(signer.address)).toString(), '1001', "volume is correct")
        assert.equal((await staking.tier(await staking.volume(signer.address))).toString(), 1, "tier is correct")
        assert.equal((await staking.totalDeposits()).toString(), '2', "totalDeposits is correct")
    })

    it('Withdraw Flexible', async () => {
        await expect(staking.withdraw(false, 100000, acc2.address)).to.be.revertedWithCustomError(staking, "InsufficientStake")
        await expect(staking.withdraw(false, 1, zeroAddress)).to.be.revertedWithCustomError(staking, "InvalidRecipient")
        await expect(staking.connect(acc2).withdraw(false, 0, acc2.address)).to.not.emit(staking, "WithdrawFlexible")

        const balanceBefore = await ESE.balanceOf(acc2.address)
        const earnedBefore = await staking.pendingReward(false, signer.address)
        await expect(staking.withdraw(false, 0, acc2.address))
            .to.emit(staking, "WithdrawFlexible")
            .withArgs(signer.address, acc2.address, earnedBefore)
        const balanceAfter = await ESE.balanceOf(acc2.address)
        assert.equal((balanceAfter.sub(balanceBefore)).toString(), earnedBefore.toString(), "reward collected is correct")

        const balanceBeforeSigner = await ESE.balanceOf(signer.address)
        const stake = (await staking.pendingReward(false, signer.address)).add(2) //We staked 2 tokens
        await expect(staking.withdraw(false, 2, signer.address))
            .to.emit(staking, "WithdrawFlexible")
            .withArgs(signer.address, signer.address, stake)

        const balanceAfterSigner = await ESE.balanceOf(signer.address)
        assert.equal((balanceAfterSigner.sub(balanceBeforeSigner)).toString(), stake.toString(), "stake collected is correct")

        assert.equal((await staking.pendingReward(false, signer.address)).toString(), '0', "earned is correct")
        assert.equal((await staking.userInfo(false, signer.address)).amount.toString(), '0', "stake is correct")
        assert.equal((await staking.userInfo(false, signer.address)).reward.toString(), '0', "reward is correct")
        assert.equal((await staking.totalDeposits()).toString(), '0', "totalDeposits is correct")
    })

    it('Stake Locked With Permit', async () => {
        snapshotId = await network.provider.send('evm_snapshot')
        const currentTimestamp = (await ethers.provider.getBlock()).timestamp
        const deadline = currentTimestamp + 10000
        const permit = await createPermit(acc2, staking, '2', deadline, ESE)

        const duration = await staking.duration()
        const rewardID = await staking.rewardID()

        const params_ = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['2', deadline, permit.v, permit.r, permit.s]
          );

        await ESE.approve(staking.address, 0)
        const volume = await staking.volume(acc2.address)
        const tier = await staking.tier(volume)
        assert.equal((await staking.tierInfo(tier)).rewardRateLocked.toString(), ethers.utils.parseUnits('0.0002', 'ether'), "Reward rate is correct")
        
        await expect(staking.connect(acc2).deposit(0, duration, rewardID, params_)).to.not.emit(staking, "DepositLocked")

        const permit_ = await createPermit(acc2, staking, '2', deadline, ESE)
        const params__ = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['2', deadline, permit_.v, permit_.r, permit_.s]
          );

        //const timestamp = (await ethers.provider.getBlock()).timestamp + 1
        const tx = await staking.connect(acc2).deposit(1, duration, rewardID, params__)
        const stakeTimestamp = (await ethers.provider.getBlock()).timestamp
        expect(tx).to.emit(staking, "DepositLocked").withArgs(acc2.address, 1, stakeTimestamp + 90*24*60*60)

        await time.increase(50000)
        const _timestamp = (await ethers.provider.getBlock()).timestamp

        assert.equal((await staking.pendingReward(true, acc2.address)).toString(), Math.floor((_timestamp - stakeTimestamp) * 0.0002), "earned is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).amount.toString(), '1', "stake is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).reward.toString(), '0', "reward is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).unlockTime.toString(), stakeTimestamp + 90*24*60*60, "unlockTime is correct")
        assert.equal((await staking.volume(acc2.address)).toString(), '0', "volume is correct")
        assert.equal((await staking.totalDeposits()).toString(), '1', "totalDeposits is correct")
    
        // Update volume
        await expect(staking.connect(signer).addVolume(1000, acc2.address)).to.be.revertedWithCustomError(staking, 'CallerNotVolumeUpdater')
        await staking.connect(eesee).addVolume(1, acc2.address)
        assert.equal((await staking.volume(acc2.address)).toString(), "1", "Volume is correct")
        await staking.connect(eesee).addVolume(1000, acc2.address)

        //const __timestamp = (await ethers.provider.getBlock()).timestamp + 1
        const _tx = await staking.connect(acc2).deposit(1, duration, rewardID, '0x')
        const __stakeTimestamp = (await ethers.provider.getBlock()).timestamp
        expect(_tx).to.emit(staking, "DepositLocked").withArgs(acc2.address, 1, __stakeTimestamp + 90*24*60*60)
        const earnedBefore = await staking.pendingReward(true, acc2.address)

        await time.increase(50000)
        const ___timestamp = (await ethers.provider.getBlock()).timestamp

        assert.equal((await staking.pendingReward(true, acc2.address)).toString(), (earnedBefore.add((2*Math.floor((___timestamp - __stakeTimestamp) * 0.002)).toString())).toString(), "earned is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).amount.toString(), '2', "stake is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).reward.toString(), earnedBefore.toString(), "reward is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).unlockTime.toString(), __stakeTimestamp + 90*24*60*60, "unlockTime is correct")
        assert.equal((await staking.volume(acc2.address)).toString(), '1001', "volume is correct")
        assert.equal((await staking.tier(await staking.volume(acc2.address))).toString(), 1, "tier is correct")
        assert.equal((await staking.totalDeposits()).toString(), '2', "totalDeposits is correct")
        await network.provider.send("evm_revert", [snapshotId])
    })

    it('Stake Locked', async () => {
        const volume = await staking.volume(acc2.address)
        const tier = await staking.tier(volume)
        const duration = await staking.duration()
        const rewardID = await staking.rewardID()

        assert.equal((await staking.tierInfo(tier)).rewardRateLocked.toString(), ethers.utils.parseUnits('0.0002', 'ether'), "Reward rate is correct")
        await expect(staking.deposit(0, duration, rewardID, '0x')).to.not.emit(staking, "DepositLocked")

        await expect(staking.connect(acc2).deposit(1, 1, rewardID, '0x')).to.be.revertedWithCustomError(staking, "InvalidDuration")
        await expect(staking.connect(acc2).deposit(1, duration, 999, '0x')).to.be.revertedWithCustomError(staking, "InvalidRewardID")
        
        const tx = await staking.connect(acc2).deposit(1, duration, rewardID, '0x')
        const stakeTimestamp = (await ethers.provider.getBlock()).timestamp
        expect(tx).to.emit(staking, "DepositLocked")
            .withArgs(acc2.address, 1, stakeTimestamp + 90*24*60*60)

        await time.increase(50000)
        const _timestamp = (await ethers.provider.getBlock()).timestamp
        assert.equal((await staking.pendingReward(true, acc2.address)).toString(), Math.floor((_timestamp - stakeTimestamp) * 0.0002), "earned is correct")

        assert.equal((await staking.userInfo(true, acc2.address)).amount.toString(), '1', "stake is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).reward.toString(), '0', "reward is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).unlockTime.toString(), stakeTimestamp + 90*24*60*60, "unlockTime is correct")
        assert.equal((await staking.volume(acc2.address)).toString(), '0', "volume is correct")
        assert.equal((await staking.totalDeposits()).toString(), '1', "totalDeposits is correct")

        // Update volume
        await expect(staking.connect(signer).addVolume(1000, acc2.address)).to.be.revertedWithCustomError(staking, 'CallerNotVolumeUpdater')
        await staking.connect(eesee).addVolume(1, acc2.address)
        assert.equal((await staking.volume(acc2.address)).toString(), "1", "Volume is correct")
        await staking.connect(eesee).addVolume(1000, acc2.address)

        //const __timestamp = (await ethers.provider.getBlock()).timestamp + 1
        const _tx = await staking.connect(acc2).deposit(1, duration, rewardID, '0x')
        const _stakeTimestamp = (await ethers.provider.getBlock()).timestamp
        expect(_tx).to.emit(staking, "DepositLocked").withArgs(acc2.address, 1, _stakeTimestamp + 90*24*60*60)
        const earnedBefore = await staking.pendingReward(true, acc2.address)

        await time.increase(50000)
        const ___timestamp = (await ethers.provider.getBlock()).timestamp

        assert.equal((await staking.pendingReward(true, acc2.address)).toString(), (earnedBefore.add((2*Math.floor((___timestamp - _stakeTimestamp)* 0.002)).toString())).toString(), "earned is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).amount.toString(), '2', "stake is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).reward.toString(), earnedBefore.toString(), "reward is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).unlockTime.toString(), _stakeTimestamp + 90*24*60*60, "unlockTime is correct")
        assert.equal((await staking.volume(acc2.address)).toString(), '1001', "volume is correct")
        assert.equal((await staking.tier(await staking.volume(acc2.address))).toString(), 1, "tier is correct")
        assert.equal((await staking.totalDeposits()).toString(), '2', "totalDeposits is correct")
    })

    it('Withdraw Locked', async () => {
        await expect(staking.connect(acc2).withdraw(true, 0, acc2.address)).to.be.revertedWithCustomError(staking, "WithdrawalNotAvailable")
        await time.increase(7776000)

        await expect(staking.withdraw(true, 100000, acc2.address)).to.be.revertedWithCustomError(staking, "InsufficientStake")
        await expect(staking.withdraw(true, 1, zeroAddress)).to.be.revertedWithCustomError(staking, "InvalidRecipient")
        await expect(staking.connect(signer).withdraw(true, 0, acc2.address)).to.not.emit(staking, "WithdrawLocked")

        const balanceBefore = await ESE.balanceOf(acc2.address)
        const earnedBefore = await staking.pendingReward(true, acc2.address)
        await expect(staking.connect(acc2).withdraw(true, 0, acc2.address))
            .to.emit(staking, "WithdrawLocked")
            .withArgs(acc2.address, acc2.address, earnedBefore)
        const balanceAfter = await ESE.balanceOf(acc2.address)
        assert.equal((balanceAfter.sub(balanceBefore)).toString(), earnedBefore.toString(), "reward collected is correct")

        const balanceBeforeSigner = await ESE.balanceOf(signer.address)
        const stake = (await staking.pendingReward(true, signer.address)).add(2) //We staked 2 tokens
        await expect(staking.connect(acc2).withdraw(true, 2, signer.address))
            .to.emit(staking, "WithdrawLocked")
            .withArgs(acc2.address, signer.address, stake)

        const balanceAfterSigner = await ESE.balanceOf(signer.address)
        assert.equal((balanceAfterSigner.sub(balanceBeforeSigner)).toString(), stake.toString(), "stake collected is correct")

        assert.equal((await staking.pendingReward(true, acc2.address)).toString(), '0', "earned is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).amount.toString(), '0', "stake is correct")
        assert.equal((await staking.userInfo(true, acc2.address)).reward.toString(), '0', "reward is correct")
        assert.equal((await staking.totalDeposits()).toString(), '0', "totalDeposits is correct")
    })
    
    it('Admin', async () => {
        await expect(staking.connect(acc2).changeDuration(1)).to.be.revertedWithCustomError(staking, "CallerNotAuthorized")
        await expect(staking.connect(signer).changeDuration(0)).to.be.revertedWithCustomError(staking, "InvalidDuration")
        await expect(staking.connect(signer).changeDuration(366*5*24*60*60)).to.be.revertedWithCustomError(staking, "InvalidDuration")
        await expect(staking.connect(signer).changeDuration(1))
        .to.emit(staking, "ChangeDuration")
        .withArgs(90*24*60*60, 1)
        assert.equal(1, await staking.duration(), "duration has changed")

        await expect(staking.connect(acc2).grantVolumeUpdater(acc2.address)).to.be.revertedWithCustomError(staking, "CallerNotAuthorized")
        await expect(staking.connect(acc2).revokeVolumeUpdater(acc2.address)).to.be.revertedWithCustomError(staking, "CallerNotAuthorized")

        await expect(staking.connect(signer).grantVolumeUpdater(acc2.address))
        .to.emit(staking, "GrantVolumeUpdater")
        .withArgs(acc2.address)
        assert.equal(await staking.volumeUpdaters(acc2.address), true, "volumeUpdaters is correct")
        await expect(staking.connect(signer).grantVolumeUpdater(acc2.address)).to.be.revertedWithCustomError(staking, "AlreadyGranted")

        await expect(staking.connect(signer).revokeVolumeUpdater(acc2.address))
        .to.emit(staking, "RevokeVolumeUpdater")
        .withArgs(acc2.address)
        assert.equal(await staking.volumeUpdaters(acc2.address), false, "volumeUpdaters is correct")
        await expect(staking.connect(signer).revokeVolumeUpdater(acc2.address)).to.be.revertedWithCustomError(staking, "VolumeUpdaterNotGranted")
    })

    it('Ignore last breakpoint', async () => {
        assert.equal((await staking.tier('0')).toString(), '0', "tier is correct")
        assert.equal((await staking.tier('999999999999999999')).toString(), '1', "tier is correct")
    })
    it('updates pool on the same second', async()=>{
        const rewardID = await staking.rewardID()
        await staking.deposit(10000000000, 0, rewardID, "0x")
        await time.increase(10000)

        await network.provider.send("evm_setAutomine", [false]);
        await network.provider.send("evm_setIntervalMining", [0]);
        
        const pending1 = await staking.pendingReward(false, signer.address)
        await staking.updateRewardRates([1,2], [1,2])
        const pending2 = await staking.pendingReward(false, signer.address)
        await staking.updateRewardRates([1,2], [1,2])
        const pending3 = await staking.pendingReward(false, signer.address)
        assert.equal(pending1.toString(), pending2.toString(), "pending is correct")
        assert.equal(pending2.toString(), pending3.toString(), "pending is correct")

        await network.provider.send("evm_mine");
        await network.provider.send("evm_setAutomine", [true]);
    })

    it('works with 0 reward rates', async()=>{
        await staking.connect(signer).changeDuration(60*60*24*90)
        const duration = await staking.duration()
        await staking.updateRewardRates([0, ethers.utils.parseUnits('0.0001', 'ether')], [0, ethers.utils.parseUnits('0.0002', 'ether')])
        
        let rewardID = await staking.rewardID()
        await ESE.connect(acc4).approve(staking.address, '10000000000')

        {//allows withdarwing with 0 reward rate. Reward is calulated correctly after updateRewardRates
        snapshotId = await network.provider.send('evm_snapshot')

        await staking.connect(acc4).deposit('10000000000', duration, rewardID, "0x")
        await time.increase(500)
        await expect(staking.connect(acc4).withdraw(true, '9000000000', acc4.address))
        .to.emit(staking, "WithdrawLocked").withArgs(acc4.address, acc4.address, '9000000000')

        await time.increase(duration)
        let pending = await staking.pendingReward(true, acc4.address)
        assert.equal(pending.toString(), '0', "pending is correct")

        await staking.updateRewardRates([ethers.utils.parseUnits('0.0001', 'ether'), ethers.utils.parseUnits('0.0001', 'ether')], [ethers.utils.parseUnits('0.0002', 'ether'), ethers.utils.parseUnits('0.0002', 'ether')])
        await time.increase(500)

        pending = await staking.pendingReward(true, acc4.address)
        const __stakeTimestamp = (await ethers.provider.getBlock()).timestamp
        assert.notEqual(pending.toString(), '0', "pending is correct")
        tx = await staking.connect(acc4).withdraw(true, '1000000000', acc4.address)
        const _stakeTimestamp = (await ethers.provider.getBlock()).timestamp
        await expect(tx)
        .to.emit(staking, "WithdrawLocked").withArgs(acc4.address, acc4.address, pending.add(ethers.BigNumber.from((_stakeTimestamp - __stakeTimestamp)*(0.0002 * 1000000000).toString()).add('1000000000').toString()))

        await network.provider.send("evm_revert", [snapshotId])
        }


        {//Does not allows withdrawing if reward rate is not 0
        snapshotId = await network.provider.send('evm_snapshot')

        await staking.connect(acc4).deposit('10000000000', duration, rewardID, "0x")
        await staking.updateRewardRates([ethers.utils.parseUnits('0.0001', 'ether'), ethers.utils.parseUnits('0.0001', 'ether')], [ethers.utils.parseUnits('0.0002', 'ether'), ethers.utils.parseUnits('0.0002', 'ether')])

        await expect(staking.connect(acc4).withdraw(true, '9000000000', acc4.address))
        .to.be.revertedWithCustomError(staking, "WithdrawalNotAvailable")
        await time.increase(duration)

        const pending = await staking.pendingReward(true, acc4.address)
        const __stakeTimestamp = (await ethers.provider.getBlock()).timestamp
        assert.notEqual(pending.toString(), '0', "pending is correct")
        tx = await staking.connect(acc4).withdraw(true, '10000000000', acc4.address)
        const _stakeTimestamp = (await ethers.provider.getBlock()).timestamp

        await expect(tx)
        .to.emit(staking, "WithdrawLocked").withArgs(acc4.address, acc4.address, pending.add(ethers.BigNumber.from((_stakeTimestamp - __stakeTimestamp)*(0.0002 * 10000000000).toString()).add('10000000000').toString()))
        await network.provider.send("evm_revert", [snapshotId])    
        }


        {//Does not allows withdrawing if reward rate is not 0
        snapshotId = await network.provider.send('evm_snapshot')

        await staking.connect(acc4).deposit('10000000000', duration, rewardID, "0x")
        await staking.connect(eesee).addVolume(1000, acc4.address)
    
        await expect(staking.connect(acc4).withdraw(true, '9000000000', acc4.address))
        .to.be.revertedWithCustomError(staking, "WithdrawalNotAvailable")
        await time.increase(duration)
    
        const pending = await staking.pendingReward(true, acc4.address)
        const __stakeTimestamp = (await ethers.provider.getBlock()).timestamp
        assert.notEqual(pending.toString(), '0', "pending is correct")
        tx = await staking.connect(acc4).withdraw(true, '10000000000', acc4.address)
        const _stakeTimestamp = (await ethers.provider.getBlock()).timestamp
    
        await expect(tx)
        .to.emit(staking, "WithdrawLocked").withArgs(acc4.address, acc4.address, pending.add(ethers.BigNumber.from((_stakeTimestamp - __stakeTimestamp)*(0.0002 * 10000000000).toString()).add('10000000000').toString()))
        await network.provider.send("evm_revert", [snapshotId])    
        }


        {//Allows withdrawing if reward rate is 0
        snapshotId = await network.provider.send('evm_snapshot')
        await staking.updateRewardRates(
            [ethers.utils.parseUnits('0.0001', 'ether'), ethers.utils.parseUnits('0.0001', 'ether')], 
            [ethers.utils.parseUnits('0.0002', 'ether'), ethers.utils.parseUnits('0.0002', 'ether')]
        )

        await staking.connect(acc4).deposit('10000000000', duration, rewardID, "0x")
        await expect(staking.connect(acc4).withdraw(true, '9000000000', acc4.address))
        .to.be.revertedWithCustomError(staking, "WithdrawalNotAvailable")
        await time.increase(500)

        await staking.updateRewardRates([0, 0], [0, 0])
        await staking.updateRewardRates([0, 0], [0, 0])
        let pending = await staking.pendingReward(true, acc4.address)
        tx = await staking.connect(acc4).withdraw(true, '9000000000', acc4.address)

        await expect(tx)
        .to.emit(staking, "WithdrawLocked").withArgs(acc4.address, acc4.address, pending.add('9000000000').toString())

        await time.increase(duration)
        pending = await staking.pendingReward(true, acc4.address)
        assert.equal(pending.toString(), '0', "pending is correct")
        await network.provider.send("evm_revert", [snapshotId])    
        }


        {//Allows withdrawing on negative updateRewardRates
        snapshotId = await network.provider.send('evm_snapshot')
        await staking.updateRewardRates(
            [ethers.utils.parseUnits('0.0001', 'ether'), ethers.utils.parseUnits('0.0001', 'ether')], 
            [ethers.utils.parseUnits('0.0001', 'ether'), ethers.utils.parseUnits('0.0002', 'ether')]
        )
        rewardID = await staking.rewardID()
        await staking.connect(acc4).deposit('10000000000', duration, rewardID, "0x")
        await expect(staking.connect(acc4).withdraw(true, '9000000000', acc4.address))
        .to.be.revertedWithCustomError(staking, "WithdrawalNotAvailable")
        await time.increase(500)

        await staking.updateRewardRates(
            [ethers.utils.parseUnits('0.0001', 'ether'), ethers.utils.parseUnits('0.0001', 'ether')], 
            [ethers.utils.parseUnits('0.0001', 'ether'), ethers.utils.parseUnits('0.00015', 'ether')]
        )

        let pending = await staking.pendingReward(true, acc4.address)
        const __stakeTimestamp = (await ethers.provider.getBlock()).timestamp
        assert.notEqual(pending.toString(), '0', "pending is correct")
        tx = await staking.connect(acc4).withdraw(true, '10000000000', acc4.address)
        const _stakeTimestamp = (await ethers.provider.getBlock()).timestamp

        await expect(tx)
        .to.emit(staking, "WithdrawLocked").withArgs(acc4.address, acc4.address, pending.add(ethers.BigNumber.from((_stakeTimestamp - __stakeTimestamp)*(0.0001 * 10000000000).toString()).add('10000000000').toString()))
        
        await network.provider.send("evm_revert", [snapshotId])    
        }
    })


    it('constructor fails', async () => {
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");
        await expect(_eeseeStaking.deploy(
            ESE.address, 
            [], 
            accessManager.address,
            zeroAddress
        )).to.be.revertedWithCustomError(staking, "InvalidTiersLength")

        await expect(_eeseeStaking.deploy(
            zeroAddress, 
            [], 
            accessManager.address,
            zeroAddress
        )).to.be.revertedWithCustomError(staking, "InvalidConstructor")

        await expect(_eeseeStaking.deploy(
            ESE.address, 
            [], 
            zeroAddress,
            zeroAddress
        )).to.be.revertedWithCustomError(staking, "InvalidConstructor")

        await expect(_eeseeStaking.deploy(
            ESE.address, 
            [
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1}
            ],
            accessManager.address,
            zeroAddress
        )).to.be.revertedWithCustomError(staking, "InvalidTiersLength")

        await expect(_eeseeStaking.deploy(
            ESE.address, 
            [
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 2, rewardRateFlexible: 0, rewardRateLocked: 2},
                {volumeBreakpoint: 3, rewardRateFlexible: 2, rewardRateLocked: 3}
            ],
            accessManager.address,
            zeroAddress
        )).to.be.revertedWithCustomError(staking, "InvalidRewardRate")

        await expect(_eeseeStaking.deploy(
            ESE.address, 
            [
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 2, rewardRateFlexible: 2, rewardRateLocked: 0},
                {volumeBreakpoint: 3, rewardRateFlexible: 3, rewardRateLocked: 3}
            ],
            accessManager.address,
            zeroAddress
        )).to.be.revertedWithCustomError(staking, "InvalidRewardRate")

        await expect(_eeseeStaking.deploy(
            ESE.address, 
            [
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 2, rewardRateFlexible: 2, rewardRateLocked: 2},
                {volumeBreakpoint: 3, rewardRateFlexible: 3, rewardRateLocked: 0}
            ],
            accessManager.address,
            zeroAddress
        )).to.be.revertedWithCustomError(staking, "InvalidRewardRate")


        await expect(_eeseeStaking.deploy(
            ESE.address, 
            [
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 0, rewardRateFlexible: 2, rewardRateLocked: 2},
                {volumeBreakpoint: 3, rewardRateFlexible: 3, rewardRateLocked: 3}
            ],
            accessManager.address,
            zeroAddress
        )).to.be.revertedWithCustomError(staking, "InvalidBreakpoint")
        
        await expect(_eeseeStaking.deploy(
            ESE.address, 
            [
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 3, rewardRateFlexible: 2, rewardRateLocked: 2},
                {volumeBreakpoint: 3, rewardRateFlexible: 3, rewardRateLocked: 3}
            ],
            accessManager.address,
            zeroAddress
        )).to.be.revertedWithCustomError(staking, "InvalidBreakpoint")
    })

    it('Updates reward rates', async () => {
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");

        staking = await _eeseeStaking.deploy(
            ESE.address, 
            [
                {volumeBreakpoint: 1, rewardRateFlexible: 1, rewardRateLocked: 1},
                {volumeBreakpoint: 2, rewardRateFlexible: 2, rewardRateLocked: 2},
                {volumeBreakpoint: 3, rewardRateFlexible: 3, rewardRateLocked: 3},
                {volumeBreakpoint: 4, rewardRateFlexible: 4, rewardRateLocked: 4},
                {volumeBreakpoint: 5, rewardRateFlexible: 5, rewardRateLocked: 5},
                {volumeBreakpoint: 6, rewardRateFlexible: 6, rewardRateLocked: 6},
                {volumeBreakpoint: 7, rewardRateFlexible: 7, rewardRateLocked: 7},
                {volumeBreakpoint: 8, rewardRateFlexible: 8, rewardRateLocked: 8},
                {volumeBreakpoint: 9, rewardRateFlexible: 9, rewardRateLocked: 9},
                {volumeBreakpoint: 10, rewardRateFlexible: 10, rewardRateLocked: 10},
            ],
            accessManager.address,
            zeroAddress
        )

        await expect(staking.connect(acc2).updateRewardRates([2,3,4,5,4,6,7,8,9,10], [2,3,4,5,6,7,8,9,10,11]))
        .to.be.revertedWithCustomError(staking, "CallerNotAuthorized")

        await expect(staking.connect(signer).updateRewardRates([2,3,4,5,4,6,7,8,9,10], [2,3,4,5,6,7,8,9,10,11]))
        .to.be.revertedWithCustomError(staking, "InvalidRewardRate")

        await expect(staking.connect(signer).updateRewardRates([2,3,4,5,6,7,8,9,10,11], [2,3,4,5,4,7,8,9,10,11]))
        .to.be.revertedWithCustomError(staking, "InvalidRewardRate")

        await expect(staking.connect(signer).updateRewardRates([2,3,4,5,6,7,8,9,10,11], [2,3,4,5,6,7,8,9,10,9]))
        .to.be.revertedWithCustomError(staking, "InvalidRewardRate")

        await expect(staking.connect(signer).updateRewardRates([2,3,4,5,6,7,8,9,10,9], [2,3,4,5,6,7,8,9,10,11]))
        .to.be.revertedWithCustomError(staking, "InvalidRewardRate")

        await expect(staking.connect(signer).updateRewardRates([2,3,4,5,6,7,8,9,10], [2,3,4,5,6,7,8,9,10,11]))
        .to.be.revertedWithCustomError(staking, "InvalidTiersLength")

        await expect(staking.connect(signer).updateRewardRates([2,3,4,5,6,7,8,9,10,11], [2,3,4,5,6,7,8,9,10]))
        .to.be.revertedWithCustomError(staking, "InvalidTiersLength")

        const arr1 = [2,3,4,5,6,7,8,9,10,11]
        const arr2 = [3,4,5,6,7,8,9,10,11,12]
        await expect(staking.connect(signer).updateRewardRates(arr1, arr2))
        .to.emit(staking, "UpdateRewardRates")
        .withArgs(arr1, arr2)

        for(let i = 0; i < arr1.length; i++){
            assert.equal((await staking.tierInfo(i)).rewardRateFlexible, arr1[i], "rewardRateFlexible is correct")
            assert.equal((await staking.tierInfo(i)).rewardRateLocked, arr2[i], "rewardRateLocked is correct")
        }
    })

    it('Calculates rewards with updated stakes', async () => {
        const rewardID = await staking.rewardID()
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");

        staking = await _eeseeStaking.deploy(
            ESE.address, 
            [
                {volumeBreakpoint: 0, rewardRateFlexible: 0/*ethers.utils.parseUnits('0.001', 'ether')*/, rewardRateLocked: 0}
            ],
            accessManager.address,
            zeroAddress
        )

        await ESE.approve(staking.address, '99999999999999999999999999999')
        await ESE.transfer(staking.address, '50')


        await staking.deposit(1, 0, rewardID, '0x')
        await time.increase(5000)
        assert.equal((await staking.pendingReward(false, signer.address)).toString(), '0')

        await staking.connect(signer).updateRewardRates([ethers.utils.parseUnits('0.001', 'ether')], [0])
        await time.increase(2000)
        assert.equal((await staking.pendingReward(false, signer.address)).toString(), '2')

        await staking.connect(signer).updateRewardRates([ethers.utils.parseUnits('0.005', 'ether')], [0])
        await time.increase(2000)
        assert.equal((await staking.pendingReward(false, signer.address)).toString(), '12')

        await staking.connect(signer).updateRewardRates([0], [0])
        await time.increase(2000)
        assert.equal((await staking.pendingReward(false, signer.address)).toString(), '12')

        await expect(staking.connect(signer).withdraw(false, 1, signer.address))
        .to.emit(staking, "WithdrawFlexible")
        .withArgs(signer.address, signer.address, 13)
    })

    it('Calculates rewards with changing tiers', async () => {
        const rewardID = await staking.rewardID()
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");

        staking = await _eeseeStaking.deploy(
            ESE.address, 
            [
                {volumeBreakpoint: 1, rewardRateFlexible: ethers.utils.parseUnits('0.001', 'ether'), rewardRateLocked: 0}, 
                {volumeBreakpoint: 2, rewardRateFlexible: ethers.utils.parseUnits('0.005', 'ether'), rewardRateLocked: 0},
                {volumeBreakpoint: 3, rewardRateFlexible: ethers.utils.parseUnits('0.01', 'ether'), rewardRateLocked: 0}
            ],
            accessManager.address,
            zeroAddress
        )

        await ESE.approve(staking.address, '99999999999999999999999999999')
        await ESE.transfer(staking.address, '500')
        await staking.grantVolumeUpdater(eesee.address)


        await staking.deposit(1, 0, rewardID, '0x')
        await time.increase(5000)
        assert.equal((await staking.pendingReward(false, signer.address)).toString(), '5')

        await staking.connect(eesee).addVolume(1, signer.address)
        await time.increase(5000)
        assert.equal((await staking.pendingReward(false, signer.address)).toString(), (5 + 25).toString())

        await staking.connect(eesee).addVolume(1, signer.address)
        await time.increase(5000)
        assert.equal((await staking.pendingReward(false, signer.address)).toString(), (5 + 25 + 50).toString())

        await expect(staking.connect(signer).withdraw(false, 1, signer.address))
        .to.emit(staking, "WithdrawFlexible")
        .withArgs(signer.address, signer.address, 5 + 25 + 50 + 1)
    })

    it('prevents withdraws flexible if not enough funds are in the contract', async () => {
        const rewardID = await staking.rewardID()
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");

        staking = await _eeseeStaking.deploy(
            ESE.address, 
            [{volumeBreakpoint: 1000, rewardRateFlexible: ethers.utils.parseUnits('1', 'ether'), rewardRateLocked: ethers.utils.parseUnits('2', 'ether')}],
            accessManager.address,
            zeroAddress
        )
        await ESE.transfer(staking.address, 5)
        await ESE.approve(staking.address, '1')
        await ESE.connect(acc2).approve(staking.address, '2')
        const duration = await staking.duration()

        await expect(staking.deposit(1, 0, rewardID, '0x'))
            .to.emit(staking, "DepositFlexible")
            .withArgs(signer.address, 1)
        await expect(staking.connect(acc2).deposit(2, duration, rewardID, '0x'))
            .to.emit(staking, "DepositLocked")
            .withArgs(acc2.address, 2, anyValue)

        await time.increase(1000)

        const balanceBefore = await ESE.balanceOf(signer.address)
        await expect(staking.withdraw(false, 1, signer.address)) 
        .to.emit(staking, "WithdrawFlexible")
        .withArgs(signer.address, signer.address, 5+1)
        const balanceAfter = await ESE.balanceOf(signer.address)
        assert.equal(balanceAfter.sub(balanceBefore).toString(), '6')

        await time.increase(7776001)

        await ESE.transfer(staking.address, 10)
        const balanceBefore2 = await ESE.balanceOf(acc3.address)
        await expect(staking.connect(acc2).withdraw(true, 1, acc3.address)) 
        .to.emit(staking, "WithdrawLocked")
        .withArgs(acc2.address, acc3.address, 10+1)
        const balanceAfter2 = await ESE.balanceOf(acc3.address)
        assert.equal(balanceAfter2.sub(balanceBefore2).toString(), '11')

        await time.increase(1000)
        
        const balanceBefore3 = await ESE.balanceOf(acc2.address)
        await expect(staking.connect(acc2).withdraw(true, 1, acc2.address)) 
        .to.emit(staking, "WithdrawLocked")
        .withArgs(acc2.address, acc2.address, 1)
        const balanceAfter3 = await ESE.balanceOf(acc2.address)
        assert.equal(balanceAfter3.sub(balanceBefore3).toString(), '1')
    })
});
