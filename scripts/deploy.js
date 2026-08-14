import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("----------------------------------------------------");
  console.log(" Deploying PraiseBoard Smart Contract");
  console.log(" Deployer account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(" Account balance:", hre.ethers.formatEther(balance), "ETH");
  console.log(" Network:", hre.network.name, "(chainId:", hre.network.config.chainId || 31337, ")");
  console.log("----------------------------------------------------");

  const PraiseBoard = await hre.ethers.getContractFactory("PraiseBoard");
  const praiseBoard = await PraiseBoard.deploy();
  await praiseBoard.waitForDeployment();

  const contractAddress = await praiseBoard.getAddress();
  console.log(" SUCCESS! PraiseBoard deployed to:", contractAddress);
  console.log(" Contract Owner (Ifeoma):", await praiseBoard.owner());

  const deploymentData = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    address: contractAddress,
    owner: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  // Save info to root and src for frontend access
  const infoPath = path.join(process.cwd(), "deployment-info.json");
  fs.writeFileSync(infoPath, JSON.stringify(deploymentData, null, 2));
  console.log(" Saved deployment details to deployment-info.json");

  const srcInfoPath = path.join(process.cwd(), "src", "deployment-info.json");
  if (!fs.existsSync(path.dirname(srcInfoPath))) {
    fs.mkdirSync(path.dirname(srcInfoPath), { recursive: true });
  }
  fs.writeFileSync(srcInfoPath, JSON.stringify(deploymentData, null, 2));

  return contractAddress;
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
