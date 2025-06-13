// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRawMaterial {
    function getUpcOwner(string memory _upc) external view returns (address);
}

contract SerialBox {
    address public constant REWARD_TOKEN = 0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118;
    
    address public owner;
    string public upc;
    string public serialNumber;
    string public fullURL;
    string public message;
    uint256 public createdAt;
    bytes32 private passwordHash;
    
    event TokensDeposited(address indexed depositor, uint256 amount);
    event TokensClaimed(address indexed claimer, uint256 amount);
    event MessageUpdated(string newMessage);
    event SerialNumberUpdated(string newSerialNumber);
    event PasswordHashUpdated();
    
    constructor(address _owner, string memory _upc) {
        owner = _owner;
        upc = _upc;
        createdAt = block.timestamp;
    }
    
    function deposit(uint256 _amount) external {
        IERC20 token = IERC20(REWARD_TOKEN);
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        emit TokensDeposited(msg.sender, _amount);
    }
    
    function claim(string memory _password) external {
        require(passwordHash != bytes32(0), "Password not set");
        require(sha256(abi.encodePacked(_password)) == passwordHash, "Incorrect password");
        
        uint256 balance = IERC20(REWARD_TOKEN).balanceOf(address(this));
        require(balance > 0, "No tokens to claim");
        
        IERC20 token = IERC20(REWARD_TOKEN);
        require(token.transfer(msg.sender, balance), "Transfer failed");
        emit TokensClaimed(msg.sender, balance);
    }
    
    function setMessage(string memory _newMessage) external {
        require(msg.sender == owner, "Only owner can update message");
        message = _newMessage;
        emit MessageUpdated(_newMessage);
    }
    
    function setSerialNumber(string memory _newSerial) external {
        serialNumber = _newSerial;
        emit SerialNumberUpdated(_newSerial);
    }

    function _bytes32ToString(bytes32 _bytes) internal pure returns (string memory) {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i] = _bytes[i];
        }
        return string(bytesArray);
    }

    function updateURL(string memory _newURL) external {
        require(msg.sender == owner, "Only owner can update");
        fullURL = _newURL;
        serialNumber = _bytes32ToString(sha256(bytes(_newURL)));
        emit SerialNumberUpdated(serialNumber);
    }

    function setPasswordHash(bytes32 _passwordHash) external {
        require(msg.sender == owner, "Only owner can set password");
        passwordHash = _passwordHash;
        emit PasswordHashUpdated();
    }
    
    function getPasswordHash() external view returns (bytes32) {
        require(msg.sender == owner, "Only owner can view password hash");
        return passwordHash;
    }
    
    function getInfo() external view returns (
        string memory _upc,
        string memory _serialNumber,
        string memory _fullURL,
        string memory _message,
        uint256 _balance,
        uint256 _createdAt,
        bool _hasPassword
    ) {
        return (
            upc,
            serialNumber,
            fullURL,
            message,
            IERC20(REWARD_TOKEN).balanceOf(address(this)),
            createdAt,
            passwordHash != bytes32(0)
        );
    }
    
    function balance() external view returns (uint256) {
        return IERC20(REWARD_TOKEN).balanceOf(address(this));
    }
}

contract SerialBoxFactory is Ownable {
    address public constant REWARD_TOKEN = 0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118;
    address public constant RAW_MATERIAL_ADDRESS = 0x2C343942548319cCfc05666FF15d73E8569FaEdf;
    
    uint256 public rewardTokens = 1 ether;
    uint256 public creationPrice = 0.1 ether;
    uint256 public factoryCreatedAt;
    
    struct SerialBoxInfo {
        address owner;
        string upc;
        string serialNumber;
        string url;
        address contractAddress;
        uint256 createdAt;
    }
    
    mapping(string => SerialBoxInfo) public serialBoxes;
    mapping(address => string[]) public ownerToSerialNumbers;
    mapping(string => string[]) public upcToSerialNumbers;
    
    event SerialBoxCreated(
        address indexed owner,
        string upc,
        string serialNumber,
        address contractAddress,
        uint256 createdAt
    );
    
    event URLUpdated(
        string indexed serialNumber,
        string newUrl,
        uint256 rewardAmount
    );
    
    event RewardTokensUpdated(uint256 newAmount);
    event CreationPriceUpdated(uint256 newPrice);
    event TokensDeposited(uint256 amount);
    
    constructor() Ownable(msg.sender) {
        factoryCreatedAt = block.timestamp;
    }

    function createSerialBox(string memory _upc) external payable {
        require(bytes(_upc).length > 0, "UPC cannot be empty");
        
        IRawMaterial rawMaterial = IRawMaterial(RAW_MATERIAL_ADDRESS);
        address upcOwner = rawMaterial.getUpcOwner(_upc);
        
        uint256 requiredPayment = creationPrice;
        
        if (upcOwner != address(0)) {
            require(upcOwner == msg.sender, "UPC owned by another address");
            requiredPayment = (creationPrice * 5) / 100;
        }
        
        require(msg.value >= requiredPayment, "Insufficient payment");
        
        payable(owner()).transfer(requiredPayment);
        
        if (msg.value > requiredPayment) {
            payable(msg.sender).transfer(msg.value - requiredPayment);
        }
        
        string memory initialSerial = string(abi.encodePacked(
            _upc, "-", 
            _toString(uint160(msg.sender)), "-", 
            _toString(block.timestamp)
        ));
        
        SerialBox newSerialBox = new SerialBox(msg.sender, _upc);
        uint256 boxCreatedAt = block.timestamp;
        
        SerialBoxInfo memory info = SerialBoxInfo({
            owner: msg.sender,
            upc: _upc,
            serialNumber: initialSerial,
            url: "",
            contractAddress: address(newSerialBox),
            createdAt: boxCreatedAt
        });
        
        serialBoxes[initialSerial] = info;
        ownerToSerialNumbers[msg.sender].push(initialSerial);
        upcToSerialNumbers[_upc].push(initialSerial);
        
        emit SerialBoxCreated(msg.sender, _upc, initialSerial, address(newSerialBox), boxCreatedAt);
    }

    function updateURL(string memory _newURL) external {
        require(bytes(_newURL).length > 0, "URL cannot be empty");
        
        string[] storage serials = ownerToSerialNumbers[msg.sender];
        require(serials.length > 0, "No boxes found");
        
        string storage currentSerial = serials[0];
        SerialBoxInfo storage info = serialBoxes[currentSerial];
        require(info.contractAddress != address(0), "SerialBox not found");

        SerialBox(info.contractAddress).updateURL(_newURL);
        
        string memory newSerialNumber = _bytes32ToString(sha256(bytes(_newURL)));
        
        info.serialNumber = newSerialNumber;
        info.url = _newURL;
        
        emit URLUpdated(newSerialNumber, _newURL, 0);
    }

    function _bytes32ToString(bytes32 _bytes) internal pure returns (string memory) {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i] = _bytes[i];
        }
        return string(bytesArray);
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _toString(address addr) internal pure returns (string memory) {
        return _toString(uint160(addr));
    }

    function getSerialBoxesByUPC(string memory _upc) external view returns (SerialBoxInfo[] memory) {
        string[] memory serials = upcToSerialNumbers[_upc];
        SerialBoxInfo[] memory result = new SerialBoxInfo[](serials.length);
        
        for (uint i = 0; i < serials.length; i++) {
            result[i] = serialBoxes[serials[i]];
        }
        return result;
    }
    
    function getSerialBoxesByOwner(address _owner) external view returns (SerialBoxInfo[] memory) {
        string[] memory serials = ownerToSerialNumbers[_owner];
        SerialBoxInfo[] memory result = new SerialBoxInfo[](serials.length);
        
        for (uint i = 0; i < serials.length; i++) {
            result[i] = serialBoxes[serials[i]];
        }
        return result;
    }
    
    function setRewardTokens(uint256 _newAmount) external onlyOwner {
        rewardTokens = _newAmount;
        emit RewardTokensUpdated(_newAmount);
    }
    
    function setCreationPrice(uint256 _newPrice) external onlyOwner {
        creationPrice = _newPrice;
        emit CreationPriceUpdated(_newPrice);
    }
    
    function depositTokens(uint256 _amount) external {
        IERC20(REWARD_TOKEN).transferFrom(msg.sender, address(this), _amount);
        emit TokensDeposited(_amount);
    }
    
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
        uint256 tokenBalance = IERC20(REWARD_TOKEN).balanceOf(address(this));
        if (tokenBalance > 0) {
            IERC20(REWARD_TOKEN).transfer(owner(), tokenBalance);
        }
    }
}
