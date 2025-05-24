import React, { Component } from 'react';
import { ethers } from "ethers";
import Terminal from 'react-console-emulator';
import MoneyPostABI from '../etc/rawmaterial/MoneyPost.json';
import RawMaterialABI from '../etc/rawmaterial/RawMaterial.json';

const MONEYPOST_ADDRESS = "0x591591B146f7754d8e9A45AAaA93D19Abb84129b";
var sha256 = require('js-sha256');

class MoneyPostTerminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      moneyPost: null,
      rawMaterial: null,
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
      baseURL: '',
      flipToken: null,
      userUpcs: []
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

      const rawMaterialAddress = "0x2C343942548319cCfc05666FF15d73E8569FaEdf";
      const rawMaterial = new ethers.Contract(
        rawMaterialAddress,
        RawMaterialABI.abi,
        signer
      );

      const baseURL = await moneyPost.baseURL();
      const flipToken = await moneyPost.flipToken();

      this.setState({ 
        moneyPost,
        rawMaterial,
        provider,
        signer,
        account,
        isConnected: true,
        baseURL,
        flipToken
      });

      this.terminal.current.pushToStdout(
        `[[success]]Connected to account: ${account}[[/success]]`
      );

      await this.loadRewardTokens();
      await this.loadTopics();
      await this.loadBlockedAddresses();
      await this.loadUserUpcs();
      
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

  async loadUserUpcs() {
    try {
      const { rawMaterial, account } = this.state;
      if (!rawMaterial || !account) return;

      const id = await this.props.latestRawId();
      var upcs = [];
      for(var i=1; i<id; i++) {
         var tempNft = await this.props.nftInfo(i);

         if(tempNft['staker'] == this.state.account) {
            var upcHRN = tempNft['word'];
            upcs.push(upcHRN);
         }
      }

      this.setState({ userUpcs: upcs });
    } catch (error) {
      console.error("Error loading user UPCs:", error);
    }
  }

  async loadRewardTokens() {
    try {
      const terminal = this.terminal.current;
      const { moneyPost, flipToken } = this.state;
      
      const [tokens, rates] = await moneyPost.listRewardTokens();
      
      const rewardTokens = tokens.map((token, index) => ({
        ...token,
        rewardAmount: ethers.utils.formatEther(token.rewardAmount),
        exchangeRate: rates[index].toString()
      }));

      if (flipToken && !rewardTokens.some(t => t.tokenAddress === flipToken)) {
        rewardTokens.push({
          name: "FLIP",
          tokenAddress: flipToken,
          rewardAmount: "0",
          exchangeRate: "1"
        });
      }
      
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


    // Add this method to your MoneyPostTerminal class
    showPostsGUI() {
      const { topics } = this.state;
      
      this.showCyberpunkModal(
        "SELECT TOPIC TO VIEW POSTS",
        [
          {
            label: "Topic",
            name: "topicId",
            type: "select",
            required: true,
            options: topics.map(topic => ({
              value: topic.topicId,
              label: `${topic.name} (${topic.tokenName || 'No token'})`
            }))
          },
          {
            label: "Start Index",
            name: "startIndex",
            type: "number",
            required: false,
            placeholder: "0 (default)"
          },
          {
            label: "End Index",
            name: "endIndex",
            type: "number",
            required: false,
            placeholder: "9 (default)"
          }
        ],
        async ({ topicId, startIndex = 0, endIndex = 9 }) => {
          try {
            this.setState({ isProgressing: true });
            const { moneyPost } = this.state;
            
            // Convert to numbers
            startIndex = parseInt(startIndex) || 0;
            endIndex = parseInt(endIndex) || startIndex + 9;
            
            // Get the total number of posts first
            const totalPosts = await moneyPost.getTotalPostsByTopic(topicId);
            
            if (totalPosts === 0) {
              this.showPostsResult([], 0, "No posts found for this topic");
              return;
            }
            
            // Adjust endIndex if it exceeds total posts
            if (endIndex >= totalPosts) {
              endIndex = totalPosts - 1;
            }
            
            // Get the posts
            const posts = await moneyPost.getPostsByTopic(topicId, startIndex, endIndex);
            
            // Find the topic name
            const topic = topics.find(t => t.topicId === topicId);
            const topicName = topic ? topic.name : "Unknown Topic";
            
            this.showPostsResult(posts, totalPosts, topicName, startIndex);
          } catch (error) {
            this.terminal.current.pushToStdout(
              `[[error]]Error: ${error.reason || error.message}[[/error]]`
            );
            console.error("Error getting posts:", error);
          } finally {
            this.setState({ isProgressing: false });
          }
        }
      );
    }

    // Add this method to your MoneyPostTerminal class
    showPostsResult(posts, totalPosts, topicName, startIndex = 0) {
      const content = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #00f0ff; margin-bottom: 5px; text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);">${topicName}</h2>
          <div style="color: #e0e0e0; margin-bottom: 15px;">Total Posts: ${totalPosts}</div>
        </div>
        
        <div style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
          ${posts.length > 0 ? 
            posts.map((post, index) => `
              <div style="
                background: #1a1a2e;
                border-left: 3px solid #00f0ff;
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 4px;
                box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
              ">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #00f0ff; font-weight: bold;">Post #${startIndex + index + 1}</span>
                  <span style="color: #FFC107;">${new Date(post.timestamp * 1000).toLocaleString()}</span>
                </div>
                
                <div style="margin-bottom: 10px;">
                  <div style="color: #e0e0e0; font-size: 14px; margin-bottom: 5px;">Author:</div>
                  <div style="color: #9C27B0; word-break: break-all;">${post.author}</div>
                </div>
                
                <div style="margin-bottom: 10px;">
                  <div style="color: #e0e0e0; font-size: 14px; margin-bottom: 5px;">URL:</div>
                  <div style="color: #4CAF50;">
                    <a href="${post.url}" target="_blank" rel="noopener noreferrer" 
                       style="color: #4CAF50; text-decoration: none; border-bottom: 1px dashed #4CAF50;">
                      ${post.url}
                    </a>
                  </div>
                </div>
                
                <div style="margin-bottom: 5px;">
                  <div style="color: #e0e0e0; font-size: 14px; margin-bottom: 5px;">Reward Token:</div>
                  <div style="color: #FF9800;">${post.rewardToken}</div>
                </div>

                <div style="margin-top: 15px;">
                  <button onclick="document.getElementById('post-content-${index}').style.display = 
                    document.getElementById('post-content-${index}').style.display === 'none' ? 'block' : 'none';
                    this.textContent = document.getElementById('post-content-${index}').style.display === 'none' ? 'Show Content' : 'Hide Content'"
                    style="
                      background: #1a1a2e;
                      border: 1px solid #00f0ff;
                      color: #00f0ff;
                      padding: 5px 10px;
                      border-radius: 4px;
                      cursor: pointer;
                      margin-bottom: 10px;
                    ">
                    Show Content
                  </button>
                  
                  <button onclick="window.open('${post.url}', '_blank', 'fullscreen=yes')"
                    style="
                      background: #1a1a2e;
                      border: 1px solid #4CAF50;
                      color: #4CAF50;
                      padding: 5px 10px;
                      border-radius: 4px;
                      cursor: pointer;
                      margin-left: 10px;
                    ">
                    Full Screen
                  </button>
                  
                  <div id="post-content-${index}" style="display: none; margin-top: 10px;">
                    <iframe 
                      src="${post.url}" 
                      style="
                        width: 100%;
                        height: 400px;
                        border: 1px solid #333;
                        border-radius: 4px;
                        background: #121212;
                      "
                      frameborder="0"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              </div>
            `).join('')
            : 
            '<div style="text-align: center; color: #e0e0e0; padding: 20px;">No posts found</div>'
          }
        </div>
      `;

      this.showModal(content);
    }



  async getPostsByTopic(topicId, startIndex = 0, endIndex = 9) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
  
    try {
      const { moneyPost } = this.state;
      
      // Validate inputs
      startIndex = parseInt(startIndex) || 0;
      endIndex = parseInt(endIndex) || startIndex + 9;
      
      terminal.pushToStdout(`Fetching posts for topic ${topicId} (items ${startIndex}-${endIndex})...`);
      
      // Get the total number of posts first
      const totalPosts = await moneyPost.getTotalPostsByTopic(topicId);
      
      if (totalPosts === 0) {
        terminal.pushToStdout('[[info]]No posts found for this topic[[/info]]');
        return;
      }
      
      // Adjust endIndex if it exceeds total posts
      if (endIndex >= totalPosts) {
        endIndex = totalPosts - 1;
      }
      
      // Get the posts
      const posts = await moneyPost.getPostsByTopic(topicId, startIndex, endIndex);
      
      terminal.pushToStdout('[[header]]=== Posts ===[[/header]]');
      terminal.pushToStdout(`Total posts: ${totalPosts}`);
      
      posts.forEach((post, index) => {
        var link = '<a href=' + post.url + '>Visit UPC</a>';
        const postNumber = startIndex + index + 1;
        terminal.pushToStdout(
          `${postNumber}. URL Hash: ${post.urlHash}\n` +
          `   Author: ${post.author}\n` +
          `   Url: ${link}\n` +
          `   Timestamp: ${new Date(post.timestamp * 1000).toLocaleString()}\n` +
          `   Reward Token: ${post.rewardToken}`
        );
      });
      
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Error getting posts by topic:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }


  async loadTopics() {
    try {
      const terminal = this.terminal.current;
      const { moneyPost, rewardTokens } = this.state;
      
      const topics = await moneyPost.listTopics();
      
      const topicsWithToken = await Promise.all(
        topics.map(async topic => {
          const attachedToken = topic.attachedToken;
          const token = rewardTokens.find(t => t.tokenAddress === attachedToken);
          return {
            ...topic,
            tokenName: token ? token.name : 'None'
          };
        })
      );
      
      this.setState({ topics: topicsWithToken });
      
      terminal.pushToStdout('[[header]]=== Topics ===[[/header]]');
      topicsWithToken.forEach((topic, index) => {
        terminal.pushToStdout(
          `${index + 1}. ${topic.name} (${topic.topicId})\n` +
          `   Token: ${topic.tokenName || 'Not assigned'} (${topic.attachedToken || 'None'})`
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

  async attachTopicToUPC(topicId, upcCode) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      terminal.pushToStdout(`Attaching topic ${topicId} to UPC ${upcCode}...`);
      const tx = await moneyPost.attachTopicToUPC(topicId, upcCode);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Topic attached to UPC successfully![[/success]]`);
      
      await this.loadTopics();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Attach topic to UPC error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async detachTopicFromUPC(topicId) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      terminal.pushToStdout(`Detaching topic ${topicId} from UPC...`);
      const tx = await moneyPost.detachTopicFromUPC(topicId);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Topic detached from UPC successfully![[/success]]`);
      
      await this.loadTopics();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Detach topic from UPC error:", error);
    } finally {
      this.setState({ isProgressing: false });
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
          ethers.utils.parseEther(rewardAmount.toString()),
          ethers.BigNumber.from(exchangeRate.toString()),
          0
        );
        await tx.wait();
        terminal.pushToStdout(`[[success]]Token added successfully![[/success]]`);
      } else if (action === 'remove') {
        terminal.pushToStdout(`Removing reward token: ${tokenAddress}...`);
        const tx = await moneyPost.manageRewardToken(
          tokenAddress,
          "",
          ethers.constants.Zero,
          ethers.constants.Zero,
          1
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
          2
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

  async addTopic(name, tokenAddress) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      terminal.pushToStdout(`Adding topic: ${name}...`);
      const tx = await moneyPost.addTopic(name, tokenAddress);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Topic added successfully![[/success]]`);
      
      await this.loadTopics();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Add topic error:", error);
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
      console.error("Remove topic error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async attachTopicToToken(topicId, tokenAddress) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      terminal.pushToStdout(`Attaching topic ${topicId} to token ${tokenAddress}...`);
      const tx = await moneyPost.attachTopicToToken(topicId, tokenAddress);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Topic attached successfully![[/success]]`);
      
      await this.loadTopics();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Attach topic error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async detachTopicFromToken(topicId) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      terminal.pushToStdout(`Detaching topic ${topicId} from token...`);
      const tx = await moneyPost.detachTopicFromToken(topicId);
      await tx.wait();
      terminal.pushToStdout(`[[success]]Topic detached successfully![[/success]]`);
      
      await this.loadTopics();
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.reason || error.message}[[/error]]`);
      console.error("Detach topic error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async submitPost(url, topicId) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost } = this.state;
      
      const urlHash = sha256(url);
      const bytes32Hash = ethers.utils.hexZeroPad('0x' + urlHash, 32);
      
      terminal.pushToStdout(`Submitting post: ${url}`);
      terminal.pushToStdout(`For topic: ${topicId}`);
      
      const tx = await moneyPost.submitPost(
        bytes32Hash,
        url,
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

  async swapTokens(fromToken, amount) {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost, flipToken } = this.state;
      
      terminal.pushToStdout(`Swapping ${amount} of token ${fromToken} to FLIP...`);
      
      const tx = await moneyPost.swapTokens(
        fromToken,
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
  
      terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Tokens deposited successfully![[/success]]`);
      
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
        const tx = await moneyPost.removeBlockedAddress(addresses[0]);
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
  
      const balance = await tokenContract.balanceOf(MONEYPOST_ADDRESS);
      const formattedBalance = ethers.utils.formatEther(balance);
      
      terminal.pushToStdout(
        `[[success]]Remaining Reward Balance: ${formattedBalance}[[/success]]`
      );
      
      return balance;
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Remaining Reward Balance error:", error);
      return ethers.constants.Zero;
    } finally {
      this.setState({ isProgressing: false });
    }
  }

  async getFlipBalance() {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const { moneyPost, flipToken } = this.state;
      
      if (!flipToken) {
        throw new Error("FLIP token address not set");
      }
      
      const balance = await moneyPost.getFlipBalance();
      const formattedBalance = ethers.utils.formatEther(balance);
      
      terminal.pushToStdout(
        `[[success]]Contract FLIP balance: ${formattedBalance}[[/success]]`
      );
      
      return balance;
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("FLIP balance error:", error);
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
      await this.checkAllowance(tokenAddress);
      
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
    const { topics } = this.state;
    
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
          label: "Topic",
          name: "topicId",
          type: "select",
          required: true,
          options: topics.map(topic => ({
            value: topic.topicId,
            label: `${topic.name} (${topic.tokenName || 'No token'})`
          }))
        }
      ],
      ({ url, topicId }) => {
        this.submitPost(url, topicId);
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
    const { rewardTokens } = this.state;
    
    this.showCyberpunkModal(
      "ADD TOPIC",
      [
        { label: "Topic Name", name: "name", required: true },
        {
          label: "Attached Token",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          }))
        }
      ],
      ({ name, tokenAddress }) => {
        this.addTopic(name, tokenAddress);
      }
    );
  }

  showAttachTopicGUI() {
    const { topics, rewardTokens } = this.state;
    
    this.showCyberpunkModal(
      "ATTACH TOPIC TO TOKEN",
      [
        {
          label: "Topic",
          name: "topicId",
          type: "select",
          required: true,
          options: topics.map(topic => ({
            value: topic.topicId,
            label: `${topic.name} (${topic.topicId})`
          }))
        },
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
      ({ topicId, tokenAddress }) => {
        this.attachTopicToToken(topicId, tokenAddress);
      }
    );
  }

  showDetachTopicGUI() {
    const { topics } = this.state;
    
    this.showCyberpunkModal(
      "DETACH TOPIC FROM TOKEN",
      [
        {
          label: "Topic",
          name: "topicId",
          type: "select",
          required: true,
          options: topics.filter(t => t.attachedToken).map(topic => ({
            value: topic.topicId,
            label: `${topic.name} (${topic.topicId})`
          }))
        }
      ],
      ({ topicId }) => {
        this.detachTopicFromToken(topicId);
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
            label: `${topic.name} (${topic.topicId})`
          }))
        }
      ],
      ({ topicId }) => {
        this.removeTopic(topicId);
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
    const { rewardTokens, flipToken } = this.state;
    
    this.showCyberpunkModal(
      "SWAP TOKENS",
      [
        {
          label: "From Token",
          name: "fromToken",
          type: "select",
          required: true,
          options: rewardTokens
            .filter(token => token.tokenAddress !== flipToken)
            .map(token => ({
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
      ({ fromToken, amount }) => {
        this.swapTokens(fromToken, amount);
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
    const { rewardTokens, flipToken } = this.state;
    
    this.showCyberpunkModal(
      "APPROVE TOKENS",
      [
        {
          label: "Token",
          name: "tokenAddress",
          type: "select",
          required: true,
          options: [
            ...rewardTokens.map(token => ({
              value: token.tokenAddress,
              label: `${token.name} (${token.tokenAddress})`
            })),
            ...(flipToken ? [{
              value: flipToken,
              label: `FLIP (${flipToken})`
            }] : [])
          ]
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


async getRewardTokenBalance(tokenAddress) {
  const terminal = this.terminal.current;
  this.setState({ isProgressing: true });
  
  try {
    const { moneyPost } = this.state;
    
    const balance = await moneyPost.getRewardTokenBalance(tokenAddress);
    const formattedBalance = ethers.utils.formatEther(balance);
    
    terminal.pushToStdout(
      `[[success]]Remaining Reward Balance: ${formattedBalance}[[/success]]`
    );
    
    return balance;
  } catch (error) {
    terminal.pushToStdout(
      `[[error]]Error: ${error.reason || error.message}[[/error]]`
    );
    console.error("Remaining Reward Balance error:", error);
    return ethers.constants.Zero;
  } finally {
    this.setState({ isProgressing: false });
  }
}

// Update the showTokenBalanceGUI to use the new function
showTokenBalanceGUI() {
  const { rewardTokens, flipToken } = this.state;
  
  this.showCyberpunkModal(
    "CHECK CONTRACT TOKEN BALANCE",
    [
      {
        label: "Token",
        name: "tokenAddress",
        type: "select",
        required: true,
        options: [
          ...rewardTokens.map(token => ({
            value: token.tokenAddress,
            label: `${token.name} (${token.tokenAddress})`
          })),
          ...(flipToken ? [{
            value: flipToken,
            label: `FLIP (${flipToken})`
          }] : [])
        ]
      }
    ],
    ({ tokenAddress }) => {
      this.getRewardTokenBalance(tokenAddress);
    }
  );
}









  showFlipBalanceGUI() {
    this.showCyberpunkModal(
      "CHECK FLIP BALANCE",
      [],
      () => {
        this.getFlipBalance();
      }
    );
  }

  showAttachTopicToUPCGUI() {
    const { topics, userUpcs } = this.state;
    
    this.showCyberpunkModal(
      "ATTACH TOPIC TO UPC",
      [
        {
          label: "Topic",
          name: "topicId",
          type: "select",
          required: true,
          options: topics.map(topic => ({
            value: topic.topicId,
            label: `${topic.name} (${topic.topicId})`
          }))
        },
        {
          label: "UPC Code",
          name: "upcCode",
          type: "select",
          required: true,
          options: userUpcs.map(upc => ({
            value: upc,
            label: upc
          }))
        }
      ],
      ({ topicId, upcCode }) => {
        this.attachTopicToUPC(topicId, upcCode);
      }
    );
  }







async showTopicsByUpcGUI(upcCode) {
  const { userUpcs } = this.state;
  


      try {
        this.setState({ isProgressing: true });
        const { moneyPost } = this.state;
        
        const topics = await moneyPost.getTopicsForUPC(upcCode);
        
        if (topics.length === 0) {
          this.showModal(`
            <div style="text-align: center; padding: 20px;">
              <h3 style="color: #00f0ff;">No topics found for UPC: ${upcCode}</h3>
            </div>
          `);
          return;
        }
        
        const content = `
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #00f0ff; margin-bottom: 5px; text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);">Topics for UPC: ${upcCode}</h2>
            <div style="color: #e0e0e0; margin-bottom: 15px;">Total Topics: ${topics.length}</div>
          </div>
          
          <div style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
            ${topics.map((topic, index) => `
              <div style="
                background: #1a1a2e;
                border-left: 3px solid #00f0ff;
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 4px;
                box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
              ">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #00f0ff; font-weight: bold;">Topic #${index + 1}</span>
                  <span style="color: #FFC107;">${new Date(topic.createdAt * 1000).toLocaleString()}</span>
                </div>
                
                <div style="margin-bottom: 10px;">
                  <div style="color: #e0e0e0; font-size: 14px; margin-bottom: 5px;">Name:</div>
                  <div style="color: #9C27B0; word-break: break-all;">${topic.name}</div>
                </div>
                
                <div style="margin-bottom: 10px;">
                  <div style="color: #e0e0e0; font-size: 14px; margin-bottom: 5px;">Topic ID:</div>
                  <div style="color: #4CAF50;">${topic.topicId}</div>
                </div>
                
                <div style="margin-bottom: 5px;">
                  <div style="color: #e0e0e0; font-size: 14px; margin-bottom: 5px;">Attached Token:</div>
                  <div style="color: #FF9800;">${topic.attachedToken || 'None'}</div>
                </div>

                <div style="margin-top: 15px;">
                  <button onclick="document.getElementById('topic-content-${index}').style.display = 
                    document.getElementById('topic-content-${index}').style.display === 'none' ? 'block' : 'none';
                    this.textContent = document.getElementById('topic-content-${index}').style.display === 'none' ? 'Show Posts' : 'Hide Posts'"
                    style="
                      background: #1a1a2e;
                      border: 1px solid #00f0ff;
                      color: #00f0ff;
                      padding: 5px 10px;
                      border-radius: 4px;
                      cursor: pointer;
                      margin-bottom: 10px;
                    ">
                    Show Posts
                  </button>
                  
                  <button onclick="window.parent.postMessage({ type: 'showPostsForTopic', topicId: '${topic.topicId}' }, '*')"
                    style="
                      background: #1a1a2e;
                      border: 1px solid #4CAF50;
                      color: #4CAF50;
                      padding: 5px 10px;
                      border-radius: 4px;
                      cursor: pointer;
                      margin-left: 10px;
                    ">
                    View All Posts
                  </button>
                  
                  <div id="topic-content-${index}" style="display: none; margin-top: 10px;">
                    <div style="color: #e0e0e0; font-style: italic; margin-bottom: 10px;">
                      Loading posts for this topic...
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;

        this.showModal(content);
        
        // Listen for messages from the iframe
        window.addEventListener('message', (event) => {
          if (event.data.type === 'showPostsForTopic') {
            this.showPostsGUI(event.data.topicId);
          }
        });

      } catch (error) {
        this.terminal.current.pushToStdout(
          `[[error]]Error: ${error.reason || error.message}[[/error]]`
        );
        console.error("Error getting topics for UPC:", error);
      } finally {
        this.setState({ isProgressing: false });
      }
    

}














  showDetachTopicFromUPCGUI() {
    const { topics } = this.state;
    
    this.showCyberpunkModal(
      "DETACH TOPIC FROM UPC",
      [
        {
          label: "Topic",
          name: "topicId",
          type: "select",
          required: true,
          options: topics.filter(t => t.upcCode).map(topic => ({
            value: topic.topicId,
            label: `${topic.name} (Attached to: ${topic.upcCode})`
          }))
        }
      ],
      ({ topicId }) => {
        this.detachTopicFromUPC(topicId);
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
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none', // For Firefox
        msOverflowStyle: 'none', // For IE
        '&::-webkit-scrollbar': { // For Chrome/Safari
          display: 'none'
        }
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
                flexShrink: 0
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
                onClick={() => this.showFlipBalanceGUI()}
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
                CHECK FLIP BALANCE
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
                  <button 
                    onClick={() => this.getRewardTokenBalance(token.tokenAddress)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #00f0ff',
                      color: '#00f0ff',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginTop: '5px'
                    }}
                  >
                    Check Remaining Rewards
                  </button>
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
                onClick={() => this.showAttachTopicGUI()}
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
                ATTACH TOKEN
              </button>
              <button
                onClick={() => this.showDetachTopicGUI()}
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
                DETACH TOKEN
              </button>
              <button
                onClick={() => this.showAttachTopicToUPCGUI()}
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
                ATTACH TO UPC
              </button>
              <button
                onClick={() => this.showDetachTopicFromUPCGUI()}
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
                DETACH FROM UPC
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
                    Token: {topic.tokenName || 'None'} ({topic.attachedToken || 'None'})
                  </div>
                  {topic.upcCode && (
                    <div style={{ color: '#4CAF50' }}>
                      UPC: {topic.upcCode}
                    </div>
                  )}
                  <div style={{ color: '#607D8B' }}>
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
              description: 'Submit a post (url, topicId)',
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
            // Add this to your commands in the render() method:
            gposts: {
              description: 'Get posts by topic (GUI version)',
              fn: async () => {
                this.showPostsGUI();
              }
            },
            forum: {
              description: 'Get topics for a UPC (upcCode)',
              fn: async (upcCode) => { 
                   if(!upcCode) {
                      upcCode = this.props.code;
                   }   
                   await this.showTopicsByUpcGUI(upcCode)
              }
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
              description: 'Swap tokens (fromToken, amount)',
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
            flipbalance: {
              description: 'Check contract FLIP balance',
              fn: async () => await this.getFlipBalance()
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
            },
            addtopic: {
              description: 'Add a topic (name, tokenAddress)',
              fn: async (...args) => await this.addTopic(...args)
            },
            removetopic: {
              description: 'Remove a topic (topicId)',
              fn: async (...args) => await this.removeTopic(...args)
            },
            attachtopic: {
              description: 'Attach topic to token (topicId, tokenAddress)',
              fn: async (...args) => await this.attachTopicToToken(...args)
            },
            detachtopic: {
              description: 'Detach topic from token (topicId)',
              fn: async (...args) => await this.detachTopicFromToken(...args)
            },
            attachupc: {
              description: 'Attach topic to UPC (topicId, upcCode)',
              fn: async (...args) => await this.attachTopicToUPC(...args)
            },
            detachupc: {
              description: 'Detach topic from UPC (topicId)',
              fn: async (...args) => await this.detachTopicFromUPC(...args)
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
