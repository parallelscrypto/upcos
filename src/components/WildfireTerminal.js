import React, { Component } from 'react';
import { ethers } from 'ethers';
import Terminal from 'react-console-emulator';
import WildfireBurnABI from '../etc/rawmaterial/Wildfire.json';

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
      userBadges: [],
      activeTab: 'campaigns',
      modalContent: null,
      showModal: false
    };
    this.terminal = React.createRef();
    this.modalContainer = null;
  }

  componentDidMount = () => {
    this.checkWalletConnection();
    this.createModalContainer();
  }

  componentWillUnmount = () => {
    if (this.modalContainer && document.body.contains(this.modalContainer)) {
      document.body.removeChild(this.modalContainer);
    }
    this.modalContainer = null;
  }

  createModalContainer = () => {
    if (!this.modalContainer) {
      this.modalContainer = document.createElement('div');
      this.modalContainer.id = 'wildfire-modal-container';
      this.modalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.85);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      `;
      document.body.appendChild(this.modalContainer);
    }
  }

  showModal = (content) => {
    this.modalContainer.innerHTML = `
      <div style="
        background: #121212;
        padding: 25px;
        border-radius: 8px;
        border: 2px solid #00f0ff;
        box-shadow: 0 0 20px rgba(0, 240, 255, 0.7);
        color: #e0e0e0;
        width: 80%;
        max-width: 700px;
        position: relative;
        font-family: 'Courier New', monospace;
      ">
        <button id="close-modal" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: #ff3d3d;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 0 10px rgba(255, 61, 61, 0.5);
        ">X</button>
        ${content}
      </div>
    `;

    this.modalContainer.style.display = 'flex';
    
    document.getElementById('close-modal').addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
    });
  }

  showCyberpunkModal = (title, fields, onSubmit) => {
    const content = `
      <h2 style="color: #00f0ff; text-align: center; margin-bottom: 25px; text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);">${title}</h2>
      <form id="cyberpunk-form" style="display: grid; gap: 20px;">
        ${fields.map(field => `
          <div>
            <label style="display: block; margin-bottom: 8px; color: #00f0ff; font-size: 14px;">${field.label}</label>
            ${field.type === 'select' ? `
              <select name="${field.name}" required style="
                width: 100%;
                padding: 12px;
                background: #1a1a2e;
                border: 1px solid #00f0ff;
                color: #e0e0e0;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
              ">
                ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
              </select>
            ` : `
              <input 
                type="${field.type || 'text'}" 
                name="${field.name}" 
                ${field.required ? 'required' : ''}
                style="
                  width: 100%;
                  padding: 12px;
                  background: #1a1a2e;
                  border: 1px solid #00f0ff;
                  color: #e0e0e0;
                  border-radius: 4px;
                  font-family: 'Courier New', monospace;
                "
                ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
              >
            `}
          </div>
        `).join('')}
        
        <button type="submit" style="
          background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%);
          border: none;
          border-radius: 4px;
          color: white;
          padding: 15px;
          width: 100%;
          cursor: pointer;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 3px 15px 2px rgba(255, 105, 135, 0.5);
          transition: all 0.3s;
          margin-top: 20px;
        ">SUBMIT</button>
      </form>
    `;

    this.showModal(content);

    document.getElementById('cyberpunk-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {};
      fields.forEach(field => {
        data[field.name] = formData.get(field.name);
      });
      onSubmit(data);
      this.modalContainer.style.display = 'none';
    });
  }

  checkWalletConnection = async () => {
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

  connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await this.loadBlockchainData();
    } catch (error) {
      this.terminal.current.pushToStdout(
        `[[error]]Connection error: ${error.message}[[/error]]`
      );
    }
  }

  handleDisconnect = () => {
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

  loadBlockchainData = async () => {
    this.setState({ isProgressing: true });
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      
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

loadWildfires = async () => {
  try {
    const { wildfireContract } = this.state;
    const terminal = this.terminal.current;
    
    const wildfireCount = await wildfireContract._wildfireIds();

      console.log('Wildfires count:', wildfireCount); // Add this line
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
    
    this.setState({ wildfires }, () => {
      console.log('Wildfires loaded:', this.state.wildfires); // Add this line
    });
      
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

  createWildfire = async (tokenAddress, tokenName, missionStatement, targetBurnAmount, tokensPerMine, minePrice) => {
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

  depositTokens = async (wildfireId, amount) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { wildfireContract } = this.state;
      
      terminal.pushToStdout(`Depositing ${amount} tokens to Wildfire ${wildfireId}...`);
      
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

  mineTokens = async (wildfireId) => {
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

  burnTokens = async (wildfireId, amount, consoleUrl) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { wildfireContract } = this.state;
      const consoleHash = ethers.utils.id(consoleUrl);
      
      terminal.pushToStdout(`Burning ${amount} tokens for Wildfire ${wildfireId}...`);
      
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

  addBadge = async (wildfireId, threshold, imageUrl, description) => {
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




getWildfireStats = async (wildfireId) => {
  const terminal = this.terminal.current;
  this.setState({ isProgressing: true });
  
console.log("wildfireid:", wildfireId);
  try {
    const { wildfireContract } = this.state;
    
    const stats = await wildfireContract.getWildfireStats(wildfireId);
    
    terminal.pushToStdout('[[header]]=== Wildfire Stats ===[[/header]]');
    terminal.pushToStdout(`Total Deposited: ${ethers.utils.formatUnits(stats.totalDeposited, 18)}`);
    terminal.pushToStdout(`Total Mined: ${ethers.utils.formatUnits(stats.totalMined, 18)}`);
    terminal.pushToStdout(`Total Burned: ${ethers.utils.formatUnits(stats.totalBurned, 18)}`);
    terminal.pushToStdout(`Remaining to Target: ${ethers.utils.formatUnits(stats.remainingToTarget, 18)}`);
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







  getUserBadges = async (wildfireId, userAddress) => {
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

  endWildfire = async (wildfireId) => {
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

  showCreateWildfireGUI = () => {
    this.showCyberpunkModal(
      "CREATE WILDFIRE CAMPAIGN",
      [
        { label: "Token Address", name: "tokenAddress", required: true, placeholder: "0x..." },
        { label: "Token Name", name: "tokenName", required: true },
        { label: "Mission Statement", name: "missionStatement", required: true },
        { label: "Target Burn Amount", name: "targetBurnAmount", type: "number", required: true },
        { label: "Tokens Per Mine", name: "tokensPerMine", type: "number", required: true },
        { label: "Mine Price (ETH)", name: "minePrice", type: "number", step: "0.0001", required: true }
      ],
      async (data) => {
        await this.createWildfire(
          data.tokenAddress,
          data.tokenName,
          data.missionStatement,
          data.targetBurnAmount,
          data.tokensPerMine,
          data.minePrice
        );
      }
    );
  }

  showDepositTokensGUI = () => {
    const { wildfires } = this.state;
    
    this.showCyberpunkModal(
      "DEPOSIT TOKENS",
      [
        {
          label: "Wildfire Campaign",
          name: "wildfireId",
          type: "select",
          required: true,
          options: wildfires.map(wildfire => ({
            value: wildfire.id,
            label: `${wildfire.tokenName} (ID: ${wildfire.id})`
          }))
        },
        {
          label: "Amount to Deposit",
          name: "amount",
          type: "number",
          required: true,
          placeholder: "Enter amount to deposit"
        }
      ],
      ({ wildfireId, amount }) => {
        this.depositTokens(parseInt(wildfireId), amount);
      }
    );
  }

  showMineTokensGUI = () => {
    const { wildfires } = this.state;
    
    this.showCyberpunkModal(
      "MINE TOKENS",
      [
        {
          label: "Wildfire Campaign",
          name: "wildfireId",
          type: "select",
          required: true,
          options: wildfires.filter(w => w.isActive).map(wildfire => ({
            value: wildfire.id,
            label: `${wildfire.tokenName} (ID: ${wildfire.id}) - Price: ${wildfire.minePrice} ETH`
          }))
        }
      ],
      ({ wildfireId }) => {
        this.mineTokens(parseInt(wildfireId));
      }
    );
  }

  showBurnTokensGUI = () => {
    const { wildfires } = this.state;
    
    this.showCyberpunkModal(
      "BURN TOKENS",
      [
        {
          label: "Wildfire Campaign",
          name: "wildfireId",
          type: "select",
          required: true,
          options: wildfires.filter(w => w.isActive).map(wildfire => ({
            value: wildfire.id,
            label: `${wildfire.tokenName} (ID: ${wildfire.id})`
          }))
        },
        {
          label: "Amount to Burn",
          name: "amount",
          type: "number",
          required: true,
          placeholder: "Enter amount to burn"
        },
        {
          label: "Console URL",
          name: "consoleUrl",
          type: "text",
          required: true,
          placeholder: "https://console.firebase.google.com/..."
        }
      ],
      ({ wildfireId, amount, consoleUrl }) => {
        this.burnTokens(parseInt(wildfireId), amount, consoleUrl);
      }
    );
  }

  showAddBadgeGUI = () => {
    const { wildfires } = this.state;
    
    this.showCyberpunkModal(
      "ADD BADGE",
      [
        {
          label: "Wildfire Campaign",
          name: "wildfireId",
          type: "select",
          required: true,
          options: wildfires.map(wildfire => ({
            value: wildfire.id,
            label: `${wildfire.tokenName} (ID: ${wildfire.id})`
          }))
        },
        {
          label: "Threshold Amount",
          name: "threshold",
          type: "number",
          required: true,
          placeholder: "Tokens needed to earn badge"
        },
        {
          label: "Image URL",
          name: "imageUrl",
          type: "text",
          required: true,
          placeholder: "https://example.com/badge.png"
        },
        {
          label: "Description",
          name: "description",
          type: "text",
          required: true,
          placeholder: "Badge description"
        }
      ],
      ({ wildfireId, threshold, imageUrl, description }) => {
        this.addBadge(parseInt(wildfireId), threshold, imageUrl, description);
      }
    );
  }

  showWildfireStatsGUI = (id) => {
    const { wildfires } = this.state;
    
    this.showCyberpunkModal(
      "VIEW WILDFIRE STATS",
      [
        {
          label: "Wildfire Campaign",
          name: "wildfireId",
          type: "select",
          required: true,
          options: wildfires.map(wildfire => ({
            value: id,
            label: `${wildfire.tokenName} (ID: ${wildfire.id})`
          }))
        }
      ],
      async ({ wildfireId }) => {
        try {
          this.setState({ isProgressing: true });
          const { wildfireContract } = this.state;
          
          const stats = await wildfireContract.getWildfireStats(wildfireId);
          const wildfire = this.state.wildfires.find(w => w.id === parseInt(wildfireId));
          
const content = `
  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="color: #00f0ff; margin-bottom: 5px; text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);">${wildfire.tokenName}</h2>
    <div style="color: #e0e0e0; margin-bottom: 15px;">${wildfire.missionStatement}</div>
  </div>
  
  <div style="
    background: #1a1a2e;
    padding: 20px;
    border-radius: 8px;
    border-left: 3px solid #00f0ff;
    margin-bottom: 20px;
  ">
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span style="color: #00f0ff;">Total Deposited:</span>
      <span style="color: #e0e0e0;">${ethers.utils.formatUnits(stats.totalDeposited, 18)}</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span style="color: #00f0ff;">Total Mined:</span>
      <span style="color: #e0e0e0;">${ethers.utils.formatUnits(stats.totalMined, 18)}</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span style="color: #00f0ff;">Total Burned:</span>
      <span style="color: #e0e0e0;">${ethers.utils.formatUnits(stats.totalBurned, 18)}</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span style="color: #00f0ff;">Remaining to Target:</span>
      <span style="color: #e0e0e0;">${ethers.utils.formatUnits(stats.remainingToTarget, 18)}</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span style="color: #00f0ff;">Target Reached:</span>
      <span style="color: ${stats.targetReached ? '#4CAF50' : '#F44336'};">
        ${stats.targetReached ? 'Yes' : 'No'}
      </span>
    </div>
    
    <div style="display: flex; justify-content: space-between;">
      <span style="color: #00f0ff;">Status:</span>
      <span style="color: ${wildfire.isActive ? '#4CAF50' : '#F44336'};">
        ${wildfire.isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  </div>
  
  <div style="text-align: center; color: #e0e0e0; font-size: 14px;">
    Created: ${wildfire.startDate}
  </div>
`;

          this.showModal(content);
        } catch (error) {
          this.terminal.current.pushToStdout(
            `[[error]]Error: ${error.reason || error.message}[[/error]]`
          );
          console.error("Error getting wildfire stats:", error);
        } finally {
          this.setState({ isProgressing: false });
        }
      }
    );
  }

  showUserBadgesGUI = () => {
    const { wildfires } = this.state;
    
    this.showCyberpunkModal(
      "VIEW USER BADGES",
      [
        {
          label: "Wildfire Campaign",
          name: "wildfireId",
          type: "select",
          required: true,
          options: wildfires.map(wildfire => ({
            value: wildfire.id,
            label: `${wildfire.tokenName} (ID: ${wildfire.id})`
          }))
        },
        {
          label: "User Address (optional)",
          name: "userAddress",
          type: "text",
          required: false,
          placeholder: "0x... (default: your address)"
        }
      ],
      ({ wildfireId, userAddress }) => {
        this.getUserBadges(
          parseInt(wildfireId),
          userAddress || this.state.account
        );
      }
    );
  }

  showEndWildfireGUI = () => {
    const { wildfires } = this.state;
    
    this.showCyberpunkModal(
      "END WILDFIRE CAMPAIGN",
      [
        {
          label: "Wildfire Campaign",
          name: "wildfireId",
          type: "select",
          required: true,
          options: wildfires.filter(w => w.isActive).map(wildfire => ({
            value: wildfire.id,
            label: `${wildfire.tokenName} (ID: ${wildfire.id})`
          }))
        }
      ],
      ({ wildfireId }) => {
        this.endWildfire(parseInt(wildfireId));
      }
    );
  }

  renderCyberpunkGUI = () => {
    return (
      <div style={{
        backgroundColor: '#1a1a2e',
        border: '2px solid #00f0ff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          marginBottom: '20px',
          borderBottom: '1px solid #00f0ff',
          paddingBottom: '10px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}>
          {['campaigns', 'participate', 'badges', 'admin'].map(tab => (
            <button
              key={tab}
              onClick={() => this.setState({ activeTab: tab })}
              style={{
                background: this.state.activeTab === tab ? '#00f0ff' : 'transparent',
                color: this.state.activeTab === tab ? '#121212' : '#00f0ff',
                border: 'none',
                padding: '10px 20px',
                marginRight: '10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s',
                flexShrink: 0
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {this.state.activeTab === 'campaigns' && (
          <div>
            <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>WILDFIRE CAMPAIGNS</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.showCreateWildfireGUI()}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 15px 2px rgba(76, 175, 80, 0.5)'
                }}
              >
                CREATE CAMPAIGN
              </button>
              <button
                onClick={() => this.loadWildfires()}
                style={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #03A9F4 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 15px 2px rgba(33, 150, 243, 0.5)'
                }}
              >
                REFRESH LIST
              </button>
              <button
                onClick={() => this.showWildfireStatsGUI()}
                style={{
                  background: 'linear-gradient(45deg, #00BCD4 30%, #009688 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 15px 2px rgba(0, 188, 212, 0.5)'
                }}
              >
                VIEW STATS
              </button>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {this.state.wildfires.length > 0 ? (
                this.state.wildfires.map(wildfire => (
                  <div key={wildfire.id} style={{
                    background: '#121212',
                    padding: '15px',
                    marginBottom: '15px',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${wildfire.isActive ? '#4CAF50' : '#F44336'}`,
                    boxShadow: `0 0 10px rgba(${wildfire.isActive ? '76, 175, 80' : '244, 67, 54'}, 0.2)`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>{wildfire.tokenName}</span>
                      <span style={{ 
                        color: wildfire.isActive ? '#4CAF50' : '#F44336',
                        fontWeight: 'bold'
                      }}>
                        {wildfire.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div style={{ color: '#e0e0e0', marginBottom: '10px' }}>{wildfire.missionStatement}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#FFC107' }}>Target:</span>
                      <span style={{ color: '#e0e0e0' }}>{wildfire.targetBurnAmount} tokens</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#FFC107' }}>Burned:</span>
                      <span style={{ color: '#e0e0e0' }}>{wildfire.totalBurned} tokens</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#FFC107' }}>Mine Price:</span>
                      <span style={{ color: '#e0e0e0' }}>{wildfire.minePrice} ETH</span>
                    </div>
                    <div style={{ color: '#9E9E9E', fontSize: '12px', marginTop: '10px' }}>
                      Created: {wildfire.startDate}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#9E9E9E',
                  padding: '20px',
                  border: '1px dashed #424242',
                  borderRadius: '4px'
                }}>
                  No wildfire campaigns found
                </div>
              )}
            </div>
          </div>
        )}

        {this.state.activeTab === 'participate' && (
          <div>
            <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>PARTICIPATE</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.showDepositTokensGUI()}
                style={{
                  background: 'linear-gradient(45deg, #9C27B0 30%, #673AB7 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 15px 2px rgba(156, 39, 176, 0.5)'
                }}
              >
                DEPOSIT TOKENS
              </button>
              <button
                onClick={() => this.showMineTokensGUI()}
                style={{
                  background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 15px 2px rgba(255, 152, 0, 0.5)'
                }}
              >
                MINE TOKENS
              </button>
              <button
                onClick={() => this.showBurnTokensGUI()}
                style={{
                  background: 'linear-gradient(45deg, #F44336 30%, #D32F2F 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 15px 2px rgba(244, 67, 54, 0.5)'
                }}
              >
                BURN TOKENS
              </button>
            </div>
          </div>
        )}

        {this.state.activeTab === 'badges' && (
          <div>
            <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>BADGES</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.showAddBadgeGUI()}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 15px 2px rgba(76, 175, 80, 0.5)'
                }}
              >
                ADD BADGE
              </button>
              <button
                onClick={() => this.showUserBadgesGUI()}
                style={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #03A9F4 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 15px 2px rgba(33, 150, 243, 0.5)'
                }}
              >
                VIEW BADGES
              </button>
            </div>
          </div>
        )}

        {this.state.activeTab === 'admin' && (
          <div>
            <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>ADMIN</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.showEndWildfireGUI()}
                style={{
                  background: 'linear-gradient(45deg, #F44336 30%, #D32F2F 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 15px 2px rgba(244, 67, 54, 0.5)'
                }}
              >
                END CAMPAIGN
              </button>
            </div>
          </div>
        )}
      </div>
    );
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
        position: 'relative',
        backgroundColor: '#121212',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: "'Courier New', monospace"
      }}>
        {this.state.isConnected && this.renderCyberpunkGUI()}
        
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
    // Add this to your commands object in the render() method
    listwildfires: {
      description: 'List all wildfires from state',
      fn: () => {
        const terminal = this.terminal.current;
        const { wildfires } = this.state;
    
        if (!wildfires || wildfires.length === 0) {
          terminal.pushToStdout('[[warning]]No wildfires found in state[[/warning]]');
          return;
        }
    
        terminal.pushToStdout('[[header]]=== Wildfires in State ===[[/header]]');
        wildfires.forEach(wildfire => {
          terminal.pushToStdout(
            `ID: ${wildfire.id}\n` +
            `Token: ${wildfire.tokenName} (${wildfire.tokenAddress})\n` +
            `Mission: ${wildfire.missionStatement}\n` +
            `Target: ${wildfire.targetBurnAmount} tokens\n` +
            `Burned: ${wildfire.totalBurned} tokens\n` +
            `Status: ${wildfire.isActive ? 'Active' : 'Inactive'}\n` +
            `Created: ${wildfire.startDate}\n` +
            `Mine Price: ${wildfire.minePrice} ETH\n` +
            `Tokens per Mine: ${wildfire.tokensPerMine}\n` +
            `Total Deposited: ${wildfire.totalDeposited}\n` +
            `Total Mined: ${wildfire.totalMined}\n` +
            `----------------------------------------`
          );
        });
        return '[[success]]Wildfires displayed from component state[[/success]]';
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

export default WildfireTerminal;
