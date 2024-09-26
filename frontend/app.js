const contractAddress = "0x23A48ccb8287f4c7C4E930Bf73Ef7fd1F2E58EeF"; // Replace with the actual contract address
const contractABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function totalSupply() view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

let provider;
let signer;
let contract;

async function connectMetaMask() {
  if (window.ethereum) {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      const account = await signer.getAddress();
      document.getElementById("account").value = account;
      getBalance(account);
      getTotalSupply();
    } catch (error) {
      console.error(
        "User denied account access or there was an issue with MetaMask",
        error
      );
    }
  } else {
    alert("Please install MetaMask to use this DApp!");
  }
}

async function getBalance(account) {
  const balance = await contract.balanceOf(account);
  document.getElementById("balance").value = ethers.utils.formatEther(balance);
}

async function getTotalSupply() {
  const totalSupply = await contract.totalSupply();
  document.getElementById("totalSupply").value =
    ethers.utils.formatEther(totalSupply);
}

function displayTransactionDetails(tx, section) {
  const txDetails = `
    <p><strong>Transaction Hash:</strong> ${tx.hash}</p>
    <p><strong>Block Number:</strong> ${
      tx.blockNumber ? tx.blockNumber : "Pending"
    }</p>
    <p><strong>Gas Price:</strong> ${ethers.utils.formatUnits(
      tx.gasPrice,
      "gwei"
    )} Gwei</p>
  `;
  const transactionDetailsDiv = document.getElementById(section);
  transactionDetailsDiv.innerHTML = txDetails;
  transactionDetailsDiv.classList.remove("hidden");
}

async function transferTokens() {
  const recipient = document.getElementById("recipient").value;
  const amount = document.getElementById("amount").value;

  if (!recipient || !amount) {
    alert("Please fill in both recipient and amount fields.");
    return;
  }

  const amountInWei = ethers.utils.parseEther(amount);
  try {
    const tx = await contract.transfer(recipient, amountInWei);
    displayTransactionDetails(tx, "transfer-details");
    await tx.wait();
    getBalance(await signer.getAddress());
  } catch (error) {
    console.error("Transaction failed", error);
  }
}

async function approveTokens() {
  const spender = document.getElementById("spender").value;
  const amount = document.getElementById("approveAmount").value;

  if (!spender || !amount) {
    alert("Please fill in both spender and amount fields.");
    return;
  }

  const amountInWei = ethers.utils.parseEther(amount);
  try {
    const tx = await contract.approve(spender, amountInWei);
    displayTransactionDetails(tx, "approve-details");
    await tx.wait();
  } catch (error) {
    console.error("Approval failed", error);
  }
}

async function checkAllowance() {
  const owner = document.getElementById("ownerAddress").value;
  const spender = document.getElementById("spenderCheck").value;

  if (!owner || !spender) {
    alert("Please fill in both owner and spender fields.");
    return;
  }

  try {
    const allowance = await contract.allowance(owner, spender);
    alert(`Allowance: ${ethers.utils.formatEther(allowance)} tokens`);
  } catch (error) {
    console.error("Error checking allowance", error);
  }
}

document
  .getElementById("transferBtn")
  .addEventListener("click", transferTokens);
document.getElementById("approveBtn").addEventListener("click", approveTokens);
document
  .getElementById("allowanceBtn")
  .addEventListener("click", checkAllowance);

connectMetaMask();
