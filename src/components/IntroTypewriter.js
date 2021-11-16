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

  }

  componentDidMount() {

    var scan;
    var tmpCode;
    try {
      tmpCode = this.state.data;
       tmpCode = tmpCode.substring(7);
       scan = JSON.parse(atob(tmpCode));
       console.log(scan.code);
       this.setState({code: scan.code});
    }
    catch(e){
	    console.log("errerr" );
    }

  }

  render() {

    var message = ["<loading>" , "TERMINAL", "[[" + this.state.code + "]]" , "</loading>"]
    return (
      <div 
	 style={{textAlign:"center", color:"hotpink", transform:'translateY(50vh)' , transform:'translateY(50vw)'}}
      >
         <TypeWriterEffect
            style={{transform:'translateY(150vw)', fontFamily:'system-ui'}}
            startDelay={500}
            multiTextDelay={500}
            cursorColor="white"
            multiText={message}
            typeSpeed={50}
         />
	<Barcode value={this.state.code} format="EAN13" />
      </div>
    )
  }
}
