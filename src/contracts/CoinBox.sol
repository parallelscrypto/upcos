// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";
//import "./stringUtils.sol";
import "./Narativ.sol";
import "./DecolonizeAfrica.sol";

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

    mapping(string => uint)     public narativBalanceReceived;
    mapping(string => uint)     public usdcBalanceReceived;
    uint256    currentNftPrice;
    uint public balance = 0;
    uint rehash = 3;
    address payable private owner;
    struct Reward {
        uint256  amount;
        string  winningHash;
    }

    Narativ       private _narativ;
    USDC          private _usdc;
    DecolonizeAfrica        upcNFT;

    Reward[] public rewards;

    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () ERC20("CoinBox", "cbx") {
        owner     =   payable(msg.sender);
        _usdc     =   USDC(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);
        _narativ  =   Narativ(0x63d5E1919F742E7da61c93C96933D195A2e40b35);
        upcNFT    =   DecolonizeAfrica(0xE49427a83D78C5E882ec5f5c18DCFFfF9417cf94);
    }

    function injectNarativ(string memory upcId, uint256 numNarativ) public payable {
        narativBalanceReceived[upcId] += numNarativ;
        _narativ.transferFrom(msg.sender, address(this), numNarativ);
    }

    function injectUSDC(string memory upcId, uint256 numUSDC) public payable {
        usdcBalanceReceived[upcId] += numUSDC;
        _usdc.transferFrom(msg.sender, address(this), numUSDC);
    }

    function claimNarativToken(string memory upcId) public {

        uint256 deduce = 0;
        require(narativBalanceReceived[upcId] >= deduce , "Sorry, this coinbox is empty");

        address upcOwner = upcNFT.getUpcOwner(upcId);
        if(msg.sender == upcOwner) {
            deduce = narativBalanceReceived[upcId];
        }
        else if(upcOwner == address(0x0)) {
                deduce = 100000000000000000;
        }

        require(deduce > 0 , "Will not send zero tokens");
        
        narativBalanceReceived[upcId]-= deduce; //each claim call will send the claimant .25 Narativ
        _narativ.transfer(msg.sender, deduce);
    }

    function setDecolonizeAfrica(address newAddress) public  onlyOwner{
        upcNFT = DecolonizeAfrica(newAddress);
    }

}
