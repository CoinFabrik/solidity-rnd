const { expect } = require('chai');
const { ethers } = require('hardhat');
const assert = require('assert');
const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');
const { getContractAddress } = require('@ethersproject/address')
const {time} = require("@nomicfoundation/hardhat-network-helpers");
describe('eeseeMining', function () {
    let claimerWallet = null;
    let claimerWalletBalances = []
    let ESE;
    let pool;
    let leavesOfMerkleTrees = [];
    let merkleTrees = [];
    const getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const getProof = (tree, address) => {
        let proof = null
        for (const [i, v] of tree.entries()) {
            if (v[0] === address) {
                proof = tree.getProof(i);
              }
        }
        return proof
    }
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const oneAddress = "0x0000000000000000000000000000000000000001"
    this.beforeAll(async() => {
        [signer, acc2, claimerWallet] = await ethers.getSigners()
        
        const _ESE = await hre.ethers.getContractFactory('ESE');
        const _pool = await hre.ethers.getContractFactory('EeseeMining');
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");

        accessManager = await _eeseeAccessManager.deploy();
        await accessManager.deployed()
        await accessManager.grantRole("0x1e0e935a4b597d14b19412d1d1383dc2a6d2dce1de544677c1ef3f24ff294f05", signer.address)

        ESE = await _ESE.deploy([{
                cliff: 0,
                duration: 0,
                TGEMintShare: 10000
            }
        ])
        await ESE.deployed()
        await ESE.addVestingBeneficiaries(0, [{addr: signer.address, amount: '1000000000000000000000000000'}])
        await ESE.initialize(0)
        
        pool = await _pool.deploy(
            ESE.address, 
            accessManager.address,
            zeroAddress
        )
        await pool.deployed()


        for (let i = 0; i < 5; i ++) {
            let leaves = [];
            for (let j = 0; j < 10; j ++) {
                const wallet = ethers.Wallet.createRandom().connect(ethers.provider)
                const randomInt = getRandomInt(1, 1000000).toString()
                leaves.push([
                    wallet.address, randomInt
                ])
            }
            //if (i !== 0) {
                let randomInt = getRandomInt(1, 1000000).toString()
                leaves.push([
                    claimerWallet.address, randomInt
                ])
                claimerWalletBalances.push(randomInt)
            //}
            leavesOfMerkleTrees.push(leaves)
            merkleTrees.push(StandardMerkleTree.of(leaves, ['address', 'uint256']))
        }

        await signer.sendTransaction({to:claimerWallet.address, value: ethers.utils.parseEther('1.0')})
        await ESE.transfer(pool.address, '1000000000000000000000')
    })
    it('Check initial values', async () => {
        const rewardToken = await pool.ESE()
        const rewardId = await pool.rewardID()
        const rewardRoot = await pool.rewardRoot(rewardId)
        assert.equal(rewardId.toString(), '0', 'Reward ID is correct')
        assert.equal(rewardToken, ESE.address, 'Reward token is correct')
        assert.equal(rewardRoot, '0x0000000000000000000000000000000000000000000000000000000000000000', 'Reward root is correct')
    })
    it('Can add rewards', async () => {
        await expect(pool.connect(acc2).addReward(merkleTrees[0].root)).to.be.revertedWithCustomError(pool, 'CallerNotAuthorized')
        for(const merkleTree of merkleTrees) {
            const rewardId = await pool.rewardID()
            await expect(pool.connect(signer).addReward(merkleTree.root)).to.emit(pool, 'RewardAdded').withArgs(rewardId, merkleTree.root)
            const rewardIdAfterNewReward = await pool.rewardID()
            assert.equal(rewardIdAfterNewReward.toString(), (parseInt(rewardId) + 1).toString(), 'Reward ID is correct')
            const rewardRoot = await pool.rewardRoot(rewardId)
            assert.equal(merkleTree.root, rewardRoot, 'rewardRoot is correct')
        }
    })
    it('verifyClaim function is correct', async () => {
        const claims = leavesOfMerkleTrees[0].map((leaf) => {
            return {
                rewardID: '0',
                balance: leaf[1],
                merkleProof: getProof(merkleTrees[0], leaf[0])
            }
        })
        for (let i = 0; i < leavesOfMerkleTrees[0].length; i++) {
            const verifyClaim = await pool.verifyClaim(leavesOfMerkleTrees[0][i][0], claims[i])
            assert.equal(verifyClaim, true, `verifyClaim for ${leavesOfMerkleTrees[0][i][0]} is correct.`)
            const verifyClaimFalse = await pool.verifyClaim(ethers.Wallet.createRandom().address, claims[i])
            assert.equal(verifyClaimFalse, false, `verifyClaim is correct.`)
        }
    })
    it('getRewards function is correct', async () => {
        const claims = claimerWalletBalances.map((balance, index) => {
            return {
                rewardID: index.toString(),
                balance: balance.toString(),
                merkleProof: getProof(merkleTrees[index], claimerWallet.address)
            }
        })
        const rewards = await pool.getRewards(claimerWallet.address, claims)
        const expectedBalanceAfter = claimerWalletBalances.reduce((acc, current) => {
            return acc.add(current)
        }, ethers.BigNumber.from('0'))
        assert.equal(rewards.toString(), expectedBalanceAfter.toString(), 'getRewards is correct')

        await expect(pool.getRewards(acc2.address, claims)).to.be.revertedWithCustomError(pool, "InvalidMerkleProof")
    })
    it('Can claim multiple rewards', async () => {
        const claims = claimerWalletBalances.map((balance, index) => {
            return {
                rewardID: index.toString(),
                balance: balance.toString(),
                merkleProof: getProof(merkleTrees[index], claimerWallet.address)
            }
        })
        const balanceBefore = await ESE.balanceOf(pool.address)
        await expect(pool.connect(acc2).claimRewards(claims, acc2.address)).to.be.revertedWithCustomError(pool, 'InvalidMerkleProof')
        await expect(pool.connect(claimerWallet).claimRewards([claims[0], claims[4]], acc2.address))
        .to.be.revertedWithCustomError(pool, 'InvalidMerkleProof')
        
        await expect(pool.connect(claimerWallet).claimRewards([claims[0], claims[4]], claimerWallet.address)).to.emit(pool, 'RewardClaimed')
        .withArgs('0', claimerWallet.address, claimerWalletBalances[0].toString())
        .and.to.emit(pool, "RewardClaimed")
        .withArgs('4', claimerWallet.address, claimerWalletBalances[4].toString())
        await expect(pool.connect(claimerWallet).claimRewards([claims[0], claims[1]], claimerWallet.address)).to.be.revertedWithCustomError(pool, 'AlreadyClaimed')
        await expect(pool.connect(claimerWallet).claimRewards([claims[1], claims[2], claims[3], [99, claims[0].balance, claims[0].merkleProof]], claimerWallet.address)).to.be.revertedWithCustomError(pool, 'MerkleRootNotExists')
        await expect(pool.connect(claimerWallet).claimRewards([claims[1], claims[2], claims[3]], claimerWallet.address)).to.emit(pool, 'RewardClaimed')
        .withArgs('1', claimerWallet.address, claimerWalletBalances[1].toString())
        .and.to.emit(pool, "RewardClaimed")
        .withArgs('2', claimerWallet.address, claimerWalletBalances[2].toString())
        .and.to.emit(pool, "RewardClaimed")
        .withArgs('3', claimerWallet.address, claimerWalletBalances[3].toString())
        
        const balanceAfter = await ESE.balanceOf(pool.address)
        const expectedBalanceAfter = claimerWalletBalances.reduce((acc, current) => {
            return acc.add(current)
        }, ethers.BigNumber.from('0'))
        assert.equal(balanceBefore.sub(expectedBalanceAfter).toString(), balanceAfter.toString(), 'Balance after claim is correct')
        await expect(pool.connect(claimerWallet).claimRewards(claims, claimerWallet.address)).to.be.revertedWithCustomError(pool, 'AlreadyClaimed')
        await expect(pool.getRewards(claimerWallet.address, claims)).to.be.revertedWithCustomError(pool, "AlreadyClaimed")
    })

    it('reverts constructor', async () => {
        const _pool = await hre.ethers.getContractFactory('EeseeMining');
        await expect(_pool.deploy(
            zeroAddress, 
            accessManager.address,
            zeroAddress
        )).to.be.revertedWithCustomError(pool, "InvalidConstructor")
        await expect(_pool.deploy(
            ESE.address, 
            zeroAddress,
            zeroAddress
        )).to.be.revertedWithCustomError(pool, "InvalidConstructor")
    })
})