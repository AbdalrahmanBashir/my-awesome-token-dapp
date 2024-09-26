const { ethers } = require("hardhat");
async function main() {
  const contractAddress = "0x23A48ccb8287f4c7C4E930Bf73Ef7fd1F2E58EeF"; // Replace with the actual
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.attach(contractAddress);
  const [deployer, acc1, acc2] = await ethers.getSigners();
  // Get deployer's balance
  const deployerBalance = await myToken.balanceOf(deployer.address);
  console.log(
    "Deployer's balance:",
    ethers.utils.formatEther(deployerBalance),
    "MAT"
  );
  // Send tokens to acc1
  const tx = await myToken.transfer(
    acc1.address,
    ethers.utils.parseEther("100")
  );
  await tx.wait(); // Wait for the transaction to be mined
  // Get acc1's balance
  const acc1Balance = await myToken.balanceOf(acc1.address);
  console.log(
    "Account 1's balance:",
    ethers.utils.formatEther(acc1Balance),
    "MAT"
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
