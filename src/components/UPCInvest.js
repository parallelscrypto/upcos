import React from 'react';
import Terminal from 'react-console-emulator';
import { ethers } from 'ethers';
import UPCInvestmentABI from '../etc/rawmaterial/UPCInvest.json';
import UPCInvestFactoryABI from '../etc/rawmaterial/UPCInvestFactory.json';

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
      investAddress: props.address,
      isConnected: false,
      showGUI: false,
      activePanel: 'dashboard',
      contractSearchTerm: '',
      investorSearchTerm: '',
      newContractUPC: '',
      newComrade: {
        address: '',
        percentage: '',
        description: ''
      },
      investmentConditions: {
        min: '',
        max: '',
        isOpen: false
      },
      transferOwnerAddress: '',
      fundingAmount: '',
      tokenFunding: {
        address: '',
        amount: ''
      },
      releaseAmount: '',
      withdrawAmount: '',
      serialNumberInput: '',
      whitelistToken: {
        address: '',
        symbol: ''
      },
      dashboardOutput: [],
      contractOutput: [],
      investorOutput: [],
      comradesOutput: []
    };
    this.terminal = React.createRef();
  }
  componentDidMount() {
    this.initConnection();
  }

  componentWillUnmount() {
    if (this.state.provider) {
      this.state.provider.removeAllListeners();
    }
  }

  initConnection = async () => {
    const CONTRACT_ADDRESSES = {
      INVESTMENT: '0xf98Fbb7A0B85de590D30f3970d25D45619cb25E3',
      FACTORY: '0xD73046C401Da590E2d1CeFf9572621410782D590'
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
    
    // Also add to GUI output based on active panel
    const outputKey = `${this.state.activePanel}Output`;
    this.setState(prevState => ({
      [outputKey]: [...prevState[outputKey], message]
    }));
  };

  clearOutput = (panel) => {
    const outputKey = `${panel}Output`;
    this.setState({ [outputKey]: [] });
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








  toggleGUI = () => {
    this.setState(prevState => ({ showGUI: !prevState.showGUI }));
  };

  setActivePanel = (panel) => {
    this.setState({ activePanel: panel });
  };

  handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState(prevState => ({
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  handleNestedInputChange = (parent, e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      [parent]: {
        ...prevState[parent],
        [name]: value
      }
    }));
  };

  // ========== INVESTMENT CONDITIONS ==========
  setInvestmentConditions = async (min, max, isOpen) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      const owner = await this.state.currentContract.owner();
      if (owner.toLowerCase() !== this.state.account.toLowerCase()) {
        throw new Error('You must be the contract owner to set funding conditions');
      }

      const isOpenBool = isOpen === true || isOpen === 'true' || isOpen === '1';
      const minWei = ethers.utils.parseEther(min.toString());
      const maxWei = ethers.utils.parseEther(max.toString());

      this.pushToTerminal(`Setting funding conditions...`);
      this.pushToTerminal(`Min: ${min} ETH (${minWei.toString()} wei)`);
      this.pushToTerminal(`Max: ${max} ETH (${maxWei.toString()} wei)`);
      this.pushToTerminal(`Open for funding: ${isOpenBool}`);

      const tx = await this.state.currentContract.setInvestmentConditions(
        minWei,
        maxWei,
        isOpenBool
      );
      
      await tx.wait();
      
      this.setState({
        investmentConditions: {
          min: minWei,
          max: maxWei,
          isOpen: isOpenBool
        }
      });

      this.pushToTerminal('[[success]]Investment conditions updated successfully![[/success]]');
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  transferOwnership = async (newOwner) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      const owner = await this.state.currentContract.owner();
      if (owner.toLowerCase() !== this.state.account.toLowerCase()) {
        throw new Error('You must be the current owner to transfer ownership');
      }

      this.pushToTerminal(`Transferring ownership to: ${newOwner}`);
      const tx = await this.state.currentContract.transferOwnership(newOwner);
      await tx.wait();
      
      this.pushToTerminal('[[success]]Ownership transferred successfully![[/success]]');
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  getInvestmentConditions = async () => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      const [min, max, isOpen] = await Promise.all([
        this.state.currentContract.minInvestment(),
        this.state.currentContract.maxInvestment(),
        this.state.currentContract.openForInvestment()
      ]);

      this.setState({
        investmentConditions: {
          min: ethers.utils.formatEther(min),
          max: ethers.utils.formatEther(max),
          isOpen
        }
      });

      this.pushToTerminal('[[header]]=== Investment Conditions ===[[/header]]');
      this.pushToTerminal(`Minimum Investment: ${ethers.utils.formatEther(min)} ETH`);
      this.pushToTerminal(`Maximum Investment: ${ethers.utils.formatEther(max)} ETH`);
      this.pushToTerminal(`Open for Investment: ${isOpen ? '[[success]]YES[[/success]]' : '[[error]]NO[[/error]]'}`);
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
    }
  };

  // ========== INVESTOR COMMAND HANDLERS ==========
  listInvestors = async () => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }
  
      const investors = await this.state.currentContract.getInvestors();
      
      this.pushToTerminal('[[header]]=== Investors ===[[/header]]');
      
      if (investors.length === 0) {
        this.pushToTerminal('No investors found');
        return [];
      }
  
      investors.forEach((investor, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${investor}`);
      });

      return investors;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return [];
    }
  };
  
  getInvestorDetails = async (investorAddress) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }
  
      const [details, tokenInvestments] = await Promise.all([
        this.state.currentContract.getInvestorDetails(investorAddress),
        this.state.currentContract.getInvestorTokenInvestments(investorAddress)
      ]);
  
      const [totalInvested, availableBalance, releasedBalance] = details;
  
      this.pushToTerminal(`[[header]]=== Investor Details (${investorAddress}) ===[[/header]]`);
      this.pushToTerminal(`Total Invested: ${ethers.utils.formatEther(totalInvested)} ETH`);
      this.pushToTerminal(`Available Balance: ${ethers.utils.formatEther(availableBalance)} ETH`);
      this.pushToTerminal(`Released Balance: ${ethers.utils.formatEther(releasedBalance)} ETH`);
  
      if (tokenInvestments.length > 0) {
        this.pushToTerminal('\n[[header]]Token Investments:[[/header]]');
        tokenInvestments.forEach((investment, idx) => {
          this.pushToTerminal(`  ${idx + 1}. ${investment.symbol || 'Unknown'}: ${ethers.utils.formatUnits(investment.amount, 18)}`);
        });
      } else {
        this.pushToTerminal('\nNo token investments found');
      }

      return {
        totalInvested: ethers.utils.formatEther(totalInvested),
        availableBalance: ethers.utils.formatEther(availableBalance),
        releasedBalance: ethers.utils.formatEther(releasedBalance),
        tokenInvestments
      };
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return null;
    }
  };
  
  getInvestorTokenInvestments = async (investorAddress) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }
  
      const investments = await this.state.currentContract.getInvestorTokenInvestments(investorAddress);
      
      this.pushToTerminal(`[[header]]=== Token Investments (${investorAddress}) ===[[/header]]`);
      
      if (investments.length === 0) {
        this.pushToTerminal('No token investments found');
        return [];
      }
  
      investments.forEach((investment, idx) => {
        this.pushToTerminal(`  ${idx + 1}. Token: ${investment.tokenAddress}`);
        this.pushToTerminal(`     Amount: ${ethers.utils.formatUnits(investment.amount, 18)}`);
      });

      return investments;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return [];
    }
  };

  // ========== CONTRACT COMMAND HANDLERS ==========
  getContractInfo = async () => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      const [upc, serialNumber, owner, balance] = await Promise.all([
        this.state.currentContract.upc(),
        this.state.currentContract.serialNumber(),
        this.state.currentContract.owner(),
        this.state.provider.getBalance(this.state.currentContract.address)
      ]);

      this.setState({
        upc,
        serialNumber,
        serialNumberInput: serialNumber
      });

      this.pushToTerminal('[[header]]=== Contract Info ===[[/header]]');
      this.pushToTerminal(`Address: ${this.state.currentContract.address}`);
      this.pushToTerminal(`UPC: ${upc}`);
      this.pushToTerminal(`Serial Number: ${serialNumber || 'Not set'}`);
      this.pushToTerminal(`Owner: ${owner}`);
      this.pushToTerminal(`Balance: ${ethers.utils.formatEther(balance)} ETH`);

      return {
        address: this.state.currentContract.address,
        upc,
        serialNumber,
        owner,
        balance: ethers.utils.formatEther(balance)
      };
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return null;
    }
  };

  invest = async (amount) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Investing ${amount} ETH...`);
      const tx = await this.state.currentContract.invest({
        value: ethers.utils.parseEther(amount.toString())
      });
      await tx.wait();
      this.pushToTerminal(`[[success]]Successfully funded ${amount} ETH[[/success]]`);
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return false;
    }
  };

  investWithToken = async (tokenAddress, amount) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Investing ${amount} tokens from ${tokenAddress}...`);
      const tx = await this.state.currentContract.investWithToken(
        tokenAddress,
        ethers.utils.parseUnits(amount.toString(), 18)
      );
      await tx.wait();
      this.pushToTerminal(`[[success]]Successfully funded ${amount} tokens[[/success]]`);
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return false;
    }
  };

  whitelistToken = async (tokenAddress, symbol) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Whitelisting token ${symbol} at ${tokenAddress}...`);
      const tx = await this.state.currentContract.whitelistToken(
        tokenAddress,
        symbol
      );
      await tx.wait();
      this.pushToTerminal(`[[success]]Token ${symbol} whitelisted successfully[[/success]]`);
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return false;
    }
  };

  listWhitelistedTokens = async () => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      const tokens = await this.state.currentContract.getWhitelistedTokens();
      
      this.pushToTerminal('[[header]]=== Whitelisted Tokens ===[[/header]]');
      
      if (tokens.length === 0) {
        this.pushToTerminal('No whitelisted tokens found');
        return [];
      }

      tokens.forEach((token, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${token.symbol}: ${token.tokenAddress}`);
      });

      return tokens;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return [];
    }
  };

  releaseFunds = async (amount) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Releasing ${amount} ETH...`);
      const tx = await this.state.currentContract.releaseFunds(
        ethers.utils.parseEther(amount.toString())
      );
      await tx.wait();
      this.pushToTerminal(`[[success]]Successfully released ${amount} ETH[[/success]]`);
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return false;
    }
  };

  withdraw = async (amount) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Withdrawing ${amount} ETH...`);
      const tx = await this.state.currentContract.withdraw(
        ethers.utils.parseEther(amount.toString())
      );
      await tx.wait();
      this.pushToTerminal(`[[success]]Successfully withdrew ${amount} ETH[[/success]]`);
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return false;
    }
  };

  setSerialNumber = async (number) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal(`Setting serial number to ${number}...`);
      const tx = await this.state.currentContract.setSerialNumber(number);
      await tx.wait();
      this.setState({ 
        serialNumber: number,
        serialNumberInput: number 
      });
      this.pushToTerminal(`[[success]]Serial number set to ${number}[[/success]]`);
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return false;
    }
  };

  addComrade = async (address, percentage, description) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }
      percentage = percentage * 100; 
      this.pushToTerminal(`Adding comrade ${address} with ${percentage}% share...`);
      const tx = await this.state.currentContract.addComrade(
        address,
        percentage,
        description
      );
      await tx.wait();
      this.pushToTerminal(`[[success]]Comrade added successfully[[/success]]`);
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return false;
    }
  };

  updateComrade = async (index, address, percentage, description) => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      percentage = percentage * 100; 
      this.pushToTerminal(`Updating comrade at index ${index}...`);
      const tx = await this.state.currentContract.updateComrade(
        index,
        address,
        percentage,
        description
      );
      await tx.wait();
      this.pushToTerminal(`[[success]]Comrade updated successfully[[/success]]`);
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return false;
    }
  };

  listComrades = async () => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      const comrades = await this.state.currentContract.getComrades();
      
      this.pushToTerminal('[[header]]=== Comrades ===[[/header]]');
      
      if (comrades.length === 0) {
        this.pushToTerminal('No comrades found');
        return [];
      }

      comrades.forEach((comrade, idx) => {
        this.pushToTerminal(`  ${idx + 1}. Address: ${comrade.comradeAddress}`);
        this.pushToTerminal(`     Percentage: ${comrade.percentage/100}%`);
        this.pushToTerminal(`     Description: ${comrade.description}`);
      });

      return comrades;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return [];
    }
  };

  disburse = async () => {
    try {
      if (!this.state.currentContract) {
        throw new Error('No contract loaded');
      }

      this.pushToTerminal('Disbursing funds to comrades...');
      const tx = await this.state.currentContract.disburse();
      await tx.wait();
      this.pushToTerminal('[[success]]Funds disbursed successfully[[/success]]');
      return true;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return false;
    }
  };

  // ========== FACTORY COMMAND HANDLERS ==========
  listAllContracts = async () => {
    try {
      if (!this.state.factory) {
        throw new Error('Factory not connected');
      }

      const [upcs, addresses] = await this.state.factory.getAllInvestments();
      
      this.pushToTerminal('[[header]]=== All Contracts ===[[/header]]');
      
      if (upcs.length === 0) {
        this.pushToTerminal('No contracts found');
        return [];
      }

      const contracts = [];
      for (let i = 0; i < upcs.length; i++) {
        contracts.push({
          upc: upcs[i],
          addresses: addresses[i]
        });
        this.pushToTerminal(`UPC: ${upcs[i]}`);
        addresses[i].forEach((addr, idx) => {
          this.pushToTerminal(`  ${idx + 1}. ${addr}`);
        });
      }

      return contracts;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return [];
    }
  };

  listContractsByUPC = async (upc) => {
    try {
      if (!this.state.factory) {
        throw new Error('Factory not connected');
      }

      const contracts = await this.state.factory.getContractsForUPC(upc);
      
      this.pushToTerminal(`[[header]]=== Contracts for UPC: ${upc} ===[[/header]]`);
      
      if (contracts.length === 0) {
        this.pushToTerminal('No contracts found for this UPC');
        return [];
      }

      contracts.forEach((addr, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${addr}`);
      });

      return contracts;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return [];
    }
  };

  listMyContracts = async () => {
    try {
      if (!this.state.factory) {
        throw new Error('Factory not connected');
      }

      const contracts = await this.state.factory.getMyContracts();
      
      this.pushToTerminal('[[header]]=== My Contracts ===[[/header]]');
      
      if (contracts.length === 0) {
        this.pushToTerminal('You have no contracts');
        return [];
      }

      contracts.forEach((addr, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${addr}`);
      });

      return contracts;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return [];
    }
  };

  listContractsByUser = async (userAddress) => {
    try {
      if (!this.state.factory) {
        throw new Error('Factory not connected');
      }

      const contracts = await this.state.factory.getContractsByUser(userAddress);
      
      this.pushToTerminal(`[[header]]=== Contracts for User: ${userAddress} ===[[/header]]`);
      
      if (contracts.length === 0) {
        this.pushToTerminal('No contracts found for this user');
        return [];
      }

      contracts.forEach((addr, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${addr}`);
      });

      return contracts;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      return [];
    }
  };

  createContract = async (upc) => {
    try {
      this.pushToTerminal(`Creating new UPC Investment for ${upc}...`);
      const tx = await this.state.factory.createUPCInvestment(upc);
      await tx.wait();
      
      const contracts = await this.state.factory.getContractsForUPC(upc);
      const contractAddress = contracts[contracts.length - 1];
      
      this.pushToTerminal(
        `[[success]]Contract created! Address: ${contractAddress}[[/success]]`
      );
      return contractAddress;
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
      throw error;
    }
  };

loadContract = async (address) => {
  try {
    if (!address) {
      address = this.state.investAddress;
    }      
    this.pushToTerminal(`Loading funding contract at: ${address}`);
    
    const contract = new ethers.Contract(
      address,
      UPCInvestmentABI.abi,
      this.state.signer
    );

    try {
      await contract.upc();
    } catch (e) {
      throw new Error('The specified address is not a valid UPCInvestment contract');
    }

    const owner = await contract.owner();
    if (owner.toLowerCase() !== this.state.account.toLowerCase()) {
      this.pushToTerminal('[[warning]]Warning: You are not the owner of this contract[[/warning]]');
      this.pushToTerminal('[[warning]]Some functions may not be available[[/warning]]');
    }

    const [upc, serial] = await Promise.all([
      contract.upc(),
      contract.serialNumber()
    ]);
    
    this.setState({
      currentContract: contract,
      upc,
      serialNumber: serial,
      serialNumberInput: serial || ''
    });

    // Format the output as strings instead of returning an object
    this.pushToTerminal(`[[success]]Successfully loaded funding contract[[/success]]`);
    this.pushToTerminal(`Address: ${address}`);
    this.pushToTerminal(`UPC: ${upc}`);
    this.pushToTerminal(`Owner: ${owner}`);
    if (serial) {
      this.pushToTerminal(`Serial Number: ${serial}`);
    }

    // Return the contract details as formatted strings for the terminal
    return [
      `[[success]]Successfully loaded funding contract[[/success]]`,
      `Address: ${address}`,
      `UPC: ${upc}`,
      `Owner: ${owner}`,
      serial ? `Serial Number: ${serial}` : 'Serial Number: Not set'
    ].join('\n');
  } catch (error) {
    this.pushToTerminal(`[[error]]Error loading contract: ${error.message}[[/error]]`);
    throw error;
  }
};

  renderDashboardPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>DASHBOARD</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CONTRACT INFO</h3>
            <div style={styles.infoBox}>
              {this.state.currentContract ? (
                <>
                  <p>Address: {this.state.currentContract.address.substring(0, 12)}...</p>
                  <p>UPC: {this.state.upc || 'Not set'}</p>
                  <p>Serial: {this.state.serialNumber || 'Not set'}</p>
                  <button 
                    style={styles.button}
                    onClick={() => this.getContractInfo()}
                  >
                    REFRESH
                  </button>
                </>
              ) : (
                <p>No contract loaded</p>
              )}
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>FUNDING</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="fundingAmount"
                value={this.state.fundingAmount}
                onChange={this.handleInputChange}
                placeholder="ETH Amount"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.invest(this.state.fundingAmount)}
              >
                FUND WITH ETH
              </button>
              <div style={styles.divider}></div>
              <input
                type="text"
                name="address"
                value={this.state.tokenFunding.address}
                onChange={(e) => this.handleNestedInputChange('tokenFunding', e)}
                placeholder="Token Address"
                style={styles.input}
              />
              <input
                type="text"
                name="amount"
                value={this.state.tokenFunding.amount}
                onChange={(e) => this.handleNestedInputChange('tokenFunding', e)}
                placeholder="Token Amount"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.investWithToken(
                  this.state.tokenFunding.address, 
                  this.state.tokenFunding.amount
                )}
              >
                FUND WITH TOKEN
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>OWNER ACTIONS</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="serialNumberInput"
                value={this.state.serialNumberInput}
                onChange={this.handleInputChange}
                placeholder="Serial Number"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.setSerialNumber(this.state.serialNumberInput)}
              >
                SET SERIAL
              </button>
              <div style={styles.divider}></div>
              <button 
                style={styles.button}
                onClick={this.listComrades}
              >
                LIST COMRADES
              </button>
              <button 
                style={styles.button}
                onClick={this.disburse}
              >
                DISBURSE FUNDS
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>INVESTOR ACTIONS</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="releaseAmount"
                value={this.state.releaseAmount}
                onChange={this.handleInputChange}
                placeholder="ETH to Release"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.releaseFunds(this.state.releaseAmount)}
              >
                RELEASE FUNDS
              </button>
              <div style={styles.divider}></div>
              <input
                type="text"
                name="withdrawAmount"
                value={this.state.withdrawAmount}
                onChange={this.handleInputChange}
                placeholder="ETH to Withdraw"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.withdraw(this.state.withdrawAmount)}
              >
                WITHDRAW
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



  renderContractPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>CONTRACT MANAGEMENT</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CREATE CONTRACT</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="newContractUPC"
                value={this.state.newContractUPC}
                onChange={this.handleInputChange}
                placeholder="UPC Code"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.createContract(this.state.newContractUPC)}
              >
                CREATE
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>LOAD CONTRACT</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="contractSearchTerm"
                value={this.state.contractSearchTerm}
                onChange={this.handleInputChange}
                placeholder="Contract Address"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.loadContract(this.state.contractSearchTerm)}
              >
                LOAD
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>LIST CONTRACTS</h3>
            <div style={styles.infoBox}>
              <button 
                style={styles.button}
                onClick={this.listMyContracts}
              >
                MY CONTRACTS
              </button>
              <button 
                style={styles.button}
                onClick={this.listAllContracts}
              >
                ALL CONTRACTS
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>CONTRACT OWNERSHIP</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="transferOwnerAddress"
                value={this.state.transferOwnerAddress}
                onChange={this.handleInputChange}
                placeholder="New Owner Address"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.transferOwnership(this.state.transferOwnerAddress)}
              >
                TRANSFER OWNERSHIP
              </button>
            </div>
          </div>
        </div>
        {this.renderOutputArea(this.state.contractOutput)}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button 
            style={{ ...styles.button, width: 'auto', padding: '5px 10px' }}
            onClick={() => this.clearOutput('contract')}
          >
            CLEAR OUTPUT
          </button>
        </div>
      </div>
    );
  };



  renderInvestorPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>INVESTOR MANAGEMENT</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>LIST INVESTORS</h3>
            <div style={styles.infoBox}>
              <button 
                style={styles.button}
                onClick={this.listInvestors}
              >
                LIST ALL
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>INVESTOR DETAILS</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="investorSearchTerm"
                value={this.state.investorSearchTerm}
                onChange={this.handleInputChange}
                placeholder="Investor Address"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.getInvestorDetails(this.state.investorSearchTerm)}
              >
                GET DETAILS
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>TOKEN INVESTMENTS</h3>
            <div style={styles.infoBox}>
              <button 
                style={styles.button}
                onClick={this.listWhitelistedTokens}
              >
                LIST WHITELISTED
              </button>
              <div style={styles.divider}></div>
              <input
                type="text"
                name="address"
                value={this.state.whitelistToken.address}
                onChange={(e) => this.handleNestedInputChange('whitelistToken', e)}
                placeholder="Token Address"
                style={styles.input}
              />
              <input
                type="text"
                name="symbol"
                value={this.state.whitelistToken.symbol}
                onChange={(e) => this.handleNestedInputChange('whitelistToken', e)}
                placeholder="Token Symbol"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.whitelistToken(
                  this.state.whitelistToken.address,
                  this.state.whitelistToken.symbol
                )}
              >
                WHITELIST TOKEN
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>INVESTMENT CONDITIONS</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="min"
                value={this.state.investmentConditions.min}
                onChange={(e) => this.handleNestedInputChange('investmentConditions', e)}
                placeholder="Min ETH"
                style={styles.input}
              />
              <input
                type="text"
                name="max"
                value={this.state.investmentConditions.max}
                onChange={(e) => this.handleNestedInputChange('investmentConditions', e)}
                placeholder="Max ETH"
                style={styles.input}
              />
              <div style={styles.checkboxContainer}>
                <label style={styles.checkboxLabel}>
                  Open for Investment:
                  <input
                    type="checkbox"
                    name="isOpen"
                    checked={this.state.investmentConditions.isOpen}
                    onChange={(e) => this.handleNestedInputChange('investmentConditions', e)}
                    style={styles.checkbox}
                  />
                </label>
              </div>
              <button 
                style={styles.button}
                onClick={() => this.setInvestmentConditions(
                  this.state.investmentConditions.min,
                  this.state.investmentConditions.max,
                  this.state.investmentConditions.isOpen
                )}
              >
                SET CONDITIONS
              </button>
              <button 
                style={styles.button}
                onClick={this.getInvestmentConditions}
              >
                GET CONDITIONS
              </button>
            </div>
          </div>
        </div>
        {this.renderOutputArea(this.state.investorOutput)}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button 
            style={{ ...styles.button, width: 'auto', padding: '5px 10px' }}
            onClick={() => this.clearOutput('investor')}
          >
            CLEAR OUTPUT
          </button>
        </div>
      </div>
    );
  };



renderComradesPanel = () => {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>COMRADES MANAGEMENT</h2>
        <div style={styles.gridContainer}>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>ADD COMRADE</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="address"
                value={this.state.newComrade.address}
                onChange={(e) => this.handleNestedInputChange('newComrade', e)}
                placeholder="Address"
                style={styles.input}
              />
              <input
                type="text"
                name="percentage"
                value={this.state.newComrade.percentage}
                onChange={(e) => this.handleNestedInputChange('newComrade', e)}
                placeholder="Percentage (0-100)"
                style={styles.input}
              />
              <input
                type="text"
                name="description"
                value={this.state.newComrade.description}
                onChange={(e) => this.handleNestedInputChange('newComrade', e)}
                placeholder="Description"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.addComrade(
                  this.state.newComrade.address,
                  this.state.newComrade.percentage,
                  this.state.newComrade.description
                )}
              >
                ADD COMRADE
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>UPDATE COMRADE</h3>
            <div style={styles.infoBox}>
              <input
                type="text"
                name="index"
                value={this.state.updateComradeIndex}
                onChange={this.handleInputChange}
                placeholder="Index"
                style={styles.input}
              />
              <input
                type="text"
                name="address"
                value={this.state.updateComradeAddress}
                onChange={this.handleInputChange}
                placeholder="Address"
                style={styles.input}
              />
              <input
                type="text"
                name="percentage"
                value={this.state.updateComradePercentage}
                onChange={this.handleInputChange}
                placeholder="Percentage (0-100)"
                style={styles.input}
              />
              <input
                type="text"
                name="description"
                value={this.state.updateComradeDescription}
                onChange={this.handleInputChange}
                placeholder="Description"
                style={styles.input}
              />
              <button 
                style={styles.button}
                onClick={() => this.updateComrade(
                  this.state.updateComradeIndex,
                  this.state.updateComradeAddress,
                  this.state.updateComradePercentage,
                  this.state.updateComradeDescription
                )}
              >
                UPDATE COMRADE
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>LIST COMRADES</h3>
            <div style={styles.infoBox}>
              <button 
                style={styles.button}
                onClick={this.listComrades}
              >
                LIST ALL
              </button>
            </div>
          </div>
          <div style={styles.gridItem}>
            <h3 style={styles.subTitle}>DISBURSE FUNDS</h3>
            <div style={styles.infoBox}>
              <button 
                style={styles.button}
                onClick={this.disburse}
              >
                DISBURSE
              </button>
            </div>
          </div>
        </div>
        {this.renderOutputArea(this.state.comradesOutput)}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button 
            style={{ ...styles.button, width: 'auto', padding: '5px 10px' }}
            onClick={() => this.clearOutput('comrades')}
          >
            CLEAR OUTPUT
          </button>
        </div>
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

        {/* Glitch effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.05,
          mixBlendMode: 'overlay',
          backgroundImage: `
            linear-gradient(0deg, transparent 0%, ${CYBERPUNK.primary} 100%),
            linear-gradient(90deg, ${CYBERPUNK.secondary} 0%, transparent 100%)
          `
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
              UPC INVESTMENT TERMINAL
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
                    onClick={() => this.setActivePanel('contract')}
                    style={{
                      ...styles.navButton,
                      borderBottom: activePanel === 'contract' ? `2px solid ${CYBERPUNK.primary}` : 'none'
                    }}
                  >
                    CONTRACTS
                  </button>
                  <button 
                    onClick={() => this.setActivePanel('investor')}
                    style={{
                      ...styles.navButton,
                      borderBottom: activePanel === 'investor' ? `2px solid ${CYBERPUNK.primary}` : 'none'
                    }}
                  >
                    INVESTORS
                  </button>
                  <button 
                    onClick={() => this.setActivePanel('comrades')}
                    style={{
                      ...styles.navButton,
                      borderBottom: activePanel === 'comrades' ? `2px solid ${CYBERPUNK.primary}` : 'none'
                    }}
                  >
                    COMRADES
                  </button>
                </div>

              {/* Panel content */}
              <div style={{
                flex: 1,
                overflow: 'auto'
              }}>
                {activePanel === 'dashboard' && this.renderDashboardPanel()}
                {activePanel === 'contract' && this.renderContractPanel()}
                {activePanel === 'investor' && this.renderInvestorPanel()}
                {activePanel === 'comrades' && this.renderComradesPanel()}
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
                  description: 'Create new UPC contract',
                  usage: 'create <upc>',
                  fn: (upc) => this.createContract(upc)
                },
                load: {
                  description: 'Load existing contract',
                  usage: 'load <address>',
                  fn: (address) => this.loadContract(address)
                },
                info: {
                  description: 'Show contract details',
                  fn: this.getContractInfo
                },
                fund: {
                  description: 'fund ETH',
                  usage: 'fund <amount>',
                  fn: (amount) => this.invest(amount)
                },
                fundtoken: {
                  description: 'Fund with tokens',
                  usage: 'fundtoken <address> <amount>',
                  fn: (tokenAddress, amount) => this.investWithToken(tokenAddress, amount)
                },
                whitelist: {
                  description: 'Whitelist a token',
                  usage: 'whitelist <address> <symbol>',
                  fn: (tokenAddress, symbol) => this.whitelistToken(tokenAddress, symbol)
                },
                listtokens: {
                  description: 'List whitelisted tokens',
                  fn: this.listWhitelistedTokens
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
                },
                listall: {
                  description: 'List all contracts',
                  fn: this.listAllContracts
                },
                listupc: {
                  description: 'List contracts by UPC',
                  usage: 'listupc <upc>',
                  fn: (upc) => this.listContractsByUPC(upc)
                },
                listmy: {
                  description: 'List my contracts',
                  fn: this.listMyContracts
                },
                listuser: {
                  description: 'List contracts by user',
                  usage: 'listuser <address>',
                  fn: (address) => this.listContractsByUser(address)
                },
                transferowner: {
                    description: 'Transfer contract ownership',
                    usage: 'transferowner <address>',
                    fn: (newOwner) => this.transferOwnership(newOwner)
                },
                setconditions: {
                  description: 'Set funding conditions',
                  usage: 'setconditions <minETH> <maxETH> <true/false>',
                  fn: (min, max, isOpen) => this.setInvestmentConditions(min, max, isOpen)
                },
                getconditions: {
                  description: 'Get current funding conditions',
                  fn: this.getInvestmentConditions
                },
                listinvestors: {
                  description: 'List all investors',
                  fn: this.listInvestors
                },
                investor: {
                  description: 'Get investor details',
                  usage: 'investor <address>',
                  fn: (address) => this.getInvestorDetails(address)
                },
                investortokens: {
                  description: 'Get investor token investments',
                  usage: 'investortokens <address>',
                  fn: (address) => this.getInvestorTokenInvestments(address)
                }
              }}
              dangerMode={true}
              welcomeMessage={`
                [[header]]
                ===================================
                UPC Funding CyberTerm v2.4.1
                ===================================
                [[/header]]
                [[secondary]]Type 'help' for command list[[/secondary]]
                ${this.state.isConnected ? 
                  `\nConnected: ${this.state.account}` : 
                  '\n[[error]]Not connected[[/error]]'}
              `}
              ignoreCommandCase={true}
              promptLabel={'user@upc-fund:~$'}
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
    flex: 1,
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
    transition: 'all 0.2s'
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
    marginRight: '10px',
  '@media (max-width: 480px)': {
    padding: '10px 15px',
    fontSize: '12px'
  }
  },
  divider: {
    height: '1px',
    backgroundColor: CYBERPUNK.primary,
    margin: '10px 0',
    opacity: 0.3
  },
  checkboxContainer: {
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center'
  },
  checkboxLabel: {
    color: CYBERPUNK.text,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center'
  },
  checkbox: {
    marginLeft: '10px',
    width: '15px',
    height: '15px'
  },
  navContainer: {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: `1px solid ${CYBERPUNK.primary}`,
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
    scrollbarWidth: 'none', // Hide scrollbar for Firefox
    '&::-webkit-scrollbar': {
      display: 'none' // Hide scrollbar for Chrome/Safari
    }
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
    marginRight: '10px',
    flexShrink: 0 // Prevent buttons from shrinking
  }
};

export default UPCInvestCLI;
