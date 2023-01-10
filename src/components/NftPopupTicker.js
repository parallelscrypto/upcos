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
import NostRadioStation from '../etc/nostradio-10/NostRadioStation.json'
import web3 from 'web3'


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


    const networkId = await web3.eth.net.getId()
    const upcNFTData = NostRadioStation.networks[networkId]
    let contractAddress = upcNFTData.address;

    var self = this;
    const { ethereum } = window;



    if (!ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      NostRadioStation.abi,
      provider
    );
    if(channel.length == 12 || channel.length == 13) {
         //var lastChar = String(channel).subsr(-1);
         var currentChannel = await contract.upcInfo(channel);
         var potentialCsv = currentChannel.ipfs
	 if(!potentialCsv.includes(',')) {
            var defaultChannel = "00000000000";
            defaultChannel += channel.substr(-1); 
	    currentChannel = await contract.upcInfo(defaultChannel);
	 }
         var channelVidsCommas =  currentChannel.ipfs;
         var channelArray      =  channelVidsCommas.split(',');
         var mediaLinks = new Array();
         for(let i = 0; i < channelArray.length; i++) {
            let mediaInfo = await contract.nftInfo(channelArray[i]);
            let popupQr = <div class="hitem"><NftPopupQr code={this.state.code} hash={uuid()}  video={mediaInfo.vr} value={mediaInfo.upcHash} /></div>
            mediaLinks.push(popupQr)
         }

         self.setState({videos:mediaLinks});          
         //return mediaLinks;
    }
  };

  render() {


    var myVids = this.state.videos;

    return (
<>




<div class="hwrap"><div class="hmove">
	    {this.state.videos}
</div></div>


</>

    )
  }
}
