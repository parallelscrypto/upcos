import React, { Component } from 'react';
import { ethers } from "ethers";
import Terminal from 'react-console-emulator';
import MemecoinFactoryABI from '../etc/rawmaterial/MemecoinFactory.json';

const MEMECOIN_FACTORY_ADDRESS = "0x843e40211C088F429b1D35dd5f641CE0b05F4496";

class MemecoinTerminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      memecoinFactory: null,
      provider: null,
      signer: null,
      isProgressing: false,
      isConnected: false,
      connectionError: null,
      templates: [
        { id: 0, name: "Standard Memecoin" },
        { id: 1, name: "Mintable Memecoin" },
        { id: 2, name: "Tax Memecoin" }
      ],
      userTokens: []
    };
    this.terminal = React.createRef();
    this.modalContainer = null;
  }

  async componentDidMount() {
    this.createModalContainer();
    await this.checkWalletConnection();
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
      memecoinFactory: null,
      provider: null,
      signer: null,
      isConnected: false,
      userTokens: []
    });
    this.terminal.current.pushToStdout('[[warning]]Wallet disconnected[[/warning]]');
  }

  async loadBlockchainData() {
    this.setState({ isProgressing: true, connectionError: null });
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      
      const memecoinFactory = new ethers.Contract(
        MEMECOIN_FACTORY_ADDRESS,
        MemecoinFactoryABI.abi,
        signer
      );

      await memecoinFactory.getUserTokenCount(account);

      this.setState({ 
        memecoinFactory,
        provider,
        signer,
        account,
        isConnected: true
      });

      this.terminal.current.pushToStdout(
        `[[success]]Connected to account: ${account}[[/success]]`
      );

      await this.loadUserTokens();
      
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

  createModalContainer() {
    const existingModal = document.getElementById('memecoin-modal-container');
    if (existingModal) {
      document.body.removeChild(existingModal);
    }

    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'memecoin-modal-container';
    this.modalContainer.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.7);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
    document.body.appendChild(this.modalContainer);
  }

  showModal(content) {
    this.modalContainer.innerHTML = `
      <div style="
        background: #121212;
        padding: 20px;
        border-radius: 5px;
        border: 1px solid #00f0ff;
        box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
        color: #e0e0e0;
        width: 80%;
        max-width: 600px;
        position: relative;
      ">
        <button id="close-modal" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff3d3d;
          color: white;
          border: none;
          border-radius: 3px;
          padding: 5px 10px;
          cursor: pointer;
        ">X</button>
        ${content}
      </div>
    `;

    this.modalContainer.style.display = 'flex';
    
    document.getElementById('close-modal').addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
    });
  }

  showCreateTokenModal() {
    const content = `
      <h2 style="color: #00f0ff; text-align: center; margin-bottom: 20px;">CREATE NEW MEMECOIN</h2>
      <form id="create-token-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #00f0ff;">Token Type</label>
          <select name="templateId" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid #00f0ff;
            color: #e0e0e0;
            border-radius: 3px;
          ">
            ${this.state.templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #00f0ff;">Token Name</label>
          <input type="text" name="name" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid #00f0ff;
            color: #e0e0e0;
            border-radius: 3px;
          ">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #00f0ff;">Token Symbol</label>
          <input type="text" name="symbol" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid #00f0ff;
            color: #e0e0e0;
            border-radius: 3px;
          ">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #00f0ff;">Initial Supply</label>
          <input type="number" name="initialSupply" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid #00f0ff;
            color: #e0e0e0;
            border-radius: 3px;
          ">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #00f0ff;">Extra Parameters (Hex)</label>
          <input type="text" name="extraParams" style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid #00f0ff;
            color: #e0e0e0;
            border-radius: 3px;
          " placeholder="0x... (only needed for Tax Memecoin)">
        </div>
        
        <button type="submit" style="
          background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%);
          border: none;
          border-radius: 3px;
          color: white;
          padding: 12px 24px;
          width: 100%;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 3px 5px 2px rgba(255, 105, 135, .3);
        ">Create Token</button>
      </form>
    `;

    this.showModal(content);

    document.getElementById('create-token-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        templateId: formData.get('templateId'),
        name: formData.get('name'),
        symbol: formData.get('symbol'),
        initialSupply: formData.get('initialSupply'),
        extraParams: formData.get('extraParams') || '0x'
      };
      
      this.createMemecoin(
        data.templateId, 
        data.name, 
        data.symbol, 
        data.initialSupply, 
        data.extraParams
      );
      this.modalContainer.style.display = 'none';
    });
  }

  async loadUserTokens() {
    try {
      const tokenCount = await this.state.memecoinFactory.getUserTokenCount(this.state.account);
      const tokens = [];
      
      for (let i = 0; i < tokenCount; i++) {
        const tokenAddress = await this.state.memecoinFactory.userTokens(this.state.account, i);
        tokens.push(tokenAddress);
      }
      
      this.setState({ userTokens: tokens });
    } catch (error) {
      console.error("Error loading user tokens:", error);
    }
  }

  createMemecoin = async (templateId, name, symbol, initialSupply, extraParams = '0x') => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      if (!this.state.isConnected || !this.state.memecoinFactory) {
        throw new Error("Not connected to wallet or contract not initialized");
      }

      terminal.pushToStdout(`Creating ${name} (${symbol})...`);
      
      let extraBytes = extraParams;
      if (extraParams && !extraParams.startsWith('0x')) {
        extraBytes = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(extraParams));
      }

      const gasEstimate = await this.state.memecoinFactory.estimateGas.createMemecoin(
        templateId,
        name,
        symbol,
        ethers.utils.parseUnits(initialSupply.toString(), 0),
        extraBytes,
        { value: ethers.utils.parseEther("0.01") }
      );

      const gasLimit = gasEstimate.mul(120).div(100);

      const tx = await this.state.memecoinFactory.createMemecoin(
        templateId,
        name,
        symbol,
        ethers.utils.parseUnits(initialSupply.toString(), 0),
        extraBytes,
        { 
          value: ethers.utils.parseEther("0.01"),
          gasLimit: gasLimit
        }
      );

      terminal.pushToStdout(`[[success]]Transaction sent! Waiting for confirmation...[[/success]]`);
      terminal.pushToStdout(`Transaction hash: ${tx.hash}`);
      
      await tx.wait();
      
      terminal.pushToStdout(`[[success]]Token created successfully![[/success]]`);
      
      await this.loadUserTokens();
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
      console.error("Token creation error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  getTokenDetails = async (tokenAddress) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const erc20Abi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)"
      ];
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        erc20Abi,
        this.state.signer
      );
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply()
      ]);
      
      terminal.pushToStdout('<span style="color:#FF5722;font-weight:bold">=== Token Details ===</span>');
      terminal.pushToStdout(`<span style="color:#FFC107">Address:</span> <span style="color:#64B5F6">${tokenAddress}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Name:</span> <span style="color:#64B5F6">${name}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Symbol:</span> <span style="color:#64B5F6">${symbol}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Decimals:</span> <span style="color:#64B5F6">${decimals}</span>`);
      terminal.pushToStdout(`<span style="color:#FFC107">Total Supply:</span> <span style="color:#64B5F6">${ethers.utils.formatUnits(totalSupply, decimals)}</span>`);
    } catch (error) {
      terminal.pushToStdout(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  listTemplates = async () => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      terminal.pushToStdout('[[header]]=== Available Templates ===[[/header]]');
      
      for (const template of this.state.templates) {
        terminal.pushToStdout(`- ${template.id}: ${template.name}`);
      }
      
      terminal.pushToStdout('[[info]]Use "createtoken" command to create a new token[[/info]]');
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  listUserTokens = async () => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      if (this.state.userTokens.length === 0) {
        terminal.pushToStdout('[[info]]You have not created any tokens yet[[/info]]');
        return;
      }
      
      terminal.pushToStdout('[[header]]=== Your Tokens ===[[/header]]');
      
      for (const tokenAddress of this.state.userTokens) {
        terminal.pushToStdout(`- ${tokenAddress}`);
      }
      
      terminal.pushToStdout('[[info]]Use "tokeninfo <address>" to get details[[/info]]');
    } catch (error) {
      terminal.pushToStdout(`[[error]]Error: ${error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  render() {
    const welcomeMsg = `
      [[header]]
      =============================================
      Memecoin Factory Terminal
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
        padding: '20px'
      }}>
        <Terminal
          style={{
            minHeight: "75vh",
            backgroundColor: "#1a1a2e",
            zIndex: "99",
            borderRadius: "5px",
            padding: "10px",
            fontFamily: "monospace"
          }}
          ref={this.terminal}
          commands={{
            connect: {
              description: 'Connect your wallet',
              fn: async () => await this.connectWallet()
            },
            mint: {
              description: 'Open GUI for creating new tokens',
              fn: () => {
                if (!this.state.isConnected) {
                  this.terminal.current.pushToStdout('[[error]]Please connect your wallet first[[/error]]');
                  return;
                }
                this.showCreateTokenModal();
              }
            },
            createtoken: {
              description: 'Create new memecoin (templateId, name, symbol, supply, [extraParams])',
              fn: async (...args) => await this.createMemecoin(...args)
            },
            templates: {
              description: 'List available token templates',
              fn: async () => await this.listTemplates()
            },
            mytokens: {
              description: 'List all tokens you created',
              fn: async () => await this.listUserTokens()
            },
            ti: {
              description: 'Get token details by address',
              fn: async (address) => await this.getTokenDetails(address)
            }
          }}
          dangerMode={true}
          welcomeMessage={welcomeMsg}
          ignoreCommandCase={true}
          promptLabel={'user@memecoinfactory:~$'}
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

export default MemecoinTerminal;
