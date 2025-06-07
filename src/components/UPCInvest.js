// UPCInvestmentCLI.js
import React from 'react';
import Terminal from 'react-console-emulator';
import { ethers } from 'ethers';
import UPCInvestmentABI from '../etc/rawmaterial/UPCInvest.json';
import UPCInvestFactoryABI from '../etc/rawmaterial/UPCInvestFactory.json';

// Cyberpunk styling
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
  terminalShadow: '0 0 15px rgba(0, 240, 255, 0.5)'
};

class UPCInvestCLI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      provider: null,
      signer: null,
      factory: null,
      currentContract: null,
      account: '',
      upc: '',
      serialNumber: '',
      isConnected: false
    };
    this.terminal = React.createRef();
  }

  componentDidMount() {
    this.initConnection();
  }

  initConnection = async () => {

    const CONTRACT_ADDRESSES = {
      INVESTMENT: '0xf98Fbb7A0B85de590D30f3970d25D45619cb25E3',
      FACTORY: '0x966C0dD86c7b0198c0d4018d2E4eA1FD7062f95a'
    };
 

    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.enable();
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        
        const factory = new ethers.Contract(
          CONTRACT_ADDRESSES.FACTORY,
          UPCInvestFactoryABI.abi,
          signer
        );

        this.setState({
          provider,
          signer,
          factory,
          account,
          isConnected: true
        });

        this.pushToTerminal(
          `[[success]]Connected to account: ${account}[[/success]]`
        );
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
  };

  // ========== COMMAND HANDLERS ==========
  createContract = async (upc) => {
    try {
      this.pushToTerminal(`Creating new UPC Investment for ${upc}...`);
      const tx = await this.state.factory.createUPCInvestment(upc);
      await tx.wait();
      
      const contractAddress = await this.state.factory.upcToContract(upc);
      this.pushToTerminal(
        `[[success]]Contract created! Address: ${contractAddress}[[/success]]`
      );
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };



  
 
  loadContract = async (address) => {
    try {
      
      this.pushToTerminal(`Loading investment contract at: ${address}`);
      
      const contract = new ethers.Contract(
        address,
        UPCInvestmentABI.abi,
        this.state.signer
      );
  
      // Verify this is actually a UPCInvestment contract
      try {
        await contract.upc();
      } catch (e) {
        throw new Error('The specified address is not a valid UPCInvestment contract');
      }
  
      const [upc, serial] = await Promise.all([
        contract.upc(),
        contract.serialNumber()
      ]);
      
      this.setState({
        currentContract: contract,
        upc,
        serialNumber: serial
      });
  
      this.pushToTerminal(`[[success]]Successfully loaded investment contract[[/success]]`);
      this.pushToTerminal(`Address: ${address}`);
      this.pushToTerminal(`UPC: ${upc}`);
      if (serial) {
        this.pushToTerminal(`Serial Number: ${serial}`);
      }
    } catch (error) {
      this.pushToTerminal(`[[error]]Error loading contract: ${error.message}[[/error]]`);
    }
  };








  setSerialNumber = async (serial) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Setting serial number to "${serial}"...`);
      const tx = await this.state.currentContract.setSerialNumber(serial);
      await tx.wait();
      
      this.setState({ serialNumber: serial });
      this.pushToTerminal('[[success]]Serial number updated![[/success]]');
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  invest = async (amount) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      const value = ethers.utils.parseEther(amount);
      this.pushToTerminal(`Investing ${amount} ETH...`);
      
      const tx = await this.state.currentContract.invest({ value });
      await tx.wait();
      
      this.pushToTerminal('[[success]]Investment successful![[/success]]');
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  releaseFunds = async (amount) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Releasing ${amount} ETH...`);
      const tx = await this.state.currentContract.releaseFunds(
        ethers.utils.parseEther(amount)
      );
      await tx.wait();
      
      this.pushToTerminal('[[success]]Funds released![[/success]]');
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  withdraw = async (amount) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Withdrawing ${amount} ETH...`);
      const tx = await this.state.currentContract.withdraw(
        ethers.utils.parseEther(amount)
      );
      await tx.wait();
      
      this.pushToTerminal('[[success]]Withdrawal successful![[/success]]');
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  addComrade = async (address, percentage, description) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Adding comrade ${address}...`);
      const tx = await this.state.currentContract.addComrade(
        address,
        percentage,
        description
      );
      await tx.wait();
      
      this.pushToTerminal('[[success]]Comrade added![[/success]]');
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  updateComrade = async (index, address, percentage, description) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Updating comrade at index ${index}...`);
      const tx = await this.state.currentContract.updateComrade(
        index,
        address,
        percentage,
        description
      );
      await tx.wait();
      
      this.pushToTerminal('[[success]]Comrade updated![[/success]]');
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  disburse = async () => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal('Initiating disbursement...');
      const tx = await this.state.currentContract.disburse();
      await tx.wait();
      
      this.pushToTerminal('[[success]]Funds disbursed![[/success]]');
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  getContractInfo = async () => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      const [
        totalInvested,
        availableFunds,
        releasedFunds,
        isActive
      ] = await this.state.currentContract.getInvestmentDetails();

      this.pushToTerminal('[[header]]=== Contract Info ===[[/header]]');
      this.pushToTerminal(`UPC: ${this.state.upc}`);
      this.pushToTerminal(`Serial: ${this.state.serialNumber || 'None'}`);
      this.pushToTerminal(`Active: ${isActive ? 'Yes' : 'No'}`);
      this.pushToTerminal(`Total Invested: ${ethers.utils.formatEther(totalInvested)} ETH`);
      this.pushToTerminal(`Available Funds: ${ethers.utils.formatEther(availableFunds)} ETH`);
      this.pushToTerminal(`Released Funds: ${ethers.utils.formatEther(releasedFunds)} ETH`);
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  listComrades = async () => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      const count = await this.state.currentContract.getComradesCount();
      this.pushToTerminal(`[[header]]=== Comrades (${count}) ===[[/header]]`);

      for (let i = 0; i < count; i++) {
        const [address, percentage, description] = 
          await this.state.currentContract.getComradeDetails(i);
        
        this.pushToTerminal(
          `#${i} - ${address} (${percentage/100}%) - "${description}"`
        );
      }
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  help = () => {
    this.pushToTerminal('[[header]]=== Available Commands ===[[/header]]');
    this.pushToTerminal('connect           - Connect wallet');
    this.pushToTerminal('create <upc>      - Create new UPC contract');
    this.pushToTerminal('load <upc>        - Load existing UPC contract');
    this.pushToTerminal('info              - Show contract details');
    this.pushToTerminal('invest <amount>   - Invest ETH');
    this.pushToTerminal('release <amount>  - Release funds');
    this.pushToTerminal('withdraw <amount> - Withdraw your funds');
    this.pushToTerminal('serial <number>   - Set serial number');
    this.pushToTerminal('addcom <addr> <%> <desc> - Add comrade');
    this.pushToTerminal('updatecom <idx> <addr> <%> <desc> - Update comrade');
    this.pushToTerminal('listcom           - List all comrades');
    this.pushToTerminal('disburse          - Disburse released funds');
    this.pushToTerminal('help              - Show this help');
  };

  render() {
    return (
      <div style={{
        backgroundColor: CYBERPUNK.background,
        padding: '20px',
        height: '100vh',
        position: 'relative'
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

        <Terminal
          ref={this.terminal}
          style={{
            height: '90vh',
            backgroundColor: CYBERPUNK.terminalBg,
            borderRadius: '5px',
            padding: '15px',
            fontFamily: "'Courier New', monospace",
            border: CYBERPUNK.terminalBorder,
            boxShadow: CYBERPUNK.terminalShadow,
            position: 'relative',
            zIndex: 2
          }}
          commands={{
            connect: {
              description: 'Connect wallet',
              fn: this.initConnection
            },
            create: {
              description: 'Create new UPC contract',
              usage: 'create <upc>',
              fn: (upc) => this.createContract(upc)
            },
            load: {
              description: 'Load existing UPC contract',
              usage: 'load <upc>',
              fn: (address) => this.loadContract(address)
            },
            info: {
              description: 'Show contract details',
              fn: this.getContractInfo
            },
            invest: {
              description: 'Invest ETH',
              usage: 'invest <amount>',
              fn: (amount) => this.invest(amount)
            },
            release: {
              description: 'Release funds',
              usage: 'release <amount>',
              fn: (amount) => this.releaseFunds(amount)
            },
            withdraw: {
              description: 'Withdraw your funds',
              usage: 'withdraw <amount>',
              fn: (amount) => this.withdraw(amount)
            },
            serial: {
              description: 'Set serial number',
              usage: 'serial <number>',
              fn: (number) => this.setSerialNumber(number)
            },
            addcom: {
              description: 'Add comrade',
              usage: 'addcom <address> <percentage> <description>',
              fn: (...args) => this.addComrade(...args)
            },
            updatecom: {
              description: 'Update comrade',
              usage: 'updatecom <index> <address> <percentage> <description>',
              fn: (...args) => this.updateComrade(...args)
            },
            listcom: {
              description: 'List all comrades',
              fn: this.listComrades
            },
            disburse: {
              description: 'Disburse released funds',
              fn: this.disburse
            }
          }}
          dangerMode={true}
          welcomeMessage={`
            [[header]]
            ===================================
            UPC Investment CyberTerm v2.4.1
            ===================================
            [[/header]]
            [[secondary]]Type 'help' for command list[[/secondary]]
            ${this.state.isConnected ? 
              `\nConnected: ${this.state.account}` : 
              '\n[[error]]Not connected[[/error]]'}
          `}
          ignoreCommandCase={true}
          promptLabel={'user@upc-invest:~$'}
          promptLabelStyle={{
            color: CYBERPUNK.primary,
            fontWeight: 'bold'
          }}
          inputTextStyle={{
            color: CYBERPUNK.text
          }}
          autoFocus={true}
        />
      </div>
    );
  }
}

export default UPCInvestCLI;
