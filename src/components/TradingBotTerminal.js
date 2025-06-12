import React from 'react';
import Terminal from 'react-console-emulator';
import { ethers } from 'ethers';
import BotFactoryABI from '../etc/rawmaterial/BotFactory.json';
import TradingBotABI from '../etc/rawmaterial/TradingBotTerminal.json';

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

class TradingBotTerminal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      provider: null,
      signer: null,
      factory: null,
      currentBot: null,
      account: '',
      isConnected: false,
      showGUI: false,
      activePanel: 'dashboard',
      botName: '',
      botUPC: '',
      tokenName: '',
      tokenSymbol: '',
      transferAddress: '',
      botPrice: '50',
      discountApplied: false,
      dashboardOutput: [],
      botOutput: [],
      fundingAmount: '',
      currentBotBalance: null,
      factoryOutput: []
    };
    this.terminal = React.createRef();
  }

  componentDidMount() {
    this.initConnection();
  }

  initConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.enable();
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        
        const factory = new ethers.Contract(
          '0x59dd37c558df9c4a70c6802f97d78594783cdda0', // Replace with your factory address
          BotFactoryABI.abi,
          signer
        );

        const botPrice = await factory.botPrice();
        
        this.setState({
          provider,
          signer,
          factory,
          account,
          isConnected: true,
          botPrice: ethers.utils.formatEther(botPrice)
        });

        this.pushToTerminal(`[[success]]Connected to account: ${account}[[/success]]`);
        this.pushToTerminal(`Current bot price: ${ethers.utils.formatEther(botPrice)} MATIC`);
        this.pushToTerminal('Type "help" to see available commands');
      } else {
        throw new Error('No Ethereum provider detected');
      }
    } catch (error) {
      this.pushToTerminal(`[[error]]Connection error: ${error.message}[[/error]]`);
    }
  };

  pushToTerminal = (message) => {
    if (this.terminal.current) {
      this.terminal.current.pushToStdout(message);
    }
    
    const outputKey = `${this.state.activePanel}Output`;
    this.setState(prevState => ({
      [outputKey]: [...prevState[outputKey], message]
    }));
  };

  clearOutput = (panel) => {
    const outputKey = `${panel}Output`;
    this.setState({ [outputKey]: [] });
  };

  toggleGUI = () => {
    this.setState(prevState => ({ showGUI: !prevState.showGUI }));
  };

  setActivePanel = (panel) => {
    this.setState({ activePanel: panel });
  };

  handleInputChange = (e) => {
    console.log(`Setting ${e.target.name} to:`, e.target.value);
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  // Add to your TradingBotTerminal class
  fundBot = async (amount) => {
    try {
      if (!this.state.currentBot) {
        throw new Error('No bot loaded');
      }
  
      this.pushToTerminal(`Sending ${amount} MATIC to bot...`);
      
      // Direct MATIC transfer
      const tx = await this.state.signer.sendTransaction({
        to: this.state.currentBot.address,
        value: ethers.utils.parseEther(amount.toString())
      });
      
      await tx.wait();
      
      const newBalance = await this.state.provider.getBalance(this.state.currentBot.address);
      this.pushToTerminal(`[[success]]Success! Bot balance: ${ethers.utils.formatEther(newBalance)} MATIC[[/success]]`);
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Funding failed: ${error.message}[[/error]]`);
      return false;
    }
  };

  // Add to your TradingBotTerminal class
  checkBotBalance = async () => {
    try {
      if (!this.state.currentBot) {
        throw new Error('No bot loaded');
      }
 


 
      const balance = await this.state.provider.getBalance(
        this.state.currentBot.address
      );
      const formatted = ethers.utils.formatEther(balance);
      
      this.pushToTerminal(
        `[[success]]Bot balance: ${formatted} MATIC[[/success]]`
      );
      this.setState({ currentBotBalance: formatted });
      return formatted;
    } catch (error) {
      this.pushToTerminal(`[[error]]Balance check failed: ${error.message}[[/error]]`);
      return '0';
    }
  };



  // ========== BOT OPERATIONS ==========
  createBot = async () => {
    try {
      // Destructure all needed values from state
      const { 
        factory, 
        account, 
        botPrice, 
        discountApplied, 
        botName = '', 
        botUPC = '', 
        tokenName = '', 
        tokenSymbol = '' 
      } = this.state;
  
      // Debug current state values
      console.log('Current state:', {
        botName,
        botUPC,
        tokenName,
        tokenSymbol,
        account,
        botPrice,
        discountApplied
      });
  
      // Validate all inputs (without optional chaining)
      const missingFields = [];
      if (!botName || typeof botName !== 'string' || botName.trim() === '') missingFields.push('Bot Name');
      if (!botUPC || typeof botUPC !== 'string' || botUPC.trim() === '') missingFields.push('UPC');
      if (!tokenName || typeof tokenName !== 'string' || tokenName.trim() === '') missingFields.push('Token Name');
      if (!tokenSymbol || typeof tokenSymbol !== 'string' || tokenSymbol.trim() === '') missingFields.push('Token Symbol');
  
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
  
      // Rest of the function remains the same...
      if (!factory) {
        throw new Error('Factory contract not connected');
      }
  
      // Check if caller is the owner
      const owner = await factory.owner();
      const isOwner = owner.toLowerCase() === account.toLowerCase();
  
      // Calculate price
      let price;
      if (isOwner) {
        price = ethers.utils.parseEther("0");
        this.pushToTerminal('[[success]]Owner detected - creating bot for free![[/success]]');
      } else if (discountApplied) {
        const discountedPrice = Number(botPrice) * 0.05;
        price = ethers.utils.parseEther(discountedPrice.toString());
        this.pushToTerminal('[[success]]UPC owner detected - 95% discount applied![[/success]]');
      } else {
        price = ethers.utils.parseEther(botPrice.toString());
      }
  
      this.pushToTerminal(`Creating bot "${botName}" with UPC: ${botUPC}...`);
  
      // Execute transaction with proper gas estimation
      const tx = await factory.createBot(
        botName,
        botUPC,
        tokenName,
        tokenSymbol,
        { 
          value: price,
          gasLimit: 500000 // Sufficient gas limit
        }
      );
  
      const receipt = await tx.wait();
      
      // Get the new bot address from events
      let newBotAddress;
      if (receipt.events && receipt.events.length) {
        const botCreatedEvent = receipt.events.find(e => e.event === 'BotCreated');
        if (botCreatedEvent) {
          newBotAddress = botCreatedEvent.args.botAddress;
        }
      }
  
      // Fallback to getting from factory if event parsing fails
      if (!newBotAddress) {
        const bots = await factory.getAllBots();
        newBotAddress = bots[bots.length - 1].botAddress;
      }
  
      this.pushToTerminal(`[[success]]Bot created successfully![[/success]]`);
      this.pushToTerminal(`Address: ${newBotAddress}`);
      this.pushToTerminal(`Transaction: ${receipt.transactionHash}`);
  
      // Return the new bot address and transaction details
      return {
        address: newBotAddress,
        transaction: receipt.transactionHash
      };
  
    } catch (error) {
      console.error('Bot creation error:', error);
      
      // Extract meaningful error message
      let errorMessage = error.message;
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message;
      }
  
      this.pushToTerminal(`[[error]]Bot creation failed: ${errorMessage}[[/error]]`);
      
      // Re-throw for any upstream error handling
      throw new Error(`Bot creation failed: ${errorMessage}`);
    }
  };





  // Add this to your TradingBotTerminal class
  executeBotAction = async () => {
    try {
      if (!this.state.currentBot) {
        throw new Error('No bot loaded');
      }
  
      this.pushToTerminal('Executing bot action...');
      
      // Get the current bot balance
      const balance = await this.state.provider.getBalance(this.state.currentBot.address);
      if (balance.eq(0)) {
        throw new Error('Bot has no MATIC balance to perform action');
      }
  
      // Execute the action
      const tx = await this.state.currentBot.action({
        gasLimit: 300000 // Adjust gas limit as needed
      });
      
      await tx.wait();
      
      this.pushToTerminal('[[success]]Bot action executed successfully![[/success]]');
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error executing bot action: ${error.message}[[/error]]`);
      return false;
    }
  };

  loadBot = async (address) => {
    try {
      this.pushToTerminal(`Loading bot at: ${address}`);
      
      // First get bot info from factory
      const botInfo = await this.state.factory.getBotsByUser(address);
      
      // Then create the contract instance
      const bot = new ethers.Contract(
        address,
        TradingBotABI.abi,
        this.state.signer
      );
  
      this.setState({
        currentBot: bot,
        botName: botInfo.name,
        botUPC: botInfo.upc
      });
  
      this.pushToTerminal(`[[success]]Loaded bot "${botInfo.name}" (UPC: ${botInfo.upc})[[/success]]`);
      return bot;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error loading bot: ${error.message}[[/error]]`);
      throw error;
    }
  };



  transferBotOwnership = async (newOwner) => {
    try {
      if (!this.state.currentBot) {
        throw new Error('No bot loaded');
      }

      this.pushToTerminal(`Transferring ownership to: ${newOwner}`);
      const tx = await this.state.currentBot.transferOwnership(newOwner);
      await tx.wait();
      
      this.pushToTerminal('[[success]]Ownership transferred successfully![[/success]]');
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return false;
    }
  };

  // ========== FACTORY OPERATIONS ==========
  listBots = async () => {
    try {
      if (!this.state.factory) {
        throw new Error('Factory not connected');
      }

      const bots = await this.state.factory.getAllBots();
      
      this.pushToTerminal('[[header]]=== Deployed Bots ===[[/header]]');
      
      if (bots.length === 0) {
        this.pushToTerminal('No bots found');
        return [];
      }

      bots.forEach((bot, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${bot}`);
      });

      return bots;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return [];
    }
  };

  checkUPCOwnership = async (upc) => {
    try {
      const rawMaterial = new ethers.Contract(
        '0x2C343942548319cCfc05666FF15d73E8569FaEdf',
        ['function getUpcOwner(string calldata) external view returns (address)'],
        this.state.provider
      );

      const owner = await rawMaterial.getUpcOwner(upc);
      const isOwner = owner.toLowerCase() === this.state.account.toLowerCase();
      
      this.setState({ discountApplied: isOwner });
      
      if (isOwner) {
        this.pushToTerminal('[[success]]UPC owner detected - 95% discount applied![[/success]]');
      } else {
        this.pushToTerminal('No discount available for this UPC');
      }
      
      return isOwner;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error checking UPC: ${error.message}[[/error]]`);
      return false;
    }
  };

  // ========== GUI RENDERING ==========
  renderDashboardPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>BOT DASHBOARD</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CURRENT BOT</h3>
            <div style={styles.infoBox}>
              {this.state.currentBot ? (
                <>
                  <p>Address: {this.state.currentBot.address.substring(0, 12)}...</p>
                  <p>Name: {this.state.botName}</p>
                  <p>UPC: {this.state.botUPC}</p>
                </>
              ) : (
                <p>No bot loaded</p>
              )}
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>FUND BOT</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="fundingAmount"
                value={this.state.fundingAmount}
                onChange={this.handleInputChange}
                placeholder="MATIC Amount"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.fundBot(this.state.fundingAmount)}
              >
                SEND MATIC
              </button>
            </div>
          </div>
          // Add this grid item to your dashboard panel's gridContainer
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>BOT ACTION</h3>
            <div style={styles.infoBox}>
              <button 
                style={styles.button}
                onClick={this.executeBotAction}
              >
                EXECUTE ACTION
              </button>
              <p style={{ color: CYBERPUNK.secondary, fontSize: '12px', marginTop: '10px' }}>
                Transfers bot balance to manager contract
              </p>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>BOT BALANCE</h3>
            <div style={styles.infoBox}>
              <button 
                style={styles.button}
                onClick={this.checkBotBalance}
              >
                CHECK BALANCE
              </button>
              {this.state.currentBotBalance && (
                <p style={{ color: CYBERPUNK.success, marginTop: '10px' }}>
                  {this.state.currentBotBalance} MATIC
                </p>
              )}
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>OWNERSHIP</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="transferAddress"
                value={this.state.transferAddress}
                onChange={this.handleInputChange}
                placeholder="New Owner Address"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.transferBotOwnership(this.state.transferAddress)}
              >
                TRANSFER OWNERSHIP
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

  renderBotPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>BOT MANAGEMENT</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CREATE BOT</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="botName"
                value={this.state.botName}
                onChange={this.handleInputChange}
                placeholder="Bot Name"
                style={styles.input}
              />
              <input
                type="text"
                name="botUPC"
                value={this.state.botUPC}
                onChange={this.handleInputChange}
                placeholder="UPC Code"
                style={styles.input}
              />
              <input
                type="text"
                name="tokenName"
                value={this.state.tokenName}
                onChange={this.handleInputChange}
                placeholder="Token Name"
                style={styles.input}
              />
              <input
                type="text"
                name="tokenSymbol"
                value={this.state.tokenSymbol}
                onChange={this.handleInputChange}
                placeholder="Token Symbol"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => {
                  this.checkUPCOwnership(this.state.botUPC).then(() => {
                    this.createBot();  // Remove parameters
                  });
                }}
              >
                {this.state.discountApplied ? 'CREATE (95% OFF)' : 'CREATE BOT'}
              </button>
              <div style={styles.divider}></div>
              <p style={{ color: CYBERPUNK.secondary }}>
                Current Price: {this.state.botPrice} MATIC
                {this.state.discountApplied ? ' (5% with discount)' : ''}
              </p>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>LOAD BOT</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="botAddress"
                value={this.state.botAddress}
                onChange={this.handleInputChange}
                placeholder="Bot Address"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.loadBot(this.state.botAddress)}
              >
                LOAD BOT
              </button>
            </div>
          </div>
        </div>
        {this.renderOutputArea(this.state.botOutput)}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button 
            style={{ ...styles.button, width: 'auto', padding: '5px 10px' }}
            onClick={() => this.clearOutput('bot')}
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
            <h3 style={styles.subTitle}>LIST BOTS</h3>
            <div style={styles.infoBox}>
              <button 
                style={styles.button}
                onClick={this.listBots}
              >
                LIST ALL BOTS
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
        {/* Scanlines overlay */}
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

        {/* Main content */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
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
              CYBERPUNK TRADING BOT TERMINAL
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

          {/* Main content area */}
          {showGUI ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Navigation */}
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
                  onClick={() => this.setActivePanel('bot')}
                  style={{
                    ...styles.navButton,
                    borderBottom: activePanel === 'bot' ? `2px solid ${CYBERPUNK.primary}` : 'none'
                  }}
                >
                  BOT MGMT
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
              </div>

              {/* Panel content */}
              <div style={{
                flex: 1,
                overflow: 'auto'
              }}>
                {activePanel === 'dashboard' && this.renderDashboardPanel()}
                {activePanel === 'bot' && this.renderBotPanel()}
                {activePanel === 'factory' && this.renderFactoryPanel()}
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
                create: {
                  description: 'Create new trading bot',
                  usage: 'create <name> <upc> <tokenName> <tokenSymbol>',
                  fn: (...args) => {
                    this.checkUPCOwnership(args[1]).then(() => {
                      this.createBot(args[0], args[1], args[2], args[3]);
                    });
                  }
                },
                load: {
                  description: 'Load existing bot',
                  usage: 'load <address>',
                  fn: (address) => this.loadBot(address)
                },
                fund: {
                  description: 'Send MATIC to loaded bot',
                  usage: 'fund <amount>',
                  fn: (amount) => this.fundBot(amount)
                },
                balance: {
                  description: 'Check bot MATIC balance',
                  fn: this.checkBotBalance
                },
                transfer: {
                  description: 'Transfer bot ownership',
                  usage: 'transfer <newOwner>',
                  fn: (newOwner) => this.transferBotOwnership(newOwner)
                },
                list: {
                  description: 'List all deployed bots',
                  fn: this.listBots
                },
                checkupc: {
                  description: 'Check UPC ownership for discount',
                  usage: 'checkupc <upc>',
                  fn: (upc) => this.checkUPCOwnership(upc)
                }
              }}
              dangerMode={true}
              welcomeMessage={`
                [[header]]
                ===================================
                CYBERPUNK TRADING BOT TERMINAL v3.1
                ===================================
                [[/header]]
                [[secondary]]Type 'help' for command list[[/secondary]]
                ${this.state.isConnected ? 
                  `\nConnected: ${this.state.account}` : 
                  '\n[[error]]Not connected[[/error]]'}
              `}
              ignoreCommandCase={true}
              promptLabel={'user@bot-terminal:~$'}
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

export default TradingBotTerminal;
