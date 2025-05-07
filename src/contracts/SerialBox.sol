// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract SerialBox is Ownable {
    using EnumerableSet for EnumerableSet.StringSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // Token contract address
    address public constant REWARD_TOKEN = 0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118;
    
    struct Reward {
        string serialNumber;
        address recipient;
        string upc;
        uint256 numTokens;
        uint256 issueDate;
        uint256 deadline;
        bool claimed;
        bool invalidated;
    }

    // Reward tracking
    mapping(string => Reward) public rewards;
    EnumerableSet.StringSet private serialNumbers;
    mapping(string => EnumerableSet.StringSet) private upcToSerialNumbers;
    
    // Statistics
    uint256 public totalRewardsPaid;
    uint256 public totalTokensDistributed;
    uint256 public totalRewardsCreated;
    uint256 public totalTokensReserved;

    // UPC Analytics
    struct UPCStats {
        uint256 totalRewards;
        uint256 totalTokens;
        uint256 claimedRewards;
        uint256 claimedTokens;
        uint256 activeRewards;
        uint256 activeTokens;
        uint256 lastActivity;
    }
    mapping(string => UPCStats) public upcStatistics;
    EnumerableSet.Bytes32Set private upcCodes;

    // Events
    event RewardCreated(
        string indexed serialNumber,
        address indexed recipient,
        string upc,
        uint256 numTokens,
        uint256 issueDate,
        uint256 deadline
    );
    event RewardClaimed(
        string indexed serialNumber,
        address indexed recipient,
        uint256 numTokens
    );
    event RewardInvalidated(
        string indexed serialNumber,
        string reason
    );
    event TokensDeposited(
        address indexed depositor,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    // Modifiers
    modifier rewardExists(string memory serialNumber) {
        require(serialNumbers.contains(serialNumber), "Reward does not exist");
        _;
    }

    // Reward Management
    function addReward(
        string memory serialNumber,
        address recipient,
        string memory upc,
        uint256 numTokens
    ) external onlyOwner {
        require(!serialNumbers.contains(serialNumber), "Serial number exists");
        require(numTokens > 0, "Token amount must be positive");
        require(recipient != address(0), "Invalid recipient");
        require(bytes(upc).length > 0, "UPC cannot be empty");
        
        uint256 currentBalance = IERC20(REWARD_TOKEN).balanceOf(address(this));
        require(currentBalance >= totalTokensReserved + numTokens, "Insufficient tokens");

        uint256 issueDate = block.timestamp;
        uint256 deadline = issueDate + 30 days;
        
        rewards[serialNumber] = Reward({
            serialNumber: serialNumber,
            recipient: recipient,
            upc: upc,
            numTokens: numTokens,
            issueDate: issueDate,
            deadline: deadline,
            claimed: false,
            invalidated: false
        });
        
        serialNumbers.add(serialNumber);
        upcToSerialNumbers[upc].add(serialNumber);
        _updateUPCStats(upc, numTokens, false);
        
        totalTokensReserved += numTokens;
        totalRewardsCreated++;
        
        emit RewardCreated(
            serialNumber,
            recipient,
            upc,
            numTokens,
            issueDate,
            deadline
        );
    }

    function claimReward(string memory serialNumber) external rewardExists(serialNumber) {
        Reward storage reward = rewards[serialNumber];
        
        require(msg.sender == reward.recipient, "Only recipient can claim");
        require(!reward.claimed, "Reward already claimed");
        require(!reward.invalidated, "Reward invalidated");
        require(block.timestamp <= reward.deadline, "Claim period expired");
        
        IERC20 token = IERC20(REWARD_TOKEN);
        require(token.transfer(reward.recipient, reward.numTokens), "Transfer failed");
        
        reward.claimed = true;
        totalTokensReserved -= reward.numTokens;
        totalRewardsPaid++;
        totalTokensDistributed += reward.numTokens;
        _updateUPCStats(reward.upc, reward.numTokens, true);
        
        emit RewardClaimed(serialNumber, reward.recipient, reward.numTokens);
    }

    function invalidateExpiredRewards() external {
        uint256 currentTime = block.timestamp;
        uint256 count = 0;
        
        for (uint256 i = 0; i < serialNumbers.length(); i++) {
            string memory serialNumber = serialNumbers.at(i);
            Reward storage reward = rewards[serialNumber];
            
            if (!reward.claimed && !reward.invalidated && currentTime > reward.deadline) {
                reward.invalidated = true;
                totalTokensReserved -= reward.numTokens;
                count++;
                emit RewardInvalidated(serialNumber, "Claim period expired");
            }
        }
    }

    // Token Management
    function depositTokens(uint256 amount) external {
        IERC20 token = IERC20(REWARD_TOKEN);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit TokensDeposited(msg.sender, amount);
    }

    function getAvailableTokens() external view returns (uint256) {
        return IERC20(REWARD_TOKEN).balanceOf(address(this)) - totalTokensReserved;
    }

    // Statistics
    function getStats() external view returns (
        uint256 availableTokens,
        uint256 reservedTokens,
        uint256 rolling5DayBalance,
        uint256 rolling10DayBalance,
        uint256 rolling20DayBalance,
        uint256 rolling30DayBalance,
        uint256 totalPaidRewards,
        uint256 totalPaidTokens,
        uint256 totalCreatedRewards
    ) {
        availableTokens = IERC20(REWARD_TOKEN).balanceOf(address(this)) - totalTokensReserved;
        reservedTokens = totalTokensReserved;
        totalPaidRewards = totalRewardsPaid;
        totalPaidTokens = totalTokensDistributed;
        totalCreatedRewards = totalRewardsCreated;
        
        (rolling5DayBalance, rolling10DayBalance, rolling20DayBalance, rolling30DayBalance) = 
            _calculateRollingBalances(block.timestamp);
    }

    // UPC Analytics
    function _updateUPCStats(string memory upc, uint256 tokenAmount, bool isClaim) private {
        bytes32 upcHash = keccak256(bytes(upc));
        if (!upcCodes.contains(upcHash)) {
            upcCodes.add(upcHash);
        }

        UPCStats storage stats = upcStatistics[upc];
        if (isClaim) {
            stats.claimedRewards++;
            stats.claimedTokens += tokenAmount;
            stats.activeRewards--;
            stats.activeTokens -= tokenAmount;
        } else {
            stats.totalRewards++;
            stats.totalTokens += tokenAmount;
            stats.activeRewards++;
            stats.activeTokens += tokenAmount;
        }
        stats.lastActivity = block.timestamp;
    }

    struct UPCRanking {
        string upc;
        uint256 value;
    }

    function getTop10ByTotalTokens(uint256 minDate) public view returns (UPCRanking[] memory) {
        return _getTop10(minDate, 0);
    }

    function getTop10ByClaimedTokens(uint256 minDate) public view returns (UPCRanking[] memory) {
        return _getTop10(minDate, 1);
    }

    function getTop10ByActiveTokens(uint256 minDate) public view returns (UPCRanking[] memory) {
        return _getTop10(minDate, 2);
    }

    function getTop10ByRewardCount(uint256 minDate) public view returns (UPCRanking[] memory) {
        return _getTop10(minDate, 3);
    }

    function _getTop10(uint256 minDate, uint8 sortBy) private view returns (UPCRanking[] memory) {
        UPCRanking[] memory allUpcs = new UPCRanking[](upcCodes.length());
        uint256 count = 0;

        for (uint256 i = 0; i < upcCodes.length(); i++) {
            string memory upc = string(abi.encodePacked(upcCodes.at(i)));
            UPCStats storage stats = upcStatistics[upc];
            
            if (stats.lastActivity >= minDate) {
                uint256 value;
                if (sortBy == 0) value = stats.totalTokens;
                else if (sortBy == 1) value = stats.claimedTokens;
                else if (sortBy == 2) value = stats.activeTokens;
                else if (sortBy == 3) value = stats.totalRewards;
                
                allUpcs[count] = UPCRanking(upc, value);
                count++;
            }
        }

        UPCRanking[] memory filteredUpcs = new UPCRanking[](count);
        for (uint256 i = 0; i < count; i++) {
            filteredUpcs[i] = allUpcs[i];
        }

        for (uint256 i = 0; i < filteredUpcs.length; i++) {
            for (uint256 j = i + 1; j < filteredUpcs.length; j++) {
                if (filteredUpcs[i].value < filteredUpcs[j].value) {
                    UPCRanking memory temp = filteredUpcs[i];
                    filteredUpcs[i] = filteredUpcs[j];
                    filteredUpcs[j] = temp;
                }
            }
        }

        uint256 resultSize = filteredUpcs.length > 10 ? 10 : filteredUpcs.length;
        UPCRanking[] memory top10 = new UPCRanking[](resultSize);
        
        for (uint256 i = 0; i < resultSize; i++) {
            top10[i] = filteredUpcs[i];
        }

        return top10;
    }

    // Helper Functions
    function _calculateRollingBalances(uint256 currentTime) private view returns (
        uint256 rolling5Day,
        uint256 rolling10Day,
        uint256 rolling20Day,
        uint256 rolling30Day
    ) {
        uint256 currentBalance = IERC20(REWARD_TOKEN).balanceOf(address(this));
        
        for (uint256 i = 0; i < serialNumbers.length(); i++) {
            string memory serialNumber = serialNumbers.at(i);
            Reward storage reward = rewards[serialNumber];
            
            if (!reward.claimed && !reward.invalidated) {
                uint256 daysToExpire = (reward.deadline - currentTime) / 1 days;
                
                if (daysToExpire <= 5) rolling5Day += reward.numTokens;
                if (daysToExpire <= 10) rolling10Day += reward.numTokens;
                if (daysToExpire <= 20) rolling20Day += reward.numTokens;
                if (daysToExpire <= 30) rolling30Day += reward.numTokens;
            }
        }
        
        rolling5Day += currentBalance;
        rolling10Day += currentBalance;
        rolling20Day += currentBalance;
        rolling30Day += currentBalance;
    }

    function getSerialNumbersForUPC(string memory upc) external view returns (string[] memory) {
        EnumerableSet.StringSet storage upcRewards = upcToSerialNumbers[upc];
        string[] memory result = new string[](upcRewards.length());
        
        for (uint256 i = 0; i < upcRewards.length(); i++) {
            result[i] = upcRewards.at(i);
        }
        
        return result;
    }

    function getRewardDetails(string memory serialNumber) external view rewardExists(serialNumber) returns (
        address recipient,
        string memory upc,
        uint256 numTokens,
        uint256 issueDate,
        uint256 deadline,
        bool claimed,
        bool invalidated
    ) {
        Reward storage reward = rewards[serialNumber];
        return (
            reward.recipient,
            reward.upc,
            reward.numTokens,
            reward.issueDate,
            reward.deadline,
            reward.claimed,
            reward.invalidated
        );
    }
}
