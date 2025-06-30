// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Popit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PopitFactory is Ownable {
    address[] public deployedPopits;
    address public flipTokenAddress = 0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118;
    uint256 public creationPrice = 500 * (10**18); // 500 FLIP tokens (assuming 18 decimals)
    
    event PopitCreated(address indexed creator, address indexed popitAddress);
    
    constructor() Ownable(msg.sender) {
        // No need to set flipTokenAddress in constructor since it has a default value
    }
    
    function createPopit() public returns (address) {
        // Transfer FLIP tokens from creator to owner
        IERC20 flipToken = IERC20(flipTokenAddress);
        require(
            flipToken.transferFrom(msg.sender, owner(), creationPrice),
            "FLIP token transfer failed"
        );
        
        // Deploy new Popit instance
        Popit newPopit = new Popit();
        newPopit.setFlipToken(flipTokenAddress);  // Changed from setPayToken to setFlipToken
        newPopit.transferOwnership(msg.sender);
        
        deployedPopits.push(address(newPopit));
        
        emit PopitCreated(msg.sender, address(newPopit));
        
        return address(newPopit);
    }
    
    function getDeployedPopits() public view returns (address[] memory) {
        return deployedPopits;
    }
    
    function getPopitsByOwner(address owner) public view returns (address[] memory) {
        address[] memory ownedPopits = new address[](deployedPopits.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < deployedPopits.length; i++) {
            Popit popit = Popit(deployedPopits[i]);
            if (popit.owner() == owner) {
                ownedPopits[count] = deployedPopits[i];
                count++;
            }
        }
        
        // Resize array to remove empty slots
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = ownedPopits[i];
        }
        
        return result;
    }
    
    function setCreationPrice(uint256 newPrice) public onlyOwner {
        creationPrice = newPrice;
    }
    
    function setFlipTokenAddress(address newAddress) public onlyOwner {
        flipTokenAddress = newAddress;
    }
    
    function getCreationPrice() public view returns (uint256) {
        return creationPrice;
    }
}
