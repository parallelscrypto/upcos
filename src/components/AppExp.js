import React, { Component } from 'react'
import Iframe from 'react-iframe'


//import Navbar from './Navbar'
import CommentSection from './CommentSection'
import StaticCarousel from './StaticCarousel'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './App.css'
import 'react-tabs/style/react-tabs.css';
import { TickerTape } from "react-ts-tradingview-widgets";



class AppExp extends Component {

  async componentWillMount() {
    //await this.loadWeb3()
    //await this.loadBlockchainData()
  }


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

  }

  render() {

    var currentUrl = window.location.href;
    const exportIndex = currentUrl.indexOf('/export');
    const firstSlashIndex = currentUrl.indexOf('/', exportIndex + 1);
    
    // Extract the substring after the first slash after 'export'
    const encodedSubstring = currentUrl.substring(firstSlashIndex + 1);

    const myShow = atob(encodedSubstring);


    // Parse the string as JSON
    const dataObject = JSON.parse(myShow);
    
    // Extract the value of the 'show' variable
    const showValue = dataObject.show;



    return (
      <div style={{background: "#7e7e5e", height: '100vh', width: '100vw', border:'none'}} >
         <div>
            <StaticCarousel show={showValue} />
            <CommentSection upc={this.state.code} />
         </div>
      </div>
    );
  }
}

export default AppExp;
