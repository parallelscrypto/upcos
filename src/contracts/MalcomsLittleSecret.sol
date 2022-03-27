// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

pragma experimental ABIEncoderV2;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

import "./Keyz.sol";

contract MalcolmsLittleSecret is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;


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
    
    struct NFTLookup {
        address  staker;  //address of the staker
        address  og;  //address of the staker
        bool     minted;
        bytes32  upcHash;
        string   word;
        string   ipfs;
        string   vr;
        string   humanReadableName;
        uint256  tokenId;
        bool     bought;
        uint     tld;
        uint256  createdTimestamp;
        uint256  latestTimestamp;
    }


    uint256  public latestTokenId;

    //tlds
    mapping(string => uint256)    public upcDomainToNftLookup;
    mapping(string => uint256)    public afroDomainToNftLookup;
    mapping(string => uint256)    public fireDomainToNftLookup;
    
    mapping(uint => string )     public tlds;

    mapping(string => NFTMeta)    public upcIdLookup;
    mapping(uint256 => NFTMeta)    public nftIdLookup;

    mapping(address => NFTMeta[])    public addressToNFTMeta;
    mapping(address => NFTMeta[])    public nftsToMintByAddress;
    mapping(bytes32 => NFTLookup)    public nftsToMintByHash;
    string public defaultIpfs;
    string public defaultVr;
    address payable private  bank;
    uint    public totalBalance;
    uint256    currentNftPrice;
    Key    private _token;
    string    public defaultProtocol;


    constructor() ERC721("MalcolmsLittleSecret", "MLX") Ownable()  {
        bank = payable(msg.sender);
        defaultIpfs = "ipfs/QmXyNMhV8bQFp6wzoVpkz3NqDi7Fj72Deg7KphAuew3RYU";
        defaultVr = "https://hubs.mozilla.com/scenes/q7CnmKA";
        currentNftPrice = 1 ether;
        tlds[0] = "upc";
        tlds[1] = "afro";
        tlds[2] = "fire";
        defaultProtocol = "upc";
    }

    function _transfer(address from, address to, uint256 tokenId) internal virtual override {
        super._transfer(from,to,tokenId);
        nftIdLookup[tokenId].staker = to;
        nftIdLookup[tokenId].latestTimestamp = block.timestamp;

        
        string memory upcId = nftIdLookup[tokenId].word;
        upcIdLookup[upcId].staker = to;
        upcIdLookup[upcId].latestTimestamp = block.timestamp;
        
    }

    function setPayToken(address  addy) external onlyOwner {
        _token = Key(addy);
    }

    function hasBeenMinted(string memory upcId) external view returns(bool) {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        return nftsToMintByHash[upcHash].minted;
    }
    

    function getMyNfts() external view returns(NFTMeta[] memory) {
        return addressToNFTMeta[msg.sender];
    }
    
    function setCurrentNftPrice(uint  _price) external onlyOwner {
        currentNftPrice = _price;
    }
   
      
    function nftInfo(uint nftId) external view returns(NFTMeta memory) {
        return nftIdLookup[nftId];
    }    
    
   
    function upcInfo(string memory upcId) external view returns(NFTMeta memory) {
        return upcIdLookup[upcId];
    }
    
    
   
    function getUpcOwner(string memory upcId) external view returns(address) {
        return upcIdLookup[upcId].staker;
    }        
    

    function resolveDomain(string memory humanReadableName, uint tld) external view returns(NFTMeta memory) {
        uint256 tmpTokenId = 0;
        if(tld == 0) {
            tmpTokenId = upcDomainToNftLookup[humanReadableName];
        }
        else if(tld == 1) {
            tmpTokenId = afroDomainToNftLookup[humanReadableName];
        }
        else if(tld == 2) {
            tmpTokenId = fireDomainToNftLookup[humanReadableName];
        }
        
        require(tmpTokenId > 0 , "Domain not found");
        
        
        return nftIdLookup[tmpTokenId];
        
    }    


    function withdrawTokens() external onlyOwner {
        bank.transfer(address(this).balance);
        totalBalance = 0;
    }


    function buyNft(string memory upcId, string memory humanReadableName, uint _tld) public payable{
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        
        require(nftsToMintByHash[upcHash].bought == false , "Error, this UPC has already been purchased.");
        
        if(_tld == 0) {
            require(upcDomainToNftLookup[humanReadableName] < 1 , "Error, this UPC DOMAIN NAME has already been purchased.");
        }
        else if(_tld == 1) {
            require(afroDomainToNftLookup[humanReadableName] < 1 , "Error, this AFRO DOMAIN NAME has already been purchased.");
        }
        else if(_tld == 2) {
            require(fireDomainToNftLookup[humanReadableName] < 1 , "Error, this FIRE DOMAIN NAME has already been purchased.");
        }
        
        bytes memory testStr = bytes(humanReadableName); // Uses memory
        require(testStr.length > 0 , "Sorry, this UPC domain is already taken");        
        _token.transferFrom(msg.sender, address(this), currentNftPrice);
        _tokenIds.increment();
        uint256 newNftTokenId = _tokenIds.current();
        latestTokenId = newNftTokenId;
        
        //add the metadata to the array to alert that an nft is available for minting
        NFTMeta memory nftMeta;
        nftMeta.tokenId = newNftTokenId;
        nftMeta.staker = msg.sender;
        nftMeta.upcHash = upcHash;
        nftMeta.word = upcId;
        //nftMeta.ipfs = defaultIpfs;
        nftMeta.humanReadableName = humanReadableName;
        nftMeta.minted = false;
        //nftMeta.vr = defaultVr;
        nftMeta.bought = true;
        nftMeta.tld =  _tld;
        nftsToMintByAddress[msg.sender].push(nftMeta);
        
        upcIdLookup[upcId]           = nftMeta;

        nftsToMintByHash[upcHash].minted = false;
        nftsToMintByHash[upcHash].staker = msg.sender;
        nftsToMintByHash[upcHash].humanReadableName = humanReadableName;
        nftsToMintByHash[upcHash].tokenId = newNftTokenId;
        nftsToMintByHash[upcHash].word = upcId;
        //nftsToMintByHash[upcHash].ipfs = defaultIpfs;
        //nftsToMintByHash[upcHash].vr = defaultVr;
        nftsToMintByHash[upcHash].bought = true;
        nftsToMintByHash[upcHash].upcHash = upcHash;

        addressToNFTMeta[msg.sender].push(nftMeta);        
        
        
        
        if(_tld == 0) {
            upcDomainToNftLookup[humanReadableName] = newNftTokenId;
        }
        else if(_tld == 1) {
            afroDomainToNftLookup[humanReadableName] = newNftTokenId;
        }
        else if(_tld == 2) {
            fireDomainToNftLookup[humanReadableName] = newNftTokenId;
        }
                
        
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
    
    
    function getVrByUpcId(string memory upcId) public view returns (string memory) {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        return nftsToMintByHash[upcHash].vr;
    }
        
    
    function getVrByHash(bytes32 upcHash) public view returns (string memory) {
        return nftsToMintByHash[upcHash].vr;
    }
    
    
    function getIpfsByHash(bytes32 upcHash) public view returns (string memory) {
        return nftsToMintByHash[upcHash].ipfs;
    }    

    function getHumanReadableNameByHash(bytes32 upcHash) public view returns (string memory) {
        return nftsToMintByHash[upcHash].humanReadableName;
    }    


    
    function setVr(string memory upcId, string memory _vr) public {
        require(msg.sender == upcIdLookup[upcId].staker , "Only owner can set VR");
        upcIdLookup[upcId].vr = _vr;
        upcIdLookup[upcId].latestTimestamp = block.timestamp;
        uint256 tmpTokenId = upcIdLookup[upcId].tokenId;
        nftIdLookup[tmpTokenId].vr = _vr;
        nftIdLookup[tmpTokenId].latestTimestamp = block.timestamp;
    }
    
    
    function setIpfs(string memory upcId, string memory _ipfs) public {
        require(msg.sender == upcIdLookup[upcId].staker , "Only owner can set VR");
        upcIdLookup[upcId].ipfs = _ipfs;
        upcIdLookup[upcId].latestTimestamp = block.timestamp;
        uint256 tmpTokenId = upcIdLookup[upcId].tokenId;
        nftIdLookup[tmpTokenId].ipfs = _ipfs;
        nftIdLookup[tmpTokenId].latestTimestamp = block.timestamp;
    }    


    function mintNft(string memory upcId) public payable returns (uint256) {

        address staker = msg.sender;
        bytes32 upcHash = sha256(abi.encodePacked(upcId));

        require(msg.sender == nftsToMintByHash[upcHash].staker , "Only owner can mint this nft");
        require(nftsToMintByHash[upcHash].minted == false, "NFT already minted");
    
        uint256 tokenIdToMint = nftsToMintByHash[upcHash].tokenId;
        NFTMeta memory nftToMint;

        int indexToMint = findTokenIndexByAddress(msg.sender, tokenIdToMint);

        require(indexToMint >= 0, "Error trying to mint an NFT that is not in range");
        
        //cast the result to a uint
        nftToMint = nftsToMintByAddress[msg.sender][uint(indexToMint)];

        NFTMeta memory nftMeta;
        nftMeta.tokenId                 = nftToMint.tokenId;
        nftMeta.staker                  = nftToMint.staker;
        nftMeta.og                      = nftToMint.staker;
        nftMeta.upcHash                 = nftToMint.upcHash;
        nftMeta.word                    = nftToMint.word;
        nftMeta.ipfs                    = defaultIpfs;
        nftMeta.vr                      = defaultVr;
        nftMeta.minted                  = true;
        nftMeta.humanReadableName       = nftToMint.humanReadableName;
        
        addressToNFTMeta[staker].push(nftMeta);

        //update this upc as minted
        nftsToMintByHash[upcHash].minted            = true;
        nftsToMintByHash[upcHash].staker            = msg.sender;
        nftsToMintByHash[upcHash].humanReadableName = nftToMint.humanReadableName;
        nftIdLookup[nftToMint.tokenId]              = nftMeta;

        upcIdLookup[upcId].minted             = true;
        upcIdLookup[upcId].ipfs               = defaultIpfs;
        upcIdLookup[upcId].vr                 = defaultVr;
        upcIdLookup[upcId].latestTimestamp    = block.timestamp;
        upcIdLookup[upcId].createdTimestamp   = block.timestamp;
        upcIdLookup[upcId].og                 = msg.sender;
        //upcIdLookup[upcId].protocol           = defaultProtocol;

        uint tmpTld                           = upcIdLookup[upcId].tld;
        nftIdLookup[nftToMint.tokenId].tld    = tmpTld;
        
        nftIdLookup[nftToMint.tokenId].latestTimestamp  = block.timestamp;
        nftIdLookup[nftToMint.tokenId].createdTimestamp = block.timestamp;
        //nftIdLookup[nftToMint.tokenId].protocol = defaultProtocol;

        _safeMint(staker, tokenIdToMint);
        //_setTokenURI(tokenIdToMint, defaultIpfs);

        return tokenIdToMint;

    }
}
