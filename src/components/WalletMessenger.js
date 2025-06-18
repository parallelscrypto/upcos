import React, { Component } from 'react';
import { ethers } from 'ethers';
import Terminal from 'react-console-emulator';
import Arweave from 'arweave';
import * as eccrypto from 'eccrypto';

// Initialize Arweave
const arweave = Arweave.init({});

// Contract address and ABI
const MESSAGE_REGISTRY_ADDRESS = "0x79AB92caBfE60416D79a3149C5889423160aedB6";
const MESSAGE_REGISTRY_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "arweaveTxId",
				"type": "string"
			}
		],
		"name": "MessageSent",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "publicKey",
				"type": "bytes"
			}
		],
		"name": "PublicKeyRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_recipient",
				"type": "address"
			}
		],
		"name": "getMessages",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "recipient",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "arweaveTxId",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct MessageRegistry.Message[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "messages",
		"outputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "arweaveTxId",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "publicKeys",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "_publicKey",
				"type": "bytes"
			}
		],
		"name": "registerPublicKey",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_recipient",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_arweaveTxId",
				"type": "string"
			}
		],
		"name": "sendMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

class WalletMessengerTerminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      provider: null,
      signer: null,
      contract: null,
      account: '',
      publicKey: '',
      messages: [],
      isConnected: false,
      connectionError: null
    };
    this.terminal = React.createRef();
  }

  pushToTerminal = (message) => {
    if (this.terminal.current) {
      this.terminal.current.pushToStdout(message);
    } else {
      console.log('Terminal not ready:', message);
    }
  };

async componentDidMount() {
  // Ensure MetaMask connection
  if (window.ethereum) {
    await window.ethereum.enable(); 
    await this.checkWalletConnection();
  }
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
        this.pushToTerminal(
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
      this.pushToTerminal(
        `[[error]]Connection error: ${error.message}[[/error]]`
      );
    }
  }

  async connectWallet() {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await this.loadBlockchainData();
    } catch (error) {
      this.pushToTerminal(
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
      messages: []
    });
    this.pushToTerminal('[[warning]]Wallet disconnected[[/warning]]');
  }

  async loadBlockchainData() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      
      const contract = new ethers.Contract(
        MESSAGE_REGISTRY_ADDRESS,
        MESSAGE_REGISTRY_ABI,
        signer
      );

      this.setState({ 
        contract,
        provider,
        signer,
        account,
        isConnected: true
      });

      this.pushToTerminal(
        `[[success]]Connected to account: ${account}[[/success]]`
      );

      //await this.fetchPublicKey();
      //await this.fetchMessages();
      
    } catch (error) {
      this.setState({ connectionError: error.message });
      this.pushToTerminal(
        `[[error]]Error: ${error.message}[[/error]]`
      );
      console.error("Blockchain connection error:", error);
    }
  }




  async fetchPublicKey() {
    try {
      const { contract, account } = this.state;
      const publicKey = await contract.publicKeys(account);
      this.setState({ publicKey });
      return publicKey;
    } catch (error) {
      this.terminal.current.pushToStdout(`[[error]]Error fetching public key: ${error.message}[[/error]]`);
      throw error;
    }
  }

  async sendMessage(recipientAddress, ...messageParts) {
    try {
      const { contract } = this.state;
      const message = messageParts.join(' ');

      // Get recipient's public key
      const recipientPublicKey = await contract.publicKeys(recipientAddress);
      if (!recipientPublicKey) {
        throw new Error("Recipient has no registered public key!");
      }

      // Encrypt message
      const encrypted = await eccrypto.encrypt(
        Buffer.from(recipientPublicKey.slice(2), "hex"),
        Buffer.from(message)
      );

      // Upload to Arweave
      const data = JSON.stringify({
        iv: encrypted.iv.toString("hex"),
        ciphertext: encrypted.ciphertext.toString("hex"),
        ephemPublicKey: encrypted.ephemPublicKey.toString("hex"),
        mac: encrypted.mac.toString("hex"),
      });
      
      const transaction = await arweave.createTransaction({ data });
      await arweave.transactions.sign(transaction);
      await arweave.transactions.post(transaction);
      const arweaveTxId = transaction.id;

      // Store reference on-chain
      const tx = await contract.sendMessage(recipientAddress, arweaveTxId);
      await tx.wait();

      this.terminal.current.pushToStdout(`[[success]]Message sent! Arweave TX ID: ${arweaveTxId}[[/success]]`);
      return arweaveTxId;
    } catch (error) {
      this.terminal.current.pushToStdout(`[[error]]Error sending message: ${error.message}[[/error]]`);
      throw error;
    }
  }

  async fetchMessages() {
    try {
      const { contract, account, signer } = this.state;
      const messages = await contract.getMessages(account);
      
      const decryptedMessages = await Promise.all(
        messages.map(async (msg) => {
          const data = await arweave.transactions.getData(msg.arweaveTxId, { decode: true });
          const encrypted = JSON.parse(data);

          const decrypted = await eccrypto.decrypt(
            Buffer.from(signer._signingKey().privateKey.slice(2), "hex"),
            {
              iv: Buffer.from(encrypted.iv, "hex"),
              ciphertext: Buffer.from(encrypted.ciphertext, "hex"),
              ephemPublicKey: Buffer.from(encrypted.ephemPublicKey, "hex"),
              mac: Buffer.from(encrypted.mac, "hex"),
            }
          );

          return {
            sender: msg.sender,
            message: decrypted.toString(),
            timestamp: new Date(msg.timestamp * 1000).toLocaleString(),
            arweaveTxId: msg.arweaveTxId
          };
        })
      );

      this.setState({ messages: decryptedMessages });
      this.terminal.current.pushToStdout(`[[success]]Fetched ${decryptedMessages.length} messages[[/success]]`);
      return decryptedMessages;
    } catch (error) {
      this.terminal.current.pushToStdout(`[[error]]Error fetching messages: ${error.message}[[/error]]`);
      throw error;
    }
  }

  listMessages() {
    const { messages } = this.state;
    if (messages.length === 0) {
      this.terminal.current.pushToStdout('[[warning]]No messages found[[/warning]]');
      return;
    }

    messages.forEach((msg, i) => {
      this.terminal.current.pushToStdout(`[[header]]=== Message ${i + 1} ===[[/header]]`);
      this.terminal.current.pushToStdout(`From: ${msg.sender}`);
      this.terminal.current.pushToStdout(`Time: ${msg.timestamp}`);
      this.terminal.current.pushToStdout(`Arweave ID: ${msg.arweaveTxId}`);
      this.terminal.current.pushToStdout(`Message: ${msg.message}`);
      this.terminal.current.pushToStdout('');
    });
  }









async getPublicKey() {
  const { account } = this.state;
  
  try {
    this.pushToTerminal("[[info]]Please approve the signature request in MetaMask[[/info]]");
    console.log("Initiating public key derivation...");

    // 1. Ensure window has focus
    window.focus();
    
    // 2. Use a distinctive, recognizable message
    const message = `WalletMessenger Public Key Derivation for ${account}`;
    
    // 3. Add a 2-second delay to ensure MetaMask is ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. Use the most compatible signing method
    let signature;
    try {
      signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account]
      });
    } catch (error) {
      console.error("MetaMask signing error:", error);
      throw new Error("User denied message signature");
    }

    console.log("Signature obtained:", signature);
    
    // 5. Recover public key with additional validation
    const msgHash = ethers.utils.hashMessage(message);
    let publicKey;
    try {
      publicKey = ethers.utils.recoverPublicKey(msgHash, signature);
    } catch (error) {
      console.error("Public key recovery failed:", error);
      throw new Error("Invalid signature obtained");
    }

    // 6. Return compressed public key
    return ethers.utils.computePublicKey(publicKey, true);
    
  } catch (error) {
    console.error("Public key derivation failed:", error);
    this.pushToTerminal(`[[error]]Failed to derive public key: ${error.message}[[/error]]`);
    throw error;
  }
}

async registerPublicKey() {
  try {
    // 1. First verify connection
    if (!this.state.isConnected) {
      throw new Error("Wallet not connected");
    }

    // 2. Get public key with visual feedback
    this.pushToTerminal("[[info]]Step 1/2: Deriving public key...[[/info]]");
    const publicKey = await this.getPublicKey();
    
    // 3. Register with clear progress indication
    this.pushToTerminal("[[info]]Step 2/2: Registering on blockchain...[[/info]]");
    const tx = await this.state.contract.registerPublicKey(publicKey, {
      gasLimit: 500000 // Sufficient gas for this operation
    });

    this.pushToTerminal(`[[info]]Transaction sent: ${tx.hash}[[/info]]`);
    
    // 4. Wait for confirmation with timeout
    const receipt = await Promise.race([
      tx.wait(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Transaction timeout after 60 seconds")), 60000)
      )
    ]);

    this.pushToTerminal("[[success]]Public key registered successfully![[/success]]");
    return true;

  } catch (error) {
    console.error("Registration failed:", error);
    this.pushToTerminal(`[[error]]Registration failed: ${error.message}[[/error]]`);
    
    // Special handling for common MetaMask errors
    if (error.message.includes("User denied")) {
      this.pushToTerminal("[[warning]]You need to approve the request in MetaMask[[/warning]]");
    } else if (error.message.includes("timeout")) {
      this.pushToTerminal("[[warning]]The transaction took too long. Try again with higher gas.[[/warning]]");
    }
    
    return false;
  }
}












  render() {
    const welcomeMsg = `
      [[header]]
      ===================================
      Wallet Messenger Terminal
      ===================================
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
          ref={this.terminal}
          style={{
            minHeight: "75vh",
            backgroundColor: "#1a1a2e",
            zIndex: "99",
            borderRadius: "5px",
            padding: "10px",
            fontFamily: "monospace"
          }}
          commands={{
            connect: {
              description: 'Connect your wallet',
              fn: async () => await this.connectWallet()
            },

                  register: {
                    description: 'Register your public key',
                    fn: async () => {
                      try {
                        const success = await this.registerPublicKey();
                        return success ? "Registration successful" : "Registration failed";
                      } catch (error) {
                        return `Error: ${error.message}`;
                      }
                    }
                  },

            send: {
              description: 'Send encrypted message to recipient',
              usage: 'send <recipientAddress> <message>',
              fn: async (...args) => await this.sendMessage(...args)
            },
            fetch: {
              description: 'Fetch and decrypt your messages',
              fn: async () => await this.fetchMessages()
            },
            list: {
              description: 'List your messages',
              fn: () => this.listMessages()
            }
          }}
          dangerMode={true}
          welcomeMessage={welcomeMsg}
          ignoreCommandCase={true}
          promptLabel={'user@messenger:~$'}
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
      </div>
    );
  }
}

export default WalletMessengerTerminal;
