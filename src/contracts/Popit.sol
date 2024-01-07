pragma solidity ^0.8.0;

contract Popit {
    struct Pop {
        string link;
        bytes32 hash;
        address owner;
        string upc;
        string human_readable_name;
    }

    mapping(bytes32 => Pop[]) private instanceData;
    mapping(string => Pop[]) private upcData;
    mapping(string => Pop[]) private globalData; // Changed to key on human_readable_name
    uint256 private globalCount;

    event LinkInserted(bytes32 hash, string link, address owner, string upc, string human_readable_name);
    event PopRemoved(bytes32 hash, string link, address owner, string upc, string human_readable_name);

    function checkUniqueness(string memory _human_readable_name) internal view returns (bool) {
        // Check if the human_readable_name already exists in any of the mappings

        // Check instanceData mapping
        for (uint256 i = 0; i < globalCount; i++) {
            for (uint256 j = 0; j < instanceData[globalData[_human_readable_name][j].hash].length; j++) {
                if (keccak256(bytes(instanceData[globalData[_human_readable_name][j].hash][j].human_readable_name)) == keccak256(bytes(_human_readable_name))) {
                    return false; // Not unique
                }
            }
        }

        // Check upcData mapping
        for (uint256 i = 0; i < globalCount; i++) {
            for (uint256 j = 0; j < upcData[globalData[_human_readable_name][j].upc].length; j++) {
                if (keccak256(bytes(upcData[globalData[_human_readable_name][j].upc][j].human_readable_name)) == keccak256(bytes(_human_readable_name))) {
                    return false; // Not unique
                }
            }
        }

        // Check globalData mapping
        for (uint256 j = 0; j < globalData[_human_readable_name].length; j++) {
            if (keccak256(bytes(globalData[_human_readable_name][j].human_readable_name)) == keccak256(bytes(_human_readable_name))) {
                return false; // Not unique
            }
        }

        return true; // Unique
    }

    function insertLink(string memory _link, string memory _upc, string memory _human_readable_name) public {
        require(checkUniqueness(_human_readable_name), "Human readable name must be unique");

        bytes32 hash = sha256(abi.encodePacked(_link));

        Pop memory newPop = Pop({
            link: _link,
            hash: hash,
            owner: msg.sender,
            upc: _upc,
            human_readable_name: _human_readable_name
        });

        instanceData[hash].push(newPop);
        upcData[_upc].push(newPop);
        globalData[_human_readable_name].push(newPop); // Updated to key on human_readable_name
        globalCount++;

        emit LinkInserted(hash, _link, msg.sender, _upc, _human_readable_name);
    }

    function deleteLink(string memory _human_readable_name) public {
        // Find and delete the Pop with the given human_readable_name
        for (uint256 i = 0; i < globalCount; i++) {
            for (uint256 j = 0; j < globalData[_human_readable_name].length; j++) {
                if (keccak256(bytes(globalData[_human_readable_name][j].human_readable_name)) == keccak256(bytes(_human_readable_name))) {
                    // Remove the Pop from all mappings
                    bytes32 hash = globalData[_human_readable_name][j].hash;
                    delete instanceData[hash];
                    delete upcData[globalData[_human_readable_name][j].upc];
                    delete globalData[_human_readable_name][j];

                    emit PopRemoved(hash, globalData[_human_readable_name][j].link, globalData[_human_readable_name][j].owner, globalData[_human_readable_name][j].upc, _human_readable_name);
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
}
