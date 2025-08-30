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
        string protocol;
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
    
    // Protocol ownership and authorized writers
    mapping(string => address) public protocolOwners;
    mapping(string => mapping(address => bool)) public protocolWriters;
    mapping(string => address[]) private protocolWritersList;
    
    IERC20Burnable public flipToken;
    uint256 public creationPrice = 1 * (10**18);
    address public defaultFlipToken = 0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118;

    address[] private allParserOwners;
    string[] private allProtocols;

    event PopCreated(uint256 id, string link, bytes32 hash, string upc, string name, string protocol);
    event PopRemoved(uint256 id, string link, bytes32 hash);
    event PopUpdated(uint256 id, string newLink);
    event ProtocolParserAdded(string indexed protocol, string parserUrl, address owner);
    event ProtocolParserRemoved(string indexed protocol);
    event ProtocolWriterAdded(string indexed protocol, address writer);
    event ProtocolWriterRemoved(string indexed protocol, address writer);

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {
        flipToken = IERC20Burnable(defaultFlipToken);
    }

    // Protocol Ownership Management
    function _isProtocolWriter(string memory protocol, address account) private view returns (bool) {
        return protocolOwners[protocol] == account || protocolWriters[protocol][account];
    }

    function addProtocolWriter(string memory protocol, address writer) external {
        require(protocolOwners[protocol] == msg.sender, "Only protocol owner can add writers");
        require(!protocolWriters[protocol][writer], "Address is already a writer");
        
        protocolWriters[protocol][writer] = true;
        protocolWritersList[protocol].push(writer);
        emit ProtocolWriterAdded(protocol, writer);
    }

    function removeProtocolWriter(string memory protocol, address writer) external {
        require(protocolOwners[protocol] == msg.sender, "Only protocol owner can remove writers");
        require(protocolWriters[protocol][writer], "Address is not a writer");
        
        protocolWriters[protocol][writer] = false;
        
        address[] storage writers = protocolWritersList[protocol];
        for (uint i = 0; i < writers.length; i++) {
            if (writers[i] == writer) {
                writers[i] = writers[writers.length - 1];
                writers.pop();
                break;
            }
        }
        
        emit ProtocolWriterRemoved(protocol, writer);
    }

    function getProtocolOwner(string memory protocol) public view returns (address) {
        return protocolOwners[protocol];
    }

    function isProtocolWriter(string memory protocol, address account) public view returns (bool) {
        return _isProtocolWriter(protocol, account);
    }

    function getProtocolWriters(string memory protocol) public view returns (address[] memory) {
        return protocolWritersList[protocol];
    }

    function getWritersAddedByMe() public view returns (string[] memory protocols, address[][] memory writers) {
        uint count = 0;
        
        for (uint i = 0; i < allProtocols.length; i++) {
            if (protocolOwners[allProtocols[i]] == msg.sender) {
                count++;
            }
        }
        
        protocols = new string[](count);
        writers = new address[][](count);
        
        uint index = 0;
        for (uint i = 0; i < allProtocols.length; i++) {
            string memory protocol = allProtocols[i];
            if (protocolOwners[protocol] == msg.sender) {
                protocols[index] = protocol;
                writers[index] = protocolWritersList[protocol];
                index++;
            }
        }
        
        return (protocols, writers);
    }

    function addProtocolParser(string memory protocol, string memory parserUrl) external {
        require(bytes(protocol).length > 0, "Protocol cannot be empty");
        require(bytes(parserUrl).length > 0, "Parser URL cannot be empty");
        require(bytes(protocolParsers[protocol].protocol).length == 0, "Protocol already exists");
        
        if (protocolOwners[protocol] == address(0)) {
            protocolOwners[protocol] = msg.sender;
        }
        
        protocolParsers[protocol] = ProtocolParser({
            protocol: protocol,
            parserUrl: parserUrl,
            owner: msg.sender,
            timestamp: block.timestamp
        });
        
        ownerProtocols[msg.sender].push(protocol);
        allProtocols.push(protocol);
        
        bool ownerExists = false;
        for (uint i = 0; i < allParserOwners.length; i++) {
            if (allParserOwners[i] == msg.sender) {
                ownerExists = true;
                break;
            }
        }
        if (!ownerExists) {
            allParserOwners.push(msg.sender);
        }
        
        emit ProtocolParserAdded(protocol, parserUrl, msg.sender);
    }

    function removeProtocolParser(string memory protocol) external {
        require(protocolParsers[protocol].owner == msg.sender, "Not the parser owner");
        
        for (uint i = 0; i < allProtocols.length; i++) {
            if (keccak256(abi.encodePacked(allProtocols[i])) == keccak256(abi.encodePacked(protocol))) {
                allProtocols[i] = allProtocols[allProtocols.length - 1];
                allProtocols.pop();
                break;
            }
        }
        
        string[] storage protocols = ownerProtocols[msg.sender];
        for (uint i = 0; i < protocols.length; i++) {
            if (keccak256(abi.encodePacked(protocols[i])) == keccak256(abi.encodePacked(protocol))) {
                protocols[i] = protocols[protocols.length - 1];
                protocols.pop();
                break;
            }
        }
        
        if (ownerProtocols[msg.sender].length == 0) {
            for (uint i = 0; i < allParserOwners.length; i++) {
                if (allParserOwners[i] == msg.sender) {
                    allParserOwners[i] = allParserOwners[allParserOwners.length - 1];
                    allParserOwners.pop();
                    break;
                }
            }
        }
        
        delete protocolParsers[protocol];
        emit ProtocolParserRemoved(protocol);
    }

    function getParserForProtocol(string memory protocol) public view returns (ProtocolParser memory) {
        return protocolParsers[protocol];
    }

    function getAllProtocolParsers() public view returns (ProtocolParser[] memory) {
        ProtocolParser[] memory parsers = new ProtocolParser[](allProtocols.length);
        
        for (uint256 i = 0; i < allProtocols.length; i++) {
            parsers[i] = protocolParsers[allProtocols[i]];
        }
        
        return parsers;
    }

    function getProtocolsByOwner(address owner) public view returns (string[] memory) {
        return ownerProtocols[owner];
    }

    function updateLink(uint256 id, string memory newLink) external {
        require(exists(id), "Pop does not exist");
        require(idToPop[id].owner == msg.sender, "Only the owner can update the link");
        require(bytes(newLink).length > 0, "Link cannot be empty");
        
        Pop storage popToUpdate = idToPop[id];
        popToUpdate.link = newLink;
        
        hashToPop[popToUpdate.hash].link = newLink;
        upcToPop[popToUpdate.upc].link = newLink;
        nameToPop[popToUpdate.human_readable_name].link = newLink;
        
        emit PopUpdated(id, newLink);
    }

    function insertLink(string memory _link, string memory _upc, string memory _human_readable_name, string memory _protocol) public {
        require(nameToPop[_human_readable_name].id == 0, "Name must be unique");
        
        if (protocolOwners[_protocol] != address(0)) {
            require(_isProtocolWriter(_protocol, msg.sender), "Not authorized to create for this protocol");
        }
        
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

        if (protocolOwners[_protocol] == address(0)) {
            protocolOwners[_protocol] = msg.sender;
        }

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

        if (protocolOwners[protocol] != address(0)) {
            require(_isProtocolWriter(protocol, msg.sender), "Not authorized to create for this protocol");
        }

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

        if (protocolOwners[protocol] == address(0)) {
            protocolOwners[protocol] = msg.sender;
        }

        hashToPop[hash] = newPop;
        upcToPop[upc] = newPop;
        nameToPop[name] = newPop;
        idToPop[newId] = newPop;

        _safeMint(msg.sender, newId);
        emit PopCreated(newId, link, hash, upc, name, protocol);
    }

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
        
        for (uint256 i = 1; i <= total; i++) {
            if (idToPop[i].id != 0 && 
                keccak256(abi.encodePacked(idToPop[i].protocol)) == 
                keccak256(abi.encodePacked(protocol))) {
                count++;
            }
        }
        
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

    function getAllProtocols() public view returns (string[] memory) {
        uint256 count = 0;
        uint256 total = _tokenIds.current();
        for (uint256 i = 1; i <= total; i++) {
            if (idToPop[i].id != 0) {
                bool exists = false;
                for (uint256 j = 1; j < i; j++) {
                    if (idToPop[j].id != 0 && 
                        keccak256(abi.encodePacked(idToPop[i].protocol)) == 
                        keccak256(abi.encodePacked(idToPop[j].protocol))) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    count++;
                }
            }
        }
        
        string[] memory protocols = new string[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (idToPop[i].id != 0) {
                bool exists = false;
                for (uint256 j = 0; j < index; j++) {
                    if (keccak256(abi.encodePacked(protocols[j])) == 
                        keccak256(abi.encodePacked(idToPop[i].protocol))) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    protocols[index] = idToPop[i].protocol;
                    index++;
                }
            }
        }
        
        return protocols;
    }

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
