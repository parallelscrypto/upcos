import React, { Component } from 'react'
import Iframe from 'react-iframe'
import Popit from '../etc/rawmaterial/Popit.json'
import Web3 from 'web3'
//import Navbar from './Navbar'
import CommentSection from './CommentSection'
import StaticCarouselExp from './StaticCarouselExp'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './App.css'
import 'react-tabs/style/react-tabs.css';
import { TickerTape } from "react-ts-tradingview-widgets";

class AppExp extends Component {
  constructor(props) {
    super(props)
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
      popitNft: null,
      popitData: null
    }

    this.scan = null;
    this.tmpCode = null;

    this.loadWeb3 = this.loadWeb3.bind(this);
    this.loadBlockchainData = this.loadBlockchainData.bind(this);
    this.popitPush = this.popitPush.bind(this);
  }

  async componentWillMount() {
    //await this.loadWeb3()
    //await this.loadBlockchainData()
  }

  async loadWeb3() {
    // Load web3
  }

  async loadBlockchainData() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.web3 = new Web3(window.web3.currentProvider)
      //window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }

    const web3 = window.web3

    console.log("==============POPPPPPPPPP=================");
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

  
    console.log(accounts);
    console.log("==============44444444444=================");
    const networkId = await web3.eth.net.getId()
    const popitData = Popit.networks[networkId]

    const popitAddress = popitData.address;
    const popitNftContract = await new web3.eth.Contract(Popit.abi, popitAddress);
    this.setState({ popitNft: popitNftContract });
    return [popitNftContract,accounts[0]];
  }

  async popitPush(link, hash, owner, upc, humanReadableName) {
    const pushRes = await this.state.popitNft.methods.insertLink(link, hash, owner, upc, humanReadableName).send({ from: this.state.account });
    return pushRes.toString();
  };

  async popitPull(humanReadableName) {
    const loadedFull = await this.loadBlockchainData();
    const loaded  = loadedFull[0];
    const address = loadedFull[1];
console.log("++++++++++++++LOAdded");
console.log(loaded);
    const pushRes = await loaded.methods.getPopByGlobalName(humanReadableName).call({ from: address });
    return pushRes.toString();
  };

  render() {
    var currentUrl = window.location.href;
    const exportIndex = currentUrl.indexOf('/export');
    const firstSlashIndex = currentUrl.indexOf('/', exportIndex + 1);

    // Extract the substring after the first slash after 'export'
    const encodedSubstring = currentUrl.substring(firstSlashIndex + 1);
    const myShow = atob(encodedSubstring);

    // Parse the string as JSON
    const dataObject = JSON.parse(myShow);

    console.log("data obj is ");
    console.log(dataObject);

    // Extract the value of the 'show' variable
    const showValue = dataObject.show;
    const codeValue = dataObject.code;
    const manifestValue = dataObject.manifest;
    const msg = dataObject.msg;
    const missionUrl = dataObject.missionUrl;

    return (
      <div style={{ background: "#7e7e5e", height: '100vh', width: '100vw', border: 'none' }}>
        <div>
          <StaticCarouselExp loadBlockchainData={this.loadBlockchainData} popitPush={this.popitPush} popitPull={this.popitPull} missionUrl={missionUrl} msg={msg} manifest={manifestValue} code={codeValue} show={showValue} />
          <CommentSection upc={this.state.code} />
        </div>
      </div>
    );
  }
}

export default AppExp;
