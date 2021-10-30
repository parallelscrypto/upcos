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
        uint fee;
    }    

    mapping (uint256 => AuctionDetails) public auctionDetails;

    address payable private  bank;
    
    
    constructor() {
        bank = payable(msg.sender);
    }


    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes memory _data) public override returns(bytes4) {
        
        
        auctionDetails[_tokenId] = AuctionDetails({
            nftContract: ERC721(msg.sender),
            bidIsComplete: false,
            seller: _from,
            winningBidder: address(0),
            tokenId: _tokenId,
            inProgress: false,
            price: 10000000000000000,
            fee: 0
        });
        

        return 0x150b7a02;
     }



    function calculateFee(uint amount) external pure returns (uint) {
        require((amount / 10000) * 10000 == amount , 'too small');
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
        
        
        winnerPay.transfer(sellerPay);
        // Send money to seller
        // Do event logging
        delete auctionDetails[auctionId];      
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
        
        
        bank.transfer(details.fee);
        winnerPay.transfer(details.price - details.fee);
        
        delete auctionDetails[auctionId];
    }
    
}

