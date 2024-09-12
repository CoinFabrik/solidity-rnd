const { expect } = require("chai");
const { ethers } = require("hardhat");
const { promiseHandler } = require("../utilities/promise-handler");
const { HOUR, SECOND } = require("../utilities/time-constants");
const { parseCustomError } = require("../utilities/parse-custom-error");

function getRevertMessage(errorMessage) {
  return `VM Exception while processing transaction: revert ${errorMessage}`;
}

describe("DeedzCoin", () => {
  let owner;
  let user1;
  let user2;
  let user3;

  let deedzCoin;

  before(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];
    user3 = accounts[3];
    const DeedzCoin = await ethers.getContractFactory("DeedzCoin");
    deedzCoin = await DeedzCoin.deploy(user1.address);
    await deedzCoin.waitForDeployment();
  });

  it("should have correct owner", async () => {
    const ownerAddress = await deedzCoin.owner();
    expect(ownerAddress).to.equal(owner.address);
  });

  it("should have correct initial supply", async () => {
    const totalSupply = await deedzCoin.totalSupply();
    const expectedSupply = ethers.parseUnits("500000000", "ether");
    expect(totalSupply).to.equal(expectedSupply);
  });

  it("should transfer tokens successfully", async () => {
    const amount = ethers.parseUnits("100", "ether");

    await deedzCoin.connect(user1).transfer(user2.address, amount);
    await deedzCoin.connect(user1).transfer(user3.address, amount);
    const balance = await deedzCoin.balanceOf(user2.address);

    expect(balance).to.equal(amount);
  });

  it("should only allow supplier to transfer with lock", async () => {
    const reason = ethers.encodeBytes32String("Lock reason");
    const amount = ethers.parseUnits("50", "ether");
    const time = HOUR; // 1 hour

    const promise1 = deedzCoin
      .connect(owner)
      .transferWithLock(owner.address, reason, amount, time);
    const [result1, error1] = await promiseHandler(promise1);
    const parsedCustomError1 = parseCustomError(deedzCoin, error1);

    expect(parsedCustomError1.name).to.be.equals("NotSupplier");
    const promise2 = deedzCoin
      .connect(user2)
      .transferWithLock(user2.address, reason, amount, time);
    const [result2, error2] = await promiseHandler(promise2);
    const parsedCustomError2 = parseCustomError(deedzCoin, error2);

    expect(parsedCustomError2.name).to.be.equals("NotSupplier");
    const promise3 = deedzCoin
      .connect(user3)
      .transferWithLock(user3.address, reason, amount, time);
    const [result3, error3] = await promiseHandler(promise3);
    const parsedCustomError3 = parseCustomError(deedzCoin, error3);

    expect(parsedCustomError3.name).to.be.equals("NotSupplier");
  });

  it("should not transfer tokens with lock to zero address", async () => {
    const reason = ethers.encodeBytes32String("Lock reason");
    const amount = ethers.parseUnits("50", "ether");
    const time = HOUR; // 1 hour

    const promise = deedzCoin
      .connect(user1)
      .transferWithLock(ethers.ZeroAddress, reason, amount, time);
    const [result, error] = await promiseHandler(promise);
    const parsedCustomError = parseCustomError(deedzCoin, error);

    expect(parsedCustomError.name).to.be.equals(
      "Invalid_TransferToZeroAddress"
    );
  });

  it("should transfer tokens with lock successfully", async () => {
    const reason = ethers.encodeBytes32String("Lock reason");
    const amount = ethers.parseUnits("50", "ether");
    const time = HOUR; // 1 hour

    await deedzCoin
      .connect(user1)
      .transferWithLock(user2.address, reason, amount, time);
    const lockedAmount = await deedzCoin.tokensLocked(user2.address, reason);

    expect(lockedAmount).to.equal(amount);
  });

  it("should not transfer tokens with lock with same reason", async () => {
    const reason = ethers.encodeBytes32String("Lock reason");
    const amount = ethers.parseUnits("50", "ether");
    const time = HOUR; // 1 hour

    const promise = deedzCoin
      .connect(user1)
      .transferWithLock(user2.address, reason, amount, time);
    const [result, error] = await promiseHandler(promise);
    const parsedCustomError = parseCustomError(deedzCoin, error);

    expect(parsedCustomError.name).to.be.equals("Invalid_TokensAlreadyLocked");
  });

  it("should not transfer with lock zero token", async () => {
    const reason = ethers.encodeBytes32String("Lock reason 2");
    const zeroAmount = ethers.parseUnits("0", "ether");
    const time = HOUR; // 1 hour

    const promise = deedzCoin
      .connect(user1)
      .transferWithLock(user2.address, reason, zeroAmount, time);
    const [result, error] = await promiseHandler(promise);
    const parsedCustomError = parseCustomError(deedzCoin, error);

    expect(parsedCustomError.name).to.be.equals("Invalid_TransferAmountZero");
  });

  it("should unlock tokens successfully", async () => {
    await ethers.provider.send("evm_increaseTime", [HOUR]);
    await ethers.provider.send("evm_mine");
    const reason = ethers.encodeBytes32String("Lock reason");
    const zeroAmount = ethers.parseUnits("0", "ether");
    const amountBeforeUnlock = await deedzCoin.tokensUnlockable(
      user2.address,
      reason
    );
    const expectedAmount = ethers.parseUnits("50", "ether");
    await deedzCoin.connect(user2).unlock(user2.address);
    const amountAfterUnlock = await deedzCoin.tokensUnlockable(
      user2.address,
      reason
    );
    expect(amountBeforeUnlock).to.equal(expectedAmount);
    expect(amountAfterUnlock).to.equal(zeroAmount);
  });

  it("should unlock zero tokens successfully", async () => {
    const amountBeforeUnlock = await deedzCoin.balanceOf(user2.address);
    await deedzCoin.connect(user2).unlock(user2.address);
    const amountAfterUnlock = await deedzCoin.balanceOf(user2.address);
    const expectedAmount = ethers.parseUnits("100", "ether");
    expect(amountBeforeUnlock).to.equal(expectedAmount);
    expect(amountAfterUnlock).to.equal(expectedAmount);
  });

  it("should have correct balance for user2", async () => {
    const amount = ethers.parseUnits("100", "ether");
    const balance = await deedzCoin.balanceOf(user2.address);
    expect(balance).to.equal(amount);
  });

  it("should not allow to extend lock duration by any one other than supplier", async () => {
    const reason = ethers.encodeBytes32String("Lock reason");
    const time = HOUR; // 1 hour

    const promise1 = deedzCoin
      .connect(owner)
      .extendLock(user2.address, reason, time);
    const [result1, error1] = await promiseHandler(promise1);
    const parsedCustomError1 = parseCustomError(deedzCoin, error1);

    expect(parsedCustomError1.name).to.be.equals("NotSupplier");

    const promise2 = deedzCoin
      .connect(user2)
      .extendLock(user2.address, reason, time);
    const [result2, error2] = await promiseHandler(promise2);
    const parsedCustomError2 = parseCustomError(deedzCoin, error2);

    expect(parsedCustomError2.name).to.be.equals("NotSupplier");

    const promise3 = deedzCoin
      .connect(user3)
      .extendLock(user2.address, reason, time);
    const [result3, error3] = await promiseHandler(promise3);
    const parsedCustomError3 = parseCustomError(deedzCoin, error3);

    expect(parsedCustomError3.name).to.be.equals("NotSupplier");
  });

  it("should extend lock duration successfully", async () => {
    const reason = ethers.encodeBytes32String("Lock reason");
    const amount = ethers.parseUnits("50", "ether");
    const time = HOUR; // 1 hour

    await deedzCoin
      .connect(user1)
      .transferWithLock(user2.address, reason, amount, time);

    const oldLock = await deedzCoin
      .connect(user2)
      .locked(user2.address, reason);

    await deedzCoin.connect(user1).extendLock(user2.address, reason, time);

    const newLock = await deedzCoin
      .connect(user2)
      .locked(user2.address, reason);
    expect(newLock.validity).to.above(oldLock.validity);
  });

  it("should not extend lock duration for wrong reason", async () => {
    const reason = ethers.encodeBytes32String("wrong Lock reason");
    const time = HOUR; // 1 hour
    const promise = deedzCoin
      .connect(user1)
      .extendLock(user2.address, reason, time);
    const [result, error] = await promiseHandler(promise);
    const parsedCustomError = parseCustomError(deedzCoin, error);

    expect(parsedCustomError.name).to.be.equals("Invalid_TokensNotLocked");
  });

  it("should not allow to increase lock amount by any one other than supplier", async () => {
    const reason = ethers.encodeBytes32String("Lock reason");
    const amount = ethers.parseUnits("50", "ether");

    const promise1 = deedzCoin
      .connect(owner)
      .increaseLockAmount(user2.address, reason, amount);
    const [result1, error1] = await promiseHandler(promise1);
    const parsedCustomError1 = parseCustomError(deedzCoin, error1);

    expect(parsedCustomError1.name).to.be.equals("NotSupplier");

    const promise2 = deedzCoin
      .connect(user2)
      .increaseLockAmount(user2.address, reason, amount);
    const [result2, error2] = await promiseHandler(promise2);
    const parsedCustomError2 = parseCustomError(deedzCoin, error2);

    expect(parsedCustomError2.name).to.be.equals("NotSupplier");

    const promise3 = deedzCoin
      .connect(user3)
      .increaseLockAmount(user2.address, reason, amount);
    const [result3, error3] = await promiseHandler(promise3);
    const parsedCustomError3 = parseCustomError(deedzCoin, error3);

    expect(parsedCustomError3.name).to.be.equals("NotSupplier");
  });

  it("should increase lock amount successfully", async () => {
    const reason = ethers.encodeBytes32String("Lock reason");
    const amount = ethers.parseUnits("50", "ether");

    const oldLock = await deedzCoin
      .connect(user2)
      .locked(user2.address, reason);

    await deedzCoin
      .connect(user1)
      .increaseLockAmount(user2.address, reason, amount);

    const newLock = await deedzCoin
      .connect(user2)
      .locked(user2.address, reason);

    expect(newLock.amount).to.above(oldLock.amount);
  });

  it("should not increase lock amount for wrong reason", async () => {
    const reason = ethers.encodeBytes32String("wrong Lock reason");
    const amount = ethers.parseUnits("50", "ether");

    const promise = deedzCoin
      .connect(user1)
      .increaseLockAmount(user2.address, reason, amount);
    const [result, error] = await promiseHandler(promise);
    const parsedCustomError = parseCustomError(deedzCoin, error);

    expect(parsedCustomError.name).to.be.equals("Invalid_TokensNotLocked");
  });

  it("should show tokens locked at time", async () => {
    const reason = ethers.encodeBytes32String("Lock reason");
    const time = HOUR;
    const lockedToken = await deedzCoin
      .connect(user2)
      .tokensLockedAtTime(user2.address, reason, time);

    const expectedLockedAmount = ethers.parseUnits("100", "ether");
    expect(lockedToken).to.equal(expectedLockedAmount);
  });

  it("should now show tokens locked at wrong time", async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const blockTimestamp = block.timestamp;

    const reason = ethers.encodeBytes32String("Lock reason");
    const time = blockTimestamp + HOUR * 10;
    const lockedToken = await deedzCoin
      .connect(user2)
      .tokensLockedAtTime(user2.address, reason, time);

    const expectedLockedAmount = ethers.parseUnits("0", "ether");
    expect(lockedToken).to.equal(expectedLockedAmount);
  });

  it("should show total balance of user2", async () => {
    const user2ActiveBalance = await deedzCoin
      .connect(user2)
      .balanceOf(user2.address);
    const expectedActiveBalance = ethers.parseUnits("100", "ether");
    const user2TotalBalance = await deedzCoin
      .connect(user2)
      .totalBalanceOf(user2.address);
    const expectedTotalBalance = ethers.parseUnits("200", "ether");
    expect(user2ActiveBalance).to.equal(expectedActiveBalance);
    expect(user2TotalBalance).to.equal(expectedTotalBalance);
  });

  it("should allow only owner to change supplier", async () => {
    const [result1, error1] = await promiseHandler(
      deedzCoin.connect(user1).transferSupplierRole(user1.address)
    );
    const [result2, error2] = await promiseHandler(
      deedzCoin.connect(user2).transferSupplierRole(user2.address)
    );
    const [result3, error3] = await promiseHandler(
      deedzCoin.connect(user3).transferSupplierRole(user3.address)
    );
    expect(error1.message).to.be.equal(
      getRevertMessage("Ownable: caller is not the owner")
    );
    expect(error2.message).to.be.equal(
      getRevertMessage("Ownable: caller is not the owner")
    );
    expect(error3.message).to.be.equal(
      getRevertMessage("Ownable: caller is not the owner")
    );
  });

  it("should not transfer supplier role to zero address", async () => {
    const promise = deedzCoin
      .connect(owner)
      .transferSupplierRole(ethers.ZeroAddress);
    const [result, error] = await promiseHandler(promise);
    const parsedCustomError = parseCustomError(deedzCoin, error);

    expect(parsedCustomError.name).to.be.equals("Invalid_SupplierZeroAddress");
  });

  it("should give old supplier", async () => {
    const oldSupplier = await deedzCoin.supplier();
    expect(oldSupplier).to.equal(user1.address);
  });

  it("should show old supplier balance", async () => {
    const oldSupplier = await deedzCoin.supplier();
    const oldSupplierBalanceBeforeTransfer = await deedzCoin.balanceOf(
      oldSupplier
    );

    const expectedOldSupplierBalance = ethers.parseUnits("499999650", "ether");
    expect(oldSupplierBalanceBeforeTransfer).to.equal(
      expectedOldSupplierBalance
    );
  });

  it("should show new supplier balance before transfer", async () => {
    const newSupplierBalanceBeforeTransfer = await deedzCoin.balanceOf(
      user3.address
    );
    const expectedNewSupplierBalance = ethers.parseUnits("100", "ether");
    expect(newSupplierBalanceBeforeTransfer).to.equal(
      expectedNewSupplierBalance
    );
  });

  it("should transfer supplier", async () => {
    const oldSupplier = await deedzCoin.supplier();

    await deedzCoin.connect(owner).transferSupplierRole(user3.address);

    const newSupplier = await deedzCoin.supplier();

    expect(oldSupplier).to.equal(user1.address);
    expect(newSupplier).to.equal(user3.address);
  });

  it("should give new supplier", async () => {
    const newSupplier = await deedzCoin.supplier();
    expect(newSupplier).to.equal(user3.address);
  });

  it("should show new supplier balance", async () => {
    const newSupplier = await deedzCoin.supplier();
    const newSupplierBalanceAfterTransfer = await deedzCoin.balanceOf(
      newSupplier
    );
    const newSupplierExpectedBalance = ethers.parseUnits("499999750", "ether");
    expect(newSupplierBalanceAfterTransfer).to.equal(
      newSupplierExpectedBalance
    );
  });

  it("should show old supplier balance after transfer", async () => {
    const oldSupplierBalanceAfterTransfer = await deedzCoin.balanceOf(
      user1.address
    );
    const oldSupplierExpectedBalance = ethers.parseUnits("0", "ether");
    expect(oldSupplierBalanceAfterTransfer).to.equal(
      oldSupplierExpectedBalance
    );
  });

  // ActualTIme

  it("should only allow supplier to transfer with lock at actual time", async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const blockTimestamp = block.timestamp;

    const reason = ethers.encodeBytes32String("Lock reason 3");
    const amount = ethers.parseUnits("50", "ether");
    const time = blockTimestamp + HOUR; // 1 hour

    const promise1 = deedzCoin
      .connect(owner)
      .transferWithLockActualTime(owner.address, reason, amount, time);
    const [result1, error1] = await promiseHandler(promise1);
    const parsedCustomError1 = parseCustomError(deedzCoin, error1);

    expect(parsedCustomError1.name).to.be.equals("NotSupplier");

    const promise2 = deedzCoin
      .connect(user1)
      .transferWithLockActualTime(user1.address, reason, amount, time);
    const [result2, error2] = await promiseHandler(promise2);
    const parsedCustomError2 = parseCustomError(deedzCoin, error2);

    expect(parsedCustomError2.name).to.be.equals("NotSupplier");

    const promise3 = deedzCoin
      .connect(user2)
      .transferWithLockActualTime(user2.address, reason, amount, time);
    const [result3, error3] = await promiseHandler(promise3);
    const parsedCustomError3 = parseCustomError(deedzCoin, error3);

    expect(parsedCustomError3.name).to.be.equals("NotSupplier");
  });

  it("should not transfer tokens with lock at actual time to zero address", async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const blockTimestamp = block.timestamp;

    const reason = ethers.encodeBytes32String("Lock reason 3");
    const amount = ethers.parseUnits("50", "ether");
    const time = blockTimestamp + HOUR; // 1 hour
    const promise = deedzCoin
      .connect(user3)
      .transferWithLockActualTime(ethers.ZeroAddress, reason, amount, time);
    const [result, error] = await promiseHandler(promise);
    const parsedCustomError = parseCustomError(deedzCoin, error);

    expect(parsedCustomError.name).to.be.equals(
      "Invalid_TransferToZeroAddress"
    );
  });

  it("should transfer tokens with lock at actual time successfully", async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const blockTimestamp = block.timestamp;

    const reason = ethers.encodeBytes32String("Lock reason 3");
    const amount = ethers.parseUnits("50", "ether");
    const time = blockTimestamp + HOUR; // 1 hour

    await deedzCoin
      .connect(user3)
      .transferWithLockActualTime(user1.address, reason, amount, time);
    const lockedAmount = await deedzCoin.tokensLocked(user1.address, reason);

    expect(lockedAmount).to.equal(amount);
  });

  it("should not transfer tokens with lock at actual time with same reason", async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const blockTimestamp = block.timestamp;

    const reason = ethers.encodeBytes32String("Lock reason 3");
    const amount = ethers.parseUnits("50", "ether");
    const time = blockTimestamp + HOUR; // 1 hour

    const promise = deedzCoin
      .connect(user3)
      .transferWithLockActualTime(user1.address, reason, amount, time);
    const [result, error] = await promiseHandler(promise);
    const parsedCustomError = parseCustomError(deedzCoin, error);

    expect(parsedCustomError.name).to.be.equals("Invalid_TokensAlreadyLocked");
  });

  it("should not transfer with lock at actual time zero token", async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const blockTimestamp = block.timestamp;

    const reason = ethers.encodeBytes32String("Lock reason 4");
    const zeroAmount = ethers.parseUnits("0", "ether");
    const time = blockTimestamp + HOUR; // 1 hour

    const promise = deedzCoin
      .connect(user3)
      .transferWithLockActualTime(user1.address, reason, zeroAmount, time);
    const [result, error] = await promiseHandler(promise);
    const parsedCustomError = parseCustomError(deedzCoin, error);

    expect(parsedCustomError.name).to.be.equals("Invalid_TransferAmountZero");
  });

  it("should not transfer with lock at actual time with time in the past", async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const blockTimestamp = block.timestamp;

    const reason = ethers.encodeBytes32String("Lock reason 4");
    const zeroAmount = ethers.parseUnits("0", "ether");
    const time = blockTimestamp - HOUR; // 1 hour

    const promise = deedzCoin
      .connect(user3)
      .transferWithLockActualTime(user1.address, reason, zeroAmount, time);
    const [result, error] = await promiseHandler(promise);
    const parsedCustomError = parseCustomError(deedzCoin, error);

    expect(parsedCustomError.name).to.be.equals(
      "Invalid_TransferTimeInThePast"
    );
  });

  it("it should get unlockable token", async () => {
    const unlockableTokensBeforeActualTime = await deedzCoin
      .connect(user1)
      .getUnlockableTokens(user1.address);
    const zeroAmount = ethers.parseUnits("0", "ether");
    await ethers.provider.send("evm_increaseTime", [HOUR]);
    await ethers.provider.send("evm_mine");
    const unlockableTokensAfterActualTime = await deedzCoin
      .connect(user1)
      .getUnlockableTokens(user1.address);
    const expectedAmount = ethers.parseUnits("50", "ether");
    expect(unlockableTokensBeforeActualTime).to.be.equal(zeroAmount);
    expect(unlockableTokensAfterActualTime).to.be.equal(expectedAmount);
  });
});
