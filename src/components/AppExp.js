import React, { Component } from 'react'
import Iframe from 'react-iframe'
import Popit from '../etc/rawmaterial/Popit.json'
import NostRadioToken from '../etc/rawmaterial/Flip.json'
import RawMaterial from '../etc/rawmaterial/RawMaterial.json'
import { ethers } from 'ethers'
//import Navbar from './Navbar'
import CommentSection from './CommentSection'
import StaticCarouselExp from './StaticCarouselExp'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './App.css'
import 'react-tabs/style/react-tabs.css';
import { TickerTape } from "react-ts-tradingview-widgets";
var sha256 = require('js-sha256');

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
      intelX: null,
      popitData: null,
      provider: null
    }

    this.scan = null;
    this.tmpCode = null;

    this.loadWeb3 = this.loadWeb3.bind(this);
    this.loadBlockchainData = this.loadBlockchainData.bind(this);
    this.popitPush = this.popitPush.bind(this);
    this.upcInfo= this.upcInfo.bind(this);
    this.nftInfo= this.nftInfo.bind(this);
    this.getMyNfts= this.getMyNfts.bind(this);
    this.latestTokenId= this.latestTokenId.bind(this);
    this.popitUpdate = this.popitUpdate.bind(this);
    this.popitPullPPL = this.popitPullPPL.bind(this);
    this.popitPullUpc = this.popitPullUpc.bind(this);
    this.popitPullHash = this.popitPullHash.bind(this);
    this.popitPullUniversal= this.popitPullUniversal.bind(this);
    this.approvePPL= this.approvePPL.bind(this);
    this.getMyAddress= this.getMyAddress.bind(this);
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    try {
      let provider;
      
      if (window.ethereum) {
        // CORRECT: Ethers.js v5 syntax
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else if (window.web3 && window.web3.currentProvider) {
        provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
      } else {
        provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
      }
      
      this.setState({ provider: provider });
      return provider;
    } catch (error) {
      console.error("Error loading Web3:", error);
      const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
      this.setState({ provider: provider });
      return provider;
    }
  }

  async loadBlockchainData() {
    try {
      // Ensure provider is loaded first
      let provider = this.state.provider;
      if (!provider) {
        provider = await this.loadWeb3();
      }

      const signer = provider.getSigner();
      const account = await signer.getAddress();
      this.setState({ account: account });

      const network = await provider.getNetwork();
      const networkId = Number(network.chainId);

      // Load Popit contract
      const popitData = Popit.networks[networkId];
      if (popitData) {
        const popitAddress = popitData.address;
        const popitNftContract = new ethers.Contract(popitAddress, Popit.abi, signer);
        this.setState({ 
          popitNft: popitNftContract,
          address: popitAddress 
        });
      }

      // Load RawMaterial contract
      const upcData = RawMaterial.networks[networkId];
      if (upcData) {
        const upcAddress = upcData.address;
        const upcNftContract = new ethers.Contract(upcAddress, RawMaterial.abi, signer);
        this.setState({ 
          upcNft: upcNftContract,
          upcAddress: upcAddress 
        });
      }

      // Load NostRadioToken contract
      const intelXData = NostRadioToken.networks[networkId];
      if (intelXData) {
        const intelXContract = new ethers.Contract(intelXData.address, NostRadioToken.abi, signer);
        this.setState({ intelX: intelXContract });
      }

      this.setState({ loading: false });
      return this.state.popitNft;

    } catch (error) {
      console.error("Error loading blockchain data:", error);
      this.setState({ loading: false });
      return null;
    }
  }

  async popitPush(link, upc, humanReadableName) {
    try {
      const loadedFull = await this.loadBlockchainData();
      if (!loadedFull) throw new Error("Contract not loaded");

      const tx = await loadedFull.insertLink(link, upc, humanReadableName);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error in popitPush:", error);
      throw error;
    }
  };

  latestRawId = async (upcId) => {
    try {
      if (!this.state.upcNft) {
        await this.loadBlockchainData();
      }
      return await this.state.upcNft.latestTokenId();
    } catch (error) {
      console.error("Error in latestRawId:", error);
      throw error;
    }
  };

  getMyNfts = async () => {
    try {
      if (!this.state.upcNft) {
        await this.loadBlockchainData();
      }
      return await this.state.upcNft.getMyNfts();
    } catch (error) {
      console.error("Error in getMyNfts:", error);
      throw error;
    }
  };

  nftInfo = async (nftId) => {
    try {
      if (!this.state.upcNft) {
        await this.loadBlockchainData();
      }
      return await this.state.upcNft.nftInfo(nftId);
    } catch (error) {
      console.error("Error in nftInfo:", error);
      throw error;
    }
  };

  upcInfo = async (upcId) => {
    try {
      if (!this.state.upcNft) {
        await this.loadBlockchainData();
      }
      return await this.state.upcNft.upcInfo(upcId);
    } catch (error) {
      console.error("Error in upcInfo:", error);
      throw error;
    }
  };

  async popitUpdate(upcId, link) {
    try {
      const loadedFull = await this.loadBlockchainData();
      if (!loadedFull) throw new Error("Contract not loaded");

      const tx = await loadedFull.updateLink(upcId, link);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error in popitUpdate:", error);
      throw error;
    }
  };

  async latestTokenId() { 
    try {
      const loadedFull = await this.loadBlockchainData();
      if (!loadedFull) throw new Error("Contract not loaded");
      
      const result = await loadedFull.latestTokenId();
      return result.toString();
    } catch (error) {
      console.error("Error in latestTokenId:", error);
      throw error;
    }
  };

  async getMyAddress() { 
    if (!this.state.account || this.state.account === '0x0') {
      await this.loadBlockchainData();
    }
    return this.state.account;
  };

  async popitPullUniversal(start, end) {
    try {
      const loadedFull = await this.loadBlockchainData();
      if (!loadedFull) throw new Error("Contract not loaded");
      
      const result = await loadedFull.getUniversalData(start, end);
      return result;
    } catch (error) {
      console.error("Error in popitPullUniversal:", error);
      throw error;
    }
  };

  async approvePPL(numTokens) {
    try {
      // Ensure everything is loaded first
      await this.loadBlockchainData();
      
      if (!this.state.intelX) {
        throw new Error("IntelX contract not loaded");
      }

      if (!this.state.popitNft) {
        throw new Error("Popit contract not loaded");
      }

      const popitAddress = await this.state.popitNft.getAddress();
      
      if (!numTokens) {
        numTokens = "100000000000000000";
      }

      const tx = await this.state.intelX.approve(popitAddress, numTokens);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error in approvePPL:", error);
      throw error;
    }
  };

  async popitPullPPL(humanReadableName) {
    try {
      const loadedFull = await this.loadBlockchainData();
      if (!loadedFull) throw new Error("Contract not loaded");
      
      const result = await loadedFull.getPopByGlobalName(humanReadableName);
      return result.toString();
    } catch (error) {
      console.error("Error in popitPullPPL:", error);
      throw error;
    }
  };

  async popitPullUpc(upc) {
    try {
      const loadedFull = await this.loadBlockchainData();
      if (!loadedFull) throw new Error("Contract not loaded");
      
      const result = await loadedFull.getPopByUpc(upc);
      return result;
    } catch (error) {
      console.error("Error in popitPullUpc:", error);
      throw error;
    }
  };

  async popitPullHash(hash) {
    try {
      const loadedFull = await this.loadBlockchainData();
      if (!loadedFull) throw new Error("Contract not loaded");
      
      const result = await loadedFull.getPopByInstance(hash);
      return result;
    } catch (error) {
      console.error("Error in popitPullHash:", error);
      throw error;
    }
  };

  render() {
    var currentUrl = window.location.href;
    const exportIndex = currentUrl.indexOf('/export');
    const firstSlashIndex = currentUrl.indexOf('/', exportIndex + 1);

    const encodedSubstring = currentUrl.substring(firstSlashIndex + 1);
    const myShow = atob(encodedSubstring);

    const dataObject = JSON.parse(myShow);

    const showValue = dataObject.show;
    const codeValue = dataObject.code;
    const manifestValue = dataObject.manifest;

    var manHash  = sha256(manifestValue)

    const msg = dataObject.msg;
    const missionUrl = dataObject.missionUrl;
    const configUrl = dataObject.configUrl;

    return (
      <div style={{ background: "#000000", height: '100vh', width: '100vw', border: 'none' }}>
        <div>
          <StaticCarouselExp getMyNfts={this.getMyNfts} nftInfo={this.nftInfo} latestRawId={this.latestRawId} upcInfo={this.upcInfo} approvePPL={this.approvePPL} loadBlockchainData={this.loadBlockchainData} latestTokenId={this.latestTokenId} popitPullUniversal={this.popitPullUniversal} popitUpdate={this.popitUpdate} popitPush={this.popitPush} popitPullUpc={this.popitPullUpc} popitPullPPL={this.popitPullPPL} popitPullHash={this.popitPullHash} configUrl={configUrl} missionUrl={missionUrl} msg={msg} manifest={manifestValue} code={codeValue} show={showValue} getMyAddress={this.getMyAddress} />
        </div>
      </div>
    );
  }
}

export default AppExp;
