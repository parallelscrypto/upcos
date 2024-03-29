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


    struct NFTMeta {
        uint256  tokenId;
        address  staker;  //address of the staker
        address  og;  //address of the staker
        bytes32  upcHash;
        string   word;
        string   ipfs;
        string   vr;
        string   humanReadableName;
        bool     minted;
        bool     bought;
        uint     tld;
        uint256  createdTimestamp;
        uint256  latestTimestamp;
    }


    mapping(string => uint)     public narativBalanceReceived;
    mapping(string => uint)     public usdcBalanceReceived;
    uint256    currentNftPrice;
    uint public balance = 0;
    uint rehash = 3;
    address payable private owner;
    address payable private community;

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
        community =   payable(0xbaF306E29157cCE66b182fFfc279c04cDed87adD);
        _usdc     =   USDC(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);
        _narativ  =   Narativ(0x3cE547874ab802D007d1410eC810669BdD04d7Ae);
        upcNFT    =   DecolonizeAfrica(0xF0176c005b5A453A5d8a7F5e3583fE52a28EDC5b);
    }

    function injectNarativ(string memory upcId, uint256 numNarativ) public payable {
        narativBalanceReceived[upcId] += numNarativ;
        _narativ.transferFrom(msg.sender, address(this), numNarativ);
    }

    function injectUSDC(string memory upcId, uint256 numUSDC) public payable {
        usdcBalanceReceived[upcId] += numUSDC;
        _usdc.transferFrom(msg.sender, address(this), numUSDC);
    }

    function claimNarativToken(string memory upcId) public payable{
        uint deduce = 0;

        address upcOwner = upcNFT.getUpcOwner(upcId);
        address payable payableOwner = payable(upcOwner);
        uint possCoinboxTld = upcNFT.getTld(upcId);

        if(possCoinboxTld == 777 ) {
            deduce = 100000000000000000;
            require(narativBalanceReceived[upcId] >= deduce , "Sorry, this coinbox is empty");
            require(msg.value >= 0.05 ether , "Accessing coinbox requires a .05 token fee");
            uint ownerFee          = 20000000000000000;
            uint infastructureFee  = 15000000000000000;
            uint communityFee      = 15000000000000000;
            uint remainder         = msg.value - ownerFee - infastructureFee - communityFee;

            payableOwner.transfer(ownerFee);
            owner.transfer(infastructureFee);
            community.transfer(communityFee);

            if(remainder > 0) {
                payableOwner.transfer(remainder);
            }            

        }
        else if(msg.sender == upcOwner) {
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

    
    function setNarativ(address newAddress) public  onlyOwner{
        _narativ = Narativ(newAddress);
    }

    
    function setOwner(address newAddress) public  onlyOwner{
        owner = payable(newAddress);
    }    
}
