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
            price: 10000000000000000
        });
        

        return 0x150b7a02;
     }
     
     
    function completeSale(uint256 auctionId) payable external {
        AuctionDetails storage details = auctionDetails[auctionId];
        require(msg.value >= details.price, "Please send sufficient number of tokens");
        auctionDetails[auctionId].price = msg.value;
        auctionDetails[auctionId].winningBidder = msg.sender;
        auctionDetails[auctionId].bidIsComplete = true;
    }
    

    function withdraw(uint256 auctionId) external {
        AuctionDetails storage details = auctionDetails[auctionId];

        require(details.bidIsComplete == true , "bid not complete");
        require(msg.sender == details.winningBidder, "Only winning bidder can withdraw");
        // Collect money from winning bidder

        details.nftContract.safeTransferFrom(address(this), details.winningBidder, details.tokenId);
        
        address payable  winnerPay  = payable(details.seller);
        winnerPay.transfer(details.price);
        // Send money to seller
        // Do event logging
        delete auctionDetails[auctionId];
    }
    
}
