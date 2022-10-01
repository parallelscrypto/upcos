// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";
//import "./stringUtils.sol";
import "./TubmanX.sol";
import "./AfrikaIsBeautiful.sol";

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
contract CoinBox is Context, ERC20, ERC20Burnable {

    modifier onlyOwner {
       require(msg.sender == owner);
       _;
    }

    mapping(string => uint)     public tubmanBalanceReceived;
    mapping(string => uint)     public usdcBalanceReceived;
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
    AfrikaIsBeautiful        upcNFT;

    Reward[] public rewards;

    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () ERC20("CoinBox", "cbx") {
        owner     =   payable(msg.sender);
        _usdc     =   USDC(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);
        _tubmanx  =   TubmanX(0x455784bdea2A7B759F9e42314F6c93C39b5868f2);
        upcNFT    =   AfrikaIsBeautiful(0x2DA2c8eD74cd16F0c24CFFFA257455EAa5Bd93b7);
    }

    function injectTubmanX(string memory upcId, uint256 numTubmanX) public payable {
        tubmanBalanceReceived[upcId] += numTubmanX;
        _tubmanx.transferFrom(msg.sender, address(this), numTubmanX);
    }

    function injectUSDC(string memory upcId, uint256 numUSDC) public payable {
        usdcBalanceReceived[upcId] += numUSDC;
        _usdc.transferFrom(msg.sender, address(this), numUSDC);
    }

    function claimTubmanxToken(string memory upcId) public {

        uint256 deduce = 100000000000000000;
        require(tubmanBalanceReceived[upcId] >= deduce , "Sorry, this coinbox is empty");

        address upcOwner = upcNFT.getUpcOwner(upcId);
        if(msg.sender == upcOwner) {
            deduce = tubmanBalanceReceived[upcId];
        }

        tubmanBalanceReceived[upcId]-= deduce; //each claim call will send the claimant .25 tubmanx
        _tubmanx.transfer(msg.sender, deduce);
    }

    function setAfrikaisBeautiful(address newAddress) public  onlyOwner{
        upcNFT = AfrikaIsBeautiful(newAddress);
    }

}
