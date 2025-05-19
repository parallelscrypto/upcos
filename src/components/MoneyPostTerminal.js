import React, { Component } from 'react';
import { ethers } from "ethers";
import Terminal from 'react-console-emulator';
import MoneyPostABI from '../etc/rawmaterial/MoneyPost.json';

const MONEYPOST_ADDRESS = "0x98D102E7b15162423A89F635D50A5681ae25441D";

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
      activeTab: 'submit',
      modalContent: null,
      showModal: false
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

      this.setState({ 
        moneyPost,
        provider,
        signer,
        account,
        isConnected: true
      });

      this.terminal.current.pushToStdout(
        `[[success]]Connected to account: ${account}[[/success]]`
      );

      await this.loadRewardTokens();
      await this.loadTopics();
      
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
        exchangeRate: rates[index]
      }));
      
      this.setState({ rewardTokens });
      
      terminal.pushToStdout('[[header]]=== Reward Tokens ===[[/header]]');
      rewardTokens.forEach((token, index) => {
        terminal.pushToStdout(
          `${index + 1}. ${token.name} (${token.tokenAddress}) - ` +
          `Reward: ${ethers.utils.formatEther(token.rewardAmount)} ` +
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

  async addRewardToken(name, tokenAddress, rewardAmount, exchangeRate) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      terminal.pushToStdout(`Adding reward token: ${name}...`);
      
      const tx = await moneyPost.addRewardToken(
        name,
        tokenAddress,
        ethers.utils.parseEther(rewardAmount),
        exchangeRate
      );

      await tx.wait();
      terminal.pushToStdout(`[[success]]Token added successfully![[/success]]`);
      await this.loadRewardTokens();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async removeRewardToken(tokenAddress) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      terminal.pushToStdout(`Removing reward token: ${tokenAddress}...`);
      
      const tx = await moneyPost.removeRewardToken(tokenAddress);
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Token removed successfully![[/success]]`);
      await this.loadRewardTokens();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async setExchangeRate(tokenAddress, newRate) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      terminal.pushToStdout(`Updating exchange rate for token: ${tokenAddress}...`);
      
      const tx = await moneyPost.setExchangeRate(
        tokenAddress,
        newRate
      );

      await tx.wait();
      terminal.pushToStdout(`[[success]]Exchange rate updated successfully![[/success]]`);
      await this.loadRewardTokens();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async addTopic(name) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      terminal.pushToStdout(`Adding topic: ${name}...`);
      
      const tx = await moneyPost.addTopic(name);
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Topic added successfully![[/success]]`);
      await this.loadTopics();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async renameTopic(topicId, newName) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      terminal.pushToStdout(`Renaming topic ${topicId} to ${newName}...`);
      
      const tx = await moneyPost.renameTopic(topicId, newName);
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Topic renamed successfully![[/success]]`);
      await this.loadTopics();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async removeTopic(topicId) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      terminal.pushToStdout(`Removing topic: ${topicId}...`);
      
      const tx = await moneyPost.removeTopic(topicId);
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Topic removed successfully![[/success]]`);
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
      
      const urlHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(url));
      
      terminal.pushToStdout(`Submitting post: ${url}`);
      terminal.pushToStdout(`Using reward token: ${rewardTokenAddress}`);
      terminal.pushToStdout(`For topic: ${topicId}`);
      
      const tx = await moneyPost.submitPost(
        urlHash,
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
        this.addRewardToken(name, address, amount, rate);
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
        this.removeRewardToken(address);
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
        this.setExchangeRate(tokenAddress, newRate);
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
        this.addTopic(name);
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
        this.renameTopic(topicId, newName);
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
        this.removeTopic(topicId);
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
          paddingBottom: '10px'
        }}>
          {['submit', 'rewards', 'topics'].map(tab => (
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
                transition: 'all 0.3s'
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
                  <div style={{ color: '#FFC107' }}>Reward: {ethers.utils.formatEther(token.rewardAmount)} ETH</div>
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
            addreward: {
              description: 'Add reward token (name, address, amount, rate)',
              fn: async (...args) => await this.addRewardToken(...args)
            },
            removereward: {
              description: 'Remove reward token (address)',
              fn: async (address) => await this.removeRewardToken(address)
            },
            setrate: {
              description: 'Set exchange rate (tokenAddress, newRate)',
              fn: async (...args) => await this.setExchangeRate(...args)
            },
            addtopic: {
              description: 'Add topic (name)',
              fn: async (name) => await this.addTopic(name)
            },
            edittopic: {
              description: 'Edit topic (topicId, newName)',
              fn: async (topicId, newName) => await this.renameTopic(topicId, newName)
            },
            removetopic: {
              description: 'Remove topic (topicId)',
              fn: async (topicId) => await this.removeTopic(topicId)
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
