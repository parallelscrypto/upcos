pragma solidity ^0.8.0;

pragma experimental ABIEncoderV2;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";


import "./Flip.sol";



contract Popit is ERC721, Ownable{
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

    mapping(bytes32 => Pop[]) private instanceData;
    mapping(string => Pop[]) private upcData;
    mapping(string => Pop[]) private globalData; // Changed to key on human_readable_name
    mapping(uint256 => Pop[]) private universalData; // New mapping
    Flip    private _token;
    uint256  public latestTokenId;
    uint256  public price = 100000000000000000;



    event LinkInserted(bytes32 hash, string link, address owner, string upc, string human_readable_name);
    event PopRemoved(bytes32 hash, string link, address owner, string upc, string human_readable_name);
    

    constructor() ERC721("PrivateProtocolLink", "PPL") Ownable()  {
        _token = Flip(0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118);
    }

    function setPrice(uint256  _price) external onlyOwner {
        price = _price;
    }


    function setPayToken(address  addy) external onlyOwner {
        _token = Flip(addy);
    }



    function checkUniqueness(string memory _human_readable_name) public view returns (bool) {
        // Check if the human_readable_name already exists in any of the mappings

        // Check globalData mapping
        for (uint256 i = 0; i < globalData[_human_readable_name].length; i++) {
            if (keccak256(bytes(globalData[_human_readable_name][i].human_readable_name)) == keccak256(bytes(_human_readable_name))) {
                return false; // Not unique
            }
        }

        return true; // Unique
    }

    function insertLink(string memory _link, string memory _upc, string memory _human_readable_name) public {
        require(checkUniqueness(_human_readable_name), "Human readable name must be unique");

        _token.transferFrom(msg.sender, address(this), price);
        _token.burn(price);

        bytes32 hash = sha256(abi.encodePacked(_human_readable_name));


        _tokenIds.increment();
        uint256 newNftTokenId = _tokenIds.current();
        latestTokenId = newNftTokenId;



        Pop memory newPop = Pop({
            id: latestTokenId,
            link: _link,
            hash: hash,
            owner: msg.sender,
            upc: _upc,
            human_readable_name: _human_readable_name,
            timestamp: block.timestamp // Set timestamp upon pushing a new item
        });

        instanceData[hash].push(newPop);
        upcData[_upc].push(newPop);
        globalData[_human_readable_name].push(newPop); // Updated to key on human_readable_name
        universalData[latestTokenId + 1].push(newPop); // Increment and push to universalData

        
        _safeMint(msg.sender, latestTokenId);


        latestTokenId++;

        emit LinkInserted(hash, _link, msg.sender, _upc, _human_readable_name);
    }


    function deleteLink(string memory _human_readable_name) public {
        // Find and delete the Pop with the given human_readable_name
        for (uint256 i = 0; i < latestTokenId; i++) {
            for (uint256 j = 0; j < globalData[_human_readable_name].length; j++) {
                if (keccak256(bytes(globalData[_human_readable_name][j].human_readable_name)) == keccak256(bytes(_human_readable_name))) {
                    // Check if the sender is the owner of the Pop
                    require(msg.sender == globalData[_human_readable_name][j].owner, "Only the owner can delete this Pop");

                    // Remove the Pop from all mappings
                    bytes32 hash = globalData[_human_readable_name][j].hash;
                    delete instanceData[hash];
                    emit PopRemoved(hash, globalData[_human_readable_name][j].link, globalData[_human_readable_name][j].owner, globalData[_human_readable_name][j].upc, _human_readable_name);

                    // Remove only the specific item with the given human_readable_name from upcData
                    Pop[] storage upcArray = upcData[globalData[_human_readable_name][j].upc];
                    for (uint256 k = 0; k < upcArray.length; k++) {
                        if (upcArray[k].hash == hash) {
                            // Shift elements after the deleted one to fill the gap
                            for (uint256 l = k; l < upcArray.length - 1; l++) {
                                upcArray[l] = upcArray[l + 1];
                            }
                            // Remove the last element (empty slot)
                            upcArray.pop();
                            break;
                        }
                    }

                    // Remove the Pop from globalData after updating upcData
                    globalData[_human_readable_name][j] = globalData[_human_readable_name][globalData[_human_readable_name].length - 1];
                    globalData[_human_readable_name].pop();

                    // Remove the Pop from universalData
                    Pop[] storage universalArray = universalData[latestTokenId];
                    for (uint256 m = 0; m < universalArray.length; m++) {
                        if (universalArray[m].hash == hash) {
                            // Shift elements after the deleted one to fill the gap
                            for (uint256 n = m; n < universalArray.length - 1; n++) {
                                universalArray[n] = universalArray[n + 1];
                            }
                            // Remove the last element (empty slot)
                            universalArray.pop();
                            break;
                        }
                    }

                    break; // Stop searching once found and processed
                }
            }
        }
    }


    function getPopByInstance(bytes32 _hash) public view returns (Pop[] memory) {
        return instanceData[_hash];
    }

    function getPopByUpc(string memory _upc) public view returns (Pop[] memory) {
        return upcData[_upc];
    }

    function getPopByGlobalName(string memory _human_readable_name) public view returns (Pop[] memory) {
        return globalData[_human_readable_name];
    }

    function getUniversalData(uint256 start, uint256 end) public view returns (Pop[] memory) {
        // Check if the end parameter is less than or equal to the latestTokenId
        if (end > latestTokenId) {
            end = latestTokenId;
        }

        Pop[] memory result = new Pop[](end - start + 1);
        uint256 index = 0;

        for (uint256 i = start; i <= end; i++) {
            Pop[] memory currentData = universalData[i];
            for (uint256 j = 0; j < currentData.length; j++) {
                result[index++] = currentData[j];
            }
        }

        return result;
    }
}
