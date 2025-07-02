// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC20Burnable is IERC20 {
    function burn(uint256 amount) external;
}

contract Popit is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Pop {
        uint256 id;
        string link;
        bytes32 hash;
        address owner;
        string upc;
        string human_readable_name;
        uint256 timestamp;
        string protocol; // New field to store protocol identifier
    }

    struct ProtocolParser {
        string protocol;
        string parserUrl;
        address owner;
        uint256 timestamp;
    }

    mapping(bytes32 => Pop) private hashToPop;
    mapping(string => Pop) private upcToPop;
    mapping(string => Pop) private nameToPop;
    mapping(uint256 => Pop) private idToPop;
    mapping(string => ProtocolParser) public protocolParsers;
    mapping(address => string[]) public ownerProtocols;
    
    IERC20Burnable public flipToken;
    uint256 public creationPrice = 1 * (10**18);
    address public defaultFlipToken = 0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118;

    event PopCreated(uint256 id, string link, bytes32 hash, string upc, string name, string protocol);
    event PopRemoved(uint256 id, string link, bytes32 hash);
    event PopUpdated(uint256 id, string newLink);
    event ProtocolParserAdded(string indexed protocol, string parserUrl, address owner);
    event ProtocolParserRemoved(string indexed protocol);

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {
        flipToken = IERC20Burnable(defaultFlipToken);
    }

    // Protocol Parser Management Functions
    function addProtocolParser(string memory protocol, string memory parserUrl) external {
        require(bytes(protocol).length > 0, "Protocol cannot be empty");
        require(bytes(parserUrl).length > 0, "Parser URL cannot be empty");
        require(bytes(protocolParsers[protocol].protocol).length == 0, "Protocol already exists");
        
        protocolParsers[protocol] = ProtocolParser({
            protocol: protocol,
            parserUrl: parserUrl,
            owner: msg.sender,
            timestamp: block.timestamp
        });
        
        ownerProtocols[msg.sender].push(protocol);
        emit ProtocolParserAdded(protocol, parserUrl, msg.sender);
    }

    function removeProtocolParser(string memory protocol) external {
        require(protocolParsers[protocol].owner == msg.sender, "Not the parser owner");
        delete protocolParsers[protocol];
        emit ProtocolParserRemoved(protocol);
    }

    function getParserForProtocol(string memory protocol) public view returns (ProtocolParser memory) {
        return protocolParsers[protocol];
    }

    function getProtocolsByOwner(address owner) public view returns (string[] memory) {
        return ownerProtocols[owner];
    }

    // Modified Pop Functions with Protocol Support
    function insertLink(string memory _link, string memory _upc, string memory _human_readable_name, string memory _protocol) public {
        require(nameToPop[_human_readable_name].id == 0, "Name must be unique");
        require(flipToken.transferFrom(msg.sender, address(this), creationPrice), "FLIP transfer failed");
        flipToken.burn(creationPrice);

        bytes32 hash = keccak256(abi.encodePacked(_human_readable_name));
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();

        Pop memory newPop = Pop({
            id: newId,
            link: _link,
            hash: hash,
            owner: msg.sender,
            upc: _upc,
            human_readable_name: _human_readable_name,
            timestamp: block.timestamp,
            protocol: _protocol
        });

        hashToPop[hash] = newPop;
        upcToPop[_upc] = newPop;
        nameToPop[_human_readable_name] = newPop;
        idToPop[newId] = newPop;

        _safeMint(msg.sender, newId);
        emit PopCreated(newId, _link, hash, _upc, _human_readable_name, _protocol);
    }

    function createPop(string memory link, string memory upc, string memory name, string memory protocol) external {
        require(flipToken.balanceOf(msg.sender) >= creationPrice, "Insufficient balance");
        require(flipToken.transferFrom(msg.sender, address(this), creationPrice), "Payment failed");
        flipToken.burn(creationPrice);

        bytes32 hash = keccak256(abi.encodePacked(name));
        require(nameToPop[name].id == 0, "Name already exists");

        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        
        Pop memory newPop = Pop({
            id: newId,
            link: link,
            hash: hash,
            owner: msg.sender,
            upc: upc,
            human_readable_name: name,
            timestamp: block.timestamp,
            protocol: protocol
        });

        hashToPop[hash] = newPop;
        upcToPop[upc] = newPop;
        nameToPop[name] = newPop;
        idToPop[newId] = newPop;

        _safeMint(msg.sender, newId);
        emit PopCreated(newId, link, hash, upc, name, protocol);
    }

    // Existing functions remain the same but with protocol awareness
    function getPopById(uint256 id) public view returns (Pop memory) {
        require(exists(id), "Pop does not exist");
        return idToPop[id];
    }

    function getPopByHash(bytes32 hash) public view returns (Pop memory) {
        require(hashToPop[hash].id != 0, "Pop not found");
        return hashToPop[hash];
    }

    function getPopByUPC(string memory upc) public view returns (Pop memory) {
        require(upcToPop[upc].id != 0, "Pop not found");
        return upcToPop[upc];
    }

    function getPopByName(string memory name) public view returns (Pop memory) {
        require(nameToPop[name].id != 0, "Pop not found");
        return nameToPop[name];
    }

    function getPopsByProtocol(string memory protocol) public view returns (Pop[] memory) {
        uint256 count = 0;
        uint256 total = _tokenIds.current();
        
        // First pass: count matching pops
        for (uint256 i = 1; i <= total; i++) {
            if (idToPop[i].id != 0 && 
                keccak256(abi.encodePacked(idToPop[i].protocol)) == 
                keccak256(abi.encodePacked(protocol))) {
                count++;
            }
        }
        
        // Second pass: populate results
        Pop[] memory results = new Pop[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (idToPop[i].id != 0 && 
                keccak256(abi.encodePacked(idToPop[i].protocol)) == 
                keccak256(abi.encodePacked(protocol))) {
                results[index] = idToPop[i];
                index++;
            }
        }
        
        return results;
    }

    // Existing utility functions
    function exists(uint256 tokenId) public view returns (bool) {
        return idToPop[tokenId].id != 0;
    }

    function totalPops() public view returns (uint256) {
        return _tokenIds.current();
    }

    function setCreationPrice(uint256 newPrice) external onlyOwner {
        creationPrice = newPrice;
    }

    function setFlipToken(address tokenAddress) external onlyOwner {
        flipToken = IERC20Burnable(tokenAddress);
    }
}
