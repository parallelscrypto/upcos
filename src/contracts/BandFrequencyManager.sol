// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Flip.sol";

contract BandFrequencyManager {
    address public owner;
    
    struct Frequency {
        address bandFrequency;
        uint256 timestamp;
    }

    mapping(address => address) public userBandFrequencies;
    Frequency[] public globalFrequencies;

    event BandFrequencySet(address indexed user, address indexed bandFrequency);
    event GlobalFrequencyAdded(address indexed bandFrequency, uint256 timestamp);
    Flip private _token;
    uint256 public currentBandPrice;

    constructor () {
        owner = payable(msg.sender);
        _token = Flip(0x544E9675DBA14Cfd286545231007eAe84C4bBF45);
        currentBandPrice = 500 ether; // Set the initial price
    }    

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner can perform this operation");
        _;
    }

    function setBandFrequency(address bandFrequency) public {
        userBandFrequencies[msg.sender] = bandFrequency;
        emit BandFrequencySet(msg.sender, bandFrequency);
    }

    function getUserBandFrequency(address user) public view returns (address) {
        return userBandFrequencies[user];
    }

    function addGlobalFrequency(address bandFrequency) public onlyOwner {
        _token.transferFrom(msg.sender, address(this), currentBandPrice);
        _token.burn(currentBandPrice);

        Frequency memory newFrequency;
        newFrequency.bandFrequency = bandFrequency;
        newFrequency.timestamp = block.timestamp;
        globalFrequencies.push(newFrequency);
        emit GlobalFrequencyAdded(bandFrequency, newFrequency.timestamp);
    }

    function listGlobalFrequencies() public view returns (Frequency[] memory) {
        return globalFrequencies;
    }

    function setBandPrice(uint256 newPrice) public onlyOwner {
        currentBandPrice = newPrice;
    }
}
