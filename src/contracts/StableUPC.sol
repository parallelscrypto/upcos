// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";
//import "./stringUtils.sol";
import "./TubmanX.sol";



interface USDC {
    function transfer(address dst, uint wad) external returns (bool);
    function transferFrom(address src, address dst, uint wad) external returns (bool);
    function balanceOf(address guy) external view returns (uint);
}



/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract UPCStable is Context, ERC20, ERC20Burnable {

   modifier onlyOwner {
      require(msg.sender == owner);
      _;
   }

    uint256    currentNftPrice;
    uint public balance = 0;
    uint rehash = 3;
    address payable private owner;
    struct Reward {
        uint256  amount;
        string  winningHash;
    }

    TubmanX       private _tubmanx;
    USDC          private _usdc;

    Reward[] public rewards;

    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () ERC20("UPCStable", "UPCS") {
        _mint(_msgSender(), 11000000000000 * (10 ** uint256(decimals())));
        owner    =  payable(msg.sender);
        _usdc    = USDC(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);
        _tubmanx = TubmanX(0x455784bdea2A7B759F9e42314F6c93C39b5868f2);
    }

    function buyUPCSWithUSDC(uint256 numUSDC) public payable {
        _usdc.transferFrom(msg.sender, owner, numUSDC);
        uint256 equivUPCS = numUSDC * (12 ** uint256(decimals()));
        this.transferFrom(owner, msg.sender, equivUPCS);
    }


    function buyUPCSWithTubmanX(uint256 numTubmanX) public payable {
        _tubmanx.transferFrom(msg.sender, address(this), numTubmanX);
        uint256 equivTubmanX = numTubmanX/ 5;
        this.transfer(msg.sender, equivTubmanX);
    }


    function redeemUPCSForTubmanX(uint256 numUPCS) public payable {
        this.transferFrom(msg.sender, address(this), numUPCS);
        uint256 equivTubmanX = numUPCS * 5;
        _tubmanx.transfer(msg.sender , equivTubmanX);
    }

    function setTubmanxToken(address  addy) external onlyOwner {
        _tubmanx = TubmanX(addy);
    }

    function setStableToken(address  addy) external onlyOwner {
        _usdc = USDC(addy);
    }    
    
}

