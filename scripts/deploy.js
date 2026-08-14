import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("====================================================");
  console.log(" Deploying The Praise Board (ThankYouWall)");
  console.log(" Deployer account (Ifeoma):", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(" Account balance:", hre.ethers.formatEther(balance), "ETH");
  console.log(" Network:", hre.network.name, "(chainId:", hre.network.config.chainId || 31337, ")");
  console.log("====================================================");

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
    contractAddress: contractAddress,
    deployedAddress: contractAddress,
    owner: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  // Save info to deployment-info.json
  fs.writeFileSync(path.join(process.cwd(), "deployment-info.json"), JSON.stringify(deploymentData, null, 2));
  fs.writeFileSync(path.join(process.cwd(), "deployed-address.json"), JSON.stringify(deploymentData, null, 2));
  fs.writeFileSync(path.join(process.cwd(), "deployed-address.txt"), contractAddress);

  // Save to src directory for frontend consumption
  const srcDir = path.join(process.cwd(), "src");
  if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });
  fs.writeFileSync(path.join(srcDir, "deployment-info.json"), JSON.stringify(deploymentData, null, 2));

  console.log(" Saved deployment details to metadata files.");
  return contractAddress;
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
