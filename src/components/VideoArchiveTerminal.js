import React, { Component } from 'react';
import { ethers } from "ethers";
import Terminal from 'react-console-emulator';
import VideoArchiveABI from '../etc/rawmaterial/Archive.json';

const CONTRACT_ADDRESS = "0x78bF0F3689078077b8629425EcAd945a018dD436";
const ITEMS_PER_PAGE = 5;

class VideoArchiveTerminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      contract: null,
      provider: null,
      signer: null,
      isProgressing: false,
      isConnected: false,
      connectionError: null,
      archiveEntries: [],
      tokenBalances: [],
      badgeLevels: [],
      userStats: {},
      flipToken: null,
      modalContent: null,
      showModal: false,
      activeTab: 'archive',
      currentPage: 1,
      expandedEntries: {} 
    };
    this.terminal = React.createRef();
    this.modalContainer = null;
  }

  componentDidMount() {
    this.checkWalletConnection();
    this.createModalContainer();
  }
  
  componentWillUnmount() {
    if (this.modalContainer && document.body.contains(this.modalContainer)) {
      document.body.removeChild(this.modalContainer);
    }
    this.modalContainer = null;
  }
  
  createModalContainer() {
    if (!this.modalContainer) {
      this.modalContainer = document.createElement('div');
      this.modalContainer.id = 'videoarchive-modal-container';
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

  showModal(content) {
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

  showCyberpunkModal(title, fields, onSubmit) {
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
      this.setState({ connectionError: error.message });
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
      contract: null,
      provider: null,
      signer: null,
      isConnected: false,
      archiveEntries: [],
      tokenBalances: []
    });
    this.terminal.current.pushToStdout('[[warning]]Wallet disconnected[[/warning]]');
  }

  async loadBlockchainData() {
    this.setState({ isProgressing: true, connectionError: null });
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        VideoArchiveABI.abi,
        signer
      );

      this.setState({ 
        contract,
        provider,
        signer,
        account,
        isConnected: true
      });

      this.terminal.current.pushToStdout(
        `[[success]]Connected to account: ${account}[[/success]]`
      );

      await this.loadArchiveEntries();
      await this.loadTokenBalances();
      await this.loadBadgeLevels();
      await this.loadFlipToken();
      
    } catch (error) {
      this.setState({ connectionError: error.message });
      this.terminal.current.pushToStdout(
        `[[error]]Connection error: ${error.message}[[/error]]`
      );
      console.error("Blockchain connection error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async loadArchiveEntries() {
    try {
      const terminal = this.terminal.current;
      const { contract } = this.state;
      
      const count = await contract.getArchiveCount();
      const entries = [];
      
      for (let i = 1; i <= count; i++) {
        const entry = await contract.getArchiveEntry(i);
        if (entry.url) { // Skip removed entries
          entries.push({
            id: entry.id.toString(),
            url: entry.url,
            dateArchived: new Date(entry.dateArchived * 1000).toLocaleString(),
            owner: entry.owner,
            initialTokenCount: entry.initialTokenCount.toString(),
            tokensMined: entry.tokensMined.toString(),
            tokensRemaining: entry.tokensRemaining.toString(),
            tokenAddress: entry.tokenAddress,
            miningKey: entry.miningKey,
            priceIfNoKey: entry.priceIfNoKey.toString()
          });
        }
      }
      
      this.setState({ archiveEntries: entries });
      
      terminal.pushToStdout('[[header]]=== Archive Entries ===[[/header]]');
      entries.forEach(entry => {
        terminal.pushToStdout(
          `${entry.id}. ${entry.url}\n` +
          `   Owner: ${entry.owner}\n` +
          `   Tokens: ${entry.tokensMined}/${entry.initialTokenCount} (${entry.tokensRemaining} remaining)\n` +
          `   Token: ${entry.tokenAddress}\n` +
          `   Archived: ${entry.dateArchived}`
        );
      });
    } catch (error) {
      console.error("Error loading archive entries:", error);
    }
  }

  async loadTokenBalances() {
    try {
      const terminal = this.terminal.current;
      const { contract } = this.state;
      
      const balances = await contract.getAllTokenBalances();
      
      this.setState({ tokenBalances: balances });
      
      terminal.pushToStdout('[[header]]=== Token Balances ===[[/header]]');
      balances.forEach(token => {
        terminal.pushToStdout(
          `${token.name}: ${ethers.utils.formatEther(token.balance)}\n` +
          `   Address: ${token.tokenAddress}`
        );
      });
    } catch (error) {
      console.error("Error loading token balances:", error);
    }
  }

  async loadBadgeLevels() {
    try {
      const terminal = this.terminal.current;
      const { contract } = this.state;
      
      // Assuming we have a function to get badge levels
      // const badgeLevels = await contract.getBadgeLevels();
      // This is a placeholder - implement based on your contract
      const badgeLevels = [];
      
      this.setState({ badgeLevels });
      
      if (badgeLevels.length > 0) {
        terminal.pushToStdout('[[header]]=== Badge Levels ===[[/header]]');
        badgeLevels.forEach((level, index) => {
          terminal.pushToStdout(
            `${index + 1}. ${level.name} - ${level.threshold} tokens`
          );
        });
      }
    } catch (error) {
      console.error("Error loading badge levels:", error);
    }
  }

  async loadFlipToken() {
    try {
      const { contract } = this.state;
      const flipTokenAddress = await contract.flipTokenAddress();
      const flipTokenName = await contract.flipTokenName();
      
      this.setState({ 
        flipToken: {
          address: flipTokenAddress,
          name: flipTokenName
        }
      });
    } catch (error) {
      console.error("Error loading FLIP token:", error);
    }
  }

  async addEntry(url, tokenAddress, initialTokenCount, miningKey, priceIfNoKey) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Adding archive entry: ${url}...`);
      const tx = await contract.addEntry(
        url,
        tokenAddress,
        initialTokenCount,
        miningKey,
        priceIfNoKey
      );
      await tx.wait();
      terminal.pushToStdout(`[[success]]Entry added successfully![[/success]]`);
      
      await this.loadArchiveEntries();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Add entry error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async removeEntry(id) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Removing archive entry ${id}...`);
      const tx = await contract.removeEntry(id);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Entry removed successfully![[/success]]`);
      
      await this.loadArchiveEntries();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Remove entry error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async editEntry(id, newUrl) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Editing archive entry ${id}...`);
      const tx = await contract.editEntry(id, newUrl);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Entry edited successfully![[/success]]`);
      
      await this.loadArchiveEntries();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Edit entry error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async mineTokens(entryId, miningKey) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    var ethVal = "0";
    if(!miningKey) {
       ethVal = "1";
    }
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Mining tokens for entry ${entryId}...`);
      const tx = await contract.mineTokens(entryId, miningKey, { value: ethers.utils.parseEther(ethVal) });
      await tx.wait();
      terminal.pushToStdout(`[[success]]Tokens mined successfully![[/success]]`);
      
      await this.loadArchiveEntries();
      await this.loadTokenBalances();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Mine tokens error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async addToken(tokenAddress, tokenName) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Adding token ${tokenName} (${tokenAddress})...`);
      const tx = await contract.addToken(tokenAddress, tokenName);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Token added successfully![[/success]]`);
      
      await this.loadTokenBalances();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Add token error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async removeToken(tokenAddress) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Removing token ${tokenAddress}...`);
      const tx = await contract.removeToken(tokenAddress);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Token removed successfully![[/success]]`);
      
      await this.loadTokenBalances();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Remove token error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async depositTokens(tokenAddress, amount) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      // First approve the contract to spend tokens
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function approve(address spender, uint256 amount)'],
        this.state.signer
      );
      
      terminal.pushToStdout(`Approving tokens...`);
      const approveTx = await tokenContract.approve(
        CONTRACT_ADDRESS,
        ethers.utils.parseEther(amount.toString())
      );
      await approveTx.wait();
      
      terminal.pushToStdout(`Depositing ${amount} tokens...`);
      const tx = await contract.depositTokens(tokenAddress, ethers.utils.parseEther(amount.toString()));
      await tx.wait();
      terminal.pushToStdout(`[[success]]Tokens deposited successfully![[/success]]`);
      
      await this.loadTokenBalances();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Deposit tokens error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async rewardUser(tokenAddress, recipient, amount) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Rewarding ${amount} tokens to ${recipient}...`);
      const tx = await contract.rewardUser(tokenAddress, recipient, ethers.utils.parseEther(amount.toString()));
      await tx.wait();
      terminal.pushToStdout(`[[success]]User rewarded successfully![[/success]]`);
      
      await this.loadTokenBalances();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Reward user error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async addBadgeLevel(threshold, name) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Adding badge level: ${name} (${threshold} tokens)...`);
      const tx = await contract.addBadgeLevel(threshold, name);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Badge level added successfully![[/success]]`);
      
      await this.loadBadgeLevels();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Add badge level error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async setFlipToken(tokenAddress, name) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Setting FLIP token to ${name} (${tokenAddress})...`);
      const tx = await contract.setFlipToken(tokenAddress, name);
      await tx.wait();
      terminal.pushToStdout(`[[success]]FLIP token set successfully![[/success]]`);
      
      await this.loadFlipToken();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Set FLIP token error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async setExchangeRate(rewardToken, rate) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Setting exchange rate for ${rewardToken} to ${rate}...`);
      const tx = await contract.setExchangeRate(rewardToken, rate);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Exchange rate set successfully![[/success]]`);
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Set exchange rate error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async exchangeTokens(rewardToken, amount) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Exchanging ${amount} ${rewardToken} for FLIP tokens...`);
      const tx = await contract.exchangeTokens(rewardToken, ethers.utils.parseEther(amount.toString()));
      await tx.wait();
      terminal.pushToStdout(`[[success]]Tokens exchanged successfully![[/success]]`);
      
      await this.loadTokenBalances();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Exchange tokens error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async transferOwnership(newOwner) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Transferring ownership to ${newOwner}...`);
      const tx = await contract.transferContractOwnership(newOwner);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Ownership transferred successfully![[/success]]`);
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Transfer ownership error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async getUserStats(userAddress) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { contract } = this.state;
      
      terminal.pushToStdout(`Getting stats for user ${userAddress}...`);
      const stats = await contract.userStats(userAddress);
      
      terminal.pushToStdout('[[header]]=== User Stats ===[[/header]]');
      terminal.pushToStdout(
        `Total tokens mined: ${stats.totalTokensMined.toString()}\n` +
        `Current badge level: ${stats.currentBadgeLevel.toString()}`
      );
      
      this.setState(prevState => ({
        userStats: {
          ...prevState.userStats,
          [userAddress]: stats
        }
      }));
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Get user stats error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  // GUI Functions
  showAddEntryGUI() {
    const { tokenBalances } = this.state;
    
    this.showCyberpunkModal(
      "ADD ARCHIVE ENTRY",
      [
        { label: "Video URL", name: "url", required: true },
        {
          label: "Token Address",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: tokenBalances.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        { label: "Initial Token Count", name: "initialTokenCount", type: "number", required: true },
        { label: "Mining Key (optional)", name: "miningKey" },
        { label: "Price If No Key (MATIC)", name: "priceIfNoKey", type: "number", value: "0" }
      ],
      ({ url, tokenAddress, initialTokenCount, miningKey, priceIfNoKey }) => {
        this.addEntry(url, tokenAddress, initialTokenCount, miningKey, priceIfNoKey);
      }
    );
  }

  showRemoveEntryGUI() {
    const { archiveEntries } = this.state;
    
    this.showCyberpunkModal(
      "REMOVE ARCHIVE ENTRY",
      [
        {
          label: "Entry to Remove",
          name: "id",
          type: "select",
          required: true,
          options: archiveEntries.map(entry => ({
            value: entry.id,
            label: `${entry.id}. ${entry.url}`
          }))
        }
      ],
      ({ id }) => {
        this.removeEntry(id);
      }
    );
  }

  showEditEntryGUI() {
    const { archiveEntries } = this.state;
    
    this.showCyberpunkModal(
      "EDIT ARCHIVE ENTRY",
      [
        {
          label: "Entry to Edit",
          name: "id",
          type: "select",
          required: true,
          options: archiveEntries.map(entry => ({
            value: entry.id,
            label: `${entry.id}. ${entry.url}`
          }))
        },
        { label: "New URL", name: "newUrl", required: true }
      ],
      ({ id, newUrl }) => {
        this.editEntry(id, newUrl);
      }
    );
  }

  showMineTokensGUI() {
    const { archiveEntries } = this.state;
    
    this.showCyberpunkModal(
      "MINE TOKENS",
      [
        {
          label: "Archive Entry",
          name: "entryId",
          type: "select",
          required: true,
          options: archiveEntries.filter(entry => entry.tokensRemaining > 0).map(entry => ({
            value: entry.id,
            label: `${entry.id}. ${entry.url} (${entry.tokensRemaining} remaining)`
          }))
        },
        { label: "Mining Key (optional)", name: "miningKey" }
      ],
      ({ entryId, miningKey }) => {
        this.mineTokens(entryId, miningKey);
      }
    );
  }

  showAddTokenGUI() {
    this.showCyberpunkModal(
      "ADD TOKEN",
      [
        { label: "Token Address", name: "tokenAddress", required: true },
        { label: "Token Name", name: "tokenName", required: true }
      ],
      ({ tokenAddress, tokenName }) => {
        this.addToken(tokenAddress, tokenName);
      }
    );
  }

  showRemoveTokenGUI() {
    const { tokenBalances } = this.state;
    
    this.showCyberpunkModal(
      "REMOVE TOKEN",
      [
        {
          label: "Token to Remove",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: tokenBalances.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        }
      ],
      ({ tokenAddress }) => {
        this.removeToken(tokenAddress);
      }
    );
  }

  showDepositTokensGUI() {
    const { tokenBalances } = this.state;
    
    this.showCyberpunkModal(
      "DEPOSIT TOKENS",
      [
        {
          label: "Token",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: tokenBalances.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        { label: "Amount to Deposit", name: "amount", type: "number", required: true }
      ],
      ({ tokenAddress, amount }) => {
        this.depositTokens(tokenAddress, amount);
      }
    );
  }

  showRewardUserGUI() {
    const { tokenBalances } = this.state;
    
    this.showCyberpunkModal(
      "REWARD USER",
      [
        {
          label: "Token",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: tokenBalances.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        { label: "Recipient Address", name: "recipient", required: true },
        { label: "Amount to Reward", name: "amount", type: "number", required: true }
      ],
      ({ tokenAddress, recipient, amount }) => {
        this.rewardUser(tokenAddress, recipient, amount);
      }
    );
  }

  showAddBadgeLevelGUI() {
    this.showCyberpunkModal(
      "ADD BADGE LEVEL",
      [
        { label: "Threshold (tokens)", name: "threshold", type: "number", required: true },
        { label: "Badge Name", name: "name", required: true }
      ],
      ({ threshold, name }) => {
        this.addBadgeLevel(threshold, name);
      }
    );
  }

  showSetFlipTokenGUI() {
    const { tokenBalances } = this.state;
    
    this.showCyberpunkModal(
      "SET FLIP TOKEN",
      [
        {
          label: "Token",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: tokenBalances.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        { label: "Token Name", name: "name", required: true }
      ],
      ({ tokenAddress, name }) => {
        this.setFlipToken(tokenAddress, name);
      }
    );
  }

  showSetExchangeRateGUI() {
    const { tokenBalances, flipToken } = this.state;
    
    this.showCyberpunkModal(
      "SET EXCHANGE RATE",
      [
        {
          label: "Reward Token",
          name: "rewardToken",
          type: "select",
          required: true,
          options: tokenBalances.filter(token => 
            flipToken ? token.tokenAddress !== flipToken.address : true
          ).map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        { label: "Exchange Rate", name: "rate", type: "number", required: true }
      ],
      ({ rewardToken, rate }) => {
        this.setExchangeRate(rewardToken, rate);
      }
    );
  }

  showExchangeTokensGUI() {
    const { tokenBalances, flipToken } = this.state;
    
    this.showCyberpunkModal(
      "EXCHANGE TOKENS",
      [
        {
          label: "From Token",
          name: "rewardToken",
          type: "select",
          required: true,
          options: tokenBalances.filter(token => 
            flipToken ? token.tokenAddress !== flipToken.address : true
          ).map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        { label: "Amount to Exchange", name: "amount", type: "number", required: true }
      ],
      ({ rewardToken, amount }) => {
        this.exchangeTokens(rewardToken, amount);
      }
    );
  }

  showTransferOwnershipGUI() {
    this.showCyberpunkModal(
      "TRANSFER OWNERSHIP",
      [
        { label: "New Owner Address", name: "newOwner", required: true }
      ],
      ({ newOwner }) => {
        this.transferOwnership(newOwner);
      }
    );
  }

  showUserStatsGUI() {
    this.showCyberpunkModal(
      "GET USER STATS",
      [
        { label: "User Address", name: "userAddress", required: true }
      ],
      ({ userAddress }) => {
        this.getUserStats(userAddress);
      }
    );
  }








renderCyberpunkGUI() {
    const { archiveEntries, currentPage, tokenBalances, activeTab } = this.state;
    const totalPages = Math.ceil(archiveEntries.length / ITEMS_PER_PAGE);
    const paginatedEntries = archiveEntries.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Style objects
    const containerStyle = {
        backgroundColor: '#1a1a2e',
        border: '2px solid #00f0ff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
    };

    const tabContainerStyle = {
        display: 'flex',
        marginBottom: '20px',
        borderBottom: '1px solid #00f0ff',
        paddingBottom: '10px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
    };

    const tabButtonStyle = (isActive) => ({
        background: isActive ? '#00f0ff' : 'transparent',
        color: isActive ? '#121212' : '#00f0ff',
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
    });

    const entryStyle = {
        background: '#121212',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '4px',
        borderLeft: '3px solid #00f0ff',
        position: 'relative'
    };

    const createGradientButton = (color1, color2) => ({
        background: `linear-gradient(45deg, ${color1} 30%, ${color2} 90%)`,
        border: 'none',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: `0 3px 5px rgba(0,0,0,0.2)`,
        marginRight: '10px',
        marginBottom: '10px'
    });

    const mineButtonStyle = {
        background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
        border: 'none',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '10px',
        fontSize: '12px'
    };

    const paginationButtonStyle = (disabled) => ({
        background: disabled ? '#555' : 'linear-gradient(45deg, #2196F3 30%, #03A9F4 90%)',
        border: 'none',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 'bold'
    });

    return (
        <div style={containerStyle}>
            {/* Tab Navigation */}
            <div style={tabContainerStyle}>
                {['archive', 'tokens', 'badges', 'admin'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => this.setState({ activeTab: tab, currentPage: 1 })}
                        style={tabButtonStyle(activeTab === tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Archive Tab Content */}
            {activeTab === 'archive' && (
                <div>
                    <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>ARCHIVE MANAGEMENT</h3>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <button 
                            onClick={() => this.showAddEntryGUI()} 
                            style={createGradientButton('#FE6B8B', '#FF8E53')}
                        >
                            ADD ENTRY
                        </button>
                        <button 
                            onClick={() => this.showRemoveEntryGUI()} 
                            style={createGradientButton('#F44336', '#FF5722')}
                        >
                            REMOVE ENTRY
                        </button>
                        <button 
                            onClick={() => this.showEditEntryGUI()} 
                            style={createGradientButton('#2196F3', '#03A9F4')}
                        >
                            EDIT ENTRY
                        </button>
                    </div>

{/* Entries List */}
<div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
    {paginatedEntries.map(entry => {
        const tokenInfo = tokenBalances.find(t => t.tokenAddress === entry.tokenAddress);
        const tokenName = tokenInfo ? tokenInfo.name : 'Unknown Token';
        
        return (
            <div key={entry.id} style={entryStyle}>
                <div style={{ color: '#00f0ff', fontWeight: 'bold' }}>
                    {entry.id}. {entry.url}
                    <button 
                        onClick={() => this.setState(prev => ({
                            expandedEntries: {
                                ...prev.expandedEntries,
                                [entry.id]: !prev.expandedEntries[entry.id]
                            }
                        }))}
                        style={{
                            background: 'transparent',
                            border: '1px solid #00f0ff',
                            color: '#00f0ff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            marginLeft: '10px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        {this.state.expandedEntries[entry.id] ? 'Hide' : 'Show'} Preview
                    </button>
                </div>
                
                {this.state.expandedEntries[entry.id] && (
                    <div style={{ 
                        marginTop: '10px',
                        border: '1px solid #00f0ff',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <iframe
                            src={entry.url}
                            title={`Preview of ${entry.url}`}
                            style={{
                                width: '100%',
                                height: '400px',
                                border: 'none',
                                background: '#121212'
                            }}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                    </div>
                )}
                <div style={{ color: 'red', fontSize: '14px' }}>
                    link: <a href={entry.url}>VISIT</a>
                </div>                
                <div style={{ color: '#e0e0e0', fontSize: '12px' }}>
                    Owner: {entry.owner}
                </div>
                <div style={{ color: '#FFC107' }}>
                    Tokens: {entry.tokensMined}/{entry.initialTokenCount} ({entry.tokensRemaining} remaining)
                </div>
                <div style={{ color: '#9C27B0' }}>
                    Token: {entry.tokenAddress}
                </div>
                <div style={{ color: '#607D8B' }}>
                    Archived: {entry.dateArchived}
                </div>
                {entry.tokensRemaining > 0 && (
                    <button
                        onClick={() => this.showMineTokensGUI(entry.id, entry.miningKey)}
                        style={mineButtonStyle}
                    >
                        MINE {tokenName.toUpperCase()}
                    </button>
                )}
            </div>
        );
    })}
</div>

                    {/* Pagination - FIXED SYNTAX */}
                    {archiveEntries.length > ITEMS_PER_PAGE && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button
                                onClick={() => this.setState(prev => ({ currentPage: Math.max(prev.currentPage - 1, 1) }))}
                                disabled={currentPage === 1}
                                style={paginationButtonStyle(currentPage === 1)}
                            >
                                Previous
                            </button>
                            <span style={{ color: '#e0e0e0', lineHeight: '35px' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => this.setState(prev => ({ currentPage: Math.min(prev.currentPage + 1, totalPages) }))}
                                disabled={currentPage === totalPages}
                                style={paginationButtonStyle(currentPage === totalPages)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Tokens Tab Content */}
            {activeTab === 'tokens' && (
                <div>
                    <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>TOKEN MANAGEMENT</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <button 
                            onClick={() => this.showAddTokenGUI()} 
                            style={createGradientButton('#4CAF50', '#8BC34A')}
                        >
                            ADD TOKEN
                        </button>
                        <button 
                            onClick={() => this.showRemoveTokenGUI()} 
                            style={createGradientButton('#F44336', '#FF5722')}
                        >
                            REMOVE TOKEN
                        </button>
                        <button 
                            onClick={() => this.showDepositTokensGUI()} 
                            style={createGradientButton('#2196F3', '#03A9F4')}
                        >
                            DEPOSIT
                        </button>
                        <button 
                            onClick={() => this.showRewardUserGUI()} 
                            style={createGradientButton('#9C27B0', '#673AB7')}
                        >
                            REWARD USER
                        </button>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {this.state.tokenBalances.map((token, index) => (
                            <div key={index} style={entryStyle}>
                                <div style={{ color: '#00f0ff', fontWeight: 'bold' }}>{token.name}</div>
                                <div style={{ color: '#e0e0e0', fontSize: '12px' }}>{token.tokenAddress}</div>
                                <div style={{ color: '#FFC107' }}>Balance: {ethers.utils.formatEther(token.balance)}</div>
                                {this.state.flipToken && this.state.flipToken.address === token.tokenAddress && (
                                    <div style={{ color: '#4CAF50' }}>FLIP Token</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Badges Tab Content */}
            {activeTab === 'badges' && (
                <div>
                    <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>BADGE SYSTEM</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <button 
                            onClick={() => this.showAddBadgeLevelGUI()} 
                            style={createGradientButton('#FE6B8B', '#FF8E53')}
                        >
                            ADD BADGE LEVEL
                        </button>
                        <button 
                            onClick={() => this.showUserStatsGUI()} 
                            style={createGradientButton('#2196F3', '#03A9F4')}
                        >
                            GET USER STATS
                        </button>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {this.state.badgeLevels.length > 0 ? (
                            this.state.badgeLevels.map((level, index) => (
                                <div key={index} style={entryStyle}>
                                    <div style={{ color: '#00f0ff', fontWeight: 'bold' }}>{level.name}</div>
                                    <div style={{ color: '#FFC107' }}>Threshold: {level.threshold} tokens</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#e0e0e0', textAlign: 'center', padding: '20px' }}>
                                No badge levels defined
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Admin Tab Content */}
            {activeTab === 'admin' && (
                <div>
                    <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>ADMIN FUNCTIONS</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <button 
                            onClick={() => this.showTransferOwnershipGUI()} 
                            style={createGradientButton('#F44336', '#D32F2F')}
                        >
                            TRANSFER OWNERSHIP
                        </button>
                    </div>
                    <div style={entryStyle}>
                        <div style={{ color: '#00f0ff', fontWeight: 'bold' }}>Current Owner</div>
                        <div>{this.state.account || 'Not connected'}</div>
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
      VideoArchive CyberTerminal
      =============================================
      [[/header]]
      Connected: ${this.state.isConnected ? `Yes (${this.state.account})` : 'No'}
      ${this.state.connectionError ? `\nLast error: ${this.state.connectionError}` : ''}
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
            addentry: {
              description: 'Add archive entry (url, tokenAddress, initialTokenCount, miningKey, priceIfNoKey)',
              fn: async (...args) => await this.addEntry(...args)
            },
            removeentry: {
              description: 'Remove archive entry (id)',
              fn: async (...args) => await this.removeEntry(...args)
            },
            editentry: {
              description: 'Edit archive entry (id, newUrl)',
              fn: async (...args) => await this.editEntry(...args)
            },
            minetokens: {
              description: 'Mine tokens (entryId, miningKey)',
              fn: async (...args) => await this.mineTokens(...args)
            },
            addtoken: {
              description: 'Add token (tokenAddress, tokenName)',
              fn: async (...args) => await this.addToken(...args)
            },
            removetoken: {
              description: 'Remove token (tokenAddress)',
              fn: async (...args) => await this.removeToken(...args)
            },
            deposit: {
              description: 'Deposit tokens (tokenAddress, amount)',
              fn: async (...args) => await this.depositTokens(...args)
            },
            reward: {
              description: 'Reward user (tokenAddress, recipient, amount)',
              fn: async (...args) => await this.rewardUser(...args)
            },
            addbadge: {
              description: 'Add badge level (threshold, name)',
              fn: async (...args) => await this.addBadgeLevel(...args)
            },
            setflip: {
              description: 'Set FLIP token (tokenAddress, name)',
              fn: async (...args) => await this.setFlipToken(...args)
            },
            setrate: {
              description: 'Set exchange rate (rewardToken, rate)',
              fn: async (...args) => await this.setExchangeRate(...args)
            },
            exchange: {
              description: 'Exchange tokens (rewardToken, amount)',
              fn: async (...args) => await this.exchangeTokens(...args)
            },
            transfer: {
              description: 'Transfer ownership (newOwner)',
              fn: async (...args) => await this.transferOwnership(...args)
            },
            userstats: {
              description: 'Get user stats (userAddress)',
              fn: async (...args) => await this.getUserStats(...args)
            },
            entries: {
              description: 'List archive entries',
              fn: async () => await this.loadArchiveEntries()
            },
            tokens: {
              description: 'List token balances',
              fn: async () => await this.loadTokenBalances()
            },
            badges: {
              description: 'List badge levels',
              fn: async () => await this.loadBadgeLevels()
            },
            flip: {
              description: 'Get FLIP token info',
              fn: async () => await this.loadFlipToken()
            }
          }}
          dangerMode={true}
          welcomeMessage={welcomeMsg}
          ignoreCommandCase={true}
          promptLabel={'user@videoarchive:~$'}
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
            zIndex: "99",
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

export default VideoArchiveTerminal;
