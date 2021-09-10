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
import NftPopupModal from "./NftPopupModal";


export default class NftPopupQr extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isFlipped:   false,
      hash:        props.hash,
      code:        props.code,
      modalIsOpen: false
    }
    this.onClick = this.onClick.bind(this);

  }

  onClick = () => {
	  this.setState({modalIsOpen: true});
  }


  render() {
    return (
	    <div>
	       <NftPopupModal code={this.state.code} hash={this.state.hash} qIsOpen={this.state.modalIsOpen}/>
	    </div>
    )
  }
}
