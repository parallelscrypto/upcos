// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./RawMaterial.sol" as UPCContract;

contract MLBBetting {
    using Counters for Counters.Counter;
    mapping(address => bool) public admins;
    address public owner;
    UPCContract.RawMaterial public upcNFT;
    IERC20 public flipToken;
    address public constant FLIP_TOKEN_ADDRESS = 0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118;
    
    enum MLBTeam {
        ARIZONA_DIAMONDBACKS,
        ATLANTA_BRAVES,
        BALTIMORE_ORIOLES,
        BOSTON_RED_SOX,
        CHICAGO_CUBS,
        CHICAGO_WHITE_SOX,
        CINCINNATI_REDS,
        CLEVELAND_GUARDIANS,
        COLORADO_ROCKIES,
        DETROIT_TIGERS,
        HOUSTON_ASTROS,
        KANSAS_CITY_ROYALS,
        LOS_ANGELES_ANGELS,
        LOS_ANGELES_DODGERS,
        MIAMI_MARLINS,
        MILWAUKEE_BREWERS,
        MINNESOTA_TWINS,
        NEW_YORK_METS,
        NEW_YORK_YANKEES,
        OAKLAND_ATHLETICS,
        PHILADELPHIA_PHILLIES,
        PITTSBURGH_PIRATES,
        SAN_DIEGO_PADRES,
        SAN_FRANCISCO_GIANTS,
        SEATTLE_MARINERS,
        ST_LOUIS_CARDINALS,
        TAMPA_BAY_RAYS,
        TEXAS_RANGERS,
        TORONTO_BLUE_JAYS,
        WASHINGTON_NATIONALS
    }
    
    mapping(MLBTeam => string) public teamNames;
    
    struct Matchup {
        uint256 id;
        MLBTeam homeTeam;
        MLBTeam awayTeam;
        uint256 homeScore;
        uint256 awayScore;
        uint256 currentInning;
        bool isFinished;
        uint256 creationTime;
        uint256 gameDay;
        bool includeInTicker;
    }
    
    struct Contestant {
        address user;
        uint256 amount;
        MLBTeam predictedWinner;
    }
    
    struct Wager {
        uint256 id;
        uint256 matchupId;
        address initiator;
        MLBTeam predictedWinner;
        uint256 wagerAmount;
        bool isDoubleInsured;
        uint256 insuranceFee;
        string upcId;
        bool isSettled;
        uint256 contestantCount;
        bool includeInTicker;
        mapping(uint256 => Contestant) contestants;
    }
    
    struct Reward {
        address user;
        uint256 amount;
        bool claimed;
        uint256 claimDeadline;
    }

    struct WagerWithDetails {
        uint256 id;
        uint256 matchupId;
        address initiator;
        MLBTeam predictedWinner;
        uint256 wagerAmount;
        bool isDoubleInsured;
        uint256 insuranceFee;
        string upcId;
        bool isSettled;
        bool includeInTicker;
        Contestant[] contestants;
    }

    struct WinningInfo {
        uint256 wagerId;
        uint256 matchupId;
        address winner;
        uint256 amountWon;
        MLBTeam predictedWinner;
        MLBTeam actualWinner;
        uint256 homeScore;
        uint256 awayScore;
    }
    
    Counters.Counter private _matchupIdCounter;
    Counters.Counter private _wagerIdCounter;
    mapping(uint256 => Matchup) public matchups;
    mapping(uint256 => Wager) public wagers;
    mapping(string => uint256[]) public upcToWagers;
    mapping(MLBTeam => uint256[]) public teamToMatchups;
    mapping(uint256 => Reward[]) public matchupRewards;
    mapping(uint256 => uint256[]) public dayToMatchups;
    mapping(address => uint256[]) public userWagers;
    mapping(address => uint256[]) public userWonWagers;
    mapping(address => uint256[]) public userLostWagers;
    
    uint256 public constant INSURANCE_FEE_PERCENT = 5;
    uint256 public constant LOSER_REWARD_PERCENT = 10;
    uint256 public constant CLAIM_PERIOD = 30 days;
    
    event MatchupAdded(uint256 id, MLBTeam homeTeam, MLBTeam awayTeam, uint256 gameDay);
    event MatchupUpdated(uint256 id, uint256 homeScore, uint256 awayScore, uint256 currentInning, bool isFinished);
    event MatchupModified(uint256 id, MLBTeam homeTeam, MLBTeam awayTeam, uint256 gameDay);
    event WagerCreated(uint256 id, uint256 matchupId, address initiator, MLBTeam predictedWinner, uint256 amount, bool isDoubleInsured, string upcId);
    event ContestantJoined(uint256 wagerId, address contestant, uint256 amount, MLBTeam predictedWinner);
    event RewardClaimed(uint256 wagerId, address user, uint256 amount);
    event FlipTokensSent(address loser, uint256 amount);
    event MatchupFinishedStatusChanged(uint256 id, bool isFinished);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event MatchupTickerStatusChanged(uint256 indexed matchupId, bool includeInTicker);
    event WagerTickerStatusChanged(uint256 indexed wagerId, bool includeInTicker);

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
        admins[0xf67F98DBFC81581F0d2af6bDf343c762e1e6C406] = true;
        admins[0xe2140091460Be6d556ad810460a59e80C45c6A8D] = true;
        
        upcNFT = UPCContract.RawMaterial(0x62c287A2d9af21369669E555c733cEb1eE5D74b5);
        flipToken = IERC20(FLIP_TOKEN_ADDRESS);
        _initializeTeamNames();
        
        emit AdminAdded(msg.sender);
        emit AdminAdded(0xf67F98DBFC81581F0d2af6bDf343c762e1e6C406);
        emit AdminAdded(0xe2140091460Be6d556ad810460a59e80C45c6A8D);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin");
        _;
    }

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner || admins[msg.sender], "Only owner or admin");
        _;
    }

    modifier trackUserWager(address user, uint256 wagerId) {
        _;
        userWagers[user].push(wagerId);
    }

    function _initializeTeamNames() private {
        teamNames[MLBTeam.ARIZONA_DIAMONDBACKS] = "Arizona Diamondbacks";
        teamNames[MLBTeam.ATLANTA_BRAVES] = "Atlanta Braves";
        teamNames[MLBTeam.BALTIMORE_ORIOLES] = "Baltimore Orioles";
        teamNames[MLBTeam.BOSTON_RED_SOX] = "Boston Red Sox";
        teamNames[MLBTeam.CHICAGO_CUBS] = "Chicago Cubs";
        teamNames[MLBTeam.CHICAGO_WHITE_SOX] = "Chicago White Sox";
        teamNames[MLBTeam.CINCINNATI_REDS] = "Cincinnati Reds";
        teamNames[MLBTeam.CLEVELAND_GUARDIANS] = "Cleveland Guardians";
        teamNames[MLBTeam.COLORADO_ROCKIES] = "Colorado Rockies";
        teamNames[MLBTeam.DETROIT_TIGERS] = "Detroit Tigers";
        teamNames[MLBTeam.HOUSTON_ASTROS] = "Houston Astros";
        teamNames[MLBTeam.KANSAS_CITY_ROYALS] = "Kansas City Royals";
        teamNames[MLBTeam.LOS_ANGELES_ANGELS] = "Los Angeles Angels";
        teamNames[MLBTeam.LOS_ANGELES_DODGERS] = "Los Angeles Dodgers";
        teamNames[MLBTeam.MIAMI_MARLINS] = "Miami Marlins";
        teamNames[MLBTeam.MILWAUKEE_BREWERS] = "Milwaukee Brewers";
        teamNames[MLBTeam.MINNESOTA_TWINS] = "Minnesota Twins";
        teamNames[MLBTeam.NEW_YORK_METS] = "New York Mets";
        teamNames[MLBTeam.NEW_YORK_YANKEES] = "New York Yankees";
        teamNames[MLBTeam.OAKLAND_ATHLETICS] = "Oakland Athletics";
        teamNames[MLBTeam.PHILADELPHIA_PHILLIES] = "Philadelphia Phillies";
        teamNames[MLBTeam.PITTSBURGH_PIRATES] = "Pittsburgh Pirates";
        teamNames[MLBTeam.SAN_DIEGO_PADRES] = "San Diego Padres";
        teamNames[MLBTeam.SAN_FRANCISCO_GIANTS] = "San Francisco Giants";
        teamNames[MLBTeam.SEATTLE_MARINERS] = "Seattle Mariners";
        teamNames[MLBTeam.ST_LOUIS_CARDINALS] = "St. Louis Cardinals";
        teamNames[MLBTeam.TAMPA_BAY_RAYS] = "Tampa Bay Rays";
        teamNames[MLBTeam.TEXAS_RANGERS] = "Texas Rangers";
        teamNames[MLBTeam.TORONTO_BLUE_JAYS] = "Toronto Blue Jays";
        teamNames[MLBTeam.WASHINGTON_NATIONALS] = "Washington Nationals";
    }

    function setMatchupTickerStatus(uint256 _matchupId, bool _includeInTicker) external onlyOwnerOrAdmin {
        require(_matchupId < _matchupIdCounter.current(), "Invalid matchup ID");
        matchups[_matchupId].includeInTicker = _includeInTicker;
        emit MatchupTickerStatusChanged(_matchupId, _includeInTicker);
    }

    function setWagerTickerStatus(uint256 _wagerId, bool _includeInTicker) external onlyOwnerOrAdmin {
        require(_wagerId < _wagerIdCounter.current(), "Invalid wager ID");
        wagers[_wagerId].includeInTicker = _includeInTicker;
        emit WagerTickerStatusChanged(_wagerId, _includeInTicker);
    }

    function getAllWagers() external view returns (WagerWithDetails[] memory) {
        uint256 totalWagers = _wagerIdCounter.current();
        WagerWithDetails[] memory allWagers = new WagerWithDetails[](totalWagers);
        
        for (uint256 i = 0; i < totalWagers; i++) {
            Wager storage wager = wagers[i];
            Contestant[] memory contestants = new Contestant[](wager.contestantCount);
            
            for (uint256 j = 0; j < wager.contestantCount; j++) {
                contestants[j] = wager.contestants[j];
            }
            
            allWagers[i] = WagerWithDetails({
                id: wager.id,
                matchupId: wager.matchupId,
                initiator: wager.initiator,
                predictedWinner: wager.predictedWinner,
                wagerAmount: wager.wagerAmount,
                isDoubleInsured: wager.isDoubleInsured,
                insuranceFee: wager.insuranceFee,
                upcId: wager.upcId,
                isSettled: wager.isSettled,
                includeInTicker: wager.includeInTicker,
                contestants: contestants
            });
        }
        
        return allWagers;
    }

    function getAllActiveWagers() external view returns (WagerWithDetails[] memory) {
        uint256 totalWagers = _wagerIdCounter.current();
        uint256 activeCount = 0;
        
        // First count how many are active
        for (uint256 i = 0; i < totalWagers; i++) {
            if (!wagers[i].isSettled && !matchups[wagers[i].matchupId].isFinished) {
                activeCount++;
            }
        }
        
        WagerWithDetails[] memory activeWagers = new WagerWithDetails[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < totalWagers; i++) {
            Wager storage wager = wagers[i];
            if (!wager.isSettled && !matchups[wager.matchupId].isFinished) {
                Contestant[] memory contestants = new Contestant[](wager.contestantCount);
                
                for (uint256 j = 0; j < wager.contestantCount; j++) {
                    contestants[j] = wager.contestants[j];
                }
                
                activeWagers[index] = WagerWithDetails({
                    id: wager.id,
                    matchupId: wager.matchupId,
                    initiator: wager.initiator,
                    predictedWinner: wager.predictedWinner,
                    wagerAmount: wager.wagerAmount,
                    isDoubleInsured: wager.isDoubleInsured,
                    insuranceFee: wager.insuranceFee,
                    upcId: wager.upcId,
                    isSettled: wager.isSettled,
                    includeInTicker: wager.includeInTicker,
                    contestants: contestants
                });
                index++;
            }
        }
        
        return activeWagers;
    }

    function getAllActiveMatchups() external view returns (Matchup[] memory) {
        uint256 totalMatchups = _matchupIdCounter.current();
        uint256 activeCount = 0;
        
        // First count how many are active
        for (uint256 i = 0; i < totalMatchups; i++) {
            if (!matchups[i].isFinished) {
                activeCount++;
            }
        }
        
        Matchup[] memory activeMatchups = new Matchup[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < totalMatchups; i++) {
            if (!matchups[i].isFinished) {
                activeMatchups[index] = matchups[i];
                index++;
            }
        }
        
        return activeMatchups;
    }

    function getAllWins() external view returns (WinningInfo[] memory) {
        uint256 totalWagers = _wagerIdCounter.current();
        uint256 winCount = 0;
        
        // First count how many winning wagers there are
        for (uint256 i = 0; i < totalWagers; i++) {
            Wager storage wager = wagers[i];
            if (wager.isSettled) {
                Matchup storage matchup = matchups[wager.matchupId];
                MLBTeam actualWinner = matchup.homeScore > matchup.awayScore ? matchup.homeTeam : matchup.awayTeam;
                
                // Check if initiator won
                if (wager.predictedWinner == actualWinner) {
                    winCount++;
                }
                
                // Check contestants who won
                for (uint256 j = 0; j < wager.contestantCount; j++) {
                    if (wager.contestants[j].predictedWinner == actualWinner) {
                        winCount++;
                    }
                }
            }
        }
        
        WinningInfo[] memory allWins = new WinningInfo[](winCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < totalWagers; i++) {
            Wager storage wager = wagers[i];
            if (wager.isSettled) {
                Matchup storage matchup = matchups[wager.matchupId];
                MLBTeam actualWinner = matchup.homeScore > matchup.awayScore ? matchup.homeTeam : matchup.awayTeam;
                
                // Check if initiator won
                if (wager.predictedWinner == actualWinner) {
                    uint256 totalWinnings = wager.wagerAmount;
                    for (uint256 j = 0; j < wager.contestantCount; j++) {
                        totalWinnings += wager.contestants[j].amount;
                    }
                    
                    allWins[index] = WinningInfo({
                        wagerId: wager.id,
                        matchupId: wager.matchupId,
                        winner: wager.initiator,
                        amountWon: totalWinnings,
                        predictedWinner: wager.predictedWinner,
                        actualWinner: actualWinner,
                        homeScore: matchup.homeScore,
                        awayScore: matchup.awayScore
                    });
                    index++;
                }
                
                // Check contestants who won
                for (uint256 j = 0; j < wager.contestantCount; j++) {
                    if (wager.contestants[j].predictedWinner == actualWinner) {
                        uint256 contestantWinnings = wager.contestants[j].amount + 
                                                   (wager.wagerAmount / wager.contestantCount);
                        
                        allWins[index] = WinningInfo({
                            wagerId: wager.id,
                            matchupId: wager.matchupId,
                            winner: wager.contestants[j].user,
                            amountWon: contestantWinnings,
                            predictedWinner: wager.contestants[j].predictedWinner,
                            actualWinner: actualWinner,
                            homeScore: matchup.homeScore,
                            awayScore: matchup.awayScore
                        });
                        index++;
                    }
                }
            }
        }
        
        return allWins;
    }

    function getWinsTicker() external view returns (WinningInfo[] memory) {
        uint256 totalWagers = _wagerIdCounter.current();
        uint256 winCount = 0;
        
        // First count how many winning wagers there are that are marked for ticker
        for (uint256 i = 0; i < totalWagers; i++) {
            Wager storage wager = wagers[i];
            if (wager.isSettled && wager.includeInTicker) {
                Matchup storage matchup = matchups[wager.matchupId];
                MLBTeam actualWinner = matchup.homeScore > matchup.awayScore ? matchup.homeTeam : matchup.awayTeam;
                
                if (wager.predictedWinner == actualWinner) {
                    winCount++;
                }
                
                for (uint256 j = 0; j < wager.contestantCount; j++) {
                    if (wager.contestants[j].predictedWinner == actualWinner) {
                        winCount++;
                    }
                }
            }
        }
        
        WinningInfo[] memory tickerWins = new WinningInfo[](winCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < totalWagers; i++) {
            Wager storage wager = wagers[i];
            if (wager.isSettled && wager.includeInTicker) {
                Matchup storage matchup = matchups[wager.matchupId];
                MLBTeam actualWinner = matchup.homeScore > matchup.awayScore ? matchup.homeTeam : matchup.awayTeam;
                
                if (wager.predictedWinner == actualWinner) {
                    uint256 totalWinnings = wager.wagerAmount;
                    for (uint256 j = 0; j < wager.contestantCount; j++) {
                        totalWinnings += wager.contestants[j].amount;
                    }
                    
                    tickerWins[index] = WinningInfo({
                        wagerId: wager.id,
                        matchupId: wager.matchupId,
                        winner: wager.initiator,
                        amountWon: totalWinnings,
                        predictedWinner: wager.predictedWinner,
                        actualWinner: actualWinner,
                        homeScore: matchup.homeScore,
                        awayScore: matchup.awayScore
                    });
                    index++;
                }
                
                for (uint256 j = 0; j < wager.contestantCount; j++) {
                    if (wager.contestants[j].predictedWinner == actualWinner) {
                        uint256 contestantWinnings = wager.contestants[j].amount + 
                                                   (wager.wagerAmount / wager.contestantCount);
                        
                        tickerWins[index] = WinningInfo({
                            wagerId: wager.id,
                            matchupId: wager.matchupId,
                            winner: wager.contestants[j].user,
                            amountWon: contestantWinnings,
                            predictedWinner: wager.contestants[j].predictedWinner,
                            actualWinner: actualWinner,
                            homeScore: matchup.homeScore,
                            awayScore: matchup.awayScore
                        });
                        index++;
                    }
                }
            }
        }
        
        return tickerWins;
    }

    function getActiveMatchupTicker() external view returns (Matchup[] memory) {
        uint256 totalMatchups = _matchupIdCounter.current();
        uint256 activeTickerCount = 0;
        
        // First count how many are active and marked for ticker
        for (uint256 i = 0; i < totalMatchups; i++) {
            if (!matchups[i].isFinished && matchups[i].includeInTicker) {
                activeTickerCount++;
            }
        }
        
        Matchup[] memory activeTickerMatchups = new Matchup[](activeTickerCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < totalMatchups; i++) {
            if (!matchups[i].isFinished && matchups[i].includeInTicker) {
                activeTickerMatchups[index] = matchups[i];
                index++;
            }
        }
        
        return activeTickerMatchups;
    }

    function addAdmin(address _admin) external onlyOwner {
        require(_admin != address(0), "Invalid address");
        require(!admins[_admin], "Already admin");
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        require(_admin != owner, "Cannot remove owner");
        require(admins[_admin], "Not an admin");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        require(newOwner != owner, "Already owner");
        admins[owner] = false;
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        admins[newOwner] = true;
    }

    function addMatchup(MLBTeam _homeTeam, MLBTeam _awayTeam, uint256 _gameDay) external onlyOwnerOrAdmin {
        uint256 matchupId = _matchupIdCounter.current();
        _matchupIdCounter.increment();
        
        matchups[matchupId] = Matchup({
            id: matchupId,
            homeTeam: _homeTeam,
            awayTeam: _awayTeam,
            homeScore: 0,
            awayScore: 0,
            currentInning: 0,
            isFinished: false,
            creationTime: block.timestamp,
            gameDay: _gameDay,
            includeInTicker: true // Default to true for ticker inclusion
        });
        
        teamToMatchups[_homeTeam].push(matchupId);
        teamToMatchups[_awayTeam].push(matchupId);
        dayToMatchups[_gameDay].push(matchupId);
        
        emit MatchupAdded(matchupId, _homeTeam, _awayTeam, _gameDay);
    }

    function setMatchupFinishedStatus(uint256 _matchupId, bool _isFinished) external onlyOwnerOrAdmin {
        require(_matchupId < _matchupIdCounter.current(), "Invalid matchup ID");
        
        Matchup storage matchup = matchups[_matchupId];
        matchup.isFinished = _isFinished;
        
        emit MatchupFinishedStatusChanged(_matchupId, _isFinished);
    }

    function updateMatchup(
        uint256 _matchupId,
        uint256 _homeScore,
        uint256 _awayScore,
        uint256 _currentInning,
        bool _isFinished
    ) external onlyOwnerOrAdmin {
        require(_matchupId < _matchupIdCounter.current(), "Invalid matchup ID");
        
        Matchup storage matchup = matchups[_matchupId];
        matchup.homeScore = _homeScore;
        matchup.awayScore = _awayScore;
        matchup.currentInning = _currentInning;
        matchup.isFinished = _isFinished;
        
        emit MatchupUpdated(_matchupId, _homeScore, _awayScore, _currentInning, _isFinished);
    }

    function modifyMatchup(
        uint256 _matchupId,
        MLBTeam _homeTeam,
        MLBTeam _awayTeam,
        uint256 _gameDay
    ) external onlyOwnerOrAdmin {
        require(_matchupId < _matchupIdCounter.current(), "Invalid matchup ID");
        require(!matchups[_matchupId].isFinished, "Cannot modify finished matchup");
        
        MLBTeam oldHomeTeam = matchups[_matchupId].homeTeam;
        MLBTeam oldAwayTeam = matchups[_matchupId].awayTeam;
        uint256 oldGameDay = matchups[_matchupId].gameDay;
        
        removeFromMapping(teamToMatchups[oldHomeTeam], _matchupId);
        removeFromMapping(teamToMatchups[oldAwayTeam], _matchupId);
        removeFromMapping(dayToMatchups[oldGameDay], _matchupId);
        
        matchups[_matchupId].homeTeam = _homeTeam;
        matchups[_matchupId].awayTeam = _awayTeam;
        matchups[_matchupId].gameDay = _gameDay;
        
        teamToMatchups[_homeTeam].push(_matchupId);
        teamToMatchups[_awayTeam].push(_matchupId);
        dayToMatchups[_gameDay].push(_matchupId);
        
        emit MatchupModified(_matchupId, _homeTeam, _awayTeam, _gameDay);
    }

    function removeFromMapping(uint256[] storage array, uint256 value) private {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }

    function createWager(
        uint256 _matchupId,
        MLBTeam _predictedWinner,
        bool _isDoubleInsured,
        string memory _upcId
    ) external payable trackUserWager(msg.sender, _wagerIdCounter.current()) {
        require(_matchupId < _matchupIdCounter.current(), "Invalid matchup ID");
        require(!matchups[_matchupId].isFinished, "Matchup finished");
        require(msg.value > 0, "Zero value");
        
        if (bytes(_upcId).length > 0) {
            require(upcNFT.getUpcOwner(_upcId) == msg.sender, "Not UPC owner");
        }
        
        uint256 insuranceFee = 0;
        if (_isDoubleInsured) {
            insuranceFee = (msg.value * INSURANCE_FEE_PERCENT) / 100;
            payable(owner).transfer(insuranceFee);
        }
        
        uint256 wagerId = _wagerIdCounter.current();
        _wagerIdCounter.increment();
        
        Wager storage newWager = wagers[wagerId];
        newWager.id = wagerId;
        newWager.matchupId = _matchupId;
        newWager.initiator = msg.sender;
        newWager.predictedWinner = _predictedWinner;
        newWager.wagerAmount = msg.value - insuranceFee;
        newWager.isDoubleInsured = _isDoubleInsured;
        newWager.insuranceFee = insuranceFee;
        newWager.upcId = _upcId;
        newWager.isSettled = false;
        newWager.contestantCount = 0;
        newWager.includeInTicker = true; // Default to true for ticker inclusion
        
        if (bytes(_upcId).length > 0) {
            upcToWagers[_upcId].push(wagerId);
        }
        
        emit WagerCreated(wagerId, _matchupId, msg.sender, _predictedWinner, msg.value, _isDoubleInsured, _upcId);
    }

    function joinWager(
        uint256 _wagerId,
        MLBTeam _predictedWinner
    ) external payable trackUserWager(msg.sender, _wagerId) {
        require(_wagerId < _wagerIdCounter.current(), "Invalid wager ID");
        Wager storage wager = wagers[_wagerId];
        
        require(!matchups[wager.matchupId].isFinished, "Matchup finished");
        require(wager.predictedWinner != _predictedWinner, "Same prediction");
        require(msg.value > 0, "Zero value");
        
        uint256 totalContestantAmount = 0;
        for (uint i = 0; i < wager.contestantCount; i++) {
            totalContestantAmount += wager.contestants[i].amount;
        }
        
        uint256 remainingCapacity = wager.wagerAmount - totalContestantAmount;
        require(msg.value <= remainingCapacity, 
            string(abi.encodePacked(
                "Only ", 
                Strings.toString(remainingCapacity), 
                " MATIC remaining to bet"
            ))
        );
        
        wager.contestants[wager.contestantCount] = Contestant({
            user: msg.sender,
            amount: msg.value,
            predictedWinner: _predictedWinner
        });
        wager.contestantCount++;
        
        emit ContestantJoined(_wagerId, msg.sender, msg.value, _predictedWinner);
    }

    function claimReward(uint256 _wagerId) external {
        require(_wagerId < _wagerIdCounter.current(), "Invalid wager ID");
        Wager storage wager = wagers[_wagerId];
        Matchup storage matchup = matchups[wager.matchupId];
        
        require(matchup.isFinished, "Matchup ongoing");
        require(!wager.isSettled, "Already settled");
        
        MLBTeam actualWinner = matchup.homeScore > matchup.awayScore ? matchup.homeTeam : matchup.awayTeam;
        bool initiatorWon = (wager.predictedWinner == actualWinner);
        
        if (initiatorWon) {
            uint256 totalWinnings = wager.wagerAmount;
            for (uint i = 0; i < wager.contestantCount; i++) {
                totalWinnings += wager.contestants[i].amount;
                if (wager.isDoubleInsured) {
                    uint256 flipAmount = (wager.contestants[i].amount * LOSER_REWARD_PERCENT) / 100;
                    require(flipToken.transfer(wager.contestants[i].user, flipAmount), "Flip transfer failed");
                    emit FlipTokensSent(wager.contestants[i].user, flipAmount);
                }
            }
            payable(wager.initiator).transfer(totalWinnings);
            
            userWonWagers[wager.initiator].push(_wagerId);
            for (uint i = 0; i < wager.contestantCount; i++) {
                userLostWagers[wager.contestants[i].user].push(_wagerId);
            }
        } else {
            uint256[] memory winnerIndices = new uint256[](wager.contestantCount);
            uint256 winnerCount = 0;
            
            for (uint i = 0; i < wager.contestantCount; i++) {
                if (wager.contestants[i].predictedWinner == actualWinner) {
                    winnerIndices[winnerCount] = i;
                    winnerCount++;
                }
            }
            
            require(winnerCount > 0, "No winners");
            
            for (uint i = 0; i < winnerCount; i++) {
                uint256 index = winnerIndices[i];
                payable(wager.contestants[index].user).transfer(wager.contestants[index].amount);
            }
            
            uint256 initiatorSharePerWinner = wager.wagerAmount / winnerCount;
            uint256 remainder = wager.wagerAmount % winnerCount;
            
            for (uint i = 0; i < winnerCount; i++) {
                uint256 payout = initiatorSharePerWinner + (i < remainder ? 1 : 0);
                payable(wager.contestants[winnerIndices[i]].user).transfer(payout);
            }
            
            if (wager.isDoubleInsured) {
                uint256 flipAmount = (wager.wagerAmount * LOSER_REWARD_PERCENT) / 100;
                require(flipToken.transfer(wager.initiator, flipAmount), "Flip transfer failed");
                emit FlipTokensSent(wager.initiator, flipAmount);
            }
            
            userLostWagers[wager.initiator].push(_wagerId);
            for (uint i = 0; i < wager.contestantCount; i++) {
                if (wager.contestants[i].predictedWinner == actualWinner) {
                    userWonWagers[wager.contestants[i].user].push(_wagerId);
                } else {
                    userLostWagers[wager.contestants[i].user].push(_wagerId);
                }
            }
        }
        
        wager.isSettled = true;
    }

    function getRemainingWagerCapacity(uint256 _wagerId) public view returns (uint256) {
        Wager storage wager = wagers[_wagerId];
        uint256 totalContestantAmount = 0;
        for (uint i = 0; i < wager.contestantCount; i++) {
            totalContestantAmount += wager.contestants[i].amount;
        }
        return wager.wagerAmount - totalContestantAmount;
    }

    function depositFlipTokens(uint256 amount) external {
        require(flipToken.transferFrom(msg.sender, address(this), amount), "Deposit failed");
    }

    function getMatchupsByTeam(MLBTeam _team) external view returns (uint256[] memory) {
        return teamToMatchups[_team];
    }

    function getMatchupsByDay(uint256 _dayNumber) external view returns (uint256[] memory) {
        return dayToMatchups[_dayNumber];
    }

    function getWagersByUPC(string memory _upcId) external view returns (uint256[] memory) {
        return upcToWagers[_upcId];
    }

    function getContestants(uint256 _wagerId) external view returns (Contestant[] memory) {
        require(_wagerId < _wagerIdCounter.current(), "Invalid wager ID");
        Wager storage wager = wagers[_wagerId];
        Contestant[] memory contestantsArray = new Contestant[](wager.contestantCount);
        
        for (uint i = 0; i < wager.contestantCount; i++) {
            contestantsArray[i] = wager.contestants[i];
        }
        
        return contestantsArray;
    }

    function getMatchupDetails(uint256 _matchupId) external view returns (
        MLBTeam homeTeam,
        MLBTeam awayTeam,
        uint256 homeScore,
        uint256 awayScore,
        uint256 currentInning,
        bool isFinished,
        uint256 creationTime,
        uint256 gameDay,
        bool includeInTicker
    ) {
        require(_matchupId < _matchupIdCounter.current(), "Invalid matchup ID");
        Matchup storage matchup = matchups[_matchupId];
        
        return (
            matchup.homeTeam,
            matchup.awayTeam,
            matchup.homeScore,
            matchup.awayScore,
            matchup.currentInning,
            matchup.isFinished,
            matchup.creationTime,
            matchup.gameDay,
            matchup.includeInTicker
        );
    }

    function getWagerDetails(uint256 _wagerId) external view returns (
        uint256 matchupId,
        address initiator,
        MLBTeam predictedWinner,
        uint256 wagerAmount,
        bool isDoubleInsured,
        uint256 insuranceFee,
        string memory upcId,
        bool isSettled,
        bool includeInTicker,
        Contestant[] memory contestants
    ) {
        require(_wagerId < _wagerIdCounter.current(), "Invalid wager ID");
        Wager storage wager = wagers[_wagerId];
        
        contestants = new Contestant[](wager.contestantCount);
        for (uint i = 0; i < wager.contestantCount; i++) {
            contestants[i] = wager.contestants[i];
        }
        
        return (
            wager.matchupId,
            wager.initiator,
            wager.predictedWinner,
            wager.wagerAmount,
            wager.isDoubleInsured,
            wager.insuranceFee,
            wager.upcId,
            wager.isSettled,
            wager.includeInTicker,
            contestants
        );
    }

    function getUserWagers(address user) external view returns (uint256[] memory) {
        return userWagers[user];
    }

    function getUserWonWagers(address user) external view returns (uint256[] memory) {
        return userWonWagers[user];
    }

    function getUserLostWagers(address user) external view returns (uint256[] memory) {
        return userLostWagers[user];
    }

    function getUserActiveWagers(address user) external view returns (uint256[] memory) {
        uint256[] memory allWagers = userWagers[user];
        uint256 activeCount = 0;
        
        for (uint i = 0; i < allWagers.length; i++) {
            uint256 wagerId = allWagers[i];
            if (!wagers[wagerId].isSettled && !matchups[wagers[wagerId].matchupId].isFinished) {
                activeCount++;
            }
        }
        
        uint256[] memory activeWagers = new uint256[](activeCount);
        uint256 index = 0;
        for (uint i = 0; i < allWagers.length; i++) {
            uint256 wagerId = allWagers[i];
            if (!wagers[wagerId].isSettled && !matchups[wagers[wagerId].matchupId].isFinished) {
                activeWagers[index] = wagerId;
                index++;
            }
        }
        
        return activeWagers;
    }

    function getWagerStatus(uint256 wagerId) external view returns (string memory) {
        require(wagerId < _wagerIdCounter.current(), "Invalid wager ID");
        Wager storage wager = wagers[wagerId];
        Matchup storage matchup = matchups[wager.matchupId];
        
        if (wager.isSettled) {
            MLBTeam actualWinner = matchup.homeScore > matchup.awayScore ? matchup.homeTeam : matchup.awayTeam;
            bool initiatorWon = (wager.predictedWinner == actualWinner);
            
            if (initiatorWon) {
                return wager.initiator == msg.sender ? "won" : "lost";
            } else {
                for (uint i = 0; i < wager.contestantCount; i++) {
                    if (wager.contestants[i].user == msg.sender && 
                        wager.contestants[i].predictedWinner == actualWinner) {
                        return "won";
                    }
                }
                return "lost";
            }
        } else if (matchup.isFinished) {
            return "ready to claim";
        } else {
            return "active";
        }
    }

    function setUPCNFT(address newAddress) external onlyOwner {
        upcNFT = UPCContract.RawMaterial(newAddress);
    }

    function getFlipTokenBalance() external view returns (uint256) {
        return flipToken.balanceOf(address(this));
    }

    function withdrawFlipTokens(uint256 amount) external onlyOwner {
        require(flipToken.transfer(owner, amount), "Withdrawal failed");
    }
}
