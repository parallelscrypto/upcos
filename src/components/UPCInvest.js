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
      investAddress: props.address,
      isConnected: false
    };
    this.terminal = React.createRef();
  }

  componentDidMount() {
    this.initConnection();
  }

  componentWillUnmount() {
    // Clean up any subscriptions or async tasks here
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
  };


  // ========== INVESTMENT CONDITIONS ==========
    setInvestmentConditions = async (min, max, isOpen) => {
        try {
            if (!this.state.currentContract) {
                throw new Error('No contract loaded');
            }

            // Verify ownership
            const owner = await this.state.currentContract.owner();
            if (owner.toLowerCase() !== this.state.account.toLowerCase()) {
                throw new Error('You must be the contract owner to set funding conditions');
            }

            const isOpenBool = isOpen.toLowerCase() === 'true' || isOpen === '1';
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

            // Verify current ownership
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
        return;
      }
  
      investors.forEach((investor, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${investor}`);
      });
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
        return;
      }
  
      investments.forEach((investment, idx) => {
        this.pushToTerminal(`  ${idx + 1}. Token: ${investment.tokenAddress}`);
        this.pushToTerminal(`     Amount: ${ethers.utils.formatUnits(investment.amount, 18)}`);
      });
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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

      this.pushToTerminal('[[header]]=== Contract Info ===[[/header]]');
      this.pushToTerminal(`Address: ${this.state.currentContract.address}`);
      this.pushToTerminal(`UPC: ${upc}`);
      this.pushToTerminal(`Serial Number: ${serialNumber || 'Not set'}`);
      this.pushToTerminal(`Owner: ${owner}`);
      this.pushToTerminal(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
        ethers.utils.parseUnits(amount.toString(), 18) // Assuming 18 decimals
      );
      await tx.wait();
      this.pushToTerminal(`[[success]]Successfully funded ${amount} tokens[[/success]]`);
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
        return;
      }

      tokens.forEach((token, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${token.symbol}: ${token.tokenAddress}`);
      });
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
        ethers.utils.parseEther(amount.toString())
      );
      await tx.wait();
      this.pushToTerminal(`[[success]]Successfully released ${amount} ETH[[/success]]`);
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
        ethers.utils.parseEther(amount.toString())
      );
      await tx.wait();
      this.pushToTerminal(`[[success]]Successfully withdrew ${amount} ETH[[/success]]`);
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
      this.setState({ serialNumber: number });
      this.pushToTerminal(`[[success]]Serial number set to ${number}[[/success]]`);
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
        return;
      }

      comrades.forEach((comrade, idx) => {
        this.pushToTerminal(`  ${idx + 1}. Address: ${comrade.comradeAddress}`);
        this.pushToTerminal(`     Percentage: ${comrade.percentage/100}%`);
        this.pushToTerminal(`     Description: ${comrade.description}`);
      });
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
        return;
      }

      for (let i = 0; i < upcs.length; i++) {
        this.pushToTerminal(`UPC: ${upcs[i]}`);
        addresses[i].forEach((addr, idx) => {
          this.pushToTerminal(`  ${idx + 1}. ${addr}`);
        });
      }
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
        return;
      }

      contracts.forEach((addr, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${addr}`);
      });
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
        return;
      }

      contracts.forEach((addr, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${addr}`);
      });
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
        return;
      }

      contracts.forEach((addr, idx) => {
        this.pushToTerminal(`  ${idx + 1}. ${addr}`);
      });
    } catch (error) {
      this.pushToTerminal(`[[error]]Error: ${error.message}[[/error]]`);
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
                // Verify this is a valid contract first
                await contract.upc();
            } catch (e) {
                throw new Error('The specified address is not a valid UPCInvestment contract');
            }

            // Check ownership
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
                serialNumber: serial
            });
        
            this.pushToTerminal(`[[success]]Successfully loaded funding contract[[/success]]`);
            this.pushToTerminal(`Address: ${address}`);
            this.pushToTerminal(`UPC: ${upc}`);
            this.pushToTerminal(`Owner: ${owner}`);
            if (serial) {
                this.pushToTerminal(`Serial Number: ${serial}`);
            }
        } catch (error) {
            this.pushToTerminal(`[[error]]Error loading contract: ${error.message}[[/error]]`);
        }
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
      </div>
    );
  }

}

export default UPCInvestCLI;
