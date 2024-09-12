const {
  time, mine
} = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')
const { ethers, network } = require('hardhat')
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const assert = require('assert')
describe('ESE', function () {
  let ESE
  let signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, acc10
  let snapshotId, snapshotId2, snapshotId3
  let TGE
  const zeroAddress = "0x0000000000000000000000000000000000000000"
  this.beforeAll(async () => {
    [signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, acc10] = await ethers.getSigners()
    const _ESE = await hre.ethers.getContractFactory('ESE')

    ESE = await _ESE.deploy([
      {
          cliff: 15768000,
          duration: 15768000,
          TGEMintShare: 5000//50%
      },
      {
          cliff: 31536000,
          duration: 15768000,
          TGEMintShare: 2000//20%
      },
      {
          cliff: 31536000,
          duration: 31536000,
          TGEMintShare: 2000//20%,
      }
    ]
    )
    await ESE.deployed()

    await ESE.addVestingBeneficiaries(0, [
      {addr: signer.address, amount:500000000}, 
      {addr: acc2.address, amount:500000000}
    ])
    await ESE.addVestingBeneficiaries(1, [
      {addr: signer.address, amount: 1000000000},
      {addr: acc2.address, amount: 1000000000},
      {addr: acc3.address, amount: 1000000000},
      {addr: acc4.address, amount: 1000000000},
      {addr: acc5.address, amount: 1000000000},
      {addr: acc6.address, amount: 1000000000},
      {addr: acc7.address, amount: 1000000000},
      {addr: acc8.address, amount: 1000000000},
      {addr: acc9.address, amount: 1000000000},
      {addr: acc10.address, amount: 1000000000}
    ])
    await ESE.addVestingBeneficiaries(2, [
      {addr:signer.address, amount: 10000000000},
      {addr: acc2.address, amount: 10000000000},
      {addr: acc3.address, amount: 10000000000},
      {addr: acc4.address, amount: 10000000000},
      {addr: acc5.address, amount: 10000000000},
      {addr: acc6.address, amount: 10000000000},
      {addr: acc7.address, amount: 10000000000},
      {addr: acc8.address, amount: 10000000000},
      {addr: acc9.address, amount: 10000000000},
      {addr: acc10.address, amount: 10000000000}
    ])
    await ESE.initialize(0)
    TGE = await time.latest()
  })
  it('Init is correct', async () => {
    const presale = await ESE.vestingStages(0)
    assert.equal(presale.amount, 500000000, 'amount is correct')
    assert.equal(presale.cliff, 15768000, 'cliff is correct')
    assert.equal(presale.duration, 15768000, 'duration is correct')

    const privateSale = await ESE.vestingStages(1)
    assert.equal(privateSale.amount, 8000000000, 'amount is correct')
    assert.equal(privateSale.cliff, 31536000, 'cliff is correct')
    assert.equal(privateSale.duration, 15768000, 'duration is correct')

    const publicSale = await ESE.vestingStages(2)
    assert.equal(publicSale.amount, 80000000000, 'amount is correct')
    assert.equal(publicSale.cliff, 31536000, 'cliff is correct')
    assert.equal(publicSale.duration, 31536000, 'duration is correct')

    assert.equal(await ESE.name(), 'eesee', 'TGE is correct')
    assert.equal(await ESE.symbol(), '$ESE', 'TGE is correct')
    assert.equal((await ESE.decimals()).toString(), '18', 'TGE is correct')
    assert.equal((await ESE.vestingStagesLength()).toString(), '3', 'vestingStagesLength is correct')
    assert.equal(TGE, await ESE.TGE(), 'TGE is correct')
  })

  it('Before cliffs', async () => {
    assert.equal((await ESE.balanceOf(signer.address)).toString(), '2450000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc2.address)).toString(), '2450000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc3.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc4.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc5.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc6.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc7.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc8.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc9.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc10.address)).toString(), '2200000000', 'balanceOf is correct')
    
    assert.equal((await ESE.totalSupply()).toString(), '22500000000', 'totalSupply is correct')

    await time.increase(7884000)//3 month later

    assert.equal((await ESE.balanceOf(signer.address)).toString(), '2450000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc2.address)).toString(), '2450000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc3.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc4.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc5.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc6.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc7.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc8.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc9.address)).toString(), '2200000000', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc10.address)).toString(), '2200000000', 'balanceOf is correct')
    
    assert.equal((await ESE.totalSupply()).toString(), '22500000000', 'totalSupply is correct')

    await expect(ESE.connect(signer).transfer(acc10.address, '2450000000'))
      .to.emit(ESE, 'Transfer')
      .withArgs(signer.address, acc10.address, '2450000000')

    assert.equal((await ESE.balanceOf(signer.address)).toString(), '0', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc10.address)).toString(), '4650000000', 'balanceOf is correct')
  })
  let vestedAmountTransfered
  it('After cliff has started', async () => {
      const _time = await time.increase(15768000)//6 month later

      let vestedAmount = 250000000 * (_time - (TGE + 15768000)) / 15768000;
      const _vestedAmount = await ESE.vestedAmount(0, signer.address)
      assert.equal(_vestedAmount, parseInt(vestedAmount), 'vestedAmount is correct')

      await expect(ESE.totalVestedAmount(3)).to.be.revertedWith("ESE: Invalid stage")
      await expect(ESE.vestedAmount(3, acc2.address)).to.be.revertedWith("ESE: Invalid stage")

      const totalVestedAmount = await ESE.totalVestedAmount(0)
      assert.equal(totalVestedAmount, (parseInt(vestedAmount*2)).toString(), 'totalVestedAmount is correct')


      assert.equal((await ESE.balanceOf(signer.address)).toString(), (0 + parseInt(vestedAmount)).toString(), 'balanceOf is correct')
      assert.equal((await ESE.balanceOf(acc2.address)).toString(), (2450000000 + parseInt(vestedAmount)).toString(), 'balanceOf is correct')
      
      assert.equal((await ESE.balanceOf(acc3.address)).toString(), '2200000000', 'balanceOf is correct')
      assert.equal((await ESE.balanceOf(acc4.address)).toString(), '2200000000', 'balanceOf is correct')
      assert.equal((await ESE.balanceOf(acc5.address)).toString(), '2200000000', 'balanceOf is correct')
      assert.equal((await ESE.balanceOf(acc6.address)).toString(), '2200000000', 'balanceOf is correct')
      assert.equal((await ESE.balanceOf(acc7.address)).toString(), '2200000000', 'balanceOf is correct')
      assert.equal((await ESE.balanceOf(acc8.address)).toString(), '2200000000', 'balanceOf is correct')
      assert.equal((await ESE.balanceOf(acc9.address)).toString(), '2200000000', 'balanceOf is correct')
      assert.equal((await ESE.balanceOf(acc10.address)).toString(), '4650000000', 'balanceOf is correct')
      await mine() 
      const __time = await time.latest() + 1
      vestedAmount += 250000000 * (__time - _time) / 15768000;
      await time.setNextBlockTimestamp(__time)

      await expect(ESE.connect(acc2).transfer(acc10.address, (2450000001 + parseInt(vestedAmount)).toString()))
      .to.be.revertedWith("ERC20: transfer amount exceeds balance")
      
      await mine()
      const ___time = await time.latest() + 1
      vestedAmount += 250000000 * (___time - __time) / 15768000;
      await time.setNextBlockTimestamp(___time)
      vestedAmountTransfered = parseInt(vestedAmount)

      await expect(await ESE.connect(acc2).transfer(acc10.address, (2450000000 + parseInt(vestedAmount)).toString()))
      .to.emit(ESE, 'Transfer')
      .withArgs(acc2.address, acc10.address, (2450000000 + parseInt(vestedAmount)).toString())
      .to.emit(ESE, 'Transfer')
      .withArgs("0x0000000000000000000000000000000000000000", acc2.address, parseInt(vestedAmount).toString())

      assert.equal((await ESE.balanceOf(acc10.address)).toString(), (7100000000 + parseInt(vestedAmount)).toString(), 'balanceOf is correct')
      assert.equal((await ESE.balanceOf(acc2.address)).toString(), '0', 'balanceOf is correct')
  })

  it('Cliff has ended', async () => {
    const _time = await time.increase(7884000 * 2)//6 month later

    let vestedAmount = 800000000 * (_time - (TGE + 31536000)) / 15768000;
    let vestedAmount2 = 8000000000 * (_time - (TGE + 31536000)) / 31536000;

    const vestedAmountPrivate = await ESE.vestedAmount(1, acc3.address)
    const vestedAmountPublic = await ESE.vestedAmount(2, acc3.address)
    assert.equal(vestedAmountPrivate, parseInt(vestedAmount), 'vestedAmount is correct')
    assert.equal(vestedAmountPublic, parseInt(vestedAmount2), 'vestedAmount is correct')

    const totalVestedAmountPrivate = await ESE.totalVestedAmount(1)
    const totalVestedAmountPublic = await ESE.totalVestedAmount(2)
    assert.equal(totalVestedAmountPrivate, parseInt(vestedAmount*10), 'totalVestedAmount is correct')
    assert.equal(totalVestedAmountPublic, parseInt(vestedAmount2*10), 'totalVestedAmount is correct')

    assert.equal((await ESE.balanceOf(signer.address)).toString(), (250000000 + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc2.address)).toString(), (250000000 - vestedAmountTransfered + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
  
    assert.equal((await ESE.balanceOf(acc3.address)).toString(), (2200000000 + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc4.address)).toString(), (2200000000 + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc5.address)).toString(), (2200000000 + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc6.address)).toString(), (2200000000 + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc7.address)).toString(), (2200000000 + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc8.address)).toString(), (2200000000 + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc9.address)).toString(), (2200000000 + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc10.address)).toString(), (7100000000 + vestedAmountTransfered + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
    
    await mine()
    const __time = await time.latest() + 1
    vestedAmount += 800000000 * (__time - _time) / 15768000;
    vestedAmount2 += 8000000000 * (__time - _time) / 31536000;
    await time.setNextBlockTimestamp(__time)

    await expect(await ESE.connect(acc3).transfer(acc10.address, (2200000000 + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString()))
      .to.emit(ESE, 'Transfer')
      .withArgs(acc3.address, acc10.address, (2200000000 + parseInt(vestedAmount) + parseInt(vestedAmount2)).toString())
      .to.emit(ESE, 'Transfer')
      .withArgs("0x0000000000000000000000000000000000000000", acc3.address, (parseInt(vestedAmount) + parseInt(vestedAmount2)).toString())
  
    assert.equal((await ESE.balanceOf(acc3.address)).toString(), '0', 'balanceOf is correct')
    assert.equal((await ESE.balanceOf(acc10.address)).toString(), (9300000000 + vestedAmountTransfered + 2*parseInt(vestedAmount) + 2*parseInt(vestedAmount2)).toString(), 'balanceOf is correct')
  
    const tx = await ESE.connect(acc10).transfer(acc3.address, 9300000000 + vestedAmountTransfered)
    console.log('GAS FOR TRANSFER:', (await tx.wait()).gasUsed.toString())
  })
  it('burns tokens', async () => {
    const __time = await time.latest()
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    await time.setNextBlockTimestamp(__time + 99999999999999)
    await mine()
    const balance = await ESE.balanceOf(acc3.address)
    await expect(await ESE.connect(acc3).burn(balance))
      .to.emit(ESE, 'Transfer')
      .withArgs(acc3.address, zeroAddress, balance)
    assert.equal((await ESE.balanceOf(acc3.address)).toString(), '0', 'tokens not burned')
  })
  it('Burn works correctly', async () => {
    
    const totalVestedAmount = async () => {
      let totalVestedAmount = ethers.BigNumber.from(0)
      const vestingStagesLength = await ESE.vestingStagesLength()
      for (let i = 0; i < vestingStagesLength.toNumber(); i++) {
        totalVestedAmount = totalVestedAmount.add(await ESE.totalVestedAmount(i))
      }
      return totalVestedAmount
    }
    const vestedAmount = async (accountAddress) => {
      let vestedAmount = ethers.BigNumber.from(0)
      const vestingStagesLength = await ESE.vestingStagesLength()
      for (let i = 0; i < vestingStagesLength.toNumber(); i++) {
        vestedAmount = vestedAmount.add(await ESE.vestedAmount(i, accountAddress))
      }
      return vestedAmount 
    }

    const snapshotId = await network.provider.send('evm_snapshot')

    let balanceBeforeBurn = await ESE.balanceOf(acc4.address)
    let totalSupplyBeforeBurn = await ESE.totalSupply()
    let burnAmount = '777'
    let totalVestedAmountBefore = await totalVestedAmount()
    let vestedAmountBefore = await vestedAmount(acc4.address)

    let invalidBurnAmount = balanceBeforeBurn.add(306) // balanceOf(acc4.address) in tx block will be +305 to balanceBeforeBurn because of vesting

    await expect(ESE.connect(acc4).burn(invalidBurnAmount))
      .to.be.revertedWith('ERC20: burn amount exceeds balance')

    await expect(ESE.connect(acc4).burn(burnAmount))
      .to.emit(ESE, 'Transfer')
      .withArgs('0x0000000000000000000000000000000000000000', acc4.address, anyValue)
      .to.emit(ESE, 'Transfer')
      .withArgs(acc4.address, '0x0000000000000000000000000000000000000000', burnAmount)
  
    let balanceAfterBurn = await ESE.balanceOf(acc4.address)
    let totalSupplyAfterBurn = await ESE.totalSupply()
    let totalVestedAmountAfter = await totalVestedAmount()
    let totalVestedAmountDifference = totalVestedAmountAfter.sub(totalVestedAmountBefore)
    let vestedAmountAfter = await vestedAmount(acc4.address)
    let vestedAmountDifference = vestedAmountAfter.sub(vestedAmountBefore)

    assert.equal((balanceBeforeBurn.sub(balanceAfterBurn).add(vestedAmountDifference)).toString(), burnAmount, 'Amount of tokens burned is correct')
    assert.equal((totalSupplyBeforeBurn.sub(totalSupplyAfterBurn).add(totalVestedAmountDifference)).toString(), burnAmount, 'totalSupply after burn is correct')

    await expect(ESE.connect(acc3).burnFrom(acc4.address, burnAmount))
      .to.be.revertedWith('ERC20: insufficient allowance')
    
    balanceBeforeBurn = await ESE.balanceOf(acc4.address)
    invalidBurnAmount = balanceBeforeBurn.add(123123)
    await ESE.connect(acc4).increaseAllowance(acc3.address, balanceBeforeBurn.add(123123))

    balanceBeforeBurn = await ESE.balanceOf(acc4.address)
    totalSupplyBeforeBurn = await ESE.totalSupply()
    burnAmount = balanceBeforeBurn
    totalVestedAmountBefore = await totalVestedAmount()
    vestedAmountBefore = await vestedAmount(acc4.address)

    await expect(ESE.connect(acc3).burnFrom(acc4.address, invalidBurnAmount))
      .to.be.revertedWith('ERC20: burn amount exceeds balance')
    await expect(ESE.connect(acc3).burnFrom(acc4.address, invalidBurnAmount.add(1)))
      .to.be.revertedWith('ERC20: insufficient allowance')
    await ESE.connect(acc4).approve(acc3.address, burnAmount)
    await expect(ESE.connect(acc4).burn(burnAmount))
      .to.emit(ESE, 'Transfer')
      .withArgs(acc4.address, '0x0000000000000000000000000000000000000000', burnAmount)

    balanceAfterBurn = await ESE.balanceOf(acc4.address)
    totalSupplyAfterBurn = await ESE.totalSupply()
    totalVestedAmountAfter = await totalVestedAmount()
    totalVestedAmountDifference = totalVestedAmountAfter.sub(totalVestedAmountBefore)
    vestedAmountAfter = await vestedAmount(acc4.address)
    vestedAmountDifference = vestedAmountAfter.sub(vestedAmountBefore)

    assert.equal((balanceBeforeBurn.sub(balanceAfterBurn).add(vestedAmountDifference)).toString(), burnAmount, 'Amount of tokens burned is correct')
    assert.equal((totalSupplyBeforeBurn.sub(totalSupplyAfterBurn).add(totalVestedAmountDifference)).toString(), burnAmount, 'totalSupply after burn is correct')

    await network.provider.send("evm_revert", [snapshotId])
  })

  it('can add addresses in multiple tranactions', async () => {
    if(network.name != 'testnet') {
    const _ESE = await hre.ethers.getContractFactory('ESE')

    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    let presaleBeneficiaries = []
    let privateSaleBeneficiaries = []
    let publicSaleBeneficiaries = []
    for (let i = 0; i < 100; i++) {
      let wallet = ethers.Wallet.createRandom()
      presaleBeneficiaries.push({addr:wallet.address, amount: getRandomInt(200) })
      privateSaleBeneficiaries.push({addr:wallet.address, amount: getRandomInt(200) })
      publicSaleBeneficiaries.push({addr:wallet.address, amount: getRandomInt(200) })
    }

    let presaleBeneficiaries2 = []
    let privateSaleBeneficiaries2 = []
    for (let i = 0; i < 200; i++) {
      let wallet = ethers.Wallet.createRandom()
      presaleBeneficiaries2.push({addr:wallet.address, amount: getRandomInt(200) })
      privateSaleBeneficiaries2.push({addr:wallet.address, amount: getRandomInt(200) })
    }

    ESE = await _ESE.deploy([
      {
          cliff: 15768000,
          duration: 15768000,
          TGEMintShare: 0//50%
      },
      {
          cliff: 31536000,
          duration: 15768000,
          TGEMintShare: 2000
      },
      {
          cliff: 31536000,
          duration: 31536000,
          TGEMintShare: 10000
      }
    ])

    await ESE.addVestingBeneficiaries(0, presaleBeneficiaries)
    await ESE.addVestingBeneficiaries(1, privateSaleBeneficiaries)
    await ESE.addVestingBeneficiaries(2, publicSaleBeneficiaries)

    await ESE.addVestingBeneficiaries(0, presaleBeneficiaries2)
    await ESE.addVestingBeneficiaries(1, privateSaleBeneficiaries2)

    await expect(ESE.addVestingBeneficiaries(3, [presaleBeneficiaries2[0]])).to.be.revertedWith('ESE: Invalid stage')
    await expect(ESE.addVestingBeneficiaries(0, [presaleBeneficiaries2[0]])).to.be.revertedWith('ESE: Beneficiary already added')
    await expect(ESE.addVestingBeneficiaries(2, [publicSaleBeneficiaries[0]])).to.be.revertedWith('ESE: Beneficiary already added')
    await expect(ESE.addVestingBeneficiaries(2, [{addr:zeroAddress, amount: 5}])).to.be.revertedWith('ESE: Invalid Beneficiary')

    await expect(ESE.transfer(ESE.address, 1)).to.be.revertedWith('ESE: TGE not started')
    await expect(ESE.connect(acc2).initialize(1)).to.be.revertedWith('ESE: Caller not _initializer')
    await expect(ESE.connect(acc2).addVestingBeneficiaries(2, [publicSaleBeneficiaries[0]])).to.be.revertedWith('ESE: Caller not _initializer')
    
    await expect(ESE.initialize(1)).to.be.revertedWith('ESE: Invalid TGE timestamp')
    await expect(ESE.initialize('999999999999999999999')).to.be.revertedWith('ESE: Invalid TGE timestamp')
    TGE = await time.latest() + 200
    await expect(ESE.initialize(TGE)).to.emit(ESE, "Initialize")
    assert.equal(TGE, await ESE.TGE(), 'TGE is correct')
    
    await expect(ESE.initialize(TGE)).to.be.revertedWith('ESE: Already initialized')
    await expect(ESE.addVestingBeneficiaries(2, [publicSaleBeneficiaries[0]])).to.be.revertedWith('ESE: Already initialized')
    await expect(ESE.transfer(ESE.address, 10)).to.be.revertedWith('ESE: TGE not started')
  }
  })

  it('reverts constructor', async () => {
    const _ESE = await hre.ethers.getContractFactory('ESE')
    await expect(_ESE.deploy([
      {
          cliff: 15768000,
          duration: 15768000,
          TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 10001
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      }
    ])).to.be.revertedWith("ESE: Invalid TGEMintShare")

    await expect(_ESE.deploy([
      {
          cliff: 15768000,
          duration: 15768000,
          TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 10000
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      }
    ])).to.be.revertedWith("ESE: Invalid vesting stages")
  })

  it('cannot mint more than maxuint96 in initialization', async () => {
    const _ESE = await hre.ethers.getContractFactory('ESE')
    ESE = await _ESE.deploy([
      {
          cliff: 15768000,
          duration: 15768000,
          TGEMintShare: 0
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 10000
      },
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 0
      }
    ])

    await expect(ESE.addVestingBeneficiaries(0, [{addr: signer.address, amount: '1000000000000000000000000001'}])).to.be.revertedWith("ESE: Overflow")
    await expect(ESE.addVestingBeneficiaries(0, [{addr: signer.address, amount: '1000000000000000000000000000'}]))
    .to.emit(ESE, "AddVestingBeneficiary").withArgs(0, signer.address, '1000000000000000000000000000', 0)
    await expect(ESE.addVestingBeneficiaries(1, [{addr: signer.address, amount: '1'}])).to.be.revertedWith("ESE: Overflow")
    await expect(ESE.addVestingBeneficiaries(2, [{addr: signer.address, amount: '1'}])).to.be.revertedWith("ESE: Overflow")
  })

  it('works with 0 amount vesting', async () => {
    const _ESE = await hre.ethers.getContractFactory('ESE')
    ESE = await _ESE.deploy([
      {
        cliff: 0,
        duration: 0,
        TGEMintShare: 10000
      }
    ])
    await expect(ESE.addVestingBeneficiaries(0, [{addr: signer.address, amount: '1000'}]))
    .to.emit(ESE, "AddVestingBeneficiary").withArgs(0, signer.address, '0', 1000)
    await ESE.initialize(0)

    assert.equal(await ESE.totalSupply(), 1000, 'amount is correct')
    await expect(ESE.transfer(acc2.address,1000)).to.emit(ESE, 'Transfer')
    .withArgs(signer.address, acc2.address, 1000)
  })
})