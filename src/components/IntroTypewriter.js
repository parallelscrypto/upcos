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

     var channel = "Black Is Beautiful Channel";
     switch (channelNum) {
       case "0":
         channel = "Loading Channel 0: Black Is Beautiful!";
         break;
       case "1":
         channel = "Loading Channel 1: Black Travel";
         break;
       case "2":
          channel = "Loading Channel 2: Homeless Support";
         break;
       case "3":
         channel = "Loading Channel 3: Black Music/Comedy/Entertainment";
         break;
       case "4":
         channel = "Loading Channel 4: Fitness and Sports";
         break;
       case "5":
         channel = "Loading Channel 5: Black Alt Community";
         break;
       case "6":
         channel = "Loading Channel 6: Black Spirituality";
         break;
       case "7":
         channel = "Loading Channel 7: Black Life Education";
         break;
       case "8":
         channel = "Loading Channel 8: Black Business Connect";
         break;
       case "9":
         channel = "Loading Channel 9: Black Health";
         break;
     }

     //console.log("channel is " + channel);
     this.setState({channel: channel});
     return channel;
  }


  render() {
    var message = ["<UPC Band Radio>" , this.state.channel , "[[" + this.state.code + "]]" , "</UPC Band Radio>"]
    return (
      <div 
	 style={{background: this.state.customColor, textAlign:"center", color:"white", transform:'translateY(50vh)' , transform:'translateY(50vw)'}}
      >
         <TypeWriterEffect
            style={{transform:'translateY(150vw)', fontFamily:'system-ui'}}
            startDelay={100}
            multiTextDelay={1500}
            cursorColor="white"
            multiText={message}
            typeSpeed={10}
         />
	<Barcode value={this.state.code} format="EAN13" />
	<p><b style={{color:"white", fontSize:"7px"}}>&#60;3 619</b></p>
      </div>
    )
  }
}
