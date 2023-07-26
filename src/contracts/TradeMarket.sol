// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TradeMarket is IERC721Receiver {

    struct NFT {
        address owner;
        uint256 nftId;
    }



    mapping (uint256 => NFT) public nfts;
    address private  nftMarketplace = 0x62c287A2d9af21369669E555c733cEb1eE5D74b5;
    address private  owner;


    event NFTAdded(uint256 indexed nftId, address indexed owner);
    event NFTSwapped(uint256 indexed nftId, address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner {
       require(msg.sender == owner);
       _;
    }



    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes memory _data) public override returns(bytes4) {

        require(msg.sender == nftMarketplace, "Only NRT can be sold in this marketplace");

        //require(ERC721(msg.sender).ownerOf(_tokenId) == msg.sender, "Sender is not owner of NFT");
        require(nfts[_tokenId].nftId == 0, "NFT is already in TradeMarket");

        NFT memory nftMeta;
        nftMeta.nftId = _tokenId;
        nftMeta.owner = _from;

        // Update NFT information
        nfts[_tokenId] = nftMeta;
        emit NFTAdded(_tokenId, msg.sender);
        
        return 0x150b7a02;
    }

    
    function setMarketplace(address marketplace) external onlyOwner {
        nftMarketplace = marketplace;
    }
    
    
    function trade(uint256 _nftId1, uint256 _nftId2) public payable {
        address _offeredOwner = nfts[_nftId2].owner;
        
        // Transfer NFT1 to offered owner
        //ERC721(msg.sender).safeTransferFrom(address(this), _offeredOwner, _nftId1);
        ERC721(nftMarketplace).safeTransferFrom(address(this), msg.sender, _nftId2);

        // Transfer NFT2 to sender
        ERC721(nftMarketplace).safeTransferFrom(msg.sender, _offeredOwner, _nftId1);
        
        // Update NFT information
        nfts[_nftId2].owner = address(0x0);
        nfts[_nftId2].nftId = 0;
        
        emit NFTSwapped(_nftId1, msg.sender, _offeredOwner);
        emit NFTSwapped(_nftId2, _offeredOwner, msg.sender);
    }
}
