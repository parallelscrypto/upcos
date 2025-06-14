import React from 'react';
import Terminal from 'react-console-emulator';
import { ethers } from 'ethers';
import SerialBoxFactoryABI from '../etc/rawmaterial/SerialBoxFactory.json';
import SerialBoxABI from '../etc/rawmaterial/SerialBox.json';
import { sha256 } from 'js-sha256';

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

class SerialBoxTerminal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      provider: null,
      signer: null,
      factory: null,
      currentBox: null,
      account: '',
      isConnected: false,
      showGUI: false,
      activePanel: 'dashboard',
      upc: '',
      serialNumber: '',
      fullURL: '',
      message: '',
      transferAddress: '',
      creationPrice: '0.1',
      discountApplied: false,
      dashboardOutput: [],
      boxOutput: [],
      fundingAmount: '',
      currentBoxBalance: null,
      factoryOutput: [],
      password: '',
      passwordHash: '',
      serialAddress: props.address,
      claimPassword: ''
    };
    this.terminal = React.createRef();
  }

  componentDidMount() {
    this.initConnection();
console.log("serialbox is ", this.state.serialAddress);
  }

  initConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.enable();
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        
        const factory = new ethers.Contract(
          '0x953131F7cD8811dA5991bBECFaF6dF8225a8c212', // Replace with your factory address
          SerialBoxFactoryABI.abi,
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
        this.pushToTerminal(`Current creation price: ${ethers.utils.formatEther(creationPrice)} ETH`);
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
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  // ========== BOX OPERATIONS ==========
  createSerialBox = async () => {
    try {
      const { factory, account, creationPrice, discountApplied, upc } = this.state;
  
      if (!upc) {
        throw new Error('UPC cannot be empty');
      }
  
      this.pushToTerminal(`Creating SerialBox with UPC: ${upc}...`);
  
      // Calculate price
      let price;
      if (discountApplied) {
        const discountedPrice = Number(creationPrice) * 0.05;
        price = ethers.utils.parseEther(discountedPrice.toString());
        this.pushToTerminal('[[success]]UPC owner detected - 95% discount applied![[/success]]');
      } else {
        price = ethers.utils.parseEther(creationPrice.toString());
      }
  
      const tx = await factory.createSerialBox(upc, { value: price });
      const receipt = await tx.wait();
      
      // Get the new box address from events
      let newBoxAddress;
      if (receipt.events && receipt.events.length) {
        const boxCreatedEvent = receipt.events.find(e => e.event === 'SerialBoxCreated');
        if (boxCreatedEvent) {
          newBoxAddress = boxCreatedEvent.args.contractAddress;
        }
      }
  
      // Fallback to getting from factory if event parsing fails
      if (!newBoxAddress) {
        const boxes = await factory.getSerialBoxesByOwner(account);
        newBoxAddress = boxes[boxes.length - 1].contractAddress;
      }
  
      this.pushToTerminal(`[[success]]SerialBox created successfully![[/success]]`);
      this.pushToTerminal(`Address: ${newBoxAddress}`);
      this.pushToTerminal(`Transaction: ${receipt.transactionHash}`);
  
      return {
        address: newBoxAddress,
        transaction: receipt.transactionHash
      };
    } catch (error) {
      let errorMessage = error.reason || error.message;
      this.pushToTerminal(`[[error]]Creation failed: ${errorMessage}[[/error]]`);
      throw error;
    }
  };


  loadBox = async (address) => {
    if(!address) {
       address = this.state.serialAddress;
    }
    try {
      this.pushToTerminal(`Loading SerialBox at: ${address}`);
      
      const box = new ethers.Contract(
        address,
        SerialBoxABI.abi,
        this.state.signer
      );
  
      // Get box info
      const info = await box.getInfo();
      
      // Handle potential hex string conversion
      let displaySerial = info._serialNumber;
      try {
        // Try to convert if it's in hex format
        if (info._serialNumber.startsWith('0x')) {
          displaySerial = ethers.utils.toUtf8String(info._serialNumber);
        }
      } catch (e) {
        // If conversion fails, keep the raw value
        displaySerial = info._serialNumber;
      }
  
      // Try to get password hash, but don't fail if we can't
      let passwordHash = '';
      try {
        passwordHash = await box.getPasswordHash();
      } catch (e) {
        this.pushToTerminal('[[secondary]]Note: Could not retrieve password hash (owner-only)[[/secondary]]');
      }
  
      this.setState({
        currentBox: box,
        upc: info._upc,
        serialNumber: displaySerial,
        fullURL: info._fullURL,
        message: info._message,
        passwordHash: passwordHash
      });
  
      const successMessage = `[[success]]Loaded SerialBox:
  Address: ${address}
  UPC: ${info._upc}
  Serial: ${displaySerial}
  URL: ${info._fullURL}
  Message: ${info._message}
  Balance: ${ethers.utils.formatEther(info._balance)} tokens[[/success]]`;
      
      this.pushToTerminal(successMessage);
      return successMessage;
    } catch (error) {
      const errorMessage = `[[error]]Error loading box: ${error.message}[[/error]]`;
      this.pushToTerminal(errorMessage);
      throw error;
    }
  };





  fundBox = async (amount) => {
    try {
      if (!this.state.currentBox) {
        throw new Error('No box loaded');
      }
  
      this.pushToTerminal(`Sending ${amount} tokens to box...`);
      
      const tx = await this.state.currentBox.deposit(
        ethers.utils.parseEther(amount.toString())
      );
      
      await tx.wait();
      
      const newBalance = await this.state.currentBox.balance();
      this.pushToTerminal(`[[success]]Success! Box balance: ${ethers.utils.formatEther(newBalance)} tokens[[/success]]`);
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Funding failed: ${error.message}[[/error]]`);
      return false;
    }
  };

  claimTokens = async () => {
    try {
      if (!this.state.currentBox) {
        throw new Error('No box loaded');
      }
  
      this.pushToTerminal(`Attempting to claim tokens with password...`);
      
      const tx = await this.state.currentBox.claim(this.state.claimPassword);
      await tx.wait();
      
      this.pushToTerminal('[[success]]Tokens claimed successfully![[/success]]');
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Claim failed: ${error.message}[[/error]]`);
      return false;
    }
  };

  setBoxMessage = async () => {
    try {
      if (!this.state.currentBox) {
        throw new Error('No box loaded');
      }
  
      this.pushToTerminal(`Updating box message...`);
      
      const tx = await this.state.currentBox.setMessage(this.state.message);
      await tx.wait();
      
      this.pushToTerminal('[[success]]Message updated successfully![[/success]]');
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Update failed: ${error.message}[[/error]]`);
      return false;
    }
  };

  setBoxPassword = async () => {
    try {
      if (!this.state.currentBox) {
        throw new Error('No box loaded');
      }
  
      this.pushToTerminal(`Setting new password hash...`);
      
      // Generate SHA-256 hash of the password
      const hash = '0x' + sha256(this.state.password);
      
      const tx = await this.state.currentBox.setPasswordHash(hash);
      await tx.wait();
      
      this.setState({ passwordHash: hash });
      this.pushToTerminal('[[success]]Password hash set successfully![[/success]]');
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Password update failed: ${error.message}[[/error]]`);
      return false;
    }
  };



  updateURL = async () => {
    try {
      if (!this.state.currentBox) {
        throw new Error('No box loaded');
      }
  
      if (!this.state.fullURL) {
        throw new Error('URL cannot be empty');
      }
  
      this.pushToTerminal(`Updating URL to: ${this.state.fullURL}`);
      
      // Call the updateURL function directly on the box contract
      const tx = await this.state.currentBox.updateURL(this.state.fullURL, {
        gasLimit: 500000 // Set appropriate gas limit
      });
      
      const receipt = await tx.wait();
      
      // Refresh data
      const info = await this.state.currentBox.getInfo();
      this.setState({
        fullURL: info._fullURL,
        serialNumber: info._serialNumber
      });
      
      this.pushToTerminal(`[[success]]URL updated! New serial: ${info._serialNumber}[[/success]]`);
      this.pushToTerminal(`Transaction hash: ${receipt.transactionHash}`);
      
      return true;
    } catch (error) {
      let errorMsg = error.reason || error.message;
      this.pushToTerminal(`[[error]]Update failed: ${errorMsg}[[/error]]`);
      return false;
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

  // ========== FACTORY OPERATIONS ==========
  listBoxes = async () => {
    try {
      if (!this.state.factory) {
        throw new Error('Factory not connected');
      }

      const boxes = await this.state.factory.getSerialBoxesByOwner(this.state.account);
      
      this.pushToTerminal('[[header]]=== Your SerialBoxes ===[[/header]]');
      
      if (boxes.length === 0) {
        this.pushToTerminal('No boxes found');
        return [];
      }

      boxes.forEach((box, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${box.contractAddress} - UPC: ${box.upc}`);
      });

      return boxes;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return [];
    }
  };

  // ========== GUI RENDERING ==========
  renderDashboardPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>SERIAL BOX DASHBOARD</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CURRENT BOX</h3>
            <div style={styles.infoBox}>
              {this.state.currentBox ? (
                <>
                  <p>Address: {this.state.currentBox.address.substring(0, 12)}...</p>
                  <p>UPC: {this.state.upc}</p>
                  <p>Serial: {this.state.serialNumber}</p>
                  <p>URL: {this.state.fullURL}</p>
                </>
              ) : (
                <p>No box loaded</p>
              )}
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>FUND BOX</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="fundingAmount"
                value={this.state.fundingAmount}
                onChange={this.handleInputChange}
                placeholder="Token Amount"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.fundBox(this.state.fundingAmount)}
              >
                DEPOSIT TOKENS
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CLAIM TOKENS</h3>
            <div style={styles.infoBox}>
              <input
                type="password"
                name="claimPassword"
                value={this.state.claimPassword}
                onChange={this.handleInputChange}
                placeholder="Password"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={this.claimTokens}
              >
                CLAIM TOKENS
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>BOX SETTINGS</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="message"
                value={this.state.message}
                onChange={this.handleInputChange}
                placeholder="New Message"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={this.setBoxMessage}
              >
                SET MESSAGE
              </button>
              <div style={styles.divider}></div>
              <input
                type="password"
                name="password"
                value={this.state.password}
                onChange={this.handleInputChange}
                placeholder="New Password"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={this.setBoxPassword}
              >
                SET PASSWORD
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

  renderBoxPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>BOX MANAGEMENT</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CREATE BOX</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="upc"
                value={this.state.upc}
                onChange={this.handleInputChange}
                placeholder="UPC Code"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => {
                  this.checkUPCOwnership(this.state.upc).then(() => {
                    this.createSerialBox();
                  });
                }}
              >
                {this.state.discountApplied ? 'CREATE (95% OFF)' : 'CREATE BOX'}
              </button>
              <div style={styles.divider}></div>
              <p style={{ color: CYBERPUNK.secondary }}>
                Current Price: {this.state.creationPrice} ETH
                {this.state.discountApplied ? ' (5% with discount)' : ''}
              </p>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>LOAD BOX</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="boxAddress"
                value={this.state.boxAddress}
                onChange={this.handleInputChange}
                placeholder="Box Address"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.loadBox(this.state.boxAddress)}
              >
                LOAD BOX
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>UPDATE URL</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="fullURL"
                value={this.state.fullURL}
                onChange={this.handleInputChange}
                placeholder="New Full URL"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={this.updateURL}
              >
                UPDATE URL
              </button>
              {this.state.serialNumber && (
                <p style={{ color: CYBERPUNK.secondary, marginTop: '10px' }}>
                  Current Serial: {this.state.serialNumber}
                </p>
              )}
            </div>
          </div>
        </div>
        {this.renderOutputArea(this.state.boxOutput)}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button 
            style={{ ...styles.button, width: 'auto', padding: '5px 10px' }}
            onClick={() => this.clearOutput('box')}
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
            <h3 style={styles.subTitle}>LIST BOXES</h3>
            <div style={styles.infoBox}>
              <button 
                style={styles.button}
                onClick={this.listBoxes}
              >
                LIST YOUR BOXES
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
              SERIAL BOX TERMINAL
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
                  onClick={() => this.setActivePanel('box')}
                  style={{
                    ...styles.navButton,
                    borderBottom: activePanel === 'box' ? `2px solid ${CYBERPUNK.primary}` : 'none'
                  }}
                >
                  BOX MGMT
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
                {activePanel === 'box' && this.renderBoxPanel()}
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
                  description: 'Create new SerialBox',
                  usage: 'create <upc>',
                  fn: (upc) => {
                    this.checkUPCOwnership(upc).then(() => {
                      this.createSerialBox();
                    });
                  }
                },
                load: {
                  description: 'Load existing box',
                  usage: 'load <address>',
                  fn: async (address) => {
                    try {
                      await this.loadBox(address);
                      return ''; // Return empty string since we already pushed output
                    } catch (error) {
                      return error.message; // Return error message
                    }
                  }
                },
                fund: {
                  description: 'Send tokens to loaded box',
                  usage: 'fund <amount>',
                  fn: (amount) => this.fundBox(amount)
                },
                claim: {
                  description: 'Claim tokens from box',
                  usage: 'claim <password>',
                  fn: (password) => this.claimTokens(password)
                },
                setmsg: {
                  description: 'Set box message',
                  usage: 'setmsg <message>',
                  fn: (message) => this.setBoxMessage(message)
                },
                setpass: {
                  description: 'Set box password',
                  usage: 'setpass <password>',
                  fn: (password) => this.setBoxPassword(password)
                },
                updateurl: {
                  description: 'Update box URL',
                  usage: 'updateurl <url>',
                  fn: (url) => this.updateURL(url)
                },
                list: {
                  description: 'List your SerialBoxes',
                  fn: this.listBoxes
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
                SERIAL BOX TERMINAL v1.0
                ===================================
                [[/header]]
                [[secondary]]Type 'help' for command list[[/secondary]]
                ${this.state.isConnected ? 
                  `\nConnected: ${this.state.account}` : 
                  '\n[[error]]Not connected[[/error]]'}
              `}
              ignoreCommandCase={true}
              promptLabel={'user@serialbox-terminal:~$'}
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

// Reuse your existing styles object

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

export default SerialBoxTerminal;
