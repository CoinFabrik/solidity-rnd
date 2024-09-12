const { expect } = require("chai");
const {ethers} = require('ethers')
const { describe, it, beforeEach } = require("mocha");
// console.log(ethers.getContractFactory("Manilla"))

describe("Manilla Token Contract", function () {
  let Manilla, manilla, owner, addr1, addr2;

  beforeEach(async function () {
    Manilla = await ethers.getContractFactory("Manilla");
    [owner, addr1, addr2] = await ethers.getSigners();
    manilla = await Manilla.deploy("Manilla Token", "MNLA", ethers.utils.parseEther("1000000000"), owner.address);
    await manilla.deployed();
  });

  it("Should have correct name, symbol, and decimals", async function () {
    expect(await manilla.name()).to.equal("Manilla Token");
    expect(await manilla.symbol()).to.equal("MNLA");
    expect(await manilla.decimals()).to.equal(18);
  });

  it("Should mint initial supply to owner", async function () {
    const ownerBalance = await manilla.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.utils.parseEther("1000000000"));
  });

  it("Should transfer tokens between accounts", async function () {
    await manilla.transfer(addr1.address, ethers.utils.parseEther("100"));
    const addr1Balance = await manilla.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(ethers.utils.parseEther("100"));

    await manilla.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("50"));
    const addr2Balance = await manilla.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(ethers.utils.parseEther("50"));
  });

  it("Should approve and transferFrom tokens", async function () {
    await manilla.approve(addr1.address, ethers.utils.parseEther("100"));
    const allowance = await manilla.allowance(owner.address, addr1.address);
    expect(allowance).to.equal(ethers.utils.parseEther("100"));

    await manilla.connect(addr1).transferFrom(owner.address, addr2.address, ethers.utils.parseEther("50"));
    const addr2Balance = await manilla.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(ethers.utils.parseEther("50"));
  });

  it("Should increase and decrease allowance", async function () {
    await manilla.approve(addr1.address, ethers.utils.parseEther("100"));
    await manilla.increaseAllowance(addr1.address, ethers.utils.parseEther("50"));
    let updatedAllowance = await manilla.allowance(owner.address, addr1.address);
    expect(updatedAllowance).to.equal(ethers.utils.parseEther("150"));

    await manilla.decreaseAllowance(addr1.address, ethers.utils.parseEther("50"));
    updatedAllowance = await manilla.allowance(owner.address, addr1.address);
    expect(updatedAllowance).to.equal(ethers.utils.parseEther("100"));
  });

  it("Should not allow transferring more than balance", async function () {
    await expect(manilla.transfer(addr1.address, ethers.utils.parseEther("1000000001"))).to.be.revertedWith(
      "ERC20: transfer amount exceeds balance"
    );
  });

  it("Should not allow transferring from insufficient allowance", async function () {
    await manilla.approve(addr1.address, ethers.utils.parseEther("100"));
    await expect(manilla.connect(addr1).transferFrom(owner.address, addr2.address, ethers.utils.parseEther("101"))).to.be.revertedWith(
      "ERC20: insufficient allowance"
    );
  });

  // Add more test cases as needed

});
