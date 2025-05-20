import React, { Component } from 'react';
import { ethers } from "ethers";
import Terminal from 'react-console-emulator';
import MoneyPostABI from '../etc/rawmaterial/MoneyPost.json';

const MONEYPOST_ADDRESS = "0xb18876555309e20C919A00c07d7b2203376ae136";
var sha256 = require('js-sha256');

class MoneyPostTerminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      moneyPost: null,
      provider: null,
      signer: null,
      isProgressing: false,
      isConnected: false,
      connectionError: null,
      rewardTokens: [],
      topics: [],
      blockedAddresses: [],
      activeTab: 'submit',
      modalContent: null,
      showModal: false,
      baseURL: ''
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
      this.modalContainer.id = 'moneypost-modal-container';
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
      moneyPost: null,
      provider: null,
      signer: null,
      isConnected: false,
      rewardTokens: [],
      topics: []
    });
    this.terminal.current.pushToStdout('[[warning]]Wallet disconnected[[/warning]]');
  }

  async loadBlockchainData() {
    this.setState({ isProgressing: true, connectionError: null });
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      
      const moneyPost = new ethers.Contract(
        MONEYPOST_ADDRESS,
        MoneyPostABI.abi,
        signer
      );

      const baseURL = await moneyPost.baseURL();

      this.setState({ 
        moneyPost,
        provider,
        signer,
        account,
        isConnected: true,
        baseURL
      });

      this.terminal.current.pushToStdout(
        `[[success]]Connected to account: ${account}[[/success]]`
      );

      await this.loadRewardTokens();
      await this.loadTopics();
      await this.loadBlockedAddresses();
      
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



  async loadRewardTokens() {
    try {
      const terminal = this.terminal.current;
      const { moneyPost } = this.state;
      
      const [tokens, rates] = await moneyPost.listRewardTokens();
      
      const rewardTokens = tokens.map((token, index) => ({
        ...token,
        rewardAmount: ethers.utils.formatEther(token.rewardAmount), // Convert BigNumber to string
        exchangeRate: rates[index].toString() // Convert BigNumber to string
      }));
      
      this.setState({ rewardTokens });
      
      terminal.pushToStdout('[[header]]=== Reward Tokens ===[[/header]]');
      rewardTokens.forEach((token, index) => {
        terminal.pushToStdout(
          `${index + 1}. ${token.name} (${token.tokenAddress}) - ` +
          `Reward: ${token.rewardAmount} ` +
          `Rate: ${token.exchangeRate}`
        );
      });
    } catch (error) {
      console.error("Error loading reward tokens:", error);
    }
  }


  async loadTopics() {
    try {
      const terminal = this.terminal.current;
      const { moneyPost } = this.state;
      
      const topics = await moneyPost.listTopics();
      
      this.setState({ topics });
      
      terminal.pushToStdout('[[header]]=== Topics ===[[/header]]');
      topics.forEach((topic, index) => {
        terminal.pushToStdout(
          `${index + 1}. ${topic.name} (${topic.topicId})`
        );
      });
    } catch (error) {
      console.error("Error loading topics:", error);
    }
  }

  async loadBlockedAddresses() {
    try {
      const { moneyPost } = this.state;
      const blockedAddresses = await moneyPost.getBlockedAddresses();
      this.setState({ blockedAddresses });
    } catch (error) {
      console.error("Error loading blocked addresses:", error);
    }
  }


  async manageRewardToken(action, name, tokenAddress, rewardAmount, exchangeRate) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      if (action === 'add') {
        terminal.pushToStdout(`Adding reward token: ${name}...`);
        const tx = await moneyPost.manageRewardToken(
          tokenAddress,
          name,
          ethers.utils.parseEther(rewardAmount.toString()), // Convert to string then to BigNumber
          ethers.BigNumber.from(exchangeRate.toString()), // Convert to string then to BigNumber
          0 // add action
        );
        await tx.wait();
        terminal.pushToStdout(`[[success]]Token added successfully![[/success]]`);
      } else if (action === 'remove') {
        terminal.pushToStdout(`Removing reward token: ${tokenAddress}...`);
        const tx = await moneyPost.manageRewardToken(
          tokenAddress,
          "",
          ethers.constants.Zero, // Use Zero constant for BigNumber
          ethers.constants.Zero,
          1 // remove action
        );
        await tx.wait();
        terminal.pushToStdout(`[[success]]Token removed successfully![[/success]]`);
      } else if (action === 'update') {
        terminal.pushToStdout(`Updating reward token: ${tokenAddress}...`);
        const tx = await moneyPost.manageRewardToken(
          tokenAddress,
          "",
          ethers.utils.parseEther(rewardAmount.toString()),
          ethers.BigNumber.from(exchangeRate.toString()),
          2 // update action
        );
        await tx.wait();
        terminal.pushToStdout(`[[success]]Token updated successfully![[/success]]`);
      }
      
      await this.loadRewardTokens();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Manage reward token error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }




  async manageTopic(action, topicId, name) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      if (action === 'add') {
        terminal.pushToStdout(`Adding topic: ${name}...`);
        const tx = await moneyPost.manageTopic(
          ethers.constants.HashZero, // dummy value for add
          name,
          true // isAdd
        );
        await tx.wait();
        terminal.pushToStdout(`[[success]]Topic added successfully![[/success]]`);
      } else if (action === 'remove') {
        terminal.pushToStdout(`Removing topic: ${topicId}...`);
        const tx = await moneyPost.manageTopic(
          topicId,
          "",
          false // isAdd (false = remove)
        );
        await tx.wait();
        terminal.pushToStdout(`[[success]]Topic removed successfully![[/success]]`);
      }
      
      await this.loadTopics();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  }







  async submitPost(url, rewardTokenAddress, topicId) {
      const terminal = this.terminal.current;
      this.setState({ isProgressing: true });
      
      try {
          const { moneyPost } = this.state;
          
          // Generate SHA256 hash
          const urlHash = sha256(url);
          
          // Convert the hex string to bytes32 format that Solidity expects
          const bytes32Hash = ethers.utils.hexZeroPad('0x' + urlHash, 32);
          
          terminal.pushToStdout(`Submitting post: ${url}`);
          terminal.pushToStdout(`Using reward token: ${rewardTokenAddress}`);
          terminal.pushToStdout(`For topic: ${topicId}`);
          
          const tx = await moneyPost.submitPost(
              bytes32Hash,  // Use the properly formatted bytes32 hash
              url,
              rewardTokenAddress,
              topicId
          );
  
          terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
          terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
          
          await tx.wait();
          
          terminal.pushToStdout(`[[success]]Post submitted successfully![[/success]]`);
          
      } catch (error) {
          terminal.pushToStdout(
              `[[error]]Error: ${error.reason || error.message}[[/error]]`
          );
          console.error("Post submission error:", error);
      } finally {
          this.setState({ isProgressing: false });
      }
  }







  async getPostsByTopic(topicId, startIndex = 0, endIndex = 10) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      const posts = await moneyPost.getPostsByTopic(topicId, startIndex, endIndex);
      
      terminal.pushToStdout('[[header]]=== Posts ===[[/header]]');
      posts.forEach((post, index) => {
        terminal.pushToStdout(
          `${startIndex + index + 1}. Hash: ${post.urlHash}\n` +
          `   Author: ${post.author}\n` +
          `   Timestamp: ${new Date(post.timestamp * 1000).toLocaleString()}\n` +
          `   Reward Token: ${post.rewardToken}`
        );
      });
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async swapTokens(fromToken, toToken, amount) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      terminal.pushToStdout(`Swapping ${amount} of token ${fromToken} to token ${toToken}...`);
      
      const tx = await moneyPost.swapTokens(
        fromToken,
        toToken,
        ethers.utils.parseEther(amount)
      );

      terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Tokens swapped successfully![[/success]]`);
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Token swap error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }



  async depositRewardTokens(tokenAddress, amount) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      // Check allowance first
      const allowance = await this.checkAllowance(tokenAddress);
      const amountBN = ethers.utils.parseEther(amount);
      
      if (allowance.lt(amountBN)) {
        throw new Error(`Insufficient allowance. Please approve at least ${amount} tokens first.`);
      }
  
      terminal.pushToStdout(`Depositing ${amount} of token ${tokenAddress}...`);
      
      const tx = await this.state.moneyPost.depositRewardTokens(
        tokenAddress,
        amountBN
      );
  
      // ... rest of deposit function remains same
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Token deposit error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }




  async withdrawRewardTokens(tokenAddress, amount) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      terminal.pushToStdout(`Withdrawing ${amount} of token ${tokenAddress}...`);
      
      const tx = await moneyPost.withdrawRewardTokens(
        tokenAddress,
        ethers.utils.parseEther(amount)
      );

      terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Tokens withdrawn successfully![[/success]]`);
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Token withdrawal error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async manageBlockedAddresses(addresses, shouldBlock) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      if (shouldBlock) {
        terminal.pushToStdout(`Blocking addresses: ${addresses.join(', ')}...`);
        const tx = await moneyPost.addBlockedAddresses(addresses);
        await tx.wait();
        terminal.pushToStdout(`[[success]]Addresses blocked successfully![[/success]]`);
      } else {
        terminal.pushToStdout(`Unblocking addresses: ${addresses.join(', ')}...`);
        const tx = await moneyPost.removeBlockedAddress(addresses[0]); // Can only remove one at a time
        await tx.wait();
        terminal.pushToStdout(`[[success]]Address unblocked successfully![[/success]]`);
      }
      
      await this.loadBlockedAddresses();
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Address management error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }



  async getContractTokenBalance(tokenAddress) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
  
    try {
      // Minimal ERC20 ABI for balance check
      const minimalERC20ABI = [
        {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "", "type": "uint256"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }
      ];
  
      const tokenContract = new ethers.Contract(
        tokenAddress,
        minimalERC20ABI,
        this.state.provider
      );
  
      // Check balance of MoneyPost contract's holdings
      const balance = await tokenContract.balanceOf(MONEYPOST_ADDRESS);
      const formattedBalance = ethers.utils.formatEther(balance);
      
      terminal.pushToStdout(
        `[[success]]Contract token balance: ${formattedBalance}[[/success]]`
      );
      
      return balance;
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Contract token balance error:", error);
      return ethers.constants.Zero;
    } finally {
      this.setState({ isProgressing: false });
    }
  }




  async approveToken(tokenAddress, amount) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout(`Approving ${amount} tokens for contract...`);
      
      // Minimal ERC20 ABI just for approvals
      const minimalERC20ABI = [
        {
          "constant": false,
          "inputs": [
            {"name": "_spender","type": "address"},
            {"name": "_value","type": "uint256"}
          ],
          "name": "approve",
          "outputs": [{"name": "","type": "bool"}],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {"name": "_owner","type": "address"},
            {"name": "_spender","type": "address"}
          ],
          "name": "allowance",
          "outputs": [{"name": "","type": "uint256"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }
      ];
  
      const tokenContract = new ethers.Contract(
        tokenAddress,
        minimalERC20ABI,
        this.state.signer
      );
  
      const tx = await tokenContract.approve(
        MONEYPOST_ADDRESS,
        ethers.utils.parseEther(amount.toString())
      );
  
      terminal.pushToStdout(`[[success]]Approval sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Tokens approved successfully![[/success]]`);
      await this.checkAllowance(tokenAddress); // Update allowance state
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Token approval error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }


  async checkAllowance(tokenAddress) {
    try {
      // Minimal ABI for allowance check
      const minimalERC20ABI = [
        {
          "constant": true,
          "inputs": [
            {"name": "_owner","type": "address"},
            {"name": "_spender","type": "address"}
          ],
          "name": "allowance",
          "outputs": [{"name": "","type": "uint256"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }
      ];
  
      const tokenContract = new ethers.Contract(
        tokenAddress,
        minimalERC20ABI,
        this.state.signer
      );
  
      const allowance = await tokenContract.allowance(
        this.state.account,
        MONEYPOST_ADDRESS
      );
  
      this.setState(prevState => ({
        allowances: {
          ...prevState.allowances,
          [tokenAddress]: ethers.utils.formatEther(allowance)
        }
      }));
  
      return allowance;
    } catch (error) {
      console.error("Error checking allowance:", error);
      return ethers.constants.Zero;
    }
  }



  async setBaseURL(newURL) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      terminal.pushToStdout(`Setting base URL to: ${newURL}...`);
      
      const tx = await moneyPost.setBaseURL(newURL);
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Base URL updated successfully![[/success]]`);
      this.setState({ baseURL: newURL });
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Base URL update error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async getTokenBalance(tokenAddress) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      // Minimal ERC20 ABI for balance check
      const minimalERC20ABI = [
        {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "", "type": "uint256"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }
      ];
  
      const tokenContract = new ethers.Contract(
        tokenAddress,
        minimalERC20ABI,
        this.state.provider
      );
  
      const balance = await tokenContract.balanceOf(this.state.account);
      const formattedBalance = ethers.utils.formatEther(balance);
      
      terminal.pushToStdout(
        `[[success]]Token balance: ${formattedBalance}[[/success]]`
      );
      
      return balance;
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Token balance error:", error);
      return ethers.constants.Zero;
    } finally {
      this.setState({ isProgressing: false });
    }
  }



  showSubmitPostGUI() {
    const { rewardTokens, topics } = this.state;
    
    this.showCyberpunkModal(
      "SUBMIT NEW POST",
      [
        {
          label: "Post URL",
          name: "url",
          type: "text",
          required: true,
          placeholder: "https://example.com/export/..."
        },
        {
          label: "Reward Token",
          name: "rewardToken",
          type: "select",
          required: true,
          options: rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        {
          label: "Topic",
          name: "topicId",
          type: "select",
          required: true,
          options: topics.map(topic => ({
            value: topic.topicId,
            label: topic.name
          }))
        }
      ],
      ({ url, rewardToken, topicId }) => {
        this.submitPost(url, rewardToken, topicId);
      }
    );
  }

  showAddRewardTokenGUI() {
    this.showCyberpunkModal(
      "ADD REWARD TOKEN",
      [
        { label: "Token Name", name: "name", required: true },
        { label: "Token Address", name: "address", required: true },
        { label: "Reward Amount (ETH)", name: "amount", type: "number", required: true },
        { label: "Exchange Rate", name: "rate", type: "number", required: true }
      ],
      ({ name, address, amount, rate }) => {
        this.manageRewardToken('add', name, address, amount, rate);
      }
    );
  }

  showRemoveRewardTokenGUI() {
    const { rewardTokens } = this.state;
    
    this.showCyberpunkModal(
      "REMOVE REWARD TOKEN",
      [
        {
          label: "Token to Remove",
          name: "address",
          type: "select",
          required: true,
          options: rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        }
      ],
      ({ address }) => {
        this.manageRewardToken('remove', '', address, '0', 0);
      }
    );
  }

  showSetExchangeRateGUI() {
    const { rewardTokens } = this.state;
    
    this.showCyberpunkModal(
      "SET EXCHANGE RATE",
      [
        {
          label: "Token",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        {
          label: "New Exchange Rate",
          name: "newRate",
          type: "number",
          required: true,
          placeholder: "Enter new exchange rate"
        }
      ],
      ({ tokenAddress, newRate }) => {
        this.manageRewardToken('update', '', tokenAddress, '0', newRate);
      }
    );
  }

  showAddTopicGUI() {
    this.showCyberpunkModal(
      "ADD TOPIC",
      [
        { label: "Topic Name", name: "name", required: true }
      ],
      ({ name }) => {
        this.manageTopic('add', '', name);
      }
    );
  }

  showEditTopicGUI() {
    const { topics } = this.state;
    
    this.showCyberpunkModal(
      "EDIT TOPIC",
      [
        {
          label: "Select Topic",
          name: "topicId",
          type: "select",
          required: true,
          options: topics.map(topic => ({
            value: topic.topicId,
            label: topic.name
          }))
        },
        { label: "New Name", name: "newName", required: true }
      ],
      ({ topicId, newName }) => {
        this.manageTopic('add', topicId, newName);
      }
    );
  }

  showRemoveTopicGUI() {
    const { topics } = this.state;
    
    this.showCyberpunkModal(
      "REMOVE TOPIC",
      [
        {
          label: "Topic to Remove",
          name: "topicId",
          type: "select",
          required: true,
          options: topics.map(topic => ({
            value: topic.topicId,
            label: topic.name
          }))
        }
      ],
      ({ topicId }) => {
        this.manageTopic('remove', topicId, '');
      }
    );
  }

  showDepositTokensGUI() {
    const { rewardTokens } = this.state;
    
    this.showCyberpunkModal(
      "DEPOSIT TOKENS",
      [
        {
          label: "Token",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
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
      ({ tokenAddress, amount }) => {
        this.depositRewardTokens(tokenAddress, amount);
      }
    );
  }

  showWithdrawTokensGUI() {
    const { rewardTokens } = this.state;
    
    this.showCyberpunkModal(
      "WITHDRAW TOKENS",
      [
        {
          label: "Token",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        {
          label: "Amount to Withdraw",
          name: "amount",
          type: "number",
          required: true,
          placeholder: "Enter amount to withdraw"
        }
      ],
      ({ tokenAddress, amount }) => {
        this.withdrawRewardTokens(tokenAddress, amount);
      }
    );
  }

  showSwapTokensGUI() {
    const { rewardTokens } = this.state;
    
    this.showCyberpunkModal(
      "SWAP TOKENS",
      [
        {
          label: "From Token",
          name: "fromToken",
          type: "select",
          required: true,
          options: rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        {
          label: "To Token",
          name: "toToken",
          type: "select",
          required: true,
          options: rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        {
          label: "Amount to Swap",
          name: "amount",
          type: "number",
          required: true,
          placeholder: "Enter amount to swap"
        }
      ],
      ({ fromToken, toToken, amount }) => {
        this.swapTokens(fromToken, toToken, amount);
      }
    );
  }

  showBlockAddressGUI() {
    this.showCyberpunkModal(
      "BLOCK ADDRESS",
      [
        {
          label: "Address to Block",
          name: "address",
          type: "text",
          required: true,
          placeholder: "0x..."
        }
      ],
      ({ address }) => {
        this.manageBlockedAddresses([address], true);
      }
    );
  }

  showUnblockAddressGUI() {
    const { blockedAddresses } = this.state;
    
    this.showCyberpunkModal(
      "UNBLOCK ADDRESS",
      [
        {
          label: "Address to Unblock",
          name: "address",
          type: "select",
          required: true,
          options: blockedAddresses.map(address => ({
            value: address,
            label: address
          }))
        }
      ],
      ({ address }) => {
        this.manageBlockedAddresses([address], false);
      }
    );
  }


  showApproveTokenGUI() {
    const { rewardTokens } = this.state;
    
    this.showCyberpunkModal(
      "APPROVE TOKENS",
      [
        {
          label: "Token",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        },
        {
          label: "Amount to Approve",
          name: "amount",
          type: "number",
          required: true,
          placeholder: "Enter amount to approve"
        }
      ],
      ({ tokenAddress, amount }) => {
        this.approveToken(tokenAddress, amount);
      }
    );
  }



  showSetBaseURLGUI() {
    const { baseURL } = this.state;
    
    this.showCyberpunkModal(
      "SET BASE URL",
      [
        {
          label: "New Base URL",
          name: "url",
          type: "text",
          required: true,
          placeholder: "https://example.com",
          value: baseURL
        }
      ],
      ({ url }) => {
        this.setBaseURL(url);
      }
    );
  }

  showTokenBalanceGUI() {
    const { rewardTokens } = this.state;
    
    this.showCyberpunkModal(
      "CHECK TOKEN BALANCE",
      [
        {
          label: "Token",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        }
      ],
      ({ tokenAddress }) => {
        this.getContractTokenBalance(tokenAddress);
      }
    );
  }

  renderCyberpunkGUI() {
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
        WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
      }}>
          {['submit', 'rewards', 'topics', 'admin'].map(tab => (
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
                flexShrink: 0 // Add this line
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {this.state.activeTab === 'submit' && (
          <div>
            <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>SUBMIT POST</h3>
            <button
              onClick={() => this.showSubmitPostGUI()}
              style={{
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 3px 15px 2px rgba(255, 105, 135, 0.5)'
              }}
            >
              NEW POST
            </button>
          </div>
        )}

        {this.state.activeTab === 'rewards' && (
          <div>
            <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>REWARD TOKENS</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.showAddRewardTokenGUI()}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ADD TOKEN
              </button>
              <button
                onClick={() => this.showRemoveRewardTokenGUI()}
                style={{
                  background: 'linear-gradient(45deg, #F44336 30%, #FF5722 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                REMOVE TOKEN
              </button>
              <button
                onClick={() => this.showSetExchangeRateGUI()}
                style={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #03A9F4 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                SET RATE
              </button>
              <button
                onClick={() => this.showDepositTokensGUI()}
                style={{
                  background: 'linear-gradient(45deg, #9C27B0 30%, #673AB7 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                DEPOSIT
              </button>
              <button
                onClick={() => this.showWithdrawTokensGUI()}
                style={{
                  background: 'linear-gradient(45deg, #607D8B 30%, #455A64 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                WITHDRAW
              </button>
              <button
                onClick={() => this.showSwapTokensGUI()}
                style={{
                  background: 'linear-gradient(45deg, #FF5722 30%, #E91E63 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                SWAP
              </button>
              <button
                onClick={() => this.showTokenBalanceGUI()}
                style={{
                  background: 'linear-gradient(45deg, #00BCD4 30%, #009688 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                CHECK BALANCE
              </button>
              <button
                onClick={() => this.showApproveTokenGUI()}
                style={{
                  background: 'linear-gradient(45deg, #FFC107 30%, #FF9800 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                APPROVE
              </button>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {this.state.rewardTokens.map((token, index) => (
                <div key={index} style={{
                  background: '#121212',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  borderLeft: '3px solid #00f0ff'
                }}>
                  <div style={{ color: '#00f0ff', fontWeight: 'bold' }}>{token.name}</div>
                  <div style={{ color: '#e0e0e0', fontSize: '12px' }}>{token.tokenAddress}</div>
                  <div style={{ color: '#FFC107' }}>Reward: {token.rewardAmount} ETH</div>
                  <div style={{ color: '#4CAF50' }}>Exchange Rate: {token.exchangeRate}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {this.state.activeTab === 'topics' && (
          <div>
            <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>TOPICS</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.showAddTopicGUI()}
                style={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #03A9F4 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ADD TOPIC
              </button>
              <button
                onClick={() => this.showEditTopicGUI()}
                style={{
                  background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                EDIT TOPIC
              </button>
              <button
                onClick={() => this.showRemoveTopicGUI()}
                style={{
                  background: 'linear-gradient(45deg, #F44336 30%, #FF5722 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                REMOVE TOPIC
              </button>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {this.state.topics.map((topic, index) => (
                <div key={index} style={{
                  background: '#121212',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  borderLeft: '3px solid #00f0ff'
                }}>
                  <div style={{ color: '#00f0ff', fontWeight: 'bold' }}>{topic.name}</div>
                  <div style={{ color: '#e0e0e0', fontSize: '12px' }}>ID: {topic.topicId}</div>
                  <div style={{ color: '#9C27B0' }}>
                    Created: {new Date(topic.createdAt * 1000).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {this.state.activeTab === 'admin' && (
          <div>
            <h3 style={{ color: '#00f0ff', marginBottom: '15px' }}>ADMIN FUNCTIONS</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.showBlockAddressGUI()}
                style={{
                  background: 'linear-gradient(45deg, #F44336 30%, #D32F2F 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                BLOCK ADDRESS
              </button>
              <button
                onClick={() => this.showUnblockAddressGUI()}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50 30%, #388E3C 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                UNBLOCK ADDRESS
              </button>
              <button
                onClick={() => this.showSetBaseURLGUI()}
                style={{
                  background: 'linear-gradient(45deg, #00BCD4 30%, #0097A7 90%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                SET BASE URL
              </button>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <div style={{
                background: '#121212',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                borderLeft: '3px solid #00f0ff'
              }}>
                <div style={{ color: '#00f0ff', fontWeight: 'bold' }}>Current Base URL</div>
                <div style={{ color: '#e0e0e0', fontSize: '12px' }}>{this.state.baseURL || 'Not set'}</div>
              </div>
              <div style={{
                background: '#121212',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                borderLeft: '3px solid #00f0ff'
              }}>
                <div style={{ color: '#00f0ff', fontWeight: 'bold' }}>Blocked Addresses</div>
                {this.state.blockedAddresses.length > 0 ? (
                  this.state.blockedAddresses.map((address, index) => (
                    <div key={index} style={{ color: '#e0e0e0', fontSize: '12px' }}>{address}</div>
                  ))
                ) : (
                  <div style={{ color: '#e0e0e0', fontSize: '12px' }}>No addresses blocked</div>
                )}
              </div>
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
      MoneyPost CyberTerminal
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
            submit: {
              description: 'Submit a post (url, rewardTokenAddress, topicId)',
              fn: async (...args) => await this.submitPost(...args)
            },
            rewards: {
              description: 'List reward tokens',
              fn: async () => await this.loadRewardTokens()
            },
            topics: {
              description: 'List topics',
              fn: async () => await this.loadTopics()
            },
            posts: {
              description: 'Get posts by topic (topicId, [start], [end])',
              fn: async (...args) => await this.getPostsByTopic(...args)
            },
            deposit: {
              description: 'Deposit tokens (tokenAddress, amount)',
              fn: async (...args) => await this.depositRewardTokens(...args)
            },
            withdraw: {
              description: 'Withdraw tokens (tokenAddress, amount)',
              fn: async (...args) => await this.withdrawRewardTokens(...args)
            },
            swap: {
              description: 'Swap tokens (fromToken, toToken, amount)',
              fn: async (...args) => await this.swapTokens(...args)
            },
            balance: {
              description: 'Check token balance (tokenAddress)',
              fn: async (tokenAddress) => await this.getTokenBalance(tokenAddress)
            },
            contractbalance: {
              description: 'Check contract token balance (tokenAddress)',
              fn: async (tokenAddress) => await this.getContractTokenBalance(tokenAddress)
            },
            block: {
              description: 'Block an address (address)',
              fn: async (address) => await this.manageBlockedAddresses([address], true)
            },
            unblock: {
              description: 'Unblock an address (address)',
              fn: async (address) => await this.manageBlockedAddresses([address], false)
            },
            seturl: {
              description: 'Set base URL (newURL)',
              fn: async (newURL) => await this.setBaseURL(newURL)
            },
            geturl: {
              description: 'Get current base URL',
              fn: async () => {
                this.terminal.current.pushToStdout(
                  `[[success]]Current base URL: ${this.state.baseURL || 'Not set'}[[/success]]`
                );
              }
            },
            approve: {
              description: 'Approve tokens for deposit (tokenAddress, amount)',
              fn: async (...args) => await this.approveToken(...args)
            },
            blocked: {
              description: 'List blocked addresses',
              fn: async () => {
                if (this.state.blockedAddresses.length === 0) {
                  this.terminal.current.pushToStdout('[[info]]No addresses blocked[[/info]]');
                } else {
                  this.terminal.current.pushToStdout('[[header]]=== Blocked Addresses ===[[/header]]');
                  this.state.blockedAddresses.forEach((address, index) => {
                    this.terminal.current.pushToStdout(`${index + 1}. ${address}`);
                  });
                }
              }
            }
          }}
          dangerMode={true}
          welcomeMessage={welcomeMsg}
          ignoreCommandCase={true}
          promptLabel={'user@moneypost:~$'}
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

export default MoneyPostTerminal;
