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
contract afroX is Context, ERC20, ERC20Burnable {

    uint public balance = 0;
    uint rehash = 3;
    address payable private owner;
    struct Reward {
        uint256  amount;
        string  winningHash;
    }
    
    Reward[] public rewards;
    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () ERC20("AfroX", "AfroX") {
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

    
    function addReward(uint256 amount, string memory winningHash) public payable onlyOwner {
        Reward memory newRewreward;
        newRewreward.amount = amount;
        newRewreward.winningHash = winningHash;
        rewards.push(newRewreward);
    }
    
    function withdraw() public  onlyOwner{
        owner.transfer(balance);
        balance = 0;
    }
    
    
    
    function swap() public payable {
        balance += msg.value;
        address(this).transfer(msg.value);
        _mint(msg.sender, msg.value * (10 ** 14));
    }    
    

    function mine () public {
                _mint(msg.sender, 1 * (10 ** 16));
                _mint(address(this), 1 * (10 ** 18));
    }
    
}

