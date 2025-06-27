import React, { Component } from 'react';
import { ethers } from 'ethers';

class UPCScriptCompiler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'compiler',
      inputText: '',
      outputText: '',
      statusMessage: 'READY',
      isError: false,
      isStatic: true,
      isCompiling: false,
      currentTime: '',
      currentDate: '',
      provider: null,
      compiledData: null,
      debugMessages: [],
      showDebug: false,
      isConnected: false,
      currentAccount: null
    };

    this.defaultButtonStyle = {
      background: "#000000",
      color: "green",
      height: "10vh",
      width: "20vw",
      fontSize: "15px"
    };

    this.rawMaterialContractAddress = '0x2C343942548319cCfc05666FF15d73E8569FaEdf';
    this.popitContractAddress = '0xbF5BFa55Df303d96a1f6DAb929DD69226086D8dC';
    
    this.rawMaterialAbi = [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "upcId",
            "type": "string"
          }
        ],
        "name": "upcInfo",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "staker",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "og",
                "type": "address"
              },
              {
                "internalType": "bytes32",
                "name": "upcHash",
                "type": "bytes32"
              },
              {
                "internalType": "string",
                "name": "word",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "ipfs",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "vr",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "humanReadableName",
                "type": "string"
              },
              {
                "internalType": "bool",
                "name": "minted",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "bought",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "tld",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "createdTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "latestTimestamp",
                "type": "uint256"
              }
            ],
            "internalType": "struct UPCNFT.NFTMeta",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "nftId",
            "type": "uint256"
          }
        ],
        "name": "nftInfo",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "staker",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "og",
                "type": "address"
              },
              {
                "internalType": "bytes32",
                "name": "upcHash",
                "type": "bytes32"
              },
              {
                "internalType": "string",
                "name": "word",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "ipfs",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "vr",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "humanReadableName",
                "type": "string"
              },
              {
                "internalType": "bool",
                "name": "minted",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "bought",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "tld",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "createdTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "latestTimestamp",
                "type": "uint256"
              }
            ],
            "internalType": "struct UPCNFT.NFTMeta",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    this.popitAbi = [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_human_readable_name",
            "type": "string"
          }
        ],
        "name": "getPopByGlobalName",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "link",
                "type": "string"
              },
              {
                "internalType": "bytes32",
                "name": "hash",
                "type": "bytes32"
              },
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "string",
                "name": "upc",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "human_readable_name",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "updated",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
              }
            ],
            "internalType": "struct Popit.Pop[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    this.previewFrameRef = React.createRef();
    this.debugContentRef = React.createRef();
  }

  componentDidMount() {
    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);
    
    if (!this.state.provider && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      this.setState({ provider });
    }

    window.addEventListener('message', this.handleFrameMessage);
    
    // Auto-connect wallet if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      this.initBlockchain();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timeInterval);
    window.removeEventListener('message', this.handleFrameMessage);
  }

  logDebug = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const newMessage = `[${timestamp}] ${message}`;
    this.setState(prevState => ({
      debugMessages: [...prevState.debugMessages, newMessage]
    }), () => {
      if (this.debugContentRef.current) {
        this.debugContentRef.current.scrollTop = this.debugContentRef.current.scrollHeight;
      }
    });
  };

  toggleDebug = () => {
    this.setState(prevState => ({
      showDebug: !prevState.showDebug
    }));
  };

  handleFrameMessage = (event) => {
    if (event.data.type === 'FRAME_READY' && this.state.compiledData) {
      this.sendDataToFrame();
    }
  };

  sendDataToFrame = () => {
    if (!this.previewFrameRef.current || !this.state.compiledData) return;
    
    try {
      this.previewFrameRef.current.contentWindow.postMessage({
        type: 'UPDATE_DATA',
        data: this.state.compiledData
      }, 'https://x7vvqfuva5vke4mmmt5w7bma4apn5yjyl2c2y2f45uwy5xwlzmrq.arweave.net');
      
      this.showNotification('Data sent to uploader!');
    } catch (e) {
      console.error('Error sending data to upload frame:', e);
      this.showStatus('UPLOADER COMMUNICATION ERROR', true);
    }
  };

  updateTime = () => {
    const now = new Date();
    this.setState({
      currentTime: now.toLocaleTimeString(),
      currentDate: now.toLocaleDateString()
    });
  };

  switchTab = (tab) => {
    this.setState({ activeTab: tab }, () => {
      if (tab === 'upload' && this.state.compiledData) {
        setTimeout(() => {
          this.sendDataToFrame();
        }, 500);
      }
    });
  };

  showStatus = (message, isError = false) => {
    this.setState({ statusMessage: message, isError });
    setTimeout(() => {
      this.setState({ statusMessage: 'READY', isError: false });
    }, 3000);
  };

  showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  };

  handleInputChange = (e) => {
    this.setState({ inputText: e.target.value });
  };

  handleStaticToggle = (e) => {
    this.setState({ isStatic: e.target.checked });
  };

  clearInputs = () => {
    this.setState({ 
      inputText: '', 
      outputText: '',
      compiledData: null
    });
    this.showStatus('CLEARED');
  };

  copyToClipboard = () => {
    navigator.clipboard.writeText(this.state.outputText);
    this.showStatus('JSON COPIED TO CLIPBOARD');
  };

  downloadFile = () => {
    if (!this.state.outputText) {
      this.showStatus('NO CONTENT TO DOWNLOAD', true);
      return;
    }
    
    const blob = new Blob([this.state.outputText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'upcscript-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showStatus('FILE DOWNLOADED');
  };

  loadExample = () => {
    const exampleText = `config.button.2.title=nft.1.name
config.button.2.payload=nft.1.vr
config.button.2.background=orange
config.button.2.color=black

config.button.3.title=nft.13.name
config.button.3.payload=nft.13.vr
config.button.3.background=orange
config.button.3.color=black

config.button.7.title=nft.14.name
config.button.7.payload=nft.14.vr
config.button.7.background=pink
config.button.7.color=white

config.button.8.title=nft.50.name
config.button.8.payload=nft.50.vr
config.button.8.background=pink
config.button.8.color=white

config.button.9.title=nft.6.owner
config.button.9.payload=nft.6.vr
config.button.9.background=red
config.button.9.color=blue

config.bg=https://vl6eryvdtmyd7euz34ailk6cn4c4hdnngj2ru4kefgne5hgrwowq.arweave.net/qvxI4qObMD-Smd8AhavCbwXDja0ydRpxRCmaTpzRs60
config.hdd=https://app.ardrive.io/#/drives/8324c70e-a3c4-4dc5-b42c-1691464daef7?name=africans_unite_worldwide
config.ai=https://www.chatgot.io/chat/?utm_source=chatgot_www
config.fund=0xebFA44390dC4B8b1576d244c3F75b34DC36e7Bcc
config.serialbox=0x62f3F16C014b99aE6268E2D205e306b352229d2c

config.pac0.zero=https://www.minimax.io/audio
config.pac1.one=https://youtu.be/9uLiDNYcoKk?si=67Vog2BCybZKj2pg
config.pac2.two=https://youtu.be/kdMCs0cyHwE?si=BqCstxgtwnsrIR-r
config.pac3.three=https://youtu.be/YjGarSaBsog?si=5VWhyZPTcpQ-kbf9

config.show=>>>https://youtu.be/Op60PzpsVQQ?si=oeEXHSYKm97tDk1B>https://youtu.be/XrnlPkW5fGA?si=SOHBpG0-jM6iBClV`;
    
    this.setState({ inputText: exampleText }, () => {
      this.showStatus('EXAMPLE LOADED');
    });
  };

  shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  initBlockchain = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0];
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      this.setState({
        provider,
        currentAccount,
        isConnected: true
      });
      
      this.logDebug(`Connected to wallet: ${currentAccount}`);
      
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.setState({
            currentAccount: null,
            isConnected: false
          });
          this.logDebug('Wallet disconnected');
        } else {
          this.setState({
            currentAccount: accounts[0]
          });
          this.logDebug(`Account changed to: ${accounts[0]}`);
        }
      });
      
      window.ethereum.on('chainChanged', (chainId) => {
        this.logDebug(`Chain changed to: ${chainId}`);
        window.location.reload();
      });

      const network = await provider.getNetwork();
      this.logDebug(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
      if (network.chainId !== 137) {
        this.logDebug('Warning: Not connected to Polygon network');
        alert('Please connect to Polygon network in your wallet');
      }
    } catch (error) {
      console.error('Error connecting to blockchain:', error);
      this.logDebug(`Error connecting to blockchain: ${error.message}`);
      this.setState({ isConnected: false });
      alert('Failed to connect wallet. Please make sure you have a wallet like Brave Wallet installed.');
    }
  };

  connectWallet = async () => {
    if (!this.state.currentAccount) {
      await this.initBlockchain();
    }
  };

  resolveDynamicValue = async (value) => {
    if (!this.state.isStatic || typeof value !== 'string') return value;
    
    if (value.startsWith('upc.')) {
      const parts = value.split('.');
      if (parts.length < 3) {
        this.logDebug(`Invalid UPC query format: ${value}`);
        return `**ERROR upc.missingParts **`;
      }

      const upcId = parts[1];
      const field = parts.slice(2).join('.');
      
      try {
        if (!this.state.provider) {
          throw new Error('Contract not initialized');
        }
        
        const rawMaterial = new ethers.Contract(
          this.rawMaterialContractAddress,
          this.rawMaterialAbi,
          this.state.provider
        );
        
        const result = await rawMaterial.upcInfo(upcId);
        this.logDebug(`UPC Info Result: ${JSON.stringify(result)}`);
        
        const fieldMap = {
          'tokenId': result.tokenId.toString(),
          'staker': result.staker,
          'og': result.og,
          'upcHash': result.upcHash,
          'word': result.word,
          'ipfs': result.ipfs,
          'vr': result.vr,
          'humanReadableName': result.humanReadableName,
          'minted': result.minted,
          'bought': result.bought,
          'tld': result.tld.toString(),
          'createdTimestamp': result.createdTimestamp.toString(),
          'latestTimestamp': result.latestTimestamp.toString(),
          'name': result.humanReadableName,
          'owner': result.staker,
          'id': result.tokenId.toString()
        };
        
        if (field in fieldMap) {
          const resolvedValue = fieldMap[field];
          this.logDebug(`Resolved upc.${upcId}.${field} to: ${resolvedValue}`);
          return resolvedValue;
        } else {
          this.logDebug(`Invalid field requested for UPC: ${field}`);
          return `**ERROR upc.invalidField.${field} **`;
        }
      } catch (error) {
        this.logDebug(`UPC Query Failed: ${error.message}`);
        return `**ERROR upc.queryFailed.${upcId}.${field} **`;
      }
    }
    
    if (value.startsWith('nft.')) {
      const parts = value.split('.');
      if (parts.length < 3) {
        this.logDebug(`Invalid NFT query format: ${value}`);
        return `**ERROR nft.missingParts **`;
      }

      const nftId = parts[1];
      const field = parts.slice(2).join('.');
      
      try {
        if (!this.state.provider) {
          throw new Error('Contract not initialized');
        }
        
        const rawMaterial = new ethers.Contract(
          this.rawMaterialContractAddress,
          this.rawMaterialAbi,
          this.state.provider
        );
        
        const result = await rawMaterial.nftInfo(nftId);
        this.logDebug(`NFT Info Result: ${JSON.stringify(result)}`);
        
        const fieldMap = {
          'tokenId': result.tokenId.toString(),
          'staker': result.staker,
          'og': result.og,
          'upcHash': result.upcHash,
          'word': result.word,
          'ipfs': result.ipfs,
          'vr': result.vr,
          'humanReadableName': result.humanReadableName,
          'minted': result.minted,
          'bought': result.bought,
          'tld': result.tld.toString(),
          'createdTimestamp': result.createdTimestamp.toString(),
          'latestTimestamp': result.latestTimestamp.toString(),
          'name': result.humanReadableName,
          'owner': result.staker,
          'id': result.tokenId.toString()
        };
        
        if (field in fieldMap) {
          const resolvedValue = fieldMap[field];
          this.logDebug(`Resolved nft.${nftId}.${field} to: ${resolvedValue}`);
          return resolvedValue;
        } else {
          this.logDebug(`Invalid field requested for NFT: ${field}`);
          return `**ERROR nft.invalidField.${field} **`;
        }
      } catch (error) {
        this.logDebug(`NFT Query Failed: ${error.message}`);
        return `**ERROR nft.queryFailed.${nftId}.${field} **`;
      }
    }
    
    if (value.startsWith('ppl.name.')) {
      const parts = value.split('.');
      if (parts.length < 4) {
        this.logDebug(`Invalid ppl.name query format: ${value}`);
        return `**ERROR ppl.name.missingParts **`;
      }

      const pplName = parts[2];
      const field = parts[3];
      
      try {
        if (!this.state.provider) {
          throw new Error('Popit contract not initialized');
        }
        
        const popit = new ethers.Contract(
          this.popitContractAddress,
          this.popitAbi,
          this.state.provider
        );
        
        const result = await popit.getPopByGlobalName(pplName);
        this.logDebug(`Popit Result: ${JSON.stringify(result)}`);
        
        if (result.length === 0) {
          this.logDebug(`No pop found with name: ${pplName}`);
          return `**ERROR ppl.name.notFound.${pplName} **`;
        }
        
        const popData = result[0];
        
        const fieldMap = {
          'id': popData.id.toString(),
          'link': popData.link,
          'hash': popData.hash,
          'owner': popData.owner,
          'upc': popData.upc,
          'human_readable_name': popData.human_readable_name,
          'updated': popData.updated.toString(),
          'timestamp': popData.timestamp.toString(),
          'name': popData.human_readable_name
        };
        
        if (field in fieldMap) {
          const resolvedValue = fieldMap[field];
          this.logDebug(`Resolved ppl.name.${pplName}.${field} to: ${resolvedValue}`);
          return resolvedValue;
        } else {
          this.logDebug(`Invalid field requested for pop: ${field}`);
          return `**ERROR ppl.name.invalidField.${field} **`;
        }
      } catch (error) {
        this.logDebug(`Popit Query Failed: ${error.message}`);
        return `**ERROR ppl.name.queryFailed.${pplName}.${field} **`;
      }
    }

    return value;
  };

  compileToJson = async () => {
    this.setState({ isCompiling: true });
    
    try {
      const lines = this.state.inputText.split('\n');
      const config = {
        buttons: [],
        pacs: {
          pac0: {},
          pac1: {},
          pac2: {},
          pac3: {}
        }
      };

      const configValues = {};
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const equalPos = trimmedLine.indexOf('=');
        if (equalPos === -1) continue;

        const key = trimmedLine.substring(0, equalPos).trim();
        const value = trimmedLine.substring(equalPos + 1).trim();
        configValues[key] = value;
      }

      for (const [key, value] of Object.entries(configValues)) {
        if (key === "config.bg") {
          config.background = await this.resolveDynamicValue(value);
        }
        else if (key === "config.hdd") {
          config.hdd = await this.resolveDynamicValue(value);
        }
        else if (key === "config.ai") {
          config.ai = await this.resolveDynamicValue(value);
        }
        else if (key === "config.archive") {
          config.archive = await this.resolveDynamicValue(value);
        }
        else if (key === "config.serialbox") {
          config.serialbox = await this.resolveDynamicValue(value);
        }
        else if (key === "config.fund") {
          config.fund = await this.resolveDynamicValue(value);
        }
        else if (key === "config.show") {
          config.show = await this.resolveDynamicValue(value);
        }
        else {
          const buttonMatch = key.match(/config\.button\.([2-4789])\.(.+)/);
          if (buttonMatch) {
            const position = parseInt(buttonMatch[1], 10);
            const property = buttonMatch[2].trim();
            
            let button = config.buttons.find(b => b.position === position);
            if (!button) {
              button = {
                position: position,
                title: "",
                payload: "",
                style: {...this.defaultButtonStyle}
              };
              config.buttons.push(button);
            }
            
            if (property === "title") {
              button.title = await this.resolveDynamicValue(value);
            } else if (property === "payload") {
              button.payload = await this.resolveDynamicValue(value);
            } else if (property === "background") {
              button.style.background = await this.resolveDynamicValue(value);
            } else if (property === "color") {
              button.style.color = await this.resolveDynamicValue(value);
            } else if (Object.keys(this.defaultButtonStyle).includes(property)) {
              button.style[property] = await this.resolveDynamicValue(value);
            }
          }
          else {
            const pacMatch = key.match(/config\.pac(\d)\.(.+)/);
            if (pacMatch) {
              const pacNum = pacMatch[1];
              const command = pacMatch[2].trim();
              config.pacs[`pac${pacNum}`][command] = await this.resolveDynamicValue(value);
            }
          }
        }
      }

      config.buttons.sort((a, b) => a.position - b.position);

      const jsonOutput = JSON.stringify(config, null, 2);
      
      this.setState({ 
        outputText: jsonOutput,
        compiledData: jsonOutput,
        isCompiling: false
      });
      
      this.showStatus('COMPILATION SUCCESSFUL');
      this.logDebug('Compilation completed successfully');
      this.switchTab('upload');
    } catch (error) {
      console.error(error);
      this.setState({ isCompiling: false });
      this.showStatus('COMPILATION ERROR', true);
      this.logDebug(`Compilation error: ${error.message}`);
    }
  };

  render() {
    const { 
      activeTab, 
      inputText, 
      outputText, 
      statusMessage, 
      isError, 
      isStatic,
      isCompiling,
      currentTime,
      currentDate,
      debugMessages,
      showDebug,
      isConnected,
      currentAccount
    } = this.state;

    return (
      <div className="upcscript-compiler-container">
        <style>{`
          :root {
            --neon-orange: #ff5e00;
            --neon-blue: #05d9e8;
            --neon-purple: #d300c5;
            --dark-bg: #0d0221;
            --darker-bg: #05010a;
            --terminal-green: #00ff41;
            --glow: 0 0 10px;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', monospace;
            background-color: var(--dark-bg);
            color: var(--neon-blue);
            overflow: hidden;
            min-height: 100vh;
          }

          .upcscript-compiler-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
          }

          .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: linear-gradient(135deg, var(--darker-bg) 0%, var(--dark-bg) 100%);
            border: 1px solid var(--neon-orange);
            box-shadow: 0 0 20px var(--neon-orange);
          }

          .header {
            padding: 15px;
            text-align: center;
            background: rgba(5, 217, 232, 0.1);
            border-bottom: 1px solid var(--neon-blue);
            box-shadow: var(--glow) var(--neon-blue);
          }

          h1 {
            margin: 0;
            color: var(--neon-orange);
            text-shadow: 0 0 10px var(--neon-orange);
            font-size: 2rem;
            letter-spacing: 2px;
          }

          .subtitle {
            color: var(--neon-blue);
            text-shadow: 0 0 5px var(--neon-blue);
            margin-top: 5px;
            font-size: 0.9rem;
          }

          .tabs {
            display: flex;
            background: var(--darker-bg);
            border-bottom: 1px solid var(--neon-orange);
          }

          .tab {
            padding: 12px 15px;
            cursor: pointer;
            background: rgba(255, 94, 0, 0.2);
            border-right: 1px solid var(--neon-orange);
            transition: all 0.3s;
            font-weight: bold;
            font-size: 0.9rem;
            white-space: nowrap;
          }

          .tab:hover {
            background: rgba(255, 94, 0, 0.4);
            color: white;
          }

          .tab.active {
            background: var(--neon-orange);
            color: white;
            box-shadow: 0 0 15px var(--neon-orange);
          }

          .tab-content {
            display: none;
            flex: 1;
            padding: 15px;
            overflow: auto;
          }

          .tab-content.active {
            display: flex;
            flex-direction: column;
          }

          .compiler-container {
            display: flex;
            flex: 1;
            gap: 15px;
            flex-direction: column;
          }

          @media (min-width: 768px) {
            .compiler-container {
              flex-direction: row;
            }
            
            h1 {
              font-size: 2.5rem;
            }
            
            .tab {
              padding: 12px 20px;
              font-size: 1rem;
            }
          }

          .input-section, .output-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 300px;
          }

          .section-header {
            padding: 8px 10px;
            background: rgba(255, 94, 0, 0.2);
            border: 1px solid var(--neon-orange);
            margin-bottom: 10px;
            font-weight: bold;
            text-shadow: 0 0 5px var(--neon-orange);
            font-size: 0.9rem;
          }

          textarea {
            flex: 1;
            background: rgba(5, 217, 232, 0.05);
            border: 1px solid var(--neon-blue);
            color: var(--terminal-green);
            padding: 12px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            resize: none;
            outline: none;
            box-shadow: 0 0 10px rgba(5, 217, 232, 0.3);
            min-height: 200px;
          }

          textarea:focus {
            border-color: var(--neon-orange);
            box-shadow: 0 0 15px var(--neon-orange);
          }

          .button-group {
            display: flex;
            gap: 8px;
            margin-top: 10px;
            flex-wrap: wrap;
          }

          button {
            padding: 8px 15px;
            background: rgba(255, 94, 0, 0.3);
            border: 1px solid var(--neon-orange);
            color: white;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.8rem;
            flex: 1;
            min-width: 120px;
          }

          @media (min-width: 480px) {
            button {
              flex: none;
              padding: 10px 20px;
              font-size: 0.9rem;
            }
          }

          button:hover {
            background: var(--neon-orange);
            box-shadow: 0 0 15px var(--neon-orange);
            transform: translateY(-2px);
          }

          button:active {
            transform: translateY(0);
          }

          .preview-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 400px;
          }

          iframe {
            flex: 1;
            border: 1px solid var(--neon-blue);
            background: black;
            box-shadow: 0 0 15px var(--neon-blue);
            min-height: 900px;
          }

          .status-bar {
            padding: 6px 12px;
            background: rgba(0, 255, 65, 0.1);
            border-top: 1px solid var(--terminal-green);
            font-size: 0.8rem;
            display: flex;
            justify-content: space-between;
          }

          .status-message {
            color: var(--terminal-green);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 70%;
          }

          .status-error {
            color: var(--neon-orange);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 70%;
          }

          .status-time {
            white-space: nowrap;
          }

          .scanlines {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              rgba(0, 255, 65, 0.06) 1px,
              transparent 1px
            );
            background-size: 100% 2px;
            pointer-events: none;
            z-index: 1000;
            animation: scanline 8s linear infinite;
          }

          @keyframes scanline {
            0% { background-position: 0 0; }
            100% { background-position: 0 100%; }
          }

          .glitch {
            position: relative;
          }

          .glitch::before, .glitch::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.8;
          }

          .glitch::before {
            color: #0ff;
            z-index: -1;
            animation: glitch-effect 3s infinite;
          }

          .glitch::after {
            color: #f0f;
            z-index: -2;
            animation: glitch-effect 2s infinite reverse;
          }

          @keyframes glitch-effect {
            0% { transform: translate(0); }
            20% { transform: translate(-3px, 3px); }
            40% { transform: translate(-3px, -3px); }
            60% { transform: translate(3px, 3px); }
            80% { transform: translate(3px, -3px); }
            100% { transform: translate(0); }
          }

          .compiling-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(5, 1, 10, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            color: var(--terminal-green);
            font-family: 'Courier New', monospace;
            text-align: center;
          }

          .compiling-text {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            text-shadow: 0 0 10px var(--terminal-green);
            animation: pulse 1.5s infinite;
          }

          .compiling-subtext {
            font-size: 1rem;
            margin-top: 1rem;
            color: var(--neon-blue);
          }

          .compiling-animation {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .compiling-dot {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: var(--terminal-green);
            animation: bounce 1.5s infinite ease-in-out;
            box-shadow: 0 0 10px var(--terminal-green);
          }

          .compiling-dot:nth-child(1) {
            animation-delay: 0s;
          }

          .compiling-dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .compiling-dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }

          .notification {
            position: fixed;
            top: 30px;
            right: 30px;
            background: var(--darker-bg);
            border: 1px solid var(--terminal-green);
            padding: 15px 25px;
            color: var(--terminal-green);
            font-size: 1.1rem;
            box-shadow: 0 0 15px var(--terminal-green);
            z-index: 2000;
            animation: fadeOut 3s forwards;
            animation-delay: 2s;
          }
          
          @keyframes fadeOut {
            to { opacity: 0; }
          }

          .static-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
            color: var(--terminal-green);
            font-size: 0.9rem;
          }

          .static-toggle input {
            accent-color: var(--neon-orange);
          }

          .debug-container {
            position: fixed;
            bottom: 50px;
            right: 10px;
            width: 400px;
            height: 300px;
            background: var(--darker-bg);
            border: 1px solid var(--neon-orange);
            z-index: 1000;
            display: flex;
            flex-direction: column;
          }

          .debug-header {
            padding: 8px;
            background: rgba(255, 94, 0, 0.3);
            border-bottom: 1px solid var(--neon-orange);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .debug-title {
            font-weight: bold;
            color: var(--neon-orange);
          }

          .debug-close {
            cursor: pointer;
            color: var(--neon-orange);
          }

          .debug-content {
            flex: 1;
            padding: 10px;
            overflow: auto;
            color: var(--terminal-green);
            font-family: 'Courier New', monospace;
            font-size: 12px;
          }

          .debug-toggle {
            position: fixed;
            bottom: 10px;
            left: 10px;
            padding: 8px 15px;
            background: rgba(255, 94, 0, 0.3);
            border: 1px solid var(--neon-orange);
            color: white;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.8rem;
            z-index: 1000;
          }

          .debug-toggle:hover {
            background: var(--neon-orange);
            box-shadow: 0 0 15px var(--neon-orange);
          }

          .connect-wallet {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 15px;
            background: rgba(255, 94, 0, 0.3);
            border: 1px solid var(--neon-orange);
            color: white;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.8rem;
            z-index: 1000;
          }

          .connect-wallet:hover {
            background: var(--neon-orange);
            box-shadow: 0 0 15px var(--neon-orange);
          }

          .blockchain-status {
            position: fixed;
            bottom: 10px;
            right: 10px;
            padding: 8px 12px;
            background: rgba(0, 255, 65, 0.1);
            border: 1px solid var(--terminal-green);
            color: var(--terminal-green);
            font-size: 0.8rem;
            z-index: 1000;
          }

          .blockchain-status.connected {
            background: rgba(0, 255, 65, 0.2);
            border-color: var(--terminal-green);
          }

          .blockchain-status.disconnected {
            background: rgba(255, 94, 0, 0.2);
            border-color: var(--neon-orange);
            color: var(--neon-orange);
          }
        `}</style>

        <div className="scanlines"></div>
        <button 
          className="connect-wallet" 
          onClick={this.connectWallet}
        >
          {isConnected ? `CONNECTED: ${this.shortenAddress(currentAccount)}` : 'CONNECT WALLET'}
        </button>
        <button 
          className="debug-toggle" 
          onClick={this.toggleDebug}
        >
          DEBUG
        </button>
        
        {showDebug && (
          <div className="debug-container">
            <div className="debug-header">
              <div className="debug-title">CONTRACT DEBUG OUTPUT</div>
              <div className="debug-close" onClick={this.toggleDebug}>X</div>
            </div>
            <div className="debug-content" ref={this.debugContentRef}>
              {debugMessages.map((message, index) => (
                <div key={index}>{message}</div>
              ))}
            </div>
          </div>
        )}

        <div className={`blockchain-status ${isConnected ? 'connected' : 'disconnected'}`}>
          Blockchain: {isConnected ? 'Connected to Polygon' : 'Disconnected'}
        </div>

        <div className="container">
          <div className="header">
            <h1 className="glitch" data-text="UPCSCRIPT COMPILER">UPCSCRIPT COMPILER</h1>
            <div className="subtitle">CONVERT LINE-BASED CONFIG TO JSON</div>
          </div>

          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'compiler' ? 'active' : ''}`} 
              onClick={() => this.switchTab('compiler')}
            >
              COMPILER
            </div>
            <div 
              className={`tab ${activeTab === 'upload' ? 'active' : ''}`} 
              onClick={() => this.switchTab('upload')}
            >
              UPLOAD
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'compiler' ? 'active' : ''}`} id="compiler">
            <div className="compiler-container">
              <div className="input-section">
                <div className="section-header">INPUT (UPCSCRIPT LINES)</div>
                <textarea 
                  id="inputText" 
                  value={inputText}
                  onChange={this.handleInputChange}
                  placeholder="Paste your line-based UPCScript configuration here..."
                />
                <div className="static-toggle">
                  <input 
                    type="checkbox" 
                    id="staticToggle" 
                    checked={isStatic}
                    onChange={this.handleStaticToggle}
                  />
                  <label htmlFor="staticToggle">Resolve dynamic values (upc.*, nft.*, ppl.*)</label>
                </div>
                <div className="button-group">
                  <button id="compileBtn" onClick={this.compileToJson}>COMPILE</button>
                  <button id="clearBtn" onClick={this.clearInputs}>CLEAR</button>
                  <button id="exampleBtn" onClick={this.loadExample}>EXAMPLE</button>
                </div>
              </div>
              <div className="output-section">
                <div className="section-header">OUTPUT (CONSOLIDATED JSON)</div>
                <textarea 
                  id="outputText" 
                  value={outputText} 
                  readOnly
                />
                <div className="button-group">
                  <button id="copyBtn" onClick={this.copyToClipboard}>COPY JSON</button>
                  <button id="downloadBtn" onClick={this.downloadFile}>DOWNLOAD</button>
                </div>
              </div>
            </div>
            <div className="status-bar">
              <div className={isError ? "status-error" : "status-message"} id="statusMessage">
                {statusMessage}
              </div>
              <div className="status-time" id="statusTime">
                {currentDate} {currentTime}
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'upload' ? 'active' : ''}`} id="upload">
            <div className="preview-container">
              <div className="section-header">UPLOAD TO PERMAWEB</div>
              <iframe 
                ref={this.previewFrameRef}
                id="previewFrame" 
                src="https://x7vvqfuva5vke4mmmt5w7bma4apn5yjyl2c2y2f45uwy5xwlzmrq.arweave.net/v-tYFpUHaqJxjGT7b4WA4B7e4ThehaxovO0tjt7LyyM"
                title="Upload Preview"
                onLoad={() => {
                  if (this.state.compiledData) {
                    this.sendDataToFrame();
                  }
                }}
              ></iframe>
            </div>
            <div className="status-bar">
              <div className="status-message">UPLOAD MODE</div>
              <div className="status-time" id="uploadTime">
                {currentDate} {currentTime}
              </div>
            </div>
          </div>
        </div>

        {isCompiling && (
          <div className="compiling-overlay">
            <div className="compiling-text">COMPILING CONFIGURATION</div>
            <div className="compiling-animation">
              <div className="compiling-dot"></div>
              <div className="compiling-dot"></div>
              <div className="compiling-dot"></div>
            </div>
            <div className="compiling-subtext">You will be automatically switched to the upload tab when complete</div>
          </div>
        )}
      </div>
    );
  }
}

export default UPCScriptCompiler;
