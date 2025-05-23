// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Base64.sol";
import "./RawMaterial.sol";
//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract MoneyPost {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    address public owner;
    string public baseURL;
    address public flipToken;
    RawMaterial public rawMaterialContract;

    struct RewardToken {
        string name;
        address tokenAddress;
        uint256 rewardAmount;
    }

    struct Topic {
        bytes32 topicId;
        string name;
        uint256 createdAt;
        address attachedToken;
        string upcCode; // New field to store UPC code
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
    mapping(address => EnumerableSet.Bytes32Set) private tokenTopics;
    mapping(string => EnumerableSet.Bytes32Set) private upcTopics; // New mapping for UPC to topics

    event RewardTokenAdded(address indexed tokenAddress, string name, uint256 rewardAmount, uint256 exchangeRate);
    event RewardTokenRemoved(address indexed tokenAddress);
    event RewardTokenDeposited(address indexed tokenAddress, uint256 amount);
    event RewardTokenWithdrawn(address indexed tokenAddress, uint256 amount);
    event RewardAmountUpdated(address indexed tokenAddress, uint256 newAmount);
    event ExchangeRateUpdated(address indexed tokenAddress, uint256 newRate);
    event EmergencyWithdraw(address indexed tokenAddress, uint256 amount);
    event TopicAdded(bytes32 indexed topicId, string name, address indexed attachedToken);
    event TopicRemoved(bytes32 indexed topicId);
    event TopicAttached(bytes32 indexed topicId, address indexed tokenAddress);
    event TopicDetached(bytes32 indexed topicId, address indexed tokenAddress);
    event PostSubmitted(bytes32 indexed urlHash, address indexed author, bytes32 indexed topicId, address rewardToken);
    event FlipTokensDeposited(address indexed depositor, uint256 amount);
    event TokensSwapped(address indexed user, address fromToken, uint256 fromAmount, uint256 flipAmount);
    event TopicAttachedToUPC(bytes32 indexed topicId, string upcCode);
    event TopicDetachedFromUPC(bytes32 indexed topicId, string upcCode);

    constructor(address _flipToken, address _rawMaterialContract) {
        owner = msg.sender;
        flipToken = _flipToken;
        rawMaterialContract = RawMaterial(_rawMaterialContract);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

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
        uint256 action
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

    function depositFlipTokens(uint256 amount) external {
        require(flipToken != address(0), "FLIP token not set");
        require(IERC20(flipToken).transferFrom(msg.sender, address(this), amount), "FLIP transfer failed");
        emit FlipTokensDeposited(msg.sender, amount);
    }

    function withdrawRewardTokens(address tokenAddress, uint256 amount) external onlyOwner {
        require(IERC20(tokenAddress).transfer(msg.sender, amount), "Transfer failed");
        emit RewardTokenWithdrawn(tokenAddress, amount);
    }

    function addTopic(string calldata name, address tokenAddress) external onlyOwner returns (bytes32) {
        require(rewardTokenAddresses.contains(tokenAddress), "Token not registered");
        bytes32 topicId = keccak256(abi.encodePacked(name, block.timestamp));
        topics[topicId] = Topic(topicId, name, block.timestamp, tokenAddress, "");
        topicIds.add(topicId);
        tokenTopics[tokenAddress].add(topicId);
        emit TopicAdded(topicId, name, tokenAddress);
        return topicId;
    }

    function removeTopic(bytes32 topicId) external onlyOwner {
        require(topicIds.contains(topicId), "Topic not found");
        address tokenAddress = topics[topicId].attachedToken;
        string memory upcCode = topics[topicId].upcCode;
        topicIds.remove(topicId);
        if (tokenAddress != address(0)) {
            tokenTopics[tokenAddress].remove(topicId);
        }
        if (bytes(upcCode).length > 0) {
            upcTopics[upcCode].remove(topicId);
        }
        delete topics[topicId];
        emit TopicRemoved(topicId);
    }

    function attachTopicToToken(bytes32 topicId, address tokenAddress) external onlyOwner {
        require(topicIds.contains(topicId), "Topic not found");
        require(rewardTokenAddresses.contains(tokenAddress), "Token not registered");
        
        address currentToken = topics[topicId].attachedToken;
        if (currentToken != address(0)) {
            tokenTopics[currentToken].remove(topicId);
        }
        
        topics[topicId].attachedToken = tokenAddress;
        tokenTopics[tokenAddress].add(topicId);
        emit TopicAttached(topicId, tokenAddress);
    }

    function detachTopicFromToken(bytes32 topicId) external onlyOwner {
        require(topicIds.contains(topicId), "Topic not found");
        address tokenAddress = topics[topicId].attachedToken;
        require(tokenAddress != address(0), "Topic not attached to any token");
        
        tokenTopics[tokenAddress].remove(topicId);
        topics[topicId].attachedToken = address(0);
        emit TopicDetached(topicId, tokenAddress);
    }

    function attachTopicToUPC(bytes32 topicId, string calldata upcCode) external {
        require(topicIds.contains(topicId), "Topic not found");
        require(bytes(upcCode).length == 12, "Invalid UPC code length");
        
        // Check if the caller owns the UPC code
        address upcOwner = rawMaterialContract.getUpcOwner(upcCode);
        require(upcOwner == msg.sender, "Caller does not own this UPC code");
        
        // Remove from previous UPC if any
        string memory currentUPC = topics[topicId].upcCode;
        if (bytes(currentUPC).length > 0) {
            upcTopics[currentUPC].remove(topicId);
        }
        
        // Attach to new UPC
        topics[topicId].upcCode = upcCode;
        upcTopics[upcCode].add(topicId);
        emit TopicAttachedToUPC(topicId, upcCode);
    }

    function detachTopicFromUPC(bytes32 topicId) external {
        require(topicIds.contains(topicId), "Topic not found");
        string memory upcCode = topics[topicId].upcCode;
        require(bytes(upcCode).length > 0, "Topic not attached to any UPC");
        
        // Check if the caller owns the UPC code
        address upcOwner = rawMaterialContract.getUpcOwner(upcCode);
        require(upcOwner == msg.sender, "Caller does not own this UPC code");
        
        upcTopics[upcCode].remove(topicId);
        topics[topicId].upcCode = "";
        emit TopicDetachedFromUPC(topicId, upcCode);
    }

    function getTopicsForToken(address tokenAddress) external view returns (Topic[] memory) {
        uint256 length = tokenTopics[tokenAddress].length();
        Topic[] memory tokenTopicsList = new Topic[](length);
        
        for (uint256 i = 0; i < length; i++) {
            bytes32 topicId = tokenTopics[tokenAddress].at(i);
            tokenTopicsList[i] = topics[topicId];
        }
        
        return tokenTopicsList;
    }

    function getTopicsForUPC(string calldata upcCode) external view returns (Topic[] memory) {
        uint256 length = upcTopics[upcCode].length();
        Topic[] memory upcTopicsList = new Topic[](length);
        
        for (uint256 i = 0; i < length; i++) {
            bytes32 topicId = upcTopics[upcCode].at(i);
            upcTopicsList[i] = topics[topicId];
        }
        
        return upcTopicsList;
    }

    function submitPost(bytes32 urlHash, string calldata url, bytes32 topicId) external {
        require(!blockedAddresses.contains(msg.sender), "Address is blocked");
        require(bytes(url).length > 0, "Empty URL");
        require(sha256(bytes(url)) == urlHash, "Hash mismatch");
        require(containsBaseURL(url), "Invalid base URL");
        require(containsExport(url), "Missing '/export/'");
        require(topicIds.contains(topicId), "Invalid topic ID");
        require(!eligibleHashes[urlHash], "Hash already used");

        address rewardToken = topics[topicId].attachedToken;
        require(rewardToken != address(0), "Topic not assigned to any token");
        require(rewardToken != flipToken, "Cannot earn FLIP directly");

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

    function swapTokens(address fromToken, uint256 amount) external {
        require(rewardTokenAddresses.contains(fromToken), "From token not supported");
        require(fromToken != flipToken, "Cannot swap FLIP for FLIP");
        require(amount > 0, "Amount must be positive");
        
        uint256 exchangeRate = exchangeRates[fromToken];
        require(exchangeRate > 0, "Token not swappable");
        
        uint256 flipAmount = (amount * exchangeRate) / (10**18);
        require(flipAmount > 0, "Amount too low");
        require(IERC20(flipToken).balanceOf(address(this)) >= flipAmount, "Insufficient FLIP balance");
        
        require(IERC20(fromToken).transferFrom(msg.sender, address(this), amount), "From transfer failed");
        require(IERC20(flipToken).transfer(msg.sender, flipAmount), "FLIP transfer failed");
    }

    function setFlipToken(address _flipToken) external onlyOwner {
        flipToken = _flipToken;
    }

    function getFlipBalance() external view returns (uint256) {
        require(flipToken != address(0), "FLIP token not set");
        return IERC20(flipToken).balanceOf(address(this));
    }

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
        
        if (decoded.length < 2) {
            revert("Payload too short");
        }
        
        if (decoded[0] != '{' || decoded[decoded.length - 1] != '}') {
            revert("Not JSON: Missing braces");
        }
        
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
