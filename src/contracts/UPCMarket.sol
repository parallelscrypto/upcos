    // SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.1/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.1/contracts/token/ERC721/IERC721Receiver.sol";

contract UPCMarket is IERC721Receiver {
    
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

    mapping (uint256 => AuctionDetails) public auctionDetails;

    address payable private  bank;
    address private  nftMarketplace;

    
    constructor() {
        bank = payable(msg.sender);
        nftMarketplace = address(0xE49427a83D78C5E882ec5f5c18DCFFfF9417cf94);
    }


    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes memory _data) public override returns(bytes4) {
        
        require(msg.sender >= nftMarketplace, "Only AIB can be sold in this marketplace");
        
        
        auctionDetails[_tokenId] = AuctionDetails({
            nftContract: ERC721(msg.sender),
            bidIsComplete: false,
            seller: _from,
            winningBidder: address(0),
            tokenId: _tokenId,
            inProgress: false,
            price: 10000000000000000,
            fee: 0,
            upcId: "000000000000",
            humanReadableName: "AnonymousUPC"
        });
        

        return 0x150b7a02;
     }

    function setNftMarketplace(address nftMkt) external {   
        nftMarketplace = nftMkt;
    }


    function calculateFee(uint amount) external pure returns (uint) {
        return amount * 200 / 10000;  //2%
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
