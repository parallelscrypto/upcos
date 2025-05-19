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
    
    // Topic management
    EnumerableSet.Bytes32Set private topicIds;
    mapping(bytes32 => Topic) public topics;
    mapping(bytes32 => uint256) public topicPostCounts;
    
    // Post tracking
    mapping(bytes32 => Post[]) public topicPosts;
    mapping(bytes32 => bytes32) public postToTopic;

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

    function isAddressBlocked(address _address) public view returns (bool) {
        return blockedAddresses.contains(_address);
    }

    function getBlockedAddresses() external view returns (address[] memory) {
        return blockedAddresses.values();
    }

    // Reward Token Functions
    function addRewardToken(string calldata name, address tokenAddress, uint256 rewardAmount, uint256 exchangeRate) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token");
        rewardTokens[tokenAddress] = RewardToken(name, tokenAddress, rewardAmount);
        rewardTokenAddresses.add(tokenAddress);
        exchangeRates[tokenAddress] = exchangeRate;
    }

    function removeRewardToken(address tokenAddress) external onlyOwner {
        rewardTokenAddresses.remove(tokenAddress);
        delete rewardTokens[tokenAddress];
        delete exchangeRates[tokenAddress];
    }

    function setRewardAmount(address tokenAddress, uint256 rewardAmount) external onlyOwner {
        require(rewardTokenAddresses.contains(tokenAddress), "Token not registered");
        rewardTokens[tokenAddress].rewardAmount = rewardAmount;
    }

    function setExchangeRate(address tokenAddress, uint256 rate) external onlyOwner {
        require(rewardTokenAddresses.contains(tokenAddress), "Token not registered");
        exchangeRates[tokenAddress] = rate;
    }

    // Topic Management Functions
    function addTopic(string calldata name) external onlyOwner returns (bytes32) {
        bytes32 topicId = keccak256(abi.encodePacked(name, block.timestamp));
        topics[topicId] = Topic(topicId, name, block.timestamp);
        topicIds.add(topicId);
        return topicId;
    }

    function removeTopic(bytes32 topicId) external onlyOwner {
        require(topicIds.contains(topicId), "Topic not found");
        topicIds.remove(topicId);
        delete topics[topicId];
    }

    function renameTopic(bytes32 topicId, string calldata newName) external onlyOwner {
        require(topicIds.contains(topicId), "Topic not found");
        topics[topicId].name = newName;
    }

    // Post Submission with Topic
    function submitPost(bytes32 urlHash, string calldata url, address rewardToken, bytes32 topicId) external {
        require(!blockedAddresses.contains(msg.sender), "Address is blocked");
        require(bytes(url).length > 0, "Empty URL");
        require(sha256(bytes(url)) == urlHash, "Hash mismatch");
        require(containsBaseURL(url), "Invalid base URL");
        require(containsExport(url), "Missing '/export/'");
        require(topicIds.contains(topicId), "Invalid topic ID");
        validatePayload(extractPayload(url));
        require(!eligibleHashes[urlHash], "Hash already used");
        
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

        RewardToken memory token = rewardTokens[rewardToken];
        require(token.tokenAddress != address(0), "Invalid reward token");
        require(IERC20(token.tokenAddress).transfer(msg.sender, token.rewardAmount), "Payment failed");
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
    function listRewardTokens() external view returns (RewardToken[] memory, uint256[] memory) {
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

    function listTopics() external view returns (Topic[] memory) {
        uint256 length = topicIds.length();
        Topic[] memory allTopics = new Topic[](length);
        
        for (uint256 i = 0; i < length; i++) {
            allTopics[i] = topics[topicIds.at(i)];
        }
        return allTopics;
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
        bytes memory urlBytes = bytes(url);
        bytes memory baseBytes = bytes(baseURL);
        if (baseBytes.length == 0) return true;
        uint256 exportPos = findExportPos(urlBytes);
        for (uint256 i = 0; i < exportPos; i++) {
            bool isMatch = true;
            for (uint256 j = 0; j < baseBytes.length; j++) {
                if (i + j >= exportPos || urlBytes[i + j] != baseBytes[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) return true;
        }
        return false;
    }

    function containsExport(string memory url) internal pure returns (bool) {
        return findExportPos(bytes(url)) != type(uint256).max;
    }

    function findExportPos(bytes memory url) internal pure returns (uint256) {
        bytes memory exportFlag = bytes("/export/");
        for (uint256 i = 0; i <= url.length - exportFlag.length; i++) {
            bool isMatch = true;
            for (uint256 j = 0; j < exportFlag.length; j++) {
                if (url[i + j] != exportFlag[j]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) return i + exportFlag.length;
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
        require(decoded.length >= 2, "Payload too short");
        require(decoded[0] == '{' && decoded[decoded.length - 1] == '}', "Not JSON");
    }

    receive() external payable {}
}
