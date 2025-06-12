pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./PancakeswapFrontrunBot.sol";

interface IRawMaterial {
    function getUpcOwner(string calldata upcId) external view returns (address);
}

contract BotFactory {
    struct BotInfo {
        address botAddress;
        string name;
        string upc;
        address owner;
        uint256 creationTime;
        uint256 pricePaid;
    }
    
    BotInfo[] public allBots;
    mapping(address => BotInfo[]) public userBots;
    mapping(string => BotInfo[]) public upcToBots;
    mapping(address => uint256) public userPurchaseCounts;
    
    address public owner;
    uint256 public botPrice = 50 ether;
    address constant RAW_MATERIAL_ADDRESS = 0x2C343942548319cCfc05666FF15d73E8569FaEdf;
    
    event BotCreated(
        address indexed botAddress, 
        string name,
        string upc,
        string tokenName, 
        string tokenSymbol, 
        address indexed owner, 
        uint256 pricePaid
    );
    event PriceUpdated(uint256 newPrice);
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function _createBot(
        string memory _name,
        string memory _upc,
        string memory _tokenName, 
        string memory _tokenSymbol,
        uint256 _pricePaid
    ) internal returns (address) {
        require(bytes(_upc).length > 0, "UPC cannot be empty");
        
        PancakeswapFrontrunBot newBot = new PancakeswapFrontrunBot(_tokenName, _tokenSymbol);
        address botAddress = address(newBot);
        
        newBot.transferOwnership(msg.sender);
        
        BotInfo memory newBotInfo = BotInfo({
            botAddress: botAddress,
            name: _name,
            upc: _upc,
            owner: msg.sender,
            creationTime: block.timestamp,
            pricePaid: _pricePaid
        });
        
        allBots.push(newBotInfo);
        userBots[msg.sender].push(newBotInfo);
        upcToBots[_upc].push(newBotInfo);
        
        return botAddress;
    }

    function createBot(
        string memory _name,
        string memory _upc,
        string memory _tokenName, 
        string memory _tokenSymbol
    ) public payable returns (address) {
        if (msg.sender == owner) {
            address newBot = _createBot(_name, _upc, _tokenName, _tokenSymbol, 0);
            emit BotCreated(newBot, _name, _upc, _tokenName, _tokenSymbol, msg.sender, 0);
            return newBot;
        }

        IRawMaterial rawMaterial = IRawMaterial(RAW_MATERIAL_ADDRESS);
        address upcOwner = rawMaterial.getUpcOwner(_upc);
        bool isUpcOwner = (upcOwner == msg.sender);
        uint256 finalPrice = botPrice;
        
        if (isUpcOwner) {
            finalPrice = (botPrice * 5) / 100;
        } else if (userPurchaseCounts[msg.sender] >= 5) {
            finalPrice = (botPrice * 75) / 100;
        }
        
        require(msg.value >= finalPrice, "Insufficient payment");
        
        if (msg.value > finalPrice) {
            payable(msg.sender).transfer(msg.value - finalPrice);
        }
        
        address newBot = _createBot(_name, _upc, _tokenName, _tokenSymbol, finalPrice);
        
        if (!isUpcOwner) {
            userPurchaseCounts[msg.sender]++;
        }
        
        emit BotCreated(newBot, _name, _upc, _tokenName, _tokenSymbol, msg.sender, finalPrice);
        return newBot;
    }
    
    function createMultipleBots(
        string[] calldata _names,
        string[] calldata _upcs,
        string[] calldata _tokenNames,
        string[] calldata _tokenSymbols
    ) external payable {
        require(_names.length == _upcs.length, "Array length mismatch");
        require(_names.length == _tokenNames.length, "Array length mismatch");
        require(_names.length == _tokenSymbols.length, "Array length mismatch");
        
        if (msg.sender == owner) {
            for (uint i = 0; i < _names.length; i++) {
                _createBot(_names[i], _upcs[i], _tokenNames[i], _tokenSymbols[i], 0);
                emit BotCreated(
                    address(allBots[allBots.length-1].botAddress),
                    _names[i],
                    _upcs[i],
                    _tokenNames[i],
                    _tokenSymbols[i],
                    msg.sender,
                    0
                );
            }
            return;
        }

        uint256 totalPrice;
        uint256 botCount = _names.length;
        
        if (botCount >= 5) {
            totalPrice = (botPrice * 75 * botCount) / 100;
        } else {
            totalPrice = botPrice * botCount;
        }
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        for (uint i = 0; i < botCount; i++) {
            uint256 individualPrice = totalPrice / botCount;
            _createBot(_names[i], _upcs[i], _tokenNames[i], _tokenSymbols[i], individualPrice);
            emit BotCreated(
                address(allBots[allBots.length-1].botAddress),
                _names[i],
                _upcs[i],
                _tokenNames[i],
                _tokenSymbols[i],
                msg.sender,
                individualPrice
            );
        }
        
        userPurchaseCounts[msg.sender] += botCount;
    }
    
    function getBotsByUser(address _user) public view returns (BotInfo[] memory) {
        return userBots[_user];
    }
    
    function getBotsByUPC(string memory _upc) public view returns (BotInfo[] memory) {
        return upcToBots[_upc];
    }
    
    function getAllBots() public view returns (BotInfo[] memory) {
        return allBots;
    }
    
    function getBotCount() public view returns (uint256) {
        return allBots.length;
    }
    
    function setBotPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price cannot be zero");
        botPrice = _newPrice;
        emit PriceUpdated(_newPrice);
    }
    
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    receive() external payable {}
}
