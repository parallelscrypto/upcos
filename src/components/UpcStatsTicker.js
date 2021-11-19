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
		console.log(i);
 
                 //only put upcId in ticker if the user has manually set 
                 var upcId = "";
                 if(data['upcId'] != '000000000000') {
                     upcId = ", upc_id:" + data['upcId'] ;
                 }
 
                 if(data['tokenId'] > 0) {

	           var price = window.web3.utils.fromWei(data['price'], "ether") + " MATIC ";
	           var fee= window.web3.utils.fromWei(data['fee'], "ether") + " MATIC ";




	           var seller = data['seller'];
		   seller = seller.substring(0,14) + "...";


	           var contractAddress = data['nftContract'];
		   contractAddress = contractAddress.substring(0,14) + "...";


var data = " {[token_id: " + data['tokenId'] + ", price: " + price + ", in_progress: " + data['inProgress']  + ", listing_title: " + data['humanReadableName']  + upcId + ", seller: " + seller  + ", contract_address: " + contractAddress  + ", fee: " + fee + ";]} # "
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
     return ['[[still loading]]'];
  }



  componentDidMount(){
    return this.refreshFeed()
  }


  constructor(props) {
    super(props)
    this.state = {
       marketInfo: [' - [[downloading ticker data...]] - ']
    }
    //var localFeed = this.refreshFeed()
  }

  render() {
    return (
      <div>

        <Ticker
          direction="toRight"
          offset="100%"
          speed={2.5}
          move={this.state.move}
        >
          {(index) => (
            <b mktInfo={this.state.random} style={{whiteSpace:"nowrap",color:"orange"}}>{this.state.marketInfo}</b>
          )}
        </Ticker>
	    
      </div >
    )
  }
}
