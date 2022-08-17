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
import { TikTok } from 'react-tiktok';



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
    var player;
    var unownedVr = this.state.video;

    if(unownedVr && unownedVr.includes('tiktok')) {
       player = <TikTok url={unownedVr} />
    }
    //backwards compat, use iframe for shortened codes, or allow them to paste the full url.  full url
    //pasting does not get the player with controls (this iframe player below)
    else if(unownedVr && unownedVr.length == 11) {
       const youtubeID = unownedVr
       player =
       <iframe className='video'
               style={{minHeight:"100vh",width:"100vw"}}
               title='Youtube player'
               sandbox='allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
               src={`https://youtube.com/embed/${youtubeID}?autoplay=0`}>
       </iframe>
    }
    else {
       player = <ReactPlayer
                    width="100vw"
                    url={unownedVr}
                />

    }




    return (
      <div>
          <QRCode size={128} value={prizeBase64} onClick={() => { this.setState({qIsOpen: true})}}/>
          <Modal
            id="POPUP"
	    style={{fontColor:"red"}}
            isOpen={this.state.qIsOpen}
            contentLabel={this.state.hash}
          >    
             {player}
	     <b>Watching: {this.state.video} </b>
	     <NftPopupQr code={this.state.code} hash={uuid()}  />
             <button onClick={() => {this.setState({qIsOpen: false}) }}>close</button>
          </Modal>
      </div>
    )
  }
}
