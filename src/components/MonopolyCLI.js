import React, { Component } from 'react';
import { ethers } from 'ethers';
import Terminal from 'react-console-emulator';

class MonopolyCLI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPlayer: 0,
      players: [],
      properties: [],
      diceRolled: false,
      gameStarted: false,
      currentPosition: 0,
      lastRoll: [0, 0],
      account: '',
      provider: null,
      signer: null,
      isConnected: false,
      connectionError: null,
      showRentModal: false,
      showBuyModal: false,
      showVisitModal: false,
      rentMessage: '',
      buyMessage: '',
      visitMessage: '',
      upcFrameUrl: '',
      cliCollapsed: true,
      config: {
        numSpaces: 16,
        numPlayers: 2,
        startingBalance: 2000,
        propertyGroups: 4,
        propertiesPerGroup: 3,
        rentBase: 50,
        rentMultiplier: 2,
        upcBaseUrl: 'https://7o252axqwnmwry3e6ws7a77uuxksdmzvvuvwzybtdcbwd2xgff7a.arweave.net/-7XdAvCzWWjjZPWl8H_0pdUhszWtK2zgMxiDYermKX4/index.html#/intel/'
      }
    };
    this.terminal = React.createRef();
  }

  componentDidMount() {
    this.initGame();
    this.addStyles();
  }


  async connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Ethereum wallet");
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      this.setState({
        provider,
        signer,
        account: address,
        isConnected: true
      }, () => {
        this.terminal.current.pushToStdout(`[[success]]Connected to wallet: ${address}[[/success]]`);
      });
      
      // Set up event listeners
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.handleDisconnect();
        } else {
          this.setState({ account: accounts[0] }, () => {
            this.terminal.current.pushToStdout(`[[info]]Account changed to: ${accounts[0]}[[/info]]`);
          });
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      
    } catch (error) {
      this.terminal.current.pushToStdout(`[[error]]Connection error: ${error.message}[[/error]]`);
    }
  }

  handleDisconnect() {
    this.setState({
      account: '',
      provider: null,
      signer: null,
      isConnected: false
    }, () => {
      this.terminal.current.pushToStdout('[[warning]]Wallet disconnected[[/warning]]');
    });
  }


  visitSpace = (spaceId) => {
    const { properties, config } = this.state;
    const property = properties[spaceId];
    
    if (property.upc === 'START') {
      this.terminal.current.pushToStdout('[[info]]START NODE HAS NO UPC DATA.[[/info]]');
      return;
    }
    
    // Create the UPC URL
    const upcData = { code: property.upc };
    const upcJson = JSON.stringify(upcData);
    const upcBase64 = btoa(unescape(encodeURIComponent(upcJson))); // Proper base64 encoding
    const upcUrl = `${config.upcBaseUrl}${upcBase64}`;
    
    this.setState({
      showVisitModal: true,
      visitMessage: `> ACCESSING UPC DATABASE FOR: ${property.upc}`,
      upcFrameUrl: upcUrl
    });
  };


  addStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      .cyberpunk-container {
        position: relative;
        background-color: #0a0a1a;
        color: #00ff99;
        font-family: 'Courier New', monospace;
        min-height: 100vh;
        padding: 10px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
      }
      h1 {
        text-align: center;
        color: #ff00ff;
        margin-bottom: 10px;
        text-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff;
        font-weight: bold;
        letter-spacing: 2px;
      }
      .board {
        position: relative;
        width: 100%;
        aspect-ratio: 1/1;
        margin: 0 auto;
        background-color: #121230;
        border-radius: 5px;
        box-shadow: 0 0 15px rgba(0, 255, 153, 0.3);
        overflow: hidden;
        border: 1px solid #00ff99;
      }
      .space {
        position: absolute;
        width: 20%;
        height: 20%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-size: 12px;
        padding: 2px;
        border: 1px solid #444477;
        background-color: #1a1a3a;
        transition: all 0.3s;
        color: #00ffff;
        box-shadow: inset 0 0 5px rgba(0, 255, 255, 0.2);
        cursor: pointer;
      }
      .space:hover {
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        transform: scale(1.05);
        z-index: 5;
      }
      .space.owned {
        opacity: 0.9;
        border: 1px solid #ff00ff;
      }
      .space.start {
        background-color: #003300;
        color: #00ff66;
        border: 1px solid #00ff66;
      }
      .group-0 { background-color: #330033; border-color: #ff00ff; }
      .group-1 { background-color: #003333; border-color: #00ffff; }
      .group-2 { background-color: #333300; border-color: #ffff00; }
      .group-3 { background-color: #330000; border-color: #ff6600; }
      .player {
        position: absolute;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        z-index: 10;
        font-size: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: black;
        font-weight: bold;
        box-shadow: 0 0 5px currentColor;
      }
      .controls {
        margin-top: 20px;
        padding: 15px;
        background-color: #121230;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 255, 153, 0.2);
        border: 1px solid #00ff99;
      }
      button {
        background-color: #330066;
        color: #cc00ff;
        border: 1px solid #cc00ff;
        padding: 12px 15px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 16px;
        width: 100%;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.3s;
        box-shadow: 0 0 5px rgba(204, 0, 255, 0.5);
      }
      button:hover {
        background-color: #440088;
        box-shadow: 0 0 10px rgba(204, 0, 255, 0.8);
      }
      button:disabled {
        background-color: #222244;
        color: #666677;
        border-color: #666677;
        cursor: not-allowed;
        box-shadow: none;
      }
      .status {
        margin-bottom: 15px;
        padding: 10px;
        background-color: #1a1a3a;
        border-radius: 5px;
        border: 1px solid #444477;
        color: #ffff00;
        font-weight: bold;
      }
      .dice {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin: 10px 0;
      }
      .die {
        width: 40px;
        height: 40px;
        background-color: #1a1a3a;
        border: 1px solid #00ff99;
        border-radius: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        color: #ffff00;
        box-shadow: 0 0 5px rgba(0, 255, 153, 0.3);
      }
      .player-info {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 15px;
      }
      .player-card {
        flex: 1;
        min-width: 120px;
        padding: 10px;
        border-radius: 3px;
        background-color: #1a1a3a;
        border: 1px solid #444477;
        color: #00ffff;
      }
      .player-card.active {
        border: 2px solid #ff00ff;
        box-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
      }
      .player-card strong {
        color: #ff00ff;
        display: block;
        margin-bottom: 5px;
      }
      .scanlines {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(rgba(0, 255, 153, 0.06) 1px, transparent 1px);
        background-size: 100% 2px;
        pointer-events: none;
        z-index: 1000;
        opacity: 0.3;
      }
      .glow {
        position: fixed;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at center, rgba(0, 255, 153, 0.1) 0%, transparent 70%);
        pointer-events: none;
        z-index: -1;
        animation: pulse 8s infinite alternate;
      }
      .cli-toggle {
        background-color: #330066;
        color: #cc00ff;
        border: 1px solid #cc00ff;
        padding: 10px;
        text-align: center;
        margin-top: 10px;
        cursor: pointer;
        border-radius: 3px;
      }
      .cli-container {
        margin-top: 10px;
        transition: all 0.3s ease;
        overflow: hidden;
      }
      .cli-container.collapsed {
        max-height: 0;
        opacity: 0;
        padding: 0;
        border: none;
      }
      .cli-container:not(.collapsed) {
        max-height: 400px;
        opacity: 1;
        padding: 10px;
        border: 1px solid #00ff99;
        border-radius: 3px;
        background-color: #121230;
      }
      @keyframes pulse {
        0% { opacity: 0.3; }
        100% { opacity: 0.1; }
      }
      @media (min-width: 600px) {
        .container {
          max-width: 600px;
        }
        .space {
          font-size: 12px;
        }
      }
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 20, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: #121230;
    padding: 20px;
    border-radius: 5px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow: auto;
    border: 1px solid #00ff99;
    box-shadow: 0 0 20px rgba(0, 255, 153, 0.5);
    color: #00ff99;
  }
  
  .upc-frame-container {
    margin: 15px 0;
    height: 500px;
  }
  
  .upc-frame {
    width: 100%;
    height: 100%;
    border: 1px solid #00ff99;
    background-color: #0a0a1a;
  }
  
  .modal-buttons {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }
  
  .modal-button {
    background-color: #330066;
    color: #cc00ff;
    border: 1px solid #cc00ff;
    padding: 12px 15px;
    border-radius: 3px;
    cursor: pointer;
    flex: 1;
    font-family: 'Courier New', monospace;
  }
  
  .modal-button:hover {
    background-color: #440088;
    box-shadow: 0 0 10px rgba(204, 0, 255, 0.8);
  }
    `;
    document.head.appendChild(style);
  }

  initGame = () => {
    const { config } = this.state;
    const players = [];
    const properties = [];
    
    for (let i = 0; i < config.numPlayers; i++) {
      players.push({
        id: i,
        name: `PLAYER ${i + 1}`,
        balance: config.startingBalance,
        wallet: `0x${Math.random().toString(16).substr(2, 40)}`,
        position: 0,
        properties: [],
        color: this.getPlayerColor(i)
      });
    }
    
    let groupIndex = 0;
    for (let i = 0; i < config.numSpaces; i++) {
      if (i === 0) {
        properties.push({
          id: i,
          upc: 'START',
          group: -1,
          owner: null,
          price: 0,
          rent: 0
        });
        continue;
      }
      
      const group = Math.floor((i - 1) / config.propertiesPerGroup);
      properties.push({
        id: i,
        upc: this.generateUPC(),
        group: group,
        owner: null,
        price: (group + 1) * 100,
        rent: (group + 1) * config.rentBase
      });
    }
    
    this.setState({ 
      players,
      properties,
      gameStarted: true 
    }, () => {
      this.terminal.current.pushToStdout('[[success]]GAME INITIALIZED[[/success]]');
      this.terminal.current.pushToStdout(`> ${players[0].name}'S TURN. TYPE "HELP" FOR COMMANDS.`);
    });
  };

  generateUPC = () => {
    let upc = '';
    for (let i = 0; i < 12; i++) {
      upc += Math.floor(Math.random() * 10);
    }
    return upc;
  };

  getPlayerColor = (index) => {
    const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF6600'];
    return colors[index % colors.length];
  };

  rollDice = () => {
    const { currentPlayer, players, diceRolled } = this.state;
    
    if (diceRolled) {
      this.terminal.current.pushToStdout('[[error]]You have already rolled this turn[[/error]]');
      return;
    }
    
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    
    this.setState({ 
      lastRoll: [die1, die2],
      diceRolled: true 
    }, () => {
      this.terminal.current.pushToStdout(`[[info]]${players[currentPlayer].name} rolled ${die1} + ${die2} = ${total}[[/info]]`);
      this.movePlayer(total);
    });
  };

  movePlayer = (spaces) => {
    const { currentPlayer, players, config } = this.state;
    const player = players[currentPlayer];
    const newPosition = (player.position + spaces) % config.numSpaces;
    const updatedPlayers = [...players];
    
    if (player.position + spaces >= config.numSpaces) {
      updatedPlayers[currentPlayer].balance += 200;
      this.terminal.current.pushToStdout(`[[success]]${player.name} passed START NODE and collected ₵200![[/success]]`);
    }
    
    updatedPlayers[currentPlayer].position = newPosition;
    
    this.setState({ 
      players: updatedPlayers,
      currentPosition: newPosition 
    }, () => {
      setTimeout(() => {
        this.checkProperty();
      }, 500);
    });
  };

  checkProperty = () => {
    const { currentPlayer, players, properties, config } = this.state;
    const player = players[currentPlayer];
    const property = properties[player.position];
    
    if (property.upc === 'START') {
      this.terminal.current.pushToStdout(`[[info]]${player.name} landed on START NODE.[[/info]]`);
      return;
    }
    
    if (property.owner === null) {
      this.setState({
        showBuyModal: true,
        buyMessage: `> ACQUIRE ${property.upc} FOR ₵${property.price}?`
      });
    } else if (property.owner === player.id) {
      this.terminal.current.pushToStdout(`[[info]]${player.name} landed on owned property (${property.upc}).[[/info]]`);
    } else {
      const owner = players[property.owner];
      let rent = property.rent;
      
      const groupProperties = properties.filter(p => p.group === property.group);
      const ownedGroupProperties = groupProperties.filter(p => p.owner === property.owner);
      
      if (groupProperties.length === ownedGroupProperties.length) {
        rent *= config.rentMultiplier;
      }
      
      this.setState({
        showRentModal: true,
        rentMessage: `> YOU'VE LANDED ON ${owner.name}'S PROPERTY (${property.upc}).\n> RENT DUE: ₵${rent}`
      });
    }
  };

  buyProperty = () => {
    const { currentPlayer, players, properties } = this.state;
    const player = players[currentPlayer];
    const property = properties[player.position];
    
    if (property.owner !== null) {
      this.terminal.current.pushToStdout(`[[error]]PROPERTY ${property.upc} ALREADY OWNED.[[/error]]`);
      this.setState({ showBuyModal: false });
      return;
    }
    
    if (player.balance >= property.price) {
      const updatedPlayers = [...players];
      const updatedProperties = [...properties];
      
      updatedPlayers[currentPlayer].balance -= property.price;
      updatedProperties[player.position].owner = player.id;
      updatedPlayers[currentPlayer].properties.push(property.id);
      
      this.setState({
        players: updatedPlayers,
        properties: updatedProperties,
        showBuyModal: false
      }, () => {
        this.terminal.current.pushToStdout(`[[success]]${player.name} acquired ${property.upc} for ₵${property.price}.[[/success]]`);
      });
    } else {
      this.terminal.current.pushToStdout(`[[error]]${player.name} has insufficient funds for ${property.upc}.[[/error]]`);
      this.setState({ showBuyModal: false });
    }
  };

  payRent = () => {
    const { currentPlayer, players, properties } = this.state;
    const player = players[currentPlayer];
    const property = properties[player.position];
    const owner = players[property.owner];
    
    let rent = property.rent;
    const groupProperties = properties.filter(p => p.group === property.group);
    const ownedGroupProperties = groupProperties.filter(p => p.owner === property.owner);
    
    if (groupProperties.length === ownedGroupProperties.length) {
      rent *= this.state.config.rentMultiplier;
    }
    
    if (player.balance >= rent) {
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayer].balance -= rent;
      updatedPlayers[property.owner].balance += rent;
      
      this.setState({
        players: updatedPlayers,
        showRentModal: false
      }, () => {
        this.terminal.current.pushToStdout(`[[info]]${player.name} paid ₵${rent} rent to ${owner.name} for ${property.upc}.[[/info]]`);
      });
    } else {
      this.terminal.current.pushToStdout(`[[error]]${player.name} cannot afford rent! Game over.[[/error]]`);
      this.setState({ showRentModal: false });
    }
  };

  endTurn = () => {
    const { currentPlayer, players } = this.state;
    const nextPlayer = (currentPlayer + 1) % players.length;
    
    this.setState({
      currentPlayer: nextPlayer,
      diceRolled: false
    }, () => {
      this.terminal.current.pushToStdout(`[[header]]${players[nextPlayer].name}'S TURN. TYPE "ROLL" TO ROLL DICE.[[/header]]`);
    });
  };

  visitSpace = (spaceId) => {
    const { properties, config } = this.state;
    const property = properties[spaceId];
    
    if (property.upc === 'START') {
      this.terminal.current.pushToStdout('[[info]]START NODE HAS NO UPC DATA.[[/info]]');
      return;
    }
    
    const upcData = { code: property.upc };
    const upcJson = JSON.stringify(upcData);
    const upcBase64 = btoa(upcJson);
    const upcUrl = config.upcBaseUrl + upcBase64;
    
    this.setState({
      showVisitModal: true,
      visitMessage: `> ACCESS UPC DATABASE FOR ${property.upc}?`,
      upcFrameUrl: upcUrl
    });
  };

  cashOut = async (amount) => {
    if (!this.state.isConnected) {
      this.terminal.current.pushToStdout('[[error]]Please connect your wallet first[[/error]]');
      return;
    }

    const { currentPlayer, players } = this.state;
    const player = players[currentPlayer];
    const cashAmount = parseInt(amount) || player.balance;

    if (cashAmount > player.balance) {
      this.terminal.current.pushToStdout(`[[error]]You don't have enough in-game balance (₵${player.balance})[[/error]]`);
      return;
    }

    try {
      this.terminal.current.pushToStdout(`[[info]]Cashing out ₵${cashAmount} to ${this.state.account}...[[/info]]`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayer].balance -= cashAmount;
      
      this.setState({ players: updatedPlayers }, () => {
        this.terminal.current.pushToStdout(`[[success]]Successfully cashed out ₵${cashAmount}![[/success]]`);
      });
    } catch (error) {
      this.terminal.current.pushToStdout(`[[error]]Cash out failed: ${error.message}[[/error]]`);
    }
  };

  addFunds = async (amount) => {
    if (!this.state.isConnected) {
      this.terminal.current.pushToStdout('[[error]]Please connect your wallet first[[/error]]');
      return;
    }

    const { currentPlayer, players } = this.state;
    const fundAmount = parseInt(amount) || 100;

    try {
      this.terminal.current.pushToStdout(`[[info]]Adding ₵${fundAmount} from ${this.state.account}...[[/info]]`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayer].balance += fundAmount;
      
      this.setState({ players: updatedPlayers }, () => {
        this.terminal.current.pushToStdout(`[[success]]Successfully added ₵${fundAmount}![[/success]]`);
      });
    } catch (error) {
      this.terminal.current.pushToStdout(`[[error]]Add funds failed: ${error.message}[[/error]]`);
    }
  };

  toggleCLI = () => {
    this.setState(prevState => ({ cliCollapsed: !prevState.cliCollapsed }));
  };

renderBoard() {
  const { players, properties } = this.state;
  const positions = [
    { left: '80%', top: '80%' },  // Start (0)
    { left: '60%', top: '80%' },  // 1
    { left: '40%', top: '80%' },  // 2
    { left: '20%', top: '80%' },  // 3
    { left: '0%', top: '80%' },   // 4
    { left: '0%', top: '60%' },   // 5
    { left: '0%', top: '40%' },   // 6
    { left: '0%', top: '20%' },   // 7
    { left: '0%', top: '0%' },    // 8
    { left: '20%', top: '0%' },   // 9
    { left: '40%', top: '0%' },   // 10
    { left: '60%', top: '0%' },   // 11
    { left: '80%', top: '0%' },   // 12
    { left: '80%', top: '20%' },  // 13
    { left: '80%', top: '40%' },  // 14
    { left: '80%', top: '60%' }   // 15
  ];

  return (
    <div className="board" id="board">
      {properties.map((property, index) => (
        <div
          key={index}
          className={`space ${property.group >= 0 ? 'group-' + property.group : ''} ${property.upc === 'START' ? 'start' : ''} ${property.owner !== null ? 'owned' : ''}`}
          style={{ ...positions[index] }}
          onClick={() => this.visitSpace(index)}
          dangerouslySetInnerHTML={{ __html: 
            property.upc === 'START' ? 
              '> START NODE<br> COLLECT ₵200' : 
              `> ${property.upc}<br> ₵${property.price}${property.owner !== null ? `<br> OWNER: P${property.owner + 1}` : ''}`
          }}
        />
      ))}

      {players.map(player => {
        const space = document.getElementById(`space-${player.position}`);
        let left = '5px';
        let top = '5px';
        
        if (space) {
          const rect = space.getBoundingClientRect();
          const boardEl = document.getElementById('board');
          const boardRect = boardEl ? boardEl.getBoundingClientRect() : null;
          if (boardRect) {
            left = `${rect.left - boardRect.left + (player.id % 2 === 0 ? 5 : 25)}px`;
            top = `${rect.top - boardRect.top + (player.id < 2 ? 5 : 25)}px`;
          }
        }

        return (
          <div
            key={player.id}
            className="player"
            style={{
              backgroundColor: player.color,
              left,
              top
            }}
          >
            {player.id + 1}
          </div>
        );
      })}
    </div>
  );
}

  render() {
    const { players, currentPlayer, cliCollapsed } = this.state;
    const welcomeMsg = `CYBERPUNK UPC MONOPOLY CLI - Type 'help' for commands`;

    return (
      <div className="cyberpunk-container">
        <div className="glow"></div>
        <div className="scanlines"></div>
        
        <div className="container">
          <h1>CYBERPUNK UPC MONOPOLY</h1>
          
          {this.renderBoard()}
          
          <div className="controls">
            <div className="player-info">
              {players.map((player, index) => (
                <div key={index} className={`player-card ${currentPlayer === index ? 'active' : ''}`}>
                  <strong> {player.name}</strong>
                   BALANCE: ₵{player.balance}
                   PROPERTIES: {player.properties.length}
                   WALLET: {player.wallet.substring(0, 6)}...{player.wallet.substring(38)}
                </div>
              ))}
            </div>
            
            <div className="status" id="status">
               {players.length > 0 ? `${players[currentPlayer].name}'S TURN` : 'SYSTEM INITIALIZING...'}
            </div>
            
            <div className="dice" id="dice">
              <div className="die" id="die1">-</div>
              <div className="die" id="die2">-</div>
            </div>
            
            <button id="roll-btn" onClick={this.rollDice}>
               ROLL DICE
            </button>
            <button id="buy-btn" disabled={!this.state.diceRolled} onClick={this.buyProperty}>
               BUY PROPERTY
            </button>
            <button id="end-turn-btn" disabled={!this.state.diceRolled} onClick={this.endTurn}>
               END TURN
            </button>
          </div>

          <div className="cli-toggle" onClick={this.toggleCLI}>
            {cliCollapsed ? '> SHOW CLI' : '> HIDE CLI'}
          </div>

          <div className={`cli-container ${cliCollapsed ? 'collapsed' : ''}`}>
            <Terminal
              ref={this.terminal}
              commands={{
                roll: { description: 'Roll dice', fn: this.rollDice },
                buy: { description: 'Buy property', fn: this.buyProperty },
                end: { description: 'End turn', fn: this.endTurn },
                visit: { 
                  description: 'Visit property', 
                  fn: () => {
                    const { players, currentPlayer } = this.state;
                    if (players && players[currentPlayer]) {
                      return this.visitSpace(players[currentPlayer].position);
                    }
                    return 'No player found';
                  }
                },
                connect: { description: 'Connect wallet', fn: this.connectWallet },
                disconnect: { description: 'Disconnect wallet', fn: this.handleDisconnect },
                cashout: { 
                  description: 'Cash out funds', 
                  usage: 'cashout <amount>',
                  fn: (amount) => this.cashOut(amount) 
                },
                addfunds: { 
                  description: 'Add funds', 
                  usage: 'addfunds <amount>',
                  fn: (amount) => this.addFunds(amount) 
                },
                status: {
                  description: 'Show game status',
                  fn: () => {
                    const { currentPlayer, players = [], properties = [] } = this.state;
                    const player = players[currentPlayer];
                    if (!player) return 'Game not started';
                    
                    const property = properties[player.position] || {};
                    const upc = property.upc || 'START';
                    const owner = property.owner !== null && players[property.owner] 
                      ? players[property.owner].name 
                      : 'None';
                    
                    return [
                      `[[header]]=== PLAYER STATUS ===[[/header]]`,
                      `Name: ${player.name}`,
                      `Balance: ₵${player.balance}`,
                      `Position: ${player.position} (${upc})`,
                      `Properties: ${player.properties.length}`,
                      `Wallet: ${player.wallet.substring(0, 6)}...${player.wallet.substring(38)}`,
                      '',
                      `[[header]]=== CURRENT PROPERTY ===[[/header]]`,
                      `UPC: ${upc}`,
                      `Price: ₵${property.price || 0}`,
                      `Owner: ${owner}`
                    ].join('\n');
                  }
                }

              }}
              welcomeMessage={welcomeMsg}
              promptLabel={'monopoly:~$'}
              promptLabelStyle={{ color: '#00ff99' }}
              inputTextStyle={{ color: '#00ff99' }}
              style={{
                backgroundColor: '#121230',
                border: '1px solid #00ff99',
                boxShadow: '0 0 15px rgba(0, 255, 153, 0.3)'
              }}
            />
          </div>
        </div>
        {/* Visit Modal */}
        {this.state.showVisitModal && (
          <div className="modal">
            <div className="modal-content">
              <h3> UPC DATABASE ACCESS</h3>
              <p>{this.state.visitMessage}</p>
              
              <div className="upc-frame-container">
                <iframe 
                  src={this.state.upcFrameUrl}
                  title="UPC Database"
                  className="upc-frame"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
              
              <div className="modal-buttons">
                <button 
                  onClick={() => this.setState({ showVisitModal: false })}
                  className="modal-button"
                >
                   CLOSE CONNECTION
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default MonopolyCLI;
