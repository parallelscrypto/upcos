    // SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721Receiver.sol";

contract UPCMarket is IERC721Receiver {
    
    struct AuctionDetails {
        ERC721 nftContract;
        bool bidIsComplete;
        address seller;
        address winningBidder;
        uint256 tokenId;
        uint256 price;
        bool inProgress;
    }    

    mapping (uint256 => AuctionDetails) public auctionDetails;

    constructor() {}
    
    
    


    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes memory _data) public override returns(bytes4) {
        
        
        
        auctionDetails[_tokenId] = AuctionDetails({
            nftContract: ERC721(msg.sender),
            bidIsComplete: false,
            seller: _from,
            winningBidder: address(0),
            tokenId: _tokenId,
            inProgress: false,
            price: 10000000000000000
        });
        

        return 0x150b7a02;
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
        winnerPay.transfer(msg.value);
        // Send money to seller
        // Do event logging
        delete auctionDetails[auctionId];      
    }
 
     

    function setPrice(uint256 auctionId, uint256 price) external {
        AuctionDetails storage details = auctionDetails[auctionId];
        require(msg.sender == details.seller, "Only seller can set price");
        require(details.bidIsComplete == false , "Sale must be ongoing in order to set price");
        // Collect money from winning bidder
        auctionDetails[auctionId].price = price;
        auctionDetails[auctionId].inProgress = true;
    }
    
    //winning bidder calls the withdraw function
    function cancelSale(uint256 auctionId) external {
        AuctionDetails storage details = auctionDetails[auctionId];
        require(details.bidIsComplete == false , "Sale already complete");
        require(msg.sender == details.seller, "Only seller can cancel sale");
        
        //send any earnings before cancelling
        address payable  winnerPay  = payable(details.seller);
        winnerPay.transfer(details.price);
        
        delete auctionDetails[auctionId];
    }
    
}
