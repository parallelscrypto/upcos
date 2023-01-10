import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
//import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import NostRadioStation from '../etc/nostradio-10/NostRadioStation.json'
import ReactCardFlip from 'react-card-flip';
import web3 from 'web3'


import { ethers } from "ethers";

export default function UPCBR_Channel(props) {
  const [lvids, setLvids] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchChannel = async (channel) => {

    const networkId = await web3.eth.net.getId()
    const upcNFTData = NostRadioStation.networks[networkId]
    let contractAddress = upcNFTData.address;



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
	 console.log(props);
         const currentChannel = await contract.upcInfo(channel);

         var channelVidsCommas =  currentChannel.ipfs;
         var channelArray      =  channelVidsCommas.split(',');
         var mediaLinks = new Array();
         for(let i = 0; i < channelArray.length; i++) {
            let mediaInfo = await contract.nftInfo(channelArray[i]);
            mediaLinks.push(mediaInfo.vr)
         }
         //var svids = props.setVids;
	 setLvids(mediaLinks);
	 //svids(mediaLinks);
         //return mediaLinks;
    }
  };

  useEffect(() => {
    if(props.channel) {
       fetchChannel(props.channel);
    }
    connectWallet();
  }, []);

        //console.log(lvids);
	var finalOutput = Array();
	for(let v=0; v<lvids.length; v++) {
	    var localOutput = 
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
	         <div>
	                 <ReactPlayer
	                  width="100vw"
	                  url={lvids[v]}
	                  style={{padding:"10px", borderBottom:"20px dashed white"}}
	               />
	               <button onClick={(e) => { setIsFlipped(true)}} >View Media Stats</button>
	         </div>
                 <div>
	             <h1>flip side</h1>
	         </div>
            </ReactCardFlip>
	    finalOutput.push(localOutput)
	    

//	   finalOutput += "<iframe src='" + lvids[v] + "' />";
	}
	if(finalOutput) {
return ( finalOutput)
	}
  return (
    <h1>Loading videos for channel {props.channel}</h1>
  )
}

