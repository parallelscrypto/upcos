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
import { ethers } from "ethers";
import MLS from '../abis/MalcolmsLittleSecret.json'


export default class MyTicker extends Component {
  state = {
    code: '',
    move: true,
    videos: []
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

    this.fetchChannel= this.fetchChannel.bind(this);

  }


  componentDidMount = async () => {
     var self = this;
     this.fetchChannel(this.state.code);
  }


  fetchChannel = async (channel) => {

    var self = this;
    let contractAddress = "0x2DA2c8eD74cd16F0c24CFFFA257455EAa5Bd93b7";
    const { ethereum } = window;



    if (!ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      MLS.abi,
      provider
    );
    if(channel.length == 12 || channel.length == 13) {
         //var lastChar = String(channel).subsr(-1);
         var currentChannel = await contract.upcInfo(channel);
	 console.log("first ATTEMPT");
         var potentialCsv = currentChannel.ipfs
	 if(!potentialCsv.includes(',')) {
            var defaultChannel = "00000000000";
            defaultChannel += channel.substr(-1); 
	    currentChannel = await contract.upcInfo(defaultChannel);
	 console.log("SECOND ATTEMPT");
	 console.log(currentChannel);
	 }
	 console.log(currentChannel.ipfs);
         var channelVidsCommas =  currentChannel.ipfs;
         var channelArray      =  channelVidsCommas.split(',');
         var mediaLinks = new Array();
         for(let i = 0; i < channelArray.length; i++) {
            let mediaInfo = await contract.nftInfo(channelArray[i]);

	    console.log("############################media links " + mediaInfo.vr);
            let popupQr = <div class="hitem"><NftPopupQr code={this.state.code} hash={uuid()}  video={mediaInfo.vr} value={mediaInfo.upcHash} /></div>
            mediaLinks.push(popupQr)
         }

         self.setState({videos:mediaLinks});          
         //return mediaLinks;
    }
  };

  render() {


    var myVids = this.state.videos;
console.log(myVids);

    return (
<>




<div class="hwrap"><div class="hmove">
	    {this.state.videos}
</div></div>


</>

    )
  }
}
