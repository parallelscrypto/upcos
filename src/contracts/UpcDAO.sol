// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

pragma experimental ABIEncoderV2;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

import "./IntelX.sol";

contract UPCDAO is ERC721, Ownable {
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
    IntelX    private _token;
    string    public defaultProtocol;
    uint workerCost = 200000000000000000;


   uint public balance = 0;
    uint rehash = 3;

    struct WorkerMeta {
        address  supervisor;  //address of the staker
        string   guid;
        string   upc;
        uint256  tokenId;
    }

    mapping(address => WorkerMeta[])    public workersForAddress;
    mapping(string  => WorkerMeta[])    public workersOnUpc;
    mapping(string  => bool)    public usedGuids;


    constructor() ERC721("upcDAO://", "<upcDAO>") Ownable()  {
        bank = payable(msg.sender);
    }

    function _transfer(address from, address to, uint256 tokenId) internal virtual override {
        super._transfer(from,to,tokenId);
        nftIdLookup[tokenId].staker = to;
        nftIdLookup[tokenId].latestTimestamp = block.timestamp;

        
        string memory upcId = nftIdLookup[tokenId].word;
        upcIdLookup[upcId].staker = to;
        upcIdLookup[upcId].latestTimestamp = block.timestamp;
        
    }

    function addWorker(string memory guid, string memory upc) public payable {
        require(msg.value >= workerCost , "Send proper amount in order to add worker");
        require(usedGuids[guid] == false , "Sorry, this worker is already in the mine");
        
        _tokenIds.increment();
          uint256 newNftTokenId = _tokenIds.current();

        usedGuids[guid] = true;
        balance += msg.value;
        WorkerMeta memory workerMeta;
        workerMeta.supervisor = msg.sender;
        workerMeta.guid = guid;
        workerMeta.upc = upc;
        workerMeta.tokenId = newNftTokenId;
        workersForAddress[msg.sender].push(workerMeta);
        workersOnUpc[upc].push(workerMeta);
        _safeMint(msg.sender, newNftTokenId);

    }


}
