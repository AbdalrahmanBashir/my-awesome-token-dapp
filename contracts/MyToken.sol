// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyAwesomeToken", "MAT") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    // Restrict mint function to only the contract owner
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Override approve function to restrict approval to only the contract owner
    function approve(address spender, uint256 amount) public override onlyOwner returns (bool) {
        return super.approve(spender, amount); // Call the parent contract's approve function
    }
}