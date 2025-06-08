// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UPCInvest.sol";

contract UPCInvestFactory {
    // Owner of the factory
    address public owner;
    
    // Mapping to track all deployed UPCInvestment contracts for each UPC
    mapping(string => address[]) public upcToContracts;
    
    // Mapping to track contracts created by each user
    mapping(address => address[]) public userToContracts;
    
    // Array to track all UPCs that have contracts
    string[] public allUPCs;
    
    // Event emitted when a new UPCInvestment is created
    event UPCInvestmentCreated(
        string upc,
        address contractAddress,
        address creator,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Creates a new UPCInvestment contract
     * @param _upc The Universal Product Code for this investment
     * @return The address of the newly created contract
     */
    function createUPCInvestment(string memory _upc) external returns (address) {
        UPCInvest newInvestment = new UPCInvest(_upc);
        address newAddress = address(newInvestment);
        
        // Transfer ownership to the creator
        newInvestment.transferOwnership(msg.sender);
        
        // Add to UPC mapping
        upcToContracts[_upc].push(newAddress);
        
        // Add to user mapping
        userToContracts[msg.sender].push(newAddress);
        
        // Check if this is the first contract for this UPC
        if (upcToContracts[_upc].length == 1) {
            allUPCs.push(_upc);
        }
        
        emit UPCInvestmentCreated(_upc, newAddress, msg.sender, block.timestamp);
        
        return newAddress;
    }
    
    /**
     * @dev Gets all deployed UPCInvestment contracts
     * @return Array of UPC strings and arrays of their corresponding contract addresses
     */
    function getAllInvestments() external view returns (string[] memory, address[][] memory) {
        address[][] memory allAddresses = new address[][](allUPCs.length);
        
        for (uint256 i = 0; i < allUPCs.length; i++) {
            allAddresses[i] = upcToContracts[allUPCs[i]];
        }
        
        return (allUPCs, allAddresses);
    }
    
    /**
     * @dev Gets all contracts for a specific UPC
     * @param _upc The UPC to look up
     * @return Array of contract addresses for the given UPC
     */
    function getContractsForUPC(string memory _upc) external view returns (address[] memory) {
        return upcToContracts[_upc];
    }
    
    /**
     * @dev Gets all contracts created by a specific user
     * @param _user The user address to look up
     * @return Array of contract addresses created by the user
     */
    function getContractsByUser(address _user) external view returns (address[] memory) {
        return userToContracts[_user];
    }
    
    /**
     * @dev Gets all contracts created by the message sender
     * @return Array of contract addresses created by the sender
     */
    function getMyContracts() external view returns (address[] memory) {
        return userToContracts[msg.sender];
    }
    
    /**
     * @dev Transfers ownership of the factory
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
