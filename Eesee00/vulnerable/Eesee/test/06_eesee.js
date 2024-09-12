const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const fs = require('fs')
    const path = require('path')
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const assert = require("assert");
  const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');
  const { getContractAddress } = require('@ethersproject/address')
  const createPermit = require('./utils/createPermit')
  const { keccak256 } = require('@ethersproject/keccak256')
  describe("eesee", function () {
    let ESE;
    let ERC20;
    let mockVRF;
    let eesee;
    let NFT;
    let signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector;
    let ticketBuyers;
    let minter;
    let royaltyEninge;
    let mock1InchExecutor
    let mock1InchRouter
    let staking
    let accessManager
    let eesee1inch
    let eeseeRandom
    let swap
    let mock1InchExecutorETH
    let openseaRouter
    let NFTWithRoyalty

    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const oneAddress = "0x0000000000000000000000000000000000000001"
    const mainnetAddresses = JSON.parse(fs.readFileSync(path.resolve(__dirname, './constants/mainnetAddresses.json'), "utf-8"))
    let snapshotId
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
        const _royaltyEngine = await hre.ethers.getContractFactory("MockRoyaltyEngine");
        const _mock1InchExecutorETH = await hre.ethers.getContractFactory("Mock1InchExecutorETH");
        const _mock1InchExecutor = await hre.ethers.getContractFactory("Mock1InchExecutor");
        const _mock1InchRouter = await hre.ethers.getContractFactory("Mock1InchRouter");
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");
        const _eeseeSwap = await hre.ethers.getContractFactory("EeseeSwap");
        const _openseaRouter = await hre.ethers.getContractFactory("EeseeOpenseaRouter")
        const _eesee1inch = await hre.ethers.getContractFactory("EeseePeriphery")

        openseaRouter = await _openseaRouter.deploy(mainnetAddresses.Seaport)
        await openseaRouter.deployed()

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

        mock1InchExecutorETH = await _mock1InchExecutorETH.deploy();
        await mock1InchExecutorETH.deployed()
        await signer.sendTransaction({
            to: mock1InchExecutorETH.address,
            value: ethers.utils.parseEther("200.0"), 
        });
        await ERC20.transfer(mock1InchExecutorETH.address, '1000000000000000000000000')

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

        await expect(_minter.deploy(NFTLazyMint.address, NFTDrop.address, zeroAddress, zeroAddress)).to.be.revertedWithCustomError(_minter, "InvalidConstructor")
        await expect(_minter.deploy(NFTLazyMint.address, zeroAddress, eeseeRandom.address, zeroAddress)).to.be.revertedWithCustomError(_minter, "InvalidConstructor")
        await expect(_minter.deploy(zeroAddress, NFTDrop.address, eeseeRandom.address, zeroAddress)).to.be.revertedWithCustomError(_minter, "InvalidConstructor")
        minter = await _minter.deploy(NFTLazyMint.address, NFTDrop.address, eeseeRandom.address, zeroAddress)
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
            zeroAddress
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
            zeroAddress
        )
        await eesee.deployed()

        eesee1inch = await _eesee1inch.deploy(
            eesee.address,
            oneAddress,
            mock1InchRouter.address,
            zeroAddress
        )
        await eesee1inch.deployed()

        await staking.grantVolumeUpdater(eesee.address)

        NFT = await _NFT.deploy()
        await NFT.initialize({
            name: "APES",
            symbol:"bayc",
            baseURI: "/",
            revealedURI: "",
            contractURI:'/',
            royaltyReceiver: zeroAddress,
            royaltyFeeNumerator: 0
        },10, signer.address)

        await NFT.deployed()
        await NFT.approve(eesee.address, 1)
        await NFT.approve(eesee.address, 2)
        await NFT.approve(eesee.address, 3)
        await NFT.approve(eesee.address, 4)

        NFTWithRoyalty = await _NFT.deploy()
        await NFTWithRoyalty.initialize({
            name: "APES",
            symbol:"bayc",
            baseURI: "/",
            revealedURI: "",
            contractURI:'/',
            royaltyReceiver: royaltyCollector.address,
            royaltyFeeNumerator: 300
        },10, signer.address)
        await NFTWithRoyalty.approve(eesee.address, 1)
        await NFTWithRoyalty.approve(eesee.address, 2)
        await NFTWithRoyalty.approve(eesee.address, 3)
        await NFTWithRoyalty.approve(eesee.address, 4)
        await NFTWithRoyalty.approve(eesee.address, 5)
        await NFTWithRoyalty.approve(eesee.address, 6)

        for (let i = 0; i < ticketBuyers.length; i++) {
            await ESE.transfer(ticketBuyers[i].address, '10000000000000000000000')
            await ESE.connect(ticketBuyers[i]).approve(eesee.address, '10000000000000000000000')
        }

        await ESE.transfer(acc8.address, '100000000000000000000')
        await ESE.connect(acc8).approve(eesee.address, '100000000000000000000')
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
        let _lot = await createLot(NFT.address, 1, 1,0, '0x',1,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 0, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}])).to.be.revertedWithCustomError(eesee, "MaxTicketsTooLow")
        
        _lot = await createLot(NFT.address, 1, 0, 0, '0x',100,0,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 0, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 0, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidAmount")

        _lot = await createLot(NFT.address, 1, 2, 0, '0x',100,0,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 2, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 0, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
            )).to.be.revertedWithCustomError(eesee, "InvalidAmount")
       
        _lot = await createLot(NFT.address, 1, 1, 1, '0x',100,0,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 1, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 0, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
            )).to.be.revertedWithCustomError(eesee, "InvalidInterface")
        
        _lot = await createLot(NFT.address, 1, 1, 2, '0x',100,0,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 2, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 0, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
            )).to.be.revertedWithCustomError(eesee, "InvalidInterface")

        _lot = await createLot(NFT.address, 0, 10000, 3, '0x',100,0,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 0, amount: 10000, assetType: 3, data:'0x'}],
            [{maxTickets: 100, ticketPrice: 0, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}],
            {value:10000}
        )).to.be.revertedWithCustomError(eesee, "InvalidToken")


        _lot = await createLot(NFT.address, 1, 1, 0, '0x',100,0,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 0, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 1}
            )).to.be.revertedWithCustomError(eesee, "InvalidMsgValue")
        
        _lot = await createLot(NFT.address, 1, 1, 0, '0x',100,0,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 0, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "TicketPriceTooLow")
        
        _lot = await createLot(NFT.address, 1, 1, 0, '0x',100,0,86399,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 0, duration: 86399, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "DurationTooLow").withArgs(86400)

        _lot = await createLot(NFT.address, 1, 1, 0, '0x',100,0,2592001,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 0, duration: 2592001, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "DurationTooHigh").withArgs(2592000)

        _lot = await createLot(NFT.address, 1, 1, 0, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 99, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}])
        ).to.be.revertedWithCustomError(eesee, "InvalidSignature")

        _lot = await createLot(NFT.address, 1, 1, 0, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 99, ticketPrice: 0, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}])
        ).to.be.revertedWithCustomError(eesee, "TicketPriceTooLow")//signature is invalid, but it is not checked

        _lot = await createLot(NFT.address, 1, 1, 0, '0x',100,2,86400,signer.address,7, signer)
        await expect(eesee.connect(acc2).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}])
        ).to.be.revertedWithCustomError(eesee, "ExpiredDeadline")

        _lot = await createLot(NFT.address, 1, 1, 0, '0x',1000000001,'1',86400,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 1000000001, ticketPrice: '1', duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}])
        ).to.be.revertedWithCustomError(eesee, "MaxTicketsTooHigh")

        _lot = await createLot(NFT.address, 1, 1, 0, '0x',2,'1000000000000000000000000001',86400,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 2, ticketPrice: '1000000000000000000000000001', duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}])
        ).to.be.revertedWithCustomError(eesee, "ESEOverflow")
        await expect(eesee.connect(acc2).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}, {token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 2, ticketPrice: '1000000000000000000000000001', duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}])
        ).to.be.revertedWithCustomError(eesee, "InvalidArrayLengths")
        const lotWithInvalidOwner = await createLot(NFT.address, 1, 1, 0, '0x',100,2,86400,zeroAddress,10000000000, signer)
        await expect(eesee.connect(acc2).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: zeroAddress, signer: lotWithInvalidOwner.signer, signatureData: lotWithInvalidOwner.signatureData}])
        ).to.be.revertedWithCustomError(eesee, "InvalidOwner")

        let _nonce = nonce
        const ID = 0
        _lot = await createLot(NFT.address, 1, 1, 0, '0x',100,2,86400,signer.address,10000000000, signer)
        const tx = await eesee.connect(acc2).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}])
        const receipt = await tx.wait()
    
        const timestamp = await time.latest();
        const args = receipt.events.filter((x)=>{ return x.event=='CreateLot' })[0].args
        assert.equal(args[0].toString(), ID.toString(), "ID is correct")
        assert.equal(args[2].toString(), signer.address.toString(), "signer is correct")
        assert.equal(args[3].toString(), '100', "max tickets is correct")
        assert.equal(args[4].toString(), '2', "ticket price is correct")
        assert.equal(args[5].toString(), (timestamp + 86400).toString(), "expiryTimestamp is correct")

        const args2 = receipt.events.filter((x)=>{ return x.event=='ConsumeNonce' })[0].args
        assert.equal(args2[0].toString(), ID.toString(), "ID is correct")
        assert.equal(args2[1].toString(), signer.address, "signer is correct")
        assert.equal(args2[2].toString(), _nonce.toString(), "nonce is correct")

        //const timestamp = await time.latest();

        const lot = await eesee.lots(ID);
        assert.equal(lot.asset.token, NFT.address, "NFT is correct")
        assert.equal(lot.asset.tokenID, 1, "NFT tokenID is correct")
        assert.equal(lot.asset.assetType, 0, "NFT assetType is correct")
        assert.equal(lot.asset.amount, 1, "NFT amount is correct")
        assert.equal(lot.bonusTickets, 0, "bonusTickets are correct")

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

        nonce = _nonce
        _lot = await createLot(NFT.address, 2, 1, 0, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLots(
            [{token: NFT.address, tokenID: 2, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}])
        ).to.be.revertedWithCustomError(eesee, "NonceUsed")
        nonce = 888
    })

    it('Batch lists NFT', async () => {
        const nonce1 = nonce
        const lot1 = await createLot(NFT.address, 2, 1, 0, '0x',50,3,86400,signer.address,10000000000, signer)
        const nonce2 = nonce
        const lot2 = await createLot(NFT.address, 3, 1, 0, '0x',150,4,86400,signer.address,10000000000, signer)
        const nonce3 = nonce
        const lot3 = await createLot(NFT.address, 4, 1, 0, '0x',200,5,86400,signer.address,10000000000, signer)
        const tx = await eesee.connect(signer).createLots(
            [
                { token: NFT.address, tokenID: 2, amount: 1, assetType: 0, data:'0x'},
                { token: NFT.address, tokenID: 3, amount: 1, assetType: 0, data:'0x'},
                { token: NFT.address, tokenID: 4, amount: 1, assetType: 0, data:'0x'}
            ],
            [
                {maxTickets: 50, ticketPrice: 3, duration: 86400, owner: signer.address, signer: lot1.signer, signatureData: lot1.signatureData},
                {maxTickets: 150, ticketPrice: 4, duration: 86400, owner: signer.address, signer: lot2.signer, signatureData: lot2.signatureData},
                {maxTickets: 200, ticketPrice: 5, duration: 86400, owner: signer.address, signer: lot3.signer, signatureData: lot3.signatureData}
            ]
        )
        const recipt = expect(tx)
        const timestamp = await time.latest() 
        await recipt
        .to.emit(eesee, "CreateLot")
        .withArgs(1, anyValue, signer.address, 50, 3, timestamp + 86400)
        .and.to.emit(eesee, "CreateLot")
        .withArgs(2, anyValue, signer.address, 150, 4, timestamp + 86400)
        .and.to.emit(eesee, "CreateLot")
        .withArgs(3, anyValue, signer.address, 200, 5, timestamp + 86400)
        .and.to.not.emit(eesee, "ConsumeNonce")
    })

    it('Buys tickets with permit', async () => {
        snapshotId = await network.provider.send('evm_snapshot')
        const ID = 0
        await ESE.connect(acc2).approve(eesee.address, 0)
        const currentTimestamp = (await ethers.provider.getBlock()).timestamp
        const deadline = currentTimestamp + 10000
        const correctPermit = await createPermit(acc2, eesee, '40', deadline, ESE)

        const params_ = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['40', deadline, correctPermit.v, correctPermit.r, correctPermit.s]
          );

        await expect(eesee.connect(acc2).buyTickets([ID], [0], acc2.address, params_)).to.be.revertedWithCustomError(eesee, "BuyAmountTooLow")
        await expect(eesee.connect(acc2).buyTickets([100], [1], acc2.address, params_)).to.be.reverted
        await expect(eesee.connect(acc2).buyTickets([ID], [101], acc2.address, params_)).to.be.revertedWithCustomError(eesee, "AllTicketsBought");
        await expect(eesee.connect(acc2).buyTickets([ID], [31], zeroAddress, params_)).to.be.revertedWithCustomError(eesee, "InvalidRecipient")

        const balanceBefore = await ESE.balanceOf(acc2.address)
        const incorrectPermit = await createPermit(acc2, eesee, '10', deadline, ESE)
        const params_incorrect = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['10', deadline, incorrectPermit.v, incorrectPermit.r, incorrectPermit.s]
          );

          const params_incorrect2 = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            ['11', deadline, incorrectPermit.v, incorrectPermit.r, incorrectPermit.s]
          );

        await expect(eesee.connect(acc2).buyTickets([ID], [20], acc2.address, params_incorrect2))
        .to.be.revertedWith("ERC20Permit: invalid signature")
        await expect(eesee.connect(acc2).buyTickets([ID], [20], acc2.address, params_incorrect))
        .to.be.revertedWith("ERC20: insufficient allowance")
        await expect(eesee.connect(acc2).buyTickets([ID], [20], acc2.address, params_))
            .to.emit(eesee, "BuyTickets").withArgs(ID, acc2.address, 0, 20, 2*20, ((20*20 / 100 * 0.25)))
        for (let i = 0; i < 20; i++) {
            const buyer = await eesee.getLotTicketHolder(ID, i)
            assert.equal(buyer, acc2.address, "Ticket buyer is correct")
        }

        const tickets = await eesee.getLotTicketsHeldByAddress(ID, acc2.address)
        assert.equal(tickets, 20, "Tickets bought by address is correct")

        const bonusTickets = await eesee.getLotBonusTicketsHeldByAddress(ID, acc2.address)
        assert.equal(bonusTickets, (((20*20 / 100) * 0.25)), "Tickets bought by address is correct")

        const balanceAfter = await ESE.balanceOf(acc2.address)
        if(network.name != 'testnet') {
            // Hardhat node has trouble with try catch statements, so we exclude this check for 'testnet'
            // I tested in on the live goerli chain and it was OK.
            assert.equal(await staking.volume(acc2.address), 20*2, "Volume is correct")
        }

        assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), 20*2, "Price paid is correct")

        const lot = await eesee.lots(ID);
        assert.equal(lot.ticketsBought, 20, "ticketsBought is correct")
        assert.equal(lot.bonusTickets, (((20*20 / 100)* 0.25)), "bonusTickets is correct")
        await network.provider.send("evm_revert", [snapshotId])
    })
    it('Buys tickets', async () => {
        const ID = 0
        await expect(eesee.connect(acc2).buyTickets([ID], [0], acc2.address, '0x')).to.be.revertedWithCustomError(eesee, "BuyAmountTooLow")
        await expect(eesee.connect(acc2).buyTickets([100], [1], acc2.address, '0x')).to.be.reverted
        await expect(eesee.connect(acc2).buyTickets([ID], [101], acc2.address, '0x')).to.be.revertedWithCustomError(eesee, "AllTicketsBought")
        await expect(eesee.connect(acc2).buyTickets([ID], [31], zeroAddress, '0x')).to.be.revertedWithCustomError(eesee, "InvalidRecipient")
        await expect(eesee.connect(acc2).buyTickets([ID, 1], [20], acc2.address, '0x')).to.be.revertedWithCustomError(eesee, "InvalidArrayLengths")

        const balanceBefore = await ESE.balanceOf(acc2.address)
        await expect(eesee.connect(acc2).buyTickets([ID], [20], acc2.address, '0x'))
            .to.emit(eesee, "BuyTickets").withArgs(ID, acc2.address, 0, 20, 2*20, ((20*20 / 100) * 0.25))
        for (let i = 0; i < 20; i++) {
            const buyer = await eesee.getLotTicketHolder(ID, i)
            assert.equal(buyer, acc2.address, "Ticket buyer is correct")
        }

        const tickets = await eesee.getLotTicketsHeldByAddress(ID, acc2.address)
        const bonusTickets = await eesee.getLotBonusTicketsHeldByAddress(ID, acc2.address)
        assert.equal(tickets, 20 , "Tickets bought by address is correct")
        assert.equal(bonusTickets,  (((20*20 / 100) * 0.25)), "Tickets bought by address is correct")

        const balanceAfter = await ESE.balanceOf(acc2.address)
        if(network.name != 'testnet') {
            // Hardhat node has trouble with try catch statements, so we exclude this check for 'testnet'
            // I tested in on the live goerli chain and it was OK.
            assert.equal(await staking.volume(acc2.address), 20*2, "Volume is correct")
        }
        assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), 20*2, "Price paid is correct")

        const lot = await eesee.lots(ID);
        assert.equal(lot.ticketsBought, 20, "ticketsBought is correct")
        assert.equal(lot.bonusTickets, (((20*20 / 100) * 0.25)), "bonusTickets is correct")
    })

    it('Buys all tickets', async () => {
        const ID = 0
        for (let i = 1; i <= 4; i++) {
            const balanceBefore = await ESE.balanceOf(ticketBuyers[i].address)
            const recipt = expect(eesee.connect(ticketBuyers[i]).buyTickets([ID], [20], ticketBuyers[i].address, '0x'))

            await recipt.to.emit(eesee, "BuyTickets").withArgs(ID, ticketBuyers[i].address, i*(20 + ((20*20 / 100) * 0.25)), 20, 40, ((20*20 / 100) * 0.25))
            assert.equal(await eesee.getBuyTicketsRecipient(ID,i),ticketBuyers[i].address,"transaction is coorect")
            const timestamp = await time.latest()
            for (let j = i * (20 + ((20*20 / 100) * 0.25)); j < (i + 1) * (20 + ((20*20 / 100) * 0.25)); j++) {
                const buyer = await eesee.getLotTicketHolder(ID, j)
                assert.equal(buyer, ticketBuyers[i].address, "Ticket buyer is correct")
            }

            const tickets = await eesee.getLotTicketsHeldByAddress(ID, ticketBuyers[i].address)
            const bonusTickets = await eesee.getLotBonusTicketsHeldByAddress(ID, ticketBuyers[i].address)
            assert.equal(tickets, 20, "Tickets bought by address is correct")
            assert.equal(bonusTickets, (((20*20 / 100) * 0.25)), "Tickets bought by address is correct")

            const balanceAfter = await ESE.balanceOf(ticketBuyers[i].address)
            if(network.name != 'testnet') {
                // Hardhat node has trouble with try catch statements, so we exclude this check for 'testnet'
                // I tested in on the live goerli chain and it was OK.
                assert.equal(await staking.volume(ticketBuyers[i].address), 20*2, "Volume is correct")
            }
            assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), 20*2, "Price paid is correct")
            if(i == 4){
                await expect(eesee.connect(ticketBuyers[i]).buyTickets([ID], [11], ticketBuyers[i].address, '0x')).to.be.revertedWithCustomError(eesee, "AllTicketsBought")
            }
            const lot = await eesee.lots(ID);
            assert.equal(lot.ticketsBought, (i + 1)*20, "ticketsBought is correct")
            assert.equal(lot.bonusTickets, (i+1)*(((20*20 / 100) * 0.25)), "bonusTickets is correct")

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
                const tx = await eeseeRandom["performUpkeep(bytes)"]("0x")
                const recipt = expect(tx)
                await recipt.to.emit(eeseeRandom, "RequestWords").withArgs(0)
                console.log('GAS FOR PERFORM UPKEEP 1:', (await tx.wait()).gasUsed.toString())
                await expect(eeseeRandom["performUpkeep(bytes)"]("0x")).to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
            }

            await expect(eesee1inch.getLotWinner(ID))
                .to.be.revertedWithCustomError(eesee1inch, "LotNotFulfilled")
        }

        //buy tickets for lot that will expire
        const expiredLotID = 1
        await expect(eesee.connect(acc7).buyTickets([expiredLotID], [5], acc7.address, '0x'))
            .to.emit(eesee, "BuyTickets").withArgs(expiredLotID, acc7.address, 0, 5, 3*5, Math.floor((5*5 / 50) * 0.25))
        await expect(eesee.connect(ticketBuyers[5]).buyTickets([ID], [1], ticketBuyers[5].address, '0x')).to.be.revertedWithCustomError(eesee, "AllTicketsBought")
    })

    let snapshotId2
    it('if no winner chosen, can reclaim assets after returnInterval', async () => {
        const ID = 0
        snapshotId = await network.provider.send('evm_snapshot')
        await expect(eesee.connect(ticketBuyers[0]).reclaimAssets([ID],zeroAddress))
        .to.be.revertedWithCustomError(eesee, "InvalidRecipient")
        await expect(eesee.connect(ticketBuyers[0]).reclaimTokens([ID], ticketBuyers[0].address))
        .to.be.revertedWithCustomError(eesee, "LotNotExpired").withArgs(ID)
        await expect(eesee.connect(ticketBuyers[0]).reclaimTokens([ID], zeroAddress))
        .to.be.revertedWithCustomError(eesee, "InvalidRecipient")
        await expect(eesee.connect(acc9).reclaimTokens([ID], acc9.address))
        .to.be.revertedWithCustomError(eesee, "NoTicketsHeld")
        await expect(eesee.connect(signer).reclaimAssets([ID], signer.address))
        .to.be.revertedWithCustomError(eesee, "LotNotExpired").withArgs(ID)
        await expect(eesee.connect(ticketBuyers[0]).receiveTokens([ID], ticketBuyers[0].address))
        .to.be.revertedWithCustomError(eesee, "LotNotFulfilled").withArgs(ID)
        await expect(eesee.connect(signer).receiveAssets([ID], signer.address))
        .to.be.revertedWithCustomError(eesee, "LotNotFulfilled").withArgs(ID)

        await time.increase(86401)

        await expect(eesee.connect(ticketBuyers[0]).receiveTokens([ID], ticketBuyers[0].address))
        .to.be.revertedWithCustomError(eesee, "LotNotFulfilled").withArgs(ID)
        await expect(eesee.connect(signer).receiveAssets([ID], signer.address))
        .to.be.revertedWithCustomError(eesee, "LotNotFulfilled").withArgs(ID)

        snapshotId2 = await network.provider.send('evm_snapshot')
        await expect(eesee.connect(signer).reclaimAssets([ID], signer.address))
        .to.emit(eesee, "ReclaimAsset").withArgs(ID, signer.address, signer.address, anyValue)
        for (let i = 0; i <= 4; i++) {
            await expect(eesee.connect(ticketBuyers[i]).reclaimTokens([ID], ticketBuyers[i].address))
            .to.emit(eesee, "ReclaimTokens")
            .withArgs(ID, ticketBuyers[i].address, ticketBuyers[i].address, 40)
        }
        await network.provider.send("evm_revert", [snapshotId2])
    })
    it('select winner after returnInterval expiry', async () => {
        const ID = 0
        const tx = await mockVRF.fulfillWords(0, {gasLimit: '30000000'})
        const recipt = expect(tx)
        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)

        await expect(eesee.connect(ticketBuyers[0]).reclaimTokens([ID], ticketBuyers[0].address))
        .to.emit(eesee, "ReclaimTokens").withArgs(ID, ticketBuyers[0].address, ticketBuyers[0].address, 40)
        await expect(eesee.connect(signer).reclaimAssets([ID], signer.address))
        .to.emit(eesee, "ReclaimAsset").withArgs(ID, signer.address, signer.address, anyValue)

        await expect(eesee.connect(signer).receiveAssets([ID], signer.address))
        .to.be.revertedWithCustomError(eesee, "LotExpired").withArgs(ID)
        await expect(eesee.connect(signer).receiveTokens([ID], signer.address))
        .to.be.revertedWithCustomError(eesee, "LotExpired").withArgs(ID)

        await network.provider.send("evm_revert", [snapshotId])
    })

    it('Selects winner', async () => {
        const ID = 0
        const tx = await mockVRF.fulfillWords(0, {gasLimit: '30000000'})
        const recipt = expect(tx)

        assert.notEqual((await eesee1inch.getLotWinner(ID)).winner, zeroAddress, "winner is chosen")
        assert.equal((await eesee1inch.getLotWinner(ID)).isAssetWinner, true, "isAssetWinner is correct")
        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)
        console.log('GAS FOR CHAINLINK VRF 1:', (await tx.wait()).gasUsed.toString())
        await expect(eeseeRandom["performUpkeep(bytes)"]("0x")).to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
    })
    //also check batch receive multiple at the same time
    it('Receives asset after win', async () => {
        const ID = 0
        const winner = (await eesee1inch.getLotWinner(ID)).winner
        assert.equal((await eesee1inch.getLotWinner(ID)).isAssetWinner, true, "isAssetWinner is correct")
        const signers = await ethers.getSigners()
        const winnerAcc = signers.filter(signer => signer.address === winner)[0]
        const notWinnerAcc = signers.filter(signer => signer.address !== winner)[0]
        await expect(eesee.connect(notWinnerAcc).receiveAssets([ID], winner))
        .to.be.revertedWithCustomError(eesee, "CallerNotWinner").withArgs(ID)
        await expect(eesee.connect(winnerAcc).receiveAssets([ID], zeroAddress))
        .to.be.revertedWithCustomError(eesee, "InvalidRecipient")
        await expect(eesee.connect(signer).reclaimAssets([ID], signer.address))
        .to.be.revertedWithCustomError(eesee, "LotAlreadyFulfilled")
        await expect(eesee.connect(winnerAcc).receiveAssets([ID], winner))
        .to.emit(eesee, "ReceiveAsset")
        .withArgs(ID, winnerAcc.address, winner, anyValue)
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
        await expect(eesee.connect(signer).receiveTokens([ID], zeroAddress))
        .to.be.revertedWithCustomError(eesee, "InvalidRecipient")

        const lot = await eesee.lots(ID);
        const expectedFee = BigInt(lot.ticketPrice) * BigInt(lot.maxTickets) * BigInt(lot.fee) / BigInt('10000')
        const expectedReceive = BigInt(lot.ticketPrice) * BigInt(lot.maxTickets) - expectedFee

        const ownerBalanceBefore = await ESE.balanceOf(signer.address)
        const feeBalanceBefore = await ESE.balanceOf(feeCollector.address)
        await expect(eesee.connect(signer).receiveTokens([ID], signer.address))
        .to.emit(eesee, "ReceiveTokens")
        .withArgs(ID, signer.address, signer.address, expectedReceive)
        .and.to.emit(eesee, "CollectFee")
        .withArgs(feeCollector.address, expectedFee)
        const ownerBalanceAfter = await ESE.balanceOf(signer.address)
        const feeBalanceAfter = await ESE.balanceOf(feeCollector.address)

        assert.equal(expectedFee, BigInt(feeBalanceAfter) - BigInt(feeBalanceBefore), "fee is correct")
        assert.equal(expectedReceive, BigInt(ownerBalanceAfter) - BigInt(ownerBalanceBefore), "owner balance is correct")

        // reverted because lot deleted after previous claim
        await expect(eesee.connect(signer).receiveTokens([ID], signer.address))
        .to.be.reverted
        await expect(eesee.connect(acc2).buyTickets([ID], [20], acc2.address, '0x'))
        .to.be.revertedWithCustomError(eesee, "LotNotExists").withArgs(ID)
        await expect(eesee.connect(signer).receiveAssets([ID], signer.address))
        .to.be.revertedWithCustomError(eesee, "LotNotExists").withArgs(ID)
        await expect(eesee1inch.getLotWinner(ID))
        .to.be.revertedWithCustomError(eesee1inch, "LotNotExists")
    })
    it('buyTickets reverts if lot is expired', async () => {
        const IDs = [1,2,3]

        await eesee.connect(acc2).buyTickets([IDs[2]], [20], acc2.address, '0x')

        const timestampBeforeTimeSkip = (await ethers.provider.getBlock()).timestamp
        await time.increase(86401)
        const timestampAfterTimeSkip = (await ethers.provider.getBlock()).timestamp
        const lot = await eesee.lots(IDs[0])
        assert.equal(timestampBeforeTimeSkip, timestampAfterTimeSkip-86401, "timetravel is successfull")
        assert.equal(ethers.BigNumber.from(lot.endTimestamp).lt(timestampAfterTimeSkip), true, "lot expired")
        await expect(eesee.connect(acc2).buyTickets([IDs[0]], [20], acc2.address, '0x')).to.be.revertedWithCustomError(eesee, "LotExpired").withArgs(IDs[0])
        await expect(eesee.connect(acc2).buyTickets([IDs[1]], [20], acc2.address, '0x')).to.be.revertedWithCustomError(eesee, "LotExpired").withArgs(IDs[1])
    })
    it('Can reclaim tokens if lot is expired', async () => {
        const expiredLotID = 1
        const balanceBeforeTokens = await ESE.balanceOf(acc7.address); 
        let lot = await eesee.lots(expiredLotID)

        await expect(eesee.connect(acc7).reclaimTokens([expiredLotID], acc7.address))
        .to.be.revertedWithCustomError(eesee, "LotNotExpired").withArgs(expiredLotID)


        //Test receiveTokens in case of expired lot
        snapshotId = await network.provider.send('evm_snapshot')

        await eeseeRandom["performUpkeep(bytes)"]("0x")
        await mockVRF.fulfillWords(1)

        await expect(eesee.connect(acc7).reclaimTokens([expiredLotID], acc7.address))
        .to.be.revertedWithCustomError(eesee, "LotAlreadyFulfilled").withArgs(expiredLotID)

        const winner = (await eesee1inch.getLotWinner(expiredLotID)).winner
        assert.notEqual(winner, zeroAddress)
        assert.equal((await eesee1inch.getLotWinner(expiredLotID)).isAssetWinner, false)
        const signers = await ethers.getSigners()
        const winnerAcc = signers.filter(signer => signer.address === winner)[0]
        const notWinnerAcc = signers.filter(signer => signer.address !== winner)[0]
        await expect(eesee.connect(notWinnerAcc).receiveTokens([expiredLotID], winner))
        .to.be.revertedWithCustomError(eesee, "CallerNotWinner").withArgs(expiredLotID)

        const wonAmount = ((lot.ticketsBought) * lot.ticketPrice - parseInt((lot.ticketsBought) * lot.ticketPrice * lot.fee / 10000))
        const balanceBefore = await ESE.balanceOf(winner)
        await expect(eesee.connect(winnerAcc).receiveTokens([expiredLotID], winner))
        .to.emit(eesee, "ReceiveTokens")
        .withArgs(expiredLotID, winnerAcc.address, winner, wonAmount)
        lot = await eesee.lots(expiredLotID)
        assert.equal(lot.assetClaimed, false, "assetClaimed is correct")
        assert.equal(lot.tokensClaimed, true, "tokensClaimed is correct")

        const balanceAfter = await ESE.balanceOf(winner)
        assert.equal(balanceAfter.sub(balanceBefore), wonAmount, "ESE is correct")
        await expect(eesee.connect(winnerAcc).receiveTokens([expiredLotID], winner))
        .to.be.revertedWithCustomError(eesee, "TokensAlreadyClaimed").withArgs(expiredLotID)

        await network.provider.send("evm_revert", [snapshotId])

        snapshotId = await network.provider.send('evm_snapshot')
        await eeseeRandom["performUpkeep(bytes)"]("0x")
        await mockVRF.fulfillWords(1)
        await expect(eesee1inch.getLotWinner(2))
        .to.be.revertedWithCustomError(eesee1inch, "NoTicketsBought")
        await network.provider.send("evm_revert", [snapshotId])

        // Expired lots unlock after 1 day of not selecting a winner
        await time.increase(86401)

        await expect(eesee.connect(acc7).reclaimTokens([expiredLotID], acc7.address))
        .to.emit(eesee, "ReclaimTokens")
        .withArgs(expiredLotID, acc7.address, acc7.address, lot.ticketPrice.mul(ethers.BigNumber.from(5))) //emit ReclaimTokens(ID, msg.sender, recipient, ticketsBoughtByAddress, _amount);

        //await new Promise(resolve => setTimeout(resolve, 2000));
        const balanceAfterTokens = await ESE.balanceOf(acc7.address); 
        assert.equal(balanceAfterTokens.sub(balanceBeforeTokens), lot.ticketPrice * 5, "balance is correct")

        await expect(eesee1inch.getLotWinner(expiredLotID))
        .to.be.revertedWithCustomError(eesee1inch, "LotNotFulfilled")
    })
    it('Can reclaim asset if lot is expired', async () => {
        const IDs = [1,2,3]

        snapshotId = await network.provider.send('evm_snapshot')
        await eeseeRandom["performUpkeep(bytes)"]("0x")
        await mockVRF.fulfillWords(1)
        await expect(eesee1inch.getLotWinner(2))
        .to.be.revertedWithCustomError(eesee1inch, "LotExpired")
        await network.provider.send("evm_revert", [snapshotId])

        await expect(eesee.connect(acc2).reclaimAssets(IDs, signer.address))
        .to.be.revertedWithCustomError(eesee, "CallerNotOwner").withArgs(1)
        await expect(eesee.connect(signer).receiveAssets(IDs, signer.address))
        .to.be.revertedWithCustomError(eesee, "NoTicketsBought")
        await expect(eesee.connect(signer).receiveTokens(IDs, signer.address))
        .to.be.revertedWithCustomError(eesee, "NoTicketsBought")
        await expect(eesee.connect(signer).reclaimAssets(IDs, signer.address))
        .to.emit(eesee, "ReclaimAsset")
        .withArgs(1, signer.address, signer.address, anyValue)
        .and.to.emit(eesee, "ReclaimAsset")
        .withArgs(2, signer.address, signer.address, anyValue)
        .and.to.emit(eesee, "ReclaimAsset")
        .withArgs(3, signer.address, signer.address, anyValue)

        await expect(eesee.connect(signer).reclaimAssets([3], signer.address))
            .to.be.revertedWithCustomError(eesee, "AssetAlreadyClaimed").withArgs(3)
    })
    it('Royalties work', async () => {
        await time.increase(86401)
        const currentLotID = (await eesee.getLotsLength()).toNumber()

        const _nonce = nonce
        const _lot = await createLot(NFTWithRoyalty.address, 1, 1, 0, '0x',5,2000,86400,acc8.address,10000000000, signer)
        let _tx = await eesee.connect(signer).createLots(
            [{token: NFTWithRoyalty.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 5, ticketPrice: 2000, duration: 86400, owner: acc8.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )
        let timestamp = await time.latest() 
        await expect(_tx)
        .to.emit(eesee, "CreateLot")
        .withArgs(currentLotID, anyValue, acc8.address, 5, 2000, timestamp + 86400)
        .and.to.not.emit(eesee, "ConsumeNonce")


        const royaltyInfoForLot1 = await NFTWithRoyalty.royaltyInfo(1, 10000) 
        assert.equal(royaltyInfoForLot1[1].toString(), "300", `royaltyInfo for ${currentLotID} is correct`)


        for(let i = 0; i < 5; i ++){
            await expect(eesee.connect(ticketBuyers[i]).buyTickets([currentLotID], [1], ticketBuyers[i].address, '0x'))
            .to.emit(eesee, "BuyTickets").withArgs(currentLotID, ticketBuyers[i].address, i, 1, 2000, 0)
        }

        let tx = await eeseeRandom["performUpkeep(bytes)"]("0x")
        let recipt = expect(tx)
        await recipt.to.emit(eeseeRandom, "RequestWords").withArgs(1)
        console.log('GAS FOR PERFORM UPKEEP 3:', (await tx.wait()).gasUsed.toString())

        tx = await mockVRF.fulfillWords(1)
        recipt = expect(tx)
        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(1)
        console.log('GAS FOR CHAINLINK VRF 3:', (await tx.wait()).gasUsed.toString())

        const winner = (await eesee1inch.getLotWinner(currentLotID)).winner
        assert.equal((await eesee1inch.getLotWinner(currentLotID)).isAssetWinner, true, "isAssetWinner is correct")
        assert.notEqual(winner, zeroAddress, "winner is chosen")
        let royaltyCollectorBalanceBefore = await ESE.balanceOf(royaltyCollector.address)
        await expect(eesee.connect(acc8).receiveTokens([currentLotID], acc8.address))
        .to.emit(eesee, 'CollectRoyalty')
        .withArgs(royaltyCollector.address, royaltyInfoForLot1[1])
        let royaltyCollectorBalanceAfter = await ESE.balanceOf(royaltyCollector.address)
        assert.equal(royaltyCollectorBalanceBefore.add(royaltyInfoForLot1[1]).toString(), royaltyCollectorBalanceAfter.toString(), 'Royalty collector balance is correct')
    })

    it('swaps tokens using 1inch', async () => {
        const currentLotID = (await eesee.getLotsLength()).toNumber()

        const _lot = await createLot(NFTWithRoyalty.address, 2, 1, 0, '0x',10,50,86400,signer.address,10000000000, signer)
        await eesee.connect(signer).createLots(
            [{token: NFTWithRoyalty.address, tokenID: 2, amount: 1, assetType: 0, data:'0x'}], 
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
                flags: 0,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        await expect(eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [3], swapData, signer.address))
        .to.be.revertedWithCustomError(eesee1inch, "PartialFillNotAllowed")
        
        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address, 
                amount: 232, //should buy 2 tickets + 10 ESE dust
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        await expect(eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [3], swapData, signer.address))
        .to.be.revertedWith("ERC20: transfer amount exceeds balance")


        const balanceBefore = await ESE.balanceOf(signer.address)
        const balanceBefore_ = await ERC20.balanceOf(signer.address)

        await expect(eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [2], swapData, signer.address))
            .to.emit(eesee, "BuyTickets").withArgs(currentLotID, signer.address, 0, 2, 100, Math.floor((2*2)/10)*0.25)

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
                amount: 212, //should buy 2 tickets + 10 ESE dust
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        await expect(eesee1inch.connect(signer).buyTicketsWithSwap([currentLotID], [2], swapData, signer.address, {value: 211}))//
        .to.be.revertedWithCustomError(eesee1inch, "InvalidMsgValue")

        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: zeroAddress,
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address, 
                amount: 64, //should buy 2 tickets + 8 ESE dust
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        const _balanceBefore = await ESE.balanceOf(acc9.address)
        const _balanceBefore_ = await ethers.provider.getBalance(acc9.address);
        const _balanceBefore__ = await ethers.provider.getBalance(eesee1inch.address);

        const tx = await eesee1inch.connect(acc9).buyTicketsWithSwap([currentLotID], [2], swapData, acc9.address, {value: 64})
        const rr = await tx.wait()
        await expect(tx).to.emit(eesee, "BuyTickets").withArgs(currentLotID, acc9.address, 2, 2, 100, Math.floor((2*2)/10)*0.25)

        const _balanceAfter = await ESE.balanceOf(acc9.address)
        const _balanceAfter_ = await ethers.provider.getBalance(acc9.address);
        const _balanceAfter__ = await ethers.provider.getBalance(eesee1inch.address);

        assert.equal(_balanceAfter.sub(_balanceBefore).toString(), "8", 'ESE balance is correct')
        assert.equal(_balanceAfter__.sub(_balanceBefore__).toString(), '0', 'eesee1inch balance is correct')
        assert.equal(_balanceBefore_.sub(_balanceAfter_).sub(rr.gasUsed.mul(rr.effectiveGasPrice)).toString(), "64", 'ERC20 balance is correct')
    })
    it('Buys tickets and reclaims tokens after volumeUpdater rights were removed from eesee', async () => {
        await staking.revokeVolumeUpdater(eesee.address)

        const currentLotID = (await eesee.getLotsLength()).toNumber()
        const volumeBefore = await staking.volume(signer.address)

        const _lot = await createLot(NFTWithRoyalty.address, 3, 1, 0, '0x',10,50,86400,signer.address,10000000000, signer)
        await eesee.connect(signer).createLots(
            [{token: NFTWithRoyalty.address, tokenID: 3, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 10, ticketPrice: 50, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )
        await ESE.approve(eesee.address, '100')
        const tx = await eesee.buyTickets([currentLotID], [2], signer.address, '0x')
        await expect(tx).to.emit(eesee, "BuyTickets").withArgs(currentLotID, signer.address, 0, 2, 100, Math.floor((2*2)/10)*0.25)
        const volumeAfter = await staking.volume(signer.address)
        assert.equal(volumeAfter.sub(volumeBefore), 0, "volume is correct")

        await time.increase(86401 + 86401)

        await expect(eesee.reclaimTokens([currentLotID], signer.address))
        .to.emit(eesee, "ReclaimTokens")
        .withArgs(currentLotID, signer.address, signer.address, 100)
        const volumeAfter2 = await staking.volume(signer.address)

        assert.equal(volumeAfter2.sub(volumeAfter), 0, "volume is correct")
    })

    it('Buys tickets for multiple lots', async () => {
        const currentLotID = (await eesee.getLotsLength()).toNumber()
        const _lot1 = await createLot(NFTWithRoyalty.address, 4, 1, 0, '0x',10,50,86400,signer.address,10000000000, signer)
        const _lot2 = await createLot(NFTWithRoyalty.address, 5, 1, 0, '0x',10,50,86400,signer.address,10000000000, signer)
        await eesee.connect(signer).createLots(
            [
                {token: NFTWithRoyalty.address, tokenID: 4, amount: 1, assetType: 0, data:'0x'},
                {token: NFTWithRoyalty.address, tokenID: 5, amount: 1, assetType: 0, data:'0x'}
            ], 
            [
                {maxTickets: 10, ticketPrice: 50, duration: 86400, owner: signer.address, signer: _lot1.signer, signatureData: _lot1.signatureData},
                {maxTickets: 10, ticketPrice: 50, duration: 86400, owner: signer.address, signer: _lot2.signer, signatureData: _lot2.signatureData}
            ]
        )
        await ESE.approve(eesee.address, '150')
        const tx = await eesee.buyTickets([currentLotID, currentLotID + 1], [1, 2], signer.address, '0x')
        await expect(tx)
        .to.emit(eesee, "BuyTickets").withArgs(currentLotID, signer.address, 0, 1, 50, Math.floor((1*1)/50)*0.25)
        .and.to.emit(eesee, "BuyTickets").withArgs(currentLotID+1, signer.address, 0, 2, 100, Math.floor((2*2)/50)*0.25)
    })

    it('Creates lots with ERC20 asset types', async () => {
        const _ERC1155 = await hre.ethers.getContractFactory("Mock1155");
        const ERC1155 = await _ERC1155.deploy("", 0, 10000, royaltyCollector.address, 10000)
        await ERC1155.deployed()
        await ERC1155.setApprovalForAll(eesee.address, 10000)

        await ERC20.approve(eesee.address, 10000)
        let _lot = await createLot(ERC20.address, 0, 0, 2, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC20.address, tokenID: 0, amount: 0, assetType: 2, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidAmount")

        _lot = await createLot(ERC20.address, 0, 10000, 1, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC20.address, tokenID: 0, amount: 10000, assetType: 1, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidInterface")

        _lot = await createLot(ERC20.address, 0, 10000, 0, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC20.address, tokenID: 0, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidInterface")

        _lot = await createLot(ERC20.address, 0, 10000, 3, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC20.address, tokenID: 0, amount: 10000, assetType: 3, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}],
            {value: 10000}
        )).to.be.revertedWithCustomError(eesee, "InvalidToken")

        _lot = await createLot(NFT.address, 0, 10000, 2, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 0, amount: 10000, assetType: 2, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidInterface")

        _lot = await createLot(ERC1155.address, 0, 10000, 2, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC1155.address, tokenID: 0, amount: 10000, assetType: 2, data:'0x'}],
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWith("SafeERC20: low-level call failed")

        _lot = await createLot(ERC20.address, 1, 10000, 2, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC20.address, tokenID: 1, amount: 10000, assetType: 2, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidTokenID")

        _lot = await createLot(ERC20.address, 0, 10000, 2, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC20.address, tokenID: 0, amount: 10000, assetType: 2, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 1}
        )).to.be.revertedWithCustomError(eesee, "InvalidMsgValue")

        _lot = await createLot(ERC20.address, 0, 10000, 2, '0x01',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC20.address, tokenID: 0, amount: 10000, assetType: 2, data:'0x01'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidData")
        await expect(eesee.connect(signer).createLots(
            [{token: ERC20.address, tokenID: 0, amount: 10000, assetType: 2, data:'0x'}, {token: ERC20.address, tokenID: 0, amount: 10000, assetType: 2, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidArrayLengths")

        const currentLotID = (await eesee.getLotsLength()).toNumber()
        const balanceBefore = await ERC20.balanceOf(signer.address)

        let _nonce = nonce
        _lot = await createLot(ERC20.address, 0, 10000, 2, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC20.address, tokenID: 0, amount: 10000, assetType: 2, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
            ))
        .to.emit(eesee, "CreateLot")
        .withArgs(currentLotID, anyValue, signer.address, 100, 2, anyValue)
        .and.to.not.emit(eesee, "ConsumeNonce")
        const balanceAfter = await ERC20.balanceOf(signer.address)

        assert.equal(balanceBefore.sub(balanceAfter), 10000, "balance is correct")

        const lot = await eesee.lots(currentLotID);
        assert.equal(lot.asset.token, ERC20.address, "token is correct")
        assert.equal(lot.asset.tokenID, 0, "tokenID is correct")
        assert.equal(lot.asset.assetType, 2, "assetType is correct")
        assert.equal(lot.asset.amount, 10000, "NFT amount is correct")
        const snapshotId = await network.provider.send('evm_snapshot')
        await time.increase(100000)

        const _balanceBefore = await ERC20.balanceOf(signer.address)
        await eesee.reclaimAssets([currentLotID], signer.address)
        const _balanceAfter = await ERC20.balanceOf(signer.address)
        assert.equal(_balanceAfter.sub(_balanceBefore), 10000, "balance is correct")
        await network.provider.send("evm_revert", [snapshotId])
    })
    it('Royalties not collected for ERC20', async () => {
        // buyout
        const currentLotID = (await eesee.getLotsLength()).toNumber() - 1
        const snapshotId = await network.provider.send('evm_snapshot')
        await eesee.connect(acc2).buyTickets([currentLotID], [100], acc2.address, '0x')
        await expect(eesee.connect(signer).receiveTokens([currentLotID], signer.address))
        .to.emit(eesee, "ReceiveTokens")
        assert.equal((await ESE.balanceOf(royaltyCollector.address)).toString(), (await ESE.balanceOf(royaltyCollector.address)).toString(), "Royalty not recieved by royaltyCollector" )
        await network.provider.send("evm_revert", [snapshotId])
        // regular sale
        await eesee.connect(acc2).buyTickets([currentLotID], [50], acc2.address, '0x')
        await eesee.connect(acc3).buyTickets([currentLotID], [50], acc3.address, '0x')
        await mockVRF.fulfillWords(0, {gasLimit: '30000000'})
        assert.notEqual((await eesee1inch.getLotWinner(currentLotID)).winner, zeroAddress, "winner is chosen")
        await expect(eesee.connect(signer).receiveTokens([currentLotID], signer.address))
        .to.emit(eesee, "ReceiveTokens")
        assert.equal((await ESE.balanceOf(royaltyCollector.address)).toString(), (await ESE.balanceOf(royaltyCollector.address)).toString(), "Royalty not recieved by royaltyCollector" )
    })
    it('Creates lots with ERC1155 asset types', async () => {
        const _ERC1155 = await hre.ethers.getContractFactory("Mock1155");

        const ERC1155 = await _ERC1155.deploy("", 1, 10000, royaltyCollector.address, 10000)
        await ERC1155.deployed()
        await ERC1155.setApprovalForAll(eesee.address, 10000)

        let _lot = await createLot(ERC1155.address, 1, 0, 1, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC1155.address, tokenID: 1, amount: 0, assetType: 1, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidAmount")
        
        _lot = await createLot(ERC1155.address, 1, 10000, 0, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC1155.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidInterface")
        
        _lot = await createLot(ERC1155.address, 0, 10000, 2, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC1155.address, tokenID: 0, amount: 10000, assetType: 2, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWith("SafeERC20: low-level call failed")

        _lot = await createLot(ERC1155.address, 1, 10000, 3, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC1155.address, tokenID: 1, amount: 10000, assetType: 3, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
            ,{value:10000}
        )).to.be.revertedWithCustomError(eesee, "InvalidToken")

        _lot = await createLot(NFT.address, 1, 10000, 1, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 10000, assetType: 1, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidInterface")

        _lot = await createLot(ERC20.address, 1, 10000, 1, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC20.address, tokenID: 1, amount: 10000, assetType: 1, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )).to.be.revertedWithCustomError(eesee, "InvalidInterface")

        _lot = await createLot(ERC1155.address, 1, 10000, 1, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC1155.address, tokenID: 1, amount: 10000, assetType: 1, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 1}
        )).to.be.revertedWithCustomError(eesee, "InvalidMsgValue")
        
        const currentLotID = (await eesee.getLotsLength()).toNumber()
        const balanceBefore = await ERC1155.balanceOf(signer.address, 1)

        let _nonce = nonce
        _lot = await createLot(ERC1155.address, 1, 10000, 1, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: ERC1155.address, tokenID: 1, amount: 10000, assetType: 1, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        ))
        .to.emit(eesee, "CreateLot")
        .withArgs(currentLotID, anyValue, signer.address, 100, 2, anyValue)
        .and.to.not.emit(eesee, "ConsumeNonce")
        const balanceAfter = await ERC1155.balanceOf(signer.address, 1)

        assert.equal(balanceBefore.sub(balanceAfter), 10000, "balance is correct")

        const lot = await eesee.lots(currentLotID);
        assert.equal(lot.asset.token, ERC1155.address, "token is correct")
        assert.equal(lot.asset.tokenID, 1, "tokenID is correct")
        assert.equal(lot.asset.assetType, 1, "assetType is correct")
        assert.equal(lot.asset.amount, 10000, "NFT amount is correct")

        const snapshotId = await network.provider.send('evm_snapshot')
        await time.increase(100000)

        const _balanceBefore = await ERC1155.balanceOf(signer.address, 1)
        await eesee.reclaimAssets([currentLotID], signer.address)
        const _balanceAfter = await ERC1155.balanceOf(signer.address, 1)
        assert.equal(_balanceAfter.sub(_balanceBefore), 10000, "balance is correct")
        await network.provider.send("evm_revert", [snapshotId])
    })
    it('Royalties collected for ERC1155', async () => {
        // buyout
        const currentLotID = (await eesee.getLotsLength()).toNumber() - 1
        const snapshotId = await network.provider.send('evm_snapshot')
        let lot = await eesee.lots(currentLotID);
        const ERC1155 = await hre.ethers.getContractAt('Mock1155', lot.asset.token)
        await eesee.connect(acc2).buyTickets([currentLotID], [100], acc2.address, '0x')
        let royaltyInfo = await ERC1155.royaltyInfo(1, 200) 
        let royaltyCollectorBalanceBefore = await ESE.balanceOf(royaltyCollector.address)
        await expect(eesee.connect(signer).receiveTokens([currentLotID], signer.address))
        .to.emit(eesee, "CollectRoyalty")
        .withArgs(royaltyCollector.address, royaltyInfo[1])
        assert.equal((await ESE.balanceOf(royaltyCollector.address)).toString(), (royaltyCollectorBalanceBefore.add(royaltyInfo[1])).toString(), "Royalty recieved by royaltyCollector" )
        await network.provider.send("evm_revert", [snapshotId])
        // regular sale
        await eesee.connect(acc2).buyTickets([currentLotID], [50], acc2.address, '0x')
        await eesee.connect(acc3).buyTickets([currentLotID], [50], acc3.address, '0x')
        await mockVRF.fulfillWords(0, {gasLimit: '30000000'})
        royaltyInfo = await ERC1155.royaltyInfo(1, 200) 
        royaltyCollectorBalanceBefore = await ESE.balanceOf(royaltyCollector.address)
        await expect(eesee.connect(signer).receiveTokens([currentLotID], signer.address))
        .to.emit(eesee, "CollectRoyalty")
        .withArgs(royaltyCollector.address, royaltyInfo[1])
        assert.equal((await ESE.balanceOf(royaltyCollector.address)).toString(), (royaltyCollectorBalanceBefore.add(royaltyInfo[1])).toString(), "Royalty recieved by royaltyCollector" )
    })
    it('Creates lots with native asset types', async () => {
        const _ERC1155 = await hre.ethers.getContractFactory("Mock1155");
        const ERC1155 = await _ERC1155.deploy("", 0, 10000, royaltyCollector.address, 10000)
        await ERC1155.deployed()
        await ERC1155.setApprovalForAll(eesee.address, 10000)

        let _lot = await createLot(zeroAddress, 0, 0, 3, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: zeroAddress, tokenID: 0, amount: 0, assetType: 3, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 10000}
        )).to.be.revertedWithCustomError(eesee, "InvalidAmount")
        
        _lot = await createLot(zeroAddress, 1, 10000, 3, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: zeroAddress, tokenID: 1, amount: 10000, assetType: 3, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 10000}
        )).to.be.revertedWithCustomError(eesee, "InvalidTokenID")

        _lot = await createLot(oneAddress, 0, 10000, 3, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: oneAddress, tokenID: 0, amount: 10000, assetType: 3, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 10000}
        )).to.be.revertedWithCustomError(eesee, "InvalidToken")

        _lot = await createLot(zeroAddress, 0, 10000, 3, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: zeroAddress, tokenID: 0, amount: 10000, assetType: 3, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 9999}
        )).to.be.revertedWithCustomError(eesee, "InvalidMsgValue")

        _lot = await createLot(zeroAddress, 0, 10000, 3, '0x01',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: zeroAddress, tokenID: 0, amount: 10000, assetType: 3, data:'0x01'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 10000}
        )).to.be.revertedWithCustomError(eesee, "InvalidData")
        

        _lot = await createLot(zeroAddress, 0, 10000, 0, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: zeroAddress, tokenID: 0, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 10000}
        )).to.be.revertedWithCustomError(eesee, "InvalidMsgValue")

        _lot = await createLot(zeroAddress, 0, 10000, 1, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: zeroAddress, tokenID: 0, amount: 10000, assetType: 1, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 10000}
        )).to.be.revertedWithCustomError(eesee, "InvalidMsgValue")

        _lot = await createLot(zeroAddress, 0, 10000, 2, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(signer).createLots(
            [{token: zeroAddress, tokenID: 0, amount: 10000, assetType: 2, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 10000}
        )).to.be.revertedWithCustomError(eesee, "InvalidMsgValue")

        const currentLotID = (await eesee.getLotsLength()).toNumber()
        const balanceBefore = await ethers.provider.getBalance(signer.address);

        let _nonce = nonce
        _lot = await createLot(zeroAddress, 0, 10000, 3, '0x',100,2,86400,signer.address,10000000000, signer)
        const tx = await eesee.connect(signer).createLots(
            [{token: zeroAddress, tokenID: 0, amount: 10000, assetType: 3, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}], {value: 10000}
        )
        const rr = await tx.wait()
        await expect(tx)
        .to.emit(eesee, "CreateLot")
        .withArgs(currentLotID, anyValue, signer.address, 100, 2, anyValue)
        .and.to.not.emit(eesee, "ConsumeNonce")
        const balanceAfter = await ethers.provider.getBalance(signer.address);

        assert.equal(balanceBefore.sub(balanceAfter).sub(rr.gasUsed.mul(rr.effectiveGasPrice)).toString(), '10000', "balance is correct")

        const lot = await eesee.lots(currentLotID);
        assert.equal(lot.asset.token, zeroAddress, "token is correct")
        assert.equal(lot.asset.tokenID, 0, "tokenID is correct")
        assert.equal(lot.asset.assetType, 3, "assetType is correct")
        assert.equal(lot.asset.amount, 10000, "NFT amount is correct")

        await time.increase(100000)

        //eesee does not have a receive function
        await expect(eesee.connect(signer).reclaimAssets([currentLotID], eesee.address)).to.be.revertedWithCustomError(eesee, "TransferNotSuccessful")

        const _balanceBefore = await ethers.provider.getBalance(signer.address);
        const _tx = await eesee.connect(signer).reclaimAssets([currentLotID], signer.address)
        const _rr = await _tx.wait()
        const _balanceAfter = await ethers.provider.getBalance(signer.address);

        assert.equal(_balanceAfter.sub(_balanceBefore).add(_rr.gasUsed.mul(_rr.effectiveGasPrice)).toString(), '10000', "balance is correct")
    })

    it('Buys NFT from other marketplace using swapTokensForAssets', async () => {
        const currentLotID = (await eesee.getLotsLength()).toNumber()

        const _lot = await createLot(NFTWithRoyalty.address, 6, 1, 0, '0x',100,20000000,86400,signer.address,10000000000, signer)
        await eesee.connect(signer).createLots(
            [{token: NFTWithRoyalty.address, tokenID: 6, amount: 1, assetType: 0, data:'0x'}], 
            [{maxTickets: 100, ticketPrice: 20000000, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}]
        )
        
        await ESE.approve(eesee.address, '40000000')
        let tx = await eesee.buyTickets([currentLotID], [2], signer.address, '0x')

        await time.increase(86401)

        tx = await eeseeRandom["performUpkeep(bytes)"]("0x")
        console.log('GAS FOR PERFORM UPKEEP 4:', (await tx.wait()).gasUsed.toString())
        tx = await mockVRF.fulfillWords(2)
        console.log('GAS FOR CHAINLINK VRF 4:', (await tx.wait()).gasUsed.toString())

        const lotData = await eesee.lots(currentLotID)
        const winningsAmount = lotData.ticketPrice.mul(lotData.ticketsBought)
        const denominator = ethers.BigNumber.from('10000')
        const feeAmount = winningsAmount.mul(lot.fee).div(denominator)
        const totalAmount = winningsAmount.sub(feeAmount)

        let iface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ]);
        let swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalAmount,
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])

        const basicOrderType = 'tuple(address considerationToken, uint256 considerationIdentifier, uint256 considerationAmount, address offerer, address zone, address offerToken, uint256 offerIdentifier, uint256 offerAmount, uint8 basicOrderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 offererConduitKey, bytes32 fulfillerConduitKey, uint256 totalOriginalAdditionalRecipients, tuple(uint256 amount, address payable recipient)[] additionalRecipients, bytes signature)'
        // basicFullfillOrder Seaport transaction:
        // https://etherscan.io/tx/0xea8bd4519113ed77be6934583d0de40c943588b3758fa579e53d5a73044e25d3
        const basicOrderOpensea = {
            considerationToken: "0x0000000000000000000000000000000000000000",
            considerationIdentifier: "0",
            considerationAmount: "95000000000000000",
            offerer: "0x4bf623f03E7415C33AAc384a1Ab311F3004Ae60d",
            zone: "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
            offerToken: "0x0Cfb5d82BE2b949e8fa73A656dF91821E2aD99FD",
            offerIdentifier: "281474976712734",
            offerAmount: "1",
            basicOrderType: "0",
            startTime: "1692037707",
            endTime: "1694629706",
            zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
            salt: "51951570786726798460324975021501917861654789585098516727724847791473395179544",
            offererConduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            fulfillerConduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
            totalOriginalAdditionalRecipients: "1",
            additionalRecipients: [
                {
                    amount: "5000000000000000",
                    recipient: "0x6f73F92cf0C920E645Af34B0e4501911c42A718a"
                }
            ],
            signature: "0x1ddc6b9f2739322b14ba2d7e0ac67d0bd98599587665790746e4db737789f1669e624e5e15c08e05bdb797badf06c3f19a1ffa93de108b2a7c3af4aaf4c6f536000005c2440fe4f6b9c6d7aa4f324def6b43a1959df1fb801e70820bf8a461c9777dc6a3ac9733c75401ae3be93a3283b563ad6903330ecc787ce4c97c098f09bcc3bf4b37bb8265d10e6926542e56d5085fabc0a6b8199472db83d8ef9a170fb7412c9fb277bb44889d90c6dbf8a82c5f833179e57cd1a4385130c4a8355e67f895b8",
        }
        const encodedBasicOrderData = ethers.utils.defaultAbiCoder.encode([basicOrderType], [basicOrderOpensea])

        const first = eesee.interface.encodeFunctionData('receiveTokens', [[currentLotID], swap.address]);
        const second = eesee.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        signer.address]);

        await expect(eesee.multicall([first, second]))
        .to.emit(eesee, "ReceiveTokens").withArgs(currentLotID, signer.address, swap.address, totalAmount)
        .to.emit(eesee, "CollectFee").withArgs(feeCollector.address, feeAmount)
        .and.to.emit(swap, "ReceiveAsset").withArgs(anyValue, basicOrderOpensea.considerationToken, '100000000000000000' , signer.address)
    })

    it('Changes constants', async () => {
        let newValue = 1
        const minDuration = await eesee.minDuration() 
        await expect(eesee.connect(acc2).changeMinDuration(newValue)).to.be.revertedWithCustomError(eesee, "CallerNotAuthorized")
        let maxDuration = await eesee.maxDuration()
        await expect(eesee.connect(signer).changeMinDuration(maxDuration)).to.be.revertedWithCustomError(eesee, "InvalidDuration")
        await expect(eesee.connect(signer).changeMinDuration(maxDuration.add(100))).to.be.revertedWithCustomError(eesee, "InvalidDuration")
        await expect(eesee.connect(signer).changeMinDuration(newValue))
        .to.emit(eesee, "ChangeMinDuration")
        .withArgs(minDuration, newValue)
        assert.equal(newValue, await eesee.minDuration(), "minDuration has changed")

        await expect(eesee.connect(signer).changeMaxDuration(newValue)).to.be.revertedWithCustomError(eesee, "InvalidDuration")
        newValue += 1
        maxDuration = await eesee.maxDuration() 
        await expect(eesee.connect(acc2).changeMaxDuration(newValue)).to.be.revertedWithCustomError(eesee, "CallerNotAuthorized")
        await expect(eesee.connect(signer).changeMaxDuration(newValue))
        .to.emit(eesee, "ChangeMaxDuration")
        .withArgs(maxDuration, newValue)
        assert.equal(newValue, await eesee.maxDuration(), "maxDuration has changed")

        const fee = await eesee.fee() 
        await expect(eesee.connect(acc2).changeFee(newValue)).to.be.revertedWithCustomError(eesee, "CallerNotAuthorized")
        await expect(eesee.connect(signer).changeFee('10001')).to.be.revertedWithCustomError(eesee, "FeeTooHigh")
        await expect(eesee.connect(signer).changeFee(newValue))
        .to.emit(eesee, "ChangeFee")
        .withArgs(fee, newValue)
        assert.equal(newValue, await eesee.fee(), "fee has changed")
    })
});
