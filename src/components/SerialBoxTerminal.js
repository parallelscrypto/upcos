import React, { Component } from 'react';
import { ethers } from "ethers";
import Terminal from 'react-console-emulator';
import SerialBox from '../etc/rawmaterial/SerialBox.json'
import Web3 from 'web3';

// Contract addresses
const SERIAL_BOX_ADDRESS = "0x37aFB9526794Aabb1aE8aC65BbBAA09aC7030dfF";
const REWARD_TOKEN = "0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118";

const SERIAL_BOX_ABI = SerialBox.abi;

// Standard ERC20 ABI
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
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
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_from", "type": "address"},
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
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
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "owner", "type": "address"},
      {"indexed": true, "name": "spender", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  }
];

class SerialBoxTerminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      serialBox: null,
      rewardToken: null,
      isProgressing: false,
      progress: 0,
      provider: null,
      signer: null,
      fullIpfs: null,
      pipVisibility: false,
      pipDisplay: false,
      web3: null
    };
    this.progressTerminal = React.createRef();
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
      
      const serialBoxContract = new web3.eth.Contract(
        SERIAL_BOX_ABI,
        SERIAL_BOX_ADDRESS
      );
      
      const rewardTokenContract = new web3.eth.Contract(
        ERC20_ABI,
        REWARD_TOKEN
      );

      this.setState({ 
        serialBox: serialBoxContract,
        rewardToken: rewardTokenContract,
        account: accounts[0],
        web3: web3
      });

      this.progressTerminal.current.pushToStdout(
        `[[success]]Connected to account: ${accounts[0]}[[/success]]`
      );
      
      return serialBoxContract;
    } catch (error) {
      this.progressTerminal.current.pushToStdout(
        `[[error]]Connection error: ${error.message}[[/error]]`
      );
      console.error("Blockchain connection error:", error);
    }
  }

  // Reward Token Approval
  approveRewardTokens = async (numTokens) => {
    const terminal = this.progressTerminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(numTokens, 'ether');
      terminal.pushToStdout(`Approving ${numTokens} reward tokens...`);
      const tx = await this.state.rewardToken.methods.approve(
        SERIAL_BOX_ADDRESS,
        amountInWei
      ).send({ from: this.state.account });
      
      terminal.pushToStdout(`[[success]]Reward tokens approved![[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      terminal.pushToStdout(`[[error]]Approval error: ${error.message}[[/error]]`);
      console.error("Approval error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Add Reward
  addReward = async (serialNumber, recipient, upc, numTokens) => {
    const terminal = this.progressTerminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Creating reward #${serialNumber}...`);
      
      const tokensInWei = this.state.web3.utils.toWei(numTokens, 'ether');
      console.log("TOKENS IN WEI " + tokensInWei); 
      const tx = await this.state.serialBox.methods.addReward(
        serialNumber,
        recipient,
        upc,
        tokensInWei
      ).send({ from: this.state.account });

      terminal.pushToStdout(
        `[[success]]Reward #${serialNumber} created![[/success]]`
      );
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Reward creation error: ${error.message}[[/error]]`
      );
      console.error("Reward creation error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Claim Reward
  claimReward = async (serialNumber) => {
    const terminal = this.progressTerminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Claiming reward #${serialNumber}...`);
      const tx = await this.state.serialBox.methods.claimReward(
        serialNumber
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

  // Statistics
  getStats = async () => {
    const terminal = this.progressTerminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Fetching contract stats...`);
      const stats = await this.state.serialBox.methods.getStats().call();
      
      terminal.pushToStdout(`<span style="color:#FF5722;font-weight:bold">=== Contract Statistics ===</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Available Tokens:</span> <span style="color:#64B5F6">${this.state.web3.utils.fromWei(stats.availableTokens, 'ether')}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Reserved Tokens:</span> <span style="color:#64B5F6">${this.state.web3.utils.fromWei(stats.reservedTokens, 'ether')}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Total Rewards Paid:</span> <span style="color:#64B5F6">${stats.totalPaidRewards}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Total Tokens Distributed:</span> <span style="color:#64B5F6">${this.state.web3.utils.fromWei(stats.totalPaidTokens, 'ether')}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Total Rewards Created:</span> <span style="color:#64B5F6">${stats.totalCreatedRewards}</span>`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // UPC Analytics
  getTop10ByTotalTokens = async (minDate = 0) => {
    const terminal = this.progressTerminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout('Fetching top UPCs...');
      const upcs = await this.state.serialBox.methods.getTop10ByTotalTokens(minDate).call();
      
      terminal.pushToStdout('[[header]]=== Top 10 UPCs by Total Tokens ===[[/header]]');
      upcs.forEach((upc, index) => {
        terminal.pushToStdout(`${index + 1}. ${upc.upc}: ${this.state.web3.utils.fromWei(upc.value, 'ether')} tokens`);
      });
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Reward Details
  getRewardDetails = async (serialNumber) => {
    const terminal = this.progressTerminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Fetching details for reward #${serialNumber}...`);
      const details = await this.state.serialBox.methods.getRewardDetails(
        serialNumber
      ).call();
      
      terminal.pushToStdout('<span style="color:#FF5722;font-weight:bold">=== Reward Details ===</span>');
      terminal.pushToStdout(`<span style="color:#FFC107">Recipient:</span> <span style="color:#64B5F6">${details.recipient}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">UPC:</span> <span style="color:#64B5F6">${details.upc}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Tokens:</span> <span style="color:#64B5F6">${this.state.web3.utils.fromWei(details.numTokens, 'ether')}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Issue Date:</span> <span style="color:#64B5F6">${new Date(details.issueDate * 1000)}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Deadline:</span> <span style="color:#64B5F6">${new Date(details.deadline * 1000)}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Claimed:</span> <span style="color:#${details.claimed ? '4CAF50' : 'F44336'}">${details.claimed ? 'Yes' : 'No'}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Invalidated:</span> <span style="color:#${details.invalidated ? 'F44336' : '4CAF50'}">${details.invalidated ? 'Yes' : 'No'}</span>`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Get Serial Numbers for UPC
  getSerialNumbersForUPC = async (upc) => {
    const terminal = this.progressTerminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Fetching serial numbers for UPC ${upc}...`);
      const serials = await this.state.serialBox.methods.getSerialNumbersForUPC(
        upc
      ).call();
      
      terminal.pushToStdout('[[header]]=== Serial Numbers ===[[/header]]');
      serials.forEach((serial, index) => {
        terminal.pushToStdout(`${index + 1}. ${serial}`);
      });
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Token Approval
  approveTokens = async (amount) => {
    const terminal = this.progressTerminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(amount, 'ether');
      terminal.pushToStdout(`Approving ${amount} tokens...`);
      const tx = await this.state.rewardToken.methods.approve(
        SERIAL_BOX_ADDRESS,
        amountInWei
      ).send({ from: this.state.account });
      
      terminal.pushToStdout(`[[success]]Approval successful![[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      terminal.pushToStdout(`[[error]]Approval error: ${error.message}[[/error]]`);
      console.error("Approval error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Token Deposit
  depositTokens = async (amount) => {
    const terminal = this.progressTerminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(amount, 'ether');
      terminal.pushToStdout(`Depositing ${amount} tokens...`);
      const tx = await this.state.serialBox.methods.depositTokens(
        amountInWei
      ).send({ from: this.state.account });
      
      terminal.pushToStdout(`[[success]]Deposit successful![[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      terminal.pushToStdout(`[[error]]Deposit error: ${error.message}[[/error]]`);
      console.error("Deposit error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  getAvailableTokens = async () => {
    const terminal = this.progressTerminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout('Checking available tokens...');
      
      if (!this.state.serialBox) {
        throw new Error("Contract not initialized");
      }

      if (!this.state.serialBox.methods.getAvailableTokens) {
        console.log("Available methods:", Object.keys(this.state.serialBox.methods));
        throw new Error("getAvailableTokens method not found in contract");
      }

      const balance = await this.state.serialBox.methods.getAvailableTokens().call();
      const balanceString = Web3.utils.fromWei(balance.toString(), 'ether');
      
      terminal.pushToStdout(`[[info]]Available tokens: ${balanceString}[[/info]]`);
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.message}[[/error]]`);
      console.error("Balance check error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Modal Form Example
  showRewardForm = async () => {
    const terminal = this.progressTerminal.current;
    
    try {
      const rewardForm = (
        <div style={{ padding: '20px', color: 'white' }}>
          <h3>Add New Reward</h3>
          <p>This form would collect reward details</p>
        </div>
      );

      this.setState({
        fullIpfs: rewardForm,
        pipVisibility: true,
        pipDisplay: true
      });
      
      terminal.pushToStdout('[[info]]Reward form displayed in modal[[/info]]');
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  render() {
    const welcomeMsg = `
      [[header]]
      =============================================
      SerialBox Reward System - Terminal Interface
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
            backgroundImage: "url('https://f466rquetugeijv3vcaq2nb2wylme5bndab2zuphrdchu74d4sya.arweave.net/Lz3owoSdDEQmu6iBDTQ6thbCdC0YA6zR54jEen-D5LA')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: "99",
            borderRadius: "5px",
            padding: "10px",
            fontFamily: "monospace",
            boxShadow: "0 0 20px rgba(0,0,0,0.8)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
          ref={this.progressTerminal}
          commands={{
            approvereward: {
              description: '<p style="color:hotpink;font-size:1.1em">Approve tokens for rewards <br/> Usage: approvereward [amount] </p>',
              fn: async (amount) => await this.approveRewardTokens(amount)
            },
            addreward: {
              description: '<p style="color:hotpink;font-size:1.1em">Add a new reward <br/> Usage: addreward [serialNumber>] [recipient] [upc] [numTokens]</p>',
              fn: async (...args) => await this.addReward(...args)
            },
            claim: {
              description: '<p style="color:hotpink;font-size:1.1em">Claim a reward <br/>Usage: claim [serialNumber]</p>',
              fn: async (serialNumber) => await this.claimReward(serialNumber)
            },
            stats: {
              description: '<p style="color:hotpink;font-size:1.1em">View contract statistics</p>',
              fn: async () => await this.getStats()
            },
            rewardinfo: {
              description: '<p style="color:hotpink;font-size:1.1em">Get reward details <br/> Usage: rewardinfo [serialNumber]</p>',
              fn: async (serialNumber) => await this.getRewardDetails(serialNumber)
            },
            topupcs: {
              description: '<p style="color:hotpink;font-size:1.1em">View top 10 UPCs by total tokens <br/> Usage: topupcs [minDate]</p>',
              fn: async (minDate) => await this.getTop10ByTotalTokens(minDate || 0)
            },
            upcserials: {
              description: '<p style="color:hotpink;font-size:1.1em">Get serial numbers for a UPC <br/> Usage: upcserials [upc]</p>',
              fn: async (upc) => await this.getSerialNumbersForUPC(upc)
            },
            approve: {
              description: '<p style="color:hotpink;font-size:1.1em">Approve tokens for contract <br/> Usage: approve [amount]</p>',
              fn: async (amount) => await this.approveTokens(amount)
            },
            deposit: {
              description: '<p style="color:hotpink;font-size:1.1em">Deposit approved tokens<br/>Usage: deposit [amount]</p>',
              fn: async (amount) => await this.depositTokens(amount)
            },
            balance: {
              description: '<p style="color:hotpink;font-size:1.1em">Check available tokens</p>',
              fn: async () => await this.getAvailableTokens()
            },
            showform: {
              description: '<p style="color:hotpink;font-size:1.1em">Show reward form in modal</p>',
              fn: async () => await this.showRewardForm()
            },
          }}
          dangerMode={true}
          welcomeMessage={welcomeMsg}
          ignoreCommandCase={true}
          promptLabel={'user@serialbox:~$'}
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
        
        {/* Modal for forms */}
        {this.state.pipVisibility && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.9)',
            padding: '20px',
            borderRadius: '10px',
            zIndex: '100',
            border: '1px solid #333',
            display: this.state.pipDisplay ? 'block' : 'none'
          }}>
            <button 
              onClick={() => this.setState({ pipVisibility: false })}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              X
            </button>
            {this.state.fullIpfs}
          </div>
        )}
        
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
            Processing... {this.state.progress}%
          </div>
        )}
      </div>
    );
  }
}

export default SerialBoxTerminal;
