// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";

import "./MyData.sol";

contract OpenFederation {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Define the struct with three fields
    struct MyStruct {
        uint id;
        string  name;
        string  link;
        address owner;
    }
    MyData    private _token;
    address payable private  bank;
    uint256  public latestTokenId;


    uint structCount = 0;

    // Create a mapping from uint to the struct
    mapping(uint => MyStruct) public structs;


    // Define the modifier
    modifier checkPayToken() {
        require(msg.sender == bank, "Action can only be performed by the owner");
        _;
    }

    // Define the modifier
    modifier onlyOwner(uint id) {
        address owner = structs[id].owner;
        require(msg.sender == owner, "Action can only be performed by the owner");
        _;
    }

    constructor()  {
        bank = payable(msg.sender);
    }



    function setPayToken(address  addy) external checkPayToken {
        _token = MyData(addy);
    }


    function setName(uint _id, string memory _name) public onlyOwner(_id){
        structs[_id].name = _name;
    }

    function setLink(uint _id, string memory _link) public onlyOwner(_id){
        structs[_id].link = _link;
    }

    // Define getter functions for each field
    function getId(uint _id) public view returns (uint) {
        return structs[_id].id;
    }

    function getName(uint _id) public view returns (string memory) {
        return structs[_id].name;
    }

    function getLink(uint _id) public view returns (string memory) {
        return structs[_id].link;
    }

    // Define the isUnique function
    function isUnique(uint _id) public view returns (bool) {
        // Loop through all entries in the mapping
        for (uint i = 0; i < structCount; i++) {
            // If the current id is the same as the given id, return false
            if (structs[i].id == _id) {
                return false;
            }
        }
        // If the id is unique, return true
        return true;
    }

    // Define the add and remove functions
    function add(string memory _name, string memory _link) public {
        // Check if the id is unique

        _tokenIds.increment();
        uint256 newNftTokenId = _tokenIds.current();
        latestTokenId = newNftTokenId;


        uint price = 10000 ether;
        _token.transferFrom(msg.sender, address(this), price);
        _token.burn(price);
        // Set the values of the struct
        structs[latestTokenId].id = latestTokenId;
        structs[latestTokenId].name = _name;
        structs[latestTokenId].link = _link;
        structs[latestTokenId].owner = msg.sender;
        structCount++;
    }

}

