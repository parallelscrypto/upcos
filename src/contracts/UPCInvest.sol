// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UPCInvest {
    // Immutable core properties
    address public owner;
    string public upc;
    address public  feeWallet = 0x464463AF2975bD0CA99199FCc8cc7761FE2E6051;
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

    function getSerialNumber() external view returns (string memory) {
        return serialNumber;
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
        
        // Calculate new total percentage
        uint256 newTotal = totalComradePercentage - comrade.percentage + _newPercentage;
        require(newTotal <= 10000, "Total percentage exceeded");

        // Update values
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

    // ========== INVESTOR FUNCTIONS ==========
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
        require(comrades.length > 0, "No comrades set");

        uint256 amount = totalReleased;
        totalReleased = 0;

        uint256 ownerAmount = (amount * (10000 - totalComradePercentage)) / 10000;
        uint256 comradesAmount = amount - ownerAmount;

        payable(owner).transfer(ownerAmount);
        for (uint256 i = 0; i < comrades.length; i++) {
            uint256 share = (amount * comrades[i].percentage) / 10000;
            comrades[i].comradeAddress.transfer(share);
        }

        disbursements.push(Disbursement({
            investor: address(0), // Marks as owner-initiated
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
}

