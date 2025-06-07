// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UPCInvest.sol";

contract UPCInvestFactory {
    // Owner of the factory
    address public owner;
    
    // Mapping to track all deployed UPCInvestment contracts
    mapping(string => address) public upcToContract;
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
        require(upcToContract[_upc] == address(0), "UPC already exists");
        
        UPCInvest newInvestment = new UPCInvest(_upc);
        address newAddress = address(newInvestment);
        
        upcToContract[_upc] = newAddress;
        allUPCs.push(_upc);
        
        emit UPCInvestmentCreated(_upc, newAddress, msg.sender, block.timestamp);
        
        return newAddress;
    }
    
    /**
     * @dev Gets all deployed UPCInvestment contracts
     * @return Array of UPC strings and their corresponding contract addresses
     */
    function getAllInvestments() external view returns (string[] memory, address[] memory) {
        address[] memory addresses = new address[](allUPCs.length);
        
        for (uint256 i = 0; i < allUPCs.length; i++) {
            addresses[i] = upcToContract[allUPCs[i]];
        }
        
        return (allUPCs, addresses);
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
