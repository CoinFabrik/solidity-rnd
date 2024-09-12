const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers")
  const { expect } = require("chai");
  const { network } = require("hardhat");
  const { ethers } = require("ethers");
  const assert = require("assert");
  const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');
  const { getContractAddress } = require('@ethersproject/address')
  const { GsnTestEnvironment } = require("@opengsn/dev")
  const { RelayProvider } = require('@opengsn/provider')
  const createPermit = require('./utils/createPermit')
  const { keccak256 } = require('@ethersproject/keccak256')

  describe("eesee", function () {
    if(network.name != 'testnet') return
    let ESE;
    let ERC20;
    let mockVRF;
    let eesee;
    let NFT;
    let signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector;
    let _signer, _acc2
    let ticketBuyers;
    let minter;
    let royaltyEninge;
    let mock1InchExecutor
    let mock1InchRouter
    let staking
    let accessManager
    let signers
    let paymaster
    let eeseeRandom
    let swap
    let eesee1inch
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const oneAddress = "0x0000000000000000000000000000000000000001"
    this.beforeAll(async() => {
        let env = await GsnTestEnvironment.startGsn('localhost');

        [signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector] = await hre.ethers.getSigners()
        ticketBuyers = [acc2,acc3, acc4, acc5, acc6,  acc7]
        const _AssetTransfer = await hre.ethers.getContractFactory("AssetTransfer");
        const assetTransfer = await _AssetTransfer.deploy()
        await assetTransfer.deployed()

        // Deploys
        const _ESE = await hre.ethers.getContractFactory("ESE");
        const _MockERC20 = await hre.ethers.getContractFactory("MockERC20");
        const _mockVRF = await hre.ethers.getContractFactory("MockVRFCoordinator");
        const _eesee = await hre.ethers.getContractFactory("Eesee", {libraries: { AssetTransfer: assetTransfer.address }});
        const _eeseeRandom = await hre.ethers.getContractFactory("EeseeRandom");
        const _NFT = await hre.ethers.getContractFactory("EeseeNFT");
        const _NFTlazyMint = await hre.ethers.getContractFactory("EeseeNFTLazyMint");
        const _NFTDrop = await hre.ethers.getContractFactory("EeseeNFTDrop");
        const _minter = await hre.ethers.getContractFactory("EeseeMinter");
        const _royaltyEngine = await hre.ethers.getContractFactory("MockRoyaltyEngine");
        const _mock1InchExecutor = await hre.ethers.getContractFactory("Mock1InchExecutor");
        const _mock1InchRouter = await hre.ethers.getContractFactory("Mock1InchRouter");
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");
        const _eeseeSwap = await hre.ethers.getContractFactory("EeseeSwap");
        const _eesee1inch = await hre.ethers.getContractFactory("EeseePeriphery");

        ESE = await _ESE.deploy([{
            cliff: 0,
            duration: 0,
            TGEMintShare: 10000
        }])
        
        await ESE.deployed()
        await ESE.addVestingBeneficiaries(0, [{addr: signer.address, amount: '2000000000000000000000000'}])
        await ESE.initialize()

        
        ERC20 = await _MockERC20.deploy('20000000000000000000000000000')
        await ERC20.deployed()
        
        mockVRF = await _mockVRF.deploy()
        await mockVRF.deployed()

        accessManager = await _eeseeAccessManager.deploy();
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
        await accessManager.grantRole('0x2a2c268c7cd0f39b7cc90b7a2a94e8493b3e1a763a91e9860bf316284c8e155f', signer.address)
        
        const NFTDrop = await _NFTDrop.deploy()
        const NFTLazyMint = await _NFTlazyMint.deploy()
        minter = await _minter.deploy(NFTLazyMint.address, NFTDrop.address, eeseeRandom.address, env.contractsDeployment.forwarderAddress)
        await minter.deployed()

        royaltyEninge = await _royaltyEngine.deploy();
        await royaltyEninge.deployed()
        
        mock1InchExecutor = await _mock1InchExecutor.deploy(ESE.address);
        await mock1InchExecutor.deployed()
        await ESE.transfer(mock1InchExecutor.address, '1000000000000000000000000')
        await ERC20.transfer(mock1InchExecutor.address, '1000000000000000000000000')
        
        mock1InchRouter = await _mock1InchRouter.deploy();
        await mock1InchRouter.deployed()

        swap = await _eeseeSwap.deploy(ESE.address, mock1InchRouter.address);
        await swap.deployed()

        staking = await _eeseeStaking.deploy(
            ESE.address, 
            [{volumeBreakpoint: 500, rewardRateFlexible: 500000, rewardRateLocked: 500000}], 
            accessManager.address,
            env.contractsDeployment.forwarderAddress
        )
        await staking.deployed()

        eesee = await _eesee.deploy(
            ESE.address, 
            staking.address,
            swap.address,
            minter.address, 
            eeseeRandom.address,
            feeCollector.address, 
            royaltyEninge.address, 
            accessManager.address,
            env.contractsDeployment.forwarderAddress
        )
        await eesee.deployed()

        eesee1inch = await _eesee1inch.deploy(
            eesee.address,
            oneAddress,
            mock1InchRouter.address,
            env.contractsDeployment.forwarderAddress
        )
        await eesee1inch.deployed()

        await staking.grantVolumeUpdater(eesee.address)
        
        NFT = await _NFT.deploy()
        await NFT.deployed()
        await NFT.initialize({
            name: "APES",
            symbol:"bayc",
            baseURI: "/",
            revealedURI: "",
            contractURI:'/',
            royaltyReceiver: zeroAddress,
            royaltyFeeNumerator: 0
        }, 5, signer.address)
        
        await NFT.connect(signer).approve(eesee.address, 1)
        await NFT.connect(signer).approve(eesee.address, 2)
        await NFT.connect(signer).approve(eesee.address, 3)
        await NFT.connect(signer).approve(eesee.address, 4)
        await NFT.connect(signer).approve(eesee.address, 5)
        for (let i = 0; i < ticketBuyers.length; i++) {
            await ESE.connect(signer).transfer(ticketBuyers[i].address, '10000000000000000000000')
            await ESE.connect(ticketBuyers[i]).approve(eesee.address, '10000000000000000000000')
        }

        await ESE.connect(signer).transfer(acc8.address, '100000000000000000000')
        await ESE.connect(acc8).approve(eesee.address, '100000000000000000000')

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
        [signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector, ...rest] = signers;
        ticketBuyers = [acc2, acc3, acc4, acc5, acc6, acc7];
        [_signer, _acc2, _acc3, _acc4, _acc5, _acc6, _acc7, _acc8, _acc9, _feeCollector, ...rest] = _signers;
        console.log('FIN')
        
        //const paymaster = await hre.ethers.getContractAt("BasePaymaster", env.contractsDeployment.paymasterAddress);
        //console.log(env.contractsDeployment.forwarderAddress, env.contractsDeployment.paymasterAddress)
        //console.log(await paymaster.getTrustedForwarder())
    })

    let nonce = 0
    const createLot = async (token, tokenID, amount, assetType, data, maxTickets, ticketPrice, duration ,owner, deadline, _signer) => {
        const types = {
            Lot: [
                  {
                    name: "assetHash",
                    type: "bytes32"
                  },
                {
                name: "maxTickets",
                type: "uint32"
              },
              {
                name: "ticketPrice",
                type: "uint96"
              },
              {
                name: "duration",
                type: "uint32"
              },
              {
                name: "owner",
                type: "address"
              },
              {
                name: "nonce",
                type: "uint256"
              },
              {
                name: "deadline",
                type: "uint256"
              },
            ],
          }
        const eip712Domain = await eesee.eip712Domain()
        const domain = {
            name: eip712Domain.name,
            version: eip712Domain.version,
            chainId: eip712Domain.chainId,
            verifyingContract: eip712Domain.verifyingContract
        }
        const abi = ethers.utils.defaultAbiCoder;
        const assetEncoded = abi.encode(
            ["tuple(address, uint256, uint256, uint8, bytes)"], 
            [[token, tokenID, amount, assetType, data]]
        );

        const values = {assetHash: keccak256(assetEncoded), maxTickets,ticketPrice,duration,owner,nonce,deadline}
        const signature = await _signer._signTypedData(domain, types, values)

        const signatureData = abi.encode(
            ["uint256", "uint256", "bytes"], 
            [nonce, deadline, signature]
        );
        const params = {signer: _signer.address, signatureData}
        nonce += 1
        return params
    }

    it('Lists NFT', async () => {
        const ID = 0
        let _nonce = nonce
        let _lot = await createLot(NFT.address, 1, 1,0, '0x',100,2,86400,signer.address,10000000000, signer)
        let tx = await eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount:1, assetType:0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )
        let receipt = await tx.wait()
        
        let timestamp = await time.latest();
        let args = receipt.events.filter((x)=>{ return x.event=='CreateLot' })[0].args
        assert.equal(args[0].toString(), ID.toString(), "ID is correct")
        assert.equal(args[2].toString(), signer.address.toString(), "signer is correct")
        assert.equal(args[3].toString(), '100', "max tickets is correct")
        assert.equal(args[4].toString(), '2', "ticket price is correct")
        assert.equal(args[5].toString(), (timestamp + 86400).toString(), "expiryTimestamp is correct")

        let lot = await eesee.lots(ID);
        assert.equal(lot.asset.token, NFT.address, "NFT is correct")
        assert.equal(lot.asset.tokenID, 1, "NFT tokenID is correct")
        assert.equal(lot.owner, signer.address, "Owner is correct")
        assert.equal(lot.maxTickets, 100, "maxTickets is correct")
        assert.equal(lot.ticketPrice, 2, "ticketPrice is correct")
        assert.equal(lot.ticketsBought, 0, "ticketsBought is correct")
        assert.equal(lot.fee, '600', "fee is correct")
        //assert.equal(lot.creationTime, timeNow, "creationTime is correct")
        assert.equal(lot.endTimestamp.toString(), (timestamp + 86400).toString(), "endTimestamp is correct")
        assert.equal(lot.transactions, 0, "transactions are correct")
        assert.equal(lot.assetClaimed, false, "assetClaimed is correct")
        assert.equal(lot.tokensClaimed, false, "tokensClaimed is correct")

        await expect(eesee1inch.getLotWinner(ID))
        .to.be.revertedWithCustomError(eesee1inch, "LotNotFulfilled")
        assert.equal(await eesee.getLotTicketHolder(ID, 5), zeroAddress, "ticket id buyer is correct")
        assert.equal(await eesee.getLotTicketHolder(ID, 0), zeroAddress, "ticket id buyer is correct")
    })
    it('Batch lists NFT', async () => {
        let _nonce1 = nonce
        let _lot1 = await createLot(NFT.address, 2, 1,0, '0x',50,3,86400,signer.address,10000000000, signer)
        let _nonce2 = nonce
        let _lot2 = await createLot(NFT.address, 3, 1,0, '0x',150,4,86400,signer.address,10000000000, signer)
        let _nonce3 = nonce
        let _lot3 = await createLot(NFT.address, 4, 1,0, '0x',200,5,86400,signer.address,10000000000, signer)
        const tx = await eesee.connect(signer).createLots(
            [
                { token: NFT.address, tokenID: 2, amount:1, assetType:0, data:'0x'},
                { token: NFT.address, tokenID: 3, amount:1, assetType:0, data:'0x'},
                { token: NFT.address, tokenID: 4, amount:1, assetType:0, data:'0x'}
            ],
            [
                {maxTickets: 50, ticketPrice: 3, duration: 86400, owner: signer.address, signer: _lot1.signer, signatureData: _lot1.signatureData},
                {maxTickets: 150, ticketPrice: 4, duration: 86400, owner: signer.address, signer: _lot2.signer, signatureData: _lot2.signatureData},
                {maxTickets: 200, ticketPrice: 5, duration: 86400, owner: signer.address, signer: _lot3.signer, signatureData: _lot3.signatureData}
            ]
        )
        const receipt = await tx.wait()
        const timestamp = await time.latest();

        let args = receipt.events.filter((x)=>{ return x.event=='CreateLot' })[0].args
        assert.equal(args[0].toString(), '1', "ID is correct")

        assert.equal(args[2].toString(), signer.address.toString(), "signer is correct")
        assert.equal(args[3].toString(), '50', "max tickets is correct")
        assert.equal(args[4].toString(), '3', "ticket price is correct")
        assert.equal(args[5].toString(), (timestamp + 86400).toString(), "expiryTimestamp is correct")

        args = receipt.events.filter((x)=>{ return x.event=='CreateLot' })[1].args
        assert.equal(args[0].toString(), '2', "ID is correct")

        assert.equal(args[2].toString(), signer.address.toString(), "signer is correct")
        assert.equal(args[3].toString(), '150', "max tickets is correct")
        assert.equal(args[4].toString(), '4', "ticket price is correct")
        assert.equal(args[5].toString(), (timestamp + 86400).toString(), "expiryTimestamp is correct")

        args = receipt.events.filter((x)=>{ return x.event=='CreateLot' })[2].args
        assert.equal(args[0].toString(), '3', "ID is correct")

        assert.equal(args[2].toString(), signer.address.toString(), "signer is correct")
        assert.equal(args[3].toString(), '200', "max tickets is correct")
        assert.equal(args[4].toString(), '5', "ticket price is correct")
        assert.equal(args[5].toString(), (timestamp + 86400).toString(), "expiryTimestamp is correct")
    })

    it('Buys tickets with permit', async () => {
        const ID = 0
        //snapshotId = await network.provider.send('evm_snapshot')
        await ESE.connect(_acc2).approve(eesee.address, 0)
        const currentTimestamp = await time.latest()
        const deadline = currentTimestamp + 10000
        const correctPermit = await createPermit(acc2, eesee, '40', deadline, ESE)
        const params_ = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['40', deadline, correctPermit.v, correctPermit.r, correctPermit.s]
          );
        await expect(eesee.connect(acc2).buyTickets([ID], [0],acc2.address,params_)).to.be.revertedWithCustomError(eesee, "BuyAmountTooLow")
        await expect(eesee.connect(acc2).buyTickets([100], [1],acc2.address,params_)).to.be.reverted
        await expect(eesee.connect(acc2).buyTickets([ID], [101],acc2.address,params_)).to.be.revertedWithCustomError(eesee, "AllTicketsBought")

        const balanceBefore = await ESE.balanceOf(acc2.address)
        const incorrectPermit = await createPermit(acc2, eesee, '10', deadline, ESE)
        const params_2 = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['40', deadline, incorrectPermit.v, incorrectPermit.r, incorrectPermit.s]
          );

        await expect(eesee.connect(acc2).buyTickets([ID], [20],acc2.address,params_2))
        .to.be.revertedWith("ERC20Permit: invalid signature")

        const params_3 = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['10', deadline, incorrectPermit.v, incorrectPermit.r, incorrectPermit.s]
          );
        await expect(eesee.connect(acc2).buyTickets([ID], [20],acc2.address,params_3))
        .to.be.revertedWith("ERC20: insufficient allowance")

        const tx = await eesee.connect(acc2).buyTickets([ID], [20],acc2.address,params_)
        const receipt = await tx.wait()

        const args = receipt.events.filter((x)=>{ return x.event=='BuyTickets' })[0].args
        assert.equal(args[0].toString(), ID.toString(), "ID is correct")
        assert.equal(args[1].toString(), acc2.address.toString(), "correct")
        assert.equal(args[2].toString(), '0', "correct")
        assert.equal(args[3].toString(), '20', "correct")
        assert.equal(args[4].toString(), (2*20).toString(), "correct")
        assert.equal(args[5].toString(), (20*20 / 100 * 0.25).toString(), "correct")

        for (let i = 0; i < 20; i++) {
            const buyer = await eesee.getLotTicketHolder(ID, i)
            assert.equal(buyer, acc2.address, "Ticket buyer is correct")
        }

        const tickets = await eesee.getLotTicketsHeldByAddress(ID, acc2.address)
        assert.equal(tickets, 20, "Tickets bought by address is correct")

        const balanceAfter = await ESE.balanceOf(acc2.address)
        assert.equal(await staking.volume(acc2.address), 20*2, "Volume is correct")
        assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), 20*2, "Price paid is correct")

        const correctPermit2 = await createPermit(acc2, eesee, '40', deadline, ESE)
        const params_4 = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['40', deadline, correctPermit2.v, correctPermit2.r, correctPermit2.s]
          );
        await expect(eesee.connect(acc2).buyTickets([ID], [81], acc2.address, params_4)).to.be.revertedWithCustomError(eesee, "AllTicketsBought")

        const lot = await eesee.lots(ID);
        assert.equal(lot.ticketsBought, 20, "ticketsBought is correct")
        //await network.provider.send("evm_revert", [snapshotId])
    })


    it('Buys all tickets', async () => {
        const ID = 0
        for (let i = 1; i <= 4; i++) {
            const balanceBefore = await ESE.balanceOf(ticketBuyers[i].address)
            const tx = await eesee.connect(ticketBuyers[i]).buyTickets([ID], [20], ticketBuyers[i].address,'0x')
            const receipt = await tx.wait()

            const args = receipt.events.filter((x)=>{ return x.event=='BuyTickets' })[0].args
            assert.equal(args[0].toString(), ID.toString(), "ID is correct")
            assert.equal(args[1].toString(), ticketBuyers[i].address.toString(), "correct")
            assert.equal(args[2].toString(), (i*(20 + ((20*20 / 100) * 0.25))).toString(), "correct")
            assert.equal(args[3].toString(), '20', "correct")
            assert.equal(args[4].toString(), '40', "correct")
            assert.equal(args[5].toString(), (20*20 / 100 * 0.25).toString(), "correct")

            const timestamp = await time.latest()
            for (let j = i * (20 + ((20*20 / 100) * 0.25)); j < (i + 1) * (20 + ((20*20 / 100) * 0.25)); j++) {
                const buyer = await eesee.getLotTicketHolder(ID, j)
                assert.equal(buyer, ticketBuyers[i].address, "Ticket buyer is correct")
            }

            const tickets = await eesee.getLotTicketsHeldByAddress(ID, ticketBuyers[i].address)
            assert.equal(tickets, 20, "Tickets bought by address is correct")

            const balanceAfter = await ESE.balanceOf(ticketBuyers[i].address)
            assert.equal(await staking.volume(ticketBuyers[i].address), 20*2, "Volume is correct")
            assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), 20*2, "Price paid is correct")
            if(i == 4){
                await expect(eesee.connect(ticketBuyers[i]).buyTickets([ID], [11], ticketBuyers[i].address,'0x')).to.be.revertedWithCustomError(eesee, "AllTicketsBought")
            }

            const lot = await eesee.lots(ID);
            assert.equal(lot.ticketsBought, (i + 1)*20, "ticketsBought is correct")

            await expect(eesee.connect(ticketBuyers[i]).receiveAssets([ID], ticketBuyers[i].address))
                .to.be.revertedWithCustomError(eesee, "LotNotFulfilled").withArgs(ID)
            await expect(eesee.connect(ticketBuyers[i]).receiveTokens([ID], ticketBuyers[i].address))
                .to.be.revertedWithCustomError(eesee, "LotNotFulfilled").withArgs(ID)

            await expect(eesee.connect(signer).reclaimAssets([ID], ticketBuyers[i].address))
                .to.be.revertedWithCustomError(eesee, "LotNotExpired").withArgs(ID)
            await expect(eesee.connect(ticketBuyers[i]).reclaimTokens([ID], ticketBuyers[i].address))
                .to.be.revertedWithCustomError(eesee, "LotNotExpired").withArgs(ID)

            if(i == 4){
                //MockVRF's first requestID is 0
                assert.equal(lot.endTimestamp.toString(), timestamp.toString(), "endTimestamp is correct")
                const tx = await eeseeRandom.connect(_signer)["performUpkeep(bytes)"]("0x00")
                const receipt = await tx.wait()
                //const args = receipt.events.filter((x)=>{ return x.event=='RequestWords' })[0].args
                //assert.equal(args[0].toString(), '1', "correct")
                //assert.equal(args[1].toString(), '0', "correct")

                console.log('GAS FOR PERFORM UPKEEP 1:', receipt.gasUsed.toString())
                await expect(eeseeRandom["performUpkeep(bytes)"]("0x00")).to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
            }

            await expect(eesee1inch.getLotWinner(ID))
            .to.be.revertedWithCustomError(eesee1inch, "LotNotFulfilled")
        }

        //buy tickets for lot that will expire
        const expiredLotID = 1
        const tx = await eesee.connect(acc7).buyTickets([expiredLotID], [20], acc7.address,'0x')
        const receipt = await tx.wait()
        const args = receipt.events.filter((x)=>{ return x.event=='BuyTickets' })[0].args
        assert.equal(args[0].toString(), expiredLotID.toString(), "ID is correct")
        assert.equal(args[1].toString(), acc7.address.toString(), "correct")
        assert.equal(args[2].toString(), '0', "correct")
        assert.equal(args[3].toString(), '20', "correct")
        assert.equal(args[4].toString(), '60', "correct")
        assert.equal(args[5].toString(), Math.floor(20*20 / 50 * 0.25).toString(), "correct")

        await expect(eesee.connect(ticketBuyers[5]).buyTickets([ID], [1], ticketBuyers[5].address,'0x')).to.be.revertedWithCustomError(eesee, "AllTicketsBought")
    })

    it('Selects winner', async () => {
        const ID = 0
        const tx = await mockVRF.connect(_signer).fulfillWords(0, {gasLimit: '30000000'})
        const recipt = expect(tx)

        assert.notEqual((await eesee1inch.getLotWinner(ID)).winner, zeroAddress, "winner is chosen")

        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)
        console.log('GAS FOR CHAINLINK VRF 1:', (await tx.wait()).gasUsed.toString())
        await expect(eeseeRandom["performUpkeep(bytes)"]("0x00")).to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
    })

    //also check batch receive multiple at the same time
    it('Receives asset after win', async () => {
        const ID = 0
        const winner = (await eesee1inch.getLotWinner(ID)).winner
        const winnerAcc = signers.filter(signer => signer.address === winner)[0]
        const notWinnerAcc = signers.filter(signer => signer.address !== winner)[0]
        await expect(eesee.connect(notWinnerAcc).receiveAssets([ID], winner))
        .to.be.revertedWithCustomError(eesee, "CallerNotWinner").withArgs(ID)

        const tx = await eesee.connect(winnerAcc).receiveAssets([ID], winner)
        const receipt = await tx.wait()
        const args = receipt.events.filter((x)=>{ return x.event=='ReceiveAsset' })[0].args
        assert.equal(args[0].toString(), ID.toString(), "ID is correct")
        assert.equal(args[1].toString(), winnerAcc.address.toString(), "correct")
        assert.equal(args[2].toString(), winner, "correct")
        
        lot = await eesee.lots(ID)
        assert.equal(lot.assetClaimed, true, "assetClaimed is correct")
        assert.equal(lot.tokensClaimed, false, "tokensClaimed is correct")
        const owner = await NFT.ownerOf(1)
        assert.equal(owner, winner, "new owner of NFT is correct")
        await expect(eesee.connect(winnerAcc).receiveAssets([ID], winner))
        .to.be.revertedWithCustomError(eesee, "AssetAlreadyClaimed").withArgs(ID)
    })
    it('Receives tokens',  async () => {
        const ID = 0
        await expect(eesee.connect(acc2).receiveTokens([ID], acc2.address))
        .to.be.revertedWithCustomError(eesee, "CallerNotOwner").withArgs(ID)

        const lot = await eesee.lots(ID);
        const expectedFee = BigInt(lot.ticketPrice) * BigInt(lot.maxTickets) * BigInt(lot.fee) / BigInt('10000')
        const expectedReceive = BigInt(lot.ticketPrice) * BigInt(lot.maxTickets) - expectedFee

        const ownerBalanceBefore = await ESE.balanceOf(signer.address)
        const feeBalanceBefore = await ESE.balanceOf(feeCollector.address)

        const tx = await eesee.connect(signer).receiveTokens([ID], signer.address)
        const receipt = await tx.wait()
        let args = receipt.events.filter((x)=>{ return x.event=='ReceiveTokens' })[0].args
        assert.equal(args[0].toString(), ID.toString(), "ID is correct")
        assert.equal(args[1].toString(), signer.address.toString(), "correct")
        assert.equal(args[2].toString(), signer.address.toString(), "correct")
        assert.equal(args[3].toString(), expectedReceive.toString(), "correct")

        args = receipt.events.filter((x)=>{ return x.event=='CollectFee' })[0].args
        assert.equal(args[0].toString(), feeCollector.address, "ID is correct")
        assert.equal(args[1].toString(), expectedFee.toString(), "correct")

        const ownerBalanceAfter = await ESE.balanceOf(signer.address)
        const feeBalanceAfter = await ESE.balanceOf(feeCollector.address)

        assert.equal(expectedFee, BigInt(feeBalanceAfter) - BigInt(feeBalanceBefore), "fee is correct")
        assert.equal(expectedReceive, BigInt(ownerBalanceAfter) - BigInt(ownerBalanceBefore), "owner balance is correct")

        // reverted with eesee: Lot is not filfilled because lot deleted after previous claim
        await expect(eesee.connect(signer).receiveTokens([ID], signer.address))
        .to.be.revertedWithCustomError(eesee, "LotNotExists").withArgs(ID)

        await expect(eesee1inch.getLotWinner(ID))
        .to.be.revertedWithCustomError(eesee1inch, "LotNotExists")
    })
    it('buyTickets reverts if lot is expired', async () => {
        const IDs = [1,2,3]
        await ESE.connect(_acc2).approve(eesee.address, 100)
        await eesee.connect(acc2).buyTickets([IDs[2]], [20], acc2.address,'0x')

        const timestampBeforeTimeSkip = await time.latest() 
        await time.increase(86401)
        const timestampAfterTimeSkip = await time.latest() 
        const lot = await eesee.lots(IDs[0])
        assert.equal(timestampBeforeTimeSkip, timestampAfterTimeSkip-86401, "timetravel is successfull")
        assert.equal(ethers.BigNumber.from(lot.endTimestamp).lt(timestampAfterTimeSkip), true, "lot expired")
        await expect(eesee.connect(acc2).buyTickets([IDs[0]], [20], acc2.address,'0x')).to.be.revertedWithCustomError(eesee, "LotExpired").withArgs(IDs[0])
        await expect(eesee.connect(acc2).buyTickets([IDs[1]], [20], acc2.address,'0x')).to.be.revertedWithCustomError(eesee, "LotExpired").withArgs(IDs[1])
    })
    it('Can reclaim tokens if lot is expired', async () => {
        const expiredLotID = 1
        const balanceBeforeTokens = await ESE.balanceOf(acc7.address); 

        const lot = await eesee.lots(expiredLotID)
        await time.increase(86401)

        const tx = await eesee.connect(acc7).reclaimTokens([expiredLotID], acc7.address)
        const receipt = await tx.wait()
        let args = receipt.events.filter((x)=>{ return x.event=='ReclaimTokens' })[0].args
        assert.equal(args[0].toString(), expiredLotID.toString(), "ID is correct")
        assert.equal(args[1].toString(), acc7.address.toString(), "correct")
        assert.equal(args[2].toString(), acc7.address.toString(), "correct")
        assert.equal(args[3].toString(), lot.ticketPrice.mul(ethers.BigNumber.from(20)).toString(), "correct")

        //await expect(eesee.connect(acc7).reclaimTokens([expiredLotID], acc7.address))
        //.to.emit(eesee, "ReclaimTokens")
        //.withArgs(expiredLotID, acc7.address, acc7.address, 5, lot.ticketPrice.mul(ethers.BigNumber.from(5))) //emit ReclaimTokens(ID, msg.sender, recipient, ticketsBoughtByAddress, _amount);

        //await new Promise(resolve => setTimeout(resolve, 2000));
        const balanceAfterTokens = await ESE.balanceOf(acc7.address); 

        assert.equal(balanceAfterTokens.sub(balanceBeforeTokens), lot.ticketPrice * 20, "balance is correct")

        await expect(eesee1inch.getLotWinner(expiredLotID))
        .to.be.revertedWithCustomError(eesee1inch, "LotNotFulfilled")
    })
    it('Can reclaim asset if lot is expired', async () => {
        const IDs = [1,2,3]
        await expect(eesee.connect(acc2).reclaimAssets(IDs, signer.address))
        .to.be.revertedWithCustomError(eesee, "CallerNotOwner").withArgs(1)


        const tx = await eesee.connect(signer).reclaimAssets(IDs, signer.address)
        const receipt = await tx.wait()
        let args = receipt.events.filter((x)=>{ return x.event=='ReclaimAsset' })[0].args
        assert.equal(args[0].toString(), '1', "ID is correct")
        assert.equal(args[1].toString(), signer.address.toString(), "correct")
        assert.equal(args[2].toString(), signer.address.toString(), "correct")

        args = receipt.events.filter((x)=>{ return x.event=='ReclaimAsset' })[1].args
        assert.equal(args[0].toString(), '2', "ID is correct")
        assert.equal(args[1].toString(), signer.address.toString(), "correct")
        assert.equal(args[2].toString(), signer.address.toString(), "correct")

        args = receipt.events.filter((x)=>{ return x.event=='ReclaimAsset' })[2].args
        assert.equal(args[0].toString(), '3', "ID is correct")
        assert.equal(args[1].toString(), signer.address.toString(), "correct")
        assert.equal(args[2].toString(), signer.address.toString(), "correct")

        await expect(eesee.connect(signer).reclaimAssets([3], signer.address))
            .to.be.revertedWithCustomError(eesee, "AssetAlreadyClaimed").withArgs(3)
    })

    it('swaps tokens using 1inch', async () => {
        const currentLotID = (await eesee.getLotsLength()).toNumber()

        const _lot = await createLot(NFT.address, 5, 1, 0, '0x',10,50,86400,signer.address,10000000000, signer)
        await eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 5, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 10, ticketPrice: 50, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )

        await ERC20.approve(eesee1inch.address, '232')

        let iface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)',
            'function swep(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ]);
        
        let swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ESE.address,//
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address, 
                amount: 232, 
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        await expect(eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [2], swapData, signer.address))
        .to.be.revertedWithCustomError(eesee1inch, "InvalidSwapDescription")

        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,
                dstToken: ERC20.address,//
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address,
                amount: 232,
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        await expect(eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [2], swapData, signer.address))
        .to.be.revertedWithCustomError(eesee1inch, "InvalidSwapDescription")

        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: ERC20.address, //
                amount: 232,
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        await expect(eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [2], swapData, signer.address))
        .to.be.revertedWithCustomError(eesee1inch, "InvalidSwapDescription")

        swapData = iface.encodeFunctionData('swep', [//
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address, 
                amount: 232,
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        await expect(eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [2], swapData, signer.address))
        .to.be.revertedWithCustomError(eesee1inch, "InvalidSwapDescription")

        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address, 
                amount: 232,
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        await expect(eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [2], swapData, signer.address, {value: 1}))//
        .to.be.revertedWithCustomError(eesee1inch, "InvalidMsgValue")

        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address, 
                amount: 232, //should buy 2 tickets + 10 ESE dust + (10-1) ERC20 dust 
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        const balanceBefore = await ESE.balanceOf(signer.address)
        const balanceBefore_ = await ERC20.balanceOf(signer.address)


        let tx = await eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [2], swapData, signer.address)
        let receipt = await tx.wait()

        const balanceAfter = await ESE.balanceOf(signer.address)
        const balanceAfter_ = await ERC20.balanceOf(signer.address)

        assert.equal(balanceAfter.sub(balanceBefore).toString(), "10", 'ESE balance is correct')
        assert.equal(balanceBefore_.sub(balanceAfter_).toString(), "232", 'ERC20 balance is correct')

        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: zeroAddress,
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address, 
                amount: 212, //should buy 2 tickets + 10 ESE dust + (10-1) ERC20 dust 
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        await expect(eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [2], swapData, signer.address, {value: 211}))//s
        .to.be.revertedWithCustomError(eesee1inch, "InvalidMsgValue")
    })
});
