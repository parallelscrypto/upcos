// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract UPCInvest {
    // Immutable core properties
    address public owner;
    string public upc;
    address public feeWallet = 0x464463AF2975bD0CA99199FCc8cc7761FE2E6051;
    uint256 public constant FEE_PERCENTAGE = 2;

    // UPC-specific properties
    string public serialNumber; // Optional serial number

    // Investment tracking
    struct Investor {
        uint256 totalInvested;
        uint256 availableBalance;
        uint256 releasedBalance;
    }
    mapping(address => Investor) public investors;
    address[] public investorAddresses;
    uint256 public totalInvested;
    uint256 public totalReleased;

    // Investment conditions
    uint256 public minInvestment;
    uint256 public maxInvestment;
    bool public openForInvestment;

    // Comrades system
    struct Comrade {
        address payable comradeAddress;
        uint256 percentage; // Basis points (10000 = 100%)
        string description;
    }
    Comrade[] public comrades;
    uint256 public totalComradePercentage;

    // Disbursement tracking
    struct Disbursement {
        address investor;
        uint256 amount;
        uint256 timestamp;
        uint256 ownerAmount;
        uint256 totalComradesAmount;
    }
    Disbursement[] public disbursements;

    // Token whitelist management
    struct TokenInfo {
        address tokenAddress;
        string symbol;
        bool isActive;
    }
    
    mapping(address => TokenInfo) public whitelistedTokens;
    address[] public whitelistedTokenAddresses;
    
    // Token investment tracking
    struct TokenInvestment {
        address tokenAddress;
        uint256 amount;
    }
    
    mapping(address => mapping(address => uint256)) public tokenInvestments;
    mapping(address => TokenInvestment[]) public investorTokenInvestments;

    // Events
    event Invested(address investor, uint256 amount, uint256 fee);
    event FundsReleased(address investor, uint256 amount);
    event FundsWithdrawn(address investor, uint256 amount);
    event InvestmentConditionsUpdated(uint256 min, uint256 max, bool isOpen);
    event ComradeAdded(address comrade, uint256 percentage, string description);
    event ComradeUpdated(uint256 index, address newAddress, uint256 newPercentage, string newDescription);
    event ComradeRemoved(address comrade);
    event FundsDisbursed(uint256 ownerAmount, uint256 totalComradesAmount);
    event SerialNumberUpdated(string newSerialNumber);
    event TokenWhitelisted(address tokenAddress, string symbol);
    event TokenRemoved(address tokenAddress);
    event TokenInvested(address investor, address tokenAddress, uint256 amount, uint256 fee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyInvestor() {
        require(investors[msg.sender].totalInvested > 0, "Only investors can call this");
        _;
    }

    constructor(string memory _upc) {
        owner = msg.sender;
        upc = _upc;
    }

    // ========== UPC PROPERTY MANAGEMENT ==========
    function setSerialNumber(string memory _serialNumber) external onlyOwner {
        serialNumber = _serialNumber;
        emit SerialNumberUpdated(_serialNumber);
    }

    // ========== OWNER FUNCTIONS ==========
    function setInvestmentConditions(
        uint256 _minInvestment,
        uint256 _maxInvestment,
        bool _openForInvestment
    ) external onlyOwner {
        minInvestment = _minInvestment;
        maxInvestment = _maxInvestment;
        openForInvestment = _openForInvestment;
        emit InvestmentConditionsUpdated(_minInvestment, _maxInvestment, _openForInvestment);
    }

    function addComrade(
        address payable _comradeAddress,
        uint256 _percentage,
        string memory _description
    ) external onlyOwner {
        require(_comradeAddress != address(0), "Invalid address");
        require(_percentage > 0 && _percentage <= 10000, "Invalid percentage");
        require(totalComradePercentage + _percentage <= 10000, "Total percentage exceeded");

        comrades.push(Comrade(_comradeAddress, _percentage, _description));
        totalComradePercentage += _percentage;
        emit ComradeAdded(_comradeAddress, _percentage, _description);
    }

    function updateComrade(
        uint256 _index,
        address payable _newAddress,
        uint256 _newPercentage,
        string memory _newDescription
    ) external onlyOwner {
        require(_index < comrades.length, "Invalid index");
        require(_newAddress != address(0), "Invalid address");

        Comrade storage comrade = comrades[_index];
        uint256 newTotal = totalComradePercentage - comrade.percentage + _newPercentage;
        require(newTotal <= 10000, "Total percentage exceeded");

        totalComradePercentage = newTotal;
        comrade.comradeAddress = _newAddress;
        comrade.percentage = _newPercentage;
        comrade.description = _newDescription;

        emit ComradeUpdated(_index, _newAddress, _newPercentage, _newDescription);
    }

    function removeComrade(uint256 _index) external onlyOwner {
        require(_index < comrades.length, "Invalid index");
        totalComradePercentage -= comrades[_index].percentage;
        emit ComradeRemoved(comrades[_index].comradeAddress);

        if (_index != comrades.length - 1) {
            comrades[_index] = comrades[comrades.length - 1];
        }
        comrades.pop();
    }

    // ========== TOKEN MANAGEMENT ==========
    function whitelistToken(address _tokenAddress, string memory _symbol) external onlyOwner {
        require(_tokenAddress != address(0), "Invalid token address");
        require(!whitelistedTokens[_tokenAddress].isActive, "Token already whitelisted");
        
        whitelistedTokens[_tokenAddress] = TokenInfo({
            tokenAddress: _tokenAddress,
            symbol: _symbol,
            isActive: true
        });
        
        whitelistedTokenAddresses.push(_tokenAddress);
        emit TokenWhitelisted(_tokenAddress, _symbol);
    }
    
    function removeToken(address _tokenAddress) external onlyOwner {
        require(whitelistedTokens[_tokenAddress].isActive, "Token not whitelisted");
        
        whitelistedTokens[_tokenAddress].isActive = false;
        
        for (uint256 i = 0; i < whitelistedTokenAddresses.length; i++) {
            if (whitelistedTokenAddresses[i] == _tokenAddress) {
                whitelistedTokenAddresses[i] = whitelistedTokenAddresses[whitelistedTokenAddresses.length - 1];
                whitelistedTokenAddresses.pop();
                break;
            }
        }
        
        emit TokenRemoved(_tokenAddress);
    }
    
    function getWhitelistedTokens() external view returns (TokenInfo[] memory) {
        TokenInfo[] memory activeTokens = new TokenInfo[](whitelistedTokenAddresses.length);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < whitelistedTokenAddresses.length; i++) {
            address tokenAddress = whitelistedTokenAddresses[i];
            if (whitelistedTokens[tokenAddress].isActive) {
                activeTokens[activeCount] = whitelistedTokens[tokenAddress];
                activeCount++;
            }
        }
        
        TokenInfo[] memory result = new TokenInfo[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeTokens[i];
        }
        
        return result;
    }

    // ========== INVESTMENT FUNCTIONS ==========
    function invest() external payable {
        require(openForInvestment, "Investments closed");
        require(msg.value >= minInvestment, "Below minimum");
        require(msg.value <= maxInvestment, "Above maximum");

        uint256 fee = (msg.value * FEE_PERCENTAGE) / 100;
        uint256 investmentAmount = msg.value - fee;

        payable(feeWallet).transfer(fee);
        totalInvested += investmentAmount;

        if (investors[msg.sender].totalInvested == 0) {
            investorAddresses.push(msg.sender);
        }
        
        investors[msg.sender].totalInvested += investmentAmount;
        investors[msg.sender].availableBalance += investmentAmount;

        emit Invested(msg.sender, investmentAmount, fee);
    }

    function investWithToken(address _tokenAddress, uint256 _amount) external {
        require(openForInvestment, "Investments closed");
        require(whitelistedTokens[_tokenAddress].isActive, "Token not whitelisted");
        require(_amount >= minInvestment, "Below minimum");
        require(_amount <= maxInvestment, "Above maximum");
        
        IERC20 token = IERC20(_tokenAddress);
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= _amount, "Check token allowance");
        
        uint256 fee = (_amount * FEE_PERCENTAGE) / 100;
        uint256 investmentAmount = _amount - fee;
        
        require(token.transferFrom(msg.sender, feeWallet, fee), "Fee transfer failed");
        require(token.transferFrom(msg.sender, address(this), investmentAmount), "Transfer failed");
        
        totalInvested += investmentAmount;

        if (investors[msg.sender].totalInvested == 0) {
            investorAddresses.push(msg.sender);
        }
        
        investors[msg.sender].totalInvested += investmentAmount;
        investors[msg.sender].availableBalance += investmentAmount;
        
        tokenInvestments[msg.sender][_tokenAddress] += investmentAmount;
        investorTokenInvestments[msg.sender].push(TokenInvestment({
            tokenAddress: _tokenAddress,
            amount: investmentAmount
        }));
        
        emit TokenInvested(msg.sender, _tokenAddress, investmentAmount, fee);
    }

    function releaseFunds(uint256 _amount) external onlyInvestor {
        require(_amount <= investors[msg.sender].availableBalance, "Exceeds available balance");

        investors[msg.sender].availableBalance -= _amount;
        investors[msg.sender].releasedBalance += _amount;
        totalReleased += _amount;

        emit FundsReleased(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external onlyInvestor {
        require(_amount <= investors[msg.sender].availableBalance, "Exceeds available balance");

        investors[msg.sender].availableBalance -= _amount;
        payable(msg.sender).transfer(_amount);

        emit FundsWithdrawn(msg.sender, _amount);
    }

    // ========== DISBURSEMENT FUNCTION ==========
    function disburse() external onlyOwner {
        require(totalReleased > 0, "No released funds");

        uint256 amount = totalReleased;
        totalReleased = 0;

        uint256 ownerAmount = (amount * (10000 - totalComradePercentage)) / 10000;
        uint256 comradesAmount = amount - ownerAmount;

        payable(owner).transfer(ownerAmount);
        
        if (comrades.length > 0) {
            for (uint256 i = 0; i < comrades.length; i++) {
                uint256 share = (amount * comrades[i].percentage) / 10000;
                comrades[i].comradeAddress.transfer(share);
            }
        }

        disbursements.push(Disbursement({
            investor: address(0),
            amount: amount,
            timestamp: block.timestamp,
            ownerAmount: ownerAmount,
            totalComradesAmount: comradesAmount
        }));

        emit FundsDisbursed(ownerAmount, comradesAmount);
    }

    // ========== VIEW FUNCTIONS ==========
    function getInvestors() external view returns (address[] memory) {
        return investorAddresses;
    }

    function getComrades() external view returns (Comrade[] memory) {
        return comrades;
    }

    function getDisbursements() external view returns (Disbursement[] memory) {
        return disbursements;
    }

    function getInvestorDetails(address _investor) external view returns (
        uint256 totalInvested,
        uint256 availableBalance,
        uint256 releasedBalance
    ) {
        Investor memory investor = investors[_investor];
        return (
            investor.totalInvested,
            investor.availableBalance,
            investor.releasedBalance
        );
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getUPCData() external view returns (
        string memory upcCode,
        string memory currentSerialNumber
    ) {
        return (upc, serialNumber);
    }

    function getInvestorTokenInvestments(address _investor) external view returns (TokenInvestment[] memory) {
        return investorTokenInvestments[_investor];
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
