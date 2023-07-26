// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";
import "./RawMaterial.sol";

//import "./stringUtils.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract TipJar is Context, ERC20, ERC20Burnable {

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



    mapping(string => uint)     public balanceReceived;
    uint workerCost = 20000000000000000;
    mapping(address => WorkerMeta[])    public workersForAddress;
    mapping(string  => WorkerMeta[])    public workersOnRawMaterial;
    mapping(string  => bool)    public usedGuids;
    RawMaterial upcNFT;


    Reward[] public rewards;
    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () ERC20("tip://", "<tip>") {
        //_mint(_msgSender(), 10000 * (10 ** uint256(decimals())));
        owner =  payable(msg.sender);
        upcNFT = RawMaterial(0x62c287A2d9af21369669E555c733cEb1eE5D74b5);
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
        upcNFT = RawMaterial(newAddress);
    }

    function pigIn(string memory upcId) public payable {
        balanceReceived[upcId] += msg.value;
    }
    
     function upcBalance(string memory upcId) external view returns(uint) {
        return balanceReceived[upcId];
    }   

    function pigOut(string memory upcId)  external  { 
        address upcOwner = upcNFT.getUpcOwner(upcId);
        require(msg.sender == upcOwner, "Unauthorized pigOut on this upc");
        address payable _to = payable(msg.sender);
        uint toTransfer = balanceReceived[upcId];
        balanceReceived[upcId] = 0;
        _to.transfer(toTransfer);
    }
    
}
