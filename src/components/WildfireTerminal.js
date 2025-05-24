import React, { Component } from 'react';
import { ethers } from 'ethers';
import Terminal from 'react-console-emulator';
import WildfireBurnABI from '../etc/rawmaterial/Wildfire.json'; // Your compiled contract ABI

class WildfireTerminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      wildfireContract: null,
      provider: null,
      signer: null,
      isConnected: false,
      isProgressing: false,
      wildfires: [],
      activeWildfire: null,
      userBadges: []
    };
    this.terminal = React.createRef();
  }

  componentDidMount() {
    this.checkWalletConnection();
  }

  async checkWalletConnection() {
    try {
      if (!window.ethereum) {
        throw new Error("No Ethereum provider detected. Please install MetaMask!");
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await this.loadBlockchainData();
      } else {
        this.terminal.current.pushToStdout(
          '[[info]]Wallet not connected. Use "connect" command to connect.[[/info]]'
        );
      }

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.loadBlockchainData();
        } else {
          this.handleDisconnect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

    } catch (error) {
      this.terminal.current.pushToStdout(
        `[[error]]Connection error: ${error.message}[[/error]]`
      );
    }
  }

  async connectWallet() {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await this.loadBlockchainData();
    } catch (error) {
      this.terminal.current.pushToStdout(
        `[[error]]Connection error: ${error.message}[[/error]]`
      );
    }
  }

  handleDisconnect() {
    this.setState({
      account: '',
      wildfireContract: null,
      provider: null,
      signer: null,
      isConnected: false,
      wildfires: [],
      activeWildfire: null
    });
    this.terminal.current.pushToStdout('[[warning]]Wallet disconnected[[/warning]]');
  }

  async loadBlockchainData() {
    this.setState({ isProgressing: true });
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      
      // Replace with your deployed contract address
      const contractAddress = "0xC9a7De5aA25C0F00F9434b1003957C266acB3eE6";
      const wildfireContract = new ethers.Contract(
        contractAddress,
        WildfireBurnABI.abi,
        signer
      );

      this.setState({ 
        wildfireContract,
        provider,
        signer,
        account,
        isConnected: true
      });

      this.terminal.current.pushToStdout(
        `[[success]]Connected to account: ${account}[[/success]]`
      );

      await this.loadWildfires();
      
    } catch (error) {
      this.terminal.current.pushToStdout(
        `[[error]]Connection error: ${error.message}[[/error]]`
      );
      console.error("Blockchain connection error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async loadWildfires() {
    try {
      const { wildfireContract } = this.state;
      const terminal = this.terminal.current;
      
      const wildfireCount = await wildfireContract._wildfireIds;
      const wildfires = [];
      
      for (let i = 1; i <= wildfireCount; i++) {
        const wildfire = await wildfireContract.wildfires(i);
        wildfires.push({
          id: i,
          creator: wildfire.creator,
          tokenAddress: wildfire.tokenAddress,
          tokenName: wildfire.tokenName,
          missionStatement: wildfire.missionStatement,
          targetBurnAmount: wildfire.targetBurnAmount.toString(),
          startDate: new Date(wildfire.startDate * 1000).toLocaleString(),
          tokensPerMine: wildfire.tokensPerMine.toString(),
          minePrice: ethers.utils.formatEther(wildfire.minePrice),
          totalDeposited: wildfire.totalDeposited.toString(),
          totalMined: wildfire.totalMined.toString(),
          totalBurned: wildfire.totalBurned.toString(),
          isActive: wildfire.isActive
        });
      }
      
      this.setState({ wildfires });
      
      terminal.pushToStdout('[[header]]=== Active Wildfires ===[[/header]]');
      wildfires.forEach(wildfire => {
        terminal.pushToStdout(
          `${wildfire.id}. ${wildfire.tokenName} (${wildfire.tokenAddress})\n` +
          `   Mission: ${wildfire.missionStatement}\n` +
          `   Target: ${wildfire.targetBurnAmount} tokens\n` +
          `   Status: ${wildfire.isActive ? 'Active' : 'Inactive'}\n` +
          `   Created: ${wildfire.startDate}`
        );
      });
      
    } catch (error) {
      this.terminal.current.pushToStdout(
        `[[error]]Error loading wildfires: ${error.message}[[/error]]`
      );
      console.error("Error loading wildfires:", error);
    }
  }

  async createWildfire(tokenAddress, tokenName, missionStatement, targetBurnAmount, tokensPerMine, minePrice) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { wildfireContract } = this.state;
      
      terminal.pushToStdout(`Creating new Wildfire campaign for ${tokenName}...`);
      
      const tx = await wildfireContract.createWildfire(
        tokenAddress,
        tokenName,
        missionStatement,
        targetBurnAmount,
        tokensPerMine,
        ethers.utils.parseEther(minePrice)
      );
      
      terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Wildfire created successfully![[/success]]`);
      await this.loadWildfires();
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Create Wildfire error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async depositTokens(wildfireId, amount) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { wildfireContract } = this.state;
      
      terminal.pushToStdout(`Depositing ${amount} tokens to Wildfire ${wildfireId}...`);
      
      // First approve the contract to spend tokens
      const wildfire = this.state.wildfires.find(w => w.id === wildfireId);
      const tokenContract = new ethers.Contract(
        wildfire.tokenAddress,
        ['function approve(address spender, uint256 amount)'],
        this.state.signer
      );
      
      const approveTx = await tokenContract.approve(
        wildfireContract.address,
        ethers.utils.parseEther(amount.toString())
      );
      await approveTx.wait();
      
      // Then deposit the tokens
      const tx = await wildfireContract.depositTokens(
        wildfireId,
        ethers.utils.parseEther(amount.toString())
      );
      
      terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Tokens deposited successfully![[/success]]`);
      await this.loadWildfires();
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Deposit tokens error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async mineTokens(wildfireId) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { wildfireContract, wildfires } = this.state;
      const wildfire = wildfires.find(w => w.id === wildfireId);
      
      if (!wildfire) {
        throw new Error("Wildfire not found");
      }
      
      terminal.pushToStdout(`Mining tokens from Wildfire ${wildfireId}...`);
      
      const tx = await wildfireContract.mineTokens(wildfireId, {
        value: ethers.utils.parseEther(wildfire.minePrice)
      });
      
      terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Tokens mined successfully![[/success]]`);
      await this.loadWildfires();
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Mine tokens error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async burnTokens(wildfireId, amount, consoleUrl) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { wildfireContract } = this.state;
      const consoleHash = ethers.utils.id(consoleUrl);
      
      terminal.pushToStdout(`Burning ${amount} tokens for Wildfire ${wildfireId}...`);
      
      // First approve the contract to burn tokens
      const wildfire = this.state.wildfires.find(w => w.id === wildfireId);
      const tokenContract = new ethers.Contract(
        wildfire.tokenAddress,
        ['function approve(address spender, uint256 amount)'],
        this.state.signer
      );
      
      const approveTx = await tokenContract.approve(
        wildfireContract.address,
        ethers.utils.parseEther(amount.toString())
      );
      await approveTx.wait();
      
      // Then burn the tokens
      const tx = await wildfireContract.burnTokens(
        wildfireId,
        ethers.utils.parseEther(amount.toString()),
        consoleUrl,
        consoleHash
      );
      
      terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Tokens burned successfully![[/success]]`);
      await this.loadWildfires();
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Burn tokens error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async addBadge(wildfireId, threshold, imageUrl, description) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { wildfireContract } = this.state;
      
      terminal.pushToStdout(`Adding badge to Wildfire ${wildfireId}...`);
      
      const tx = await wildfireContract.addBadge(
        wildfireId,
        threshold,
        imageUrl,
        description
      );
      
      terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Badge added successfully![[/success]]`);
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Add badge error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async getWildfireStats(wildfireId) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { wildfireContract } = this.state;
      
      const stats = await wildfireContract.getWildfireStats(wildfireId);
      
      terminal.pushToStdout('[[header]]=== Wildfire Stats ===[[/header]]');
      terminal.pushToStdout(`Total Deposited: ${stats.totalDeposited}`);
      terminal.pushToStdout(`Total Mined: ${stats.totalMined}`);
      terminal.pushToStdout(`Total Burned: ${stats.totalBurned}`);
      terminal.pushToStdout(`Remaining to Target: ${stats.remainingToTarget}`);
      terminal.pushToStdout(`Target Reached: ${stats.targetReached ? 'Yes' : 'No'}`);
      terminal.pushToStdout(`Mission: ${stats.missionStatement}`);
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Get stats error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async getUserBadges(wildfireId, userAddress) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { wildfireContract } = this.state;
      
      const badgeIndexes = await wildfireContract.getUserBadges(wildfireId, userAddress);
      const badges = await wildfireContract.getWildfireBadges(wildfireId);
      
      terminal.pushToStdout('[[header]]=== User Badges ===[[/header]]');
      
      if (badgeIndexes.length === 0) {
        terminal.pushToStdout('No badges earned yet');
      } else {
        badgeIndexes.forEach(index => {
          const badge = badges[index];
          terminal.pushToStdout(
            `Badge ${index + 1}:\n` +
            `   Threshold: ${badge.threshold} tokens burned\n` +
            `   Image: ${badge.imageUrl}\n` +
            `   Description: ${badge.description}`
          );
        });
      }
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Get user badges error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async endWildfire(wildfireId) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { wildfireContract } = this.state;
      
      terminal.pushToStdout(`Ending Wildfire ${wildfireId}...`);
      
      const tx = await wildfireContract.endWildfire(wildfireId);
      
      terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Wildfire ended successfully![[/success]]`);
      await this.loadWildfires();
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("End Wildfire error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  render() {
    const welcomeMsg = `
      [[header]]
      =============================================
      Wildfire Burn Terminal
      =============================================
      [[/header]]
      Connected: ${this.state.isConnected ? `Yes (${this.state.account})` : 'No'}
      Type 'help' to see available commands
      ${!this.state.isConnected ? '\n[[warning]]Use "connect" command to connect your wallet[[/warning]]' : ''}
    `;

    return (
      <div style={{ 
        backgroundColor: '#121212',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: "'Courier New', monospace"
      }}>
        <Terminal
          ref={this.terminal}
          commands={{
            connect: {
              description: 'Connect your wallet',
              fn: async () => await this.connectWallet()
            },
            list: {
              description: 'List all wildfire campaigns',
              fn: async () => await this.loadWildfires()
            },
            create: {
              description: 'Create new wildfire (tokenAddress, tokenName, mission, target, perMine, price)',
              fn: async (...args) => await this.createWildfire(...args)
            },
            deposit: {
              description: 'Deposit tokens to wildfire (wildfireId, amount)',
              fn: async (...args) => await this.depositTokens(...args)
            },
            mine: {
              description: 'Mine tokens from wildfire (wildfireId)',
              fn: async (...args) => await this.mineTokens(...args)
            },
            burn: {
              description: 'Burn tokens (wildfireId, amount, consoleUrl)',
              fn: async (...args) => await this.burnTokens(...args)
            },
            addbadge: {
              description: 'Add badge to wildfire (wildfireId, threshold, imageUrl, description)',
              fn: async (...args) => await this.addBadge(...args)
            },
            stats: {
              description: 'Get wildfire stats (wildfireId)',
              fn: async (...args) => await this.getWildfireStats(...args)
            },
            badges: {
              description: 'Get user badges (wildfireId, [userAddress])',
              fn: async (wildfireId, userAddress) => {
                await this.getUserBadges(wildfireId, userAddress || this.state.account);
              }
            },
            end: {
              description: 'End wildfire campaign (wildfireId)',
              fn: async (...args) => await this.endWildfire(...args)
            }
          }}
          welcomeMessage={welcomeMsg}
          ignoreCommandCase={true}
          promptLabel={'user@wildfire:~$'}
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
          style={{
            minHeight: "75vh",
            backgroundColor: "#1a1a2e",
            borderRadius: "5px",
            padding: "10px",
            fontFamily: "monospace",
            border: "1px solid #333",
            boxShadow: "none"
          }}
        />
        
        {this.state.isProgressing && (
          <div style={{
            position: 'fixed',
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

export default WildfireTerminal;
