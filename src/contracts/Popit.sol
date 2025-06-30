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
    }

    mapping(bytes32 => Pop) private hashToPop;
    mapping(string => Pop) private upcToPop;
    mapping(string => Pop) private nameToPop;
    mapping(uint256 => Pop) private idToPop;
    
    IERC20Burnable public flipToken;
    uint256 public creationPrice = 500 * (10**18);
    address public defaultFlipToken = 0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118;

    event PopCreated(uint256 id, string link, bytes32 hash, string upc, string name);
    event PopRemoved(uint256 id, string link, bytes32 hash);
    event PopUpdated(uint256 id, string newLink);

    constructor() ERC721("Popit", "POP") Ownable(msg.sender) {
        flipToken = IERC20Burnable(defaultFlipToken);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return idToPop[tokenId].id != 0;
    }

    function insertLink(string memory _link, string memory _upc, string memory _human_readable_name) public {
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
            timestamp: block.timestamp
        });

        hashToPop[hash] = newPop;
        upcToPop[_upc] = newPop;
        nameToPop[_human_readable_name] = newPop;
        idToPop[newId] = newPop;

        _safeMint(msg.sender, newId);
        emit PopCreated(newId, _link, hash, _upc, _human_readable_name);
    }

    function createPop(string memory link, string memory upc, string memory name) external {
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
            timestamp: block.timestamp
        });

        hashToPop[hash] = newPop;
        upcToPop[upc] = newPop;
        nameToPop[name] = newPop;
        idToPop[newId] = newPop;

        _safeMint(msg.sender, newId);
        emit PopCreated(newId, link, hash, upc, name);
    }

    function removePop(uint256 id) external {
        require(exists(id), "Pop does not exist");
        require(ownerOf(id) == msg.sender, "Not owner");

        Pop memory pop = idToPop[id];
        delete hashToPop[pop.hash];
        delete upcToPop[pop.upc];
        delete nameToPop[pop.human_readable_name];
        delete idToPop[id];

        _burn(id);
        emit PopRemoved(id, pop.link, pop.hash);
    }

    function updateLink(uint256 id, string memory newLink) external {
        require(exists(id), "Pop does not exist");
        require(ownerOf(id) == msg.sender, "Not owner");

        Pop storage pop = idToPop[id];
        pop.link = newLink;
        
        hashToPop[pop.hash].link = newLink;
        upcToPop[pop.upc].link = newLink;
        nameToPop[pop.human_readable_name].link = newLink;

        emit PopUpdated(id, newLink);
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
