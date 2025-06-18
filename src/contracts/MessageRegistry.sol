// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MessageRegistry {
    // Maps user address => public key
    mapping(address => bytes) public publicKeys;

    // Struct for stored messages
    struct Message {
        address sender;
        address recipient;
        string arweaveTxId; // Reference to encrypted data on Arweave
        uint256 timestamp;
    }

    Message[] public messages;

    // Events
    event PublicKeyRegistered(address user, bytes publicKey);
    event MessageSent(address sender, address recipient, string arweaveTxId);

    // Register a user's public key
    function registerPublicKey(bytes calldata _publicKey) external {
        publicKeys[msg.sender] = _publicKey;
        emit PublicKeyRegistered(msg.sender, _publicKey);
    }

    // Store a message reference
    function sendMessage(address _recipient, string calldata _arweaveTxId) external {
        messages.push(Message({
            sender: msg.sender,
            recipient: _recipient,
            arweaveTxId: _arweaveTxId,
            timestamp: block.timestamp
        }));
        emit MessageSent(msg.sender, _recipient, _arweaveTxId);
    }

    // Get messages for a recipient
    function getMessages(address _recipient) external view returns (Message[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < messages.length; i++) {
            if (messages[i].recipient == _recipient) count++;
        }

        Message[] memory result = new Message[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < messages.length; i++) {
            if (messages[i].recipient == _recipient) {
                result[index] = messages[i];
                index++;
            }
        }
        return result;
    }
}


