import React, { Component, useState, useEffect } from 'react'
import uuid from 'react-uuid';
import ScratchCard from 'react-scratchcard';
import ReactCardFlip from 'react-card-flip';
import Ticker from 'react-ticker'
import Image1 from './extra/img-1.jpg'
import Image2 from './extra/img-2.jpg'
import Image3 from './extra/img-3.jpg'
import Image4 from './extra/img-4.jpg'
import QRCode from "react-qr-code";
import Modal from "react-animated-modal";
import Zoom from 'react-reveal/Zoom';
import Flip from 'react-reveal/Flip';

//import Typewriter from 'typewriter-effect';
import TypeWriterEffect from "./react-typewriter-effect/src/Typewriter";
var Barcode = require('react-barcode');


export default class IntroTypewriter extends Component {
  state = {
    loadingMsg: ''
  }

  constructor(props) {
    super(props)
    this.state = {
      data: props.data
    }

    this.calculateChannel = this.calculateChannel.bind(this);

  }

  componentDidMount() {

    var scan;
    var tmpCode;
    try {
      tmpCode = this.state.data;
       tmpCode = tmpCode.substring(7);
       scan = JSON.parse(atob(tmpCode));
       this.setState({code: scan.code});
       var customColor = "#";
       customColor += scan.code.substring(0,6);
       customColor = "#000000";
       this.setState({customColor});


    this.calculateChannel(scan.code);

    }
    catch(e){
	    console.log("errerr" );
    }

  }

  calculateChannel(upc) {
     var channelNum = upc.substr(-1);

     var channel = "Melaninated";
     switch (channelNum) {
       case "0":
         channel = "Loading Channel 0";
         break;
       case "1":
         channel = "Loading Channel 1";
         break;
       case "2":
         channel = "Loading Channel 2";
         break;
       case "3":
         channel = "Loading Channel 3";
         break;
       case "4":
         channel = "Loading Channel 4";
         break;
       case "5":
         channel = "Loading Channel 5";
         break;
       case "6":
         channel = "Loading Channel 6";
         break;
       case "7":
         channel = "Loading Channel 7";
         break;
       case "8":
         channel = "Loading Channel 8";
         break;
       case "9":
         channel = "Loading Channel 9";
         break;
     }

     //console.log("channel is " + channel);
     this.setState({channel: channel});
     return channel;
  }


  render() {

    var chan = this.state.code;
    var first11;
    var last1;
    if(chan) {
       first11 = chan.substr(0,11);
       last1   = chan.substr(chan.length-1,1);
    }


    var typewriter = 


             <Modal style={{"background":'black',"height":"50vh","alignItems":"normal", "display":"table-cell", "textAlign":"center"}} visible={'true'} closemodal={(e) => {this.setState({ showModalSplash: false }); }} type="lightSpeedIn" >
                <div style={{background:"black", verticalAlign:"middle", textAlign:"center" }}>
                  <div>
                    <Zoom left> <i  style={{color:"red"}}>loading nostradio-10</i></Zoom>
                    <br/>
                    <Zoom left> <b>Tuning into UPC#</b></Zoom>
                     <br/>

		     <Flip right> <Barcode value={this.state.code} format="UPC" /> </Flip>
		     
                     <br/>
                     <i  style={{color:"red"}}>[[{this.state.code}]]</i>
                     <b style={{color:"white"}}>powered by upcos </b>
                  </div>
                </div>
             </Modal>

    return (
	 typewriter
    )
  }
}
