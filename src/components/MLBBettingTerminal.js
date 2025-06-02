import React, { Component } from 'react';
import { ethers } from "ethers";
import Terminal from 'react-console-emulator';
import MLBBettingContract from '../etc/rawmaterial/MLBBetting.json';
import Web3 from 'web3';

// Cyberpunk styling constants
const CYBERPUNK_THEME = {
  primary: '#00f0ff',
  secondary: '#ff00ff',
  background: '#121212',
  accent: '#ff5722',
  text: '#e0e0e0',
  error: '#ff3d3d',
  success: '#4caf50',
  warning: '#ffc107',
  info: '#2196f3',
  terminalBg: '#0a0a1a',
  terminalBorder: '1px solid #00f0ff',
  terminalShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
  buttonGradient: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  buttonShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)'
};

// Contract addresses
const MLB_BETTING_ADDRESS = "0x15a9f29BcC7caabF7A21C67E02A6bCE96B07B868";
const FLIP_TOKEN_ADDRESS = "0xc758a25380Eb23898C5f9b3181b4C1C54D3dC118";

const MLB_BETTING_ABI = MLBBettingContract.abi;

// Standard ERC20 ABI
const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

class MLBBettingTerminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      mlbBetting: null,
      flipToken: null,
      isProgressing: false,
      provider: null,
      signer: null,
      web3: null,
      showGUI: false,
      activeTab: 'dashboard',
      teams: [
        "ARIZONA_DIAMONDBACKS",
        "ATLANTA_BRAVES",
        "BALTIMORE_ORIOLES",
        "BOSTON_RED_SOX",
        "CHICAGO_CUBS",
        "CHICAGO_WHITE_SOX",
        "CINCINNATI_REDS",
        "CLEVELAND_GUARDIANS",
        "COLORADO_ROCKIES",
        "DETROIT_TIGERS",
        "HOUSTON_ASTROS",
        "KANSAS_CITY_ROYALS",
        "LOS_ANGELES_ANGELS",
        "LOS_ANGELES_DODGERS",
        "MIAMI_MARLINS",
        "MILWAUKEE_BREWERS",
        "MINNESOTA_TWINS",
        "NEW_YORK_METS",
        "NEW_YORK_YANKEES",
        "OAKLAND_ATHLETICS",
        "PHILADELPHIA_PHILLIES",
        "PITTSBURGH_PIRATES",
        "SAN_DIEGO_PADRES",
        "SAN_FRANCISCO_GIANTS",
        "SEATTLE_MARINERS",
        "ST_LOUIS_CARDINALS",
        "TAMPA_BAY_RAYS",
        "TEXAS_RANGERS",
        "TORONTO_BLUE_JAYS",
        "WASHINGTON_NATIONALS"
      ],
      userWagers: [],
      activeWagers: [],
      matchups: [],
      flipBalance: '0',
      searchDate: '', // Add this line
      isMobile: false, // Add mobile detection state
    };
    this.terminal = React.createRef();
    this.guiTerminal = React.createRef();
    this.modalContainer = null;
    this.checkMobile = this.checkMobile.bind(this);
    this.terminal = React.createRef();
    this.modalContainer = null;
    this.guiTerminal = React.createRef();

  }
  // Add mobile detection
  checkMobile() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile !== this.state.isMobile) {
      this.setState({ isMobile });
    }
  }

  async componentDidMount() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    await this.loadBlockchainData();
    this.createModalContainer();
    this.loadInitialData();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    // ... rest of existing componentWillUnmount ...
  }

  async loadInitialData() {
    if (this.state.account && this.state.mlbBetting) {
      await this.fetchUserWagers();
      await this.fetchActiveWagers();
      await this.fetchFlipBalance();
    }
  }

  async fetchUserWagers() {
    try {
      const wagerIds = await this.state.mlbBetting.methods.getUserWagers(this.state.account).call();
      this.setState({ userWagers: wagerIds });
    } catch (error) {
      console.error("Error fetching user wagers:", error);
    }
  }

  async fetchActiveWagers() {
    try {
      const wagerIds = await this.state.mlbBetting.methods.getUserActiveWagers(this.state.account).call();
      this.setState({ activeWagers: wagerIds });
    } catch (error) {
      console.error("Error fetching active wagers:", error);
    }
  }

  async fetchFlipBalance() {
    try {
      const balance = await this.state.mlbBetting.methods.getFlipTokenBalance().call();
      this.setState({ flipBalance: this.state.web3.utils.fromWei(balance, 'ether') });
    } catch (error) {
      console.error("Error fetching FLIP balance:", error);
    }
  }


    // Add this method to handle GUI terminal output
    pushToGuiTerminal = (message) => {
      if (this.guiTerminal.current) {
        this.guiTerminal.current.pushToStdout(message);
      }
    };

  createModalContainer() {
    const existingModal = document.getElementById('betting-modal-container');
    if (existingModal) {
      document.body.removeChild(existingModal);
    }

    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'betting-modal-container';
    this.modalContainer.style = `
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

  showModal(content) {
    this.modalContainer.innerHTML = `
      <div style="
        background: ${CYBERPUNK_THEME.background};
        padding: 20px;
        border-radius: 5px;
        border: ${CYBERPUNK_THEME.terminalBorder};
        box-shadow: ${CYBERPUNK_THEME.terminalShadow};
        color: ${CYBERPUNK_THEME.text};
        width: 80%;
        max-width: 600px;
        position: relative;
        font-family: 'Courier New', monospace;
      ">
        <button id="close-modal" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: ${CYBERPUNK_THEME.error};
          color: white;
          border: none;
          border-radius: 3px;
          padding: 5px 10px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
        ">X</button>
        ${content}
      </div>
    `;

    this.modalContainer.style.display = 'flex';
    
    document.getElementById('close-modal').addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
    });
  }

  toggleGUI = () => {
    this.setState(prevState => ({ showGUI: !prevState.showGUI }));
  }

  setActiveTab = (tab) => {
    this.setState({ activeTab: tab });
  }

  renderCyberpunkButton(label, onClick, style = {}) {
    return (
      <button
        onClick={onClick}
        style={{
          background: CYBERPUNK_THEME.buttonGradient,
          border: 'none',
          borderRadius: '3px',
          color: 'white',
          padding: '12px 24px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: CYBERPUNK_THEME.buttonShadow,
          fontFamily: "'Courier New', monospace",
          textTransform: 'uppercase',
          letterSpacing: '1px',
          ...style
        }}
      >
        {label}
      </button>
    );
  }

  renderCyberpunkInput(label, type = 'text', value, onChange, options = []) {
    if (type === 'select') {
      return (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: CYBERPUNK_THEME.primary }}>
            {label}
          </label>
          <select
            value={value}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '8px',
              background: '#1a1a2e',
              border: `1px solid ${CYBERPUNK_THEME.primary}`,
              color: CYBERPUNK_THEME.text,
              borderRadius: '3px',
              fontFamily: "'Courier New', monospace"
            }}
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: CYBERPUNK_THEME.primary }}>
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '8px',
            background: '#1a1a2e',
            border: `1px solid ${CYBERPUNK_THEME.primary}`,
            color: CYBERPUNK_THEME.text,
            borderRadius: '3px',
            fontFamily: "'Courier New', monospace"
          }}
        />
      </div>
    );
  }

renderDashboard() {
  const isMobile = this.state.isMobile;
  
  return (
    <div style={{ padding: isMobile ? '10px' : '20px' }}>
      <h2 style={{ 
        color: CYBERPUNK_THEME.primary, 
        borderBottom: `2px solid ${CYBERPUNK_THEME.primary}`, 
        paddingBottom: '10px',
        fontSize: isMobile ? '1.2rem' : '1.5rem'
      }}>
        DASHBOARD
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: isMobile ? '10px' : '20px',
        marginTop: isMobile ? '10px' : '20px'
      }}>
        {/* Update all dashboard items with mobile styles */}
      </div>
    </div>
  );
}

  renderWagersTab() {
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: CYBERPUNK_THEME.primary, borderBottom: `2px solid ${CYBERPUNK_THEME.primary}`, paddingBottom: '10px' }}>
          YOUR WAGERS
        </h2>
        
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          {this.renderCyberpunkButton('All Wagers', () => this.getUserWagers())}
          {this.renderCyberpunkButton('Active Wagers', () => this.getUserActiveWagers())}
          {this.renderCyberpunkButton('Won Wagers', () => this.getUserWonWagers())}
          {this.renderCyberpunkButton('Lost Wagers', () => this.getUserLostWagers())}
        </div>

        <div style={{
          border: CYBERPUNK_THEME.terminalBorder,
          borderRadius: '5px',
          padding: '15px',
          background: CYBERPUNK_THEME.terminalBg,
          minHeight: '300px'
        }}>
          {/* Wager list will be displayed in the terminal */}
          <p style={{ color: CYBERPUNK_THEME.text }}>Use the buttons above or terminal commands to view your wagers</p>
        </div>
      </div>
    );
  }

///////////////////////>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    renderMatchupsTab() {
      return (
        <div style={{ padding: '20px' }}>
          <h2 style={{ 
            color: CYBERPUNK_THEME.primary, 
            borderBottom: `2px solid ${CYBERPUNK_THEME.primary}`, 
            paddingBottom: '10px' 
          }}>
            MATCHUPS
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <input
              type="date"
              value={this.state.searchDate}
              onChange={(e) => {
                this.setState({ searchDate: e.target.value });
                if (e.target.value.length === 10) {
                  this.getMatchupsByDateDetailed(e.target.value);
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a1a2e',
                border: `1px solid ${CYBERPUNK_THEME.primary}`,
                color: CYBERPUNK_THEME.text,
                borderRadius: '3px',
                fontFamily: "'Courier New', monospace",
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{
            border: CYBERPUNK_THEME.terminalBorder,
            borderRadius: '5px',
            padding: '15px',
            background: CYBERPUNK_THEME.terminalBg,
            minHeight: '300px'
          }}>
            {!this.state.searchDate && (
              <p style={{ color: CYBERPUNK_THEME.text }}>
                Enter a date above to search for matchups
              </p>
            )}
          </div>
        </div>
      );
    }




  renderAdminTab() {
    if (!this.state.account || !this.state.admins || !this.state.admins[this.state.account]) {
      return (
        <div style={{ padding: '20px', color: CYBERPUNK_THEME.text }}>
          <h2 style={{ color: CYBERPUNK_THEME.primary }}>ADMIN PANEL</h2>
          <p>You must be an admin to access this panel</p>
        </div>
      );
    }

    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: CYBERPUNK_THEME.primary, borderBottom: `2px solid ${CYBERPUNK_THEME.primary}`, paddingBottom: '10px' }}>
          ADMIN PANEL
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ color: CYBERPUNK_THEME.secondary }}>Matchup Management</h3>
            {this.renderCyberpunkButton('Add Matchup', () => this.showAddMatchupModal())}
            {this.renderCyberpunkButton('Update Scores', () => this.showUpdateMatchupModal())}
          </div>
          
          <div>
            <h3 style={{ color: CYBERPUNK_THEME.secondary }}>Contract Management</h3>
            {this.renderCyberpunkButton('Deposit FLIP', () => this.showDepositModal())}
            {this.renderCyberpunkButton('Check Balance', () => this.checkFlipBalance())}
          </div>
        </div>
      </div>
    );
  }

  showGBetModal() {
    const content = `
      <h2 style="color: ${CYBERPUNK_THEME.primary}; text-align: center; margin-bottom: 20px; font-family: 'Courier New', monospace;">CREATE NEW WAGER</h2>
      <form id="gbet-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Matchup ID</label>
          <input type="text" name="matchupId" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Predicted Winner</label>
          <select name="predictedWinner" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
            ${this.state.teams.map(team => `<option value="${team}">${team}</option>`).join('')}
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Amount (MATIC)</label>
          <input type="number" name="amount" step="0.01" min="0" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: flex; align-items: center; color: ${CYBERPUNK_THEME.text};">
            <input type="checkbox" name="isDoubleInsured" style="margin-right: 8px;">
            Double Insured
          </label>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">UPC ID (Optional)</label>
          <input type="text" name="upcId" style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <button type="submit" style="
          background: ${CYBERPUNK_THEME.buttonGradient};
          border: none;
          border-radius: 3px;
          color: white;
          padding: 12px 24px;
          width: 100%;
          cursor: pointer;
          font-weight: bold;
          box-shadow: ${CYBERPUNK_THEME.buttonShadow};
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">Place Bet</button>
      </form>
    `;

    this.showModal(content);

    document.getElementById('gbet-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        matchupId: formData.get('matchupId'),
        predictedWinner: formData.get('predictedWinner'),
        amount: formData.get('amount'),
        isDoubleInsured: formData.get('isDoubleInsured') === 'on',
        upcId: formData.get('upcId')
      };
      
      this.createWager(data.matchupId, data.predictedWinner, data.amount, data.isDoubleInsured, data.upcId);
      this.modalContainer.style.display = 'none';
    });
  }

  showGJoinModal() {
    const content = `
      <h2 style="color: ${CYBERPUNK_THEME.primary}; text-align: center; margin-bottom: 20px; font-family: 'Courier New', monospace;">JOIN EXISTING WAGER</h2>
      <form id="gjoin-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Wager ID</label>
          <input type="text" name="wagerId" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Predicted Winner</label>
          <select name="predictedWinner" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
            ${this.state.teams.map(team => `<option value="${team}">${team}</option>`).join('')}
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Amount (MATIC)</label>
          <input type="number" name="amount" step="0.01" min="0" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <button type="submit" style="
          background: ${CYBERPUNK_THEME.buttonGradient};
          border: none;
          border-radius: 3px;
          color: white;
          padding: 12px 24px;
          width: 100%;
          cursor: pointer;
          font-weight: bold;
          box-shadow: ${CYBERPUNK_THEME.buttonShadow};
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">Join Wager</button>
      </form>
    `;

    this.showModal(content);

    document.getElementById('gjoin-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        wagerId: formData.get('wagerId'),
        predictedWinner: formData.get('predictedWinner'),
        amount: formData.get('amount')
      };
      
      this.joinWager(data.wagerId, data.predictedWinner, data.amount);
      this.modalContainer.style.display = 'none';
    });
  }

  showAddMatchupModal() {
    const content = `
      <h2 style="color: ${CYBERPUNK_THEME.primary}; text-align: center; margin-bottom: 20px; font-family: 'Courier New', monospace;">ADD NEW MATCHUP</h2>
      <form id="add-matchup-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Home Team</label>
          <select name="homeTeam" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
            ${this.state.teams.map(team => `<option value="${team}">${team}</option>`).join('')}
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Away Team</label>
          <select name="awayTeam" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
            ${this.state.teams.map(team => `<option value="${team}">${team}</option>`).join('')}
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Game Date (YYYY-MM-DD)</label>
          <input type="text" name="gameDate" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <button type="submit" style="
          background: ${CYBERPUNK_THEME.buttonGradient};
          border: none;
          border-radius: 3px;
          color: white;
          padding: 12px 24px;
          width: 100%;
          cursor: pointer;
          font-weight: bold;
          box-shadow: ${CYBERPUNK_THEME.buttonShadow};
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">Add Matchup</button>
      </form>
    `;

    this.showModal(content);



    // In your showAddMatchupModal function, update the submit handler:
    document.getElementById('add-matchup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        homeTeam: formData.get('homeTeam'),
        awayTeam: formData.get('awayTeam'),
        gameDate: formData.get('gameDate')
      };
      
      try {
        // Show loading state in modal
        this.modalContainer.querySelector('button[type="submit"]').disabled = true;
        this.modalContainer.querySelector('button[type="submit"]').textContent = 'Processing...';
        
        await this.addMatchup(data.homeTeam, data.awayTeam, data.gameDate);
        
        // Update modal to show success
        this.showModal(`
          <h2 style="color: ${CYBERPUNK_THEME.primary}; text-align: center; margin-bottom: 20px;">
            Matchup Added Successfully!
          </h2>
          <div style="text-align: center; margin-bottom: 20px;">
            <p>${data.homeTeam} vs ${data.awayTeam}</p>
            <p>Date: ${data.gameDate}</p>
          </div>
          <button id="close-success" style="
            background: ${CYBERPUNK_THEME.success};
            border: none;
            border-radius: 3px;
            color: white;
            padding: 12px 24px;
            width: 100%;
            cursor: pointer;
          ">Close</button>
        `);
        
        document.getElementById('close-success').addEventListener('click', () => {
          this.modalContainer.style.display = 'none';
        });
        
      } catch (error) {
        // Show error in modal
        this.showModal(`
          <h2 style="color: ${CYBERPUNK_THEME.error}; text-align: center; margin-bottom: 20px;">
            Error Adding Matchup
          </h2>
          <div style="margin-bottom: 20px; color: ${CYBERPUNK_THEME.text}">
            ${error.message}
          </div>
          <button id="close-error" style="
            background: ${CYBERPUNK_THEME.error};
            border: none;
            border-radius: 3px;
            color: white;
            padding: 12px 24px;
            width: 100%;
            cursor: pointer;
          ">Close</button>
        `);
        
        document.getElementById('close-error').addEventListener('click', () => {
          this.modalContainer.style.display = 'none';
        });
      }
    });








  }

  showUpdateMatchupModal() {
    const content = `
      <h2 style="color: ${CYBERPUNK_THEME.primary}; text-align: center; margin-bottom: 20px; font-family: 'Courier New', monospace;">UPDATE MATCHUP</h2>
      <form id="update-matchup-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Matchup ID</label>
          <input type="text" name="matchupId" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Home Score</label>
          <input type="number" name="homeScore" min="0" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Away Score</label>
          <input type="number" name="awayScore" min="0" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Current Inning</label>
          <input type="number" name="currentInning" min="1" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: flex; align-items: center; color: ${CYBERPUNK_THEME.text};">
            <input type="checkbox" name="isFinished" style="margin-right: 8px;">
            Game Finished
          </label>
        </div>
        
        <button type="submit" style="
          background: ${CYBERPUNK_THEME.buttonGradient};
          border: none;
          border-radius: 3px;
          color: white;
          padding: 12px 24px;
          width: 100%;
          cursor: pointer;
          font-weight: bold;
          box-shadow: ${CYBERPUNK_THEME.buttonShadow};
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">Update Matchup</button>
      </form>
    `;

    this.showModal(content);

    document.getElementById('update-matchup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        matchupId: formData.get('matchupId'),
        homeScore: formData.get('homeScore'),
        awayScore: formData.get('awayScore'),
        currentInning: formData.get('currentInning'),
        isFinished: formData.get('isFinished') === 'on'
      };
      
      this.updateMatchup(data.matchupId, data.homeScore, data.awayScore, data.currentInning, data.isFinished);
      this.modalContainer.style.display = 'none';
    });
  }

  showDepositModal() {
    const content = `
      <h2 style="color: ${CYBERPUNK_THEME.primary}; text-align: center; margin-bottom: 20px; font-family: 'Courier New', monospace;">DEPOSIT FLIP TOKENS</h2>
      <form id="deposit-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: ${CYBERPUNK_THEME.primary};">Amount (FLIP)</label>
          <input type="number" name="amount" step="0.01" min="0" required style="
            width: 100%;
            padding: 8px;
            background: #1a1a2e;
            border: 1px solid ${CYBERPUNK_THEME.primary};
            color: ${CYBERPUNK_THEME.text};
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          ">
        </div>
        
        <button type="submit" style="
          background: ${CYBERPUNK_THEME.buttonGradient};
          border: none;
          border-radius: 3px;
          color: white;
          padding: 12px 24px;
          width: 100%;
          cursor: pointer;
          font-weight: bold;
          box-shadow: ${CYBERPUNK_THEME.buttonShadow};
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">Deposit</button>
      </form>
    `;

    this.showModal(content);

    document.getElementById('deposit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const amount = formData.get('amount');
      
      this.depositFlipTokens(amount);
      this.modalContainer.style.display = 'none';
    });
  }

  async loadBlockchainData() {
    try {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.web3 = new Web3(window.web3.currentProvider);
      }

      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      
      const mlbBettingContract = new web3.eth.Contract(
        MLB_BETTING_ABI,
        MLB_BETTING_ADDRESS
      );
      
      const flipTokenContract = new web3.eth.Contract(
        ERC20_ABI,
        FLIP_TOKEN_ADDRESS
      );

      // Check if user is admin
      const isAdmin = await mlbBettingContract.methods.admins(accounts[0]).call();

      this.setState({ 
        mlbBetting: mlbBettingContract,
        flipToken: flipTokenContract,
        account: accounts[0],
        web3: web3,
        admins: { [accounts[0]]: isAdmin }
      });

      this.terminal.current.pushToStdout(
        `[[success]]Connected to account: ${accounts[0]}[[/success]]`
      );
      
    } catch (error) {
      this.terminal.current.pushToStdout(
        `[[error]]Connection error: ${error.message}[[/error]]`
      );
      console.error("Blockchain connection error:", error);
    }
  }



  getTeamEnum = (teamName) => {
    const teamMap = {
      "ARIZONA_DIAMONDBACKS": 0,
      "ATLANTA_BRAVES": 1,
      "BALTIMORE_ORIOLES": 2,
      "BOSTON_RED_SOX": 3,
      "CHICAGO_CUBS": 4,
      "CHICAGO_WHITE_SOX": 5,
      "CINCINNATI_REDS": 6,
      "CLEVELAND_GUARDIANS": 7,
      "COLORADO_ROCKIES": 8,
      "DETROIT_TIGERS": 9,
      "HOUSTON_ASTROS": 10,
      "KANSAS_CITY_ROYALS": 11,
      "LOS_ANGELES_ANGELS": 12,
      "LOS_ANGELES_DODGERS": 13,
      "MIAMI_MARLINS": 14,
      "MILWAUKEE_BREWERS": 15,
      "MINNESOTA_TWINS": 16,
      "NEW_YORK_METS": 17,
      "NEW_YORK_YANKEES": 18,
      "OAKLAND_ATHLETICS": 19,
      "PHILADELPHIA_PHILLIES": 20,
      "PITTSBURGH_PIRATES": 21,
      "SAN_DIEGO_PADRES": 22,
      "SAN_FRANCISCO_GIANTS": 23,
      "SEATTLE_MARINERS": 24,
      "ST_LOUIS_CARDINALS": 25,
      "TAMPA_BAY_RAYS": 26,
      "TEXAS_RANGERS": 27,
      "TORONTO_BLUE_JAYS": 28,
      "WASHINGTON_NATIONALS": 29
    };

    const enumValue = teamMap[teamName.toUpperCase()];
    if (enumValue === undefined) {
      throw new Error(`Invalid team name: ${teamName}`);
    }
    return enumValue;
  };

  // Get all user wagers
  getUserWagers = async () => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      this.pushToGuiTerminal('Fetching all your wagers...');
      const wagerIds = await this.state.mlbBetting.methods.getUserWagers(this.state.account).call();
      
      if (wagerIds.length === 0) {
        this.pushToGuiTerminal('[[info]]No wagers found[[/info]]');
        return;
      }
      
      this.pushToGuiTerminal('[[header]]=== Your Wagers ===[[/header]]');
      for (const id of wagerIds) {
        await this.displayWagerDetails(id);
      }
    } catch (error) {
      this.pushToGuiTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  };
  
  // Get user's won wagers
  getUserWonWagers = async () => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      this.pushToGuiTerminal('Fetching your won wagers...');
      const wagerIds = await this.state.mlbBetting.methods.getUserWonWagers(this.state.account).call();
      
      if (wagerIds.length === 0) {
        this.pushToGuiTerminal('[[info]]No won wagers found[[/info]]');
        return;
      }
      
      this.pushToGuiTerminal('[[header]]=== Won Wagers ===[[/header]]');
      for (const id of wagerIds) {
        await this.displayWagerDetails(id);
      }
    } catch (error) {
      this.pushToGuiTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  };
  
  // Get user's lost wagers
  getUserLostWagers = async () => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      this.pushToGuiTerminal('Fetching your lost wagers...');
      const wagerIds = await this.state.mlbBetting.methods.getUserLostWagers(this.state.account).call();
      
      if (wagerIds.length === 0) {
        this.pushToGuiTerminal('[[info]]No lost wagers found[[/info]]');
        return;
      }
      
      this.pushToGuiTerminal('[[header]]=== Lost Wagers ===[[/header]]');
      for (const id of wagerIds) {
        await this.displayWagerDetails(id);
      }
    } catch (error) {
      this.pushToGuiTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  };
  
  // Get user's active wagers
  getUserActiveWagers = async () => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      this.pushToGuiTerminal('Fetching your active wagers...');
      const wagerIds = await this.state.mlbBetting.methods.getUserActiveWagers(this.state.account).call();
      
      if (wagerIds.length === 0) {
        this.pushToGuiTerminal('[[info]]No active wagers found[[/info]]');
        return;
      }
      
      this.pushToGuiTerminal('[[header]]=== Active Wagers ===[[/header]]');
      for (const id of wagerIds) {
        await this.displayWagerDetails(id);
      }
    } catch (error) {
      this.pushToGuiTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  displayWagerDetails = async (wagerId) => {
    const terminal = this.terminal.current;
    
    try {
      const status = await this.state.mlbBetting.methods.getWagerStatus(wagerId).call();
      const details = await this.state.mlbBetting.methods.getWagerDetails(wagerId).call();
      const matchup = await this.state.mlbBetting.methods.getMatchupDetails(details.matchupId).call();
      
      const homeTeam = this.state.teams[matchup.homeTeam];
      const awayTeam = this.state.teams[matchup.awayTeam];
      const predictedWinner = this.state.teams[details.predictedWinner];
      
      this.pushToGuiTerminal(`<span style="color:#FF5722;font-weight:bold">Wager ID: ${wagerId} (Status: ${status})</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Matchup:</span> <span style="color:#64B5F6">${homeTeam} vs ${awayTeam}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Original Prediction:</span> <span style="color:#64B5F6">${predictedWinner}</span>`);
      
      // Show contestant predictions if you participated
      for (let i = 0; i < details.contestants.length; i++) {
        if (details.contestants[i].user.toLowerCase() === this.state.account.toLowerCase()) {
          const myPrediction = this.state.teams[details.contestants[i].predictedWinner];
          this.pushToGuiTerminal(`<span style="color:#FFC107">Your Prediction:</span> <span style="color:#64B5F6">${myPrediction}</span>`);
          this.pushToGuiTerminal(`<span style="color:#FFC107">Your Amount:</span> <span style="color:#64B5F6">${this.state.web3.utils.fromWei(details.contestants[i].amount, 'ether')} MATIC</span>`);
        }
      }
      
      this.pushToGuiTerminal(`<span style="color:#FFC107">Total Wager Amount:</span> <span style="color:#64B5F6">${this.state.web3.utils.fromWei(details.wagerAmount, 'ether')} MATIC</span>`);
      this.pushToGuiTerminal('----------------------------------');
    } catch (error) {
      this.pushToGuiTerminal(`[[error]]Error displaying wager ${wagerId}: ${error.message}[[/error]]`);
    }
  }; 

  // Helper to convert date string to day number
  parseDateString = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date values');
      }
      
      return Math.floor(date.getTime() / 1000 / 86400);
    } catch (error) {
      console.error("Date parsing error:", error);
      throw new Error('Invalid date format. Please use "YYYY-MM-DD"');
    }
  };

  // Set matchup finished status (owner only)
  setMatchupFinished = async (matchupId, isFinished) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      // Convert string to boolean if needed
      const finishedStatus = isFinished === 'true' || isFinished === '1';
      
      this.pushToGuiTerminal(`Setting matchup ${matchupId} finished status to ${finishedStatus}...`);
      
      const tx = await this.state.mlbBetting.methods.setMatchupFinishedStatus(
        matchupId,
        finishedStatus
      ).send({ from: this.state.account });
  
      this.pushToGuiTerminal(
        `[[success]]Matchup finished status updated successfully![[/success]]`
      );
      this.pushToGuiTerminal(`Transaction hash: ${tx.transactionHash}`);
      this.pushToGuiTerminal(`New status: ${finishedStatus ? 'Finished' : 'Not Finished'}`);
    } catch (error) {
      this.pushToGuiTerminal(
        `[[error]]Error updating finished status: ${error.message}[[/error]]`
      );
      console.error("Update finished status error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // List teams with optional filter
  listTeams = async (filter = '') => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const filterLower = filter.toLowerCase();
      const filteredTeams = filter 
        ? this.state.teams.filter(team => 
            team.toLowerCase().includes(filterLower))
        : this.state.teams;

      if (filteredTeams.length === 0) {
        this.pushToGuiTerminal(`[[info]]No teams found matching "${filter}"[[/info]]`);
        return;
      }

      this.pushToGuiTerminal('[[header]]=== MLB Teams ===[[/header]]');
      filteredTeams.forEach(team => {
        this.pushToGuiTerminal(`- ${team}`);
      });
      this.pushToGuiTerminal(`[[info]]Found ${filteredTeams.length} team(s)[[/info]]`);
    } catch (error) {
      this.pushToGuiTerminal(`[[error]]Error listing teams: ${error.message}[[/error]]`);
      console.error("Team list error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Check FLIP token balance of contract
  checkFlipBalance = async () => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      this.pushToGuiTerminal('Checking FLIP token balance...');
      
      const balance = await this.state.mlbBetting.methods.getFlipTokenBalance().call();
      const balanceInEth = this.state.web3.utils.fromWei(balance, 'ether');
      
      this.pushToGuiTerminal(`[[balance]]`);
      this.pushToGuiTerminal(`${balanceInEth} FLIP`);
      this.pushToGuiTerminal(`[[/balance]]`);
    } catch (error) {
      this.pushToGuiTerminal(`[[error]]Balance check error: ${error.message}[[/error]]`);
      console.error("Balance check error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Approve Flip tokens for betting contract
  approveFlipTokens = async (amount) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(amount, 'ether');
      this.pushToGuiTerminal(`Approving ${amount} FLIP tokens...`);
      
      const tx = await this.state.flipToken.methods.approve(
        MLB_BETTING_ADDRESS,
        amountInWei
      ).send({ from: this.state.account });
      
      this.pushToGuiTerminal(`[[success]]FLIP tokens approved![[/success]]`);
      this.pushToGuiTerminal(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      this.pushToGuiTerminal(`[[error]]Approval error: ${error.message}[[/error]]`);
      console.error("Approval error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Create a new wager
  createWager = async (matchupId, predictedWinner, amount, isDoubleInsured, upcId) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(amount, 'ether');
      const predictedWinnerEnum = this.getTeamEnum(predictedWinner);
      const isDoubleInsuredBool = isDoubleInsured === 'true' || isDoubleInsured === '1';
      
      this.pushToGuiTerminal(`Creating wager for matchup ${matchupId}...`);
      this.pushToGuiTerminal(`Predicted winner: ${predictedWinner} (enum: ${predictedWinnerEnum})`);
      this.pushToGuiTerminal(`Amount: ${amount} MATIC (${amountInWei} wei)`);
      this.pushToGuiTerminal(`Double insured: ${isDoubleInsuredBool}`);
      this.pushToGuiTerminal(`UPC ID: ${upcId}`);
      
      const tx = await this.state.mlbBetting.methods.createWager(
        matchupId,
        predictedWinnerEnum,
        isDoubleInsuredBool,
        upcId
      ).send({ 
        from: this.state.account,
        value: amountInWei
      });

      this.pushToGuiTerminal(
        `[[success]]Wager created successfully![[/success]]`
      );
      this.pushToGuiTerminal(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      this.pushToGuiTerminal(
        `[[error]]Wager creation error: ${error.message}[[/error]]`
      );
      console.error("Wager creation error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Join an existing wager
  joinWager = async (wagerId, predictedWinner, amount) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(amount, 'ether');
      const predictedWinnerEnum = this.getTeamEnum(predictedWinner);
      
      this.pushToGuiTerminal(`Joining wager ${wagerId}...`);
      this.pushToGuiTerminal(`Predicted winner: ${predictedWinner} (enum: ${predictedWinnerEnum})`);
      this.pushToGuiTerminal(`Amount: ${amount} MATIC (${amountInWei} wei)`);
      
      const tx = await this.state.mlbBetting.methods.joinWager(
        wagerId,
        predictedWinnerEnum
      ).send({ 
        from: this.state.account,
        value: amountInWei
      });

      this.pushToGuiTerminal(
        `[[success]]Successfully joined wager![[/success]]`
      );
      this.pushToGuiTerminal(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      this.pushToGuiTerminal(
        `[[error]]Error joining wager: ${error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Claim wager rewards
  claimReward = async (wagerId) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      this.pushToGuiTerminal(`Claiming reward for wager ${wagerId}...`);
      const tx = await this.state.mlbBetting.methods.claimReward(
        wagerId
      ).send({ from: this.state.account });
      
      this.pushToGuiTerminal(
        `[[success]]Reward claimed successfully![[/success]]`
      );
      this.pushToGuiTerminal(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      this.pushToGuiTerminal(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Get matchup details
  getMatchupDetails = async (matchupId) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      this.pushToGuiTerminal(`Fetching details for matchup ${matchupId}...`);
      const details = await this.state.mlbBetting.methods.getMatchupDetails(
        matchupId
      ).call();
      
      this.pushToGuiTerminal('<span style="color:#FF5722;font-weight:bold">=== Matchup Details ===</span>');
      this.pushToGuiTerminal(`<span style="color:#FFC107">Home Team:</span> <span style="color:#64B5F6">${this.state.teams[details.homeTeam]}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Away Team:</span> <span style="color:#64B5F6">${this.state.teams[details.awayTeam]}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Game Date:</span> <span style="color:#64B5F6">${new Date(details.gameDay * 86400 * 1000).toISOString().split('T')[0]}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Home Score:</span> <span style="color:#64B5F6">${details.homeScore}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Away Score:</span> <span style="color:#64B5F6">${details.awayScore}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Current Inning:</span> <span style="color:#64B5F6">${details.currentInning}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Finished:</span> <span style="color:#${details.isFinished ? '4CAF50' : 'F44336'}">${details.isFinished ? 'Yes' : 'No'}</span>`);
    } catch (error) {
      this.pushToGuiTerminal(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Get wager details
  getWagerDetails = async (wagerId) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      this.pushToGuiTerminal(`Fetching details for wager ${wagerId}...`);
      const details = await this.state.mlbBetting.methods.getWagerDetails(
        wagerId
      ).call();
      
      this.pushToGuiTerminal('<span style="color:#FF5722;font-weight:bold">=== Wager Details ===</span>');
      this.pushToGuiTerminal(`<span style="color:#FFC107">Matchup ID:</span> <span style="color:#64B5F6">${details.matchupId}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Initiator:</span> <span style="color:#64B5F6">${details.initiator}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Predicted Winner:</span> <span style="color:#64B5F6">${this.state.teams[details.predictedWinner]}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Amount:</span> <span style="color:#64B5F6">${this.state.web3.utils.fromWei(details.wagerAmount, 'ether')} MATIC</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Double Insured:</span> <span style="color:#${details.isDoubleInsured ? '4CAF50' : 'F44336'}">${details.isDoubleInsured ? 'Yes' : 'No'}</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Insurance Fee:</span> <span style="color:#64B5F6">${this.state.web3.utils.fromWei(details.insuranceFee, 'ether')} MATIC</span>`);
      this.pushToGuiTerminal(`<span style="color:#FFC107">Settled:</span> <span style="color:#${details.isSettled ? '4CAF50' : 'F44336'}">${details.isSettled ? 'Yes' : 'No'}</span>`);
    } catch (error) {
      this.pushToGuiTerminal(
        `[[error]]Error: ${error.reason || error.message}[[/error]]`
      );
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Deposit Flip tokens to contract
  depositFlipTokens = async (amount) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const amountInWei = this.state.web3.utils.toWei(amount, 'ether');
      this.pushToGuiTerminal(`Depositing ${amount} FLIP tokens...`);
      
      const tx = await this.state.mlbBetting.methods.depositFlipTokens(
        amountInWei
      ).send({ from: this.state.account });
      
      this.pushToGuiTerminal(`[[success]]FLIP tokens deposited![[/success]]`);
      this.pushToGuiTerminal(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      this.pushToGuiTerminal(`[[error]]Deposit error: ${error.message}[[/error]]`);
      console.error("Deposit error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Add new matchup (owner only)
    addMatchup = async (homeTeam, awayTeam, dateString) => {
      this.setState({ isProgressing: true });
      
      try {
        const homeTeamEnum = this.getTeamEnum(homeTeam);
        const awayTeamEnum = this.getTeamEnum(awayTeam);
        const gameDay = this.parseDateString(dateString);
        
        const tx = await this.state.mlbBetting.methods.addMatchup(
          homeTeamEnum,
          awayTeamEnum,
          gameDay
        ).send({ from: this.state.account });

        return tx; // Return the transaction for the modal to handle
      } catch (error) {
        throw error; // Let the modal handle the error
      } finally {
        this.setState({ isProgressing: false });
      }
    };

  // Edit existing matchup (owner only)
  editMatchup = async (matchupId, homeTeam, awayTeam, dateString) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      this.pushToGuiTerminal(`Editing matchup ${matchupId}: ${homeTeam} vs ${awayTeam}...`);
      
      const homeTeamEnum = this.getTeamEnum(homeTeam);
      const awayTeamEnum = this.getTeamEnum(awayTeam);
      const gameDay = this.parseDateString(dateString);
      const displayDate = new Date(gameDay * 86400 * 1000).toISOString().split('T')[0];
      
      this.pushToGuiTerminal(`New game day: ${displayDate} (day number: ${gameDay})`);
      
      const tx = await this.state.mlbBetting.methods.modifyMatchup(
        matchupId,
        homeTeamEnum,
        awayTeamEnum,
        gameDay
      ).send({ from: this.state.account });

      this.pushToGuiTerminal(
        `[[success]]Matchup modified successfully![[/success]]`
      );
      this.pushToGuiTerminal(`Transaction hash: ${tx.transactionHash}`);
      this.pushToGuiTerminal(`New details: ${homeTeam} vs ${awayTeam} on ${displayDate}`);
    } catch (error) {
      this.pushToGuiTerminal(
        `[[error]]Error modifying matchup: ${error.message}[[/error]]`
      );
      console.error("Modify matchup error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Update matchup (owner only)
  updateMatchup = async (matchupId, homeScore, awayScore, currentInning, isFinished) => {

    this.setState({ isProgressing: true });
    if(isFinished === false)
    {
       isFinished = 0;
    }
    try {
      this.pushToGuiTerminal(`Updating matchup ${matchupId}...`);
      
      const tx = await this.state.mlbBetting.methods.updateMatchup(
        matchupId,
        homeScore,
        awayScore,
        currentInning,
        isFinished
      ).send({ from: this.state.account });

      this.pushToGuiTerminal(
        `[[success]]Matchup updated successfully![[/success]]`
      );
      this.pushToGuiTerminal(`Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
      this.pushToGuiTerminal(
        `[[error]]Error updating matchup: ${error.message}[[/error]]`
      );
      console.error("Update matchup error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Get matchups by date (YYYY-MM-DD format)
  getMatchupsByDate = async (dateString) => {
    const terminal = this.terminal.current;
    this.setState({ isProgressing: true });
    
    try {
      const dayNumber = this.parseDateString(dateString);
      this.pushToGuiTerminal(`Fetching matchups for ${dateString} (day ${dayNumber})...`);
      
      const matchupIds = await this.state.mlbBetting.methods.getMatchupsByDay(
        dayNumber
      ).call();
      
      if (matchupIds.length === 0) {
        this.pushToGuiTerminal('[[info]]No matchups found for this date[[/info]]');
        return;
      }
      
      this.pushToGuiTerminal('[[header]]=== Matchups ===[[/header]]');
      matchupIds.forEach(id => {
        this.pushToGuiTerminal(`- ID: ${id}`);
      });
      this.pushToGuiTerminal(`[[info]]Found ${matchupIds.length} matchup(s)[[/info]]`);
    } catch (error) {
      this.pushToGuiTerminal(
        `[[error]]Error fetching matchups: ${error.message}[[/error]]`
      );
      console.error("Get matchups by date error:", error);
    } finally {
      this.setState({ isProgressing: false });
    }
  };

  // Get detailed view of matchups by date
    // Modify all terminal output calls to use this method instead
    // For example, in getMatchupsByDateDetailed:
    getMatchupsByDateDetailed = async (dateString) => {
      this.setState({ isProgressing: true });
      
      try {
        const dayNumber = this.parseDateString(dateString);
        this.pushToGuiTerminal(`Fetching detailed matchups for ${dateString}...`);
        
        const matchupIds = await this.state.mlbBetting.methods.getMatchupsByDay(
          dayNumber
        ).call();
        
        if (matchupIds.length === 0) {
          this.pushToGuiTerminal('[[info]]No matchups found for this date[[/info]]');
          return;
        }
        
        this.pushToGuiTerminal('<span style="color:#FF5722;font-weight:bold">=== Matchups ===</span>');
        
        for (const id of matchupIds) {
          const details = await this.state.mlbBetting.methods.getMatchupDetails(id).call();
          const homeTeam = this.state.teams[details.homeTeam];
          const awayTeam = this.state.teams[details.awayTeam];
          
          this.pushToGuiTerminal(`<span style="color:#FFC107">Matchup ID:</span> <span style="color:#64B5F6">${id}</span>`);
          this.pushToGuiTerminal(`<span style="color:#FFC107">Teams:</span> <span style="color:#64B5F6">${homeTeam} vs ${awayTeam}</span>`);
          this.pushToGuiTerminal(`<span style="color:#FFC107">Score:</span> <span style="color:#64B5F6">${details.homeScore} - ${details.awayScore}</span>`);
          this.pushToGuiTerminal(`<span style="color:#FFC107">Inning:</span> <span style="color:#64B5F6">${details.currentInning}</span>`);
          this.pushToGuiTerminal(`<span style="color:#FFC107">Status:</span> <span style="color:#${details.isFinished ? '4CAF50' : 'F44336'}">${details.isFinished ? 'Finished' : 'In Progress'}</span>`);
          this.pushToGuiTerminal('----------------------------------');
        }
      } catch (error) {
        this.pushToGuiTerminal(
          `[[error]]Error: ${error.reason || error.message}[[/error]]`
        );
      } finally {
        this.setState({ isProgressing: false });
      }
    };

render() {
    const welcomeMsg = `
      [[header]]
      =============================================
      MLB Betting Terminal Interface
      =============================================
      [[/header]]
      Connected to: ${this.state.account || 'Not connected'}
      Type 'help' to see available commands
    `;

    // Mobile responsive styles
    const mobileStyles = {
      mainContainer: {
        padding: this.state.isMobile ? '10px' : '20px',
      },
      header: {
        flexDirection: this.state.isMobile ? 'column' : 'row',
        alignItems: this.state.isMobile ? 'flex-start' : 'center',
        paddingBottom: this.state.isMobile ? '5px' : '10px',
      },
      headerTitle: {
        fontSize: this.state.isMobile ? '1.2rem' : '1.5rem',
        marginBottom: this.state.isMobile ? '10px' : '0',
      },
      contentLayout: {
        gridTemplateColumns: this.state.isMobile ? '1fr' : '250px 1fr',
        gap: this.state.isMobile ? '10px' : '20px',
      },
      sidebar: {
        display: this.state.isMobile && this.state.activeTab !== 'sidebar' ? 'none' : 'block',
        padding: this.state.isMobile ? '10px' : '15px',
      },
      terminalHeight: {
        height: this.state.isMobile ? '150px' : '200px',
      },
      tabButton: {
        padding: this.state.isMobile ? '3px' : '5px',
        fontSize: this.state.isMobile ? '0.9em' : '1em',
      },
      modalContent: {
        width: this.state.isMobile ? '95%' : '80%',
        maxWidth: this.state.isMobile ? 'none' : '600px',
        padding: this.state.isMobile ? '10px' : '20px',
      }
    };

    return (
      <div style={{ 
        position: 'relative',
        backgroundColor: CYBERPUNK_THEME.background,
        minHeight: '100vh',
        padding: mobileStyles.mainContainer.padding,
        fontFamily: "'Courier New', monospace"
      }}>
        {/* Cyberpunk header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: mobileStyles.header.alignItems,
          marginBottom: '20px',
          borderBottom: `2px solid ${CYBERPUNK_THEME.primary}`,
          paddingBottom: mobileStyles.header.paddingBottom,
          flexDirection: mobileStyles.header.flexDirection
        }}>
          <h1 style={{
            color: CYBERPUNK_THEME.primary,
            margin: 0,
            textShadow: `0 0 5px ${CYBERPUNK_THEME.primary}`,
            letterSpacing: '2px',
            fontSize: mobileStyles.headerTitle.fontSize,
            marginBottom: mobileStyles.headerTitle.marginBottom
          }}>
            MLB BETTING TERMINAL
          </h1>
          {this.renderCyberpunkButton(
            this.state.showGUI ? 'SHOW CLI' : 'SHOW GUI', 
            this.toggleGUI,
            { 
              width: this.state.isMobile ? '120px' : '150px',
              fontSize: this.state.isMobile ? '0.8rem' : '1rem'
            }
          )}
        </div>

        {this.state.showGUI ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: this.state.isMobile ? 'auto' : 'calc(100vh - 120px)'
          }}>
            {/* Mobile menu toggle */}
            {this.state.isMobile && (
              <button 
                onClick={() => this.setActiveTab('sidebar')}
                style={{
                  background: 'none',
                  border: `1px solid ${CYBERPUNK_THEME.primary}`,
                  color: CYBERPUNK_THEME.text,
                  padding: '5px 10px',
                  marginBottom: '10px',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                ☰ Menu
              </button>
            )}

            {/* Main content area */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: mobileStyles.contentLayout.gridTemplateColumns,
              gap: mobileStyles.contentLayout.gap,
              flex: 1,
              minHeight: 0
            }}>
              {/* Sidebar - conditionally shown on mobile */}
              {(this.state.isMobile && this.state.activeTab === 'sidebar') || !this.state.isMobile ? (
                <div style={{
                  background: '#1a1a2e',
                  borderRadius: '5px',
                  padding: mobileStyles.sidebar.padding,
                  border: CYBERPUNK_THEME.terminalBorder,
                  boxShadow: CYBERPUNK_THEME.terminalShadow,
                  overflowY: 'auto',
                  display: mobileStyles.sidebar.display
                }}>
                  <div style={{ marginBottom: this.state.isMobile ? '15px' : '30px' }}>
                    <h3 style={{ 
                      color: CYBERPUNK_THEME.primary,
                      borderBottom: `1px solid ${CYBERPUNK_THEME.primary}`,
                      paddingBottom: '5px',
                      fontSize: this.state.isMobile ? '1rem' : '1.1rem'
                    }}>
                      NAVIGATION
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {['dashboard', 'wagers', 'matchups', ...(this.state.admins && this.state.admins[this.state.account] ? ['admin'] : [])].map(tab => (
                        <li key={tab} style={{ marginBottom: '8px' }}>
                          <button 
                            onClick={() => this.setActiveTab(tab)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: this.state.activeTab === tab ? CYBERPUNK_THEME.primary : CYBERPUNK_THEME.text,
                              cursor: 'pointer',
                              fontFamily: "'Courier New', monospace",
                              fontSize: mobileStyles.tabButton.fontSize,
                              textAlign: 'left',
                              width: '100%',
                              padding: mobileStyles.tabButton.padding,
                              borderRadius: '3px',
                              ...(this.state.activeTab === tab && {
                                background: 'rgba(0, 240, 255, 0.1)',
                                borderLeft: `3px solid ${CYBERPUNK_THEME.primary}`
                              })
                            }}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 style={{ 
                      color: CYBERPUNK_THEME.primary,
                      borderBottom: `1px solid ${CYBERPUNK_THEME.primary}`,
                      paddingBottom: '5px',
                      fontSize: this.state.isMobile ? '1rem' : '1.1rem'
                    }}>
                      QUICK ACTIONS
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: this.state.isMobile ? 'row' : 'column', 
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}>
                      {this.renderCyberpunkButton('New Wager', () => this.showGBetModal(), { 
                        width: this.state.isMobile ? '48%' : '100%',
                        padding: this.state.isMobile ? '8px 5px' : '12px 24px',
                        fontSize: this.state.isMobile ? '0.8rem' : '1rem'
                      })}
                      {this.renderCyberpunkButton('Join Wager', () => this.showGJoinModal(), { 
                        width: this.state.isMobile ? '48%' : '100%',
                        padding: this.state.isMobile ? '8px 5px' : '12px 24px',
                        fontSize: this.state.isMobile ? '0.8rem' : '1rem'
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Main content */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                background: '#1a1a2e',
                borderRadius: '5px',
                border: CYBERPUNK_THEME.terminalBorder,
                boxShadow: CYBERPUNK_THEME.terminalShadow,
                overflow: 'hidden',
                minHeight: 0
              }}>
                {/* Tab content */}
                <div style={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  padding: this.state.isMobile ? '10px' : '20px',
                  minHeight: 0
                }}>
                  {this.state.activeTab === 'dashboard' && this.renderDashboard()}
                  {this.state.activeTab === 'wagers' && this.renderWagersTab()}
                  {this.state.activeTab === 'matchups' && this.renderMatchupsTab()}
                  {this.state.activeTab === 'admin' && this.renderAdminTab()}
                </div>
                
                {/* Developer tools terminal */}
                <div style={{
                  height: mobileStyles.terminalHeight.height,
                  borderTop: `1px solid ${CYBERPUNK_THEME.primary}`,
                  background: CYBERPUNK_THEME.terminalBg,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0
                }}>
                  <Terminal
                    ref={this.guiTerminal}
                    style={{
                      flex: 1,
                      backgroundColor: CYBERPUNK_THEME.terminalBg,
                      borderRadius: 0,
                      padding: this.state.isMobile ? "5px" : "10px",
                      fontFamily: "'Courier New', monospace",
                      border: 'none',
                      boxShadow: 'none',
                      overflowY: 'auto',
                      minHeight: 0,
                      fontSize: this.state.isMobile ? '0.9em' : '1em'
                    }}
                    contentStyle={{
                      height: '100%',
                      overflowY: 'auto',
                      paddingRight: '10px',
                      minHeight: 0
                    }}
                    messageStyle={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: '1.4'
                    }}
                    dangerMode={true}
                    welcomeMessage="[[header]]=== Developer Console ===[[/header]]"
                    ignoreCommandCase={true}
                    promptLabel={'>'}
                    promptLabelStyle={{
                      color: CYBERPUNK_THEME.primary,
                      fontWeight: "bold"
                    }}
                    inputTextStyle={{
                      color: CYBERPUNK_THEME.text
                    }}
                    autoFocus={false}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Terminal
            style={{
              minHeight: this.state.isMobile ? "60vh" : "75vh",
              backgroundColor: CYBERPUNK_THEME.terminalBg,
              zIndex: "99",
              borderRadius: "5px",
              padding: this.state.isMobile ? "5px" : "10px",
              fontFamily: "'Courier New', monospace",
              border: CYBERPUNK_THEME.terminalBorder,
              boxShadow: CYBERPUNK_THEME.terminalShadow,
              fontSize: this.state.isMobile ? '0.9em' : '1em'
            }}
            ref={this.terminal}
            commands={{
            gbet: {
              description: 'Open GUI for placing new bets',
              fn: () => this.showGBetModal()
            },
            gjoin: {
              description: 'Open GUI for joining existing wagers',
              fn: () => this.showGJoinModal()
            },
            games: {
              description: 'List games by date (YYYY-MM-DD)',
              fn: async (date) => await this.getMatchupsByDate(date)
            },
            gamesdetail: {
              description: 'List games with details by date (YYYY-MM-DD)',
              fn: async (date) => await this.getMatchupsByDateDetailed(date)
            },
            teams: {
              description: 'List all teams or filter by name',
              fn: async (filter = '') => await this.listTeams(filter)
            },
            bal: {
              description: 'Check contract FLIP token balance',
              fn: async () => await this.checkFlipBalance()
            },
            approve: {
              description: 'Approve FLIP tokens for betting contract',
              fn: async (amount) => await this.approveFlipTokens(amount)
            },
            createwager: {
              description: 'Create new wager',
              fn: async (...args) => await this.createWager(...args)
            },
            joinwager: {
              description: 'Join existing wager',
              fn: async (...args) => await this.joinWager(...args)
            },
            claim: {
              description: 'Claim wager reward',
              fn: async (wagerId) => await this.claimReward(wagerId)
            },
            matchup: {
              description: 'Get matchup details',
              fn: async (matchupId) => await this.getMatchupDetails(matchupId)
            },
            wager: {
              description: 'Get wager details',
              fn: async (wagerId) => await this.getWagerDetails(wagerId)
            },
            depositflip: {
              description: 'Deposit FLIP tokens to contract',
              fn: async (amount) => await this.depositFlipTokens(amount)
            },
            addmatchup: {
              description: 'Add new matchup (Owner only)',
              fn: async (...args) => await this.addMatchup(...args)
            },
            editmatchup: {
              description: 'Edit existing matchup (Owner only)',
              fn: async (...args) => await this.editMatchup(...args)
            },
            updatematchup: {
              description: 'Update matchup (Owner only)',
              fn: async (...args) => await this.updateMatchup(...args)
            },
            setfinished: {
              description: 'Set matchup finished status (Owner only)',
              fn: async (...args) => await this.setMatchupFinished(...args)
            },
            mywagers: {
              description: 'List all your wagers',
              fn: async () => await this.getUserWagers()
            },
            mywins: {
              description: 'List your won wagers',
              fn: async () => await this.getUserWonWagers()
            },
            mylosses: {
              description: 'List your lost wagers',
              fn: async () => await this.getUserLostWagers()
            },
            myactive: {
              description: 'List your active wagers',
              fn: async () => await this.getUserActiveWagers()
            },
            gui: {
              description: 'Toggle GUI mode',
              fn: () => this.toggleGUI()
            }
            }}
            dangerMode={true}
            welcomeMessage={welcomeMsg}
            ignoreCommandCase={true}
            promptLabel={'user@mlbbetting:~$'}
            promptLabelStyle={{
              color: CYBERPUNK_THEME.primary,
              fontWeight: "bold",
              fontSize: this.state.isMobile ? "1em" : "1.1em"
            }}
            inputTextStyle={{
              color: CYBERPUNK_THEME.text,
              fontSize: this.state.isMobile ? "1em" : "1.1em"
            }}
            autoFocus={true}
          />
        )}
        
        {this.state.isProgressing && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: CYBERPUNK_THEME.primary,
            padding: '10px',
            borderRadius: '5px',
            border: `1px solid ${CYBERPUNK_THEME.primary}`,
            boxShadow: CYBERPUNK_THEME.terminalShadow,
            fontFamily: "'Courier New', monospace",
            fontSize: this.state.isMobile ? '0.8rem' : '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: `2px solid ${CYBERPUNK_THEME.primary}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Processing transaction...
            </div>
          </div>
        )}

        {/* Cyberpunk scanlines overlay */}
        <div style={{
          position: 'fixed',
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
          zIndex: 9999
        }}></div>
      </div>
    );
  }
}
export default MLBBettingTerminal;
