const contractAddress = "0x95F51fE3470A94483eb9DEd66F3AD546A9BF6f2d"; // Replace with your actual contract address
const contractABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function totalSupply() view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount) returns (bool)", // Include mint function
];

let provider;
let signer;
let contract;

// Ensure DOM is fully loaded before adding event listeners
window.addEventListener("DOMContentLoaded", function () {
  // MetaMask connection
  document
    .getElementById("connect-btn")
    .addEventListener("click", connectMetaMask);

  // Token transfer
  document
    .getElementById("transferBtn")
    .addEventListener("click", transferTokens);

  // Token approval
  document
    .getElementById("approveBtn")
    .addEventListener("click", approveTokens);

  // Check allowance
  document
    .getElementById("allowanceBtn")
    .addEventListener("click", checkAllowance);

  // Mint tokens
  document.getElementById("mintButton").addEventListener("click", mintTokens);
});

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
      alert(
        "User denied account access or there was an issue with MetaMask" + error
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
  const statusElement = document.getElementById("approve-status"); // Add an element to display status

  // Clear previous status
  statusElement.innerText = "";

  if (!spender || !amount) {
    alert("Please fill in both spender and amount fields.");
    return;
  }

  const amountInWei = ethers.utils.parseEther(amount);

  try {
    // Display that approval is in progress
    statusElement.innerText = "Approval in progress...";

    const tx = await contract.approve(spender, amountInWei);

    // Wait for the transaction to be mined
    await tx.wait();

    // Display success status
    statusElement.innerText = `Successfully approved ${amount} tokens for ${spender}`;
    //displayTransactionDetails(tx, "approve-details");
  } catch (error) {
    // If the approval fails, display an error status
    console.error("Approval failed", error);
    statusElement.innerText =
      "Approval failed. Only the contract owner can approve tokens.";
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

// Mint new tokens
async function mintTokens() {
  const recipient = document.getElementById("mintAddress").value;
  const amount = document.getElementById("mintAmount").value;
  const statusElement = document.getElementById("mint-status");

  // Clear previous status
  statusElement.innerText = "";

  if (!recipient || !amount) {
    alert("Please provide both recipient address and amount.");
    statusElement.innerText =
      "Please provide both recipient address and amount.";
    return;
  }

  // Update status to indicate minting process has started
  statusElement.innerText = "Minting in progress...";

  try {
    // Mint tokens, ensuring correct decimals are parsed
    const tx = await contract.mint(
      recipient,
      ethers.utils.parseUnits(amount, 18)
    );
    await tx.wait(); // Wait for the transaction to be mined
    statusElement.innerText = `Successfully minted ${amount} tokens to ${recipient}`;
  } catch (error) {
    console.error("Error minting tokens:", error);
    statusElement.innerText =
      "Minting failed. Only the contract owner can mint tokens.";
  }
}
