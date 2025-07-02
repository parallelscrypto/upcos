// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Popit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PopitFactory is Ownable {
    address[] public deployedPopits;
    address public flipTokenAddress = 0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118;
    uint256 public creationPrice = 500 * (10**18);
    
    event PopitCreated(address indexed creator, address indexed popitAddress, string name, string symbol);
    
    constructor() Ownable(msg.sender) {}

    function createPopit(string memory name, string memory symbol) public returns (address) {
        IERC20 flipToken = IERC20(flipTokenAddress);
        require(
            flipToken.transferFrom(msg.sender, owner(), creationPrice),
            "FLIP token transfer failed"
        );
        
        Popit newPopit = new Popit(name, symbol);
        newPopit.setFlipToken(flipTokenAddress);
        newPopit.transferOwnership(msg.sender);
        
        deployedPopits.push(address(newPopit));
        
        emit PopitCreated(msg.sender, address(newPopit), name, symbol);
        
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
