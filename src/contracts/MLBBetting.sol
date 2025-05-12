// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./RawMaterial.sol" as UPCContract;

contract MLBBetting {
    using Counters for Counters.Counter;
    
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
        uint256 gameDate; // Added date field
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
        mapping(uint256 => Contestant) contestants;
    }
    
    struct Reward {
        address user;
        uint256 amount;
        bool claimed;
        uint256 claimDeadline;
    }
    
    Counters.Counter private _matchupIdCounter;
    Counters.Counter private _wagerIdCounter;
    mapping(uint256 => Matchup) public matchups;
    mapping(uint256 => Wager) public wagers;
    mapping(string => uint256[]) public upcToWagers;
    mapping(MLBTeam => uint256[]) public teamToMatchups;
    mapping(uint256 => Reward[]) public matchupRewards;
    mapping(uint256 => uint256[]) public dateToMatchups; // Mapping for date to matchups
    
    uint256 public constant INSURANCE_FEE_PERCENT = 5;
    uint256 public constant LOSER_REWARD_PERCENT = 10;
    uint256 public constant CLAIM_PERIOD = 30 days;
    
    event MatchupAdded(uint256 id, MLBTeam homeTeam, MLBTeam awayTeam, uint256 gameDate);
    event MatchupUpdated(uint256 id, uint256 homeScore, uint256 awayScore, uint256 currentInning, bool isFinished);
    event WagerCreated(uint256 id, uint256 matchupId, address initiator, MLBTeam predictedWinner, uint256 amount, bool isDoubleInsured, string upcId);
    event ContestantJoined(uint256 wagerId, address contestant, uint256 amount, MLBTeam predictedWinner);
    event RewardClaimed(uint256 wagerId, address user, uint256 amount);
    event FlipTokensSent(address loser, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        upcNFT = UPCContract.RawMaterial(0x62c287A2d9af21369669E555c733cEb1eE5D74b5);
        flipToken = IERC20(FLIP_TOKEN_ADDRESS);
        _initializeTeamNames();
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
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

    function addMatchup(MLBTeam _homeTeam, MLBTeam _awayTeam, uint256 _gameDate) external onlyOwner {
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
            gameDate: _gameDate
        });
        
        teamToMatchups[_homeTeam].push(matchupId);
        teamToMatchups[_awayTeam].push(matchupId);
        dateToMatchups[_gameDate].push(matchupId);
        
        emit MatchupAdded(matchupId, _homeTeam, _awayTeam, _gameDate);
    }

    function updateMatchup(
        uint256 _matchupId,
        uint256 _homeScore,
        uint256 _awayScore,
        uint256 _currentInning,
        bool _isFinished
    ) external onlyOwner {
        require(_matchupId < _matchupIdCounter.current(), "Invalid matchup ID");
        
        Matchup storage matchup = matchups[_matchupId];
        matchup.homeScore = _homeScore;
        matchup.awayScore = _awayScore;
        matchup.currentInning = _currentInning;
        matchup.isFinished = _isFinished;
        
        emit MatchupUpdated(_matchupId, _homeScore, _awayScore, _currentInning, _isFinished);
    }

    function createWager(
        uint256 _matchupId,
        MLBTeam _predictedWinner,
        bool _isDoubleInsured,
        string memory _upcId
    ) external payable {
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
        
        if (bytes(_upcId).length > 0) {
            upcToWagers[_upcId].push(wagerId);
        }
        
        emit WagerCreated(wagerId, _matchupId, msg.sender, _predictedWinner, msg.value, _isDoubleInsured, _upcId);
    }

    function joinWager(
        uint256 _wagerId,
        MLBTeam _predictedWinner
    ) external payable {
        require(_wagerId < _wagerIdCounter.current(), "Invalid wager ID");
        Wager storage wager = wagers[_wagerId];
        
        require(!matchups[wager.matchupId].isFinished, "Matchup finished");
        require(wager.predictedWinner != _predictedWinner, "Same prediction");
        require(msg.value > 0, "Zero value");
        
        uint256 totalContestantAmount = 0;
        for (uint i = 0; i < wager.contestantCount; i++) {
            totalContestantAmount += wager.contestants[i].amount;
        }
        
        require(totalContestantAmount + msg.value <= wager.wagerAmount, "Exceeds wager");
        
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
            uint256 totalWinnings = 0;
            for (uint i = 0; i < wager.contestantCount; i++) {
                totalWinnings += wager.contestants[i].amount;
                if (wager.isDoubleInsured) {
                    uint256 flipAmount = (wager.contestants[i].amount * LOSER_REWARD_PERCENT) / 100;
                    require(flipToken.transfer(wager.contestants[i].user, flipAmount), "Flip transfer failed");
                    emit FlipTokensSent(wager.contestants[i].user, flipAmount);
                }
            }
            payable(wager.initiator).transfer(totalWinnings);
        } else {
            uint256 totalContestantAmount = 0;
            for (uint i = 0; i < wager.contestantCount; i++) {
                totalContestantAmount += wager.contestants[i].amount;
            }
            
            for (uint i = 0; i < wager.contestantCount; i++) {
                uint256 share = (wager.contestants[i].amount * wager.wagerAmount) / totalContestantAmount;
                payable(wager.contestants[i].user).transfer(share);
            }
            
            if (wager.isDoubleInsured) {
                uint256 flipAmount = (wager.wagerAmount * LOSER_REWARD_PERCENT) / 100;
                require(flipToken.transfer(wager.initiator, flipAmount), "Flip transfer failed");
                emit FlipTokensSent(wager.initiator, flipAmount);
            }
        }
        
        wager.isSettled = true;
    }

    function depositFlipTokens(uint256 amount) external {
        require(flipToken.transferFrom(msg.sender, address(this), amount), "Deposit failed");
    }

    function getMatchupsByTeam(MLBTeam _team) external view returns (uint256[] memory) {
        return teamToMatchups[_team];
    }

    function getMatchupsByDate(uint256 _date) external view returns (uint256[] memory) {
        return dateToMatchups[_date];
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
        uint256 gameDate
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
            matchup.gameDate
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
            contestants
        );
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
