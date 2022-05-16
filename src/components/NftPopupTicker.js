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
import NftPopupQr from './NftPopupQr';

export default class MyTicker extends Component {
  state = {
    code: '',
    move: true
  }
  onClick = () => {
    this.setState(prevState => ({
      move: !prevState.move
    }))
  }

  flipCard = () => {
    this.setState({isFlipped: !this.state.isFlipped});
  }



  constructor(props) {
    super(props)
    this.state = {
      isFlipped: false,
      code: props.code
    }
  }

  render() {
    return (
      <div>
        <Ticker
          speed={1}
          move={this.state.move}
        >
          {({ index }) => index === 0
            ? <p style={{ width: '25vw' }}></p>
            : 
         <div style={{"marginRight":"10px",borderRight:"dashed", borderLeft:"dashed", borderWidth:"7px",borderColor:"white"}}>
	    <NftPopupQr code={this.state.code} hash={uuid()}  />
         </div>
          }
        </Ticker>
      </div >
    )
  }
}
