// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";
//import "./stringUtils.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract AfroMine is Context, ERC20, ERC20Burnable {

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

    uint workerCost = 200000000000000000;
    mapping(address => WorkerMeta[])    public workersForAddress;
    mapping(string  => WorkerMeta[])    public workersOnUpc;
    mapping(string  => bool)    public usedGuids;



    Reward[] public rewards;
    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () ERC20("AfroMine", "AfroMine") {
        _mint(_msgSender(), 10000 * (10 ** uint256(decimals())));
        owner =  payable(msg.sender);
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

    function addWorker(string memory guid, string memory upc) public payable {
        require(msg.value >= workerCost , "Send proper amount in order to add worker");
        require(usedGuids[guid] == false , "Sorry, this worker is already in the mine");
        usedGuids[guid] = true;
        balance += msg.value;
        WorkerMeta memory workerMeta;
        workerMeta.supervisor = msg.sender;
        workerMeta.guid = guid;
        workerMeta.upc = upc;
        workersForAddress[msg.sender].push(workerMeta);
        workersOnUpc[upc].push(workerMeta);
    }
    
    
    function getWorkersByAddress() external view returns(WorkerMeta[] memory) {
        return workersForAddress[msg.sender];
    }
        
    function getWorkersByUpc(string memory upc) external view returns(WorkerMeta[] memory) {
        return workersOnUpc[upc];
    }
    
    function withdraw() public  onlyOwner{
        address payable _to = payable(msg.sender);
        _to.transfer(balance);
        balance = 0;
    }
    
}
