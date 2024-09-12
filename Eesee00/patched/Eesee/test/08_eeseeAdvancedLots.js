const {
    time
} = require("@nomicfoundation/hardhat-network-helpers");
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const assert = require("assert");
const { getContractAddress } = require('@ethersproject/address')
const createPermit = require('./utils/createPermit')
const { keccak256 } = require('@ethersproject/keccak256')

describe("eesee", function () {
    let ERC20;
    let mockVRF;
    let eesee;
    let NFT;
    let signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector;
    let ticketBuyers;
    let staking
    let accessManager
    let ESE
    let snapshotId
    let expiredLots
    let mock1InchExecutorETH
    let mock1InchRouter
    let raribleRouter
    let openseaRouter
    let eesee1inch
    let eeseeRandom
    //after one year
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const oneAddress = "0x0000000000000000000000000000000000000001"
    const mainnetAddresses = JSON.parse(fs.readFileSync(path.resolve(__dirname, './constants/mainnetAddresses.json'), "utf-8"))
    const ERC721ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, './constants/ERC721ABI.json'), "utf-8"))
    const WETHABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, './constants/WETH.json'), "utf-8"))
    const defaultSwapData = '0x12aa3caf00000000000000000000000092f3f71cef740ed5784874b8c70ff87ecdf33588000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000092f3f71cef740ed5784874b8c70ff87ecdf3358800000000000000000000000077ad263cd578045105fbfc88a477cad808d39cf600000000000000000000000000000000000000000000000000000000700e86000000000000000000000000000000000000000000000000000701f5096f7d92c6000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001170000000000000000000000000000000000000000000000f90000e30000a700a0bd46a3430279c58f70905f734641735bc61e45c19dd9ad60bc0000000000000000000004e708775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec700000000000000000000000079c58f70905f734641735bc61e45c19dd9ad60bc000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc24101c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200042e1a7d4d0000000000000000000000000000000000000000000000000000000000000000c0611111111254eeb25477b68fb85ed929f73a960582000000000000000000cfee7c08'
    
    // DirectPurchase mainnet test transaction:
    // https://etherscan.io/tx/0x0039c083d7f136e7c84265266361bdfb15a7f7c99604717831c6cca3840e32fc
    const purchase = {
        sellOrderMaker: "0x66d6b5521255D3F9594924b8b4631c2AB70ECc5D",
        sellOrderNftAmount: "1",
        nftAssetClass: "0x73ad2146",
        nftData: "0x00000000000000000000000021416efc90c7265e7550c7ae4bd63b15623908b600000000000000000000000000000000000000000000000000000000000004cf",
        sellOrderPaymentAmount: "690000000000000000",
        paymentToken: "0x0000000000000000000000000000000000000000",
        sellOrderSalt: "62204852869737159984805014194591588556339692766222961037393979723365492078016",
        sellOrderStart: "0",
        sellOrderEnd: "1695974100",
        sellOrderDataType: "0x23d235ef",
        sellOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a0000000000000000000000000000000000000000000000000000000000000064",
        sellOrderSignature: "0xdbdd069ebe9d542ded96d644db8b3786ad36441b4bfe1f0455fcb35a8a1453f138b2b6a2b86a415fd29598b0abadba3c3567153d27e57719a6dec2a88648883e1c",
        buyOrderPaymentAmount: "690000000000000000",
        buyOrderNftAmount: "1",
        buyOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a0000000000000000000000000000000000000000000000000000000000000064"
    }
    // https://etherscan.io/tx/0x877b99c6dd8dbc653f5c06dc8ff2e9b9e3b26d7f09526f045697b7c69f07d11e
    const WETHPurchase = {
        sellOrderMaker: "0x9aDad199bEFf37F8094C8444FdbE6b4c75E77751",
        sellOrderNftAmount: "1",
        nftAssetClass: "0x73ad2146",
        nftData: "0x00000000000000000000000044102bd86bccb4efe8e90b4a4d5c4e43a895d22e000000000000000000000000000000000000000000000000000000000000264c",
        sellOrderPaymentAmount: "20000000000000000",
        paymentToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        sellOrderSalt: "37515395519764601467374128955629018458249857552951936894341525858272304032864",
        sellOrderStart: "0",
        sellOrderEnd: "0",
        sellOrderDataType: "0x23d235ef",
        sellOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a0000000000000000000000000000000000000000000000000000000000000064",
        sellOrderSignature: "0x61c68cf2489cf73e2bffb5169fa4da3fca7897807f46773b8aa1c61227513b2a5ce68bf10914d98eaacce4260fef7399967e257f204551054806a17e45323c761c",
        buyOrderPaymentAmount: "20000000000000000",
        buyOrderNftAmount: "1",
        buyOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a0000000000000000000000000000000000000000000000000000000000000064"
    }
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

    let _NFTlazyMint
    let mockRouter
    let mockRecipient
    let mockETHSender

    const purchaseStructType = 'tuple(address sellOrderMaker, uint256 sellOrderNftAmount, bytes4 nftAssetClass, bytes nftData, uint256 sellOrderPaymentAmount, address paymentToken, uint256 sellOrderSalt, uint sellOrderStart, uint sellOrderEnd, bytes4 sellOrderDataType, bytes sellOrderData, bytes sellOrderSignature, uint256 buyOrderPaymentAmount, uint256 buyOrderNftAmount, bytes buyOrderData)'
    const basicOrderType = 'tuple(address considerationToken, uint256 considerationIdentifier, uint256 considerationAmount, address offerer, address zone, address offerToken, uint256 offerIdentifier, uint256 offerAmount, uint8 basicOrderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 offererConduitKey, bytes32 fulfillerConduitKey, uint256 totalOriginalAdditionalRecipients, tuple(uint256 amount, address payable recipient)[] additionalRecipients, bytes signature)'
    const initContracts = async () => {
        const _AssetTransfer = await hre.ethers.getContractFactory("AssetTransfer");
        const assetTransfer = await _AssetTransfer.deploy()
        await assetTransfer.deployed()
        
        const _ESE = await hre.ethers.getContractFactory("ESE");
        const _MockERC20 = await hre.ethers.getContractFactory("MockERC20");
        const _mockVRF = await hre.ethers.getContractFactory("MockVRFCoordinator");
        const _eesee = await hre.ethers.getContractFactory("Eesee", {libraries: { AssetTransfer: assetTransfer.address }});
        const _NFT = await hre.ethers.getContractFactory("EeseeNFT");
        const _NFTDrop = await hre.ethers.getContractFactory("EeseeNFTDrop");
        _NFTlazyMint = await hre.ethers.getContractFactory("EeseeNFTLazyMint");
        const _minter = await hre.ethers.getContractFactory("EeseeMinter");
        const _royaltyEngine = await hre.ethers.getContractFactory("MockRoyaltyEngine");
        const _eeseeRandom = await hre.ethers.getContractFactory("EeseeRandom");
        const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");
        const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");
        const _mock1InchExecutorETH = await hre.ethers.getContractFactory("Mock1InchExecutorETH");
        const _mock1InchExecutor = await hre.ethers.getContractFactory("Mock1InchExecutor");
        const _mock1InchRouter = await hre.ethers.getContractFactory("Mock1InchRouter");
        const _raribleRouter = await hre.ethers.getContractFactory("EeseeRaribleRouter")
        const _openseaRouter = await hre.ethers.getContractFactory("EeseeOpenseaRouter")
        const _eeseeSwap = await hre.ethers.getContractFactory("EeseeSwap");
        const _eeseeProxy = await hre.ethers.getContractFactory("EeseeProxy");
        const _eesee1inch = await hre.ethers.getContractFactory("EeseePeriphery")
        const _mockRouter = await hre.ethers.getContractFactory("MockRouter")
        const _mockRecipient = await hre.ethers.getContractFactory("MockRecipient")
        const _mockETHSender = await hre.ethers.getContractFactory("MockETHSender")


        mockRecipient = await _mockRecipient.deploy()
        await mockRecipient.deployed()

        mockETHSender = await _mockETHSender.deploy()
        await mockETHSender.deployed()
        await signer.sendTransaction({
            to: mockETHSender.address,
            value: '300'
        });


        ESE = await _ESE.deploy([{
            cliff: 0,
            duration: 0,
            TGEMintShare: 10000
        }
        ])
        await ESE.deployed()
        await ESE.addVestingBeneficiaries(0, [{addr: signer.address, amount: '2000000000000000000000000'}])
        await ESE.initialize(0)

        accessManager = await _eeseeAccessManager.deploy();
        await accessManager.deployed()

        raribleRouter = await _raribleRouter.deploy(mainnetAddresses.ExchangeV2Core, accessManager.address)
        await raribleRouter.deployed()
        openseaRouter = await _openseaRouter.deploy(mainnetAddresses.Seaport, accessManager.address)
        await openseaRouter.deployed()
        mockRouter = await _mockRouter.deploy()
        await mockRouter.deployed()

        ERC20 = await _MockERC20.deploy('20000000000000000000000000000')
        await ERC20.deployed()

        mockVRF = await _mockVRF.deploy()
        await mockVRF.deployed()

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
        // PAUSER_ROLE
        await accessManager.grantRole('0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a', acc8.address)

        const NFTDrop = await _NFTDrop.deploy()
        const NFTLazyMint = await _NFTlazyMint.deploy()

        minter = await _minter.deploy(NFTLazyMint.address, NFTDrop.address, eeseeRandom.address, zeroAddress)
        await minter.deployed()
        
        royaltyEninge = await _royaltyEngine.deploy();
        await royaltyEninge.deployed()

        mock1InchExecutorETH = await _mock1InchExecutorETH.deploy();
        await mock1InchExecutorETH.deployed()
        await signer.sendTransaction({
            to: mock1InchExecutorETH.address,
            value: ethers.utils.parseEther("200.0"), 
        });
        //await ESE.transfer(mock1InchExecutorETH.address, '1000000000000000000000000')
        await ERC20.transfer(mock1InchExecutorETH.address, '1000000000000000000000000')
        mock1InchExecutor = await _mock1InchExecutor.deploy(ESE.address);
        await mock1InchExecutor.deployed()
        await ESE.transfer(mock1InchExecutor.address, '1000000000000000000000000')
        await ERC20.transfer(mock1InchExecutor.address, '1000000000000000000000000')
        mock1InchRouter = await _mock1InchRouter.deploy();
        await mock1InchRouter.deployed()

        swap = await _eeseeSwap.deploy(ESE.address, mock1InchRouter.address, accessManager.address);
        await swap.deployed()

        proxy = await _eeseeProxy.deploy();
        await proxy.deployed()

        staking = await _eeseeStaking.deploy(
            ESE.address, 
            [{ volumeBreakpoint: 500, rewardRateFlexible: 500000, rewardRateLocked: 500000 }], 
            accessManager.address,
            zeroAddress
        )
        await staking.deployed()

        eesee = await _eesee.deploy(
            ESE.address, 
            staking.address,
            proxy.address,
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
            eesee.address,
            mock1InchRouter.address,
            accessManager.address,
            zeroAddress
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
        }, 10, signer.address)
        await NFT.approve(eesee.address, 1)
        await NFT.approve(eesee.address, 2)
        await NFT.approve(eesee.address, 3)
        await NFT.approve(eesee.address, 4)

        for (let i = 0; i < ticketBuyers.length; i++) {
            await ESE.connect(signer).transfer(ticketBuyers[i].address, '1000000000000')
            await ESE.connect(ticketBuyers[i]).approve(eesee.address, '1000000000000')
        }

        await ESE.connect(signer).transfer(acc8.address, '1000000000000')
        await ESE.connect(acc8).approve(eesee.address, '1000000000000')
        await ESE.connect(signer).transfer(eesee.address, '1000000000000')
    }
    this.beforeAll(async () => {
        [signer, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9, feeCollector, royaltyCollector] = await ethers.getSigners()
        ticketBuyers = [acc2, acc3, acc4, acc5, acc6, acc7]
        await hre.network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.ETHEREUMRPC,
                        blockNumber: 17915699
                    },
                    chainId: 1
                },
            ]
        });
        await initContracts()
    })
    const lotParams = {
        totalTickets: 100,
        ticketPrice: 20000000,
        duration: 86400
    }

    let nonce = 0
    const createLot = async (token, tokenID, amount, assetType, data, totalTickets, ticketPrice, duration ,owner, deadline, _signer) => {
        const types = {
            Lot: [
                  {
                    name: "assetHash",
                    type: "bytes32"
                  },
                {
                name: "totalTickets",
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

        const values = {assetHash: keccak256(assetEncoded), totalTickets,ticketPrice,duration,owner,nonce,deadline}
        const signature = await _signer._signTypedData(domain, types, values)

        const signatureData = abi.encode(
            ["uint256", "uint256", "bytes"], 
            [nonce, deadline, signature]
        );
        const params = {signer: _signer.address, signatureData, nonce}
        nonce += 1
        return params
    }

    it('reverts on eth transfer', async () => {
        await expect(signer.sendTransaction({
            to: eesee1inch.address,
            value: ethers.utils.parseEther("1"), 
        })).to.be.revertedWithCustomError(eesee1inch, "EthDepositRejected")

        await expect(signer.sendTransaction({
            to: swap.address,
            value: ethers.utils.parseEther("1"), 
        })).to.be.revertedWithCustomError(eesee1inch, "EthDepositRejected")

        await expect(signer.sendTransaction({
            to: raribleRouter.address,
            value: ethers.utils.parseEther("1"), 
        })).to.be.revertedWithCustomError(eesee1inch, "EthDepositRejected")

        await expect(signer.sendTransaction({
            to: openseaRouter.address,
            value: ethers.utils.parseEther("1"), 
        })).to.be.revertedWithCustomError(eesee1inch, "EthDepositRejected")

        await expect(mockETHSender.send(eesee1inch.address, 50)).to.not.be.reverted
        await expect(mockETHSender.send(openseaRouter.address, 50)).to.not.be.reverted
        await expect(mockETHSender.send(raribleRouter.address, 50)).to.not.be.reverted
        await expect(mockETHSender.send(swap.address, 50)).to.not.be.reverted
    })

    it('Creates lot and buys tickets', async () => {
        let fee = await eesee.fee()
        await expect(eesee1inch.getLotWinner(100))
        .to.be.revertedWithCustomError(eesee1inch, "LotNotExists")

        const ID = 0

        let timestamp = await time.latest();
        let _lot = await createLot(ESE.address, 0, 0, 4, '0x',0,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 0, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 0, 
                ticketPrice: 2, 
                duration: 86400, 
                owner: signer.address, 
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], 0, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidFee")

        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 0, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 0, 
                ticketPrice: 2, 
                duration: 86400, 
                owner: signer.address, 
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "TotalTicketsTooLow")

        _lot = await createLot(ESE.address, 0, 0,4, '0x',100,0,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 1, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 0, 
                duration: 86400,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidAmount")

        _lot = await createLot(ESE.address, 0, 200, 4, '0x',100,2,86399,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 200, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 2, 
                duration: 86399,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "DurationTooLow").withArgs(86400)

        _lot = await createLot(ESE.address, 0, 200, 4, '0x',100,2,2592001,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 200, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 2, 
                duration: 2592001,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "DurationTooHigh").withArgs(2592000)

        //_lot = await createLot(ESE.address, 0, 200, 4, '0x',100,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 200, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 2, 
                duration: 86400,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidSignature")

        _lot = await createLot(ESE.address, 0, 200, 4, '0x',100,2,86400,signer.address,timestamp-1, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 200, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 2, 
                duration: 86400,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "ExpiredDeadline")

        _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: lotParams.totalTickets,
                ticketPrice: lotParams.ticketPrice,
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], zeroAddress, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidRecipient")

        _lot = await createLot(ESE.address, 0, 1, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 1, assetType: 4, data:'0x'}],
            [{
                totalTickets: lotParams.totalTickets,
                ticketPrice: lotParams.ticketPrice,
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidAmount")

        _lot = await createLot(ESE.address, 1, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 1, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
                totalTickets: lotParams.totalTickets,
                ticketPrice: lotParams.ticketPrice,
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidTokenID")

        _lot = await createLot(zeroAddress, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: zeroAddress, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
                totalTickets: lotParams.totalTickets,
                ticketPrice: lotParams.ticketPrice,
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidToken")

        _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
                totalTickets: lotParams.totalTickets,
                ticketPrice: lotParams.ticketPrice,
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x', {value: 1}
        )).to.be.revertedWithCustomError(eesee, "InvalidMsgValue")

        _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x01',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x01'}],
            [{
                totalTickets: lotParams.totalTickets,
                ticketPrice: lotParams.ticketPrice,
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'
        )).to.be.revertedWithCustomError(eesee, "InvalidData")
        
        let _nonce = nonce
        _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        const tx = await eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
                totalTickets: lotParams.totalTickets,
                ticketPrice: lotParams.ticketPrice,
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x')
        const receipt = await tx.wait()
        timestamp = await time.latest();

        await expect(tx)
        .and.to.emit(eesee, "CreateLot").withArgs(ID, anyValue, _lot.signer, signer.address, lotParams.totalTickets, lotParams.ticketPrice, timestamp + 86400)
        .and.to.emit(eesee, 'BuyTickets').withArgs(ID, acc2.address, 0, 10, lotParams.ticketPrice * 10, Math.floor((10*10)/lotParams.totalTickets*0.25))
        .and.to.emit(eesee, "ConsumeNonce").withArgs(ID, signer.address, _nonce)

        assert.equal(await eesee.getBuyTicketsRecipient(ID,0),acc2.address,"transaction is coorect")

        const lot = await eesee.lots(ID);

        assert.equal(lot.asset.token, ESE.address, "ESE is correct")
        assert.equal(lot.asset.tokenID, 0, "tokenID is correct")
        assert.equal(lot.asset.assetType, 4, "assetType is correct")
        assert.equal(lot.asset.amount, lotParams.totalTickets*lotParams.ticketPrice, "amount is correct")

        assert.equal(lot.owner, signer.address, "Owner is correct")
        assert.equal(lot.totalTickets, lotParams.totalTickets, "totalTickets is correct")
        assert.equal(lot.ticketPrice, lotParams.ticketPrice, "ticketPrice is correct")
        assert.equal(lot.ticketsBought, 10, "ticketsBought is correct")
        assert.equal(lot.fee, '600', "fee is correct")
        //assert.equal(lot.creationTime, timeNow, "creationTime is correct")
        assert.equal(lot.endTimestamp.toString(), (timestamp + 86400).toString(), "endTimestamp is correct")
        assert.equal(lot.transactions, 1, "transactions are correct")
        assert.equal(lot.assetClaimed, false, "assetClaimed is correct")
        assert.equal(lot.tokensClaimed, false, "tokensClaimed is correct")

        await expect(eesee1inch.getLotWinner(ID))
        .to.be.revertedWithCustomError(eesee1inch, "LotNotFulfilled")
        assert.equal(await eesee.getLotTicketHolder(ID, 11), zeroAddress, "ticket id buyer is correct")
        assert.equal(await eesee.getLotTicketHolder(ID, 0), acc2.address, "ticket id buyer is correct")

        nonce = _nonce
        _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: lotParams.totalTickets, 
                ticketPrice: lotParams.ticketPrice, 
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "NonceUsed")


        let tempSigner = signer
        signer = signer
        nonce = 666
        _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets + 1,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: lotParams.totalTickets, 
                ticketPrice: lotParams.ticketPrice, 
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidSignature")
        signer = tempSigner
    })    
    it('Creates lot and buys tickets with permit', async () => {
        let fee = await eesee.fee()
        snapshotId = await network.provider.send('evm_snapshot')
        const ID = 1
        await ESE.connect(acc2).approve(eesee.address, 0)
        const currentTimestamp = (await ethers.provider.getBlock()).timestamp
        const deadline = currentTimestamp + 10000
        const correctPermit = await createPermit(acc2, eesee, lotParams.ticketPrice * 10, deadline, ESE)
        const params_ = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            [lotParams.ticketPrice * 10, deadline, correctPermit.v, correctPermit.r, correctPermit.s]
          );


        let _lot = await createLot(ESE.address, 0, 0, 4, '0x',0,2,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 0, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 0, 
                ticketPrice: 2, 
                duration: 86400,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, params_))
            .to.be.revertedWithCustomError(eesee, "TotalTicketsTooLow")
            
        _lot = await createLot(ESE.address, 0, 0, 4, '0x',100,0,86400,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 1, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 0, 
                duration: 86400,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }],fee,  [10], acc2.address, params_))
            .to.be.revertedWithCustomError(eesee, "InvalidAmount")

        _lot = await createLot(ESE.address, 0, 200, 4, '0x',100,2,86399,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 200, assetType: 4, data:'0x'}],
            [{ 
               totalTickets: 100, 
               ticketPrice: 2, 
               duration: 86399,
               owner: signer.address,
               signer: _lot.signer,
               signatureData: _lot.signatureData
            }], fee, [10], acc2.address, params_))
            .to.be.revertedWithCustomError(eesee, "DurationTooLow").withArgs(86400)

        _lot = await createLot(ESE.address, 0, 200, 4, '0x',100,2,2592001,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 200, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 2, 
                duration: 2592001,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, params_))
            .to.be.revertedWithCustomError(eesee, "DurationTooHigh").withArgs(2592000)

        _lot = await createLot(ESE.address, 0, 200, 4, '0x',100,2,259001,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: 200, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 2, 
                duration: 259001,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], zeroAddress, params_))
            .to.be.revertedWithCustomError(eesee, "InvalidRecipient")

        const incorrectPermit = await createPermit(acc2, eesee, '10', deadline, ESE)
        const params_incorrect = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            [20, deadline, incorrectPermit.v, incorrectPermit.r, incorrectPermit.s]
          );
          let _nonce = nonce
        _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
                totalTickets: lotParams.totalTickets, 
                ticketPrice: lotParams.ticketPrice, 
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [20], acc2.address, params_incorrect))
        .to.be.revertedWith("ERC20Permit: invalid signature")

        const params_incorrect2 = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            [10, deadline, incorrectPermit.v, incorrectPermit.r, incorrectPermit.s]
          );

        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
                totalTickets: lotParams.totalTickets, 
                ticketPrice: lotParams.ticketPrice, 
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [20], acc2.address, params_incorrect2))
        .to.be.revertedWith("ERC20: insufficient allowance")

        const tx = await eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
                totalTickets: lotParams.totalTickets, 
                ticketPrice: lotParams.ticketPrice, 
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [10], acc2.address, params_)
        const receipt = await tx.wait()
        let timestamp = await time.latest();

        await expect(tx)
        .and.to.emit(eesee, "CreateLot").withArgs(ID, anyValue, _lot.signer, signer.address, lotParams.totalTickets, lotParams.ticketPrice, timestamp + 86400)
        .and.to.emit(eesee, 'BuyTickets').withArgs(ID, acc2.address, 0, 10, lotParams.ticketPrice * 10, Math.floor((10*10)/lotParams.totalTickets*0.25))
        .and.to.emit(eesee, "ConsumeNonce").withArgs(ID, signer.address, _nonce)


        const lot = await eesee.lots(ID);

        assert.equal(lot.asset.token, ESE.address, "ESE is correct")
        assert.equal(lot.asset.tokenID, 0, "tokenID is correct")
        assert.equal(lot.asset.assetType, 4, "assetType is correct")
        assert.equal(lot.asset.amount, lotParams.totalTickets*lotParams.ticketPrice, "amount is correct")

        assert.equal(lot.owner, signer.address, "Owner is correct")
        assert.equal(lot.totalTickets, lotParams.totalTickets, "totalTickets is correct")
        assert.equal(lot.ticketPrice, lotParams.ticketPrice, "ticketPrice is correct")
        assert.equal(lot.ticketsBought, 10, "ticketsBought is correct")
        assert.equal(lot.fee, '600', "fee is correct")
        //assert.equal(lot.creationTime, timeNow, "creationTime is correct")
        assert.equal(lot.endTimestamp.toString(), (timestamp + 86400).toString(), "endTimestamp is correct")
        assert.equal(lot.transactions, 1, "transactions are correct")
        assert.equal(lot.assetClaimed, false, "assetClaimed is correct")
        assert.equal(lot.tokensClaimed, false, "tokensClaimed is correct")

        await expect(eesee1inch.getLotWinner(ID))
        .to.be.revertedWithCustomError(eesee1inch, "LotNotFulfilled")
        assert.equal(await eesee.getLotTicketHolder(ID, 11), zeroAddress, "ticket id buyer is correct")
        assert.equal(await eesee.getLotTicketHolder(ID, 0), acc2.address, "ticket id buyer is correct")

        await network.provider.send("evm_revert", [snapshotId])
    })

    it('Creates lot and buys tickets with swap', async () => {
        let fee = await eesee.fee()
        snapshotId = await network.provider.send('evm_snapshot')
    
        await ERC20.approve(eesee1inch.address, 232)
        const params = {totalTickets: 10, ticketPrice: 50, duration: 86400, owner: signer.address}
        let iface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)',
            'function swep(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ]);

        const currentTimestamp = (await ethers.provider.getBlock()).timestamp
        const deadline = currentTimestamp + 10000

        let invalidSwapData = iface.encodeFunctionData('swep', [
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,//
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
        let _lot = await createLot(ESE.address, 0, params.totalTickets * params.ticketPrice, 4, '0x',params.totalTickets,params.ticketPrice,params.duration,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
                ...params,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [2], invalidSwapData, signer.address))
        .to.be.revertedWithCustomError(eesee1inch, "InvalidSwapDescription")

        invalidSwapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: ERC20.address,//
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address, 
                amount: 0, 
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        _lot = await createLot(ESE.address, 0, params.totalTickets * params.ticketPrice, 4, '0x',params.totalTickets,params.ticketPrice,params.duration,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
                ...params,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [2], invalidSwapData, signer.address))
        .to.be.revertedWithCustomError(eesee1inch, "InvalidSwapDescription")

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
        _lot = await createLot(ESE.address, 0, params.totalTickets * params.ticketPrice, 4, '0x',params.totalTickets,params.ticketPrice,params.duration,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
                ...params,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [2], swapData, signer.address))
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

        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address))
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

        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData 
        }], fee, [2], swapData, signer.address))
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

        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address))
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
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }],fee, [2], swapData, signer.address, {value: 1}))//
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
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address))//
        .to.be.revertedWithCustomError(eesee1inch, "PartialFillNotAllowed")

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
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [3], swapData, signer.address))//
        .to.be.revertedWith("ERC20: transfer amount exceeds balance")

        const balanceBefore = await ESE.balanceOf(signer.address)
        const balanceBefore_ = await ERC20.balanceOf(signer.address)

        _lot = await createLot(ESE.address, 0, 0, 4, '0x',0,2,86400,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: 0, assetType: 4, data:'0x'}],
            [{ 
            totalTickets: 0, 
            ticketPrice: 2, 
            duration: 86400,
            owner: signer.address,
            signer: _lot.signer,
            signatureData: _lot.signatureData 
         }], fee, [2], swapData, signer.address))
            .to.be.revertedWithCustomError(eesee, "TotalTicketsTooLow")

        _lot = await createLot(ESE.address, 0, 2, 4, '0x',100,0,86400,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: 2, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 0, 
                duration: 86400,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [2], swapData, signer.address))
            .to.be.revertedWithCustomError(eesee, "InvalidAmount")

        _lot = await createLot(ESE.address, 0, 200, 4, '0x',100,2,86399,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: 200, assetType: 4, data:'0x'}],
            [{ 
            totalTickets: 100, 
            ticketPrice: 2, 
            duration: 86399,
            owner: signer.address,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address))
            .to.be.revertedWithCustomError(eesee, "DurationTooLow").withArgs(86400)

        _lot = await createLot(ESE.address, 0, 200, 4, '0x',100,2,2592001,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: 200, assetType: 4, data:'0x'}],
            [{ 
            totalTickets: 100, 
            ticketPrice: 2, 
            duration: 2592001,
            owner: signer.address,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address))
            .to.be.revertedWithCustomError(eesee, "DurationTooHigh").withArgs(2592000)

        _lot = await createLot(ESE.address, 0, 200, 3, '0x',100,2,2592001,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: 200, assetType: 3, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 2, 
                duration: 2592001,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [2], swapData, signer.address))
                .to.be.revertedWithCustomError(eesee1inch, "InvalidAsset")
        
        let _nonce = nonce 
       
        _lot = await createLot(ESE.address, 0, params.totalTickets * params.ticketPrice, 4, '0x',params.totalTickets,params.ticketPrice,params.duration,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(signer).pause()).to.be.revertedWithCustomError(eesee1inch, "CallerNotAuthorized")
        await expect(eesee1inch.connect(acc8).pause()).to.emit(eesee1inch, "Paused").withArgs(acc8.address)
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address))
            .to.be.revertedWith("Pausable: paused")
        await expect(eesee1inch.connect(signer).unpause()).to.be.revertedWithCustomError(eesee1inch, "CallerNotAuthorized")
        await expect(eesee1inch.connect(acc8).unpause()).to.emit(eesee1inch, "Unpaused").withArgs(acc8.address)


        let tx = await eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address)

        const receipt = await tx.wait()
        let timestamp = await time.latest()
        const ID = '1'
        await expect(tx)
        .to.emit(eesee, "CreateLot").withArgs(ID, anyValue, _lot.signer, signer.address, params.totalTickets, params.ticketPrice, timestamp + 86400)
        .and.to.emit(eesee, "BuyTickets").withArgs(ID, signer.address, 0, 2, (params.ticketPrice * 2),  Math.floor((2*2)/params.totalTickets*0.25))

        const lot = await eesee.lots(ID);

        assert.equal(lot.totalTickets, params.totalTickets, "totalTickets is correct")
        assert.equal(lot.ticketPrice, params.ticketPrice, "ticketPrice is correct")
        assert.equal(lot.ticketsBought, 2, "ticketsBought is correct")
        assert.equal(lot.fee, '600', "fee is correct")
        assert.equal(lot.endTimestamp, (timestamp + 86400).toString(), "endTimestamp is correct")


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
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        _lot = await createLot(ESE.address, 0, params.totalTickets * params.ticketPrice, 4, '0x',params.totalTickets,params.ticketPrice,params.duration,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(signer).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address, {value: 211}))//
        .to.be.revertedWithCustomError(eesee1inch, "InvalidMsgValue")

        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address, 
                amount: 64, //should buy 2 tickets + 8 ESE dust
                minReturnAmount: '10000000000000000000',
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])
        _lot = await createLot(ESE.address, 0, params.totalTickets * params.ticketPrice, 4, '0x',params.totalTickets,params.ticketPrice,params.duration,signer.address,10000000000, signer)
        await expect(eesee1inch.connect(acc9).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address, {value: 64})).to.be.revertedWithCustomError(eesee1inch, "SwapNotSuccessful")


        const __snapshotId = await network.provider.send('evm_snapshot')

        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
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

        let _balanceBefore = await ESE.balanceOf(signer.address)
        let _balanceBefore_ = await ethers.provider.getBalance(acc9.address);
        let _balanceBefore__ = await ethers.provider.getBalance(eesee1inch.address);

        _lot = await createLot(ESE.address, 0, params.totalTickets * params.ticketPrice, 4, '0x',params.totalTickets,params.ticketPrice,params.duration,signer.address,10000000000, signer)
        tx = await eesee1inch.connect(acc9).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address, {value: 64})
        let rr = await tx.wait()
        await expect(tx).to.emit(eesee, "BuyTickets").withArgs(2, signer.address, 0, 2, 100, Math.floor((2*2)/params.totalTickets*0.25))

        let _balanceAfter = await ESE.balanceOf(signer.address)
        let _balanceAfter_ = await ethers.provider.getBalance(acc9.address);
        let _balanceAfter__ = await ethers.provider.getBalance(eesee1inch.address);

        assert.equal(_balanceAfter.sub(_balanceBefore).toString(), "8", 'ESE balance is correct')
        assert.equal(_balanceAfter__.sub(_balanceBefore__).toString(), '0', 'eesee1inch balance is correct')
        assert.equal(_balanceBefore_.sub(_balanceAfter_).sub(rr.gasUsed.mul(rr.effectiveGasPrice)).toString(), "64", 'ERC20 balance is correct')
        await network.provider.send("evm_revert", [__snapshotId])


        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutor.address, 
            {
                srcToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutor.address,
                dstReceiver: eesee1inch.address, 
                amount: 60, //should buy 2 tickets
                minReturnAmount: 100,
                flags: 1,
            }, 
            '0x00',
            '0x000000000000000000000000' + ERC20.address.substring(2)
        ])

        _balanceBefore = await ESE.balanceOf(signer.address)
        _balanceBefore_ = await ethers.provider.getBalance(acc9.address);
        _balanceBefore__ = await ethers.provider.getBalance(eesee1inch.address);

        _lot = await createLot(ESE.address, 0, params.totalTickets * params.ticketPrice, 4, '0x',params.totalTickets,params.ticketPrice,params.duration,signer.address,10000000000, signer)
        tx = await eesee1inch.connect(acc9).createLotsAndBuyTicketsWithSwap(
            [{token: ESE.address, tokenID: 0, amount: params.totalTickets * params.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...params,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [2], swapData, signer.address, {value: 60})
        rr = await tx.wait()
        await expect(tx).to.emit(eesee, "BuyTickets").withArgs(2, signer.address, 0, 2, 100, Math.floor((2*2)/params.totalTickets*0.25))

        _balanceAfter = await ESE.balanceOf(signer.address)
        _balanceAfter_ = await ethers.provider.getBalance(acc9.address);
        _balanceAfter__ = await ethers.provider.getBalance(eesee1inch.address);

        assert.equal(_balanceAfter.sub(_balanceBefore).toString(), "0", 'ESE balance is correct')
        assert.equal(_balanceAfter__.sub(_balanceBefore__).toString(), '0', 'eesee1inch balance is correct')
        assert.equal(_balanceBefore_.sub(_balanceAfter_).sub(rr.gasUsed.mul(rr.effectiveGasPrice)).toString(), "60", 'ERC20 balance is correct')
        
        await network.provider.send("evm_revert", [snapshotId])
    })
    it('Buys tickets with permit', async () => {
        snapshotId = await network.provider.send('evm_snapshot')
        const ID = 0
        await ESE.connect(acc2).approve(eesee.address, 0)
        const currentTimestamp = (await ethers.provider.getBlock()).timestamp
        const deadline = currentTimestamp + 10000
        const correctPermit = await createPermit(acc2, eesee, lotParams.ticketPrice * 10, deadline, ESE)
        const correct = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            [lotParams.ticketPrice * 10, deadline, correctPermit.v, correctPermit.r, correctPermit.s]
          );
        await expect(eesee.connect(acc2).buyTickets([ID], [0],acc2.address,correct)).to.be.revertedWithCustomError(eesee, "BuyAmountTooLow")
        await expect(eesee.connect(acc2).buyTickets([100], [1],acc2.address,correct)).to.be.reverted
        await expect(eesee.connect(acc2).buyTickets([ID], [101],acc2.address,correct)).to.be.revertedWithCustomError(eesee, "BuyLimitExceeded")

        const balanceBefore = await ESE.balanceOf(acc2.address)
        const incorrectPermit = await createPermit(acc2, eesee, '10', deadline, ESE)
        const incorrect = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            [lotParams.ticketPrice * 10, deadline, incorrectPermit.v, incorrectPermit.r, incorrectPermit.s]
          );

        await expect(eesee.connect(acc2).buyTickets([ID], [20],acc2.address,incorrect))
        .to.be.revertedWith("ERC20Permit: invalid signature")

        const incorrect2 = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            [10, deadline, incorrectPermit.v, incorrectPermit.r, incorrectPermit.s]
          );
        await expect(eesee.connect(acc2).buyTickets([ID], [20],acc2.address,incorrect2))
        .to.be.revertedWith("ERC20: insufficient allowance")
        let volumeBefore = (await staking.volume(acc2.address))
        
        await expect(eesee.connect(acc2).buyTickets([ID], [10],acc2.address,correct))
            .to.emit(eesee, "BuyTickets").withArgs(ID, acc2.address, 10, 10, lotParams.ticketPrice * 10, Math.floor((10*10)/lotParams.totalTickets*0.25))
        for (let i = 0; i < 20; i++) {
            const buyer = await eesee.getLotTicketHolder(ID, i)
            assert.equal(buyer, acc2.address, "Ticket buyer is correct")
        }

        const tickets = await eesee.getLotTicketsHeldByAddress(ID, acc2.address)
        assert.equal(tickets, 20, "Tickets bought by address is correct")

        const balanceAfter = await ESE.balanceOf(acc2.address)
        if(network.name != 'testnet') {
            // Hardhat node has trouble with try catch statements, so we exclude this check for 'testnet'
            // I tested in on the live goerli chain and it was OK.s
            assert.equal((await staking.volume(acc2.address)).sub(volumeBefore), lotParams.ticketPrice * 10, "Volume is correct")
        }

        assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), lotParams.ticketPrice * 10, "Price paid is correct")

        const correctPermit2 = await createPermit(acc2, eesee, 40, deadline, ESE)
        const correct2 = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
            [40, deadline, correctPermit2.v, correctPermit2.r, correctPermit2.s]
          );
        await expect(eesee.connect(acc2).buyTickets([ID], [81], acc2.address,correct2)).to.be.revertedWithCustomError(eesee, "BuyLimitExceeded")

        const lot = await eesee.lots(ID);
        assert.equal(lot.ticketsBought, 20, "ticketsBought is correct")
        assert.equal(lot.ticketsBought, 20, "ticketsBought is correct")
        await network.provider.send("evm_revert", [snapshotId])
    })
    it('Buys tickets', async () => {
        const ID = 0
        await expect(eesee.connect(acc2).buyTickets([ID], [0], acc2.address, '0x')).to.be.revertedWithCustomError(eesee, "BuyAmountTooLow")
        await expect(eesee.connect(acc2).buyTickets([100], [1], acc2.address, '0x')).to.be.reverted
        await expect(eesee.connect(acc2).buyTickets([ID], [101], acc2.address, '0x')).to.be.revertedWithCustomError(eesee, "BuyLimitExceeded")
        await expect(eesee.connect(acc2).buyTickets([ID], [31], zeroAddress, '0x')).to.be.revertedWithCustomError(eesee, "InvalidRecipient")

        const balanceBefore = await ESE.balanceOf(acc2.address)
        await expect(eesee.connect(acc2).buyTickets([ID], [10], acc2.address, '0x'))
            .to.emit(eesee, "BuyTickets").withArgs(ID, acc2.address, 10, 10, lotParams.ticketPrice * 10, Math.floor((10*10)/lotParams.totalTickets*0.25))
        for (let i = 10; i < 20; i++) {
            const buyer = await eesee.getLotTicketHolder(ID, i)
            assert.equal(buyer, acc2.address, "Ticket buyer is correct")
        }
        assert.equal(await eesee.getBuyTicketsRecipient(ID,1),acc2.address,"transaction is coorect")

        const tickets = await eesee.getLotTicketsHeldByAddress(ID, acc2.address)
        assert.equal(tickets, 20, "Tickets bought by address is correct")

        const balanceAfter = await ESE.balanceOf(acc2.address)
        if(network.name != 'testnet') {
            assert.equal(await staking.volume(acc2.address), 20 * lotParams.ticketPrice, "Volume is correct")
        }
        assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), 10 * lotParams.ticketPrice, "Price paid is correct")

        await expect(eesee.connect(acc2).buyTickets([ID], [81], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "BuyLimitExceeded")

        const lot = await eesee.lots(ID);
        assert.equal(lot.ticketsBought, 20, "ticketsBought is correct")

    })

    it('Buys all tickets', async () => {
        const ID = 0
        for (let i = 1; i <= 4; i++) {
            const balanceBefore = await ESE.balanceOf(ticketBuyers[i].address)
            const recipt = expect(eesee.connect(ticketBuyers[i]).buyTickets([ID], [20], ticketBuyers[i].address, '0x'))
            await recipt.to.emit(eesee, "BuyTickets").withArgs(ID, ticketBuyers[i].address, i*(20) + (i-1)*Math.floor((20*20)/lotParams.totalTickets*0.25), 20, lotParams.ticketPrice * 20, Math.floor((20*20)/lotParams.totalTickets*0.25))
            
            assert.equal(await eesee.getBuyTicketsRecipient(ID,i+1),ticketBuyers[i].address,"transaction is coorect")
            
            const timestamp = await time.latest()
            for (let j =  i*(20) + (i-1)*Math.floor((20*20)/lotParams.totalTickets*0.25); j <  (i+1)*(20) + (i)*Math.floor((20*20)/lotParams.totalTickets*0.25); j++) {
                const buyer = await eesee.getLotTicketHolder(ID, j)
                assert.equal(buyer, ticketBuyers[i].address, "Ticket buyer is correct")
            }

            const tickets = await eesee.getLotTicketsHeldByAddress(ID, ticketBuyers[i].address)
            const bonusTickets = await eesee.getLotBonusTicketsHeldByAddress(ID, ticketBuyers[i].address)
            assert.equal(tickets, 20, "Tickets bought by address is correct")
            assert.equal(bonusTickets, Math.floor((20*20)/lotParams.totalTickets*0.25), "Tickets bought by address is correct")

            const balanceAfter = await ESE.balanceOf(ticketBuyers[i].address)
            if(network.name != 'testnet') {
                assert.equal(await staking.volume(ticketBuyers[i].address), 20 * lotParams.ticketPrice, "Volume is correct")
            }
            assert.equal(BigInt(balanceBefore) - BigInt(balanceAfter), 20 * lotParams.ticketPrice, "Price paid is correct")
            if(i == 4){
                await expect(eesee.connect(ticketBuyers[i]).buyTickets([ID], [11], ticketBuyers[i].address, '0x')).to.be.revertedWithCustomError(eesee, "BuyLimitExceeded")
            }

            const lot = await eesee.lots(ID);
            assert.equal(lot.ticketsBought, (i + 1) * 20, "ticketsBought is correct")
            assert.equal(lot.bonusTickets, (i)*(Math.floor((20*20)/lotParams.totalTickets*0.25)), "bonusTickets is correct")

            await expect(eesee.connect(ticketBuyers[i]).reclaimTokens([ID], ticketBuyers[i].address))
                .to.be.revertedWithCustomError(eesee, "LotNotExpired").withArgs(ID)

            if (i == 4) {
                //MockVRF's first requestID is 0
                assert.equal(lot.endTimestamp.toString(), timestamp.toString(), "endTimestamp is correct")
                const tx = await eeseeRandom["performUpkeep(bytes)"]("0x00")
                const recipt = expect(tx)
                await recipt.to.emit(eeseeRandom, "RequestWords").withArgs(0)
                console.log('GAS FOR PERFORM UPKEEP 1:', (await tx.wait()).gasUsed.toString())
                await expect(eeseeRandom["performUpkeep(bytes)"]("0x00")).to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
            }

            await expect(eesee1inch.getLotWinner(ID))
            .to.be.revertedWithCustomError(eesee1inch, "LotNotFulfilled")
        }
    })
    it('if no winner chosen, can reclaim items after returnInterval', async () => {
        const ID = 0
        snapshotId = await network.provider.send('evm_snapshot')

        await expect(eesee.connect(ticketBuyers[0]).reclaimTokens([ID], ticketBuyers[0].address))
            .to.be.revertedWithCustomError(eesee, "LotNotExpired").withArgs(ID)

        await expect(eesee.connect(signer).receiveTokens([ID], acc2.address))
            .to.be.revertedWithCustomError(eesee, "LotNotFulfilled").withArgs(ID)
        await time.increase(86401)
        await expect(eesee.connect(signer).receiveTokens([ID], acc2.address))
            .to.be.revertedWithCustomError(eesee, "LotNotFulfilled").withArgs(ID)

        const snapshotId2 = await network.provider.send('evm_snapshot')
        await expect(eesee.connect(ticketBuyers[0]).reclaimTokens([ID], ticketBuyers[0].address))
            .to.emit(eesee, "ReclaimTokens").withArgs(ID, ticketBuyers[0].address, ticketBuyers[0].address, lotParams.ticketPrice * 20)
        await network.provider.send("evm_revert", [snapshotId2])
    })
    it('select winner after returnInterval expiry', async () => {
        const ID = 0
        const tx = await mockVRF.fulfillWords(0, { gasLimit: '30000000' })
        const recipt = expect(tx)
        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)
        await expect(eesee.connect(signer).reclaimAssets([ID], signer.address))
        .to.be.revertedWithCustomError(eesee, "InvalidAsset")
        
        await expect(eesee.connect(ticketBuyers[0]).reclaimTokens([ID], ticketBuyers[0].address))
            .to.emit(eesee, "ReclaimTokens").withArgs(ID, ticketBuyers[0].address, ticketBuyers[0].address, lotParams.ticketPrice * 20)

        await expect(eesee.connect(signer).receiveTokens([ID], acc2.address))
            .to.be.revertedWithCustomError(eesee, "LotExpired").withArgs(ID)
        await network.provider.send("evm_revert", [snapshotId])
    })
    it('Selects winner', async () => {
        const ID = 0
        const tx = await mockVRF.fulfillWords(0, { gasLimit: '30000000' })

        const recipt = expect(tx)
        assert.notEqual((await eesee1inch.getLotWinner(ID)).winner, zeroAddress, "winner is chosen")
        assert.equal((await eesee1inch.getLotWinner(ID)).isAssetWinner, false)

        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)
        console.log('GAS FOR CHAINLINK VRF 1:', (await tx.wait()).gasUsed.toString())
        await expect(eeseeRandom["performUpkeep(bytes)"]("0x00")).to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")

        await expect(eesee.connect(acc2).receiveAssets([0], acc2.address))
        .to.be.revertedWithCustomError(eesee, "InvalidAsset")
    })
    let swapData
    it('Receives reward from Opensea', async () => {
        const lotID = 0
        const lotData = await eesee.lots(lotID)
        const winningsAmount = lotData.ticketPrice.mul(lotData.totalTickets)
        const denominator = ethers.BigNumber.from('10000')
        const lot = await eesee.lots(lotID)
        const feeAmount = winningsAmount.mul(lot.fee).div(denominator)
        const totalAmount = winningsAmount.sub(feeAmount)

        //await openseaRouter.purchaseAsset("", zeroAddress).to.be.revertedWithCustomError(openseaRouter, "InvalidRecipient")
        //await raribleRouter.purchaseAsset("", zeroAddress).to.be.revertedWithCustomError(raribleRouter, "InvalidRecipient")
        // Generate correct swapdata
        let iface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)',
            'function swep(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ]);
        swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])

        snapshotId = await network.provider.send('evm_snapshot')

        let encodedBasicOrderData = ethers.utils.defaultAbiCoder.encode([basicOrderType], [basicOrderOpensea])
        let nftPrice = ethers.BigNumber.from(basicOrderOpensea.considerationAmount)
        basicOrderOpensea.additionalRecipients.forEach((recipient) => {
            nftPrice = nftPrice.add(recipient.amount)
        })

        let first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        let swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
            },
            zeroAddress
        ]);
        let second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(swap, "InvalidRecipient")



        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc3).multicall([first, second]))
            .to.be.revertedWithCustomError(eesee, "CallerNotWinner")


        let invalidSwapData = iface.encodeFunctionData('swep', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: invalidSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(swap, "InvalidSwapDescription")


        invalidSwapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: zeroAddress,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: invalidSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(swap, "InvalidSwapDescription")


        invalidSwapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: ESE.address,
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: invalidSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(swap, "InvalidSwapDescription")


        invalidSwapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: zeroAddress, 
                amount: totalAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: invalidSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(swap, "InvalidSwapDescription")


        invalidSwapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalAmount,
                minReturnAmount: '9999999999999999999999999999999',
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: invalidSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(swap, "SwapNotSuccessful")

        invalidSwapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: 1,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: invalidSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(openseaRouter, "InsufficientFunds")


        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        mockRecipient.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(swap, "TransferNotSuccessful")

            
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: mockRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithoutReason()//mockRouter reverts without reason, so multicall should too
        
        const uint256 =  ethers.utils.defaultAbiCoder.encode(
            ["uint256"], 
            ['100000000000000001']//cost + 1 wei
        );
        const validSwapData = iface.encodeFunctionData('swap', [
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
            uint256
        ])
        let basicOrderOpenseaInvalid = {...basicOrderOpensea}
        basicOrderOpenseaInvalid.basicOrderType = "3"

        let _encodedBasicOrderData = ethers.utils.defaultAbiCoder.encode([basicOrderType], [basicOrderOpenseaInvalid])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: validSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: _encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(openseaRouter, "InvalidOrderType")


        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: validSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        let balanceBefore = await ESE.balanceOf(acc2.address)

        await expect(swap.connect(signer).pause()).to.be.revertedWithCustomError(swap, "CallerNotAuthorized")
        await expect(swap.connect(acc8).pause()).to.emit(swap, "Paused").withArgs(acc8.address)
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWith("Pausable: paused")
        await expect(swap.connect(signer).unpause()).to.be.revertedWithCustomError(swap, "CallerNotAuthorized")
        await expect(swap.connect(acc8).unpause()).to.emit(swap, "Unpaused").withArgs(acc8.address)

        await expect(openseaRouter.connect(signer).pause()).to.be.revertedWithCustomError(openseaRouter, "CallerNotAuthorized")
        await expect(openseaRouter.connect(acc8).pause()).to.emit(openseaRouter, "Paused").withArgs(acc8.address)
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWith("Pausable: paused")
        await expect(openseaRouter.connect(signer).unpause()).to.be.revertedWithCustomError(openseaRouter, "CallerNotAuthorized")
        await expect(openseaRouter.connect(acc8).unpause()).to.emit(openseaRouter, "Unpaused").withArgs(acc8.address)
        
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalAmount.toString())
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, zeroAddress, '100000000000000000', acc2.address)
        let balanceAfter = await ESE.balanceOf(acc2.address)
        //No dust
        assert.equal(balanceAfter.sub(balanceBefore).toString(), '0',"Balance is correct")
        await network.provider.send("evm_revert", [snapshotId])
        snapshotId = await network.provider.send('evm_snapshot')


        //Zero data swapData with null marketplaceRoutersData
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: "0x", 
            marketplaceRoutersData: []
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);

        balanceBefore = await ESE.balanceOf(acc2.address)
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalAmount.toString())
        balanceAfter = await ESE.balanceOf(acc2.address)

        assert.equal(balanceAfter.sub(balanceBefore).toString(), totalAmount.toString(),"Balance is correct")
        await network.provider.send("evm_revert", [snapshotId])
        snapshotId = await network.provider.send('evm_snapshot')


        const incompleteSwapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalAmount-50,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: incompleteSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        balanceBefore = await ESE.balanceOf(acc2.address)
        await expect(eesee.connect(acc2).multicall([first, second]))
        .to.emit(eesee, "ReceiveTokens")
        .withArgs(lotID, acc2.address, swap.address, totalAmount.toString())
        .to.emit(swap, "ReceiveAsset")
        .withArgs(anyValue, zeroAddress, '100000000000000000', acc2.address)
        balanceAfter = await ESE.balanceOf(acc2.address)
        assert.equal(balanceAfter.sub(balanceBefore).toString(), '50',"Balance is correct")
        await network.provider.send("evm_revert", [snapshotId])
        snapshotId = await network.provider.send('evm_snapshot')


        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalAmount.toString())
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, zeroAddress, '100000000000000000', acc2.address)

        await expect(eesee1inch.getLotWinner(lotID))
        .to.be.revertedWithCustomError(eesee1inch, "LotNotExists")

        // Compare ownerOf token
        const nft = await hre.ethers.getContractAt(ERC721ABI, basicOrderOpensea.offerToken)
        const onwerOfNFT = await nft.ownerOf(basicOrderOpensea.offerIdentifier)

        assert.equal(onwerOfNFT, acc2.address, "New owner of nft is correct")
        await network.provider.send("evm_revert", [snapshotId])
    })
    it('Receives reward from Rarible', async () => {
        const lotID = 0
        const lot = await eesee.lots(lotID)
        const winningsAmount = lot.ticketPrice.mul(lot.totalTickets)
        const denominator = ethers.BigNumber.from('10000')
        const feeAmount = winningsAmount.mul(lot.fee).div(denominator)
        const totalAmount = winningsAmount.sub(feeAmount)
        let iface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)',
            'function swep(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ]);


        let first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        let swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: raribleRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([purchaseStructType], [WETHPurchase])
            }]
            },
            acc2.address
        ]);
        let second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(raribleRouter, "ERC20NotSupported")

        let invalidSwapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: 1,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: invalidSwapData, 
            marketplaceRoutersData: [{
                router: raribleRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([purchaseStructType], [purchase])
            }]
            },
            acc2.address
        ]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(raribleRouter, "InsufficientFunds")
        snapshotId = await network.provider.send('evm_snapshot')


        const uint256 =  ethers.utils.defaultAbiCoder.encode(
            ["uint256"], 
            ['696900000000000001']//cost + 1 wei
        );
        const validSwapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: 1,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            uint256
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: validSwapData, 
            marketplaceRoutersData: [{
                router: raribleRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([purchaseStructType], [purchase])
            }]
            },
            acc2.address
        ]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);

        await expect(raribleRouter.connect(signer).pause()).to.be.revertedWithCustomError(raribleRouter, "CallerNotAuthorized")
        await expect(raribleRouter.connect(acc8).pause()).to.emit(raribleRouter, "Paused").withArgs(acc8.address)
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWith("Pausable: paused")
        await expect(raribleRouter.connect(signer).unpause()).to.be.revertedWithCustomError(raribleRouter, "CallerNotAuthorized")
        await expect(raribleRouter.connect(acc8).unpause()).to.emit(raribleRouter, "Unpaused").withArgs(acc8.address)


        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalAmount.toString())
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, zeroAddress, '696900000000000000', acc2.address)
        await network.provider.send("evm_revert", [snapshotId])


        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: raribleRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([purchaseStructType], [purchase])
            }]
            },
            acc2.address
        ]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalAmount.toString())
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, zeroAddress, '696900000000000000', acc2.address)
        // Decode nft address/tokenID
        const [nftAddress, tokenID] = ethers.utils.defaultAbiCoder.decode(['address', 'uint256'], purchase.nftData)
        // Compare ownerOf token
        const nft = await hre.ethers.getContractAt(ERC721ABI, nftAddress)
        const onwerOfNFT = await nft.ownerOf(tokenID)

        assert.equal(onwerOfNFT, acc2.address, "New owner of nft is correct")

    })
    const basicOrderParameters = {
        considerationToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        considerationIdentifier: "0",
        considerationAmount: "446250000000000",
        offerer: "0xB66D4A86f308429bB31E8489C69c3ecb2737e7Af",
        zone: "0x0000000000000000000000000000000000000000",
        offerToken: "0xaaC2CB9f4561d924f7f45B47726f8B3752515aE5",
        offerIdentifier: "2421",
        offerAmount: "1",
        basicOrderType: "9",
        startTime: "1693217886",
        endTime: "1693304278",
        zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        salt: "0",
        offererConduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
        fulfillerConduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
        totalOriginalAdditionalRecipients: "2",
        additionalRecipients: [
            {
                amount: "12750000000000",
                recipient: "0x0000a26b00c1F0DF003000390027140000fAa719"
            },
            {
                amount: "51000000000000",
                recipient: "0x25326851246d990912d0617f8986d2f9a3935252"
            }
        ],
        signature: "0xdbe935b078b3c824c8a328031f6e0d52b44f1f9e699d81c9908e0cb4f0034e1a6fce9eac3a9baaac34d17dc89bb85081f61e527c97a48cdb49e67a52040695ed",
    }
    let mock1InchExecutorWETH
    const txBlockNumber = 18012527 - 1
    it('Receives reward from Opensea with ERC20', async () => {
        if(network.name != 'testnet') {
        // Mainnet ERC20 tx: https://etherscan.io/tx/0xca9c63c7dee118aceed284fe22877a76aa63cbc8cef3c2b48f116ab2e9a76cb0
        const lotParams = {
            totalTickets: 100,
            ticketPrice: 20000000,
            duration: 86400
        }

        // Create network snapshot
        snapshotId = await network.provider.send('evm_snapshot')

        // Reset network to txBlockNumber
        await hre.network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.ETHEREUMRPC,
                        blockNumber: txBlockNumber
                    },
                    chainId: 1
                },
            ]
        });

        // Redeploy eesee contracts
        await initContracts()

        // Deploy WETH 1inch executor
        const _mock1InchExecutorWETH = await hre.ethers.getContractFactory("Mock1InchExecutorWETH")
        mock1InchExecutorWETH = await _mock1InchExecutorWETH.deploy(mainnetAddresses.WETH)
        await mock1InchExecutorWETH.deployed()

        // Add WETH to executor
        const WETH = await hre.ethers.getContractAt(WETHABI, mainnetAddresses.WETH)
        const WETHHolderSigner = await ethers.getImpersonatedSigner(mainnetAddresses.WETHHolder)
        await WETH.connect(WETHHolderSigner).transfer(mock1InchExecutorWETH.address, ethers.utils.parseUnits('200', 'ether'))

        const _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        // Create new lot
        let fee = await eesee.fee()
        await eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...lotParams,
            owner: signer.address,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [25], acc2.address, '0x')

        const lotID = 0

        // Buyout all tokens
        for(let i = 1; i <= 3; i ++) {
            await eesee.connect(ticketBuyers[i]).buyTickets([lotID], [25],ticketBuyers[i].address, '0x')
            if (i == 3) {
                //MockVRF's first requestID is 0
                const tx = await eeseeRandom["performUpkeep(bytes)"]("0x00")
                const recipt = expect(tx)
                await recipt.to.emit(eeseeRandom, "RequestWords").withArgs(0)
                console.log('GAS FOR PERFORM UPKEEP 1:', (await tx.wait()).gasUsed.toString())
                await expect(eeseeRandom["performUpkeep(bytes)"]("0x00")).to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
            }
        }

        // Choose winner
        const tx = await mockVRF.fulfillWords(0, { gasLimit: '30000000' })
        const recipt = expect(tx)
        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)

        // Calculate total amount of won ESE tokens 
        const lot = await eesee.lots(lotID)
        const winningsAmount = lot.ticketPrice.mul(lot.totalTickets)
        const denominator = ethers.BigNumber.from('10000')
        const feeAmount = winningsAmount.mul(lot.fee).div(denominator)
        const totalWonTokensAmount = winningsAmount.sub(feeAmount)

        // Create swapdata
        const swapInterface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ])
        const swapData = swapInterface.encodeFunctionData('swap', [
            mock1InchExecutorWETH.address, 
            {
                srcToken: ESE.address,
                dstToken: mainnetAddresses.WETH,
                srcReceiver: mock1InchExecutorWETH.address,
                dstReceiver: swap.address, 
                amount: totalWonTokensAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])

        // Encode Opensea basic order data
        const encodedBasicOrderData = ethers.utils.defaultAbiCoder.encode([basicOrderType], [basicOrderParameters])

        // Make receiveReward transaction
        const invalidBasicOrderData = ethers.utils.defaultAbiCoder.encode([basicOrderType], [{...basicOrderParameters, fulfillerConduitKey: '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0001'}])
        
        let first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        let swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: invalidBasicOrderData
            }]
            },
            acc2.address
        ]);
        let second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(openseaRouter, 'ConduitDoesntExist')

        let basicOrderOpenseaInvalid = {...basicOrderParameters}
        basicOrderOpenseaInvalid.basicOrderType = "3"
        let _encodedBasicOrderData = ethers.utils.defaultAbiCoder.encode([basicOrderType], [basicOrderOpenseaInvalid])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: _encodedBasicOrderData
            }]
        },
        acc2.address]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(openseaRouter, "InvalidOrderType")

        invalidSwapData = swapInterface.encodeFunctionData('swap', [
            mock1InchExecutorWETH.address, 
            {
                srcToken: ESE.address,
                dstToken: mainnetAddresses.WETH,
                srcReceiver: mock1InchExecutorWETH.address,
                dstReceiver: swap.address, 
                amount: 1,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: invalidSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
            },
            acc2.address
        ]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.be.revertedWithCustomError(openseaRouter, "InsufficientFunds")
        const __snapshotId = await network.provider.send('evm_snapshot')
            

        const uint256 =  ethers.utils.defaultAbiCoder.encode(
            ["uint256"], 
            ['510000000000001']//cost + 1 wei
        );
        const validSwapData = swapInterface.encodeFunctionData('swap', [
            mock1InchExecutorWETH.address, 
            {
                srcToken: ESE.address,
                dstToken: mainnetAddresses.WETH,
                srcReceiver: mock1InchExecutorWETH.address,
                dstReceiver: swap.address, 
                amount: totalWonTokensAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            uint256
        ])
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: validSwapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
            },
            acc2.address
        ]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        let balanceBefore = await ESE.balanceOf(acc2.address)
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalWonTokensAmount.toString())
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, basicOrderParameters.considerationToken, '510000000000000', acc2.address)
        let balanceAfter = await ESE.balanceOf(acc2.address)
        //No dust
        assert.equal(balanceAfter.sub(balanceBefore).toString(), '0',"Balance is correct")
        await network.provider.send("evm_revert", [__snapshotId])

        
        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: encodedBasicOrderData
            }]
            },
            acc2.address
        ]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalWonTokensAmount.toString())
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, basicOrderParameters.considerationToken, '510000000000000', acc2.address)
        
        // Check new nft owner
        const nft = await hre.ethers.getContractAt(ERC721ABI, basicOrderParameters.offerToken)
        const onwerOfNFT = await nft.ownerOf(basicOrderParameters.offerIdentifier)
        assert.equal(onwerOfNFT, acc2.address, "New owner of nft is correct")

        // Restore to snapshot
        await network.provider.send("evm_revert", [snapshotId])
    }
    })

    //dataType = 0x2fa3cfd3 //V3_SELL
    //dataType = 0x1b18cdf6 //V3_BUY
    const createRariblePurchase = async (order, _signer) => {
        const msgParams = JSON.stringify({
            domain: {
              // This defines the network, in this case, Mainnet.
              chainId: 1,
              // Give a user-friendly name to the specific contract you're signing for.
              name: 'Exchange',
              // Add a verifying contract to make sure you're establishing contracts with the proper entity.
              verifyingContract: mainnetAddresses.ExchangeV2Core,
              // This identifies the latest version.
              version: '2',
            },

            message: order,
            primaryType: 'Order',
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
              ],
              Order: [
                {
                  name: "maker",
                  type: "address"
                },
                {
                  name: "makeAsset",
                  type: "Asset"
                },
                {
                  name: "taker",
                  type: "address"
                },
                {
                  name: "takeAsset",
                  type: "Asset"
                },
                {
                  name: "salt",
                  type: "uint256"
                },
                {
                  name: "start",
                  type: "uint256"
                },
                {
                  name: "end",
                  type: "uint256"
                },
                {
                  name: "dataType",
                  type: "bytes4"
                },
                {
                  name: "data",
                  type: "bytes"
                },
              ],
              Asset: [
                {
                    name: "assetType",
                    type: "AssetType"
                },
                {
                  name: "value",
                  type: "uint256"
                }
              ],
              AssetType: [
                {
                    name: "assetClass",
                    type: "bytes4"
                },
                {
                  name: "data",
                  type: "bytes"
                }
              ]
            },
          });

        return await new Promise(async (resolve, reject) => {
            function cb(err, result) {
                if(err){
                    console.log(err)
                }else{
                    resolve(result.result)
                }
            }
            hre.network.provider.sendAsync({
                method: "eth_signTypedData_v4",
                params: [_signer.address, msgParams],
                from: _signer.address
            }, cb)
        })
    }

    it('Receives reward from Rarible with V3_SELL', async () => {
        snapshotId = await network.provider.send('evm_snapshot')
        const abi = ethers.utils.defaultAbiCoder;
        const nftData = abi.encode(
            ["address", "uint256"], 
            [NFT.address, 5]
        );

        const data = abi.encode(
            ["uint256", "uint256", "uint256", "uint256", "bytes32"], 
            [0, '0x0000000000641cf0df2a5a20cd61d68d4489eebbf85b8d39e18a', 0, 1000, "0x0000000000000000000000000000000000000000000000000000000000000000"]
        );

        const purchaseV3 = {
            "maker": signer.address,
            "makeAsset": {
                "assetType": {
                    "assetClass": "0x73ad2146",
                    "data": nftData
                },
                "value": "1"
            },
            "taker": "0x0000000000000000000000000000000000000000",
            "takeAsset": {
                "assetType": {
                    "assetClass": "0xaaaebeba",
                    "data": "0x"
                },
                "value": "1000"
            },
            "salt": "26718800967008653066560905514319032007757973539109977657493932996510207620487",
            "start": "0",
            "end": "0",
            "dataType": "0x2fa3cfd3",//V3_SELL
            "data": data
        }
        //approve transfer proxy
        await NFT.approve('0x4fee7b061c97c9c496b01dbce9cdb10c02f0a0be', 5)
        const sellOrderSignature = await createRariblePurchase(purchaseV3, signer)

        const buyOrderData = abi.encode(
            ["uint256", "uint256", "uint256", "bytes32"], 
            [0, '0x0000000000641cf0df2a5a20cd61d68d4489eebbf85b8d39e18a', 0, "0x0000000000000000000000000000000000000000000000000000000000000000"]
        );
        const purchaseNewV3 = {
            sellOrderMaker: purchaseV3.maker,
            sellOrderNftAmount: purchaseV3.makeAsset.value,
            nftAssetClass: purchaseV3.makeAsset.assetType.assetClass,
            nftData: purchaseV3.makeAsset.assetType.data,
            sellOrderPaymentAmount: purchaseV3.takeAsset.value,
            paymentToken: "0x0000000000000000000000000000000000000000",
            sellOrderSalt: purchaseV3.salt,
            sellOrderStart: purchaseV3.start,
            sellOrderEnd: purchaseV3.end,
            sellOrderDataType: purchaseV3.dataType,
            sellOrderData: purchaseV3.data,
            sellOrderSignature: sellOrderSignature,
            buyOrderPaymentAmount: purchaseV3.takeAsset.value,
            buyOrderNftAmount: purchaseV3.makeAsset.value,
            buyOrderData: buyOrderData
        }

        const lotParams = {
            totalTickets: 100,
            ticketPrice: 20000000,
            duration: 86400
        }
        const _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        // Create new lot

        const lotID = (await eesee.getLotsLength()).toNumber()
        let fee = await eesee.fee()
        await eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...lotParams,
            owner: signer.address,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [lotParams.totalTickets], acc2.address, '0x')

        // Choose winner
        const tx = await mockVRF.fulfillWords(0, { gasLimit: '30000000' })
        const recipt = expect(tx)
        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)

        // Calculate total amount of won ESE tokens 
        const lot = await eesee.lots(lotID)
        const winningsAmount = lot.ticketPrice.mul(lot.totalTickets)
        const denominator = ethers.BigNumber.from('10000')
        const feeAmount = winningsAmount.mul(lot.fee).div(denominator)
        const totalWonTokensAmount = winningsAmount.sub(feeAmount)

        // Create swapdata
        const iface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ])
        const uint256 =  ethers.utils.defaultAbiCoder.encode(
            ["uint256"], 
            ['1011']//cost + 1 wei 
        );
        const swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalWonTokensAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            uint256
        ])

        const purchaseNewV3Invalid = {
            sellOrderMaker: purchaseV3.maker,
            sellOrderNftAmount: purchaseV3.makeAsset.value,
            nftAssetClass: purchaseV3.makeAsset.assetType.assetClass,
            nftData: purchaseV3.makeAsset.assetType.data,
            sellOrderPaymentAmount: purchaseV3.takeAsset.value,
            paymentToken: "0x0000000000000000000000000000000000000000",
            sellOrderSalt: purchaseV3.salt,
            sellOrderStart: purchaseV3.start,
            sellOrderEnd: purchaseV3.end,
            sellOrderDataType: '0x00000000',//this is invalid
            sellOrderData: purchaseV3.data,
            sellOrderSignature: sellOrderSignature,
            buyOrderPaymentAmount: purchaseV3.takeAsset.value,
            buyOrderNftAmount: purchaseV3.makeAsset.value,
            buyOrderData: buyOrderData
        }

        let first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        let swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: raribleRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([purchaseStructType], [purchaseNewV3Invalid])
            }]
            },
            acc2.address
        ]);
        let second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second])).to.be.revertedWithCustomError(raribleRouter, "InvalidDataType")

        

        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: raribleRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([purchaseStructType], [purchaseNewV3])
            }]
            },
            acc2.address
        ]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        balanceBefore = await ESE.balanceOf(acc2.address)
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalWonTokensAmount.toString())
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, zeroAddress, '1010', acc2.address)
        let balanceAfter = await ESE.balanceOf(acc2.address)

        //No dust
        assert.equal(balanceAfter.sub(balanceBefore).toString(), '0',"Balance is correct")

        // Check new nft owner
        let onwerOfNFT = await NFT.ownerOf(5)
        assert.equal(onwerOfNFT, acc2.address, "New owner of nft is correct")
        await network.provider.send("evm_revert", [snapshotId])
    })

    const purchaseNew = {
        sellOrderMaker: "0xB308082a84F0cEDaBde8F8C019dc28C2140C9822",
        sellOrderNftAmount: "1",
        nftAssetClass: "0x73ad2146",
        nftData: "0x000000000000000000000000fbeef911dc5821886e1dda71586d90ed28174b7d000000000000000000000000000000000000000000000000000000000000f1cd",
        sellOrderPaymentAmount: "10000000000000000",
        paymentToken: "0x0000000000000000000000000000000000000000",
        sellOrderSalt: "86718800967008653066560905514329038007757973539109977657493932996510207620487",
        sellOrderStart: "0",
        sellOrderEnd: "1702212615",
        sellOrderDataType: "0x23d235ef",
        sellOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a00000000000000000000000000000000000000000000000000000000000002ee",
        sellOrderSignature: "0x4bc636e6ecd7fcede211a8c5da506fb886288c8d5ff0354a75f7cfc65fb008e24c5e35bfc93627480deccd404e30a4b05d707c4401a6c6a869ec2cf3de5034961b",
        buyOrderPaymentAmount: "10000000000000000",
        buyOrderNftAmount: "1",
        buyOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a00000000000000000000000000000000000000000000000000000000000002ee"
    }
    it('Receives reward from Rarible with new fee system', async () => {
        if(network.name != 'testnet') {
        // Mainnet tx: https://etherscan.io/tx/0xf2e409e9219f20e9f42f54fdab06ae94d012eca2fecf3f164bd18bc144550bc6
        const lotParams = {
            totalTickets: 100,
            ticketPrice: 20000000,
            duration: 86400
        }

        // Create network snapshot
        snapshotId = await network.provider.send('evm_snapshot')

        // Reset network to txBlockNumber
        await hre.network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.ETHEREUMRPC,
                        blockNumber: 18541677
                    },
                    chainId: 1
                },
            ]
        });

        // Redeploy eesee contracts
        await initContracts()

        const _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        // Create new lot
        let fee = await eesee.fee()
        await eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...lotParams,
            owner: signer.address,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [25], acc2.address, '0x')

        const lotID = 0

        // Buyout all tokens
        for(let i = 1; i <= 3; i ++) {
            await eesee.connect(ticketBuyers[i]).buyTickets([lotID], [25],ticketBuyers[i].address, '0x')
            if (i == 3) {
                //MockVRF's first requestID is 0
                const tx = await eeseeRandom["performUpkeep(bytes)"]("0x00")
                const recipt = expect(tx)
                await recipt.to.emit(eeseeRandom, "RequestWords").withArgs(0)
                console.log('GAS FOR PERFORM UPKEEP 1:', (await tx.wait()).gasUsed.toString())
                await expect(eeseeRandom["performUpkeep(bytes)"]("0x00")).to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
            }
        }

        // Choose winner
        const tx = await mockVRF.fulfillWords(0, { gasLimit: '30000000' })
        const recipt = expect(tx)
        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)

        // Calculate total amount of won ESE tokens 
        const lot = await eesee.lots(lotID)
        const winningsAmount = lot.ticketPrice.mul(lot.totalTickets)
        const denominator = ethers.BigNumber.from('10000')
        const feeAmount = winningsAmount.mul(lot.fee).div(denominator)
        const totalWonTokensAmount = winningsAmount.sub(feeAmount)

        // Create swapdata
        const iface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ])
        const uint256 =  ethers.utils.defaultAbiCoder.encode(
            ["uint256"], 
            ['10750000000000001']//cost + 1 wei 
        );
        const swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalWonTokensAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            uint256
        ])
           
        let first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        let swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: raribleRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([purchaseStructType], [purchaseNew])
            }]
            },
            acc2.address
        ]);
        let second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        let balanceBefore = await ESE.balanceOf(acc2.address)
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalWonTokensAmount.toString())
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, zeroAddress, '10750000000000000', acc2.address)
        let balanceAfter = await ESE.balanceOf(acc2.address)
        //No dust
        assert.equal(balanceAfter.sub(balanceBefore).toString(), '0',"Balance is correct")

        // Check new nft owner
        let nft = await hre.ethers.getContractAt(ERC721ABI, '0xfbeef911dc5821886e1dda71586d90ed28174b7d')
        let onwerOfNFT = await nft.ownerOf(61901)
        assert.equal(onwerOfNFT, acc2.address, "New owner of nft is correct")

        // Restore to snapshot
        await network.provider.send("evm_revert", [snapshotId])
    }
    })

    const purchaseNew_zeroFee = {
        sellOrderMaker: "0xB308082a84F0cEDaBde8F8C019dc28C2140C9822",
        sellOrderNftAmount: "1",
        nftAssetClass: "0x73ad2146",
        nftData: "0x000000000000000000000000fbeef911dc5821886e1dda71586d90ed28174b7d000000000000000000000000000000000000000000000000000000000000f1cd",
        sellOrderPaymentAmount: "10000000000000000",
        paymentToken: "0x0000000000000000000000000000000000000000",
        sellOrderSalt: "86718800967008653066560905514329038007757973539109977657493932996510207620487",
        sellOrderStart: "0",
        sellOrderEnd: "1702212615",
        sellOrderDataType: "0x23d235ef",
        sellOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a00000000000000000000000000000000000000000000000000000000000002ee",
        sellOrderSignature: "0x4bc636e6ecd7fcede211a8c5da506fb886288c8d5ff0354a75f7cfc65fb008e24c5e35bfc93627480deccd404e30a4b05d707c4401a6c6a869ec2cf3de5034961b",
        buyOrderPaymentAmount: "10000000000000000",
        buyOrderNftAmount: "1",
        buyOrderData: "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    }
    it('Receives reward from Rarible with new fee system with zero fees', async () => {
        if(network.name != 'testnet') {
        // Mainnet tx: https://etherscan.io/tx/0xf2e409e9219f20e9f42f54fdab06ae94d012eca2fecf3f164bd18bc144550bc6
        const lotParams = {
            totalTickets: 100,
            ticketPrice: 20000000,
            duration: 86400
        }

        // Create network snapshot
        snapshotId = await network.provider.send('evm_snapshot')

        // Reset network to txBlockNumber
        await hre.network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.ETHEREUMRPC,
                        blockNumber: 18541677
                    },
                    chainId: 1
                },
            ]
        });

        // Redeploy eesee contracts
        await initContracts()

        const _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        // Create new lot
        let fee = await eesee.fee()
        await eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...lotParams,
            owner: signer.address,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [25], acc2.address, '0x')

        const lotID = 0

        // Buyout all tokens
        for(let i = 1; i <= 3; i ++) {
            await eesee.connect(ticketBuyers[i]).buyTickets([lotID], [25],ticketBuyers[i].address, '0x')
            if (i == 3) {
                //MockVRF's first requestID is 0
                const tx = await eeseeRandom["performUpkeep(bytes)"]("0x00")
                const recipt = expect(tx)
                await recipt.to.emit(eeseeRandom, "RequestWords").withArgs(0)
                console.log('GAS FOR PERFORM UPKEEP 1:', (await tx.wait()).gasUsed.toString())
                await expect(eeseeRandom["performUpkeep(bytes)"]("0x00")).to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
            }
        }

        // Choose winner
        const tx = await mockVRF.fulfillWords(0, { gasLimit: '30000000' })
        const recipt = expect(tx)
        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)

        // Calculate total amount of won ESE tokens 
        const lot = await eesee.lots(lotID)
        const winningsAmount = lot.ticketPrice.mul(lot.totalTickets)
        const denominator = ethers.BigNumber.from('10000')
        const feeAmount = winningsAmount.mul(lot.fee).div(denominator)
        const totalWonTokensAmount = winningsAmount.sub(feeAmount)

        // Create swapdata
        const iface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ])
        const uint256 =  ethers.utils.defaultAbiCoder.encode(
            ["uint256"], 
            ['10000000000000001']//cost + 1 wei 
        );
        const swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalWonTokensAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            uint256
        ])
           
        let first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        let swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: raribleRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([purchaseStructType], [purchaseNew_zeroFee])
            }]
            },
            acc2.address
        ]);
        let second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        let balanceBefore = await ESE.balanceOf(acc2.address)
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalWonTokensAmount.toString())
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, zeroAddress, '10000000000000000', acc2.address)
        let balanceAfter = await ESE.balanceOf(acc2.address)
        //No dust
        assert.equal(balanceAfter.sub(balanceBefore).toString(), '0',"Balance is correct")

        // Check new nft owner
        let nft = await hre.ethers.getContractAt(ERC721ABI, '0xfbeef911dc5821886e1dda71586d90ed28174b7d')
        let onwerOfNFT = await nft.ownerOf(61901)
        assert.equal(onwerOfNFT, acc2.address, "New owner of nft is correct")

        // Restore to snapshot
        await network.provider.send("evm_revert", [snapshotId])
    }
    })

    const purchaseNewV1 = {
        sellOrderMaker: "0xcbb1A8053B8C4bF051688f94aC516EC1684e6cFe",
        sellOrderNftAmount: "1",
        nftAssetClass: "0x73ad2146",
        nftData: "0x000000000000000000000000bc1e44df6a4c09f87d4f2500c686c61429eea11200000000000000000000000000000000000000000000000000000000000009dc",
        sellOrderPaymentAmount: "1000000000000",
        paymentToken: "0x0000000000000000000000000000000000000000",
        sellOrderSalt: "72332279895197483635329690653560774754531023384369803322709549449854078153895",
        sellOrderStart: "0",
        sellOrderEnd: "0",
        sellOrderDataType: "0x4c234266",
        sellOrderData: "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a00000000000000000000000000000000000000000000000000000000000000fa",
        sellOrderSignature: "0x2d73dd37db25159667fa92b0b2fc16006ae101392c77806a928a1ff0e60b6cf95b39c70cf734c3fa074c188b6b0b7e26313cdc34aacc3ee0be1739798eb893411b",
        buyOrderPaymentAmount: "1000000000000",
        buyOrderNftAmount: "1",
        buyOrderData: "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a0000000000000000000000000000000000000000000000000000000000000064"
    }

    const purchaseNewV1InvalidAssetClass = {
        sellOrderMaker: "0xcbb1A8053B8C4bF051688f94aC516EC1684e6cFe",
        sellOrderNftAmount: "1",
        nftAssetClass: "0x00000001",
        nftData: "0x000000000000000000000000bc1e44df6a4c09f87d4f2500c686c61429eea11200000000000000000000000000000000000000000000000000000000000009dc",
        sellOrderPaymentAmount: "1000000000000",
        paymentToken: "0x0000000000000000000000000000000000000000",
        sellOrderSalt: "72332279895197483635329690653560774754531023384369803322709549449854078153895",
        sellOrderStart: "0",
        sellOrderEnd: "0",
        sellOrderDataType: "0x4c234266",
        sellOrderData: "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a00000000000000000000000000000000000000000000000000000000000000fa",
        sellOrderSignature: "0x2d73dd37db25159667fa92b0b2fc16006ae101392c77806a928a1ff0e60b6cf95b39c70cf734c3fa074c188b6b0b7e26313cdc34aacc3ee0be1739798eb893411b",
        buyOrderPaymentAmount: "1000000000000",
        buyOrderNftAmount: "1",
        buyOrderData: "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a0000000000000000000000000000000000000000000000000000000000000064"
    }
    it('Receives reward from Rarible V1', async () => {
        if(network.name != 'testnet') {
        // Mainnet tx: https://etherscan.io/tx/0x23e54b252f8c86e2cfc23b30bdd37bb17a0f430117c4ae9e6876f7868063e0e0
        const lotParams = {
            totalTickets: 100,
            ticketPrice: 20000000,
            duration: 86400
        }

        // Create network snapshot
        snapshotId = await network.provider.send('evm_snapshot')

        // Reset network to txBlockNumber
        await hre.network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.ETHEREUMRPC,
                        blockNumber: 18401000
                    },
                    chainId: 1
                },
            ]
        });

        // Redeploy eesee contracts
        await initContracts()

        const _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        // Create new lot
        let fee = await eesee.fee()
        await eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
            ...lotParams,
            owner: signer.address,
            signer: _lot.signer,
            signatureData: _lot.signatureData
        }], fee, [25], acc2.address, '0x')

        const lotID = 0

        // Buyout all tokens
        for(let i = 1; i <= 3; i ++) {
            await eesee.connect(ticketBuyers[i]).buyTickets([lotID], [25],ticketBuyers[i].address, '0x')
            if (i == 3) {
                //MockVRF's first requestID is 0
                const tx = await eeseeRandom["performUpkeep(bytes)"]("0x00")
                const recipt = expect(tx)
                await recipt.to.emit(eeseeRandom, "RequestWords").withArgs(0)
                console.log('GAS FOR PERFORM UPKEEP 1:', (await tx.wait()).gasUsed.toString())
                await expect(eeseeRandom["performUpkeep(bytes)"]("0x00")).to.be.revertedWithCustomError(eeseeRandom, "UpkeepNotNeeded")
            }
        }

        // Choose winner
        const tx = await mockVRF.fulfillWords(0, { gasLimit: '30000000' })
        const recipt = expect(tx)
        await recipt.to.emit(eeseeRandom, "FulfillRandomWords").withArgs(0)

        // Calculate total amount of won ESE tokens 
        const lot = await eesee.lots(lotID)
        const winningsAmount = lot.ticketPrice.mul(lot.totalTickets)
        const denominator = ethers.BigNumber.from('10000')
        const feeAmount = winningsAmount.mul(lot.fee).div(denominator)
        const totalWonTokensAmount = winningsAmount.sub(feeAmount)

        // Create swapdata
        const iface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ])
        const uint256 =  ethers.utils.defaultAbiCoder.encode(
            ["uint256"], 
            ['1010000000001']//cost + 1 wei 
        );
        const swapData = iface.encodeFunctionData('swap', [
            mock1InchExecutorETH.address, 
            {
                srcToken: ESE.address,
                dstToken: zeroAddress,//ETH
                srcReceiver: mock1InchExecutorETH.address,
                dstReceiver: swap.address, 
                amount: totalWonTokensAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            uint256
        ])
           
        let first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        let swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: raribleRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([purchaseStructType], [purchaseNewV1InvalidAssetClass])
            }]
            },
            acc2.address
        ]);
        let second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        await expect(eesee.connect(acc2).multicall([first, second]))
        .to.be.revertedWithCustomError(raribleRouter, "InvalidAssetClass")

        first = eesee.interface.encodeFunctionData('receiveTokens', [[lotID], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: raribleRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([purchaseStructType], [purchaseNewV1])
            }]
            },
            acc2.address
        ]);
        second = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        let balanceBefore = await ESE.balanceOf(acc2.address)
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(lotID, acc2.address, swap.address, totalWonTokensAmount.toString())
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, zeroAddress, '1010000000000', acc2.address)
        let balanceAfter = await ESE.balanceOf(acc2.address)
        //No dust
        assert.equal(balanceAfter.sub(balanceBefore).toString(), '0',"Balance is correct")

        // Check new nft owner
        let nft = await hre.ethers.getContractAt(ERC721ABI, '0xbc1e44df6a4c09f87d4f2500c686c61429eea112')
        let onwerOfNFT = await nft.ownerOf(2524)
        assert.equal(onwerOfNFT, acc2.address, "New owner of nft is correct")

        // Restore to snapshot
        await network.provider.send("evm_revert", [snapshotId])
    }
    })
    
    let _snapshotId
    it('buyTickets reverts if lot is expired', async () => {
        const _lot1 = await createLot(ESE.address, 0, 150, 4, '0x',50,3,86400,signer.address,10000000000, signer)
        const _lot2 = await createLot(ESE.address, 0, 600, 4, '0x',150,4,86400,signer.address,10000000000, signer)
        const _lot3 = await createLot(ESE.address, 0, 1000, 4, '0x',200,5,86400,signer.address,10000000000, signer)
        const lots = [_lot1,_lot2,_lot3]
        
        expiredLots = [
            {
                ID: 1,
                lotParams: { 
                    totalTickets: 50, 
                    ticketPrice: 3, 
                    duration: 86400,
                    owner: signer.address,
                    signer: _lot1.signer,
                    signatureData: _lot1.signatureData
                },
                ticketsAmount: 15,
                account: acc2
            },
            {
                ID: 2,
                lotParams: { 
                    totalTickets: 150, 
                    ticketPrice: 4, 
                    duration: 86400,
                    owner: signer.address,
                    signer: _lot2.signer,
                    signatureData: _lot2.signatureData
                },
                ticketsAmount: 45,
                account: acc3
            },
            {
                ID: 3,
                lotParams: { 
                    totalTickets: 200, 
                    ticketPrice: 5, 
                    duration: 86400,
                    owner: signer.address,
                    signer: _lot3.signer,
                    signatureData: _lot3.signatureData
                },
                ticketsAmount: 60,
                account: acc4
            }
        ]

        // Create new lots
        let fee = await eesee.fee()
        for (let i = 0; i < expiredLots.length; i++) {
            // timestamp = await time.latest() + 1
            await expect(eesee.connect(expiredLots[i].account).createLotsAndBuyTickets(
                    [{token: ESE.address, tokenID: 0, amount: expiredLots[i].lotParams.totalTickets * expiredLots[i].lotParams.ticketPrice, assetType: 4, data:'0x'}],
                    [expiredLots[i].lotParams], 
                    fee,
                    [expiredLots[i].ticketsAmount], 
                    expiredLots[i].account.address, 
                    '0x'
                ))
                .to.emit(eesee, "CreateLot")
                .withArgs(expiredLots[i].ID, anyValue, lots[i].signer, signer.address, expiredLots[i].lotParams.totalTickets, expiredLots[i].lotParams.ticketPrice, anyValue)
                .to.emit(eesee, "BuyTickets")
                .withArgs(expiredLots[i].ID,
                    expiredLots[i].account.address,
                    0,
                    expiredLots[i].ticketsAmount,
                    expiredLots[i].lotParams.ticketPrice * expiredLots[i].ticketsAmount,
                    Math.floor((expiredLots[i].ticketsAmount*expiredLots[i].ticketsAmount)/expiredLots[i].lotParams.totalTickets*0.25)
                )
                .and.to.emit(eesee, "ConsumeNonce").withArgs(expiredLots[i].ID.toString(), signer.address, lots[i].nonce.toString())
        }

        // Time travel and check
        await time.increase(86401)

        for (let i = 0; i < expiredLots.length; i++) {
            const lot = await eesee.lots(expiredLots[i].ID)
            const timestamp = (await ethers.provider.getBlock()).timestamp
            assert.equal(ethers.BigNumber.from(lot.endTimestamp).lt(timestamp), true, "lot expired")
            await expect(eesee.connect(ticketBuyers[0]).buyTickets([expiredLots[i].ID], [10], ticketBuyers[0].address, '0x'))
                .to.be.revertedWithCustomError(eesee, "LotExpired")
                .withArgs(expiredLots[i].ID)
        }
        await network.provider.send("evm_revert", [snapshotId])
        _snapshotId = await network.provider.send('evm_snapshot')
    })

    it('Can receive tokens if lot is expired but the winner was chosen', async () => {
        const expiredLotID = 1

        let lot = await eesee.lots(expiredLotID)
        await expect(eesee.connect(ticketBuyers[0]).reclaimTokens([expiredLotID], acc7.address))
        .to.be.revertedWithCustomError(eesee, "LotNotExpired").withArgs(expiredLotID)
        await expect(eesee.connect(ticketBuyers[0]).receiveTokens([expiredLotID], acc7.address))
        .to.be.revertedWithCustomError(eesee, "LotNotFulfilled").withArgs(expiredLotID)

        snapshotId = await network.provider.send('evm_snapshot')

        await eeseeRandom["performUpkeep(bytes)"]("0x00")
        await mockVRF.fulfillWords(1)

        await expect(eesee.connect(ticketBuyers[0]).reclaimTokens([expiredLotID], acc7.address))
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

        const balanceAfter = await ESE.balanceOf(winner)
        assert.equal(balanceAfter.sub(balanceBefore), wonAmount, "ESE is correct")

        await expect(eesee.connect(winnerAcc).receiveTokens([expiredLotID], winner))
        .to.be.revertedWithCustomError(eesee, "LotNotExists").withArgs(expiredLotID)

        await network.provider.send("evm_revert", [snapshotId])
    })

    it('Can reclaim tokens if lot is expired', async () => {
        await time.increase(86401)
        for (let i = 0; i < expiredLots.length; i++) {
            const balanceBeforeTokens = await ESE.balanceOf(expiredLots[i].account.address);
            const tx = await eesee.connect(expiredLots[i].account).reclaimTokens([expiredLots[i].ID], expiredLots[i].account.address)
            await tx.wait()

            await expect(tx)
                .to.emit(eesee, "ReclaimTokens")
                .withArgs(
                    expiredLots[i].ID,
                    expiredLots[i].account.address,
                    expiredLots[i].account.address,
                    expiredLots[i].ticketsAmount * expiredLots[i].lotParams.ticketPrice
                )

            const balanceAfterTokens = await ESE.balanceOf(expiredLots[i].account.address);
            assert.equal(balanceAfterTokens.sub(balanceBeforeTokens), expiredLots[i].ticketsAmount * expiredLots[i].lotParams.ticketPrice, "balance is correct")
        }
    })

    it('Can create lazy minting lot', async () => {
        let ID = (await eesee.getLotsLength()).toNumber()

        await expect(minter.lazyMint(
            0, 
            zeroAddress, 
            {name:"hello", symbol:"HI", contractURI:"/contract"}, 
            {URI: "/hello", royaltyReceiver:acc3.address, royaltyFeeNumerator:100}, 
            oneAddress
        )).to.be.revertedWithCustomError(minter, "InvalidOwner")

        await expect(minter.lazyMint(
            0, 
            oneAddress, 
            {name:"hello", symbol:"HI", contractURI:"/contract"}, 
            {URI: "/hello", royaltyReceiver:acc3.address, royaltyFeeNumerator:100}, 
            zeroAddress
        )).to.be.revertedWithCustomError(minter, "InvalidRecipient")

        const data = ethers.utils.defaultAbiCoder.encode(
            [
                "uint256", 
                "address", 
                {
                    type: "tuple",
                    name: "collectionMetadata",
                    components: [
                      { name: "name", type: 'string' },
                      { name: "symbol", type: 'string' },
                      { name: "contractURI", type:'string' },
                    ]
                },
                {
                    type: "tuple",
                    name: "tokenMetadata",
                    components: [
                      { name: "URI", type:'string' },
                      { name: "royaltyReceiver", type:'address' },
                      { name: "royaltyFeeNumerator", type:'uint96' },
                    ]
                }
            ],
            [777, acc2.address, {name:"hello", symbol:"HI", contractURI:"/contract"}, {URI: "/hello", royaltyReceiver:acc3.address, royaltyFeeNumerator:100},]
          );

          const invalidData = ethers.utils.defaultAbiCoder.encode(
            [
                "uint256", 
                "address", 
                {
                    type: "tuple",
                    name: "collectionMetadata",
                    components: [
                      { name: "name", type: 'string' },
                      { name: "symbol", type: 'string' },
                      { name: "contractURI", type:'string' },
                    ]
                },
                {
                    type: "tuple",
                    name: "tokenMetadata",
                    components: [
                      { name: "URI", type:'string' },
                      { name: "royaltyReceiver", type:'address' },
                      { name: "royaltyFeeNumerator", type:'uint96' },
                    ]
                }
            ],
            //This has owner ass acc3.address, which should trigger InvalidLazyMintOwner error
            [777, acc3.address, {name:"hello", symbol:"HI", contractURI:"/contract"}, {URI: "/hello", royaltyReceiver:acc3.address, royaltyFeeNumerator:100},]
          );

        let timestamp = await time.latest();
        let _nonce = nonce
        let fee = await eesee.fee()

        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: zeroAddress, tokenID: 0, amount: 1, assetType: 5, data:invalidData}],
            [{ 
                totalTickets: 2, 
                ticketPrice: 2, 
                duration: 86400, 
                owner: acc2.address,
                signer: acc2.address,
                signatureData: "0x"
            }], fee, [1], acc2.address, '0x')).to.be.revertedWithCustomError(eesee, "InvalidLazyMintOwner")


        let _lot = await createLot(zeroAddress, 0, 1, 5, data,2,2,86400,acc2.address,10000000000, acc2)
        const tx = await eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: zeroAddress, tokenID: 0, amount: 1, assetType: 5, data:data}],
            [{ 
                totalTickets: 2, 
                ticketPrice: 2, 
                duration: 86400, 
                owner: acc2.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [1], acc2.address, '0x')
        const receipt = await tx.wait()
        timestamp = await time.latest();
    
        await expect(tx)
        .and.to.emit(eesee, "CreateLot").withArgs(ID, anyValue, _lot.signer, acc2.address, 2, 2, timestamp + 86400)
        .and.to.emit(eesee, 'BuyTickets').withArgs(ID, acc2.address, 0, 1, 2, Math.floor((1*1)/2*0.25))
        .and.to.not.emit(eesee, "ConsumeNonce")

        const snapshotId = await network.provider.send('evm_snapshot')

        await time.increase(100000)

        const tx2 = await eesee.connect(acc2).reclaimAssets([ID], acc2.address)
        const token = _NFTlazyMint.attach((await tx2.wait()).events.find(val=>val.event == 'ReclaimAsset').args.asset.token)

        await expect(tx2)
        .to.emit(eesee, "ReclaimAsset").withArgs(ID, acc2.address, acc2.address, anyValue)
        .and.to.emit(minter, 'DeployLazyMint').withArgs(token.address, eesee.address, acc2.address, 777)
        .and.to.emit(minter, 'LazyMint').withArgs(token.address, 1, acc2.address)

        assert.equal(await token.owner(), acc2.address, "owner is correct")
        assert.equal(await token.minter(), minter.address, "minter is correct")
        assert.equal(await token.collectionID(), 777, "collectionID is correct")
        assert.equal(await token.contractURI(), "/contract", "contractURI is correct")

        await expect(token.initialize(0, zeroAddress,zeroAddress, {name:"hello", symbol:"HI", contractURI:"/contract"},zeroAddress)).to.be.revertedWith("Initializable: contract is already initialized")
        await expect(token.tokenURI(2)).to.be.revertedWithCustomError(token, "URIQueryForNonexistentToken")
        await expect(token.mintSingle(signer.address, {URI: "/hello", royaltyReceiver:acc3.address, royaltyFeeNumerator:100})).to.be.revertedWith("Caller is not the minter")
        assert.equal(await token.tokenURI(1), "/hello", "tokenURI is correct")
        assert.equal(await token.name(), "hello", "name is correct")
        assert.equal(await token.symbol(), "HI", "symbol is correct")
        assert.equal((await token.royaltyInfo(1, 10000))[0], acc3.address, "royaltyReceiver is correct")
        assert.equal((await token.royaltyInfo(1, 10000))[1], '100', "royaltyFeeNumerator is correct")
        assert.equal(await token.supportsInterface('0x5b5e139f'), true)//metadata
        assert.equal(await token.supportsInterface('0x80ac58cd'), true)//erc721
        assert.equal(await token.supportsInterface('0x2a55205a'), true)//ERC2981
        assert.equal(await token.supportsInterface('0x00000000'), false)

        await network.provider.send("evm_revert", [snapshotId])



        await ESE.approve(eesee.address, 10000)
        await eesee.buyTickets([ID],[1],signer.address,"0x")

        await eeseeRandom.connect(signer)["performUpkeep()"]()
        await mockVRF.fulfillWords(1)

        let winner = (await eesee1inch.getLotWinner(ID)).winner
        assert.notEqual(winner, zeroAddress)
        assert.equal((await eesee1inch.getLotWinner(ID)).isAssetWinner, true)
        let signers = await ethers.getSigners()
        let winnerAcc = signers.filter(signer => signer.address === winner)[0]

        const tx3 = await eesee.connect(winnerAcc).receiveAssets([ID], acc4.address)
        await expect(tx3)
        .to.emit(eesee, "ReceiveAsset")
        .withArgs(ID, winnerAcc.address, acc4.address, anyValue)
        const token1 = _NFTlazyMint.attach((await tx3.wait()).events.find(val=>val.event == 'ReceiveAsset').args.asset.token)
        assert.equal(await token1.ownerOf(1), acc4.address, "owner is correct")

        //Can transfer
        await expect(token1.connect(acc4).transferFrom(acc4.address, signer.address, 1)).to.emit(token1, "Transfer")
        .withArgs(acc4.address, signer.address, 1)

        _lot = await createLot(zeroAddress, 0, 1, 5, data,2,2,86400,acc3.address,10000000000, acc2)
        const tx4 = await eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: zeroAddress, tokenID: 0, amount: 1, assetType: 5, data:data}],
            [{ 
                totalTickets: 2, 
                ticketPrice: 2, 
                duration: 86400, 
                owner: acc3.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [1], acc2.address, '0x')
        await tx.wait()

        ID += 1
        await eesee.buyTickets([ID],[1],signer.address,"0x")
        await eeseeRandom.connect(signer)["performUpkeep()"]()
        await mockVRF.fulfillWords(2)

        winner = (await eesee1inch.getLotWinner(ID)).winner
        assert.notEqual(winner, zeroAddress)
        assert.equal((await eesee1inch.getLotWinner(ID)).isAssetWinner, true)
        signers = await ethers.getSigners()
        winnerAcc = signers.filter(signer => signer.address === winner)[0]

        const tx5 = await eesee.connect(winnerAcc).receiveAssets([ID], acc4.address)
        await expect(tx5)
        .to.emit(eesee, "ReceiveAsset")
        .withArgs(ID, winnerAcc.address, acc4.address, anyValue)
        
        const token2 = _NFTlazyMint.attach((await tx5.wait()).events.find(val=>val.event == 'ReceiveAsset').args.asset.token)
        assert.equal(token1.address, token2.address, "collection is the same")
        assert.equal(await token2.ownerOf(2), acc4.address, "owner is correct")

        _lot = await createLot(zeroAddress, 0, 0, 5, data,2,2,86400,acc3.address,10000000000, acc2)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: zeroAddress, tokenID: 0, amount: 0, assetType: 5, data:data}],
            [{ 
                totalTickets: 2, 
                ticketPrice: 2, 
                duration: 86400, 
                owner: acc3.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [1], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidAmount")

        _lot = await createLot(zeroAddress, 1, 1, 5, data,2,2,86400,acc3.address,10000000000, acc2)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: zeroAddress, tokenID: 1, amount: 1, assetType: 5, data:data}],
            [{ 
                totalTickets: 2, 
                ticketPrice: 2, 
                duration: 86400, 
                owner: acc3.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [1], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidTokenID")

        _lot = await createLot(eesee.address, 0, 1, 5, data,2,2,86400,acc3.address,10000000000, acc2)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: zeroAddress, tokenID: 0, amount: 1, assetType: 5, data:data}],
            [{ 
                totalTickets: 2, 
                ticketPrice: 2, 
                duration: 86400, 
                owner: acc3.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [1], acc2.address, '0x', {value: 1}))
            .to.be.revertedWithCustomError(eesee, "InvalidMsgValue")

        _lot = await createLot(eesee.address, 0, 1, 5, data,2,2,86400,acc3.address,10000000000, acc2)
        await expect(eesee.connect(acc2).createLotsAndBuyTickets(
            [{token: eesee.address, tokenID: 0, amount: 1, assetType: 5, data:data}],
            [{ 
                totalTickets: 2, 
                ticketPrice: 2, 
                duration: 86400, 
                owner: acc3.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }], fee, [1], acc2.address, '0x'))
            .to.be.revertedWithCustomError(eesee, "InvalidToken")
    })
    it('Can buyout lots', async () => {
        if(network.name != 'testnet') {
        // Reset network to txBlockNumber
        await hre.network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.ETHEREUMRPC,
                        blockNumber: txBlockNumber
                    },
                    chainId: 1
                },
            ]
        });
        
        // Redeploy eesee contracts
        await initContracts()

        // Deploy WETH 1inch executor
        const _mock1InchExecutorWETH = await hre.ethers.getContractFactory("Mock1InchExecutorWETH")
        mock1InchExecutorWETH = await _mock1InchExecutorWETH.deploy(mainnetAddresses.WETH)
        await mock1InchExecutorWETH.deployed()
        
        // Add WETH to executor
        const WETH = await hre.ethers.getContractAt(WETHABI, mainnetAddresses.WETH)
        const WETHHolderSigner = await ethers.getImpersonatedSigner(mainnetAddresses.WETHHolder)
        await WETH.connect(WETHHolderSigner).transfer(mock1InchExecutorWETH.address, ethers.utils.parseUnits('200', 'ether'))

        let currentLotID = (await eesee.getLotsLength()).toNumber()

        let fee = await eesee.fee()
        const tx = await eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{totalTickets: 1, ticketPrice: 1, duration: 86400, owner: signer.address, signer: signer.address, signatureData: '0x'}],
            fee
        )
        const receipt = await tx.wait()

        snapshotId = await network.provider.send('evm_snapshot')

        await ESE.connect(acc2).approve(eesee.address, 1)
        await eesee.connect(acc2).buyTickets([currentLotID], [1], acc2.address, '0x')

        let lot = await eesee.lots(currentLotID)
        assert.equal(lot.buyout, true, "buyout is correct")

        assert.equal((await eesee1inch.getLotWinner(currentLotID)).winner, acc2.address, "winner is chosen")
        assert.equal((await eesee1inch.getLotWinner(currentLotID)).isAssetWinner, true)

        await expect(eesee.connect(acc2).reclaimTokens([currentLotID], acc2.address)).to.be.revertedWithCustomError(eesee, "LotAlreadyFulfilled").withArgs(currentLotID)
        await expect(eesee.reclaimAssets([currentLotID], signer.address)).to.be.revertedWithCustomError(eesee, "LotAlreadyFulfilled").withArgs(currentLotID)

        await expect(eesee.connect(acc2).receiveTokens([currentLotID], signer.address)).to.be.revertedWithCustomError(eesee, "CallerNotOwner").withArgs(currentLotID)
        await expect(eesee.connect(signer).receiveTokens([currentLotID], signer.address))
        .to.emit(eesee, "ReceiveTokens")
        .withArgs(currentLotID, signer.address, signer.address, anyValue)

        await expect(eesee.connect(signer).receiveAssets([currentLotID], signer.address)).to.be.revertedWithCustomError(eesee, "CallerNotWinner").withArgs(currentLotID)
        await expect(eesee.connect(acc2).receiveAssets([currentLotID], acc2.address))
        .to.emit(eesee, "ReceiveAsset")
        .withArgs(currentLotID, acc2.address, acc2.address, anyValue)

        await network.provider.send("evm_revert", [snapshotId])


        await ESE.connect(acc2).approve(eesee.address, 1)
        let first = eesee.interface.encodeFunctionData('buyTickets', [[currentLotID], [1], acc2.address, '0x']);
        let second = eesee.interface.encodeFunctionData('receiveAssets', [[currentLotID], signer.address]);
        await expect(eesee.connect(acc2).multicall([first, second]))
            .to.emit(eesee, "BuyTickets")
            .withArgs(currentLotID, acc2.address, 0, 1, 1, 0)
            .to.emit(eesee, "ReceiveAsset")
            .withArgs(currentLotID, acc2.address, signer.address, anyValue)


        assert.equal(await NFT.ownerOf(1), signer.address, "owner is correct")

        assert.equal((await eesee1inch.getLotWinner(currentLotID)).winner, acc2.address, "winner is chosen")
        assert.equal((await eesee1inch.getLotWinner(currentLotID)).isAssetWinner, true)

        lot = await eesee.lots(currentLotID)
        assert.equal(lot.buyout, true, "buyout is correct")

        await expect(eesee.connect(acc2).reclaimTokens([currentLotID], acc2.address)).to.be.revertedWithCustomError(eesee, "LotAlreadyFulfilled").withArgs(currentLotID)
        await expect(eesee.reclaimAssets([currentLotID], signer.address)).to.be.revertedWithCustomError(eesee, "LotAlreadyFulfilled").withArgs(currentLotID)

        await expect(eesee.connect(signer).receiveAssets([currentLotID], signer.address)).to.be.revertedWithCustomError(eesee, "CallerNotWinner").withArgs(currentLotID)
        await expect(eesee.connect(acc2).receiveAssets([currentLotID], acc2.address)).to.be.revertedWithCustomError(eesee, "AssetAlreadyClaimed").withArgs(currentLotID)

        await expect(eesee.connect(acc2).receiveTokens([currentLotID], signer.address)).to.be.revertedWithCustomError(eesee, "CallerNotOwner").withArgs(currentLotID)
        await expect(eesee.connect(signer).receiveTokens([currentLotID], signer.address))
        .to.emit(eesee, "ReceiveTokens")
        .withArgs(currentLotID, signer.address, signer.address, anyValue)

        lot = await eesee.lots(currentLotID)
        assert.equal(lot.owner, zeroAddress, "lot is deleted")



        currentLotID = (await eesee.getLotsLength()).toNumber()
        await eesee.connect(signer).createLots(
            [{token: ESE.address, tokenID: 0, amount: 1, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 1, 
                ticketPrice: 1, 
                duration: 86400, 
                owner: signer.address, 
                signer: signer.address,
                signatureData:'0x'
            }],
            fee
        )

        const snapshotId2 = await network.provider.send('evm_snapshot')

        await ESE.connect(acc2).approve(eesee.address, 1)
        await eesee.connect(acc2).buyTickets([currentLotID], [1], acc2.address, '0x')

        lot = await eesee.lots(currentLotID)
        assert.equal(lot.buyout, true, "buyout is correct")

        assert.equal((await eesee1inch.getLotWinner(currentLotID)).winner, acc2.address, "winner is chosen")
        assert.equal((await eesee1inch.getLotWinner(currentLotID)).isAssetWinner, false)

        await expect(eesee.connect(acc2).reclaimTokens([currentLotID], acc2.address)).to.be.revertedWithCustomError(eesee, "LotAlreadyFulfilled").withArgs(currentLotID)
        await expect(eesee.reclaimAssets([currentLotID], signer.address)).to.be.revertedWithCustomError(eesee, "LotAlreadyFulfilled").withArgs(currentLotID)

        await expect(eesee.connect(signer).receiveAssets([currentLotID], signer.address)).to.be.revertedWithCustomError(eesee, "CallerNotWinner").withArgs(currentLotID)
        await expect(eesee.connect(acc2).receiveAssets([currentLotID], acc2.address)).to.be.revertedWithCustomError(eesee, "InvalidAsset")

        await expect(eesee.connect(signer).receiveTokens([currentLotID], signer.address)).to.be.revertedWithCustomError(eesee, "CallerNotWinner").withArgs(currentLotID)
        await expect(eesee.connect(acc2).receiveTokens([currentLotID], signer.address))
        .to.emit(eesee, "ReceiveTokens")
        .withArgs(currentLotID, acc2.address, signer.address, 1)

        lot = await eesee.lots(currentLotID)
        assert.equal(lot.owner, zeroAddress, "lot is deleted")
        

        await network.provider.send("evm_revert", [snapshotId2])


        const balanceBefore = await ESE.balanceOf(signer.address)
        await ESE.connect(acc2).approve(eesee.address, 1)

        first = eesee.interface.encodeFunctionData('buyTickets', [[currentLotID], [1], acc2.address, '0x']);
        second = eesee.interface.encodeFunctionData('receiveTokens', [[currentLotID], signer.address]);
        await expect(eesee.connect(acc2).multicall([first, second]))
        .to.emit(eesee, "BuyTickets")
        .withArgs(currentLotID, acc2.address, 0, 1, 1, 0)
        .to.emit(eesee, "ReceiveTokens")
        .withArgs(currentLotID, acc2.address, signer.address, 1)
        const balanceAfter = await ESE.balanceOf(signer.address)

        assert.equal(balanceAfter.sub(balanceBefore), 1, "balance is correct")

        lot = await eesee.lots(currentLotID)
        assert.equal(lot.owner, zeroAddress, "lot is deleted")

        await expect(eesee.connect(acc2).reclaimTokens([currentLotID], acc2.address)).to.be.revertedWithCustomError(eesee, "LotNotExists").withArgs(currentLotID)
        await expect(eesee.reclaimAssets([currentLotID], signer.address)).to.be.revertedWithCustomError(eesee, "LotNotExists").withArgs(currentLotID)


        await NFT.approve(eesee.address, 1)
        const currentLotID1 = (await eesee.getLotsLength()).toNumber()
        await eesee.connect(signer).createLots(
            [{token: NFT.address, tokenID: 1, amount: 1, assetType: 0, data:'0x'}], 
            [{totalTickets: 1, ticketPrice: 1, duration: 86400, owner: signer.address, signer: signer.address, signatureData: '0x'}],
            fee
        )

        const currentLotID2 = (await eesee.getLotsLength()).toNumber()
        await eesee.connect(signer).createLots(
            [{token: ESE.address, tokenID: 0, amount: 2000000000, assetType: 4, data:'0x'}],
            [{ 
                totalTickets: 100, 
                ticketPrice: 20000000, 
                duration: 86400, 
                owner: signer.address, 
                signer: signer.address,
                signatureData:'0x'
            }],
            fee
        )

        lot = await eesee.lots(currentLotID2)
        const winningsAmount = lot.ticketPrice.mul(lot.totalTickets)
        const denominator = ethers.BigNumber.from('10000')
        const feeAmount = winningsAmount.mul(lot.fee).div(denominator)
        const totalWonTokensAmount = winningsAmount.sub(feeAmount)

        const swapInterface = new ethers.utils.Interface([
            'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint amount, uint minReturnAmount, uint flags) desc, bytes permit, bytes data)'
        ])
        const swapData = swapInterface.encodeFunctionData('swap', [
            mock1InchExecutorWETH.address, 
            {
                srcToken: ESE.address,
                dstToken: mainnetAddresses.WETH,
                srcReceiver: mock1InchExecutorWETH.address,
                dstReceiver: swap.address, 
                amount: totalWonTokensAmount,
                minReturnAmount: 100,
                flags: 0,
            }, 
            '0x00',
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ])

        first = eesee.interface.encodeFunctionData('buyTickets', [[currentLotID1, currentLotID2], [1, 100], acc2.address, '0x']);
        second = eesee.interface.encodeFunctionData('receiveAssets', [[currentLotID1], signer.address]);
        third = eesee.interface.encodeFunctionData('receiveTokens', [[currentLotID2], swap.address]);
        swapCalldata = swap.interface.encodeFunctionData('swapTokensForAssets', [{
            swapData: swapData, 
            marketplaceRoutersData: [{
                router: openseaRouter.address,
                data: ethers.utils.defaultAbiCoder.encode([basicOrderType], [basicOrderParameters])
            }]
            },
            acc2.address
        ]);
        forth = eesee.interface.encodeFunctionData('callExternal', [swap.address, swapCalldata]);
        fourth = eesee.interface.encodeFunctionData('receiveAssets', [[currentLotID2], signer.address]);

        await ESE.connect(acc2).approve(eesee.address, '9999999999999999')
        await expect(eesee.connect(acc2).multicall([first, second, third, forth]))
            .to.emit(eesee, "BuyTickets")
            .withArgs(currentLotID1, acc2.address, 0, 1, 1, 0)
            .and.to.emit(eesee, "BuyTickets")
            .withArgs(currentLotID2, acc2.address, 0, 100, winningsAmount, 25)
            .to.emit(eesee, "ReceiveAsset")
            .withArgs(currentLotID1, acc2.address, signer.address, anyValue)
            .to.emit(eesee, "ReceiveTokens")
            .withArgs(currentLotID2, acc2.address, swap.address, totalWonTokensAmount)
            .to.emit(swap, "ReceiveAsset")
            .withArgs(anyValue, basicOrderParameters.considerationToken, '510000000000000', acc2.address)



        let _nonce = nonce
        const currentLotID3 = (await eesee.getLotsLength()).toNumber()
        const _lot = await createLot(ESE.address, 0, lotParams.totalTickets * lotParams.ticketPrice, 4, '0x',lotParams.totalTickets,lotParams.ticketPrice,lotParams.duration,signer.address,10000000000, signer)
        first = eesee.interface.encodeFunctionData('createLotsAndBuyTickets', [
            [{token: ESE.address, tokenID: 0, amount: lotParams.totalTickets * lotParams.ticketPrice, assetType: 4, data:'0x'}],
            [{
                totalTickets: lotParams.totalTickets,
                ticketPrice: lotParams.ticketPrice,
                duration: lotParams.duration,
                owner: signer.address,
                signer: _lot.signer,
                signatureData: _lot.signatureData
            }],
            fee, 
            [lotParams.totalTickets], 
            acc2.address, 
            '0x'
        ]); 
        second = eesee.interface.encodeFunctionData('receiveTokens', [[currentLotID3], acc2.address]);
        
        const _winningsAmount = ethers.BigNumber.from(lotParams.ticketPrice.toString()).mul(ethers.BigNumber.from(lotParams.totalTickets.toString()))
        const _feeAmount = _winningsAmount.mul(lot.fee).div(denominator)
        const _totalWonTokensAmount = _winningsAmount.sub(_feeAmount)

        await expect(eesee.connect(acc2).multicall([first, second]))
        .and.to.emit(eesee, "CreateLot").withArgs(currentLotID3, anyValue, _lot.signer, signer.address, lotParams.totalTickets, lotParams.ticketPrice, anyValue)
        .and.to.emit(eesee, 'BuyTickets').withArgs(currentLotID3, acc2.address, 0, lotParams.totalTickets, lotParams.ticketPrice * lotParams.totalTickets, Math.floor((lotParams.totalTickets*0.25)))
        .and.to.emit(eesee, "ConsumeNonce").withArgs(currentLotID3, signer.address, _nonce)
        .and.to.emit(eesee, "ReceiveTokens").withArgs(currentLotID3, acc2.address, acc2.address, _totalWonTokensAmount)
    }
    })

    it('Reverts constructor', async () => {
        const _eeseeSwap = await hre.ethers.getContractFactory("EeseeSwap");
        await expect(_eeseeSwap.deploy(zeroAddress, mock1InchRouter.address, accessManager.address)).to.be.revertedWithCustomError(swap, "InvalidConstructor")
        await expect(_eeseeSwap.deploy(ESE.address, zeroAddress, accessManager.address)).to.be.revertedWithCustomError(swap, "InvalidConstructor")
        await expect(_eeseeSwap.deploy(ESE.address, mock1InchRouter.address, zeroAddress)).to.be.revertedWithCustomError(swap, "InvalidConstructor")

        const _EeseePeriphery = await hre.ethers.getContractFactory("EeseePeriphery");
        await expect(_EeseePeriphery.deploy(zeroAddress, oneAddress, oneAddress, accessManager.address, zeroAddress)).to.be.revertedWithCustomError(swap, "InvalidConstructor")
        await expect(_EeseePeriphery.deploy(eesee.address, zeroAddress, oneAddress, accessManager.address, zeroAddress)).to.be.revertedWithCustomError(swap, "InvalidConstructor")
        await expect(_EeseePeriphery.deploy(eesee.address, oneAddress, zeroAddress, accessManager.address, zeroAddress)).to.be.revertedWithCustomError(swap, "InvalidConstructor")
        await expect(_EeseePeriphery.deploy(eesee.address, oneAddress, oneAddress, zeroAddress, zeroAddress)).to.be.revertedWithCustomError(swap, "InvalidConstructor")
    })
})
