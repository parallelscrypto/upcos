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
contract OneAfrika is Context, ERC20, ERC20Burnable {

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
    constructor () ERC20("OneAfrika", "ONE") {
        _mint(_msgSender(), 777777777777777777777777777777777777 * (10 ** uint256(decimals())));
        owner =  payable(msg.sender);
    }

    function calculatePercentage(uint256 number, uint256 percentage) private pure returns (uint256) { 
        return number * percentage / 1000; 
    }


    function swap() public payable {
        uint256 amount = msg.value;
        owner.transfer(amount);
        uint256 percent = calculatePercentage(amount,10);
        _mint(msg.sender, percent);
    }    
    

    function mine () public {
        require(msg.sender == owner , "Only owner can mine");
        _mint(address(owner), 1 * (10 ** 19));
    }
    
}
