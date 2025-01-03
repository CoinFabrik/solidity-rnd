import { ForeToken } from "@/ForeToken";
import { ForeVesting } from "@/ForeVesting";
import { FakeContract, smock } from "@defi-wonderland/smock";
import { MockContract } from "@defi-wonderland/smock/dist/src/types";
import { ContractReceipt } from "@ethersproject/contracts/src.ts/index";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import {
    assertIsAvailableOnlyForOwner,
    deployContract,
    deployMockedContract,
    timetravel,
    txExec,
} from "./helpers/utils";

describe("Fore ERC20 token vesting", function () {
    let owner: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;

    let foreToken: MockContract<ForeToken>;
    let contract: ForeVesting;

    let blockTimestamp: number;

    beforeEach(async () => {
        [owner, alice, bob] = await ethers.getSigners();

        foreToken = await deployMockedContract("ForeToken");
        contract = await deployContract("ForeVesting", foreToken.address);

        const previousBlock = await ethers.provider.getBlock("latest");
        blockTimestamp = previousBlock.timestamp;
    });

    describe("Initial values", () => {
        it("Should return zero slots", async () => {
            expect(await contract.slotsOf(alice.address)).to.equal(0);
        });

        it("Should return empty vesting info", async () => {
            expect(await contract.vestingInfo(alice.address, 0)).to.eql([
                BigNumber.from(0),
                BigNumber.from(0),
                BigNumber.from(0),
                BigNumber.from(0),
                BigNumber.from(0),
            ]);
        });

        it("Should return zero amount available to claim", async () => {
            expect(await contract.available(alice.address, 0)).to.equal(0);
        });

        it("Should revert with VestingNotFound error", async () => {
            await expect(
                contract.connect(alice).withdraw(0)
            ).to.be.revertedWith("VestingNotFound()");
        });
    });

    it("Should revert without required allowance", async () => {
        foreToken.allowance.returns(0);
        foreToken.balanceOf.returns(ethers.utils.parseEther("10"));

        const amount = ethers.utils.parseEther("10");

        await expect(
            contract
                .connect(owner)
                .addVestingEntries(
                    [alice.address],
                    [amount],
                    [blockTimestamp + 10000],
                    [blockTimestamp + 50000],
                    [0]
                )
        ).to.be.revertedWith(`InsufficientBalanceOrAllowance(${amount})`);
    });

    describe("with spending allowance", () => {
        beforeEach(async () => {
            await txExec(
                foreToken
                    .connect(owner)
                    .approve(contract.address, ethers.utils.parseEther("100"))
            );
        });

        it("Should revert without required balance", async () => {
            foreToken.balanceOf.returns(0);

            const amount = ethers.utils.parseEther("10");

            await expect(
                contract
                    .connect(owner)
                    .addVestingEntries(
                        [alice.address],
                        [amount],
                        [blockTimestamp + 10000],
                        [blockTimestamp + 50000],
                        [0]
                    )
            ).to.be.revertedWith(`InsufficientBalanceOrAllowance(${amount})`);
        });

        describe("Adding vesting informations", () => {
            it("Should allow to execute only by owner", async () => {
                await assertIsAvailableOnlyForOwner(async (account) => {
                    return contract
                        .connect(account)
                        .addVestingEntries(
                            [alice.address],
                            [ethers.utils.parseEther("10")],
                            [blockTimestamp + 10000],
                            [blockTimestamp + 50000],
                            [0]
                        );
                });
            });

            it("Should fail with wrongly prepared arrays", async () => {
                await expect(
                    contract
                        .connect(owner)
                        .addVestingEntries(
                            [alice.address, bob.address],
                            [ethers.utils.parseEther("10")],
                            [blockTimestamp + 10000],
                            [blockTimestamp + 50000],
                            [0]
                        )
                ).to.be.revertedWith("ArrayLengthsMismatch(2)");
            });

            describe("successfully", () => {
                let tx: ContractTransaction;
                let recipt: ContractReceipt;

                beforeEach(async () => {
                    [tx, recipt] = await txExec(
                        contract
                            .connect(owner)
                            .addVestingEntries(
                                [alice.address, bob.address, alice.address],
                                [
                                    ethers.utils.parseEther("10"),
                                    ethers.utils.parseEther("20"),
                                    ethers.utils.parseEther("5"),
                                ],
                                [
                                    blockTimestamp + 10000,
                                    blockTimestamp + 10000,
                                    blockTimestamp + 20000,
                                ],
                                [
                                    blockTimestamp + 50000,
                                    blockTimestamp + 50000,
                                    blockTimestamp + 100000,
                                ],
                                [0, ethers.utils.parseEther("5"), 0]
                            )
                    );
                });

                it("Should request tokens transfer", async () => {
                    expect(foreToken.transferFrom.getCall(0).args).to.be.eql([
                        owner.address,
                        contract.address,
                        ethers.utils.parseEther("35"),
                    ]);
                });

                it("Should emit Transfer event", async () => {
                    await expect(tx)
                        .to.emit(foreToken, "Transfer")
                        .withArgs(
                            owner.address,
                            contract.address,
                            ethers.utils.parseEther("35")
                        );
                });

                it("Should return proper slots info", async () => {
                    expect(await contract.slotsOf(alice.address)).to.be.equal(
                        2
                    );
                    expect(await contract.slotsOf(bob.address)).to.be.equal(1);
                });

                it("Should return proper vesting info", async () => {
                    expect(await contract.vestingInfo(alice.address, 1)).to.eql(
                        [
                            ethers.utils.parseEther("5"),
                            BigNumber.from(0),
                            BigNumber.from(0),
                            BigNumber.from(blockTimestamp + 20000),
                            BigNumber.from(blockTimestamp + 100000),
                        ]
                    );
                    expect(await contract.vestingInfo(bob.address, 0)).to.eql([
                        ethers.utils.parseEther("20"),
                        BigNumber.from(0),
                        ethers.utils.parseEther("5"),
                        BigNumber.from(blockTimestamp + 10000),
                        BigNumber.from(blockTimestamp + 50000),
                    ]);
                });

                it("Should return proper amount available to claim", async () => {
                    expect(await contract.available(alice.address, 0)).to.equal(
                        0
                    );
                    expect(await contract.available(bob.address, 0)).to.equal(
                        0
                    );
                });
            });
        });
    });

    describe("with vesting prepared", () => {
        beforeEach(async () => {
            await txExec(
                foreToken
                    .connect(owner)
                    .approve(contract.address, ethers.utils.parseEther("100"))
            );

            await txExec(
                contract
                    .connect(owner)
                    .addVestingEntries(
                        [alice.address, bob.address, alice.address],
                        [
                            ethers.utils.parseEther("10"),
                            ethers.utils.parseEther("20"),
                            ethers.utils.parseEther("5"),
                        ],
                        [
                            blockTimestamp + 10000,
                            blockTimestamp + 10000,
                            blockTimestamp + 20000,
                        ],
                        [
                            blockTimestamp + 50000,
                            blockTimestamp + 50000,
                            blockTimestamp + 100000,
                        ],
                        [0, ethers.utils.parseEther("5"), 0]
                    )
            );
        });

        describe("before vesting started", () => {
            it("Should revert with VestingNotStartedYet error", async () => {
                await expect(
                    contract.connect(alice).withdraw(0)
                ).to.be.revertedWith("VestingNotStartedYet()");
            });
        });

        describe("directly after vesting started", () => {
            beforeEach(async () => {
                await timetravel(blockTimestamp + 10000);
            });

            it("Should return proper amount available to claim (initial unlock)", async () => {
                expect(await contract.available(alice.address, 0)).to.be.equal(
                    ethers.utils.parseEther("0")
                );
                expect(await contract.available(bob.address, 0)).to.be.equal(
                    ethers.utils.parseEther("5")
                );
            });

            it("Should return proper vesting info", async () => {
                expect(await contract.vestingInfo(bob.address, 0)).to.eql([
                    ethers.utils.parseEther("20"),
                    ethers.utils.parseEther("0"),
                    ethers.utils.parseEther("5"),
                    BigNumber.from(blockTimestamp + 10000),
                    BigNumber.from(blockTimestamp + 50000),
                ]);
            });

            describe("Withdraw initial vesting", () => {
                let tx: ContractTransaction;
                let recipt: ContractReceipt;

                beforeEach(async () => {
                    [tx, recipt] = await txExec(
                        contract.connect(bob).withdraw(0)
                    );
                });

                it("Should request tokens transfer", async () => {
                    expect(foreToken.transfer.getCall(0).args).to.be.eql([
                        bob.address,
                        ethers.utils.parseEther("5.000375"),
                    ]);
                });

                it("Should emit Transfer event", async () => {
                    await expect(tx)
                        .to.emit(foreToken, "Transfer")
                        .withArgs(
                            contract.address,
                            bob.address,
                            ethers.utils.parseEther("5.000375")
                        );
                });

                it("Should reduce remaining available to withdraw funds", async () => {
                    expect(
                        await contract.available(bob.address, 0)
                    ).to.be.equal(0);
                });

                it("Should return proper vesting info", async () => {
                    expect(await contract.vestingInfo(bob.address, 0)).to.eql([
                        ethers.utils.parseEther("20"),
                        ethers.utils.parseEther("5.000375"),
                        ethers.utils.parseEther("5"),
                        BigNumber.from(blockTimestamp + 10000),
                        BigNumber.from(blockTimestamp + 50000),
                    ]);
                });

                describe("after few moments", () => {
                    beforeEach(async () => {
                        await timetravel(blockTimestamp + 11001);
                    });

                    it("Should return proper amount available to claim", async () => {
                        expect(
                            await contract.available(alice.address, 0)
                        ).to.be.equal(ethers.utils.parseEther("0.25025"));
                        expect(
                            await contract.available(bob.address, 0)
                        ).to.be.equal(ethers.utils.parseEther("0.375"));
                    });

                    describe("Withdraw available amount", () => {
                        let tx: ContractTransaction;
                        let recipt: ContractReceipt;

                        beforeEach(async () => {
                            [tx, recipt] = await txExec(
                                contract.connect(bob).withdraw(0)
                            );
                        });

                        it("Should request tokens transfer", async () => {
                            expect(
                                foreToken.transfer.getCall(1).args
                            ).to.be.eql([
                                bob.address,
                                ethers.utils.parseEther("0.375375"),
                            ]);
                        });

                        it("Should emit Transfer event", async () => {
                            await expect(tx)
                                .to.emit(foreToken, "Transfer")
                                .withArgs(
                                    contract.address,
                                    bob.address,
                                    ethers.utils.parseEther("0.375375")
                                );
                        });

                        it("Should reduce remaining available to withdraw funds", async () => {
                            expect(
                                await contract.available(bob.address, 0)
                            ).to.be.equal(0);
                        });

                        it("Should return proper vesting info", async () => {
                            expect(
                                await contract.vestingInfo(bob.address, 0)
                            ).to.eql([
                                ethers.utils.parseEther("20"),
                                ethers.utils.parseEther("5.375750"),
                                ethers.utils.parseEther("5"),
                                BigNumber.from(blockTimestamp + 10000),
                                BigNumber.from(blockTimestamp + 50000),
                            ]);
                        });
                    });
                });
            });
        });

        describe("after vesting ended", () => {
            beforeEach(async () => {
                await timetravel(blockTimestamp + 100000);
            });

            it("Should return proper amount available to claim (initial unlock)", async () => {
                expect(await contract.available(alice.address, 0)).to.be.equal(
                    ethers.utils.parseEther("10")
                );
                expect(await contract.available(bob.address, 0)).to.be.equal(
                    ethers.utils.parseEther("20")
                );
            });

            describe("Withdraw all funds", () => {
                let tx: ContractTransaction;
                let recipt: ContractReceipt;

                beforeEach(async () => {
                    [tx, recipt] = await txExec(
                        contract.connect(bob).withdraw(0)
                    );
                });

                it("Should request tokens transfer", async () => {
                    expect(foreToken.transfer.getCall(0).args).to.be.eql([
                        bob.address,
                        ethers.utils.parseEther("20"),
                    ]);
                });

                it("Should emit Transfer event", async () => {
                    await expect(tx)
                        .to.emit(foreToken, "Transfer")
                        .withArgs(
                            contract.address,
                            bob.address,
                            ethers.utils.parseEther("20")
                        );
                });

                it("Should reduce remaining available to withdraw funds", async () => {
                    expect(
                        await contract.available(bob.address, 0)
                    ).to.be.equal(0);
                });

                it("Should return proper vesting info", async () => {
                    expect(await contract.vestingInfo(bob.address, 0)).to.eql([
                        ethers.utils.parseEther("20"),
                        ethers.utils.parseEther("20"),
                        ethers.utils.parseEther("5"),
                        BigNumber.from(blockTimestamp + 10000),
                        BigNumber.from(blockTimestamp + 50000),
                    ]);
                });
            });
        });

        describe("Adding next vesting informations", () => {
            let tx: ContractTransaction;
            let recipt: ContractReceipt;

            beforeEach(async () => {
                [tx, recipt] = await txExec(
                    contract
                        .connect(owner)
                        .addVestingEntries(
                            [alice.address],
                            [ethers.utils.parseEther("20")],
                            [blockTimestamp + 100000],
                            [blockTimestamp + 200000],
                            [0]
                        )
                );
            });

            it("Should request tokens transfer", async () => {
                expect(foreToken.transferFrom.getCall(1).args).to.be.eql([
                    owner.address,
                    contract.address,
                    ethers.utils.parseEther("20"),
                ]);
            });

            it("Should emit Transfer event", async () => {
                await expect(tx)
                    .to.emit(foreToken, "Transfer")
                    .withArgs(
                        owner.address,
                        contract.address,
                        ethers.utils.parseEther("20")
                    );
            });

            it("Should return proper slots info", async () => {
                expect(await contract.slotsOf(alice.address)).to.be.equal(3);
                expect(await contract.slotsOf(bob.address)).to.be.equal(1);
            });

            it("Should return proper vesting info", async () => {
                expect(await contract.vestingInfo(alice.address, 2)).to.eql([
                    ethers.utils.parseEther("20"),
                    BigNumber.from(0),
                    BigNumber.from(0),
                    BigNumber.from(blockTimestamp + 100000),
                    BigNumber.from(blockTimestamp + 200000),
                ]);
            });
        });
    });
});
