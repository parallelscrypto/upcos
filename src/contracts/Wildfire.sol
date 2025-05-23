// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WildfireBurn is Ownable {
    using Counters for Counters.Counter;
    
    address public constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    Counters.Counter private _wildfireIds;
    
    struct Badge {
        uint256 threshold;
        string imageUrl;
        string description;
    }
    
    struct Wildfire {
        uint256 id;
        address creator;
        address tokenAddress;
        string tokenName;
        string missionStatement;
        uint256 targetBurnAmount;
        uint256 startDate;
        uint256 tokensPerMine;
        uint256 minePrice;
        uint256 totalDeposited;
        uint256 totalMined;
        uint256 totalBurned;
        bool isActive;
    }
    
    struct BurnRecord {
        address burner;
        uint256 amount;
        string consoleUrl;
        string consoleHash;
        uint256 timestamp;
    }
    
    mapping(uint256 => Wildfire) public wildfires;
    mapping(uint256 => Badge[]) public wildfireBadges;
    mapping(uint256 => BurnRecord[]) public wildfireBurns;
    mapping(uint256 => mapping(address => uint256)) public userBurnsPerWildfire;
    mapping(uint256 => mapping(string => uint256)) public consoleBurnsPerWildfire;
    mapping(uint256 => mapping(address => uint256[])) public userBadges;
    
    event WildfireCreated(
        uint256 indexed id,
        address indexed creator,
        address tokenAddress,
        string tokenName,
        string missionStatement,
        uint256 targetBurnAmount,
        uint256 startDate
    );
    
    event TokensDeposited(
        uint256 indexed wildfireId,
        uint256 amount,
        uint256 newTotal
    );
    
    event TokensMined(
        uint256 indexed wildfireId,
        address indexed miner,
        uint256 amount
    );
    
    event TokensBurned(
        uint256 indexed wildfireId,
        address indexed burner,
        uint256 amount,
        string consoleUrl,
        string consoleHash
    );
    
    event BadgeEarned(
        uint256 indexed wildfireId,
        address indexed user,
        uint256 badgeIndex,
        string imageUrl,
        string description
    );

    constructor() {}

    function createWildfire(
        address _tokenAddress,
        string memory _tokenName,
        string memory _missionStatement,
        uint256 _targetBurnAmount,
        uint256 _tokensPerMine,
        uint256 _minePrice
    ) external {
        require(_targetBurnAmount > 0, "Target must be positive");
        require(_tokensPerMine > 0, "Tokens per mine must be positive");
        require(bytes(_missionStatement).length > 0, "Mission statement required");
        
        _wildfireIds.increment();
        uint256 newWildfireId = _wildfireIds.current();
        
        wildfires[newWildfireId] = Wildfire({
            id: newWildfireId,
            creator: msg.sender,
            tokenAddress: _tokenAddress,
            tokenName: _tokenName,
            missionStatement: _missionStatement,
            targetBurnAmount: _targetBurnAmount,
            startDate: block.timestamp,
            tokensPerMine: _tokensPerMine,
            minePrice: _minePrice,
            totalDeposited: 0,
            totalMined: 0,
            totalBurned: 0,
            isActive: true
        });
        
        emit WildfireCreated(
            newWildfireId,
            msg.sender,
            _tokenAddress,
            _tokenName,
            _missionStatement,
            _targetBurnAmount,
            block.timestamp
        );
    }
    
    function depositTokens(uint256 _wildfireId, uint256 _amount) external {
        Wildfire storage wildfire = wildfires[_wildfireId];
        require(wildfire.creator == msg.sender, "Only creator can deposit");
        require(wildfire.isActive, "Wildfire is not active");
        
        IERC20 token = IERC20(wildfire.tokenAddress);
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        wildfire.totalDeposited += _amount;
        
        emit TokensDeposited(_wildfireId, _amount, wildfire.totalDeposited);
    }
    
    function addBadge(
        uint256 _wildfireId,
        uint256 _threshold,
        string memory _imageUrl,
        string memory _description
    ) external {
        Wildfire storage wildfire = wildfires[_wildfireId];
        require(wildfire.creator == msg.sender, "Only creator can add badges");
        require(wildfire.isActive, "Wildfire is not active");
        require(_threshold > 0, "Threshold must be positive");
        
        wildfireBadges[_wildfireId].push(Badge({
            threshold: _threshold,
            imageUrl: _imageUrl,
            description: _description
        }));
    }
    
    function mineTokens(uint256 _wildfireId) external payable {
        Wildfire storage wildfire = wildfires[_wildfireId];
        require(wildfire.isActive, "Wildfire is not active");
        require(wildfire.totalDeposited >= wildfire.tokensPerMine, "Not enough tokens to mine");
        require(msg.value >= wildfire.minePrice, "Insufficient MATIC payment");
        
        // Refund excess MATIC
        if (msg.value > wildfire.minePrice) {
            payable(msg.sender).transfer(msg.value - wildfire.minePrice);
        }
        
        // Send MATIC to creator
        payable(wildfire.creator).transfer(wildfire.minePrice);
        
        // Transfer MemeTokens to miner
        IERC20 token = IERC20(wildfire.tokenAddress);
        require(token.transfer(msg.sender, wildfire.tokensPerMine), "Token transfer failed");
        
        wildfire.totalMined += wildfire.tokensPerMine;
        wildfire.totalDeposited -= wildfire.tokensPerMine;
        
        emit TokensMined(_wildfireId, msg.sender, wildfire.tokensPerMine);
    }
    
    function burnTokens(
        uint256 _wildfireId,
        uint256 _amount,
        string memory _consoleUrl,
        string memory _consoleHash
    ) external {
        Wildfire storage wildfire = wildfires[_wildfireId];
        require(wildfire.isActive, "Wildfire is not active");
        require(_amount > 0, "Amount must be positive");
        
        IERC20 token = IERC20(wildfire.tokenAddress);
        require(token.transferFrom(msg.sender, DEAD_ADDRESS, _amount), "Burn transfer failed");
        
        wildfire.totalBurned += _amount;
        userBurnsPerWildfire[_wildfireId][msg.sender] += _amount;
        consoleBurnsPerWildfire[_wildfireId][_consoleHash] += _amount;
        
        wildfireBurns[_wildfireId].push(BurnRecord({
            burner: msg.sender,
            amount: _amount,
            consoleUrl: _consoleUrl,
            consoleHash: _consoleHash,
            timestamp: block.timestamp
        }));
        
        emit TokensBurned(_wildfireId, msg.sender, _amount, _consoleUrl, _consoleHash);
        checkBadges(_wildfireId, msg.sender);
    }
    
    function checkBadges(uint256 _wildfireId, address _user) internal {
        uint256 totalBurned = userBurnsPerWildfire[_wildfireId][_user];
        Badge[] storage badges = wildfireBadges[_wildfireId];
        
        for (uint256 i = 0; i < badges.length; i++) {
            Badge storage badge = badges[i];
            
            if (totalBurned >= badge.threshold && !hasBadge(_wildfireId, _user, i)) {
                userBadges[_wildfireId][_user].push(i);
                
                emit BadgeEarned(
                    _wildfireId,
                    _user,
                    i,
                    badge.imageUrl,
                    badge.description
                );
            }
        }
    }
    
    function hasBadge(uint256 _wildfireId, address _user, uint256 _badgeIndex) public view returns (bool) {
        uint256[] storage badges = userBadges[_wildfireId][_user];
        for (uint256 i = 0; i < badges.length; i++) {
            if (badges[i] == _badgeIndex) {
                return true;
            }
        }
        return false;
    }
    
    function getWildfireStats(uint256 _wildfireId) external view returns (
        uint256 totalDeposited,
        uint256 totalMined,
        uint256 totalBurned,
        uint256 remainingToTarget,
        bool targetReached,
        string memory missionStatement
    ) {
        Wildfire memory wildfire = wildfires[_wildfireId];
        totalDeposited = wildfire.totalDeposited;
        totalMined = wildfire.totalMined;
        totalBurned = wildfire.totalBurned;
        remainingToTarget = wildfire.targetBurnAmount > totalBurned ? wildfire.targetBurnAmount - totalBurned : 0;
        targetReached = totalBurned >= wildfire.targetBurnAmount;
        missionStatement = wildfire.missionStatement;
    }
    
    function getBurnRecords(uint256 _wildfireId) external view returns (BurnRecord[] memory) {
        return wildfireBurns[_wildfireId];
    }
    
    function getUserBurnRecords(uint256 _wildfireId, address _user) external view returns (BurnRecord[] memory) {
        BurnRecord[] memory allRecords = wildfireBurns[_wildfireId];
        BurnRecord[] memory userRecords = new BurnRecord[](allRecords.length);
        
        uint256 count = 0;
        for (uint256 i = 0; i < allRecords.length; i++) {
            if (allRecords[i].burner == _user) {
                userRecords[count] = allRecords[i];
                count++;
            }
        }
        
        BurnRecord[] memory result = new BurnRecord[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userRecords[i];
        }
        
        return result;
    }
    
    function getWildfireBadges(uint256 _wildfireId) external view returns (Badge[] memory) {
        return wildfireBadges[_wildfireId];
    }
    
    function endWildfire(uint256 _wildfireId) external {
        Wildfire storage wildfire = wildfires[_wildfireId];
        require(wildfire.creator == msg.sender, "Only creator can end");
        wildfire.isActive = false;
    }
    
    function withdrawMATIC() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
}
