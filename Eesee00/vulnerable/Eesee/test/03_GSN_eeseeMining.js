const { expect } = require('chai');
const { ethers } = require('hardhat');
const assert = require('assert');
const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');
const { getContractAddress } = require('@ethersproject/address')
const { GsnTestEnvironment } = require("@opengsn/dev")
const { RelayProvider } = require('@opengsn/provider')
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers")

describe('eeseeMining', function () {
    if(network.name != 'testnet') return
    let claimerWalletBalances = []
    let ESE;
    let pool;
    let leavesOfMerkleTrees = [];
    let merkleTrees = [];

    let signer, acc2, claimerWallet;
    let signers

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
    this.beforeAll(async() => {
        let env = await GsnTestEnvironment.startGsn('localhost');
        [signer, acc2, claimerWallet] = await hre.ethers.getSigners()
        
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
        await ESE.addVestingBeneficiaries(0, [{addr: signer.address, amount: '79228162514264337593543950335'}])
        await ESE.initialize()
        
        pool = await _pool.deploy(
            ESE.address, 
            accessManager.address,
            env.contractsDeployment.forwarderAddress
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
        [signer, acc2, claimerWallet, ...rest] = signers;
        [_signer, _acc2, _claimerWallet, ...rest] = _signers;
        console.log('FIN')
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

            const tx = await pool.connect(signer).addReward(merkleTree.root)
            const receipt = await tx.wait()
            const args = receipt.events.filter((x)=>{ return x.event=='RewardAdded' })[0].args
            assert.equal(args[0].toString(), rewardId.toString(), "ID is correct")
            assert.equal(args[1].toString(), merkleTree.root.toString(), "root is correct")

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
        
        let tx = await pool.connect(claimerWallet).claimRewards([claims[0], claims[4]], claimerWallet.address)
        let receipt = await tx.wait()
        let args = receipt.events.filter((x)=>{ return x.event=='RewardClaimed' })[0].args
        assert.equal(args[0].toString(), '0', "ID is correct")
        assert.equal(args[1].toString(), claimerWallet.address, "correct")
        assert.equal(args[2].toString(), claimerWalletBalances[0].toString(), "correct")

        args = receipt.events.filter((x)=>{ return x.event=='RewardClaimed' })[1].args
        assert.equal(args[0].toString(), '4', "ID is correct")
        assert.equal(args[1].toString(), claimerWallet.address, "correct")
        assert.equal(args[2].toString(), claimerWalletBalances[4].toString(), "correct")

        await expect(pool.connect(claimerWallet).claimRewards([claims[0], claims[1]], claimerWallet.address)).to.be.revertedWithCustomError(pool, 'AlreadyClaimed')
        
        tx = await pool.connect(claimerWallet).claimRewards([claims[1], claims[2], claims[3]], claimerWallet.address)
        receipt = await tx.wait()
        args = receipt.events.filter((x)=>{ return x.event=='RewardClaimed' })[0].args
        assert.equal(args[0].toString(), '1', "ID is correct")
        assert.equal(args[1].toString(), claimerWallet.address, "correct")
        assert.equal(args[2].toString(), claimerWalletBalances[1].toString(), "correct")

        args = receipt.events.filter((x)=>{ return x.event=='RewardClaimed' })[1].args
        assert.equal(args[0].toString(), '2', "ID is correct")
        assert.equal(args[1].toString(), claimerWallet.address, "correct")
        assert.equal(args[2].toString(), claimerWalletBalances[2].toString(), "correct")

        args = receipt.events.filter((x)=>{ return x.event=='RewardClaimed' })[2].args
        assert.equal(args[0].toString(), '3', "ID is correct")
        assert.equal(args[1].toString(), claimerWallet.address, "correct")
        assert.equal(args[2].toString(), claimerWalletBalances[3].toString(), "correct")
        
        const balanceAfter = await ESE.balanceOf(pool.address)
        const expectedBalanceAfter = claimerWalletBalances.reduce((acc, current) => {
            return acc.add(current)
        }, ethers.BigNumber.from('0'))
        assert.equal(balanceBefore.sub(expectedBalanceAfter).toString(), balanceAfter.toString(), 'Balance after claim is correct')
        await expect(pool.connect(claimerWallet).claimRewards(claims, claimerWallet.address)).to.be.revertedWithCustomError(pool, 'AlreadyClaimed')
    })
})