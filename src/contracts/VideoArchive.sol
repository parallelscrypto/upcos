// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VideoArchive is Ownable {
    struct ArchiveEntry {
        uint256 id;
        string url;
        uint256 dateArchived;
        address owner;
        uint256 initialTokenCount;
        uint256 tokensMined;
        uint256 tokensRemaining;
        address tokenAddress;
        string miningKey;
        uint256 priceIfNoKey;
    }
    
    struct UserStats {
        uint256 totalTokensMined;
        uint256 currentBadgeLevel;
        mapping(address => uint256) tokensMinedPerToken;
    }
    
    struct BadgeLevel {
        uint256 threshold;
        string name;
    }
    
    struct TokenInfo {
        string name;
        address tokenAddress;
        uint256 balance;
    }
    
    struct ExchangeRate {
        address rewardToken;
        uint256 rate; // How many reward tokens per 1 FLIP token
    }
    
    ArchiveEntry[] public archive;
    mapping(address => UserStats) public userStats;
    BadgeLevel[] public badgeLevels;
    
    // Token management system
    mapping(address => uint256) public tokenBalances;
    mapping(address => string) public tokenNames;
    mapping(address => bool) public whitelistedTokens;
    address[] public allWhitelistedTokens;
    
    // FLIP token system
    address public flipTokenAddress;
    string public flipTokenName;
    mapping(address => ExchangeRate) public exchangeRates;
    
    event EntryAdded(uint256 indexed id, string url, address tokenAddress);
    event EntryRemoved(uint256 indexed id);
    event EntryEdited(uint256 indexed id, string newUrl);
    event TokensMined(uint256 indexed entryId, address indexed user, uint256 amount);
    event TokensDeposited(address indexed tokenAddress, uint256 amount);
    event ContractOwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event BadgeLevelAdded(uint256 threshold, string name);
    event TokensRewarded(address indexed tokenAddress, address indexed recipient, uint256 amount);
    event ExchangeRateSet(address indexed rewardToken, uint256 rate);
    event FlipTokenUpdated(address indexed newFlipToken, string name);
    event TokenWhitelisted(address indexed tokenAddress, string name);
    event TokenRemoved(address indexed tokenAddress);
    
    constructor() Ownable(msg.sender) {}
    
    // Token management functions
    function addToken(address _tokenAddress, string memory _tokenName) public onlyOwner {
        require(!whitelistedTokens[_tokenAddress], "Token already whitelisted");
        require(_tokenAddress != address(0), "Invalid token address");
        
        whitelistedTokens[_tokenAddress] = true;
        tokenNames[_tokenAddress] = _tokenName;
        allWhitelistedTokens.push(_tokenAddress);
        
        emit TokenWhitelisted(_tokenAddress, _tokenName);
    }
    
    function removeToken(address _tokenAddress) public onlyOwner {
        require(whitelistedTokens[_tokenAddress], "Token not whitelisted");
        
        whitelistedTokens[_tokenAddress] = false;
        delete tokenNames[_tokenAddress];
        
        for (uint256 i = 0; i < allWhitelistedTokens.length; i++) {
            if (allWhitelistedTokens[i] == _tokenAddress) {
                allWhitelistedTokens[i] = allWhitelistedTokens[allWhitelistedTokens.length - 1];
                allWhitelistedTokens.pop();
                break;
            }
        }
        
        emit TokenRemoved(_tokenAddress);
    }
    
    function depositTokens(address _tokenAddress, uint256 _amount) public onlyOwner {
        require(whitelistedTokens[_tokenAddress], "Token not whitelisted");
        
        IERC20 token = IERC20(_tokenAddress);
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        tokenBalances[_tokenAddress] += _amount;
        emit TokensDeposited(_tokenAddress, _amount);
    }
    
    // Archive management functions
    function addEntry(
        string memory _url,
        address _tokenAddress,
        uint256 _initialTokenCount,
        string memory _miningKey,
        uint256 _priceIfNoKey
    ) public onlyOwner {
        require(whitelistedTokens[_tokenAddress], "Token not whitelisted");
        
        uint256 newId = archive.length + 1;
        archive.push(ArchiveEntry({
            id: newId,
            url: _url,
            dateArchived: block.timestamp,
            owner: msg.sender,
            initialTokenCount: _initialTokenCount,
            tokensMined: 0,
            tokensRemaining: _initialTokenCount,
            tokenAddress: _tokenAddress,
            miningKey: _miningKey,
            priceIfNoKey: _priceIfNoKey
        }));
        
        emit EntryAdded(newId, _url, _tokenAddress);
    }
    
    function removeEntry(uint256 _id) public onlyOwner {
        require(_id > 0 && _id <= archive.length, "Invalid ID");
        uint256 index = _id - 1;
        
        archive[index].url = "";
        archive[index].tokensRemaining = 0;
        
        emit EntryRemoved(_id);
    }
    
    function editEntry(uint256 _id, string memory _newUrl) public onlyOwner {
        require(_id > 0 && _id <= archive.length, "Invalid ID");
        uint256 index = _id - 1;
        require(bytes(archive[index].url).length > 0, "Entry not found");
        
        archive[index].url = _newUrl;
        emit EntryEdited(_id, _newUrl);
    }
    
    function transferContractOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        _transferOwnership(newOwner);
        emit ContractOwnershipTransferred(msg.sender, newOwner);
    }
    

function mineTokens(uint256 _entryId, string memory _miningKey) public payable {
    require(_entryId > 0 && _entryId <= archive.length, "Invalid ID");
    uint256 index = _entryId - 1;
    ArchiveEntry storage entry = archive[index];
    
    require(bytes(entry.url).length > 0, "Entry not found");
    require(entry.tokensRemaining > 0, "No tokens left");
    require(tokenBalances[entry.tokenAddress] > 0, "No tokens available");
    
    if (keccak256(bytes(entry.miningKey)) != keccak256(bytes(""))) {
        if (keccak256(bytes(entry.miningKey)) != keccak256(bytes(_miningKey))) {
            require(msg.value >= entry.priceIfNoKey, "Incorrect mining key and insufficient payment");
        }
    }
    
    IERC20 token = IERC20(entry.tokenAddress);
    uint256 oneToken = 1 ether; // Assuming standard 18 decimal places
    require(token.transfer(msg.sender, oneToken), "Token transfer failed");
    
    entry.tokensMined += 1; // Track as whole tokens
    entry.tokensRemaining -= 1;
    tokenBalances[entry.tokenAddress] -= oneToken; // Subtract actual token amount
    
    UserStats storage stats = userStats[msg.sender];
    stats.totalTokensMined += 1; // Track as whole tokens
    stats.tokensMinedPerToken[entry.tokenAddress] += 1;
    
    _updateBadgeLevel(msg.sender);
    emit TokensMined(_entryId, msg.sender, 1); // Emit as whole tokens
}




    
    function rewardUser(address _tokenAddress, address _recipient, uint256 _numTokens) public onlyOwner {
        require(whitelistedTokens[_tokenAddress], "Token not whitelisted");
        require(tokenBalances[_tokenAddress] >= _numTokens, "Insufficient balance");
        
        IERC20 token = IERC20(_tokenAddress);
        require(token.transfer(_recipient, _numTokens), "Token transfer failed");
        
        tokenBalances[_tokenAddress] -= _numTokens;
        
        UserStats storage stats = userStats[_recipient];
        stats.totalTokensMined += _numTokens;
        stats.tokensMinedPerToken[_tokenAddress] += _numTokens;
        _updateBadgeLevel(_recipient);
        
        emit TokensRewarded(_tokenAddress, _recipient, _numTokens);
    }
    
    // Badge system
    function addBadgeLevel(uint256 _threshold, string memory _name) public onlyOwner {
        badgeLevels.push(BadgeLevel(_threshold, _name));
        emit BadgeLevelAdded(_threshold, _name);
    }
    
    function _updateBadgeLevel(address _user) internal {
        UserStats storage stats = userStats[_user];
        uint256 newLevel = stats.currentBadgeLevel;
        
        for (uint256 i = stats.currentBadgeLevel; i < badgeLevels.length; i++) {
            if (stats.totalTokensMined >= badgeLevels[i].threshold) {
                newLevel = i + 1;
            } else {
                break;
            }
        }
        
        stats.currentBadgeLevel = newLevel;
    }
    
    // Exchange system
    function setFlipToken(address _flipTokenAddress, string memory _name) public onlyOwner {
        require(whitelistedTokens[_flipTokenAddress], "Token not whitelisted");
        
        flipTokenAddress = _flipTokenAddress;
        flipTokenName = _name;
        emit FlipTokenUpdated(_flipTokenAddress, _name);
    }
    
    function setExchangeRate(address _rewardToken, uint256 _rate) public onlyOwner {
        require(whitelistedTokens[_rewardToken], "Token not whitelisted");
        exchangeRates[_rewardToken] = ExchangeRate(_rewardToken, _rate);
        emit ExchangeRateSet(_rewardToken, _rate);
    }
    
    function exchangeTokens(address _rewardToken, uint256 _amount) public {
        require(exchangeRates[_rewardToken].rate > 0, "Exchange rate not set");
        require(flipTokenAddress != address(0), "FLIP token not set");
        require(_amount > 0, "Amount must be positive");
        
        uint256 flipAmount = _amount / exchangeRates[_rewardToken].rate;
        require(tokenBalances[flipTokenAddress] >= flipAmount, "Insufficient FLIP tokens");
        
        IERC20 rewardToken = IERC20(_rewardToken);
        require(rewardToken.transferFrom(msg.sender, address(this), _amount), "Reward token transfer failed");
        
        IERC20 flipToken = IERC20(flipTokenAddress);
        require(flipToken.transfer(msg.sender, flipAmount), "FLIP token transfer failed");
        
        tokenBalances[_rewardToken] += _amount;
        tokenBalances[flipTokenAddress] -= flipAmount;
    }
    
    // View functions
    function getArchiveCount() public view returns (uint256) {
        return archive.length;
    }
    
    function getArchiveEntry(uint256 _id) public view returns (
        uint256 id,
        string memory url,
        uint256 dateArchived,
        address owner,
        uint256 initialTokenCount,
        uint256 tokensMined,
        uint256 tokensRemaining,
        address tokenAddress,
        string memory miningKey,
        uint256 priceIfNoKey
    ) {
        require(_id > 0 && _id <= archive.length, "Invalid ID");
        ArchiveEntry storage entry = archive[_id - 1];
        return (
            entry.id,
            entry.url,
            entry.dateArchived,
            entry.owner,
            entry.initialTokenCount,
            entry.tokensMined,
            entry.tokensRemaining,
            entry.tokenAddress,
            entry.miningKey,
            entry.priceIfNoKey
        );
    }
    
    function getUserTokenStats(address _user, address _token) public view returns (uint256) {
        return userStats[_user].tokensMinedPerToken[_token];
    }
    
    function getAllTokenBalances() public view returns (TokenInfo[] memory) {
        TokenInfo[] memory tokens = new TokenInfo[](allWhitelistedTokens.length);
        for (uint256 i = 0; i < allWhitelistedTokens.length; i++) {
            address tokenAddr = allWhitelistedTokens[i];
            tokens[i] = TokenInfo({
                name: tokenNames[tokenAddr],
                tokenAddress: tokenAddr,
                balance: tokenBalances[tokenAddr]
            });
        }
        return tokens;
    }
    
    function getAllWhitelistedTokens() public view returns (TokenInfo[] memory) {
        TokenInfo[] memory tokens = new TokenInfo[](allWhitelistedTokens.length);
        for (uint256 i = 0; i < allWhitelistedTokens.length; i++) {
            address tokenAddr = allWhitelistedTokens[i];
            tokens[i] = TokenInfo({
                name: tokenNames[tokenAddr],
                tokenAddress: tokenAddr,
                balance: tokenBalances[tokenAddr]
            });
        }
        return tokens;
    }
    
    function getExchangeRate(address _rewardToken) public view returns (ExchangeRate memory) {
        return exchangeRates[_rewardToken];
    }
    
    function getAllExchangeRates() public view returns (ExchangeRate[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allWhitelistedTokens.length; i++) {
            if (exchangeRates[allWhitelistedTokens[i]].rate > 0) {
                count++;
            }
        }
        
        ExchangeRate[] memory rates = new ExchangeRate[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allWhitelistedTokens.length; i++) {
            address tokenAddr = allWhitelistedTokens[i];
            if (exchangeRates[tokenAddr].rate > 0) {
                rates[index] = exchangeRates[tokenAddr];
                index++;
            }
        }
        
        return rates;
    }
    
    function getBadgeLevel(address _user) public view returns (uint256 level, string memory name) {
        level = userStats[_user].currentBadgeLevel;
        if (level == 0 || badgeLevels.length < level) {
            return (0, "No badge");
        }
        name = badgeLevels[level - 1].name;
    }
    
    // Withdraw funds
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
}
