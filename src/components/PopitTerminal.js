import React from 'react';
import Terminal from 'react-console-emulator';
import { ethers } from 'ethers';
import PopitFactoryABI from '../etc/rawmaterial/PopitFactory.json';

const CYBERPUNK = {
  primary: '#00f0ff',
  secondary: '#ff00ff',
  background: '#121212',
  text: '#e0e0e0',
  error: '#ff3d3d',
  success: '#4caf50',
  accent: '#ff5722',
  terminalBg: '#0a0a1a',
  terminalBorder: '1px solid #00f0ff',
  terminalShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
  panelBg: 'rgba(10, 10, 26, 0.8)',
  panelBorder: '1px solid rgba(0, 240, 255, 0.3)',
  panelShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
};

/* ABI PLACEHOLDER - INSERT FULL ABI HERE */
const PopitABI = [
  {
    "inputs": [
      {"internalType": "string","name": "name","type": "string"},
      {"internalType": "string","name": "symbol","type": "string"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"internalType": "address","name": "owner","type": "address"},
      {"indexed": true,"internalType": "address","name": "approved","type": "address"},
      {"indexed": true,"internalType": "uint256","name": "tokenId","type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"internalType": "address","name": "owner","type": "address"},
      {"indexed": true,"internalType": "address","name": "operator","type": "address"},
      {"indexed": true,"internalType": "uint256","name": "tokenId","type": "uint256"}
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"internalType": "address","name": "previousOwner","type": "address"},
      {"indexed": true,"internalType": "address","name": "newOwner","type": "address"}
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false,"internalType": "uint256","name": "id","type": "uint256"},
      {"indexed": false,"internalType": "string","name": "link","type": "string"},
      {"indexed": false,"internalType": "bytes32","name": "hash","type": "bytes32"},
      {"indexed": false,"internalType": "string","name": "upc","type": "string"},
      {"indexed": false,"internalType": "string","name": "name","type": "string"},
      {"indexed": false,"internalType": "string","name": "protocol","type": "string"}
    ],
    "name": "PopCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false,"internalType": "uint256","name": "id","type": "uint256"},
      {"indexed": false,"internalType": "string","name": "link","type": "string"},
      {"indexed": false,"internalType": "bytes32","name": "hash","type": "bytes32"}
    ],
    "name": "PopRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false,"internalType": "uint256","name": "id","type": "uint256"},
      {"indexed": false,"internalType": "string","name": "newLink","type": "string"}
    ],
    "name": "PopUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"internalType": "string","name": "protocol","type": "string"},
      {"indexed": false,"internalType": "string","name": "parserUrl","type": "string"},
      {"indexed": false,"internalType": "address","name": "owner","type": "address"}
    ],
    "name": "ProtocolParserAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"internalType": "string","name": "protocol","type": "string"}
    ],
    "name": "ProtocolParserRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"internalType": "address","name": "from","type": "address"},
      {"indexed": true,"internalType": "address","name": "to","type": "address"},
      {"indexed": true,"internalType": "uint256","name": "tokenId","type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "string","name": "protocol","type": "string"},
      {"internalType": "string","name": "parserUrl","type": "string"}
    ],
    "name": "addProtocolParser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "to","type": "address"},
      {"internalType": "uint256","name": "tokenId","type": "uint256"}
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "owner","type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [
      {"internalType": "uint256","name": "","type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string","name": "link","type": "string"},
      {"internalType": "string","name": "upc","type": "string"},
      {"internalType": "string","name": "name","type": "string"},
      {"internalType": "string","name": "protocol","type": "string"}
    ],
    "name": "createPop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "creationPrice",
    "outputs": [
      {"internalType": "uint256","name": "","type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "tokenId","type": "uint256"}
    ],
    "name": "exists",
    "outputs": [
      {"internalType": "bool","name": "","type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "flipToken",
    "outputs": [
      {"internalType": "contract IERC20Burnable","name": "","type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "tokenId","type": "uint256"}
    ],
    "name": "getApproved",
    "outputs": [
      {"internalType": "address","name": "","type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32","name": "hash","type": "bytes32"}
    ],
    "name": "getPopByHash",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256","name": "id","type": "uint256"},
          {"internalType": "string","name": "link","type": "string"},
          {"internalType": "bytes32","name": "hash","type": "bytes32"},
          {"internalType": "address","name": "owner","type": "address"},
          {"internalType": "string","name": "upc","type": "string"},
          {"internalType": "string","name": "human_readable_name","type": "string"},
          {"internalType": "uint256","name": "timestamp","type": "uint256"},
          {"internalType": "string","name": "protocol","type": "string"}
        ],
        "internalType": "struct Popit.Pop",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "id","type": "uint256"}
    ],
    "name": "getPopById",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256","name": "id","type": "uint256"},
          {"internalType": "string","name": "link","type": "string"},
          {"internalType": "bytes32","name": "hash","type": "bytes32"},
          {"internalType": "address","name": "owner","type": "address"},
          {"internalType": "string","name": "upc","type": "string"},
          {"internalType": "string","name": "human_readable_name","type": "string"},
          {"internalType": "uint256","name": "timestamp","type": "uint256"},
          {"internalType": "string","name": "protocol","type": "string"}
        ],
        "internalType": "struct Popit.Pop",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string","name": "name","type": "string"}
    ],
    "name": "getPopByName",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256","name": "id","type": "uint256"},
          {"internalType": "string","name": "link","type": "string"},
          {"internalType": "bytes32","name": "hash","type": "bytes32"},
          {"internalType": "address","name": "owner","type": "address"},
          {"internalType": "string","name": "upc","type": "string"},
          {"internalType": "string","name": "human_readable_name","type": "string"},
          {"internalType": "uint256","name": "timestamp","type": "uint256"},
          {"internalType": "string","name": "protocol","type": "string"}
        ],
        "internalType": "struct Popit.Pop",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string","name": "upc","type": "string"}
    ],
    "name": "getPopByUPC",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256","name": "id","type": "uint256"},
          {"internalType": "string","name": "link","type": "string"},
          {"internalType": "bytes32","name": "hash","type": "bytes32"},
          {"internalType": "address","name": "owner","type": "address"},
          {"internalType": "string","name": "upc","type": "string"},
          {"internalType": "string","name": "human_readable_name","type": "string"},
          {"internalType": "uint256","name": "timestamp","type": "uint256"},
          {"internalType": "string","name": "protocol","type": "string"}
        ],
        "internalType": "struct Popit.Pop",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string","name": "protocol","type": "string"}
    ],
    "name": "getPopsByProtocol",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256","name": "id","type": "uint256"},
          {"internalType": "string","name": "link","type": "string"},
          {"internalType": "bytes32","name": "hash","type": "bytes32"},
          {"internalType": "address","name": "owner","type": "address"},
          {"internalType": "string","name": "upc","type": "string"},
          {"internalType": "string","name": "human_readable_name","type": "string"},
          {"internalType": "uint256","name": "timestamp","type": "uint256"},
          {"internalType": "string","name": "protocol","type": "string"}
        ],
        "internalType": "struct Popit.Pop[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string","name": "protocol","type": "string"}
    ],
    "name": "getParserForProtocol",
    "outputs": [
      {
        "components": [
          {"internalType": "string","name": "protocol","type": "string"},
          {"internalType": "string","name": "parserUrl","type": "string"},
          {"internalType": "address","name": "owner","type": "address"},
          {"internalType": "uint256","name": "timestamp","type": "uint256"}
        ],
        "internalType": "struct Popit.ProtocolParser",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "owner","type": "address"}
    ],
    "name": "getProtocolsByOwner",
    "outputs": [
      {"internalType": "string[]","name": "","type": "string[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "owner","type": "address"},
      {"internalType": "address","name": "operator","type": "address"}
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {"internalType": "bool","name": "","type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string","name": "_link","type": "string"},
      {"internalType": "string","name": "_upc","type": "string"},
      {"internalType": "string","name": "_human_readable_name","type": "string"},
      {"internalType": "string","name": "_protocol","type": "string"}
    ],
    "name": "insertLink",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {"internalType": "string","name": "","type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {"internalType": "address","name": "","type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "tokenId","type": "uint256"}
    ],
    "name": "ownerOf",
    "outputs": [
      {"internalType": "address","name": "","type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string","name": "protocol","type": "string"}
    ],
    "name": "removeProtocolParser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "id","type": "uint256"}
    ],
    "name": "removePop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "from","type": "address"},
      {"internalType": "address","name": "to","type": "address"},
      {"internalType": "uint256","name": "tokenId","type": "uint256"}
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "from","type": "address"},
      {"internalType": "address","name": "to","type": "address"},
      {"internalType": "uint256","name": "tokenId","type": "uint256"},
      {"internalType": "bytes","name": "data","type": "bytes"}
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "operator","type": "address"},
      {"internalType": "bool","name": "approved","type": "bool"}
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "newPrice","type": "uint256"}
    ],
    "name": "setCreationPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "tokenAddress","type": "address"}
    ],
    "name": "setFlipToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes4","name": "interfaceId","type": "bytes4"}
    ],
    "name": "supportsInterface",
    "outputs": [
      {"internalType": "bool","name": "","type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {"internalType": "string","name": "","type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "tokenId","type": "uint256"}
    ],
    "name": "tokenURI",
    "outputs": [
      {"internalType": "string","name": "","type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalPops",
    "outputs": [
      {"internalType": "uint256","name": "","type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "from","type": "address"},
      {"internalType": "address","name": "to","type": "address"},
      {"internalType": "uint256","name": "tokenId","type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "newOwner","type": "address"}
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "id","type": "uint256"},
      {"internalType": "string","name": "newLink","type": "string"}
    ],
    "name": "updateLink",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

class PopitTerminal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      provider: null,
      signer: null,
      factory: null,
      currentPopit: null,
      account: '',
      isConnected: false,
      showGUI: false,
      activePanel: 'dashboard',
      link: '',
      upc: '',
      name: '',
      protocol: '',
      message: '',
      creationPrice: '500',
      dashboardOutput: [],
      popitOutput: [],
      factoryOutput: [],
      protocolOutput: [],
      popitAddress: props.address,
      selectedPopId: '',
      newLink: '',
      pops: [],
      repoName: '',
      repoSymbol: '',
      protocolName: '',
      parserUrl: '',
      definedProtocols: [],
      selectedProtocol: null,
      protocolData: {},
      protocolFormData: {},
      protocolFormErrors: {},
      protocolSearchQuery: '',
      protocolSearchResults: [],
      showArweaveUploader: false,
      arweaveData: '',
      arweaveUploadUrl: '',
      showWizard: false,
      wizardStep: 0,
      wizardAction: '',
      tempLink: ''
    };
    this.terminal = React.createRef();
    this.arweaveIframeRef = React.createRef();
  }

  componentDidMount() {
    this.initConnection();
    window.addEventListener('message', this.handleArweaveMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleArweaveMessage);
  }














handleArweaveMessage = (event) => {
  // Allow messages from both the iframe origin and parent window (for testing)
  const allowedOrigins = [
    'https://5qw6rsejfhwovrumxotfe26m4vlv6ewbef7pu3hvt5usmcoqarha.arweave.net',
    window.location.origin
  ];
  
  if (!allowedOrigins.includes(event.origin)) return;
  
  if (event.data.type === 'FRAME_READY') {
    if (this.state.arweaveData && this.arweaveIframeRef.current) {
      this.arweaveIframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_DATA',
        data: this.state.arweaveData
      }, 'https://5qw6rsejfhwovrumxotfe26m4vlv6ewbef7pu3hvt5usmcoqarha.arweave.net');
    }
  }
  else if (event.data.type === 'ARWEAVE_UPLOAD_COMPLETE') {
    console.log('Upload complete received:', event.data); // Debug log
    
    this.setState({
      arweaveUploadUrl: event.data.url,
      showWizard: true,
      wizardStep: 1, // Start at action selection
      tempLink: event.data.url,
      showArweaveUploader: false
    }, () => {
      this.pushToTerminal(`[[success]]Arweave upload complete! URL: ${event.data.url}[[/success]]`);
      this.pushToTerminal('Starting wizard to create/update Pop...');
    });
  }
};













openArweaveUploader = () => {
  const { protocolFormData } = this.state;
  const jsonData = JSON.stringify(protocolFormData, null, 2);
  
  this.setState({ 
    showArweaveUploader: true,
    arweaveData: jsonData
  }, () => {
    // This will be handled by the iframe's onLoad event
  });
};





  nextWizardStep = () => {
    this.setState(prevState => ({ wizardStep: prevState.wizardStep + 1 }));
  };

  prevWizardStep = () => {
    this.setState(prevState => ({ wizardStep: prevState.wizardStep - 1 }));
  };

  closeWizard = () => {
    this.setState({ 
      showWizard: false,
      wizardStep: 0,
      wizardAction: '',
      tempLink: ''
    });
  };

  selectWizardAction = (action) => {
    this.setState({ wizardAction: action }, () => {
      if (action === 'create') {
        this.nextWizardStep();
      } else {
        this.nextWizardStep();
      }
    });
  };

  selectPopToUpdate = (popId) => {
    this.setState({ selectedPopId: popId }, this.nextWizardStep);
  };

  initConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.enable();
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        
        const factory = new ethers.Contract(
          '0x75218F31e6F2279397B317A9F59E377FbfeBD5aC',
          PopitFactoryABI.abi,
          signer
        );

        const creationPrice = await factory.creationPrice();
        
        this.setState({
          provider,
          signer,
          factory,
          account,
          isConnected: true,
          creationPrice: ethers.utils.formatEther(creationPrice)
        });

        this.pushToTerminal(`[[success]]Connected to account: ${account}[[/success]]`);
        this.pushToTerminal(`Current creation price: ${ethers.utils.formatEther(creationPrice)} FLIP tokens`);
        this.pushToTerminal('Type "help" to see available commands');
      } else {
        throw new Error('No Ethereum provider detected');
      }
    } catch (error) {
      this.pushToTerminal(`[[error]]Connection error: ${error.message}[[/error]]`);
    }
  };

  pushToTerminal = (message) => {
    if (typeof message === 'object' && message !== null) {
      message = JSON.stringify(message, null, 2);
    }
  
    if (this.terminal.current) {
      this.terminal.current.pushToStdout(message.toString());
    }
    
    const outputKey = `${this.state.activePanel}Output`;
    this.setState(prevState => ({
      [outputKey]: [...prevState[outputKey], message.toString()]
    }));
  };

  clearOutput = (panel) => {
    const outputKey = `${panel}Output`;
    this.setState({ [outputKey]: [] });
  };

  checkAndSetAllowance = async (spender, amount) => {
    try {
      const { provider, account } = this.state;
      const flipToken = new ethers.Contract(
        '0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118',
        [
          'function allowance(address owner, address spender) external view returns (uint256)',
          'function approve(address spender, uint256 amount) external returns (bool)'
        ],
        provider.getSigner()
      );
  
      const currentAllowance = await flipToken.allowance(account, spender);
      if (currentAllowance.lt(amount)) {
        this.pushToTerminal('Approving FLIP tokens...');
        const tx = await flipToken.approve(spender, amount);
        await tx.wait();
        this.pushToTerminal('[[success]]Token approval successful![[/success]]');
      }
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Allowance error: ${error.message}[[/error]]`);
      return false;
    }
  };

  toggleGUI = () => {
    this.setState(prevState => ({ showGUI: !prevState.showGUI }));
  };

  setActivePanel = (panel) => {
    this.setState({ activePanel: panel });
  };

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  extractProtocol = (name) => {
    const protocolMatch = name.match(/^[^:]+:\/\/|^[^:]+:/);
    if (protocolMatch) {
      return protocolMatch[0].replace(/\/\/$/, '');
    }
    return 'default';
  };

  createPopit = async (repoName, repoSymbol) => {
    try {
      const { factory, account } = this.state;
      if (!repoName || !repoSymbol) {
        throw new Error('Repository name and symbol are required');
      }

      this.pushToTerminal(`Creating new Popit: ${repoName} (${repoSymbol})...`);
      
      const creationPrice = ethers.utils.parseUnits('500', 18);
      const flipToken = new ethers.Contract(
        '0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118',
        [
          'function allowance(address owner, address spender) external view returns (uint256)',
          'function approve(address spender, uint256 amount) external returns (bool)',
          'function balanceOf(address account) external view returns (uint256)'
        ],
        this.state.signer
      );

      const balance = await flipToken.balanceOf(account);
      if (balance.lt(creationPrice)) {
        throw new Error(`Insufficient FLIP balance. Need 500 FLIP, you have ${ethers.utils.formatUnits(balance, 18)}`);
      }

      this.pushToTerminal('Approving FLIP tokens...');
      const approveTx = await flipToken.approve(factory.address, creationPrice);
      await approveTx.wait();
      this.pushToTerminal('[[success]]FLIP tokens approved![[/success]]');
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      let gasLimit;
      try {
        const estimatedGas = await factory.estimateGas.createPopit(repoName, repoSymbol);
        gasLimit = estimatedGas.mul(120).div(100);
        this.pushToTerminal(`Estimated gas: ${estimatedGas.toString()} (using ${gasLimit.toString()} with buffer)`);
      } catch (estimateError) {
        this.pushToTerminal(`[[warning]]Gas estimation failed, using default high limit[[/warning]]`);
        gasLimit = ethers.BigNumber.from(500000);
        console.warn("Gas estimation failed, using fallback:", estimateError);
      }

      this.pushToTerminal('Creating repository...');
      const tx = await factory.createPopit(repoName, repoSymbol, {
        gasLimit: gasLimit
      });
      
      this.pushToTerminal(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      
      if (receipt.status === 0) {
        throw new Error('Transaction reverted in the blockchain');
      }

      let newPopitAddress;
      if (receipt.events && receipt.events.length) {
        const popitCreatedEvent = receipt.events.find(e => e.event === 'PopitCreated');
        if (popitCreatedEvent) {
          newPopitAddress = popitCreatedEvent.args.popitAddress;
        }
      }

      if (!newPopitAddress) {
        const popits = await factory.getDeployedPopits();
        newPopitAddress = popits[popits.length - 1];
      }

      const successMessage = `[[success]]Popit created successfully!
Address: ${newPopitAddress}
Name: ${repoName}
Symbol: ${repoSymbol}
Transaction: ${receipt.transactionHash}
Gas Used: ${receipt.gasUsed.toString()}
Block: ${receipt.blockNumber}[[/success]]`;

      this.pushToTerminal(successMessage);
      return successMessage;
    } catch (error) {
      let errorMessage = `[[error]]Creation failed: ${error.reason || error.message}[[/error]]`;
      
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage += '\nThe transaction would revert. Possible reasons:';
        errorMessage += '\n1. Insufficient FLIP token allowance';
        errorMessage += '\n2. Invalid name or symbol format';
        errorMessage += '\n3. Factory contract issue';
        errorMessage += '\n4. Network congestion';
      }
      
      if (error.transactionHash) {
        errorMessage += `\nTransaction Hash: ${error.transactionHash}`;
      }
      
      if (error.data) {
        errorMessage += `\nError data: ${JSON.stringify(error.data)}`;
      }
      
      this.pushToTerminal(errorMessage);
      console.error("CreatePopit error:", error);
      throw error;
    }
  };

  loadPopit = async (address) => {
    if (!address) {
      address = this.state.popitAddress;
    }
    
    try {
      this.pushToTerminal(`Loading repo at: ${address}`);
      
      const popit = new ethers.Contract(
        address,
        PopitABI,
        this.state.signer
      );

      try {
        await popit.totalPops();
      } catch (e) {
        throw new Error("Invalid Popit contract - missing required functions");
      }

      const price = await popit.creationPrice();
      const popitOwner = await popit.owner();
      const name = await popit.name();
      const symbol = await popit.symbol();

      this.setState({
        currentPopit: popit,
        creationPrice: ethers.utils.formatUnits(price, 18)
      });

      const successMessage = `[[success]]Successfully loaded Popit contract:
Address: ${address}
Name: ${name}
Symbol: ${symbol}
Owner: ${popitOwner}
Creation Price: ${ethers.utils.formatUnits(price, 18)} FLIP[[/success]]`;
      
      this.pushToTerminal(successMessage);
      return successMessage;
    } catch (error) {
      const errorMessage = `[[error]]Error loading Popit: ${error.message}[[/error]]`;
      this.pushToTerminal(errorMessage);
      throw error;
    }
  };

  createPop = async () => {
    try {
      const { currentPopit, link, upc, name } = this.state;
      if (!currentPopit) {
        throw new Error('No Popit loaded');
      }
  
      if (!link || !upc || !name) {
        throw new Error('Link, UPC, and name are required');
      }

      const protocol = this.extractProtocol(name);
  
      this.pushToTerminal(`Creating Pop with name: ${name}, UPC: ${upc}, link: ${link}, protocol: ${protocol}`);
      
      const flipTokenAddress = '0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118';
      const flipToken = new ethers.Contract(
        flipTokenAddress,
        [
          "function allowance(address owner, address spender) external view returns (uint256)",
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function balanceOf(address account) external view returns (uint256)"
        ],
        this.state.signer
      );
  
      const price = ethers.utils.parseUnits('1', 18);
      const balance = await flipToken.balanceOf(this.state.account);
      
      if (balance.lt(price)) {
        throw new Error(`Insufficient FLIP balance. Need ${ethers.utils.formatUnits(price, 18)} FLIP`);
      }
  
      const allowance = await flipToken.allowance(this.state.account, currentPopit.address);
      if (allowance.lt(price)) {
        this.pushToTerminal('Approving FLIP tokens...');
        const approveTx = await flipToken.approve(currentPopit.address, price);
        await approveTx.wait();
      }
  
      const tx = await currentPopit.createPop(link, upc, name, protocol);
      const receipt = await tx.wait();
  
      const successMessage = `[[success]]Pop created successfully!
Transaction Hash: ${receipt.transactionHash}
Gas Used: ${receipt.gasUsed.toString()}[[/success]]`;
  
      this.pushToTerminal(successMessage);
      await this.listPops();
      
      return successMessage;
    } catch (error) {
      const errorMessage = `[[error]]Creation failed: ${error.reason || error.message}[[/error]]`;
      this.pushToTerminal(errorMessage);
      throw error;
    }
  };

  removePop = async (id) => {
    try {
      const { currentPopit } = this.state;
      if (!currentPopit) {
        throw new Error('No Popit loaded');
      }
  
      this.pushToTerminal(`Removing Pop with ID: ${id}`);
      
      const tx = await currentPopit.removePop(id);
      await tx.wait();
      
      this.pushToTerminal(`[[success]]Pop removed successfully![[/success]]`);
      await this.listPops();
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Removal failed: ${error.message}[[/error]]`);
      return false;
    }
  };

  updatePopLink = async () => {
    try {
      const { currentPopit, selectedPopId, newLink } = this.state;
      if (!currentPopit) {
        throw new Error('No Popit loaded');
      }
  
      this.pushToTerminal(`Updating Pop ${selectedPopId} link to: ${newLink}`);
      
      const tx = await currentPopit.updateLink(selectedPopId, newLink);
      await tx.wait();
      
      this.pushToTerminal(`[[success]]Pop link updated successfully![[/success]]`);
      await this.listPops();
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Update failed: ${error.message}[[/error]]`);
      return false;
    }
  };

  listPops = async () => {
    try {
      const { currentPopit } = this.state;
      if (!currentPopit) {
        throw new Error('No Popit loaded');
      }
  
      this.pushToTerminal('Fetching Pops...');
      
      const total = await currentPopit.totalPops();
      const pops = [];
      
      for (let i = 1; i <= total; i++) {
        try {
          const pop = await currentPopit.getPopById(i);
          if (pop.id.toString() !== '0') {
            pops.push({
              id: pop.id.toString(),
              link: pop.link,
              name: pop.human_readable_name,
              upc: pop.upc,
              protocol: pop.protocol,
              timestamp: new Date(pop.timestamp * 1000).toLocaleString()
            });
          }
        } catch (e) {
          console.warn(`Error fetching pop ${i}:`, e);
        }
      }
      
      this.setState({ pops });
      
      let output = '[[header]]=== Pops ===[[/header]]\n';
      if (pops.length === 0) {
        output += 'No pops found\n';
      } else {
        pops.forEach(pop => {
          output += `ID: ${pop.id} | Name: ${pop.name} | UPC: ${pop.upc}\n`;
          output += `Link: ${pop.link}\n`;
          output += `Protocol: ${pop.protocol}\n`;
          output += `Created: ${pop.timestamp}\n`;
          output += '----------------\n';
        });
      }
  
      this.pushToTerminal(output);
      return output;
    } catch (error) {
      const errorMessage = `[[error]]Error fetching pops: ${error.message}[[/error]]`;
      this.pushToTerminal(errorMessage);
      throw error;
    }
  };

  listPopits = async () => {
    try {
      const { factory, account } = this.state;
      if (!factory) {
        throw new Error('Factory not connected');
      }
  
      const allPopits = await factory.getDeployedPopits();
      const ownedPopits = await factory.getPopitsByOwner(account);
      
      let output = '[[header]]=== All Popits ===[[/header]]\n';
      allPopits.forEach((popit, idx) => {
        output += `  ${idx + 1}. ${popit}\n`;
      });
      
      output += '[[header]]=== Your Popits ===[[/header]]\n';
      if (ownedPopits.length === 0) {
        output += 'No Popits found\n';
      } else {
        ownedPopits.forEach((popit, idx) => {
          output += `  ${idx + 1}. ${popit}\n`;
        });
      }
  
      this.pushToTerminal(output);
      return output;
    } catch (error) {
      const errorMessage = `[[error]]Error: ${error.message}[[/error]]`;
      this.pushToTerminal(errorMessage);
      throw error;
    }
  };

  fetchProtocols = async () => {
    try {
      const { currentPopit, account } = this.state;
      if (!currentPopit) {
        throw new Error('No Popit loaded');
      }
      
      const protocols = await currentPopit.getProtocolsByOwner(account);
      this.setState({ definedProtocols: protocols });
      return protocols;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error fetching protocols: ${error.message}[[/error]]`);
      return [];
    }
  };

  addProtocolParser = async () => {
    try {
      const { currentPopit, protocolName, parserUrl } = this.state;
      if (!currentPopit) {
        throw new Error('No Popit loaded');
      }
      
      if (!protocolName || !parserUrl) {
        throw new Error('Protocol name and parser URL are required');
      }
      
      this.pushToTerminal(`Adding protocol parser: ${protocolName} (${parserUrl})`);
      const tx = await currentPopit.addProtocolParser(protocolName, parserUrl);
      await tx.wait();
      
      this.pushToTerminal(`[[success]]Protocol parser added successfully![[/success]]`);
      await this.fetchProtocols();
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Failed to add protocol parser: ${error.message}[[/error]]`);
      return false;
    }
  };

  removeProtocolParser = async (protocol) => {
    try {
      const { currentPopit } = this.state;
      if (!currentPopit) {
        throw new Error('No Popit loaded');
      }
      
      this.pushToTerminal(`Removing protocol parser: ${protocol}`);
      const tx = await currentPopit.removeProtocolParser(protocol);
      await tx.wait();
      
      this.pushToTerminal(`[[success]]Protocol parser removed successfully![[/success]]`);
      await this.fetchProtocols();
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Failed to remove protocol parser: ${error.message}[[/error]]`);
      return false;
    }
  };

  getParserForProtocol = async (protocol) => {
    try {
      const { currentPopit } = this.state;
      if (!currentPopit) {
        throw new Error('No Popit loaded');
      }
      
      const parser = await currentPopit.getParserForProtocol(protocol);
      return parser;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error fetching parser: ${error.message}[[/error]]`);
      return null;
    }
  };

  loadProtocolDefinition = async (protocol) => {
    try {
      const parser = await this.getParserForProtocol(protocol);
      if (!parser || !parser.parserUrl) {
        throw new Error('No parser URL found for protocol');
      }
      
      const response = await fetch(parser.parserUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch protocol definition');
      }
      
      const protocolDef = await response.json();
      this.setState({
        selectedProtocol: protocolDef,
        protocolFormData: protocolDef.sample_data || {},
        protocolFormErrors: {}
      });
      
      return protocolDef;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error loading protocol definition: ${error.message}[[/error]]`);
      return null;
    }
  };

  handleProtocolFormChange = (field, value) => {
    this.setState(prevState => ({
      protocolFormData: {
        ...prevState.protocolFormData,
        [field]: value
      }
    }));
  };

  handleArrayFieldChange = (field, index, value) => {
    this.setState(prevState => {
      const newArray = [...prevState.protocolFormData[field]];
      newArray[index] = value;
      return {
        protocolFormData: {
          ...prevState.protocolFormData,
          [field]: newArray
        }
      };
    });
  };

  handleAddArrayItem = (field) => {
    this.setState(prevState => ({
      protocolFormData: {
        ...prevState.protocolFormData,
        [field]: [...(prevState.protocolFormData[field] || []), '']
      }
    }));
  };

  handleRemoveArrayItem = (field, index) => {
    this.setState(prevState => {
      const newArray = [...prevState.protocolFormData[field]];
      newArray.splice(index, 1);
      return {
        protocolFormData: {
          ...prevState.protocolFormData,
          [field]: newArray
        }
      };
    });
  };

  validateProtocolForm = () => {
    const { selectedProtocol, protocolFormData } = this.state;
    if (!selectedProtocol || !selectedProtocol.validation_rules) return true;
    
    const errors = {};
    let isValid = true;
    
    Object.entries(selectedProtocol.validation_rules).forEach(([field, rules]) => {
      const value = protocolFormData[field];
      
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        errors[field] = rules.error || `Invalid format for ${field}`;
        isValid = false;
      }
      
      if (rules.min !== undefined && value < rules.min) {
        errors[field] = rules.error || `${field} must be at least ${rules.min}`;
        isValid = false;
      }
      
      if (rules.max !== undefined && value > rules.max) {
        errors[field] = rules.error || `${field} must be at most ${rules.max}`;
        isValid = false;
      }
    });
    
    this.setState({ protocolFormErrors: errors });
    return isValid;
  };

  submitProtocolForm = () => {
    if (!this.validateProtocolForm()) {
      this.pushToTerminal('[[error]]Form contains errors. Please fix them before submitting.[[/error]]');
      return;
    }

    this.openArweaveUploader();
  };

completeCreatePop = () => {
  const { tempLink, name, upc } = this.state;
  this.setState({
    link: tempLink,
    showWizard: false,
    wizardStep: 0,
    wizardAction: '',
    tempLink: ''
  }, () => {
    this.createPop();
  });
};

completeUpdatePop = () => {
  const { tempLink, selectedPopId } = this.state;
  this.setState({
    newLink: tempLink,
    showWizard: false,
    wizardStep: 0,
    wizardAction: '',
    tempLink: '',
    selectedPopId: ''
  }, () => {
    this.updatePopLink();
  });
};

  searchPopsByProtocol = async () => {
    try {
      const { currentPopit, protocolSearchQuery } = this.state;
      if (!currentPopit) {
        throw new Error('No Popit loaded');
      }
      
      if (!protocolSearchQuery) {
        throw new Error('Please enter a protocol to search');
      }
      
      const pops = await currentPopit.getPopsByProtocol(protocolSearchQuery);
      this.setState({ protocolSearchResults: pops });
      
      let output = '[[header]]=== Search Results ===[[/header]]\n';
      if (pops.length === 0) {
        output += 'No pops found for this protocol\n';
      } else {
        pops.forEach(pop => {
          output += `ID: ${pop.id} | Name: ${pop.human_readable_name} | Protocol: ${pop.protocol}\n`;
          output += `Link: ${pop.link}\n`;
          output += `Created: ${new Date(pop.timestamp * 1000).toLocaleString()}\n`;
          output += '----------------\n';
        });
      }
      
      this.pushToTerminal(output);
      return output;
    } catch (error) {
      this.pushToTerminal(`[[error]]Search failed: ${error.message}[[/error]]`);
      return null;
    }
  };
























renderArweaveUploader = () => {
  if (!this.state.showArweaveUploader) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'auto', // Allow scrolling if content is too large
      padding: '20px', // Add padding to ensure content doesn't touch edges
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px', // Limit maximum width
        height: 'auto',
        maxHeight: '90vh', // Limit height to viewport
        backgroundColor: CYBERPUNK.terminalBg,
        border: `2px solid ${CYBERPUNK.primary}`,
        boxShadow: `0 0 20px ${CYBERPUNK.primary}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // Prevent inner content from overflowing
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '10px',
          backgroundColor: CYBERPUNK.terminalBg,
          flexShrink: 0 // Prevent header from shrinking
        }}>
          <button 
            onClick={() => this.setState({ showArweaveUploader: false })}
            style={{
              background: 'none',
              border: `1px solid ${CYBERPUNK.error}`,
              color: CYBERPUNK.error,
              padding: '5px 10px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
        <iframe
          key={`arweave-iframe-${Date.now()}`}
          ref={this.arweaveIframeRef}
          src="https://5qw6rsejfhwovrumxotfe26m4vlv6ewbef7pu3hvt5usmcoqarha.arweave.net/7C3oyIkp7OrGjLumUmvM5VdfEsEhfvps9Z9pJgnQBE4"
          style={{
            width: '100%',
            height: 'calc(100vh - 150px)', // Dynamic height calculation
            minHeight: '400px', // Minimum height
            border: 'none',
            flexGrow: 1 // Allow iframe to fill remaining space
          }}
          title="Arweave Uploader"
          sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
          onLoad={() => {
            if (this.state.arweaveData && this.arweaveIframeRef.current) {
              this.arweaveIframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_DATA',
                data: this.state.arweaveData
              }, 'https://5qw6rsejfhwovrumxotfe26m4vlv6ewbef7pu3hvt5usmcoqarha.arweave.net');
            }
          }}
        />
      </div>
    </div>
  );
};





























renderWizard = () => {
  if (!this.state.showWizard) return null;

  const { wizardStep, wizardAction, pops, tempLink, selectedPopId } = this.state;

  return (
    <div style={wizardStyles.overlay}>
      <div style={wizardStyles.container}>
        <h2 style={wizardStyles.title}>
          {wizardStep === 1 && 'Select Action'}
          {wizardStep === 2 && wizardAction === 'create' && 'Create New Pop'}
          {wizardStep === 2 && wizardAction === 'update' && 'Select Pop to Update'}
          {wizardStep === 3 && 'Confirm Update'}
        </h2>

        {/* Step 1: Action Selection */}
        {wizardStep === 1 && (
          <div>
            <p>Data uploaded to Arweave at:</p>
            <div style={wizardStyles.linkBox}>
              {tempLink}
            </div>
            <p>What would you like to do with this data?</p>
            <div style={wizardStyles.buttonGroup}>
              <button
                onClick={() => this.setState({ wizardAction: 'create', wizardStep: 2 })}
                style={wizardStyles.button}
              >
                Create New Pop
              </button>
              <button
                onClick={() => this.setState({ wizardAction: 'update', wizardStep: 2 })}
                style={wizardStyles.button}
              >
                Update Existing Pop
              </button>
            </div>
          </div>
        )}

        {/* Step 2a: Create New Pop */}
        {wizardStep === 2 && wizardAction === 'create' && (
          <div>
            <p>Creating new Pop with data from:</p>
            <div style={wizardStyles.linkBox}>
              {tempLink}
            </div>
            <div style={wizardStyles.formGroup}>
              <label style={wizardStyles.label}>Name:</label>
              <input
                type="text"
                value={this.state.name}
                onChange={(e) => this.setState({ name: e.target.value })}
                style={wizardStyles.input}
                placeholder="Enter a name for this Pop"
              />
            </div>
            <div style={wizardStyles.formGroup}>
              <label style={wizardStyles.label}>UPC (optional):</label>
              <input
                type="text"
                value={this.state.upc}
                onChange={(e) => this.setState({ upc: e.target.value })}
                style={wizardStyles.input}
                placeholder="Enter UPC if applicable"
              />
            </div>
            <div style={wizardStyles.buttonGroup}>
              <button
                onClick={() => this.setState({ wizardStep: 1 })}
                style={{ ...wizardStyles.button, ...wizardStyles.secondaryButton }}
              >
                Back
              </button>
              <button
                onClick={this.completeCreatePop}
                style={wizardStyles.button}
              >
                Create Pop
              </button>
            </div>
          </div>
        )}

        {/* Step 2b: Update Existing Pop */}
        {wizardStep === 2 && wizardAction === 'update' && (
          <div>
            <p>Select which Pop to update with this data:</p>
            <div style={wizardStyles.popList}>
              {pops.length === 0 ? (
                <div style={wizardStyles.emptyMessage}>
                  No Pops available to update
                </div>
              ) : (
                pops.map(pop => (
                  <div
                    key={pop.id}
                    onClick={() => this.setState({ selectedPopId: pop.id })}
                    style={{
                      ...wizardStyles.popItem,
                      ...(selectedPopId === pop.id ? wizardStyles.selectedPopItem : {})
                    }}
                  >
                    <div><strong>ID:</strong> {pop.id}</div>
                    <div><strong>Name:</strong> {pop.name}</div>
                    <div><strong>Current Link:</strong> {pop.link}</div>
                  </div>
                ))
              )}
            </div>
            <div style={wizardStyles.buttonGroup}>
              <button
                onClick={() => this.setState({ wizardStep: 1 })}
                style={{ ...wizardStyles.button, ...wizardStyles.secondaryButton }}
              >
                Back
              </button>
              <button
                onClick={() => this.setState({ wizardStep: 3 })}
                disabled={!selectedPopId}
                style={{
                  ...wizardStyles.button,
                  opacity: !selectedPopId ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Update */}
        {wizardStep === 3 && (
          <div>
            <p>Updating Pop #{selectedPopId} with new data from:</p>
            <div style={wizardStyles.linkBox}>
              {tempLink}
            </div>
            <p>Are you sure you want to update this Pop?</p>
            <div style={wizardStyles.buttonGroup}>
              <button
                onClick={() => this.setState({ wizardStep: 2 })}
                style={{ ...wizardStyles.button, ...wizardStyles.secondaryButton }}
              >
                Back
              </button>
              <button
                onClick={this.completeUpdatePop}
                style={wizardStyles.button}
              >
                Confirm Update
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};









  renderDashboardPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>REPO DASHBOARD</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CURRENT REPO</h3>
            <div style={styles.infoBox}>
              {this.state.currentPopit ? (
                <>
                  <p>Address: {this.state.currentPopit.address.substring(0, 12)}...</p>
                  <p>Total Pops: {this.state.pops.length}</p>
                  <p>Creation Price: {this.state.creationPrice} FLIP</p>
                </>
              ) : (
                <p>No Popit loaded</p>
              )}
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>POP MANAGEMENT</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="selectedPopId"
                value={this.state.selectedPopId}
                onChange={this.handleInputChange}
                placeholder="Pop ID"
                style={styles.input}
              />
              <input
                type="text"
                name="newLink"
                value={this.state.newLink}
                onChange={this.handleInputChange}
                placeholder="New Link"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={this.updatePopLink}
              >
                UPDATE POP LINK
              </button>
              <div style={styles.divider}></div>
              <button 
                style={{...styles.button, backgroundColor: CYBERPUNK.error}}
                onClick={() => this.removePop(this.state.selectedPopId)}
              >
                REMOVE POP
              </button>
            </div>
          </div>
        </div>
        {this.renderOutputArea(this.state.dashboardOutput)}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button 
            style={{ ...styles.button, width: 'auto', padding: '5px 10px' }}
            onClick={() => this.clearOutput('dashboard')}
          >
            CLEAR OUTPUT
          </button>
        </div>
      </div>
    );
  };

  renderPopitPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>REPO MANAGEMENT</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CREATE LINK</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="link"
                value={this.state.link}
                onChange={this.handleInputChange}
                placeholder="Link"
                style={styles.input}
              />
              <input
                type="text"
                name="upc"
                value={this.state.upc}
                onChange={this.handleInputChange}
                placeholder="UPC"
                style={styles.input}
              />
              <input
                type="text"
                name="name"
                value={this.state.name}
                onChange={this.handleInputChange}
                placeholder="Name (include protocol)"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={this.createPop}
              >
                CREATE POP
              </button>
              <div style={styles.divider}></div>
              <button 
                style={styles.button}
                onClick={this.listPops}
              >
                LIST POPS
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>LOAD REPO</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="popitAddress"
                value={this.state.popitAddress}
                onChange={this.handleInputChange}
                placeholder="Popit Address"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.loadPopit(this.state.popitAddress)}
              >
                LOAD REPO
              </button>
            </div>
          </div>
        </div>
        {this.renderOutputArea(this.state.popitOutput)}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button 
            style={{ ...styles.button, width: 'auto', padding: '5px 10px' }}
            onClick={() => this.clearOutput('popit')}
          >
            CLEAR OUTPUT
          </button>
        </div>
      </div>
    );
  };

  renderFactoryPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>FACTORY MANAGEMENT</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CREATE REPO</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="repoName"
                value={this.state.repoName}
                onChange={this.handleInputChange}
                placeholder="Repository Name"
                style={styles.input}
              />
              <input
                type="text"
                name="repoSymbol"
                value={this.state.repoSymbol}
                onChange={this.handleInputChange}
                placeholder="Repository Symbol"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={this.createPopit}
              >
                CREATE NEW REPO
              </button>
              <p style={{ color: CYBERPUNK.secondary }}>
                Creation Price: {this.state.creationPrice} FLIP tokens
              </p>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>LIST REPOS</h3>
            <div style={styles.infoBox}>
              <button 
                style={styles.button}
                onClick={this.listPopits}
              >
                LIST ALL REPOS
              </button>
            </div>
          </div>
        </div>
        {this.renderOutputArea(this.state.factoryOutput)}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button 
            style={{ ...styles.button, width: 'auto', padding: '5px 10px' }}
            onClick={() => this.clearOutput('factory')}
          >
            CLEAR OUTPUT
          </button>
        </div>
      </div>
    );
  };

  renderProtocolPanel = () => {
    const { 
      protocolName, 
      parserUrl, 
      definedProtocols, 
      selectedProtocol, 
      protocolFormData, 
      protocolFormErrors,
      protocolSearchQuery,
      protocolSearchResults
    } = this.state;

    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>PROTOCOL MANAGEMENT</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>DEFINE PROTOCOL</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="protocolName"
                value={protocolName}
                onChange={(e) => this.setState({ protocolName: e.target.value })}
                placeholder="Protocol Name (e.g., vin://)"
                style={styles.input}
              />
              <input
                type="text"
                name="parserUrl"
                value={parserUrl}
                onChange={(e) => this.setState({ parserUrl: e.target.value })}
                placeholder="Parser URL (JSON)"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={this.addProtocolParser}
              >
                ADD PROTOCOL
              </button>
              <div style={styles.divider}></div>
              <h4 style={{ color: CYBERPUNK.secondary, marginBottom: '5px' }}>Your Protocols:</h4>
              {definedProtocols.length === 0 ? (
                <p style={{ color: CYBERPUNK.text, opacity: 0.7 }}>No protocols defined</p>
              ) : (
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {definedProtocols.map((protocol, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '5px',
                      padding: '5px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: `1px solid ${CYBERPUNK.primary}`
                    }}>
                      <span 
                        style={{ 
                          cursor: 'pointer',
                          color: CYBERPUNK.primary,
                          flex: 1
                        }}
                        onClick={() => this.loadProtocolDefinition(protocol)}
                      >
                        {protocol}
                      </span>
                      <button
                        style={{
                          background: 'transparent',
                          border: `1px solid ${CYBERPUNK.error}`,
                          color: CYBERPUNK.error,
                          padding: '2px 5px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        onClick={() => this.removeProtocolParser(protocol)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>DATA ENTRY</h3>
            <div style={styles.infoBox}>
              {selectedProtocol ? (
                <div>
                  <h4 style={{ color: CYBERPUNK.secondary }}>{selectedProtocol.protocol}</h4>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '5px' }}>
                    {Object.entries(selectedProtocol.data_structure).map(([field, type]) => (
                      <div key={field} style={{ marginBottom: '10px' }}>
                        <label style={{ 
                          display: 'block', 
                          color: CYBERPUNK.primary,
                          marginBottom: '3px'
                        }}>
                          {field} ({type})
                        </label>
                        
                        {Array.isArray(protocolFormData[field]) ? (
                          <div>
                            {protocolFormData[field].map((item, index) => (
                              <div key={index} style={{ 
                                display: 'flex', 
                                marginBottom: '5px',
                                alignItems: 'center'
                              }}>
                                <input
                                  type={typeof item === 'number' ? 'number' : 'text'}
                                  value={item}
                                  onChange={(e) => this.handleArrayFieldChange(field, index, e.target.value)}
                                  style={{
                                    ...styles.input,
                                    flex: 1,
                                    marginBottom: 0,
                                    backgroundColor: protocolFormErrors[field] ? 'rgba(255, 61, 61, 0.2)' : 'rgba(0, 0, 0, 0.5)'
                                  }}
                                />
                                <button
                                  style={{
                                    background: CYBERPUNK.error,
                                    border: 'none',
                                    color: 'white',
                                    padding: '5px',
                                    marginLeft: '5px',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => this.handleRemoveArrayItem(field, index)}
                                >
                                  -
                                </button>
                              </div>
                            ))}
                            <button
                              style={{
                                background: CYBERPUNK.success,
                                border: 'none',
                                color: 'white',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                              onClick={() => this.handleAddArrayItem(field)}
                            >
                              Add Item
                            </button>
                          </div>
                        ) : (
                          <input
                            type={typeof protocolFormData[field] === 'number' ? 'number' : 'text'}
                            value={protocolFormData[field] || ''}
                            onChange={(e) => this.handleProtocolFormChange(
                              field, 
                              typeof protocolFormData[field] === 'number' ? 
                                parseFloat(e.target.value) || 0 : 
                                e.target.value
                            )}
                            style={{
                              ...styles.input,
                              backgroundColor: protocolFormErrors[field] ? 'rgba(255, 61, 61, 0.2)' : 'rgba(0, 0, 0, 0.5)'
                            }}
                          />
                        )}
                        
                        {protocolFormErrors[field] && (
                          <div style={{ 
                            color: CYBERPUNK.error,
                            fontSize: '12px',
                            marginTop: '3px'
                          }}>
                            {protocolFormErrors[field]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    style={{ ...styles.button, marginTop: '10px' }}
                    onClick={this.submitProtocolForm}
                  >
                    SUBMIT DATA
                  </button>
                </div>
              ) : (
                <p style={{ color: CYBERPUNK.text, opacity: 0.7 }}>
                  Select a protocol to enter data
                </p>
              )}
            </div>
          </div>

          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>PROTOCOL SEARCH</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                value={protocolSearchQuery}
                onChange={(e) => this.setState({ protocolSearchQuery: e.target.value })}
                placeholder="Enter protocol to search (e.g., vin://)"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={this.searchPopsByProtocol}
              >
                SEARCH POPS
              </button>
              <div style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {protocolSearchResults.length > 0 && (
                  <div>
                    <h4 style={{ color: CYBERPUNK.secondary }}>Results:</h4>
                    {protocolSearchResults.map((pop, index) => (
                      <div key={index} style={{ 
                        marginBottom: '10px',
                        padding: '5px',
                        border: `1px solid ${CYBERPUNK.primary}`,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)'
                      }}>
                        <div><strong>ID:</strong> {pop.id.toString()}</div>
                        <div><strong>Name:</strong> {pop.human_readable_name}</div>
                        <div><strong>Link:</strong> {pop.link}</div>
                        <div><strong>Created:</strong> {new Date(pop.timestamp * 1000).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {this.renderOutputArea(this.state.protocolOutput)}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button 
            style={{ ...styles.button, width: 'auto', padding: '5px 10px' }}
            onClick={() => this.clearOutput('protocol')}
          >
            CLEAR OUTPUT
          </button>
        </div>
      </div>
    );
  };

  renderOutputArea = (output) => {
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: `1px solid ${CYBERPUNK.primary}`,
        borderRadius: '4px',
        padding: '10px',
        marginTop: '15px',
        height: '200px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        {output.length === 0 ? (
          <div style={{ color: CYBERPUNK.secondary, opacity: 0.7 }}>
            No output yet. Execute commands to see results here.
          </div>
        ) : (
          output.map((line, index) => (
            <div key={index} style={{ 
              marginBottom: '5px',
              whiteSpace: 'pre-wrap',
              color: line.includes('[[error]]') ? CYBERPUNK.error :
                    line.includes('[[success]]') ? CYBERPUNK.success :
                    line.includes('[[header]]') ? CYBERPUNK.primary :
                    line.includes('[[secondary]]') ? CYBERPUNK.secondary :
                    CYBERPUNK.text
            }}>
              {line.replace(/\[\[.*?\]\]/g, '')}
            </div>
          ))
        )}
      </div>
    );
  };

  render() {
    const { showGUI, activePanel } = this.state;

    return (
      <div style={{
        backgroundColor: CYBERPUNK.background,
        padding: '20px',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.25) 50%
          )`,
          backgroundSize: '100% 2px',
          pointerEvents: 'none',
          zIndex: 1
        }}></div>

        <div style={{
          position: 'relative',
          zIndex: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: `1px solid ${CYBERPUNK.primary}`
          }}>
            <h1 style={{
              color: CYBERPUNK.primary,
              margin: 0,
              fontSize: '24px',
              textShadow: `0 0 5px ${CYBERPUNK.primary}`
            }}>
              REPO TERMINAL
            </h1>
            <div>
              <button 
                onClick={this.toggleGUI}
                style={{
                  background: CYBERPUNK.terminalBg,
                  color: CYBERPUNK.primary,
                  border: `1px solid ${CYBERPUNK.primary}`,
                  padding: '5px 15px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  boxShadow: `0 0 5px ${CYBERPUNK.primary}`,
                  fontFamily: 'monospace'
                }}
              >
                {showGUI ? 'SHOW TERMINAL' : 'SHOW GUI'}
              </button>
              <span style={{
                color: this.state.isConnected ? CYBERPUNK.success : CYBERPUNK.error,
                fontFamily: 'monospace'
              }}>
                {this.state.isConnected ? 
                  `CONNECTED: ${this.state.account.substring(0, 12)}...` : 
                  'NOT CONNECTED'}
              </span>
            </div>
          </div>

          {showGUI ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={styles.navContainer}>
                <button 
                  onClick={() => this.setActivePanel('dashboard')}
                  style={{
                    ...styles.navButton,
                    borderBottom: activePanel === 'dashboard' ? `2px solid ${CYBERPUNK.primary}` : 'none'
                  }}
                >
                  DASHBOARD
                </button>
                <button 
                  onClick={() => this.setActivePanel('popit')}
                  style={{
                    ...styles.navButton,
                    borderBottom: activePanel === 'popit' ? `2px solid ${CYBERPUNK.primary}` : 'none'
                  }}
                >
                  REPO MGMT
                </button>
                <button 
                  onClick={() => this.setActivePanel('factory')}
                  style={{
                    ...styles.navButton,
                    borderBottom: activePanel === 'factory' ? `2px solid ${CYBERPUNK.primary}` : 'none'
                  }}
                >
                  FACTORY
                </button>
                <button 
                  onClick={() => {
                    this.setActivePanel('protocol');
                    this.fetchProtocols();
                  }}
                  style={{
                    ...styles.navButton,
                    borderBottom: activePanel === 'protocol' ? `2px solid ${CYBERPUNK.primary}` : 'none'
                  }}
                >
                  PROTOCOLS
                </button>
              </div>

              <div style={{
                flex: 1,
                overflow: 'auto'
              }}>
                {activePanel === 'dashboard' && this.renderDashboardPanel()}
                {activePanel === 'popit' && this.renderPopitPanel()}
                {activePanel === 'factory' && this.renderFactoryPanel()}
                {activePanel === 'protocol' && this.renderProtocolPanel()}
              </div>
            </div>
          ) : (
            <Terminal
              ref={this.terminal}
              commands={{
                connect: {
                  description: 'Connect wallet',
                  fn: this.initConnection
                },
                repo: {
                  description: 'Create new repository (costs 500 FLIP tokens)',
                  fn: async (name,symbol) => {
                    try {
                      await this.createPopit(name,symbol);
                      return '';
                    } catch (error) {
                      return error.message;
                    }
                  }
                },
                use: {
                  description: 'Load existing repo',
                  usage: 'use <address>',
                  fn: async (address) => {
                    if(!address) {
                      address=this.state.popitAddress;
                    }
                    try {
                      await this.loadPopit(address);
                      return '';
                    } catch (error) {
                      return error.message;
                    }
                  }
                },
                push: {
                  description: 'Create new Pop',
                  usage: 'push <link> <upc> <name>',
                  fn: async (link, upc, name) => {
                    try {
                      const { currentPopit, account, provider } = this.state;
                      
                      if (!currentPopit) {
                        throw new Error('Popit contract not loaded');
                      }

                      const protocol = this.extractProtocol(name);

                      const flipToken = new ethers.Contract(
                        '0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118',
                        [
                          "function approve(address spender, uint256 amount) returns (bool)",
                          "function allowance(address owner, address spender) view returns (uint256)",
                          "function balanceOf(address account) view returns (uint256)"
                        ],
                        provider.getSigner()
                      );

                      const requiredAmount = ethers.utils.parseUnits('1', 18);
                      const balance = await flipToken.balanceOf(account);
                      if (balance.lt(requiredAmount)) {
                        throw new Error(`Need 1 FLIP (you have ${ethers.utils.formatUnits(balance, 18)})`);
                      }

                      const MAX_UINT256 = ethers.constants.MaxUint256;
                      const allowance = await flipToken.allowance(account, currentPopit.address);
                      if (allowance.lt(requiredAmount)) {
                        this.pushToTerminal('Approving FLIP tokens...');
                        const approveTx = await flipToken.approve(currentPopit.address, MAX_UINT256);
                        await approveTx.wait();
                        this.pushToTerminal('[[success]]FLIP tokens approved![[/success]]');
                        
                        await new Promise(resolve => setTimeout(resolve, 2000));
                      }

                      this.pushToTerminal('Creating Pop...');
                      const tx = await currentPopit.createPop(link, upc, name, protocol);
                      
                      const receipt = await tx.wait();
                      
                      if (receipt.status === 1) {
                        const successMessage = `[[success]]Pop created successfully!
  Transaction Hash: ${receipt.transactionHash}
  Gas Used: ${receipt.gasUsed.toString()}[[/success]]`;
                        this.pushToTerminal(successMessage);
                        await this.listPops();
                        return '';
                      } else {
                        throw new Error('Transaction failed');
                      }
                    } catch (error) {
                      let errorMessage = error.reason || error.message;
                      if (error.data && error.data.message) {
                        errorMessage += `\n${error.data.message}`;
                      }
                      const errMsg = `[[error]]Creation failed: ${errorMessage}[[/error]]`;
                      this.pushToTerminal(errMsg);
                      return errMsg;
                    }
                  }
                },
                remove: {
                  description: 'Remove a Pop',
                  usage: 'remove <id>',
                  fn: (id) => this.removePop(id)
                },
                updatelink: {
                  description: 'Update Pop link',
                  usage: 'updatelink <id> <newLink>',
                  fn: (id, newLink) => {
                    this.setState({ selectedPopId: id, newLink }, () => {
                      this.updatePopLink();
                    });
                  }
                },
                ls: {
                  description: 'List all Pops in current Popit',
                  fn: this.listPops
                },
                repos: {
                  description: 'List all Popits',
                  fn: async () => {
                    try {
                      await this.listPopits();
                      return '';
                    } catch (error) {
                      return error.message;
                    }
                  }
                },
                addprotocol: {
                  description: 'Add a new protocol parser',
                  usage: 'addprotocol <name> <parserUrl>',
                  fn: async (name, parserUrl) => {
                    try {
                      this.setState({ protocolName: name, parserUrl }, async () => {
                        await this.addProtocolParser();
                      });
                      return '';
                    } catch (error) {
                      return error.message;
                    }
                  }
                },
                removeprotocol: {
                  description: 'Remove a protocol parser',
                  usage: 'removeprotocol <name>',
                  fn: async (name) => {
                    try {
                      await this.removeProtocolParser(name);
                      return '';
                    } catch (error) {
                      return error.message;
                    }
                  }
                },
                listprotocols: {
                  description: 'List all protocol parsers',
                  fn: async () => {
                    try {
                      const protocols = await this.fetchProtocols();
                      if (protocols.length === 0) {
                        return 'No protocols defined';
                      }
                      return protocols.join('\n');
                    } catch (error) {
                      return error.message;
                    }
                  }
                },
                searchprotocol: {
                  description: 'Search pops by protocol',
                  usage: 'searchprotocol <protocol>',
                  fn: async (protocol) => {
                    try {
                      this.setState({ protocolSearchQuery: protocol }, async () => {
                        await this.searchPopsByProtocol();
                      });
                      return '';
                    } catch (error) {
                      return error.message;
                    }
                  }
                }
              }}
              dangerMode={true}
              welcomeMessage={`
                [[header]]
                ===================================
                PPL REPO TERMINAL v1.0
                ===================================
                [[/header]]
                [[secondary]]Type 'help' for command list[[/secondary]]
                ${this.state.isConnected ? 
                  `\nConnected: ${this.state.account}` : 
                  '\n[[error]]Not connected[[/error]]'}
              `}
              ignoreCommandCase={true}
              promptLabel={'user@popit-terminal:~$'}
              promptLabelStyle={{
                color: CYBERPUNK.primary,
                fontWeight: 'bold'
              }}
              inputTextStyle={{
                color: CYBERPUNK.text
              }}
              autoFocus={true}
            />
          )}
        </div>
        {this.renderArweaveUploader()}
        {this.renderWizard()}
      </div>
    );
  }
}

const styles = {
  panel: {
    backgroundColor: CYBERPUNK.panelBg,
    border: CYBERPUNK.panelBorder,
    borderRadius: '4px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: CYBERPUNK.panelShadow,
    color: CYBERPUNK.text,
    fontFamily: 'monospace'
  },
  panelTitle: {
    color: CYBERPUNK.primary,
    marginTop: '0',
    marginBottom: '20px',
    textShadow: `0 0 5px ${CYBERPUNK.primary}`,
    borderBottom: `1px solid ${CYBERPUNK.primary}`,
    paddingBottom: '10px'
  },
  subTitle: {
    color: CYBERPUNK.secondary,
    marginTop: '0',
    marginBottom: '10px',
    fontSize: '16px'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  gridItem: {
    flex: '1',
    minWidth: '300px'
  },
  infoBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '15px',
    borderRadius: '4px',
    border: `1px solid ${CYBERPUNK.primary}`,
    height: '100%'
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: `1px solid ${CYBERPUNK.primary}`,
    color: CYBERPUNK.text,
    fontFamily: 'monospace'
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: CYBERPUNK.terminalBg,
    color: CYBERPUNK.primary,
    border: `1px solid ${CYBERPUNK.primary}`,
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: `0 0 5px ${CYBERPUNK.primary}`,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: CYBERPUNK.primary,
      color: CYBERPUNK.terminalBg
    }
  },
  navContainer: {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: `1px solid ${CYBERPUNK.primary}`,
    overflowX: 'auto'
  },
  navButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: CYBERPUNK.primary,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '14px',
    marginRight: '10px'
  },
  divider: {
    height: '1px',
    backgroundColor: CYBERPUNK.primary,
    margin: '10px 0',
    opacity: 0.3
  }
};

// Add these styles to your styles object
const wizardStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '600px',
    maxWidth: '90%',
    backgroundColor: CYBERPUNK.terminalBg,
    border: `2px solid ${CYBERPUNK.primary}`,
    boxShadow: `0 0 20px ${CYBERPUNK.primary}`,
    padding: '20px',
    color: CYBERPUNK.text
  },
  title: {
    color: CYBERPUNK.primary,
    marginTop: 0,
    borderBottom: `1px solid ${CYBERPUNK.primary}`,
    paddingBottom: '10px'
  },
  linkBox: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '10px',
    margin: '10px 0',
    wordBreak: 'break-all'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    borderTop: `1px solid ${CYBERPUNK.primary}`,
    paddingTop: '15px'
  },
  button: {
    padding: '8px 15px',
    backgroundColor: CYBERPUNK.terminalBg,
    color: CYBERPUNK.success,
    border: `1px solid ${CYBERPUNK.success}`,
    cursor: 'pointer'
  },
  secondaryButton: {
    color: CYBERPUNK.error,
    border: `1px solid ${CYBERPUNK.error}`
  },
  formGroup: {
    margin: '15px 0'
  },
  label: {
    display: 'block',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    padding: '8px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    border: `1px solid ${CYBERPUNK.primary}`,
    color: CYBERPUNK.text
  },
  popList: {
    maxHeight: '300px',
    overflowY: 'auto',
    margin: '10px 0',
    border: `1px solid ${CYBERPUNK.primary}`
  },
  popItem: {
    padding: '10px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    borderBottom: `1px solid ${CYBERPUNK.primary}`,
    transition: 'background-color 0.2s'
  },
  selectedPopItem: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)'
  },
  emptyMessage: {
    padding: '10px',
    textAlign: 'center'
  }
};

export default PopitTerminal;
