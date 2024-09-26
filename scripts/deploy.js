const { ethers } = require("hardhat");

/**
 * Deploys the MyToken contract to the network.
 *
 * @async
 * @function main
 */
async function main() {
  // Get the account that's deploying the contract
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory
  const MyToken = await ethers.getContractFactory("MyToken");
  console.log("Deploying MyToken contract...");
  const myToken = await MyToken.deploy();

  // Wait for the contract to be deployed
  const addr = await myToken.getAddress();

  console.log("MyToken contract deployed to:", addr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
