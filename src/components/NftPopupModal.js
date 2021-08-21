import React, { Component, useState, useEffect } from 'react'
import uuid from 'react-uuid';
import ScratchCard from 'react-scratchcard';
import ReactCardFlip from 'react-card-flip';
import Ticker from 'react-ticker'
import Image1 from './extra/img-1.jpg'
import Image2 from './extra/img-2.jpg'
import Image3 from './extra/img-3.jpg'
import Image4 from './extra/img-4.jpg'
import Modal from 'react-modal';
import QRCode from "react-qr-code"

export default class NftPopupModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hash:            props.hash,
      qIsOpen:    props.qIsOpen
    }
  }


  render() {
    var srcImg = 'https://avatars.dicebear.com/api/male/' + this.state.hash + ".svg";
    return (
      <div>
          <QRCode size={128} value={this.state.hash} onClick={() => { this.setState({qIsOpen: true})}}/>
          <Modal
            isOpen={this.state.qIsOpen}
            contentLabel="Example Modal"
          >    
             <img src={srcImg} height="200" width="200"/>
             <p>{this.state.hash}</p>
             <button onClick={() => {this.setState({qIsOpen: false}) }}>close</button>
          </Modal>
      </div>
    )
  }
}
