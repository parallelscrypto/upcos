import React, { Component } from 'react';
import { ethers } from "ethers";
import Terminal from 'react-console-emulator';
import MLBBettingContract from '../etc/rawmaterial/MLBBetting.json';
import Web3 from 'web3';

// Contract addresses
const MLB_BETTING_ADDRESS = "0x38B58fe2cB08Ba9f2D57103dC22592d9f9b7237d";
const FLIP_TOKEN_ADDRESS = "0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118";

const MLB_BETTING_ABI = MLBBettingContract.abi;

// Standard ERC20 ABI
const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

class MLBBettingTerminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      mlbBetting: null,
      flipToken: null,
      isProgressing: false,
      provider: null,
      signer: null,
      web3: null,
      teams: [
        "ARIZONA_DIAMONDBACKS",
        "ATLANTA_BRAVES",
        "BALTIMORE_ORIOLES",
        "BOSTON_RED_SOX",
        "CHICAGO_CUBS",
        "CHICAGO_WHITE_SOX",
        "CINCINNATI_REDS",
        "CLEVELAND_GUARDIANS",
        "COLORADO_ROCKIES",
        "DETROIT_TIGERS",
        "HOUSTON_ASTROS",
        "KANSAS_CITY_ROYALS",
        "LOS_ANGELES_ANGELS",
        "LOS_ANGELES_DODGERS",
        "MIAMI_MARLINS",
        "MILWAUKEE_BREWERS",
        "MINNESOTA_TWINS",
        "NEW_YORK_METS",
        "NEW_YORK_YANKEES",
        "OAKLAND_ATHLETICS",
        "PHILADELPHIA_PHILLIES",
        "PITTSBURGH_PIRATES",
        "SAN_DIEGO_PADRES",
        "SAN_FRANCISCO_GIANTS",
        "SEATTLE_MARINERS",
        "ST_LOUIS_CARDINALS",
        "TAMPA_BAY_RAYS",
        "TEXAS_RANGERS",
        "TORONTO_BLUE_JAYS",
        "WASHINGTON_NATIONALS"
      ]
    };
    this.terminal = React.createRef();
  }

  async componentDidMount() {
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    try {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.web3 = new Web3(window.web3.currentProvider);
      }

      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      
      const mlbBettingContract = new web3.eth.Contract(
        MLB_BETTING_ABI,
        MLB_BETTING_ADDRESS
      );
      
      const flipTokenContract = new web3.eth.Contract(
        ERC20_ABI,
        FLIP_TOKEN_ADDRESS
      );

      this.setState({ 
        mlbBetting: mlbBettingContract,
        flipToken: flipTokenContract,
        account: accounts[0],
        web3: web3
      });

      this.terminal.current.pushToStdout(
        `[[success]]Connected to account: ${accounts[0]}[[/success]]`
      );
      
    } catch (error) {
      this.terminal.current.pushToStdout(
        `[[error]]Connection error: ${error.message}[[/error]]`
      );
      console.error("Blockchain connection error:", error);
    }
  }



  // Set matchup finished status (owner only)
  setMatchupFinished = async (matchupId, isFinished) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      // Convert string to boolean if needed
      const finishedStatus = isFinished === 'true' || isFinished === '1';
      
      terminal.pushToStdout(`Setting matchup ${matchupId} finished status to ${finishedStatus}...`);
      
      const tx = await this.state.mlbBetting.methods.setMatchupFinishedStatus(
        matchupId,
        finishedStatus
      ).send({ from: this.state.account });
  
      terminal.pushToStdout(
        `[[success]]Matchup finished status updated successfully![[/success]]`
      );
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
      terminal.pushToStdout(`New status: ${finishedStatus ? 'Finished' : 'Not Finished'}`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error updating finished status: ${error.message}[[/error]]`
      );
      console.error("Update finished status error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };


  // List teams with optional filter
  listTeams = async (filter = '') => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const filterLower = filter.toLowerCase();
      const filteredTeams = filter 
        ? this.state.teams.filter(team => 
            team.toLowerCase().includes(filterLower))
        : this.state.teams;

      if (filteredTeams.length === 0) {
        terminal.pushToStdout(`[[info]]No teams found matching "${filter}"[[/info]]`);
        return;
      }

      terminal.pushToStdout('[[header]]=== MLB Teams ===[[/header]]');
      filteredTeams.forEach(team => {
        terminal.pushToStdout(`- ${team}`);
      });
      terminal.pushToStdout(`[[info]]Found ${filteredTeams.length} team(s)[[/info]]`);
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error listing teams: ${error.message}[[/error]]`);
      console.error("Team list error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Helper to convert team names to enum values
  getTeamEnum = (teamName) => {
    const teamIndex = this.state.teams.indexOf(teamName.toUpperCase());
    if (teamIndex === -1) {
      throw new Error(`Invalid team name: ${teamName}`);
    }
    return teamIndex;
  };

  // Check FLIP token balance of contract
  checkFlipBalance = async () => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout('Checking FLIP token balance...');
      
      const balance = await this.state.mlbBetting.methods.getFlipTokenBalance().call();
      const balanceInEth = this.state.web3.utils.fromWei(balance, 'ether');
      
      terminal.pushToStdout(`[[balance]]`);
      terminal.pushToStdout(`${balanceInEth} FLIP`);
      terminal.pushToStdout(`[[/balance]]`);
    } catch (error) {
      terminal.pushToStdout(`[[error]]Balance check error: ${error.message}[[/error]]`);
      console.error("Balance check error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Approve Flip tokens for betting contract
  approveFlipTokens = async (amount) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(amount, 'ether');
      terminal.pushToStdout(`Approving ${amount} FLIP tokens...`);
      
      const tx = await this.state.flipToken.methods.approve(
        MLB_BETTING_ADDRESS,
        amountInWei
      ).send({ from: this.state.account });
      
      terminal.pushToStdout(`[[success]]FLIP tokens approved![[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      terminal.pushToStdout(`[[error]]Approval error: ${error.message}[[/error]]`);
      console.error("Approval error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Create a new wager
  createWager = async (matchupId, predictedWinner, amount, isDoubleInsured, upcId) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(amount, 'ether');
      terminal.pushToStdout(`Creating wager for matchup ${matchupId}...`);
      
      const tx = await this.state.mlbBetting.methods.createWager(
        matchupId,
        predictedWinner,
        isDoubleInsured,
        upcId
      ).send({ 
        from: this.state.account,
        value: amountInWei
      });

      terminal.pushToStdout(
        `[[success]]Wager created successfully![[/success]]`
      );
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Wager creation error: ${error.message}[[/error]]`
      );
      console.error("Wager creation error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Join an existing wager
  joinWager = async (wagerId, predictedWinner, amount) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(amount, 'ether');
      terminal.pushToStdout(`Joining wager ${wagerId}...`);
      
      const tx = await this.state.mlbBetting.methods.joinWager(
        wagerId,
        predictedWinner
      ).send({ 
        from: this.state.account,
        value: amountInWei
      });

      terminal.pushToStdout(
        `[[success]]Successfully joined wager![[/success]]`
      );
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error joining wager: ${error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Claim wager rewards
  claimReward = async (wagerId) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Claiming reward for wager ${wagerId}...`);
      const tx = await this.state.mlbBetting.methods.claimReward(
        wagerId
      ).send({ from: this.state.account });
      
      terminal.pushToStdout(
        `[[success]]Reward claimed successfully![[/success]]`
      );
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Get matchup details
  getMatchupDetails = async (matchupId) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Fetching details for matchup ${matchupId}...`);
      const details = await this.state.mlbBetting.methods.getMatchupDetails(
        matchupId
      ).call();
      
      terminal.pushToStdout('<span style="color:#FF5722;font-weight:bold">=== Matchup Details ===</span>');
      terminal.pushToStdout(`<span style="color:#FFC107">Home Team:</span> <span style="color:#64B5F6">${this.state.teams[details.homeTeam]}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Away Team:</span> <span style="color:#64B5F6">${this.state.teams[details.awayTeam]}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Game Date:</span> <span style="color:#64B5F6">${new Date(details.gameDay * 86400 * 1000).toISOString().split('T')[0]}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Home Score:</span> <span style="color:#64B5F6">${details.homeScore}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Away Score:</span> <span style="color:#64B5F6">${details.awayScore}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Current Inning:</span> <span style="color:#64B5F6">${details.currentInning}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Finished:</span> <span style="color:#${details.isFinished ? '4CAF50' : 'F44336'}">${details.isFinished ? 'Yes' : 'No'}</span>`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Get wager details
  getWagerDetails = async (wagerId) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Fetching details for wager ${wagerId}...`);
      const details = await this.state.mlbBetting.methods.getWagerDetails(
        wagerId
      ).call();
      
      terminal.pushToStdout('<span style="color:#FF5722;font-weight:bold">=== Wager Details ===</span>');
      terminal.pushToStdout(`<span style="color:#FFC107">Matchup ID:</span> <span style="color:#64B5F6">${details.matchupId}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Initiator:</span> <span style="color:#64B5F6">${details.initiator}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Predicted Winner:</span> <span style="color:#64B5F6">${this.state.teams[details.predictedWinner]}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Amount:</span> <span style="color:#64B5F6">${this.state.web3.utils.fromWei(details.wagerAmount, 'ether')} MATIC</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Double Insured:</span> <span style="color:#${details.isDoubleInsured ? '4CAF50' : 'F44336'}">${details.isDoubleInsured ? 'Yes' : 'No'}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Insurance Fee:</span> <span style="color:#64B5F6">${this.state.web3.utils.fromWei(details.insuranceFee, 'ether')} MATIC</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Settled:</span> <span style="color:#${details.isSettled ? '4CAF50' : 'F44336'}">${details.isSettled ? 'Yes' : 'No'}</span>`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Deposit Flip tokens to contract
  depositFlipTokens = async (amount) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(amount, 'ether');
      terminal.pushToStdout(`Depositing ${amount} FLIP tokens...`);
      
      const tx = await this.state.mlbBetting.methods.depositFlipTokens(
        amountInWei
      ).send({ from: this.state.account });
      
      terminal.pushToStdout(`[[success]]FLIP tokens deposited![[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      terminal.pushToStdout(`[[error]]Deposit error: ${error.message}[[/error]]`);
      console.error("Deposit error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Add new matchup (owner only)
  addMatchup = async (homeTeam, awayTeam, dateString) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Adding matchup: ${homeTeam} vs ${awayTeam}...`);
      
      const homeTeamEnum = this.getTeamEnum(homeTeam);
      const awayTeamEnum = this.getTeamEnum(awayTeam);
      
      const gameDay = this.parseDateString(dateString);
      const displayDate = new Date(gameDay * 86400 * 1000).toISOString().split('T')[0];
      
      terminal.pushToStdout(`Game day: ${displayDate} (day number: ${gameDay})`);
      
      const tx = await this.state.mlbBetting.methods.addMatchup(
        homeTeamEnum,
        awayTeamEnum,
        gameDay
      ).send({ from: this.state.account });

      terminal.pushToStdout(
        `[[success]]Matchup added successfully![[/success]]`
      );
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
      terminal.pushToStdout(`Game day: ${gameDay} (${displayDate})`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error adding matchup: ${error.message}[[/error]]`
      );
      console.error("Add matchup error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Edit existing matchup (owner only)
  editMatchup = async (matchupId, homeTeam, awayTeam, dateString) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Editing matchup ${matchupId}: ${homeTeam} vs ${awayTeam}...`);
      
      const homeTeamEnum = this.getTeamEnum(homeTeam);
      const awayTeamEnum = this.getTeamEnum(awayTeam);
      const gameDay = this.parseDateString(dateString);
      const displayDate = new Date(gameDay * 86400 * 1000).toISOString().split('T')[0];
      
      terminal.pushToStdout(`New game day: ${displayDate} (day number: ${gameDay})`);
      
      const tx = await this.state.mlbBetting.methods.modifyMatchup(
        matchupId,
        homeTeamEnum,
        awayTeamEnum,
        gameDay
      ).send({ from: this.state.account });

      terminal.pushToStdout(
        `[[success]]Matchup modified successfully![[/success]]`
      );
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
      terminal.pushToStdout(`New details: ${homeTeam} vs ${awayTeam} on ${displayDate}`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error modifying matchup: ${error.message}[[/error]]`
      );
      console.error("Modify matchup error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Update matchup (owner only)
  updateMatchup = async (matchupId, homeScore, awayScore, currentInning, isFinished) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    if(isFinished === false)
    {
       isFinished = 0;
    }
    try {
      terminal.pushToStdout(`Updating matchup ${matchupId}...`);
      
      const tx = await this.state.mlbBetting.methods.updateMatchup(
        matchupId,
        homeScore,
        awayScore,
        currentInning,
        isFinished
      ).send({ from: this.state.account });

      terminal.pushToStdout(
        `[[success]]Matchup updated successfully![[/success]]`
      );
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error updating matchup: ${error.message}[[/error]]`
      );
      console.error("Update matchup error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Helper to convert team names to enum values
  getTeamEnum = (teamName) => {
    const teamMap = {
      "ARIZONA_DIAMONDBACKS": 0,
      "ATLANTA_BRAVES": 1,
      "BALTIMORE_ORIOLES": 2,
      "BOSTON_RED_SOX": 3,
      "CHICAGO_CUBS": 4,
      "CHICAGO_WHITE_SOX": 5,
      "CINCINNATI_REDS": 6,
      "CLEVELAND_GUARDIANS": 7,
      "COLORADO_ROCKIES": 8,
      "DETROIT_TIGERS": 9,
      "HOUSTON_ASTROS": 10,
      "KANSAS_CITY_ROYALS": 11,
      "LOS_ANGELES_ANGELS": 12,
      "LOS_ANGELES_DODGERS": 13,
      "MIAMI_MARLINS": 14,
      "MILWAUKEE_BREWERS": 15,
      "MINNESOTA_TWINS": 16,
      "NEW_YORK_METS": 17,
      "NEW_YORK_YANKEES": 18,
      "OAKLAND_ATHLETICS": 19,
      "PHILADELPHIA_PHILLIES": 20,
      "PITTSBURGH_PIRATES": 21,
      "SAN_DIEGO_PADRES": 22,
      "SAN_FRANCISCO_GIANTS": 23,
      "SEATTLE_MARINERS": 24,
      "ST_LOUIS_CARDINALS": 25,
      "TAMPA_BAY_RAYS": 26,
      "TEXAS_RANGERS": 27,
      "TORONTO_BLUE_JAYS": 28,
      "WASHINGTON_NATIONALS": 29
    };

    const enumValue = teamMap[teamName.toUpperCase()];
    if (enumValue === undefined) {
      throw new Error(`Invalid team name: ${teamName}`);
    }
    return enumValue;
  };

  // Helper to convert date string to day number
  parseDateString = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date values');
      }
      
      return Math.floor(date.getTime() / 1000 / 86400);
    } catch (error) {
      console.error("Date parsing error:", error);
      throw new Error('Invalid date format. Please use "YYYY-MM-DD"');
    }
  };

  // Get matchups by date (YYYY-MM-DD format)
  getMatchupsByDate = async (dateString) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const dayNumber = this.parseDateString(dateString);
      terminal.pushToStdout(`Fetching matchups for ${dateString} (day ${dayNumber})...`);
      
      const matchupIds = await this.state.mlbBetting.methods.getMatchupsByDay(
        dayNumber
      ).call();
      
      if (matchupIds.length === 0) {
        terminal.pushToStdout('[[info]]No matchups found for this date[[/info]]');
        return;
      }
      
      terminal.pushToStdout('[[header]]=== Matchups ===[[/header]]');
      matchupIds.forEach(id => {
        terminal.pushToStdout(`- ID: ${id}`);
      });
      terminal.pushToStdout(`[[info]]Found ${matchupIds.length} matchup(s)[[/info]]`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error fetching matchups: ${error.message}[[/error]]`
      );
      console.error("Get matchups by date error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Get detailed view of matchups by date
  getMatchupsByDateDetailed = async (dateString) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const dayNumber = this.parseDateString(dateString);
      terminal.pushToStdout(`Fetching detailed matchups for ${dateString}...`);
      
      const matchupIds = await this.state.mlbBetting.methods.getMatchupsByDay(
        dayNumber
      ).call();
      
      if (matchupIds.length === 0) {
        terminal.pushToStdout('[[info]]No matchups found for this date[[/info]]');
        return;
      }
      
      terminal.pushToStdout('<span style="color:#FF5722;font-weight:bold">=== Matchups ===</span>');
      
      for (const id of matchupIds) {
        const details = await this.state.mlbBetting.methods.getMatchupDetails(id).call();
        const homeTeam = this.state.teams[details.homeTeam];
        const awayTeam = this.state.teams[details.awayTeam];
        
        terminal.pushToStdout(`<span style="color:#FFC107">Matchup ID:</span> <span style="color:#64B5F6">${id}</span>`);
        terminal.pushToStdout(`<span style="color:#FFC107">Teams:</span> <span style="color:#64B5F6">${homeTeam} vs ${awayTeam}</span>`);
        terminal.pushToStdout(`<span style="color:#FFC107">Score:</span> <span style="color:#64B5F6">${details.homeScore} - ${details.awayScore}</span>`);
        terminal.pushToStdout(`<span style="color:#FFC107">Inning:</span> <span style="color:#64B5F6">${details.currentInning}</span>`);
        terminal.pushToStdout(`<span style="color:#FFC107">Status:</span> <span style="color:#${details.isFinished ? '4CAF50' : 'F44336'}">${details.isFinished ? 'Finished' : 'In Progress'}</span>`);
        terminal.pushToStdout('----------------------------------');
      }
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  render() {
    const welcomeMsg = `
      [[header]]
      =============================================
      MLB Betting Terminal Interface
      =============================================
      [[/header]]
      Connected to: ${this.state.account || 'Not connected'}
      Type 'help' to see available commands
    `;

    return (
      <div style={{ 
        position: 'relative',
        backgroundColor: '#121212',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <Terminal
          style={{
            minHeight: "75vh",
            backgroundColor: "#1a0404",
            zIndex: "99",
            borderRadius: "5px",
            padding: "10px",
            fontFamily: "monospace"
          }}
          ref={this.terminal}
          commands={{
            games: {
              description: '<p style="color:hotpink;font-size:1.1em">List games by date (YYYY-MM-DD)<br/>Usage: games [date]</p>',
              fn: async (date) => await this.getMatchupsByDate(date)
            },
            gamesdetail: {
              description: '<p style="color:hotpink;font-size:1.1em">List games with details by date (YYYY-MM-DD)<br/>Usage: gamesdetail [date]</p>',
              fn: async (date) => await this.getMatchupsByDateDetailed(date)
            },
            teams: {
              description: '<p style="color:hotpink;font-size:1.1em">List all teams or filter by name<br/>Usage: teams [filter]</p>',
              fn: async (filter = '') => await this.listTeams(filter)
            },
            bal: {
              description: '<p style="color:hotpink;font-size:1.1em">Check contract FLIP token balance</p>',
              fn: async () => await this.checkFlipBalance()
            },
            approve: {
              description: '<p style="color:hotpink;font-size:1.1em">Approve FLIP tokens for betting contract<br/>Usage: approve [amount]</p>',
              fn: async (amount) => await this.approveFlipTokens(amount)
            },
            createwager: {
              description: '<p style="color:hotpink;font-size:1.1em">Create new wager<br/>Usage: createwager [matchupId] [predictedWinner] [amount] [isDoubleInsured] [upcId]</p>',
              fn: async (...args) => await this.createWager(...args)
            },
            joinwager: {
              description: '<p style="color:hotpink;font-size:1.1em">Join existing wager<br/>Usage: joinwager [wagerId] [predictedWinner] [amount]</p>',
              fn: async (...args) => await this.joinWager(...args)
            },
            claim: {
              description: '<p style="color:hotpink;font-size:1.1em">Claim wager reward<br/>Usage: claim [wagerId]</p>',
              fn: async (wagerId) => await this.claimReward(wagerId)
            },
            matchup: {
              description: '<p style="color:hotpink;font-size:1.1em">Get matchup details<br/>Usage: matchup [matchupId]</p>',
              fn: async (matchupId) => await this.getMatchupDetails(matchupId)
            },
            wager: {
              description: '<p style="color:hotpink;font-size:1.1em">Get wager details<br/>Usage: wager [wagerId]</p>',
              fn: async (wagerId) => await this.getWagerDetails(wagerId)
            },
            depositflip: {
              description: '<p style="color:hotpink;font-size:1.1em">Deposit FLIP tokens to contract<br/>Usage: depositflip [amount]</p>',
              fn: async (amount) => await this.depositFlipTokens(amount)
            },
            addmatchup: {
              description: '<p style="color:hotpink;font-size:1.1em">Add new matchup (Owner only)<br/>Usage: addmatchup [homeTeam] [awayTeam] [YYYY-MM-DD]<br/>Team names must be in ALL_CAPS (e.g. NEW_YORK_YANKEES)</p>',
              fn: async (...args) => await this.addMatchup(...args)
            },
            editmatchup: {
              description: '<p style="color:hotpink;font-size:1.1em">Edit existing matchup (Owner only)<br/>Usage: editmatchup [matchupId] [homeTeam] [awayTeam] [YYYY-MM-DD]<br/>Team names must be in ALL_CAPS</p>',
              fn: async (...args) => await this.editMatchup(...args)
            },
            updatematchup: {
              description: '<p style="color:hotpink;font-size:1.1em">Update matchup (Owner only)<br/>Usage: updatematchup [matchupId] [homeScore] [awayScore] [currentInning] [isFinished]<br/>isFinished: true/false</p>',
              fn: async (...args) => await this.updateMatchup(...args)
            },
            setfinished: {
              description: '<p style="color:hotpink;font-size:1.1em">Set matchup finished status (Owner only)<br/>Usage: setfinished [matchupId] [true/false]</p>',
              fn: async (...args) => await this.setMatchupFinished(...args)
            },
          }}
          dangerMode={true}
          welcomeMessage={welcomeMsg}
          ignoreCommandCase={true}
          promptLabel={'user@mlbbetting:~$'}
          promptLabelStyle={{
            color: "#00BCD4",
            fontWeight: "bold",
            fontSize: "1.1em"
          }}
          inputTextStyle={{
            color: "white",
            fontSize: "1.1em"
          }}
          autoFocus={true}
        />
        
        {this.state.isProgressing && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px'
          }}>
            Processing transaction...
          </div>
        )}
      </div>
    );
  }
}

export default MLBBettingTerminal;
