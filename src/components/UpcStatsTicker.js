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



export default class MyTicker extends Component {
  state = {
    move: true,
    image: [],
    random: 0,
    isFlipped: false,
    feedItems: [],
    cgApi: ''
  }
  onClick = () => {
    this.setState(prevState => ({
      move: !prevState.move
    }))
  }

  flipCard = () => {
    this.setState({isFlipped: !this.state.isFlipped});
  }


 refreshFeed = async () => {
 var latest
 var feedItems = []; 
let self = this;
 let bal = this.props.latestTokenId();
     bal.then((value) => {
        console.log("LATEST IS");
        console.log(value);
        latest = Math.round(value);
        var i = 0;

        for(i = 0; i < latest; i++) {

           let info = self.props.getSaleInfo(i)
            .then((data) => {
                 if(data['tokenId'] > 0) {
console.log(data);
                    var data = "token_id: " + data['tokenId'] + " price: " + data['price'] + " ; "
                    feedItems.push(data);
                    self.setState({marketInfo:feedItems});
                    self.setState({random:434});
                 }

           });

         }
         return feedItems;
         //this.setState({marketInfo:feedItems});
        // expected output: "Success!"
     }); 
     return ['still loading...'];
  }

  componentWillMount(){
    //var localFeed = ["loaded"];
    //var localFeed = this.refreshFeed()
    //if(localFeed.length < 1 ) {
    //   localFeed = ["Still loading data..."];
    //}
    //this.setState({marketInfo:localFeed});
    return this.refreshFeed()
  }



  constructor(props) {
    super(props)
    this.state = {
       marketInfo: ['still loading market data']
    }
    //var localFeed = this.refreshFeed()
  }

  render() {
    return (
      <div>

        <Ticker
          direction="toRight"
          offset="100%"
          speed={0.5}
          move={this.state.move}
        >
          {(index) => (
            <b mktInfo={this.state.random} style={{color:"orange"}}>{this.state.marketInfo}</b>
          )}
        </Ticker>
	    
      </div >
    )
  }
}
