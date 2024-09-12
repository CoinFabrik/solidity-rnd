const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const assert = require("assert");
  const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');
  const { getContractAddress } = require('@ethersproject/address')
  const createPermit = require('./utils/createPermit')
  describe("eeseeDrops", function () {
    let ESE;
    let ERC20;
    let signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector;
    let ticketBuyers;
    let minter
    let staking
    let eeseeDrops
    let accessManager

    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const oneAddress = "0x0000000000000000000000000000000000000001"
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
        [signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector, royaltyCollector] = await ethers.getSigners()
        ticketBuyers = [acc2,acc3, acc4, acc5, acc6,  acc7]
        const _AssetTransfer = await hre.ethers.getContractFactory("AssetTransfer");
        const assetTransfer = await _AssetTransfer.deploy()
        await assetTransfer.deployed()


        const _ESE = await hre.ethers.getContractFactory("ESE");
        const _MockERC20 = await hre.ethers.getContractFactory("MockERC20");
        const _mockVRF = await hre.ethers.getContractFactory("MockVRFCoordinator");
        const _eesee = await hre.ethers.getContractFactory("Eesee", {libraries: { AssetTransfer: assetTransfer.address }});
        const _eeseeRandom = await hre.ethers.getContractFactory("EeseeRandom");
        const _NFT = await hre.ethers.getContractFactory("EeseeNFT");
        const _NFTDrop = await hre.ethers.getContractFactory("EeseeNFTDrop");
        const _NFTlazyMint = await hre.ethers.getContractFactory("EeseeNFTLazyMint");
        const _minter = await hre.ethers.getContractFactory("EeseeMinter");
        const _eeseeDrops = await hre.ethers.getContractFactory("EeseeDrops")
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");
        const _mock1InchExecutor = await hre.ethers.getContractFactory("Mock1InchExecutor");
        const _mock1InchRouter = await hre.ethers.getContractFactory("Mock1InchRouter");
        const _eesee1inch = await hre.ethers.getContractFactory("EeseePeriphery");

        mock1InchRouter = await _mock1InchRouter.deploy();
        await mock1InchRouter.deployed()
        accessManager = await _eeseeAccessManager.deploy();
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

        mock1InchExecutor = await _mock1InchExecutor.deploy(ESE.address);
        await mock1InchExecutor.deployed()
        await ESE.transfer(mock1InchExecutor.address, '1000000000000000000000000')
        await ERC20.transfer(mock1InchExecutor.address, '1000000000000000000000000')
        await ERC20.transfer(acc3.address, '1000000000000000000000000')

        let eeseeRandom = await _eeseeRandom.deploy(
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

        minter = await _minter.deploy(NFTLazyMint.address, NFTDrop.address, eeseeRandom.address, zeroAddress)
        await minter.deployed()

        staking = await _eeseeStaking.deploy(
            ESE.address, 
            [{volumeBreakpoint: 500, rewardRateFlexible: 500000, rewardRateLocked: 500000}], 
            accessManager.address,
            zeroAddress
        )
        await staking.deployed()

        let eesee = await _eesee.deploy(
            ESE.address, 
            staking.address,
            zeroAddress,
            minter.address, 
            eeseeRandom.address,
            feeCollector.address, 
            zeroAddress, 
            accessManager.address,
            zeroAddress
        )
        await eesee.deployed()

        eeseeDrops = await _eeseeDrops.deploy(
            ESE.address,
            feeCollector.address,
            minter.address,
            staking.address,
            accessManager.address,
            zeroAddress
        )
        await eeseeDrops.deployed()

        eesee1inch = await _eesee1inch.deploy(
            eesee.address,
            eeseeDrops.address,
            mock1InchRouter.address,
            zeroAddress
        )
        await eesee1inch.deployed()

        await staking.grantVolumeUpdater(eeseeDrops.address)

        for (let i = 0; i < ticketBuyers.length; i++) {
            await ESE.transfer(ticketBuyers[i].address, '10000000000000000000000')
            await ESE.connect(ticketBuyers[i]).approve(eeseeDrops.address, '10000000000000000000000')
        }

        await ESE.transfer(acc8.address, '100000000000000000000')
        await ESE.connect(acc8).approve(eeseeDrops.address, '100000000000000000000')
    })
    let merkleTree
    it('drops', async () => {
        await eeseeDrops.connect(signer).changeFee('1000')
        const eeseeNFTDrop = await hre.ethers.getContractFactory("EeseeNFTDrop")
        const leaves = []
        leaves.push([acc2.address])
        leaves.push([acc3.address])
        leaves.push([acc8.address])
        merkleTree = StandardMerkleTree.of(leaves, ['address'])
        const presaleStages = [
            {
                duration: 86400,
                perAddressMintLimit: 5,
                allowListMerkleRoot: merkleTree.root
            },
            {
                duration: 86400,
                perAddressMintLimit: 6,
                allowListMerkleRoot: merkleTree.root
            }
        ]

        await expect(eeseeDrops.connect(acc8).listDrop(
            {
                name: "APES",
                symbol:"bayc",
                baseURI: "/",
                revealedURI: "/newURL",
                contractURI:'/',
                royaltyReceiver: acc8.address,
                royaltyFeeNumerator: 300
            },
            presaleStages,
            [0, ethers.utils.parseUnits('0.02', 'ether')],
            15,
            (await ethers.provider.getBlock()).timestamp + 86400,
            zeroAddress
        ))
        .to.be.revertedWithCustomError(eeseeDrops, "InvalidEarningsCollector")

        await expect(eeseeDrops.connect(acc8).listDrop(
            {
                name: "APES",
                symbol:"bayc",
                baseURI: "/",
                revealedURI: "/newURL",
                contractURI:'/',
                royaltyReceiver: acc8.address,
                royaltyFeeNumerator: 300
            },
            presaleStages,
            [0],
            15,
            (await ethers.provider.getBlock()).timestamp + 86400,
            zeroAddress
        ))
        .to.be.revertedWithCustomError(eeseeDrops, "InvalidArrayLengths")

        await expect(eeseeDrops.connect(acc8).listDrop(
            {
                name: "APES",
                symbol:"bayc",
                baseURI: "/",
                revealedURI: "/newURL",
                contractURI:'/',
                royaltyReceiver: acc8.address,
                royaltyFeeNumerator: 300
            },
            presaleStages,
            [0, ethers.utils.parseUnits('0.02', 'ether')],
            15,
            (await ethers.provider.getBlock()).timestamp + 86400,
            acc8.address
        ))
        .to.emit(eeseeDrops, "ListDrop")
        .withArgs(0, anyValue, acc8.address)


        const ID = 0
        const listing = await eeseeDrops.drops(ID);
        assert.equal((await eeseeDrops.getMintPrices(ID))[0].toString(), '0', "getMintPrices is correct")
        assert.equal((await eeseeDrops.getMintPrices(ID))[1].toString(), ethers.utils.parseUnits('0.02', 'ether'), "getMintPrices is correct")
        assert.equal(listing.earningsCollector, acc8.address, "earningsCollector is correct")
        assert.equal(listing.fee.toString(), (await eeseeDrops.fee()).toString(), "Fee is correct")

        assert.equal(await eeseeDrops.getDropsLength(), 1, "Length is correct")

        await expect(eeseeDrops.connect(acc2).mintDrops(
            [0], [2,2], [getProof(merkleTree, acc2.address)], acc2.address,'0x'
        )).to.be.revertedWithCustomError(eeseeDrops, "InvalidArrayLengths")

        await expect(eeseeDrops.connect(acc2).mintDrops(
            [0], [2], [], acc2.address,'0x'
        )).to.be.revertedWithCustomError(eeseeDrops, "InvalidArrayLengths")

        await expect(eeseeDrops.connect(acc2).mintDrops(
            [0], [0], [getProof(merkleTree, acc2.address)], acc2.address,'0x'
        )).to.be.revertedWithCustomError(eeseeDrops, "InvalidQuantity")

        await expect(eeseeDrops.connect(acc2).mintDrops(
            [0], [2], [getProof(merkleTree, acc2.address)], acc2.address,'0x'
        )).to.be.revertedWithCustomError(eeseeNFTDrop, "MintingNotStarted")


        // Presale 1
        await time.increase(86401)

        let balanceBefore = await ESE.balanceOf(acc2.address)
        let collectorBalanceBefore = await ESE.balanceOf(acc8.address)
        let feeBalanceBefore = await ESE.balanceOf(feeCollector.address)
        await expect(eeseeDrops.connect(acc3).mintDrops(
            [0], [2], [getProof(merkleTree, acc3.address)], acc3.address,'0x'
        )).to.emit(eeseeDrops, "MintDrop").withArgs(0, anyValue, acc3.address, 1, 2, 0)
        let balanceAfter = await ESE.balanceOf(acc2.address)
        let collectorBalanceAfter = await ESE.balanceOf(acc8.address)
        let feeBalanceAfter = await ESE.balanceOf(feeCollector.address)

        if(network.name != 'testnet') {
            // Hardhat node has trouble with try catch statements, so we exclude this check for 'testnet'
            // I tested in on the live goerli chain and it was OK.
            assert.equal(await staking.volume(acc2.address), 0, "Volume is correct")
        }
        assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), 0, "Price paid is correct")
        assert.equal(BigInt(collectorBalanceBefore) - BigInt(collectorBalanceAfter), 0, "Amount collected is correct")
        assert.equal(BigInt(feeBalanceBefore) - BigInt(feeBalanceAfter), 0, "Fee is correct")

        const invalidMerkleTree = StandardMerkleTree.of([[acc4.address]], ['address'])
        await expect(eeseeDrops.connect(acc4).mintDrops(
            [0], [2], [getProof(invalidMerkleTree, acc4.address)], acc4.address,'0x'
        )).to.be.revertedWithCustomError(eeseeNFTDrop, "InvalidProof")

        // Presale 2
        await time.increase(86401)
        let expectedFee = BigInt(ethers.utils.parseUnits('0.04', 'ether')) * BigInt(listing.fee) / BigInt('10000')

        balanceBefore = await ESE.balanceOf(acc2.address)
        collectorBalanceBefore = await ESE.balanceOf(acc8.address)
        feeBalanceBefore = await ESE.balanceOf(feeCollector.address)
        await expect(eeseeDrops.connect(acc2).mintDrops(
            [0], [2], [getProof(merkleTree, acc2.address)], acc2.address,'0x'
        ))
        .to.emit(eeseeDrops, "CollectFee").withArgs(feeCollector.address, expectedFee)
        .and.to.emit(eeseeDrops, "MintDrop").withArgs(0, anyValue, acc2.address, 3, 2, ethers.utils.parseUnits('0.04', 'ether'))
        
        if(network.name != 'testnet') {
            // Hardhat node has trouble with try catch statements, so we exclude this check for 'testnet'
            // I tested in on the live goerli chain and it was OK.
            assert.equal((await staking.volume(acc2.address)).toString(), ethers.utils.parseUnits('0.04', 'ether').toString(), "Volume is correct")
        }
        balanceAfter = await ESE.balanceOf(acc2.address)
        collectorBalanceAfter = await ESE.balanceOf(acc8.address)
        feeBalanceAfter = await ESE.balanceOf(feeCollector.address)

        assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), ethers.utils.parseUnits('0.04', 'ether'), "Price paid is correct")
        assert.equal(BigInt(feeBalanceAfter) - BigInt(feeBalanceBefore), expectedFee, "Fee is correct")

        let expectedReceive = BigInt(ethers.utils.parseUnits('0.04', 'ether')) - expectedFee
        assert.equal(BigInt(collectorBalanceAfter) - BigInt(collectorBalanceBefore), expectedReceive, "Amount collected is correct")

        await expect(eeseeDrops.connect(acc4).mintDrops(
            [0], [2], [getProof(merkleTree, acc2.address)], acc4.address,'0x'
        )).to.be.revertedWithCustomError(eeseeNFTDrop, "InvalidProof")
    })
    it('mint drop with swap', async () => {

        const ID = 0
        const listing = await eeseeDrops.drops(ID);
        //const merkleTree = StandardMerkleTree.of([[acc3.address]], ['address'])
        expectedFee = BigInt(ethers.utils.parseUnits('0.04', 'ether')) * BigInt(listing.fee) / BigInt('10000')
        balanceBefore = await ESE.balanceOf(acc3.address)
        collectorBalanceBefore = await ESE.balanceOf(acc8.address)
        feeBalanceBefore = await ESE.balanceOf(feeCollector.address)

        const interface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)',
            'function swep(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ]);
        let swapAmount = ethers.utils.parseUnits('0.03', 'ether').add(11) 
        let swapData = interface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ESE.address,//
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address, 
                dstReceiver: eesee1inch.address, 
                amount: swapAmount, 
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        await expect(eesee1inch.connect(acc3).mintDropsWithSwap(
            [0], [2], [getProof(merkleTree, acc3.address)], swapData, acc3.address
        , {value: swapAmount}))
        .to.be.revertedWithCustomError(eesee1inch, "InvalidSwapDescription")

        swapAmount = ethers.utils.parseUnits('0.03', 'ether').add(11) 
        swapData = interface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: zeroAddress,//
                dstToken: ERC20.address,
                srcReceiver: mock1InchExecutor.address, 
                dstReceiver: eesee1inch.address, 
                amount: swapAmount, 
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        await expect(eesee1inch.connect(acc3).mintDropsWithSwap(
            [0], [2], [getProof(merkleTree, acc3.address)], swapData, acc3.address
        , {value: swapAmount}))
        .to.be.revertedWithCustomError(eesee1inch, "InvalidSwapDescription")

        swapAmount = ethers.utils.parseUnits('0.03', 'ether').add(11) 
        swapData = interface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: zeroAddress,//
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address, 
                dstReceiver: eesee1inch.address, 
                amount: swapAmount, 
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        await expect(eesee1inch.connect(acc3).mintDropsWithSwap(
            [0], [2], [getProof(merkleTree, acc3.address)], swapData, acc3.address
        , {value: 1}))
        .to.be.revertedWithCustomError(eesee1inch, "InvalidMsgValue")
        
        swapAmount = ethers.utils.parseUnits('0.03', 'ether').add(11) 
        await ERC20.connect(acc3).approve(eesee1inch.address, swapAmount)
        
        swapData = interface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,//
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address, 
                dstReceiver: eesee1inch.address, 
                amount: swapAmount, 
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        await expect(eesee1inch.connect(acc3).mintDropsWithSwap(
            [0], [2], [getProof(merkleTree, acc3.address)], swapData, acc3.address))
        .to.be.revertedWithCustomError(eesee1inch, "PartialFillNotAllowed")

        swapAmount = ethers.utils.parseUnits('0.06', 'ether')
        await ERC20.connect(acc3).approve(eesee1inch.address, swapAmount)
        
        swapData = interface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,//
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address, 
                dstReceiver: eesee1inch.address, 
                amount: swapAmount, 
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        await expect(eesee1inch.connect(acc3).mintDropsWithSwap(
            [0], [2], [getProof(merkleTree, acc3.address)], swapData, acc3.address))
        .to.be.revertedWith("ERC20: transfer amount exceeds balance")

        swapAmount = ethers.utils.parseUnits('0.03', 'ether').add(11) 
        swapData = interface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: zeroAddress,//
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address, 
                dstReceiver: eesee1inch.address, 
                amount: swapAmount, //amount - 10 * 2
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        await expect(eesee1inch.connect(acc3).mintDropsWithSwap(
            [0], [2], [getProof(merkleTree, acc3.address)], swapData, acc3.address
        , {value: swapAmount}))
        .to.emit(eeseeDrops, "MintDrop").withArgs(0, anyValue, acc3.address, 5, 2, ethers.utils.parseUnits('0.04', 'ether'))
        .and.to.emit(eeseeDrops, "CollectFee").withArgs(feeCollector.address, expectedFee)
        
        balanceAfter = await ESE.balanceOf(acc3.address)
        collectorBalanceAfter = await ESE.balanceOf(acc8.address)
        feeBalanceAfter = await ESE.balanceOf(feeCollector.address)

        if(network.name != 'testnet') {
            // Hardhat node has trouble with try catch statements, so we exclude this check for 'testnet'
            // I tested in on the live goerli chain and it was OK.
            assert.equal((await staking.volume(acc2.address)).toString(), ethers.utils.parseUnits('0.04', 'ether').toString(), "Volume is correct")
        }

        assert.equal(BigInt(balanceAfter) - BigInt(balanceBefore), '20000000000000001', "Dust is correct")
        assert.equal(BigInt(feeBalanceAfter) - BigInt(feeBalanceBefore), expectedFee, "Fee is correct")

        expectedReceive = BigInt(ethers.utils.parseUnits('0.04', 'ether')) - expectedFee
        assert.equal(BigInt(collectorBalanceAfter) - BigInt(collectorBalanceBefore), expectedReceive, "Amount collected is correct")


        balanceBefore = await ESE.balanceOf(acc3.address)
        collectorBalanceBefore = await ESE.balanceOf(acc8.address)
        feeBalanceBefore = await ESE.balanceOf(feeCollector.address)

        swapAmount = ethers.utils.parseUnits('0.12', 'ether').add(12)
        await ERC20.connect(acc3).approve(eesee1inch.address, swapAmount)
        
        swapData = interface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,//
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address, 
                dstReceiver: eesee1inch.address, 
                amount: swapAmount, 
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        await expect(eesee1inch.connect(acc3).mintDropsWithSwap(
            [0], [2], [getProof(merkleTree, acc3.address)], swapData, acc3.address))
        .to.emit(eeseeDrops, "MintDrop").withArgs(0, anyValue, acc3.address, 7, 2, ethers.utils.parseUnits('0.04', 'ether'))
        .and.to.emit(eeseeDrops, "CollectFee").withArgs(feeCollector.address, expectedFee)

        balanceAfter = await ESE.balanceOf(acc3.address)
        collectorBalanceAfter = await ESE.balanceOf(acc8.address)
        feeBalanceAfter = await ESE.balanceOf(feeCollector.address)

        if(network.name != 'testnet') {
            // Hardhat node has trouble with try catch statements, so we exclude this check for 'testnet'
            // I tested in on the live goerli chain and it was OK.
            assert.equal((await staking.volume(acc2.address)).toString(), ethers.utils.parseUnits('0.04', 'ether').toString(), "Volume is correct")
        }
        assert.equal( BigInt(balanceAfter) - BigInt(balanceBefore), '20000000000000001', "Dust is correct")
        assert.equal(BigInt(feeBalanceAfter) - BigInt(feeBalanceBefore), expectedFee, "Fee is correct")

        expectedReceive = BigInt(ethers.utils.parseUnits('0.04', 'ether')) - expectedFee
        assert.equal(BigInt(collectorBalanceAfter) - BigInt(collectorBalanceBefore), expectedReceive, "Amount collected is correct")
    })
    it('mint drops with permit',  async () => {
        const ID = 0
        const listing = await eeseeDrops.drops(ID);
        //const merkleTree = StandardMerkleTree.of([[acc4.address]], ['address'])
        expectedFee = BigInt(ethers.utils.parseUnits('0.04', 'ether')) * BigInt(listing.fee) / BigInt('10000')
        balanceBefore = await ESE.balanceOf(acc3.address)
        collectorBalanceBefore = await ESE.balanceOf(acc8.address)
        feeBalanceBefore = await ESE.balanceOf(feeCollector.address)
        const currentTimestamp = (await ethers.provider.getBlock()).timestamp
        const deadline = currentTimestamp + 10000
        const incorrectPermit = await createPermit(acc3, eeseeDrops, '10', deadline, ESE)
        const params_ = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            [ethers.utils.parseUnits('0.04', 'ether'), deadline, incorrectPermit.v, incorrectPermit.r, incorrectPermit.s]
          );

        await expect(eeseeDrops.connect(acc3).mintDrops(
            [0], [2], [getProof(merkleTree, acc3.address)], acc3.address, params_
        )).to.be.revertedWith("ERC20Permit: invalid signature")

        const params_2 = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['10', deadline, incorrectPermit.v, incorrectPermit.r, incorrectPermit.s]
          );
        await expect(eeseeDrops.connect(acc3).mintDrops(
            [0], [2], [getProof(merkleTree, acc3.address)], acc3.address, params_2
        )).to.be.revertedWith("ERC20: insufficient allowance")
        
        const permit = await createPermit(acc3, eeseeDrops, ethers.utils.parseUnits('0.04', 'ether'), deadline, ESE)
        const params_3 = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            [ethers.utils.parseUnits('0.04', 'ether'), deadline, permit.v, permit.r, permit.s]
          );
        await expect(eeseeDrops.connect(acc3).mintDrops(
            [0], [2], [getProof(merkleTree, acc3.address)], acc3.address, params_3
        ))
        .to.emit(eeseeDrops, "MintDrop").withArgs(0, anyValue, acc3.address, 9, 2, ethers.utils.parseUnits('0.04', 'ether'))
        .and.to.emit(eeseeDrops, "CollectFee").withArgs(feeCollector.address, expectedFee)
        
        balanceAfter = await ESE.balanceOf(acc3.address)
        collectorBalanceAfter = await ESE.balanceOf(acc8.address)
        feeBalanceAfter = await ESE.balanceOf(feeCollector.address)

        if(network.name != 'testnet') {
            // Hardhat node has trouble with try catch statements, so we exclude this check for 'testnet'
            // I tested in on the live goerli chain and it was OK.
            assert.equal((await staking.volume(acc2.address)).toString(), ethers.utils.parseUnits('0.04', 'ether').toString(), "Volume is correct")
        }
        assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), ethers.utils.parseUnits('0.04', 'ether'), "Price paid is correct")
        assert.equal(BigInt(feeBalanceAfter) - BigInt(feeBalanceBefore), expectedFee, "Fee is correct")

        expectedReceive = BigInt(ethers.utils.parseUnits('0.04', 'ether')) - expectedFee
        assert.equal(BigInt(collectorBalanceAfter) - BigInt(collectorBalanceBefore), expectedReceive, "Amount collected is correct")
        // Reapprove after permit
        await ESE.connect(acc3).approve(eeseeDrops.address, '100000000000000000000')
    })
    it('mint drops with different fees', async () => {
        const snapshotId = await network.provider.send('evm_snapshot')
        const leaves = []
        leaves.push([acc2.address])
        leaves.push([acc3.address])
        leaves.push([acc8.address])
        merkleTree = StandardMerkleTree.of(leaves, ['address'])
        const presaleStages = [
            {
                duration: 86400,
                perAddressMintLimit: 5,
                allowListMerkleRoot: merkleTree.root
            },
            {
                duration: 86400,
                perAddressMintLimit: 6,
                allowListMerkleRoot: merkleTree.root
            }
        ]
        await eeseeDrops.connect(signer).changeFee(10000)
        await expect(eeseeDrops.connect(acc8).listDrop(
            {
                name: "APES",
                symbol:"bayc",
                baseURI: "/",
                revealedURI: "/newURL",
                contractURI:'/',
                royaltyReceiver: acc8.address,
                royaltyFeeNumerator: 300
            },
            presaleStages,
            [ethers.utils.parseUnits('0.02', 'ether'), ethers.utils.parseUnits('0.02', 'ether')],
            15,
            (await ethers.provider.getBlock()).timestamp + 86400,
            acc8.address
        ))
        .to.emit(eeseeDrops, "ListDrop")
        .withArgs(1, anyValue, acc8.address)
        
        await time.increase(86401)
        await expect(eeseeDrops.connect(acc2).mintDrops(
            [1], [2], [getProof(merkleTree, acc2.address)], acc2.address,'0x'
        ))
        .to.emit(eeseeDrops, "CollectFee").withArgs(feeCollector.address, ethers.utils.parseUnits('0.04', 'ether'))
        .and.to.emit(eeseeDrops, "MintDrop").withArgs(1, anyValue, acc2.address, 1, 2, ethers.utils.parseUnits('0.04', 'ether'))


        await eeseeDrops.connect(signer).changeFee(0)
        await expect(eeseeDrops.connect(acc8).listDrop(
            {
                name: "APES",
                symbol:"bayc",
                baseURI: "/",
                revealedURI: "/newURL",
                contractURI:'/',
                royaltyReceiver: acc8.address,
                royaltyFeeNumerator: 300
            },
            presaleStages,
            [ethers.utils.parseUnits('0.02', 'ether'), ethers.utils.parseUnits('0.02', 'ether')],
            15,
            (await ethers.provider.getBlock()).timestamp + 86400,
            acc8.address
        ))
        .to.emit(eeseeDrops, "ListDrop")
        .withArgs(2, anyValue, acc8.address)

        await time.increase(86401)
        await expect(eeseeDrops.connect(acc2).mintDrops(
            [2], [2], [getProof(merkleTree, acc2.address)], acc2.address,'0x'
        ))
        .and.to.emit(eeseeDrops, "MintDrop").withArgs(2, anyValue, acc2.address, 1, 2, ethers.utils.parseUnits('0.04', 'ether'))
        await network.provider.send("evm_revert", [snapshotId])
    })
    it('buys multiple drops', async () => {
        const leaves = []
        leaves.push([acc2.address])
        leaves.push([acc3.address])
        leaves.push([acc8.address])
        merkleTree = StandardMerkleTree.of(leaves, ['address'])
        const presaleStages = [{
            name: 'Public Stage',
            mintFee: ethers.utils.parseUnits('0.01', 'ether'),
            duration: 86400,
            perAddressMintLimit: 0,
            allowListMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
        }]

        await eeseeDrops.connect(acc8).listDrop(
            {
                name: "APES",
                symbol:"bayc",
                baseURI: "/",
                revealedURI: "/newURL",
                contractURI:'/',
                royaltyReceiver: acc8.address,
                royaltyFeeNumerator: 300
            },
            presaleStages,
            [ethers.utils.parseUnits('0.01', 'ether')],
            10,
            (await ethers.provider.getBlock()).timestamp + 5,
            acc8.address
        )
        await eeseeDrops.connect(acc8).listDrop(
            {
                name: "APES",
                symbol:"bayc",
                revealedURI: "/newURL",
                baseURI: "/",
                contractURI:'/',
                royaltyReceiver: acc8.address,
                royaltyFeeNumerator: 300
            },
            presaleStages,
            [ethers.utils.parseUnits('0.01', 'ether')],
            10,
            (await ethers.provider.getBlock()).timestamp + 5,
            acc8.address,
        )

        await time.increase(10)


        expectedFee = BigInt(ethers.utils.parseUnits('0.03', 'ether')) * BigInt('1000') / BigInt('10000')
        await expect(await eeseeDrops.connect(acc4).mintDrops(
            [1,2], [1,2], [[],[]], acc4.address,'0x'
        ))
        .to.emit(eeseeDrops, "MintDrop").withArgs(1, anyValue, acc4.address, 1, 1, ethers.utils.parseUnits('0.01', 'ether'))
        .to.emit(eeseeDrops, "MintDrop").withArgs(2, anyValue, acc4.address, 1, 2, ethers.utils.parseUnits('0.02', 'ether'))
        .and.to.emit(eeseeDrops, "CollectFee").withArgs(feeCollector.address, expectedFee)
    })

    it('reverts constructor', async () => {
        const EeseeDropsFactory = await hre.ethers.getContractFactory('EeseeDrops')
        await expect(EeseeDropsFactory.deploy(
            zeroAddress,
            feeCollector.address,
            minter.address,
            staking.address,
            accessManager.address,
            oneAddress
        )).to.be.revertedWithCustomError(eeseeDrops, "InvalidConstructor")
        await expect(EeseeDropsFactory.deploy(
            ESE.address,
            zeroAddress,
            minter.address,
            staking.address,
            accessManager.address,
            oneAddress
        )).to.be.revertedWithCustomError(eeseeDrops, "InvalidConstructor")
        await expect(EeseeDropsFactory.deploy(
            ESE.address,
            feeCollector.address,
            zeroAddress,
            staking.address,
            accessManager.address,
            oneAddress
        )).to.be.revertedWithCustomError(eeseeDrops, "InvalidConstructor")
        await expect(EeseeDropsFactory.deploy(
            ESE.address,
            feeCollector.address,
            minter.address,
            zeroAddress,
            accessManager.address,
            oneAddress
        )).to.be.revertedWithCustomError(eeseeDrops, "InvalidConstructor")
        await expect(EeseeDropsFactory.deploy(
            ESE.address,
            feeCollector.address,
            minter.address,
            staking.address,
            zeroAddress,
            oneAddress
        )).to.be.revertedWithCustomError(eeseeDrops, "InvalidConstructor")
    })

    it('admin', async () => {
        let newValue = 1
        const fee = await eeseeDrops.fee() 
        await expect(eeseeDrops.connect(acc2).changeFee(newValue)).to.be.revertedWithCustomError(eeseeDrops, "CallerNotAuthorized")
        await expect(eeseeDrops.connect(signer).changeFee('10001')).to.be.revertedWithCustomError(eeseeDrops, "FeeTooHigh")
        await expect(eeseeDrops.connect(signer).changeFee(newValue))
        .to.emit(eeseeDrops, "ChangeFee")
        .withArgs(fee, newValue)
        assert.equal(newValue, await eeseeDrops.fee(), "fee has changed")
    })
})