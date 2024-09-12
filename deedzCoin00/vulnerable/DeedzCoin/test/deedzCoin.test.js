const DeedzCoin = artifacts.require("DeedzCoin");

contract("DeedzCoin", (accounts) => {
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];

  let deedzCoin;

  before(async () => {
    deedzCoin = await DeedzCoin.new(user1);
  });

  it("should have correct initial supply", async () => {
    const totalSupply = await deedzCoin.totalSupply();
    assert.equal(totalSupply, "500000000000000000000000000");
  });

  it("should transfer tokens successfully", async () => {
    const amount = web3.utils.toWei("100", "ether");
    await deedzCoin.transfer(user2, amount, { from: user1 });

    await deedzCoin.transfer(user3, amount, { from: user1 });

    const balance = await deedzCoin.balanceOf(user2);
    assert.equal(balance, amount);
  });

  it("should lock tokens successfully", async () => {
    const reason = web3.utils.fromAscii("Lock reason");
    const amount = web3.utils.toWei("50", "ether");
    const time = 3600; // 1 hour

    await deedzCoin.lock(reason, amount, time, { from: user2 });

    const lockedAmount = await deedzCoin.tokensLocked(user2, reason);
    assert.equal(lockedAmount, amount);
  });

  it("should not allow locking already locked tokens", async () => {
    const reason = web3.utils.fromAscii("Lock reason");
    const amount = web3.utils.toWei("50", "ether");
    const time = 3600; // 1 hour

    try {
      await deedzCoin.lock(reason, amount, time, { from: user2 });
      assert.fail("Exception not thrown");
    } catch (error) {
      assert(
        error.message.includes("Tokens already locked"),
        "Unexpected error message"
      );
    }
  });

  it("should unlock tokens successfully", async () => {
    const reason = web3.utils.fromAscii("Lock reason");

    await deedzCoin.unlock(user2, { from: user2 });

    const unlockedAmount = await deedzCoin.tokensUnlockable(user2, reason);
    assert.equal(unlockedAmount, 0);
  });

  it("should extend lock duration successfully", async () => {
    const reason = web3.utils.fromAscii("Lock reason");
    const time = 3600; // 1 hour

    await deedzCoin.extendLock(reason, time, { from: user2 });

    // Check if lock duration has been extended
    // ... (assertion code)
  });

  // Add more test cases as needed

  it("should give supplier address", async () => {
    assert.equal(await deedzCoin.supplier(), user1);
  });
  it("should give supplier balance", async () => {
    const balance = await deedzCoin.balanceOf(user1);
    assert.equal(balance, web3.utils.toWei("499999800", "ether"));
  });
  it("should give old supplier", async () => {
    const oldSupplier = await deedzCoin.supplier();
    assert.equal(oldSupplier, user1);
  });
  it("should show old supplier balance", async () => {
    const oldSupplier = await deedzCoin.supplier();
    const oldSupplierBalanceBeforeTransfer = await deedzCoin.balanceOf(
      oldSupplier
    );
    assert.equal(
      oldSupplierBalanceBeforeTransfer,
      web3.utils.toWei("499999800", "ether")
    );
  });
  it("should show new supplier balance before transfer", async () => {
    const oldSupplierBalanceAfterTransfer = await deedzCoin.balanceOf(user3);
    assert.equal(
      oldSupplierBalanceAfterTransfer,
      web3.utils.toWei("100", "ether")
    );
  });
  it("should transfer supplier", async () => {
    const oldSupplier = await deedzCoin.supplier();

    await deedzCoin.transferSupplierRole(user3, { from: owner });

    const newSupplier = await deedzCoin.supplier();

    assert.equal(oldSupplier, user1);
    assert.equal(newSupplier, user3);
  });
  it("should give new supplier", async () => {
    const newSupplier = await deedzCoin.supplier();
    assert.equal(newSupplier, user3);
  });
  it("should show new supplier balance", async () => {
    const newSupplier = await deedzCoin.supplier();
    const newSupplierBalanceAfterTransfer = await deedzCoin.balanceOf(
      newSupplier
    );
    assert.equal(
      newSupplierBalanceAfterTransfer,
      web3.utils.toWei("499999900", "ether")
    );
  });
  it("should show old supplier balance after transfer", async () => {
    const oldSupplierBalanceAfterTransfer = await deedzCoin.balanceOf(user1);
    assert.equal(
      oldSupplierBalanceAfterTransfer,
      web3.utils.toWei("0", "ether")
    );
  });
});
