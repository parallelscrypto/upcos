import React, { Component } from 'react';
import { ethers } from "ethers";
import Terminal from 'react-console-emulator';
import MLBBettingContract from '../etc/rawmaterial/MLBBetting.json';
import Web3 from 'web3';

// Contract addresses
const MLB_BETTING_ADDRESS = "0x4229bFFb75135F942DecfB13055a31580D80C855";
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
      web3: null
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
      terminal.pushToStdout(`<span style="color:#FFC107">Home Team:</span> <span style="color:#64B5F6">${details.homeTeam}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Away Team:</span> <span style="color:#64B5F6">${details.awayTeam}</span>`);
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
      terminal.pushToStdout(`<span style="color:#FFC107">Predicted Winner:</span> <span style="color:#64B5F6">${details.predictedWinner}</span>`);
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
            }
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
