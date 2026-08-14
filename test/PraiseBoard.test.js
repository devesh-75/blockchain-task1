import { expect } from "chai";
import hre from "hardhat";

describe("PraiseBoard Contract - 10 Scored Test Cases", function () {
  let praiseBoard;
  let owner;
  let commuter1;
  let commuter2;
  let commuter3;

  beforeEach(async function () {
    [owner, commuter1, commuter2, commuter3] = await hre.ethers.getSigners();
    const PraiseBoard = await hre.ethers.getContractFactory("PraiseBoard");
    praiseBoard = await PraiseBoard.deploy();
    await praiseBoard.waitForDeployment();
  });

  it("Test Case 1: Deployer is set as contract owner (Ifeoma)", async function () {
    expect(await praiseBoard.owner()).to.equal(owner.address);
  });

  it("Test Case 2: Commuter can send ETH tip with a valid note", async function () {
    const tipAmount = hre.ethers.parseEther("0.05");
    const note = "Thank you Ifeoma! The 8:15 AM bus schedule update saved my morning.";

    const tx = await praiseBoard.connect(commuter1).tip(note, { value: tipAmount });
    await tx.wait();

    const contractBalance = await hre.ethers.provider.getBalance(await praiseBoard.getAddress());
    expect(contractBalance).to.equal(tipAmount);
    expect(await praiseBoard.getTipCount()).to.equal(1);
  });

  it("Test Case 3: Tip struct attributes (donor, amount, note, timestamp) are stored correctly", async function () {
    const tipAmount = hre.ethers.parseEther("0.02");
    const note = "Appreciate your dedication to keeping bus timetables accurate!";

    await praiseBoard.connect(commuter2).tip(note, { value: tipAmount });

    const tips = await praiseBoard.getTips();
    expect(tips.length).to.equal(1);
    expect(tips[0].donor).to.equal(commuter2.address);
    expect(tips[0].amount).to.equal(tipAmount);
    expect(tips[0].note).to.equal(note);
    expect(tips[0].timestamp).to.be.gt(0);
  });

  it("Test Case 4: Contract emits TipReceived event upon successful tip", async function () {
    const tipAmount = hre.ethers.parseEther("0.01");
    const note = "Keep up the great work!";

    await expect(praiseBoard.connect(commuter1).tip(note, { value: tipAmount }))
      .to.emit(praiseBoard, "TipReceived")
      .withArgs(commuter1.address, tipAmount, note, (timestamp) => timestamp > 0);
  });

  it("Test Case 5: Tipping with zero ETH reverts with InvalidAmount custom error", async function () {
    const note = "Zero eth tip attempt";
    await expect(
      praiseBoard.connect(commuter1).tip(note, { value: 0 })
    ).to.be.revertedWithCustomError(praiseBoard, "InvalidAmount");
  });

  it("Test Case 6: Tipping with empty note reverts with NoteEmpty custom error", async function () {
    const tipAmount = hre.ethers.parseEther("0.01");
    await expect(
      praiseBoard.connect(commuter1).tip("", { value: tipAmount })
    ).to.be.revertedWithCustomError(praiseBoard, "NoteEmpty");
  });

  it("Test Case 7: Tipping with note exceeding 280 characters reverts with NoteTooLong", async function () {
    const tipAmount = hre.ethers.parseEther("0.01");
    const superLongNote = "A".repeat(281);
    await expect(
      praiseBoard.connect(commuter1).tip(superLongNote, { value: tipAmount })
    ).to.be.revertedWithCustomError(praiseBoard, "NoteTooLong");
  });

  it("Test Case 8: Reading getTips(), getAllTips(), and getTipCount() aggregates multiple supporters", async function () {
    await praiseBoard.connect(commuter1).tip("Note 1", { value: hre.ethers.parseEther("0.01") });
    await praiseBoard.connect(commuter2).tip("Note 2", { value: hre.ethers.parseEther("0.02") });
    await praiseBoard.connect(commuter3).tip("Note 3", { value: hre.ethers.parseEther("0.03") });

    expect(await praiseBoard.getTipCount()).to.equal(3);
    const tips = await praiseBoard.getTips();
    const allTips = await praiseBoard.getAllTips();

    expect(tips.length).to.equal(3);
    expect(allTips.length).to.equal(3);
    expect(tips[0].donor).to.equal(commuter1.address);
    expect(tips[1].donor).to.equal(commuter2.address);
    expect(tips[2].donor).to.equal(commuter3.address);
  });

  it("Test Case 9: Owner (Ifeoma) can withdraw accumulated ETH balance and emit Withdrawn event", async function () {
    const tip1 = hre.ethers.parseEther("0.05");
    const tip2 = hre.ethers.parseEther("0.05");
    await praiseBoard.connect(commuter1).tip("Support 1", { value: tip1 });
    await praiseBoard.connect(commuter2).tip("Support 2", { value: tip2 });

    const totalBalance = tip1 + tip2;
    const ownerInitialBalance = await hre.ethers.provider.getBalance(owner.address);

    const tx = await praiseBoard.connect(owner).withdraw();
    const receipt = await tx.wait();
    const gasSpent = receipt.gasUsed * receipt.gasPrice;

    const ownerFinalBalance = await hre.ethers.provider.getBalance(owner.address);
    const contractFinalBalance = await hre.ethers.provider.getBalance(await praiseBoard.getAddress());

    expect(contractFinalBalance).to.equal(0);
    expect(ownerFinalBalance).to.equal(ownerInitialBalance + totalBalance - gasSpent);

    await expect(tx).to.emit(praiseBoard, "Withdrawn").withArgs(owner.address, totalBalance);
  });

  it("Test Case 10: Non-owner attempt to withdraw funds reverts with Unauthorized custom error", async function () {
    await praiseBoard.connect(commuter1).tip("Support", { value: hre.ethers.parseEther("0.05") });

    await expect(
      praiseBoard.connect(commuter1).withdraw()
    ).to.be.revertedWithCustomError(praiseBoard, "Unauthorized");
  });
});
