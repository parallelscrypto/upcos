import React, { Component } from 'react'
import ReactCardFlip from 'react-card-flip';
import Iframe from 'react-iframe'
import Web3 from 'web3'
import UPCNFT from '../abis/UPCNFT.json'
import xUPC from '../abis/xUPC.json'
import afroX from '../abis/afroX.json'
import AQWB from '../abis/AQWB.json'
import Navbar from './Navbar'
import VideoBackground from './VideoBackground'
import Leases from './Leases'
import Evictions from './Evictions'
import Withdraw from './Withdraw'
import Deposit from './Deposit'
import IntroTypewriter from './IntroTypewriter'
import Intel from './Intel'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './App.css'
import 'react-tabs/style/react-tabs.css';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }


  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()




    // Load AQWB
    const aqwbNFTData = AQWB.networks[networkId]
    if(aqwbNFTData) {
      const aqwbNft = new web3.eth.Contract(AQWB.abi, aqwbNFTData.address)
      this.setState({ aqwbNft })
      this.setState({ aqwbNFTData: aqwbNFTData })
    } else {
      //window.alert('UPCNFT contract not deployed to detected network.')
    }




    // Load UPCNFT
    const upcNFTData = UPCNFT.networks[networkId]
    if(upcNFTData) {
      const upcNft = new web3.eth.Contract(UPCNFT.abi, upcNFTData.address)
           console.log(upcNft);
      this.setState({ upcNft })
      this.setState({ upcNFTData: upcNFTData })
    } else {
      //window.alert('UPCNFT contract not deployed to detected network.')
    }




    // Load afroX
    const afroXData = afroX.networks[networkId]
    if(afroXData) {
      const AFROX = new web3.eth.Contract(afroX.abi, afroXData.address)
      this.setState({ afroX: AFROX })
    } else {
      //window.alert('UPCGoldBank contract not deployed to detected network.')
    }

          var self =this;
	  //wait 5 sec for the animation to play
	  var start = new Date().getTime();
    var introTimer = 0;

    //only show the intro for 5 seconds
    for(introTimer;introTimer<10;introTimer++) {
        setTimeout(function() {
		var elapsed = new Date().getTime() - start;
		console.log(elapsed)
		if(elapsed >= 7000) {
                  self.setState({ loading: false })
		}
        },(introTimer+introTimer+1)*1000);

    }

  }



  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.web3 = new Web3(window.web3.currentProvider)
      //window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeTokens= async (upc) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    this.state.upcGoldBank.methods.depositMoney(upc, gameID, "testdomain2").send({ from: this.state.account , value: this.state.sendCryptoValue})
      .once('receipt', (receipt) => {
         this.setState({ loading: false })
      })
  };


  getVrByUpcId = async (upcId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    var vrLink = await this.state.upcNft.methods.getVrByUpcId(upcId).call({ from: this.state.account})
    return vrLink.toString();
  };

  listNfts = async () => {
    const { accounts, contract } = this.state;

    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    var vrLink = await this.state.upcNft.methods.getMyNfts().call({ from: this.state.account})
    return vrLink.toString();
  };

  swap = async (amount) => {
    const { accounts, contract } = this.state;
    this.state.afroX.methods.swap().send({ value: amount, from: this.state.account})
      .once('receipt', (receipt) => {
         this.setState({ loading: false })
      })
  };

  mintNft = async (upcId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    this.state.upcNft.methods.mintNft(upcId).send({ from: this.state.account})
      .once('receipt', (receipt) => {
         this.setState({ loading: false })
      })
  };

  buyNft = async (upcId, humanReadableName, domain) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
	  console.log("buying " + upcId);
    this.state.upcNft.methods.buyNft(upcId, humanReadableName, domain).send({ from: this.state.account })
      .once('receipt', (receipt) => {
         this.setState({ loading: false })
      })
  };


  getTVL= async () => {
  };


  updateUpc(e) {
     var upc = e.target.value;
     this.setState({ upc: upc });
  };

  componentDidMount(){
    var self = this;

//     this.setState({ upcBal });
    setInterval(function() {
        return self.getTVL();
     }, 2000);
  }

 
  handleFlip(e) {
    e.preventDefault();
    this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
  }
 

  handleChange(e) {
     const web3 = window.web3
     var sendEth = web3.utils.toWei(e.target.value, "ether")
     this.setState({ sendCryptoValue: sendEth });
  };


  withdraw = () => {
    this.state.afroX.methods.withdraw().send({ from: this.state.account });
    this.setState({ loading: false})
  }




  unstakeTokens = (word) => {
    var wordToUnstake = word.target.value;
    this.setState({ loading: true })
    this.state.upcGoldBank.methods.withdraw(wordToUnstake).send({ from: this.state.account });
    this.setState({ loading: false})
  }

  getMyBalance = async () => {
    const { accounts, contract } = this.state;

    var stakingBalance = await this.state.afroX.methods.balanceOf(this.state.account).call({ from: this.state.account });
    this.setState({daiTokenBalance: stakingBalance.toString() });
    return stakingBalance.toString();
  };


  approve= async () => {
    const web3 = window.web3
    const afroXData = this.state.afroX;

    const { accounts, contract } = this.state;

    var aqwbNFTData = this.state.aqwbNFTData;
    var approval = await this.state.afroX.methods.approve(aqwbNFTData.address, "10000000000000000000").send({ from: this.state.account });
    this.setState({daiTokenBalance: approval.toString() });
    return approval.toString();
  };

  mine= async () => {
    const web3 = window.web3
    const afroXData = this.state.afroX;

    const { accounts, contract } = this.state;

    var approval = await this.state.afroX.methods.mine().send({ from: this.state.account });
    this.setState({daiTokenBalance: approval.toString() });
    return approval.toString();
  };

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      upcGoldBank: {},
      daiTokenBalance: '0',
      stakingBalance: '0',
      loading: true,
      upc: '',
      isFlipped: false,
      intel: "",
      code: ""
    }

    var self = this;
    var scan;
    var tmpCode;



    let currentPath = props.location.pathname;
    if( currentPath.includes("intel") ) {
      this.state.intel = currentPath;
    }
    this.handleChange = this.handleChange.bind(this);
    this.listNfts= this.listNfts.bind(this);
    this.buyNft= this.buyNft.bind(this);
    this.mintNft= this.mintNft.bind(this);
    this.getVrByUpcId= this.getVrByUpcId.bind(this);
    this.mine= this.mine.bind(this);
    this.updateUpc= this.updateUpc.bind(this);
    this.getMyBalance = this.getMyBalance.bind(this);
    this.getTVL = this.getTVL.bind(this);
    this.approve= this.approve.bind(this);
    this.handleFlip = this.handleFlip.bind(this);
    this.swap= this.swap.bind(this);
    this.withdraw= this.withdraw.bind(this);
  }

  render() {
    const web3 = window.web3

    
    var contractBalance = this.state.stakingBalance;

    let deposit
    let withdraw 
    let leases
    let evictions
    var loadAnim 
    if(this.state.loading) {
            let data = this.state.intel; 
            loadAnim = 
            <IntroTypewriter
	    data={data}
            />
      deposit = loadAnim
      withdraw=loadAnim 
      leases=loadAnim 
      evictions=loadAnim
    }
    else if(this.state.intel) {
      deposit = "";
      deposit = <Intel
        daiTokenBalance={this.state.daiTokenBalance}
        stakingBalance={this.state.stakingBalance}
        contractBalance={this.state.contractBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        handleChange={this.handleChange}
        updateUpc={this.updateUpc}
	getMyBalance={this.getMyBalance}
	intel={this.state.intel}
	approve={this.approve}
	buyNft={this.buyNft}
	getVrByUpcId={this.getVrByUpcId}
	mintNft={this.mintNft}
	mine={this.mine}
	swap={this.swap}
	withdraw={this.withdraw}
      />


    } else {
      leases= <Leases
        daiTokenBalance={this.state.daiTokenBalance}
        stakingBalance={this.state.stakingBalance}
        contractBalance={this.state.contractBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        handleChange={this.handleChange}
        updateUpc={this.updateUpc}
	getMyScannables={this.getMyScannables}
	getScannable={this.getScannable}
	myAccount={this.state.account}
	getRewardInfo={this.getRewardInfo}
	swap={this.swap}
	withdraw={this.withdraw}
      />
    }

    return (
      <div style={{height: '100vh', width: '100vw', border:'none'}} >
			       {deposit}
      </div>
    );
  }
}

export default App;
