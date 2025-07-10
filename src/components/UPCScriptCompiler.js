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
      isConnected: false,
      currentAccount: null,
      isMobileMenuOpen: false,
      isIdeOpen: false,
      activeTutorial: null,
      isIdeClosing: false
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
    this.ideTextareaRef = React.createRef();
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

    // Check if mobile
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
  }

  componentWillUnmount() {
    clearInterval(this.timeInterval);
    window.removeEventListener('message', this.handleFrameMessage);
    window.removeEventListener('resize', this.checkIfMobile);
  }

  checkIfMobile = () => {
    this.setState({ isMobile: window.innerWidth < 768 });
  };

  toggleMobileMenu = () => {
    this.setState(prevState => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen
    }));
  };

  toggleIde = () => {
    this.setState(prevState => ({
      isIdeOpen: !prevState.isIdeOpen
    }), () => {
      if (this.state.isIdeOpen && this.ideTextareaRef.current) {
        this.ideTextareaRef.current.focus();
      }
    });
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
    this.setState({ 
      activeTab: tab,
      isMobileMenuOpen: false
    }, () => {
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

  handleIdeInputChange = (e) => {
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
      
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.setState({
            currentAccount: null,
            isConnected: false
          });
        } else {
          this.setState({
            currentAccount: accounts[0]
          });
        }
      });
      
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Error connecting to blockchain:', error);
      this.setState({ isConnected: false });
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
          return fieldMap[field];
        } else {
          return `**ERROR upc.invalidField.${field} **`;
        }
      } catch (error) {
        return `**ERROR upc.queryFailed.${upcId}.${field} **`;
      }
    }
    
    if (value.startsWith('nft.')) {
      const parts = value.split('.');
      if (parts.length < 3) {
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
          return fieldMap[field];
        } else {
          return `**ERROR nft.invalidField.${field} **`;
        }
      } catch (error) {
        return `**ERROR nft.queryFailed.${nftId}.${field} **`;
      }
    }
    
    if (value.startsWith('ppl.name.')) {
      const parts = value.split('.');
      if (parts.length < 4) {
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
        
        if (result.length === 0) {
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
          return fieldMap[field];
        } else {
          return `**ERROR ppl.name.invalidField.${field} **`;
        }
      } catch (error) {
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
        else if (key === "config.ppls") {
          config.ppls = await this.resolveDynamicValue(value);
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
      
      // Start IDE close animation if IDE is open
      if (this.state.isIdeOpen) {
        this.setState({ isIdeClosing: true });
        setTimeout(() => {
          this.setState({ 
            isIdeOpen: false,
            isIdeClosing: false 
          });
          this.switchTab('upload');
        }, 500); // Match this with the CSS transition duration
      } else {
        this.switchTab('upload');
      }
    } catch (error) {
      console.error(error);
      this.setState({ 
        isCompiling: false,
        isIdeClosing: false 
      });
      this.showStatus('COMPILATION ERROR', true);
    }
  };










  openTutorial = (tutorial) => {
    this.setState({ activeTutorial: tutorial });
  };

  closeTutorial = () => {
    this.setState({ activeTutorial: null });
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
      isMobile,
      isMobileMenuOpen,
      isIdeOpen,
      activeTutorial,
      isIdeClosing
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

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', monospace;
            background-color: var(--dark-bg);
            color: var(--neon-blue);
            overflow-x: hidden;
            min-height: 100vh;
          }

          .upcscript-compiler-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding-bottom: 60px;
          }

          .container {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: linear-gradient(135deg, var(--darker-bg) 0%, var(--dark-bg) 100%);
            border: 1px solid var(--neon-orange);
            box-shadow: 0 0 20px var(--neon-orange);
            margin: 0;
            width: 100%;
          }

          .header {
            padding: 15px;
            text-align: center;
            background: rgba(5, 217, 232, 0.1);
            border-bottom: 1px solid var(--neon-blue);
            box-shadow: var(--glow) var(--neon-blue);
            position: relative;
          }

          h1 {
            margin: 0;
            color: var(--neon-orange);
            text-shadow: 0 0 10px var(--neon-orange);
            font-size: 1.5rem;
            letter-spacing: 2px;
          }

          .subtitle {
            color: var(--neon-blue);
            text-shadow: 0 0 5px var(--neon-blue);
            margin-top: 5px;
            font-size: 0.8rem;
          }

          .mobile-menu-toggle {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: var(--neon-orange);
            font-size: 1.5rem;
            cursor: pointer;
            display: none;
          }

          .tabs {
            display: flex;
            background: var(--darker-bg);
            border-bottom: 1px solid var(--neon-orange);
            flex-wrap: wrap;
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
            flex: 1;
            text-align: center;
            min-width: 120px;
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

          .input-section, .output-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 200px;
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
            min-height: 150px;
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
            padding: 8px 12px;
            background: rgba(255, 94, 0, 0.3);
            border: 1px solid var(--neon-orange);
            color: white;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.7rem;
            flex: 1;
            min-width: 100px;
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
            min-height: 300px;
          }

          iframe {
            flex: 1;
            border: 1px solid var(--neon-blue);
            background: black;
            box-shadow: 0 0 15px var(--neon-blue);
            min-height: 400px;
          }

          .status-bar {
            padding: 6px 12px;
            background: rgba(0, 255, 65, 0.1);
            border-top: 1px solid var(--terminal-green);
            font-size: 0.8rem;
            display: flex;
            justify-content: space-between;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 100;
          }

          .status-message {
            color: var(--terminal-green);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 60%;
          }

          .status-error {
            color: var(--neon-orange);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 60%;
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

          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--darker-bg);
            border: 1px solid var(--terminal-green);
            padding: 10px 15px;
            color: var(--terminal-green);
            font-size: 0.9rem;
            box-shadow: 0 0 15px var(--terminal-green);
            z-index: 2000;
            animation: fadeOut 3s forwards;
            animation-delay: 2s;
            max-width: 80%;
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
            font-size: 0.8rem;
          }

          .static-toggle input {
            accent-color: var(--neon-orange);
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
            font-size: 1.2rem;
            margin-bottom: 1.5rem;
            text-shadow: 0 0 10px var(--terminal-green);
            animation: pulse 1.5s infinite;
            padding: 0 20px;
          }

          .compiling-subtext {
            font-size: 0.9rem;
            margin-top: 1rem;
            color: var(--neon-blue);
            padding: 0 20px;
          }

          .compiling-animation {
            display: flex;
            gap: 0.8rem;
            margin-bottom: 1.5rem;
          }

          .compiling-dot {
            width: 15px;
            height: 15px;
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
              transform: translateY(-15px);
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

          /* IDE Modal Styles */
          .ide-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--dark-bg);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            border: 2px solid var(--neon-purple);
            box-shadow: 0 0 30px var(--neon-purple);
            transition: opacity 0.5s ease;
          }

          .ide-modal.fade-out {
            opacity: 0;
          }

          /* IDE compiling overlay */
          .ide-compiling-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(5, 1, 10, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 3100;
            color: var(--terminal-green);
            font-family: 'Courier New', monospace;
            text-align: center;
          }

          .ide-compiling-text {
            font-size: 1.2rem;
            margin-bottom: 1.5rem;
            text-shadow: 0 0 10px var(--terminal-green);
            animation: pulse 1.5s infinite;
            padding: 0 20px;
          }

          .ide-compiling-subtext {
            font-size: 0.9rem;
            margin-top: 1rem;
            color: var(--neon-blue);
            padding: 0 20px;
          }

          .ide-compiling-animation {
            display: flex;
            gap: 0.8rem;
            margin-bottom: 1.5rem;
          }

          .ide-compiling-dot {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background-color: var(--terminal-green);
            animation: bounce 1.5s infinite ease-in-out;
            box-shadow: 0 0 10px var(--terminal-green);
          }

          .ide-compiling-dot:nth-child(1) {
            animation-delay: 0s;
          }

          .ide-compiling-dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .ide-compiling-dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          .ide-header {
            padding: 10px;
            background: rgba(211, 0, 197, 0.2);
            border-bottom: 1px solid var(--neon-purple);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .ide-title {
            color: var(--neon-purple);
            text-shadow: 0 0 10px var(--neon-purple);
            font-size: 1.2rem;
            font-weight: bold;
          }

          .ide-close {
            background: none;
            border: none;
            color: var(--neon-purple);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0 10px;
          }

          .ide-close:hover {
            color: white;
            text-shadow: 0 0 10px white;
          }

          .ide-toolbar {
            display: flex;
            background: rgba(5, 1, 10, 0.8);
            border-bottom: 1px solid var(--neon-blue);
            padding: 5px;
            flex-wrap: wrap;
          }

          .ide-menu {
            position: relative;
            margin-right: 10px;
          }

          .ide-menu-btn {
            background: none;
            border: 1px solid var(--neon-blue);
            color: var(--neon-blue);
            padding: 5px 10px;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            transition: all 0.3s;
          }

          .ide-menu-btn:hover {
            background: rgba(5, 217, 232, 0.2);
          }

          .ide-menu-content {
            display: none;
            position: absolute;
            background: var(--darker-bg);
            min-width: 200px;
            border: 1px solid var(--neon-blue);
            z-index: 1;
            box-shadow: 0 0 15px var(--neon-blue);
          }

          .ide-menu:hover .ide-menu-content {
            display: block;
          }

          .ide-menu-item {
            color: var(--neon-blue);
            padding: 8px 12px;
            text-decoration: none;
            display: block;
            cursor: pointer;
          }

          .ide-menu-item:hover {
            background: rgba(5, 217, 232, 0.2);
          }

          .ide-toolbar-btn {
            background: none;
            border: 1px solid var(--neon-orange);
            color: var(--neon-orange);
            padding: 5px 10px;
            margin-right: 5px;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            transition: all 0.3s;
          }

          .ide-toolbar-btn:hover {
            background: rgba(255, 94, 0, 0.2);
          }

          .ide-content {
            flex: 1;
            display: flex;
            overflow: hidden;
          }

          .ide-line-numbers {
            background: rgba(5, 1, 10, 0.8);
            color: var(--neon-blue);
            padding: 10px 5px;
            font-family: 'Courier New', monospace;
            overflow-y: auto;
            border-right: 1px solid var(--neon-blue);
            text-align: right;
            user-select: none;
          }

          .ide-textarea-container {
            flex: 1;
            position: relative;
            overflow: hidden;
          }

          .ide-textarea {
            width: 100%;
            height: 100%;
            background: transparent;
            color: var(--terminal-green);
            border: none;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            resize: none;
            outline: none;
            white-space: pre;
            overflow-wrap: normal;
            overflow-x: auto;
          }

          .ide-footer {
            padding: 5px 10px;
            background: rgba(5, 1, 10, 0.8);
            border-top: 1px solid var(--neon-orange);
            color: var(--neon-orange);
            font-size: 0.8rem;
            display: flex;
            justify-content: space-between;
          }

          .tutorial-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--darker-bg);
            border: 2px solid var(--neon-blue);
            box-shadow: 0 0 30px var(--neon-blue);
            z-index: 4000;
            width: 80%;
            max-width: 800px;
            max-height: 80vh;
            overflow: auto;
            padding: 20px;
          }

          .tutorial-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid var(--neon-blue);
            padding-bottom: 10px;
          }

          .tutorial-title {
            color: var(--neon-blue);
            font-size: 1.2rem;
            font-weight: bold;
          }

          .tutorial-close {
            background: none;
            border: none;
            color: var(--neon-blue);
            font-size: 1.5rem;
            cursor: pointer;
          }

          .tutorial-content {
            color: var(--terminal-green);
            line-height: 1.6;
          }

          .tutorial-content a {
            color: var(--neon-orange);
            text-decoration: none;
          }

          .tutorial-content a:hover {
            text-decoration: underline;
          }

          .tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 3999;
          }

          @media (min-width: 768px) {
            h1 {
              font-size: 2rem;
            }
            
            .subtitle {
              font-size: 0.9rem;
            }
            
            .tab {
              padding: 12px 20px;
              font-size: 1rem;
              flex: none;
            }
            
            .compiler-container {
              flex-direction: row;
            }
            
            button {
              padding: 10px 15px;
              font-size: 0.8rem;
            }
          }

          @media (max-width: 767px) {
            .mobile-menu-toggle {
              display: block;
            }
            
            .tabs {
              flex-direction: column;
              display: ${isMobileMenuOpen ? 'flex' : 'none'};
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background: var(--darker-bg);
              z-index: 100;
            }
            
            .tab {
              border-right: none;
              border-bottom: 1px solid var(--neon-orange);
            }

            .ide-modal {
              padding-top: 40px;
            }

            /* Updated toolbar layout for mobile */
            .ide-toolbar {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(2, auto);
              gap: 5px;
              padding: 5px;
            }

            .ide-menu {
              margin-bottom: 0;
              margin-right: 0;
              grid-column: span 1;
            }

            .ide-menu-btn, .ide-toolbar-btn {
              width: 100%;
              margin-right: 0;
              margin-bottom: 0;
              padding: 5px;
              font-size: 0.7rem;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .ide-menu-content {
              min-width: 150px;
            }
          }
        `}</style>

        <div className="scanlines"></div>

        <div className="container">
          <div className="header">
            {isMobile && (
              <button 
                className="mobile-menu-toggle"
                onClick={this.toggleMobileMenu}
              >
                ☰
              </button>
            )}
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
                  <button id="ideBtn" onClick={this.toggleIde}>OPEN IDE</button>
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

        {isCompiling && !isIdeOpen && (
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

        {isIdeOpen && (
          <div className={`ide-modal ${isIdeClosing ? 'fade-out' : ''}`}>
            {isCompiling && (
              <div className="ide-compiling-overlay">
                <div className="ide-compiling-text">COMPILING CONFIGURATION</div>
                <div className="ide-compiling-animation">
                  <div className="ide-compiling-dot"></div>
                  <div className="ide-compiling-dot"></div>
                  <div className="ide-compiling-dot"></div>
                </div>
                <div className="ide-compiling-subtext">The IDE will close automatically when complete</div>
              </div>
            )}
            
            <div className="ide-header">
              <div className="ide-title">UPCSCRIPT IDE</div>
              <button className="ide-close" onClick={this.toggleIde}>×</button>
            </div>
            
            <div className="ide-toolbar">
              <div className="ide-menu">
                <button className="ide-menu-btn">File</button>
                <div className="ide-menu-content">
                  <div className="ide-menu-item" onClick={this.compileToJson}>Compile</div>
                  <div className="ide-menu-item" onClick={this.clearInputs}>Clear</div>
                  <div className="ide-menu-item" onClick={this.downloadFile}>Download</div>
                  <div className="ide-menu-item" onClick={this.toggleIde}>Close</div>
                </div>
              </div>
              
              <div className="ide-menu">
                <button className="ide-menu-btn">Edit</button>
                <div className="ide-menu-content">
                  <div className="ide-menu-item" onClick={() => document.execCommand('cut')}>Cut</div>
                  <div className="ide-menu-item" onClick={() => document.execCommand('copy')}>Copy</div>
                  <div className="ide-menu-item" onClick={() => document.execCommand('paste')}>Paste</div>
                  <div className="ide-menu-item" onClick={() => document.execCommand('selectAll')}>Select All</div>
                </div>
              </div>
              
              <div className="ide-menu">
                <button className="ide-menu-btn">Tutorial</button>
                <div className="ide-menu-content">
                  <div className="ide-menu-item" onClick={() => this.openTutorial('basic')}>Basic Syntax</div>
                  <div className="ide-menu-item" onClick={() => this.openTutorial('dynamic')}>Dynamic Values</div>
                  <div className="ide-menu-item" onClick={() => this.openTutorial('examples')}>Examples</div>
                </div>
              </div>
              
              <button className="ide-toolbar-btn" onClick={this.compileToJson}>COMPILE</button>
              <button className="ide-toolbar-btn" onClick={this.clearInputs}>CLEAR</button>
              <button className="ide-toolbar-btn" onClick={this.loadExample}>EXAMPLE</button>
            </div>
            
            <div className="ide-content">
              <div className="ide-line-numbers">
                {inputText.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <div className="ide-textarea-container">
                <textarea
                  ref={this.ideTextareaRef}
                  className="ide-textarea"
                  value={inputText}
                  onChange={this.handleIdeInputChange}
                  spellCheck="false"
                />
              </div>
            </div>
            
            <div className="ide-footer">
              <div>UPCSCRIPT IDE v1.0</div>
              <div>Lines: {inputText.split('\n').length} | Chars: {inputText.length}</div>
            </div>
          </div>
        )}

        {activeTutorial && (
          <>
            <div className="tutorial-overlay" onClick={this.closeTutorial}></div>
            <div className="tutorial-modal">
              <div className="tutorial-header">
                <div className="tutorial-title">
                  {activeTutorial === 'basic' && 'Basic Syntax Tutorial'}
                  {activeTutorial === 'dynamic' && 'Dynamic Values Tutorial'}
                  {activeTutorial === 'examples' && 'Example Configurations'}
                </div>
                <button className="tutorial-close" onClick={this.closeTutorial}>×</button>
              </div>
              <div className="tutorial-content">
                {activeTutorial === 'basic' && (
                  <>
                    <h3>Basic UPCScript Syntax</h3>
                    <p>UPCScript uses a simple key=value format for configuration:</p>
                    <pre>config.button.2.title=Button Label</pre>
                    <pre>config.button.2.payload=Action to perform</pre>
                    <pre>config.button.2.background=orange</pre>
                    <pre>config.button.2.color=black</pre>
                    
                    <h3>Special Configurations</h3>
                    <p>Background image:</p>
                    <pre>config.bg=https://example.com/image.jpg</pre>
                    
                    <p>Hard drive link:</p>
                    <pre>config.hdd=https://example.com/drive</pre>
                    
                    <p>AI assistant link:</p>
                    <pre>config.ai=https://example.com/ai</pre>
                  </>
                )}
                
                {activeTutorial === 'dynamic' && (
                  <>
                    <h3>Dynamic Value Resolution</h3>
                    <p>UPCScript can resolve dynamic values from blockchain contracts:</p>
                    
                    <h4>UPC Information</h4>
                    <pre>config.button.1.title=upc.12345.name</pre>
                    <pre>config.button.1.payload=upc.12345.vr</pre>
                    
                    <h4>NFT Information</h4>
                    <pre>config.button.2.title=nft.67890.name</pre>
                    <pre>config.button.2.payload=nft.67890.vr</pre>
                    
                    <h4>People Information</h4>
                    <pre>config.button.3.title=ppl.name.johndoe.name</pre>
                    <pre>config.button.3.payload=ppl.name.johndoe.link</pre>
                    
                    <p>Make sure "Resolve dynamic values" is checked when compiling.</p>
                  </>
                )}
                
                {activeTutorial === 'examples' && (
                  <>
                    <h3>Example Configurations</h3>
                    <p>Here are some useful resources for learning UPCScript:</p>
                    <ul>
                      <li><a href="https://example.com/tutorial1" target="_blank" rel="noopener noreferrer">Basic Button Configuration</a></li>
                      <li><a href="https://example.com/tutorial2" target="_blank" rel="noopener noreferrer">Dynamic Value Examples</a></li>
                      <li><a href="https://example.com/tutorial3" target="_blank" rel="noopener noreferrer">Advanced Layouts</a></li>
                    </ul>
                    
                    <p>Try clicking the "EXAMPLE" button to load a sample configuration.</p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default UPCScriptCompiler;
