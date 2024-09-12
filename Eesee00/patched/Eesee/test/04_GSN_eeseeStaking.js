const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const assert = require("assert");
  const { getContractAddress } = require('@ethersproject/address')
  const { GsnTestEnvironment } = require("@opengsn/dev")
  const { RelayProvider } = require('@opengsn/provider')
  const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers")
  const createPermit = require('./utils/createPermit')

  describe("eeseeStaking", function () {
    if(network.name != 'testnet') return
    let ESE;
    let eesee, _eesee;
    let signer, acc2, acc3
    let _signer, _acc2, _acc3
    let staking
    let accessManager
    let snapshotId
    let signers
    const zeroAddress = "0x0000000000000000000000000000000000000000"
  
    this.beforeAll(async() => {
        let env = await GsnTestEnvironment.startGsn('localhost');
        [signer, acc2, acc3, eesee] = await ethers.getSigners()

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
            {addr: futureStakingAddress, amount: '2000000000000000000000000'}
        ])
        await ESE.initialize(0)

        staking = await _eeseeStaking.deploy(
            ESE.address, 
            [{volumeBreakpoint: 1000, rewardRateFlexible: ethers.utils.parseUnits('0.0001', 'ether'), rewardRateLocked: ethers.utils.parseUnits('0.0002', 'ether')}, {volumeBreakpoint: 2000, rewardRateFlexible:  ethers.utils.parseUnits('0.001', 'ether'), rewardRateLocked:  ethers.utils.parseUnits('0.002', 'ether')}], 
            accessManager.address,
            env.contractsDeployment.forwarderAddress
        )
        await staking.deployed()

        await staking.grantVolumeUpdater(eesee.address)

        await ESE.connect(acc2).approve(staking.address, '100000000000000000000')
        await ESE.approve(staking.address, '99999999999999999999999999999')

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
        [signer, acc2, acc3, eesee, ...rest] = signers;
        [_signer, _acc2, _acc3, _eesee, ...rest] = _signers;
        console.log('FIN')
    })
    it('Inits', async () => {
        assert.equal((await staking.duration()).toString(), 60*60*24*90, "duration is correct")
        assert.equal((await staking.ESE()).toString(), ESE.address, "ESE is correct")
        assert.equal(await staking.volumeUpdaters(eesee.address), true, "eesee is correct")
        assert.equal((await staking.tierInfo(0)).volumeBreakpoint.toString(), 1000, "volume breakpoint is correct")
        assert.equal((await staking.tierInfo(0)).rewardRateFlexible.toString(), ethers.utils.parseUnits('0.0001', 'ether'), "rewardRateFlexible is correct")
        assert.equal((await staking.tierInfo(0)).rewardRateLocked.toString(), ethers.utils.parseUnits('0.0002', 'ether'), "rewardRateLocked is correct")
    })
   
    it('Stakes with permit', async () => {
        const currentTimestamp = (await ethers.provider.getBlock()).timestamp
        const deadline = currentTimestamp + 10000

        await ESE.approve(staking.address, 0)
        const rewardID = await staking.rewardID()
        const volume = await staking.volume(signer.address)
        const tier = await staking.tier(volume)
        assert.equal((await staking.tierInfo(tier)).rewardRateFlexible.toString(), ethers.utils.parseUnits('0.0001', 'ether'), "Reward rate is correct")

        const permit_ = await createPermit(signer, staking, '2', deadline, ESE)
        const params__ = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['2', deadline, permit_.v, permit_.r, permit_.s]
          );

        let tx = await staking.connect(signer).deposit(1, 0, rewardID, params__)
        let receipt = await tx.wait()
        let args = receipt.events.filter((x)=>{ return x.event=='DepositFlexible' })[0].args
        assert.equal(args[0].toString(), signer.address, "ID is correct")
        assert.equal(args[1].toString(), '1', "root is correct")
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
        await expect(staking.connect(_signer).addVolume(1000, signer.address)).to.be.revertedWithCustomError(staking, 'CallerNotVolumeUpdater')
        await staking.connect(_eesee).addVolume(1000, signer.address)

        //const __timestamp = (await ethers.provider.getBlock()).timestamp + 1

        tx = await staking.connect(signer).deposit(1, 0, rewardID, '0x')
        receipt = await tx.wait()
        args = receipt.events.filter((x)=>{ return x.event=='DepositFlexible' })[0].args
        assert.equal(args[0].toString(), signer.address, "ID is correct")
        assert.equal(args[1].toString(), '1', "root is correct")

        const earnedBefore = await staking.pendingReward(false, signer.address)
        const _stakeTimestamp = (await ethers.provider.getBlock()).timestamp

        await time.increase(50000)
        const ___timestamp = (await ethers.provider.getBlock()).timestamp

        assert.equal((await staking.pendingReward(false, signer.address)).toString(), (earnedBefore.add((2*Math.floor((___timestamp - _stakeTimestamp) * 0.001)).toString())).toString(), "earned is correct")
        assert.equal((await staking.userInfo(false, signer.address)).amount.toString(), '2', "stake is correct")
        assert.equal((await staking.userInfo(false, signer.address)).reward.toString(), earnedBefore.toString(), "reward is correct")
        assert.equal((await staking.volume(signer.address)).toString(), '1000', "volume is correct")
        assert.equal((await staking.tier(await staking.volume(signer.address))).toString(), 1, "tier is correct")
        assert.equal((await staking.totalDeposits()).toString(), '2', "totalDeposits is correct")
    })

    it('Withdraw', async () => {
        await expect(staking.withdraw(false, 100000, acc2.address)).to.be.revertedWithCustomError(staking, "InsufficientStake")
        await expect(staking.withdraw(false, 1, zeroAddress)).to.be.revertedWithCustomError(staking, "InvalidRecipient")

        const balanceBefore = await ESE.balanceOf(acc2.address)
        
        const __earned = (await staking.pendingReward(false, signer.address))
        const ____unstakeTimestamp = (await ethers.provider.getBlock()).timestamp
        tx = await staking.connect(signer).withdraw(false, 0, acc2.address)
        receipt = await tx.wait()
        const ___unstakeTimestamp = (await ethers.provider.getBlock()).timestamp

        const earnedBefore = __earned.add(Math.floor(0.002 * (___unstakeTimestamp - ____unstakeTimestamp)))
        args = receipt.events.filter((x)=>{ return x.event=='WithdrawFlexible' })[0].args
        assert.equal(args[0].toString(), signer.address, "correct")
        assert.equal(args[1].toString(), acc2.address, "correct")
        assert.equal(args[2].toString(), earnedBefore.toString(), "correct")

        const balanceAfter = await ESE.balanceOf(acc2.address)
        assert.equal((balanceAfter.sub(balanceBefore)).toString(), earnedBefore.toString(), "reward collected is correct")

        const balanceBeforeSigner = await ESE.balanceOf(signer.address)
        
        const _earned = (await staking.pendingReward(false, signer.address))
        const __unstakeTimestamp = (await ethers.provider.getBlock()).timestamp
        tx = await staking.connect(signer).withdraw(false, 2, signer.address)
        receipt = await tx.wait()
        const _unstakeTimestamp = (await ethers.provider.getBlock()).timestamp

        const stake = _earned.add(Math.floor(0.002 * (_unstakeTimestamp - __unstakeTimestamp))).add(2) //We staked 2 tokens
        args = receipt.events.filter((x)=>{ return x.event=='WithdrawFlexible' })[0].args
        assert.equal(args[0].toString(), signer.address, "correct")
        assert.equal(args[1].toString(), signer.address, "correct")
        assert.equal(args[2].toString(), stake.toString(), "correct")


        const balanceAfterSigner = await ESE.balanceOf(signer.address)
        assert.equal((balanceAfterSigner.sub(balanceBeforeSigner)).toString(), stake.toString(), "stake collected is correct")

        assert.equal((await staking.pendingReward(false, signer.address)).toString(), '0', "earned is correct")
        assert.equal((await staking.userInfo(false, signer.address)).amount.toString(), '0', "stake is correct")
        assert.equal((await staking.userInfo(false, signer.address)).reward.toString(), '0', "reward is correct")
        assert.equal((await staking.userInfo(false, signer.address)).unlockTime.toString(), '0', "unlockTime is correct")
    })
});
