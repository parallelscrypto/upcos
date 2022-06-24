import React, { Component } from 'react'
import ReactCardFlip from 'react-card-flip';
import Iframe from 'react-iframe'
import Web3 from 'web3'
import UPCNFT from '../abis/UPCNFT.json'
import AfroNFT from '../abis/AfroNFT.json'
import MLS from '../abis/MalcolmsLittleSecret.json'
import AfrikaIsBeautiful from '../abis/AfrikaIsBeautiful.json'
import HomelessNFT from '../abis/HomelessNFT.json'
import RollinOnUPC from '../abis/RollinOnUPC.json'
import UpcBandRadio from '../abis/UpcBandRadio.json'
import SuperNavalnyBros from '../abis/SuperNavalnyBros.json'
import xUPC from '../abis/xUPC.json'
import piggy from '../abis/TipJar.json'
import intelX from '../abis/intelX.json'
import TubmanX from '../abis/TubmanX.json'
import InclusionX from '../abis/InclusionX.json'
import Keyz from '../abis/Keyz.json'
import Key from '../abis/Key.json'
import AQWB from '../abis/AQWB.json'
import UpcDAO from '../abis/UpcDAO.json'
import UPCMarket from '../abis/UPCMarket.json'
import WalkieTalkie from '../abis/WalkieTalkie.json'

import StableUPC from '../abis/StableUPC.json'

import PokingsHauntUs from '../abis/PokingsHauntUs.json'
import KegeExperiment from '../abis/KegeExperiment.json'

//import Navbar from './Navbar'
import VideoBackground from './VideoBackground'
import Leases from './Leases'
import Evictions from './Evictions'
import Withdraw from './Withdraw'
import Deposit from './Deposit'
import IntroTypewriter from './IntroTypewriter'
import Intel from './Intel'
import UPCBR_Channel from './App2';

import UpcStatsTicker from './UpcStatsTicker'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './App.css'
import 'react-tabs/style/react-tabs.css';
import { TickerTape } from "react-ts-tradingview-widgets";



//const market_address = "0x7e42A6D0c419E6525aeBF5085e602F465Fa0Fab3";
//const market_address = "0xAc2dC55B8114548A3b9ad1bAe72c6fE99e934D54";
//const market_address = "0x3f13e9b043A4eA779D6c3abbE4015b1ecDAcf1f3";
//const market_address = "0x59e09C81FF70efD0208B98E3843852aCA3962982";
//const market_address = "0x32Cdf28d9E148D373b04238864586784244C86b1";
const market_address = "0x28B3D93c4e25769F4aD52b7679D5186E077e0856";
const usdc_address   = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
var abi = require('human-standard-token-abi');

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

    // Load UpcDAO
    const afroMineNFTData = UpcDAO.networks[networkId]
    if(afroMineNFTData) {
      const afroMineNft = new web3.eth.Contract(UpcDAO.abi, afroMineNFTData.address)
      this.setState({ afroMineNft })
      this.setState({ afroMineNFTData: afroMineNFTData })
    } else {
      //window.alert('UPCNFT contract not deployed to detected network.')
    }

    // Load UPCMarket
    const upcMarketData = UPCMarket.networks[networkId]
    if(upcMarketData) {
      const upcMarket = new web3.eth.Contract(UPCMarket.abi, upcMarketData.address)
      this.setState({ upcMarket })
      this.setState({ upcMarketData: upcMarketData })
    } else {
      //window.alert('UPCNFT contract not deployed to detected network.')
    }


    // Load WalkieTalkie
    const walkieData = WalkieTalkie.networks[networkId]
    if(walkieData) {
      const walkieNft = new web3.eth.Contract(WalkieTalkie.abi, walkieData.address)
      this.setState({ walkieNft })
      this.setState({ walkieData: walkieData })
    } else {
      //window.alert('UPCNFT contract not deployed to detected network.')
    }




    // Load PiggyBank 
    const piggyData = piggy.networks[networkId]
    if(piggyData) {
      const piggyNft = new web3.eth.Contract(piggy.abi, piggyData.address)
      this.setState({ piggyNft })
      this.setState({ piggyData: piggyData })
    } else {
      //window.alert('UPCNFT contract not deployed to detected network.')
    }




    // Load UpcBandRadio
    const upcNFTData = AfrikaIsBeautiful.networks[networkId]
    if(upcNFTData) {
      const upcNft = new web3.eth.Contract(UpcBandRadio.abi, upcNFTData.address)
      this.setState({ upcNft })
      this.setState({ upcNFTData: upcNFTData })
    } else {
      //window.alert('UPCNFT contract not deployed to detected network.')
    }




    // Load UPCNFT
    const snbNFTData = SuperNavalnyBros.networks[networkId]
    if(snbNFTData) {
      const snbNft = new web3.eth.Contract(SuperNavalnyBros.abi, snbNFTData.address)
      this.setState({ snbNft })
      this.setState({ snbNFTData: snbNFTData })
    } else {
      //window.alert('UPCNFT contract not deployed to detected network.')
    }


	
    // Load STABLE PAY currency
    if(usdc_address)  {
      const USDC = new web3.eth.Contract(abi, usdc_address)
//      console.log("!!!!!!!!!! USDC IS !!!!!!!!!!!!!!!!")
//      let coinName = await USDC.methods.balanceOf('0x533084893cE0AFEd5C29e1F3a413b1A65b6383F4').call();
//      console.log(coinName);
//      console.log(USDC);
      this.setState({ USDC: USDC})
    } else {
      //window.alert('UPCGoldBank contract not deployed to detected network.')
    }

    // Load STABLE UPC TOKEN
    const stableUPCData = StableUPC.networks[networkId]
    if(stableUPCData) {
      const STABLE_UPC = new web3.eth.Contract(StableUPC.abi, stableUPCData.address)
      this.setState({ stableUPC: STABLE_UPC })
    } else {
      //window.alert('UPCGoldBank contract not deployed to detected network.')
    }




    // Load PAY currency
    const intelXData = TubmanX.networks[networkId]
    if(intelXData) {
      const AFROX = new web3.eth.Contract(Key.abi, intelXData.address)
      this.setState({ intelX: AFROX })
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




  getStableBalance = async () => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.	  
    //let coinName = await USDC.methods.balanceOf('0x533084893cE0AFEd5C29e1F3a413b1A65b6383F4').call();
    return this.state.USDC.methods.balanceOf(this.state.account).call({ from: this.state.account });
  };




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


  getSaleInfo = async (nftId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    return this.state.upcMarket.methods.auctionDetails(nftId).call({ from: this.state.account });
  };

  setUpcMarket = async (nftId, upc) => {
    const { accounts, contract } = this.state;

    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    var result = await this.state.upcMarket.methods.setUpc(nftId, upc).send({ from: this.state.account})
    return result.toString();
  };



  setHRNMarket = async (nftId, hrn) => {
    const { accounts, contract } = this.state;

    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    var result = await this.state.upcMarket.methods.setHumanReadableName(nftId, hrn).send({ from: this.state.account})
    return result.toString();
  };


  setMarketPrice = async (nftId, price) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    var result = await this.state.upcMarket.methods.setPrice(nftId, price).send({ from: this.state.account})
    return result.toString();
  };


  sendToMarket = async (nftId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    var result = await this.state.upcNft.methods.safeTransferFrom(this.state.account, market_address, nftId).send({ from: this.state.account})
    return result.toString();
  };

  buyFromMarket = async (nftId,amount) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    var result = await this.state.upcMarket.methods.completeSale(nftId).send({ value: amount, from: this.state.account})
    return result.toString();
  };



  collectFromMarket = async (nftId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    var result = await this.state.upcMarket.methods.collectNft(nftId).send({from: this.state.account})
    return result.toString();
  };





  getVrByUpcId = async (upcId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    var vrLink = await this.state.upcNft.methods.getVrByUpcId(upcId).call({ from: this.state.account})
    return vrLink.toString();
  };




  swap = async (amount) => {
    const { accounts, contract } = this.state;
    this.state.intelX.methods.swap().send({ value: amount, from: this.state.account})
      .once('receipt', (receipt) => {
         this.setState({ loading: false })
      })
  };

  approveUPCS = async () => {
    const web3 = window.web3
    const intelXData = this.state.intelX;

    const { accounts, contract } = this.state;

    var stableUPC = this.state.stableUPC;

	  console.log("-------addy------");
	  console.log(stableUPC._address);
	  console.log(stableUPC);
    var approval = await this.state.stableUPC.methods.approve(stableUPC._address, "50000000000000000000").send({ from: this.state.account });
    this.setState({daiTokenBalance: approval.toString() });
    return approval.toString();
  };



  approve= async () => {
    const web3 = window.web3
    const intelXData = this.state.intelX;

    const { accounts, contract } = this.state;

    var upcNFTData = this.state.upcNFTData;
    var approval = await this.state.intelX.methods.approve(upcNFTData.address, "50000000000000000000").send({ from: this.state.account });
    this.setState({daiTokenBalance: approval.toString() });
    return approval.toString();
  };


  approveUSDC = async () => {
    const web3 = window.web3
    const intelXData = this.state.intelX;

    const { accounts, contract } = this.state;

    var upcNFTData = this.state.upcNFTData;


    var approval = await this.state.USDC.methods.approve(upcNFTData.address, "500000000").send({ from: this.state.account });
    this.setState({usdcApprove: approval.toString() });
    return approval.toString();
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




////nav nft


  approveNav= async () => {
    const web3 = window.web3
    const intelXData = this.state.intelX;

    const { accounts, contract } = this.state;

    var snbNFTData = this.state.snbNFTData;
    var approval = await this.state.intelX.methods.approve(snbNFTData.address, "50000000000000000000").send({ from: this.state.account });
    this.setState({daiTokenBalance: approval.toString() });
    return approval.toString();
  };



  mintNftNav = async (upcId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    this.state.snbNft.methods.mintNft(upcId).send({ from: this.state.account})
      .once('receipt', (receipt) => {
         this.setState({ loading: false })
      })
  };


  buyNftNav = async (upcId, humanReadableName, domain) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
	  console.log("buying " + upcId);
    this.state.snbNft.methods.buyNft(upcId, humanReadableName, domain).send({ from: this.state.account })
      .once('receipt', (receipt) => {
         this.setState({ loading: false })
      })
  };




  upcInfoNav = async (upcId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    return this.state.snbNft.methods.upcInfo(upcId).call({ from: this.state.account });
  };

  latestTokenIdNav = async (upcId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    return this.state.snbNft.methods.latestTokenId().call({ from: this.state.account });
  };

  nftInfoNav = async (nftId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    return this.state.snbNft.methods.nftInfo(nftId).call({ from: this.state.account });
  };






////end nav nft


  upcInfo = async (upcId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    return this.state.upcNft.methods.upcInfo(upcId).call({ from: this.state.account });
  };

  latestTokenId = async (upcId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    return this.state.upcNft.methods.latestTokenId().call({ from: this.state.account });
  };



  getWalkieTalkie= async (upcId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    return this.state.walkieNft.methods.getWalkieTalkie(upcId).call({ from: this.state.account });
  };





 refreshFeed = async () => {
 var latest
 var feedItems = []; 
 let bal = this.latestTokenId();
     bal.then((value) => {
        latest = Math.round(value);
        var i = 0;

        let self = this;
        for(i = 0; i < latest; i++) {

           let info = this.getSaleInfo(i)
            .then((data) => {
                 if(data['tokenId'] > 0) {
                    feedItems.push(data);
                 }

           });

         }
         var rand = Math.floor(Math.random() * (9999999999 - 0 + 1)) + 0;
         this.setState({marketInfo:feedItems});
        // expected output: "Success!"
     }); 
     return feedItems;
  }





  nftInfo = async (nftId) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    return this.state.upcNft.methods.nftInfo(nftId).call({ from: this.state.account });
  };



  getMyNfts= async () => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    return this.state.upcNft.methods.getMyNfts().call({ from: this.state.account });
  };


  setIpfs= async (upcId, ipfsLink) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    this.state.upcNft.methods.setIpfs(upcId, ipfsLink).send({ from: this.state.account })
      .once('receipt', (receipt) => {
         this.setState({ loading: false })
      })
  };


  setWt= async (upcId, wtLink) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    this.state.walkieNft.methods.setWalkieTalkie(upcId, wtLink).send({ from: this.state.account })
      .once('receipt', (receipt) => {
         this.setState({ loading: false })
      })
  };



  setVr= async (upcId, vrLink) => {
    const { accounts, contract } = this.state;

    const gameID = "testGame";
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    this.state.upcNft.methods.setVr(upcId, vrLink).send({ from: this.state.account })
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

    setInterval(function() {
//    return self.refreshFeed()
     }, 20000);
//    return this.refreshFeed()
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


  redeemUPCS = (numUPCS) => {
    this.state.stableUPC.methods.redeemUPCSForTubmanX(numUPCS).send({ from: this.state.account });
    this.setState({ loading: false})
  }


  wn = () => {
    this.state.intelX.methods.withdraw().send({ from: this.state.account });
    this.setState({ loading: false})
  }


  wm = () => {
    this.state.afroMineNft.methods.withdraw().send({ from: this.state.account });
    this.setState({ loading: false})
  }

  wa = () => {
    this.state.intelX.methods.withdraw().send({ from: this.state.account });
    this.state.afroMineNft.methods.withdraw().send({ from: this.state.account });
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

    var stakingBalance = await this.state.intelX.methods.balanceOf(this.state.account).call({ from: this.state.account });
    this.setState({daiTokenBalance: stakingBalance.toString() });
    return stakingBalance.toString();
  };


  pbal = async (upcId) => {
    const web3 = window.web3
    const { accounts, contract } = this.state;

    var stakingBalance = await this.state.piggyNft.methods.upcBalance(upcId).call({ from: this.state.account });
    return stakingBalance;
  };


  pigin = async (upcId, amount) => {
    const web3 = window.web3
    const { accounts, contract } = this.state;

    var stakingBalance = await this.state.piggyNft.methods.pigIn(upcId).send({ from: this.state.account, value: amount});
    return stakingBalance;
  };

  pigout = async (upcId) => {
    const web3 = window.web3
    const { accounts, contract } = this.state;

    var stakingBalance = await this.state.piggyNft.methods.pigOut(upcId).send({ from: this.state.account});
    return stakingBalance;
  };



  mine= async () => {
    const web3 = window.web3
    const intelXData = this.state.intelX;

    const { accounts, contract } = this.state;

    var approval = await this.state.intelX.methods.mine().send({ from: this.state.account });
    this.setState({daiTokenBalance: approval.toString() });
    return approval.toString();
  };

  constructor(props) {
    super(props)
    //var marketInfo = this.refreshFeed()
    var marketInfo = ["Loading market data..."];
    this.state = {
      account: '0x0',
      upcGoldBank: {},
      daiTokenBalance: '0',
      stakingBalance: '0',
      loading: true,
      upc: '',
      isFlipped: false,
      intel: "",
      marketInfo: marketInfo,
      code: "",
    }

    var self = this;
    var scan;
    var tmpCode;



    let currentPath = props.location.pathname;
    if( currentPath.includes("intel") ) {
      this.state.intel = currentPath;
    }
    this.handleChange = this.handleChange.bind(this);
    this.refreshFeed= this.refreshFeed.bind(this);



    this.redeemUPCS= this.redeemUPCS.bind(this);
    this.approveUPCS= this.approveUPCS.bind(this);

    this.buyNftNav= this.buyNftNav.bind(this);
    this.mintNftNav= this.mintNftNav.bind(this);
    this.approveNav= this.approveNav.bind(this);

    this.approveUSDC= this.approveUSDC.bind(this);

    this.buyNft= this.buyNft.bind(this);
    this.mintNft= this.mintNft.bind(this);
    this.approve= this.approve.bind(this);
    this.getVrByUpcId= this.getVrByUpcId.bind(this);
    this.mine= this.mine.bind(this);
    this.updateUpc= this.updateUpc.bind(this);
    this.getMyBalance = this.getMyBalance.bind(this);
    this.getTVL = this.getTVL.bind(this);
    this.handleFlip = this.handleFlip.bind(this);
    this.swap= this.swap.bind(this);
    this.wn = this.wn.bind(this);
    this.wm = this.wm.bind(this);
    this.wa = this.wa.bind(this);
    this.getMyNfts= this.getMyNfts.bind(this);
    this.setVr= this.setVr.bind(this);
    this.setWt= this.setWt.bind(this);
    this.setIpfs= this.setIpfs.bind(this);
    this.upcInfo= this.upcInfo.bind(this);
    this.nftInfo= this.nftInfo.bind(this);
    this.latestTokenId= this.latestTokenId.bind(this);
    this.upcInfoNav= this.upcInfoNav.bind(this);
    this.nftInfoNav= this.nftInfoNav.bind(this);
    this.latestTokenIdNav= this.latestTokenIdNav.bind(this);

    this.getStableBalance= this.getStableBalance.bind(this);


    this.pbal= this.pbal.bind(this);
    this.pigin = this.pigin.bind(this);
    this.pigout = this.pigout.bind(this);
    this.setMarketPrice= this.setMarketPrice.bind(this);
    this.sendToMarket= this.sendToMarket.bind(this);
    this.buyFromMarket= this.buyFromMarket.bind(this);
    this.collectFromMarket= this.collectFromMarket.bind(this);
    this.getSaleInfo= this.getSaleInfo.bind(this);
    this.getWalkieTalkie= this.getWalkieTalkie.bind(this);

    this.setUpcMarket = this.setUpcMarket.bind(this);
    this.setHRNMarket = this.setHRNMarket.bind(this);
  }

  render() {
    const web3 = window.web3

    
    var contractBalance = this.state.stakingBalance;

    let deposit
    let withdraw 
    let leases
    let evictions
    var loadAnim 

    //this.latestTokenId();
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
      
      var tmpCode = this.state.intel;
      tmpCode = tmpCode.substring(7);
      var scan = JSON.parse(atob(tmpCode));
      this.state.code = scan.code;
      var tmpCode = scan.code;
      var lastChar = tmpCode.slice(-1);
      var upcChannel = "00000000000" + lastChar;


      deposit = 
        <div  style={{ background:"white"}} >
        <Intel
	address={this.state.account}
        handleChange={this.handleChange}
        updateUpc={this.updateUpc}
	getMyBalance={this.getMyBalance}
	intel={this.state.intel}

	approveNav={this.approveNav}
	redeemUPCS={this.redeemUPCS}
	approveUPCS={this.approveUPCS}

	buyNftNav={this.buyNftNav}
	mintNftNav={this.mintNftNav}
	approveUSDC={this.approveUSDC}
	getStableBalance={this.getStableBalance}

	approve={this.approve}
	buyNft={this.buyNft}
	mintNft={this.mintNft}
	getVrByUpcId={this.getVrByUpcId}
	mine={this.mine}
	swap={this.swap}
	wn={this.wn}
	wm={this.wm}
	wa={this.wa}
	pbal={this.pbal}
	pigin={this.pigin}
	pigout={this.pigout}
	setMarketPrice={this.setMarketPrice}
	sendToMarket={this.sendToMarket}
	buyFromMarket={this.buyFromMarket}
	collectFromMarket={this.collectFromMarket}
	getMyNfts={this.getMyNfts}
	getSaleInfo={this.getSaleInfo}
	setVr={this.setVr}
	setWt={this.setWt}
	setIpfs={this.setIpfs}
	refreshFeed={this.refreshFeed}

	getWalkieTalkie={this.getWalkieTalkie}

	upcInfoNav={this.upcInfoNav}
	nftInfoNav={this.nftInfoNav}
	latestTokenIdNav={this.latestTokenIdNav}


	setHRNMarket={this.setHRNMarket}
	setUpcMarket={this.setUpcMarket}


	upcInfo={this.upcInfo}
	nftInfo={this.nftInfo}
	latestTokenId={this.latestTokenId}
      />
      <UpcStatsTicker latestTokenId={this.latestTokenId} getSaleInfo={this.getSaleInfo} marketInfo={this.state.marketInfo} style={{"position":"absolute","bottom":"0", background:"black"}} />
      <TickerTape colorTheme="dark"></TickerTape>

      <b style={{color:"black"}}> Latest News from Channel [[{upcChannel}]] </b>
      <UPCBR_Channel channel={upcChannel} />
      </div>
		    console.log(this.state);
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
      <div style={{background: "#7e7e5e", height: '100vh', width: '100vw', border:'none'}} >
			       {deposit}
      </div>
    );
  }
}

export default App;
