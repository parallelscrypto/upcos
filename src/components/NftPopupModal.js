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
import NftPopupQr from "./NftPopupQr";
import ReactPlayer from 'react-player'


export default class NftPopupModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hash:       props.hash,
      code:       props.code,
      video:      props.video,
      qIsOpen:    props.qIsOpen
    }
  }


  render() {
    var srcImg = 'https://avatars.dicebear.com/api/human/' + this.state.hash + ".svg";
    var prizeJson = {
	    hash: this.state.hash,
	    code: this.state.code
    };
    var prizeBase64 ="https://ipfs.io/ipfs/QmRX4SzbGLpFtejZd9aW2MQc3rKTTwu9nM12beBkNSyqHv/#/intel/" + btoa(JSON.stringify(prizeJson));
//    var prizeBase64 = "https://gateway.pinata.cloud/ipfs/Qmeet7SJ2mvrp6PTJMzbVCP6y2WFWWXY2iKA1UUGg8ptrA/#/intel/eyJjb2RlIjoiMDEyNTg3NzA0NDAwIn0=" + btoa(JSON.stringify(prizeJson));

    return (
      <div>
          <QRCode size={128} value={prizeBase64} onClick={() => { this.setState({qIsOpen: true})}}/>
          <Modal
	    style={{inset:"0px"}}
            isOpen={this.state.qIsOpen}
            contentLabel={this.state.hash}
          >    
	     <ReactPlayer
	         width="100vw"
	         url={this.state.video}

	    />
	    <b>vid is {this.state.video} </b>
	     <NftPopupQr code={this.state.code} hash={uuid()}  />
             <button onClick={() => {this.setState({qIsOpen: false}) }}>close</button>
          </Modal>
      </div>
    )
  }
}
