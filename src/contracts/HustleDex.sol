    // SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721Receiver.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";
import "./Keyz.sol";


contract HustlersCastle is ERC721, IERC721Receiver, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct AuctionDetails {
        ERC721 nftContract;
        bool bidIsComplete;
        address seller;
        address winningBidder;
        uint256 tokenId;
        uint256 price;
        bool inProgress;
        uint fee;
        string   upcId;
        string   humanReadableName;
    }



    struct NFTMeta {
        uint256  tokenId;
        address  owner;  //address of the staker
        bool     bought;
        uint     value;
        uint256  createdTimestamp;
        uint256  latestTimestamp;
    }
    

    mapping  (uint256 => AuctionDetails)     public auctionDetails;
    mapping  (address => NFTMeta[])          public nftsToMintByAddress;
    mapping  (uint256 => NFTMeta)            public nftsToMintById;        


    address   payable private    bank;
    Keyz      private            _token;
    uint256   public             latestTokenId;

    
    constructor() ERC721("HustlersCastle", "HUSL") Ownable()  {
        bank = payable(msg.sender);
    }


    //returns the position in the address array that an nft holds
    function findTokenIndexByAddress(address owner, uint256 tokenId) public view returns (int) {
        uint i = 0;
        int found = -1;
        for(i = 0; i < nftsToMintByAddress[owner].length; i++) {
            if(nftsToMintByAddress[owner][i].tokenId == tokenId) {
               found = int(i);
            }
        }
        return found;
    }
    
      
    function nftInfo(uint nftId) external view returns(NFTMeta memory) {
        return nftsToMintById[nftId];
    }    
    


    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes memory _data) public override returns(bytes4) {


        int tokenId = findTokenIndexByAddress(msg.sender,_tokenId);

        require( tokenId > 0, "Sanity check failed.  User must own nft to cash in");

        NFTMeta memory toRedeem = nftsToMintById[_tokenId];
        _token.transfer(toRedeem.owner, toRedeem.value);
        toRedeem.value = 0;
        

        return 0x150b7a02;
     }



    function calculateFee(uint amount) external pure returns (uint) {
        return amount * 200 / 10000;  //2%
    }

    function hustleKeyz(uint256 numKeyz) public payable returns (uint256){

        _token.transferFrom(msg.sender, address(this), numKeyz);
        _tokenIds.increment();
        uint256 newNftTokenId = _tokenIds.current();
        latestTokenId = newNftTokenId;




        //add the metadata to the array to alert that an nft is available for minting
        NFTMeta memory nftMeta;

/*
        uint256  tokenId;
        address  owner;  //address of the staker
        bool     bought;
        uint     value;
        uint256  createdTimestamp;
        uint256  latestTimestamp;
*/

        nftMeta.tokenId = newNftTokenId;
        nftMeta.owner = msg.sender;
        nftMeta.value = numKeyz;

        //nftMeta.ipfs = defaultIpfs;

        //nftMeta.vr = defaultVr;
        nftsToMintByAddress[msg.sender].push(nftMeta);

        nftsToMintById[newNftTokenId] = nftMeta;
        _safeMint(msg.sender, newNftTokenId);
        //_setTokenURI(tokenIdToMint, defaultIpfs);

        return newNftTokenId;
        
    }


     
     
    function completeSale(uint256 auctionId) payable external {
        AuctionDetails storage details = auctionDetails[auctionId];
        require(details.inProgress == true, "Sale not in progress yet.  Initial price not set");
        require(msg.value >= details.price, "Please send sufficient number of tokens");
        auctionDetails[auctionId].price = msg.value;
        auctionDetails[auctionId].winningBidder = msg.sender;
        auctionDetails[auctionId].bidIsComplete = true;
        auctionDetails[auctionId].inProgress = false;
        details.nftContract.safeTransferFrom(address(this), msg.sender, auctionId);
        
        address payable  winnerPay  = payable(details.seller);
        uint fee = this.calculateFee(msg.value);
        uint sellerPay = msg.value - fee;
        bank.transfer(fee);
        
        
        winnerPay.transfer(sellerPay);
        // Send money to seller
        // Do event logging
        delete auctionDetails[auctionId];      
    }
 
 
    function setUpc(uint256 auctionId, string memory upcId) external {
        AuctionDetails storage details = auctionDetails[auctionId];
        require(msg.sender == details.seller, "Only seller can set price");
        require(details.bidIsComplete == false , "Sale must be ongoing in order to set price");
        // Collect money from winning bidder
        
        auctionDetails[auctionId].upcId = upcId;
    }
        
 
    function setHumanReadableName(uint256 auctionId, string memory humanReadableName) external {
        AuctionDetails storage details = auctionDetails[auctionId];
        require(msg.sender == details.seller, "Only seller can set price");
        require(details.bidIsComplete == false , "Sale must be ongoing in order to set price");
        // Collect money from winning bidder
        
        auctionDetails[auctionId].humanReadableName = humanReadableName;
    }


    //function redeem-for-underlying-keys
    //take an nft that has a staked balance and redeem
    //hot nft, owner holds in wallet, but if buyer calls contract
    //tokens instantly transferred to buyer?




    function setPrice(uint256 auctionId, uint256 price) external {
        AuctionDetails storage details = auctionDetails[auctionId];
        require(msg.sender == details.seller, "Only seller can set price");
        require(details.bidIsComplete == false , "Sale must be ongoing in order to set price");
        // Collect money from winning bidder
        
        uint fee = this.calculateFee(price);
        auctionDetails[auctionId].price = price;
        auctionDetails[auctionId].fee = fee;
        auctionDetails[auctionId].inProgress = true;
    }
    
    //winning bidder calls the withdraw function
    function cancelSale(uint256 auctionId) external {
        AuctionDetails storage details = auctionDetails[auctionId];
        require(details.bidIsComplete == false , "Sale already complete");
        require(msg.sender == details.seller, "Only seller can cancel sale");
        
        //send any earnings before cancelling
        address payable  winnerPay  = payable(details.seller);
        
        
        winnerPay.transfer(details.price - details.fee);
        
        delete auctionDetails[auctionId];
    }
    
}
