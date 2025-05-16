// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Base64.sol";  // Local import
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";



contract MoneyPost {
    using EnumerableSet for EnumerableSet.AddressSet;

    address public owner;
    string public baseURL;
    IERC20 public flipToken;

    struct RewardToken {
        string name;
        address tokenAddress;
        uint256 rewardAmount;
    }

    EnumerableSet.AddressSet private rewardTokenAddresses;
    mapping(address => RewardToken) public rewardTokens;
    mapping(address => uint256) public exchangeRates;
    mapping(bytes32 => bool) public eligibleHashes;
    uint256 public flipRewardAmount = 0.1 ether;

    constructor() {
        owner = msg.sender;
        //baseURL = _baseURL;
        flipToken = IERC20(0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function depositFlip(uint256 amount) external {
        require(flipToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    function addRewardToken(string calldata name, address tokenAddress, uint256 rewardAmount) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token");
        rewardTokens[tokenAddress] = RewardToken(name, tokenAddress, rewardAmount);
        rewardTokenAddresses.add(tokenAddress);
    }

    function removeRewardToken(address tokenAddress) external onlyOwner {
        rewardTokenAddresses.remove(tokenAddress);
        delete rewardTokens[tokenAddress];
    }

    function setRewardAmount(address tokenAddress, uint256 rewardAmount) external onlyOwner {
        require(rewardTokenAddresses.contains(tokenAddress), "Token not registered");
        rewardTokens[tokenAddress].rewardAmount = rewardAmount;
    }

    function setExchangeRate(address creatorToken, uint256 rate) external onlyOwner {
        require(rewardTokenAddresses.contains(creatorToken), "Token not registered");
        exchangeRates[creatorToken] = rate;
    }

    function setBaseURL(string memory _baseURL) external onlyOwner {
        baseURL = _baseURL;
    }

    function submitPost(bytes32 urlHash, string calldata url, address rewardToken) external {
        require(bytes(url).length > 0, "Empty URL");
        require(sha256(bytes(url)) == urlHash, "Hash mismatch");
        require(containsBaseURL(url), "Invalid base URL");
        require(containsExport(url), "Missing '/export/'");
        validatePayload(extractPayload(url));
        require(!eligibleHashes[urlHash], "Hash already used");
        eligibleHashes[urlHash] = true;

        if (rewardToken == address(flipToken)) {
            require(flipToken.transfer(msg.sender, flipRewardAmount), "FLIP payment failed");
        } else {
            RewardToken memory token = rewardTokens[rewardToken];
            require(token.tokenAddress != address(0), "Invalid reward token");
            require(IERC20(token.tokenAddress).transfer(msg.sender, token.rewardAmount), "Payment failed");
        }
    }

    function swapForFlip(address creatorToken, uint256 amount) external {
        uint256 rate = exchangeRates[creatorToken];
        require(rate > 0, "Token not swappable");
        uint256 flipAmount = amount / rate;
        require(flipAmount > 0, "Amount too low");
        require(IERC20(creatorToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        require(flipToken.transfer(msg.sender, flipAmount), "FLIP payment failed");
    }

    function listRewardTokens() external view returns (RewardToken[] memory) {
        RewardToken[] memory tokens = new RewardToken[](rewardTokenAddresses.length());
        for (uint256 i = 0; i < rewardTokenAddresses.length(); i++) {
            tokens[i] = rewardTokens[rewardTokenAddresses.at(i)];
        }
        return tokens;
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
