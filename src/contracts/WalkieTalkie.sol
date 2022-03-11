// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";
import "./UPCNFT.sol";

//import "./stringUtils.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract WalkieTalkie is Context, ERC20, ERC20Burnable {

    uint public balance = 0;
    uint rehash = 3;
    address payable private owner;
    struct Reward {
        uint256  amount;
        string  winningHash;
    }
    
    struct WorkerMeta {
        address  supervisor;  //address of the staker
        string   guid;
        string   upc;
    }    



    mapping(string => string)     public walkieTalkie;
    uint workerCost = 20000000000000000;
    mapping(address => WorkerMeta[])    public workersForAddress;
    mapping(string  => WorkerMeta[])    public workersOnUpc;
    mapping(string  => bool)    public usedGuids;
    UPCNFT upcNFT;


    Reward[] public rewards;
    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () ERC20("walkieTalkie://", "<wktk>") {
        //_mint(_msgSender(), 10000 * (10 ** uint256(decimals())));
        owner =  payable(msg.sender);
        upcNFT = UPCNFT(0xc3B0b50C63A3cAC1a8320a07AA25770D6dACaE87);
    }
    
    modifier onlyOwner
    {
        require(
            msg.sender == owner,
            "Sender not authorized."
        );
        // Do not forget the "_;"! It will
        // be replaced by the actual function
        // body when the modifier is used.
        _;
    }

    function setUPCNFT(address newAddress) public  onlyOwner{
        upcNFT = UPCNFT(newAddress);
    }

     function getWalkieTalkie(string memory upcId) external view returns(string memory) {
        return walkieTalkie[upcId];
    }   

    function setWalkieTalkie(string memory upcId, string memory url) public {
        address upcOwner = upcNFT.getUpcOwner(upcId);
        require(msg.sender == upcOwner, "Unauthorized walkieTalkie set on this upc");        
        walkieTalkie[upcId] = url;
    }

}
