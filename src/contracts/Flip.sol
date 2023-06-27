// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";
import "./Upc.sol";




interface iERC721 {
    function getTld(string memory wad) external returns (uint);
    function getUpcOwner(string memory src) external returns (address);
}



//import "./stringUtils.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract Flip is Context, ERC20, ERC20Burnable {

    uint public balance = 0;
    uint crownCount = 0;
    address payable private owner;

    mapping(string => uint256)    public crowns;
    mapping(uint256 => string)    public crownArchive;


    struct Reward {
        uint256  amount;
        string  winningHash;
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




    iERC721  private     upcNFT;

    Reward[] public rewards;

    // Define the modifier
    modifier onlyOwner {
        require(msg.sender == owner, "Action can only be performed by the owner");
        _;
    }



    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () ERC20("Flip", "FLIP") {
        upcNFT = iERC721(0x77e45380585826D0947a032453a2d7B0d18d6078);
        _mint(_msgSender(), 9999999999999999999999999 * (10 ** uint256(decimals())));
        owner =  payable(msg.sender);
    }

    function setUpcNft(address addy) public onlyOwner{
        upcNFT = iERC721(addy);
    }
    
    function addCrown(string memory kingmakerNft, string memory upcId, uint _numTokens) public {
        uint possKingmakerTld = upcNFT.getTld(kingmakerNft);
        require(possKingmakerTld == 99999, "Only the holder of a Kingmaker token (99999) may fully execute this function");
        address upcOwner = upcNFT.getUpcOwner(kingmakerNft);
        //NFTMeta memory nftMeta = this.nftInfo(i);
        require(msg.sender == upcOwner , "Only owner of specific NFT may crown a UPC code");
        crownCount++;
        crownArchive[crownCount] = upcId;

        uint256 numTokens = _numTokens * (10 ** uint256(decimals()));
        crowns[upcId] = numTokens;
    }
    
    
    function getCrown(string memory upcId) external view returns(uint256) {
        return crowns[upcId];
    }          

    function calculatePercentage(uint256 number, uint256 percentage) private pure returns (uint256) { 
        return number * percentage / 1000; 
    }



    function isEqual(string memory _needle, string memory _haystack) public pure returns (bool) {
        // Compare string keccak256 hashes to check equality
        if (keccak256(abi.encodePacked(_needle)) == keccak256(abi.encodePacked(_haystack))) {
            return true;
        }
        return false;
    }


    function mine (string memory upcId, uint256 _numTokens) public {
        uint256 numTokens = _numTokens * (10 ** uint256(decimals()));
        require(crowns[upcId] >= numTokens , "Please mint fewer tokens");

        address upcOwner = upcNFT.getUpcOwner(upcId);
        require(msg.sender == upcOwner , "Only owner of specific Nft can mint coins");

        crowns[upcId] -= numTokens;
        _mint(_msgSender(), numTokens);

    }
}