// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Base64.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract MoneyPost {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    address public owner;
    string public baseURL;

    struct RewardToken {
        string name;
        address tokenAddress;
        uint256 rewardAmount;
    }

    struct Topic {
        bytes32 topicId;
        string name;
        uint256 createdAt;
    }

    struct Post {
        bytes32 urlHash;
        address author;
        uint256 timestamp;
        address rewardToken;
    }

    EnumerableSet.AddressSet private rewardTokenAddresses;
    EnumerableSet.AddressSet private blockedAddresses;
    mapping(address => RewardToken) public rewardTokens;
    mapping(address => uint256) public exchangeRates;
    mapping(bytes32 => bool) public eligibleHashes;
    EnumerableSet.Bytes32Set private topicIds;
    mapping(bytes32 => Topic) public topics;
    mapping(bytes32 => uint256) public topicPostCounts;
    mapping(bytes32 => Post[]) public topicPosts;
    mapping(bytes32 => bytes32) public postToTopic;

    event RewardTokenAdded(address indexed tokenAddress, string name, uint256 rewardAmount, uint256 exchangeRate);
    event RewardTokenRemoved(address indexed tokenAddress);
    event RewardTokenDeposited(address indexed tokenAddress, uint256 amount);
    event RewardTokenWithdrawn(address indexed tokenAddress, uint256 amount);
    event RewardAmountUpdated(address indexed tokenAddress, uint256 newAmount);
    event ExchangeRateUpdated(address indexed tokenAddress, uint256 newRate);
    event EmergencyWithdraw(address indexed tokenAddress, uint256 amount);
    event TopicAdded(bytes32 indexed topicId, string name);
    event TopicRemoved(bytes32 indexed topicId);
    event PostSubmitted(bytes32 indexed urlHash, address indexed author, bytes32 indexed topicId, address rewardToken);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Address Blocking Functions
    function addBlockedAddress(address _address) external onlyOwner {
        blockedAddresses.add(_address);
    }

    function addBlockedAddresses(address[] calldata _addresses) external onlyOwner {
        for (uint i = 0; i < _addresses.length; i++) {
            blockedAddresses.add(_addresses[i]);
        }
    }

    function removeBlockedAddress(address _address) external onlyOwner {
        blockedAddresses.remove(_address);
    }

    function manageBlockedAddresses(address[] calldata _addresses, bool blockAction) external onlyOwner {
        for (uint i = 0; i < _addresses.length; i++) {
            blockAction ? blockedAddresses.add(_addresses[i]) : blockedAddresses.remove(_addresses[i]);
        }
    }

    function isAddressBlocked(address _address) public view returns (bool) {
        return blockedAddresses.contains(_address);
    }

    function getBlockedAddresses() external view returns (address[] memory) {
        return blockedAddresses.values();
    }

    // Reward Token Management
    function addRewardToken(string calldata name, address tokenAddress, uint256 rewardAmount, uint256 exchangeRate) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token");
        rewardTokens[tokenAddress] = RewardToken(name, tokenAddress, rewardAmount);
        rewardTokenAddresses.add(tokenAddress);
        exchangeRates[tokenAddress] = exchangeRate;
        emit RewardTokenAdded(tokenAddress, name, rewardAmount, exchangeRate);
    }

    function removeRewardToken(address tokenAddress) external onlyOwner {
        rewardTokenAddresses.remove(tokenAddress);
        delete rewardTokens[tokenAddress];
        delete exchangeRates[tokenAddress];
        emit RewardTokenRemoved(tokenAddress);
    }

    function setRewardAmount(address tokenAddress, uint256 rewardAmount) external onlyOwner {
        require(rewardTokenAddresses.contains(tokenAddress), "Token not registered");
        rewardTokens[tokenAddress].rewardAmount = rewardAmount;
        emit RewardAmountUpdated(tokenAddress, rewardAmount);
    }

    function setExchangeRate(address tokenAddress, uint256 rate) external onlyOwner {
        require(rewardTokenAddresses.contains(tokenAddress), "Token not registered");
        exchangeRates[tokenAddress] = rate;
        emit ExchangeRateUpdated(tokenAddress, rate);
    }

    function manageRewardToken(
        address tokenAddress,
        string calldata name,
        uint256 rewardAmount,
        uint256 exchangeRate,
        uint256 action // 0=add, 1=remove, 2=update
    ) external onlyOwner {
        if (action == 0) {
            require(tokenAddress != address(0), "Invalid token");
            rewardTokens[tokenAddress] = RewardToken(name, tokenAddress, rewardAmount);
            rewardTokenAddresses.add(tokenAddress);
            exchangeRates[tokenAddress] = exchangeRate;
            emit RewardTokenAdded(tokenAddress, name, rewardAmount, exchangeRate);
        } else if (action == 1) {
            rewardTokenAddresses.remove(tokenAddress);
            delete rewardTokens[tokenAddress];
            delete exchangeRates[tokenAddress];
            emit RewardTokenRemoved(tokenAddress);
        } else {
            rewardTokens[tokenAddress].rewardAmount = rewardAmount;
            exchangeRates[tokenAddress] = exchangeRate;
            emit RewardAmountUpdated(tokenAddress, rewardAmount);
            emit ExchangeRateUpdated(tokenAddress, exchangeRate);
        }
    }

    function depositRewardTokens(address tokenAddress, uint256 amount) external onlyOwner {
        require(rewardTokenAddresses.contains(tokenAddress), "Token not registered");
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit RewardTokenDeposited(tokenAddress, amount);
    }

    function withdrawRewardTokens(address tokenAddress, uint256 amount) external onlyOwner {
        require(IERC20(tokenAddress).transfer(msg.sender, amount), "Transfer failed");
        emit RewardTokenWithdrawn(tokenAddress, amount);
    }

    // Topic Management
    function addTopic(string calldata name) external onlyOwner returns (bytes32) {
        bytes32 topicId = keccak256(abi.encodePacked(name, block.timestamp));
        topics[topicId] = Topic(topicId, name, block.timestamp);
        topicIds.add(topicId);
        emit TopicAdded(topicId, name);
        return topicId;
    }

    function removeTopic(bytes32 topicId) external onlyOwner {
        require(topicIds.contains(topicId), "Topic not found");
        topicIds.remove(topicId);
        delete topics[topicId];
        emit TopicRemoved(topicId);
    }

    function renameTopic(bytes32 topicId, string calldata newName) external onlyOwner {
        require(topicIds.contains(topicId), "Topic not found");
        topics[topicId].name = newName;
    }

    function manageTopic(bytes32 topicId, string calldata name, bool isAdd) external onlyOwner returns (bytes32) {
        if (isAdd) {
            bytes32 newTopicId = keccak256(abi.encodePacked(name, block.timestamp));
            topics[newTopicId] = Topic(newTopicId, name, block.timestamp);
            topicIds.add(newTopicId);
            emit TopicAdded(newTopicId, name);
            return newTopicId;
        } else {
            topicIds.remove(topicId);
            delete topics[topicId];
            emit TopicRemoved(topicId);
            return topicId;
        }
    }

    // Post Submission
    function submitPost(bytes32 urlHash, string calldata url, address rewardToken, bytes32 topicId) external {
        require(!blockedAddresses.contains(msg.sender), "Address is blocked");
        require(bytes(url).length > 0, "Empty URL");
        require(sha256(bytes(url)) == urlHash, "Hash mismatch");
        require(containsBaseURL(url), "Invalid base URL");
        require(containsExport(url), "Missing '/export/'");
        require(topicIds.contains(topicId), "Invalid topic ID");
        validatePayload(extractPayload(url));
        require(!eligibleHashes[urlHash], "Hash already used");

        RewardToken memory token = rewardTokens[rewardToken];
        require(token.tokenAddress != address(0), "Invalid reward token");
        require(IERC20(token.tokenAddress).balanceOf(address(this)) >= token.rewardAmount, "Insufficient balance");

        eligibleHashes[urlHash] = true;
        topicPostCounts[topicId]++;
        
        Post memory newPost = Post({
            urlHash: urlHash,
            author: msg.sender,
            timestamp: block.timestamp,
            rewardToken: rewardToken
        });
        topicPosts[topicId].push(newPost);
        postToTopic[urlHash] = topicId;

        require(IERC20(token.tokenAddress).transfer(msg.sender, token.rewardAmount), "Payment failed");
        emit PostSubmitted(urlHash, msg.sender, topicId, rewardToken);
    }

    // Swap Function
    function swapTokens(address fromToken, address toToken, uint256 amount) external {
        require(rewardTokenAddresses.contains(fromToken), "From token not supported");
        require(rewardTokenAddresses.contains(toToken), "To token not supported");
        
        uint256 fromRate = exchangeRates[fromToken];
        uint256 toRate = exchangeRates[toToken];
        require(fromRate > 0 && toRate > 0, "Tokens not swappable");
        
        uint256 equivalentAmount = (amount * fromRate) / toRate;
        require(equivalentAmount > 0, "Amount too low");
        
        require(IERC20(fromToken).transferFrom(msg.sender, address(this), amount), "From transfer failed");
        require(IERC20(toToken).transfer(msg.sender, equivalentAmount), "To transfer failed");
    }

    // View Functions
    function getRewardTokenData() private view returns (RewardToken[] memory, uint256[] memory) {
        uint256 length = rewardTokenAddresses.length();
        RewardToken[] memory tokens = new RewardToken[](length);
        uint256[] memory rates = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            address tokenAddress = rewardTokenAddresses.at(i);
            tokens[i] = rewardTokens[tokenAddress];
            rates[i] = exchangeRates[tokenAddress];
        }
        return (tokens, rates);
    }

    function listRewardTokens() external view returns (RewardToken[] memory, uint256[] memory) {
        return getRewardTokenData();
    }

    function getTopicData() private view returns (Topic[] memory) {
        uint256 length = topicIds.length();
        Topic[] memory allTopics = new Topic[](length);
        for (uint256 i = 0; i < length; i++) {
            allTopics[i] = topics[topicIds.at(i)];
        }
        return allTopics;
    }

    function listTopics() external view returns (Topic[] memory) {
        return getTopicData();
    }

    function getTopicPostCount(bytes32 topicId) external view returns (uint256) {
        return topicPostCounts[topicId];
    }

    function getPostsByTopic(bytes32 topicId, uint256 startIndex, uint256 endIndex) external view returns (Post[] memory) {
        require(topicIds.contains(topicId), "Invalid topic ID");
        require(startIndex <= endIndex, "Invalid index range");
        
        Post[] storage allPosts = topicPosts[topicId];
        if (endIndex >= allPosts.length) {
            endIndex = allPosts.length - 1;
        }
        
        uint256 resultLength = endIndex - startIndex + 1;
        Post[] memory result = new Post[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allPosts[startIndex + i];
        }
        
        return result;
    }

    function getTotalPostsByTopic(bytes32 topicId) external view returns (uint256) {
        return topicPosts[topicId].length;
    }

    function getPostTopic(bytes32 urlHash) external view returns (bytes32) {
        return postToTopic[urlHash];
    }

    // Helper Functions
    function setBaseURL(string memory _baseURL) external onlyOwner {
        baseURL = _baseURL;
    }

    function containsBaseURL(string memory url) internal view returns (bool) {
        if (bytes(baseURL).length == 0) return true;
        bytes memory urlBytes = bytes(url);
        uint256 exportPos = findExportPos(urlBytes);
        for (uint256 i = 0; i < exportPos; i++) {
            if (bytesEqual(urlBytes, i, bytes(baseURL))) return true;
        }
        return false;
    }

    function containsExport(string memory url) internal pure returns (bool) {
        return findExportPos(bytes(url)) != type(uint256).max;
    }

    function bytesEqual(bytes memory data, uint256 start, bytes memory compare) internal pure returns (bool) {
        if (start + compare.length > data.length) return false;
        for (uint256 i = 0; i < compare.length; i++) {
            if (data[start + i] != compare[i]) return false;
        }
        return true;
    }

    function findExportPos(bytes memory url) internal pure returns (uint256) {
        bytes memory exportFlag = bytes("/export/");
        for (uint256 i = 0; i <= url.length - exportFlag.length; i++) {
            if (bytesEqual(url, i, exportFlag)) return i + exportFlag.length;
        }
        return type(uint256).max;
    }

    function extractPayload(string memory url) internal pure returns (string memory) {
        uint256 exportPos = findExportPos(bytes(url));
        require(exportPos != type(uint256).max, "No payload");
        bytes memory urlBytes = bytes(url);
        bytes memory payload = new bytes(urlBytes.length - exportPos);
        for (uint256 i = exportPos; i < urlBytes.length; i++) {
            payload[i - exportPos] = urlBytes[i];
        }
        return string(payload);
    }

    function validatePayload(string memory payload) internal pure {
        bytes memory decoded = Base64.decode(bytes(payload));
        
        // Check minimum valid JSON length (empty object "{}")
        if (decoded.length < 2) {
            revert("Payload too short");
        }
        
        // Check opening and closing braces
        if (decoded[0] != '{' || decoded[decoded.length - 1] != '}') {
            revert("Not JSON: Missing braces");
        }
        
        // Optional: Add more thorough JSON validation here
        // For example, check for basic JSON structure
        bool hasColon;
        for (uint i = 1; i < decoded.length - 1; i++) {
            if (decoded[i] == ':') {
                hasColon = true;
                break;
            }
        }
        if (!hasColon) {
            revert("Not JSON: Missing key-value pair");
        }
    }

    receive() external payable {}
}
