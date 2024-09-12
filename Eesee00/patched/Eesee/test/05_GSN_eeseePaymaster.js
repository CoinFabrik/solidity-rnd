const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers, network } = require("hardhat");
  const assert = require("assert");
  const { getContractAddress } = require('@ethersproject/address')
  const { RelayProvider } = require('@opengsn/provider')
  const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers")
  const { GsnTestEnvironment } = require("@opengsn/dev")
  const createPermit = require('./utils/createPermit')
  const { keccak256 } = require('@ethersproject/keccak256')

  describe("eeseePaymaster", function () {
    if(network.name != 'testnet') return
    let ESE;
    let ERC20;
    let mockVRF;
    let eesee;
    let NFT;
    let signer, acc2, feeCollector;
    let _signer, _acc2, _feeCollector
    let ticketBuyers;
    let minter;
    let royaltyEninge;
    let staking
    let accessManager
    let signers
    let paymaster
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const oneAddress = "0x0000000000000000000000000000000000000001"
    let forwarderAddress
    let relayHub
    let nonce = 0
    let _signers
    let discount = 0
    let sender
    let eeseeRandom
    this.beforeAll(async() => {
      let env = await GsnTestEnvironment.startGsn('localhost');
      forwarderAddress = env.contractsDeployment.forwarderAddress
      relayHub = env.contractsDeployment.relayHubAddress

      const _AssetTransfer = await hre.ethers.getContractFactory("AssetTransfer");
      const assetTransfer = await _AssetTransfer.deploy()
      await assetTransfer.deployed()

      let rest
      [signer, acc2, feeCollector, ...rest] = await hre.ethers.getSigners()

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
      const _eeseeStaking = await hre.ethers.getContractFactory("EeseeStaking");
      const _eeseeAccessManager = await hre.ethers.getContractFactory("EeseeAccessManager");
      const _eeseePaymaster = await hre.ethers.getContractFactory("EeseePaymaster");
      const _eeseeProxy = await hre.ethers.getContractFactory("EeseeProxy");

      ESE = await _ESE.deploy([{
          cliff: 0,
          duration: 0,
          TGEMintShare: 10000,
          beneficiaries: [{addr: signer.address, amount: '2000000000000000000000000'}]
      }])
      await ESE.deployed()
      await ESE.addVestingBeneficiaries(0, [{addr: signer.address, amount: '2000000000000000000000000'}])
      await ESE.initialize(0)
        
      ERC20 = await _MockERC20.deploy('20000000000000000000000000000')
      await ERC20.deployed()

      accessManager = await _eeseeAccessManager.deploy();
      await accessManager.deployed()
      await accessManager.grantRole("0xe2f4eaae4a9751e85a3e4a7b9587827a877f29914755229b07a7b2da98285f70", feeCollector.address)
        
      mockVRF = await _mockVRF.deploy()
      await mockVRF.deployed()

      eeseeRandom = await _eeseeRandom.deploy(
        {
            vrfCoordinator: mockVRF.address,
            keyHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            minimumRequestConfirmations: 1,
            callbackGasLimit: 70000
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
        
      proxy = await _eeseeProxy.deploy();
      await proxy.deployed()

      staking = await _eeseeStaking.deploy(
        ESE.address, 
        [{volumeBreakpoint: 500, rewardRateFlexible: 500000, rewardRateLocked: 500000}], 
        accessManager.address,
        forwarderAddress
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
          forwarderAddress
      )
      await eesee.deployed()

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
      },4,signer.address)
      
      await NFT.connect(signer).approve(eesee.address, 1)
      await NFT.connect(signer).approve(eesee.address, 2)
      await NFT.connect(signer).approve(eesee.address, 3)
      await NFT.connect(signer).approve(eesee.address, 4)

      await ESE.connect(signer).transfer(acc2.address, '100000000000000000000')
      await ESE.connect(acc2).approve(eesee.address, '100000000000000000000')
      await ESE.connect(signer).approve(eesee.address, '100000000000000000000')

      paymaster = await _eeseePaymaster.deploy(
        ESE.address, 
        relayHub,
        forwarderAddress,
        accessManager.address
      )
      await paymaster.deployed()

      await paymaster.approveContract(eesee.address)
      await paymaster.approveContract(staking.address)
      //200000 - too high given: 319176 max allowed: 285252
      //210000 - cost too high 329200 max allowed: 285252
      await signer.sendTransaction({
        to: paymaster.address,
        value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
      }); 

      let gsnProvider = RelayProvider.newProvider({
          provider: hre.ethers.provider, 
          config: {
              chainId: 1,
              verbose: false,
              loggerConfiguration: { logLevel: 'error'},
              forwarderAddress,
              paymasterAddress: paymaster.address,
              auditorsCount: 0,
              performDryRunViewRelayCall: true,
              maxApprovalDataLength: 999
          }, 
          overrideDependencies:{ asyncApprovalData }
      })
      await gsnProvider.init()
              
      const accounts = []
      _signers = await hre.ethers.getSigners()
      for (let i = 0; i < _signers.length; i++) {
          accounts[i] = _signers[i].address
      }
      const etherProvider = new ethers.providers.Web3Provider(gsnProvider)

      signers = await Promise.all(accounts.map(async (val) => {
          const obj = await SignerWithAddress.create(etherProvider.getSigner(val))
          return obj
      }));
      [signer, acc2, feeCollector, ...rest] = signers;
      [_signer, _acc2, _feeCollector, ...rest] = _signers;
    })

    let deadline ='999999999999999999' 
    const asyncApprovalData = async function (relayRequest) {
      //gen price sig
      let priceQuote = 20000000000000
      const priceSig = await createPrice(_feeCollector, sender, priceQuote)

      //gen permit sig
      const fromAcc = _signers.filter(signer => signer.address.toLowerCase() === relayRequest.request.from.toLowerCase())[0]
      const permit = await createPermit(fromAcc, paymaster, '99999999999999999999999999999', '999999999999999999', ESE)

      const params_ = ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint256", "uint256", "uint8", "bytes32", "bytes32"],
        [fromAcc.address, paymaster.address, '99999999999999999999999999999', '999999999999999999', permit.v, permit.r, permit.s]
      );
      //Combine both values
      const params = ethers.utils.defaultAbiCoder.encode(["bytes", "bytes"], [priceSig, params_]);

      nonce += 1
      return Promise.resolve(params)
    }

    const createPrice = async (from, sender, priceQuote) => {
      const types = {
        Price: [
            {
              name: "sender",
              type: "address"
            },
            {
              name: "priceQuote",
              type: "uint256"
            },
            {
              name: "discount",
              type: "uint256"
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
      const eip712Domain = await paymaster.eip712Domain()
      const domain = {
          name: eip712Domain.name,
          version: eip712Domain.version,
          chainId: eip712Domain.chainId,
          verifyingContract: eip712Domain.verifyingContract
      }

      const values = { sender, priceQuote, discount, nonce, deadline }
      const signature = await from._signTypedData(domain, types, values)
      const sig = ethers.utils.splitSignature(signature)
      const params = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "uint256", "uint256", "uint8", "bytes32", "bytes32"],
        [sender, priceQuote, discount, deadline, sig.v, sig.r, sig.s]
      );

      return params
  }

  let lot_nonce = 0
  const createLot = async (token, tokenID, amount, assetType, data, totalTickets, ticketPrice, duration ,owner, deadline, _signer) => {
    const types = {
        Lot: [
              {
                name: "assetHash",
                type: "bytes32"
              },
            {
            name: "totalTickets",
            type: "uint96"
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

    const values = {assetHash: keccak256(assetEncoded), totalTickets,ticketPrice,duration,owner,nonce: lot_nonce,deadline}
    const signature = await _signer._signTypedData(domain, types, values)

    const signatureData = abi.encode(
        ["uint256", "uint256", "bytes"], 
        [nonce, deadline, signature]
    );
    const params = {signer: _signer.address, signatureData}
    lot_nonce += 1
    return params
  }


    const ID = '0'
    it('Pays for transaction with ESE', async () => {
      let fee = await eesee.fee()
      const balanceBefore = await ESE.balanceOf(signer.address)
      const balanceETHBefore = await hre.ethers.provider.getBalance(signer.address);

      sender = signer.address
      const _lot = await createLot(NFT.address, 1, 1, 0, '0x',2,2,86400,signer.address,10000000000, signer)
      const tx = await eesee.connect(signer).createLots(
        [{token: NFT.address, tokenID: 1, amount:1, assetType:0, data:'0x'}], 
        [{totalTickets: 2, ticketPrice: 2, duration: 86400, owner: signer.address, signer: _lot.signer, signatureData: _lot.signatureData}],
        fee
      )
      const receipt = await tx.wait()
      const timestamp = await time.latest();
      const args = receipt.events.filter((x)=>{ return x.event=='CreateLot' })[0].args
      assert.equal(args[0].toString(), ID, "ID is correct")
      assert.equal(args[2].toString(), _lot.signer, "signer is correct")
      assert.equal(args[3].toString(), signer.address, "signer is correct")
      assert.equal(args[4].toString(), '2', "max tickets is correct")
      assert.equal(args[5].toString(), '2', "ticket price is correct")
      assert.equal(args[6].toString(), (timestamp + 86400).toString(), "expiryTimestamp is correct")

      const balanceAfter = await ESE.balanceOf(signer.address)
      const balanceETHAfter = await hre.ethers.provider.getBalance(signer.address);

      assert.ok(balanceBefore.gt(balanceAfter), 'ESE balance changed')
      assert.equal(balanceETHBefore.toString(), balanceETHAfter.toString(), 'ETH balance not changed')

      const lot = await eesee.lots(ID);
      assert.equal(lot.owner, signer.address, "owner is correct")
    })

    it('Discounts for transaction with ESE', async () => {
      discount = '999999999999999999999999'

      const balanceBefore = await ESE.balanceOf(signer.address)
      const balanceETHBefore = await hre.ethers.provider.getBalance(signer.address);

      const tx = await eesee.connect(signer).buyTickets([ID], [1], signer.address, '0x')
      const receipt = await tx.wait()
      
      const args = receipt.events.filter((x)=>{ return x.event=='BuyTickets' })[0].args
      assert.equal(args[0].toString(), ID, "ID is correct")
      assert.equal(args[1].toString(), signer.address.toString(), "signer is correct")
      assert.equal(args[2].toString(), '0', "lowerBound is correct")
      assert.equal(args[3].toString(), '1', "ticketAmount is correct")
      assert.equal(args[4].toString(), '2', "tokensSpent is correct")

      const balanceAfter = await ESE.balanceOf(signer.address)
      const balanceETHAfter = await hre.ethers.provider.getBalance(signer.address);

      assert.equal(balanceBefore.sub(2).toString(), balanceAfter.toString(), 'ESE balance not changed')// 2 is payment for ticket
      assert.equal(balanceETHBefore.toString(), balanceETHAfter.toString(), 'ETH balance not changed')

      const lot = await eesee.lots(ID);
      assert.equal(lot.ticketsBought.toString(), 1, "ticketsBought is correct")
    })

    it('Reverts if wrong price params passed', async () => {
        nonce = 2
        try{
          await eesee.connect(acc2).buyTickets([ID], [1], acc2.address, '0x')
        }catch(err){
          const functionSelector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("InvalidSender()")).substring(0, 10)
          assert.ok(err.toString().includes(functionSelector), 'reverts with InvalidSender')
        }

        sender = acc2.address
        deadline = '1'
        nonce = 2
        try{
          await eesee.connect(acc2).buyTickets([ID], [1], acc2.address, '0x')
        }catch(err){
          const functionSelector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ExpiredDeadline()")).substring(0, 10)
          assert.ok(err.toString().includes(functionSelector), 'reverts with ExpiredDeadline')
        }

        let __feeCollector = _feeCollector
        deadline = '999999999999999999999'
        _feeCollector = acc2
        nonce = 2
        try{
          await eesee.connect(acc2).buyTickets([ID], [1], acc2.address, '0x')
        }catch(err){
          const functionSelector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("InvalidSignature()")).substring(0, 10)
          assert.ok(err.toString().includes(functionSelector), 'reverts with InvalidSignature')
        }

        _feeCollector = __feeCollector
        nonce = 3
        try{
          await eesee.connect(acc2).buyTickets([ID], [1], acc2.address, '0x')
        }catch(err){
          const functionSelector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("InvalidSignature()")).substring(0, 10)
          assert.ok(err.toString().includes(functionSelector), 'reverts with InvalidSignature')
        }

        await ESE.connect(_signer).approve(staking.address, '100000000000000000000')
        nonce = 2
        sender = signer.address
        const rewardID = await staking.rewardID()
        try{
          await staking.connect(signer).deposit(1, 0, rewardID, '0x')
        }catch(err){
          console.log(err)
          const functionSelector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("AddressNotApproved()")).substring(0, 10)
          assert.ok(err.toString().includes(functionSelector), 'reverts with AddressNotApproved')
        }
    })

    it('Admin functions', async () => {
        await expect(paymaster.connect(_acc2).withdrawTokens(_signer.address)).to.be.revertedWithCustomError(paymaster, "CallerNotAuthorized")
        const balanceBefore = await ESE.balanceOf(signer.address)
        await expect(paymaster.connect(_signer).withdrawTokens(_signer.address)).to.emit(paymaster, "Withdrawn").withArgs(_signer.address, anyValue)
        const balanceAfter = await ESE.balanceOf(signer.address)

        assert.ok(balanceAfter.gt(balanceBefore), 'ESE balance changed')
    })
});
