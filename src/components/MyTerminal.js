import React, { Component } from 'react'
import { ethers } from "ethers";
import * as Tone from "tone";
import Terminal from 'react-console-emulator'
import IPFSTerminal from './IPFSTerminal'
import ScratchCard from './ScratchCard'
import IpfsUpload from './IpfsUpload'
import TrebleCleff from './TrebleCleff'
import StageCarousel from './StageCarousel'
import BassCleff from './BassCleff'
import PoemBot from './PoemBot'
import CommentSection from './CommentSection'
import go from './Mission'
//import ChannelCarousel from './ChannelCarousel'
import ChannelCarousel2 from './ChannelCarousel2'
import ScanWizard from './ScanWizard'
import Dex from './Dex'
import Modal from "react-animated-modal";
import ModalUrl from "./ModalUrl";
import Iframe from 'react-iframe';
import axios from "axios";
import 'react-dropdown/style.css';
import QRCode from "react-qr-code";
import Card from 'react-playing-card';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import ReactPlayer from 'react-player'
import ReactCardFlip from 'react-card-flip';
import { TikTok } from 'react-tiktok';
import NostRadioToken from '../abis/NostRadioToken.json'
import Draggable from 'react-draggable';


var Barcode = require('react-barcode');


var Barcode = require('react-barcode');
var sha256 = require('js-sha256');

var welcomeMsgDefault = "Welcome to the UPCVerse \n TheHomelessChannel Loaded \n *Mission: Build strong NFT based entertainment economy for the homeless` \n *Amaze the world with your unique gift! \n *Record a video or take a pic and upload it to a UPC and flip the UPC! \n *Keep ya head up! \n *Put your crown back on! \n *Former homeless helping homeless \n *Together in unity with humanity! \n *92111* \n Type <i style='color:hotpink'>`help`</i> to see available commands \n  <a href='upc://000000000011'>[[000000000011]]</a> Type <i style='color:hotpink'>`swap`</i> to get some Repatriate\n <a href='upc://000000000012'>[[000000000012]]</a> Type <i style='color:hotpink'>`i`</i> to check the [[intel]] encoded \n  <a href='upc://000000000013'>[[000000000013]]</a> Type <i style='color:hotpink'>`approve`</i> to approve 50 of your Repatriate to be spent. \n <a href='upc://000000000014'>[[000000000014]]</a> Type <i style='color:hotpink'>`ask`</i> to buy the UPC " + "\n <a href='upc://000000000015'>[[000000000015]]</a> Type <i style='color:hotpink'>`own`</i> to mint if successful with ask " + "\n  <a href='upc://000000000016'>[[000000000016]]</a> <i style='color:hotpink'>Type `flip` to sell renovated UPC unit " + " </i> " +  "\n Type <i style='color:hotpink'>`x`</i> view the UNIQUE NFT Creature for this UPC" + " \n Type <i style='color:hotpink'>`clear`</i> to clear screen";

//var tlds = ['.watch-this' ,'.hear-this' ,'.will-work' ,'.jokes' ,'.tutorial' ,'.mumia' ,'.profile' ,'.my-show' ,'.news' ,'.gif' ,'.BLACK-WALL-STREET' ,'.deliver' ,'.grind' ,'.11:11' ,'.prediction' ,'.dapp' ,'.txt' ,'.homeless' ,'.link' ,'.surprise' ,'.freestyle' ,'.poem' ,'.stretch' ,'.workout' ,'.recipe' ,'.moment-in-time' ,'.meme' ,'.upc', '.marriage', '.bowlgame','.character','.character-development','.skit','.ai','.wiki','.upcscript','.comment','.opposing-viewpoints','.meditate','.protest','.public-discussion','.king-piece','.queen-piece','.castle-piece','.knight-piece','.bishop-piece','.pawn-piece','.decentralized-email-list', '.sober-day', '.oneafrika', '.afrika', '.dance', '.micro-finance','.artwork','.monthly-nft-club','.cringe','.thank-you','.dunk','.nice-try-DEVIL','.ad','.channel','.barefoot','.backup','.dog-walk','.dog-lost','.promo-code','.dream-log','.coinbox']

var tlds = ['.watch-this' ,'.hear-this' ,'.will-work' ,'.jokes' ,'.tutorial' ,'.mumia' ,'.profile' ,'.my-show' ,'.news' ,'.gif' ,'.BLACK-WALL-STREET' ,'.deliver' ,'.grind' ,'.11:11' ,'.prediction' ,'.dapp' ,'.txt' ,'.homeless' ,'.link' ,'.surprise' ,'.freestyle' ,'.poem' ,'.stretch' ,'.workout' ,'.recipe' ,'.moment-in-time' ,'.meme' ,'.upc', '.marriage', '.bowlgame','.character','.character-development','.skit','.ai','.wiki','.upcscript','.comment','.opposing-viewpoints','.meditate','.protest','.public-discussion','.king-piece','.queen-piece','.castle-piece','.knight-piece','.bishop-piece','.pawn-piece','.decentralized-email-list', '.sober-day', '.mic', '.afrika', '.dance', '.micro-finance','.artwork','.monthly-nft-club','.cringe','.thank-you','.dunk','.nice-try-DEVIL','.ad','.channel','.barefoot','.backup','.dog-walk','.dog-lost','.promo-code','.dream-log','.sha256','.slideshow','.champion','.for-sale','.public-key','.ticket','.happy-birthday','.metal-detect','.open-room','.scrap-bot','.blog','.coinbox']



const commands = {
  echo: {
    description: '** Echo a passed string.',
    usage: 'echo <string>',
    fn: function () {
      return `${Array.from(arguments).join(' ')}`
    }
  }
}

export default class MyTerminal extends Component {
  
  constructor(props) {
    super(props)

    this.progressTerminal = React.createRef()

    const hero_unique_string = "this-is-repatriation-os";

    var upcHash  = sha256(props.account + hero_unique_string)

    var avatarType;

    switch(upcHash.substring(0,1)) {

	 case '0':
	   avatarType = "adventurer";
	   break;
	 case '1':
	   avatarType = "adventurer-neutral";
	   break;
	 case '2':
	   avatarType = "avataaars";
	   break;
	 case '3':
	   avatarType = "big-ears";
	   break;
	 case '4':
	   avatarType = "big-ears-neutral";
	   break;
	 case '5':
	   avatarType = "big-smile";
	   break;
	 case '6':
	   avatarType = "bottts";
	   break;
	 case '7':
	   avatarType = "croodles";
	   break;
	 case '8':
	   avatarType = "croodles-neutral";
	   break;
	 case '9':
	   avatarType = "gridy";
	   break;
	 case 'a':
	   avatarType = "micah";
	   break;
	 case 'b':
	   avatarType = "open-peeps";
	   break;
	 case 'c':
	   avatarType = "miniavs";
	   break;
	 case 'd':
	   avatarType = "personas";
	   break;
	 case 'e':
	   avatarType = "pixel-art";
	   break;
	 case 'f':
	   avatarType = "pixel-art-neutral";
	   break;
	 case '0':
	   avatarType = "jdenticon";
	   break;

    }

    
    var srcImg = 'https://avatars.dicebear.com/api/' + avatarType + '/' + upcHash + ".svg";



	  
    var mplayer = <ReactPlayer 
          width="100vw"
          url='https://www.youtube.com/watch?v=eXvBjCO19QY' 
          />


    var tutorial = go()
    this.state = {
       tutorial: tutorial,
       account: props.account,
       scanning: true,
       progress: 0,
       approved: '',
       vrLink: '',
       mplayer: mplayer,
       showModal: false,
       offerState: "offer",
       bassCleff: '',
       fullIpfs:'',
       fullIpfs2:'',
       upcRadioString: "Welcome to UPC NFT Radio!",
       pipVisibility: "hidden",
       pipDisplay:    "none",
       pipVisibility2: "hidden",
       pipDisplay2:    "none",
       showModalBuy: false,
       showModalSearch: false,
       showModalUrl: false,
       showCardModal: false,
       showOfferModal: false,
       showDexModal: false,
       showUploadModal: false,
       showProductModal: false,
       showEncryptModal: false,
       showProductContent: '',
       showTutorialContent: '',
       showModalTutorial: false,
       showModalSplash: true,
       showQrModal: false,
       showBigShow: false,
       channelSlider: '',
       showChannelShow: false,
       showBigShow2: false,
       showBplayer: false,
       showMarketQrModal: false,
       buyModalContent: '',
       searchModalContent: '',
       qrContent: '',
       marketQr: '0x5Cd036705fd68468a8dEFdBD812dfd30e467015B',
       mprogressBal: '',
       domain: '',
       card: ''
    }

    this.firstLookup();

    this.selectDomain = this.selectDomain.bind(this);
    this.channelFront= this.channelFront.bind(this);
    this.sing= this.sing.bind(this);
    this.getMplayer= this.getMplayer.bind(this);
    this.setAccount = this.setAccount.bind(this);
    this.firstLookup= this.firstLookup.bind(this);
    this.prodLookup= this.prodLookup.bind(this);
    this.search= this.search.bind(this);
    this.tutorial= this.tutorial.bind(this);
    this.upcai= this.upcai.bind(this);
    this.meeting= this.meeting.bind(this);
    this.grep= this.grep.bind(this);
    this.forward= this.forward.bind(this);
    this.heroFront= this.heroFront.bind(this);
    this.handleFlip= this.handleFlip.bind(this);
    this.getTimeZoneTimeObj= this.getTimeZoneTimeObj.bind(this);
    this.getMaticBal= this.getMaticBal.bind(this);
    this.pop= this.pop.bind(this);
  }

  printWelcomeMsg() {
//     const terminal = this.progressTerminal.current
//     terminal.clearStdout();
//     terminal.pushToStdout(welcomeMsgDefault);
  }



  handleFlip(e) {
    e.preventDefault();
    this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
    var mplayer;
    if(this.state.isFlipped) {
       this.firstLookup(this.state.account);
    }
    else {
       mplayer = "";
    }

    this.setState({offerState: 'video'});
    this.setState(prevState => ({ player: mplayer }));
  }


  componentDidMount = async () => {
    var self = this;

    var addy = this.props.address;
    const balance = await window.web3.eth.getBalance(addy);
    this.getMaticBal();

    let totalFeds = await this.props.latestTokenIdFed();
    this.setState({totalFeds: totalFeds});
    //this.heroFront(this.state.account);
    setInterval(function() {
        return self.DisplayTime(-300);
     }, 1000);

    return this.DisplayTime(-300);

  }


  firstLookup= async (upc) => {
          var self = this;

          if(!upc) {
             upc = this.state.account
          }
          let info = this.props.upcInfo(upc)
           .then(data => {
                var owner= data['staker'];
                var nftId= data['tokenId'];
                var addy = this.props.address;
		if(addy == owner) {

	           var bc = <BassCleff handleFlip={this.handleFlip} angel={this.angel} flip={this.flip} printWelcomeMsg={this.printWelcomeMsg} upload={this.upload} account={this.state.account} />
                   self.setState({nftId: nftId});
                   self.setState({bassCleff: bc});
		   
		}
		if(owner.includes("0000000000")) {
                     var upcHash  = sha256(upc)
                     upcHash = sha256(upcHash);
                     upcHash = sha256(upcHash);
                     upcHash = sha256(upcHash);
                     var avatarType;
                     switch(upcHash.substring(0,1)) {

                          case '0':
                            avatarType = "adventurer";
                            break;
                          case '1':
                            avatarType = "adventurer-neutral";
                            break;
                          case '2':
                            avatarType = "avataaars";
                            break;
                          case '3':
                            avatarType = "big-ears";
                            break;
                          case '4':
                            avatarType = "big-ears-neutral";
                            break;
                          case '5':
                            avatarType = "big-smile";
                            break;
                          case '6':
                            avatarType = "bottts";
                            break;
                          case '7':
                            avatarType = "croodles";
                            break;
                          case '8':
                            avatarType = "croodles-neutral";
                            break;
                          case '9':
                            avatarType = "gridy";
                            break;
                          case 'a':
                            avatarType = "micah";
                            break;
                          case 'b':
                            avatarType = "open-peeps";
                            break;
                          case 'c':
                            avatarType = "miniavs";
                            break;
                          case 'd':
                            avatarType = "personas";
                            break;
                          case 'e':
                            avatarType = "pixel-art";
                            break;
                          case 'f':
                            avatarType = "pixel-art-neutral";
                            break;
                          case '0':
                            avatarType = "jdenticon";
                            break;

                     }

 
                   const hero_unique_string = "this-is-repatriation-os";

                   upcHash += hero_unique_string;

                   var channelNum = upc.substr(upc.length - 1,1)
                   var srcImg = 'https://avatars.dicebear.com/api/' + avatarType + '/' + upcHash + ".svg";
                   var offerBuy = 
                   <div style={{textAlign:"center", fontWeight:"bold", background:"#422a0b", border:"5px solid white", padding:"3px"}}>
                       <p style={{color:"white"}}><b>Hello, my name is [[{upc}]] and I declare that I am responsible for creating my own reality and shaping the narrative for myself and my community based on our shared experience and intelligence.  Please program UPC parcel #[[{upc}]] and use it to publicly assert your dignity and create a shared positive social environment where creators encourage each other.  Together, with our hard work and our solid values, we can replace historical lies with truth and build an economy with a mission to uplift the Melanated Afrikan Diaspora, also all individual allies with potential functionality to add to their respective coexisting UPC Operating System [upcos] are welcome.  Functionality, sound logic, and results supercede workless promises.  This WelcomeHome Celebration can be purchased with one Repatriate token (REP) and can be used as a tool to facilitate freedom of speech and expression [especially for anyone whose narrative has been systemically opressed, silenced, destroyed, etc. through lies, fear, manipulation, framing, misleading, gaslighting, bigtech, collusion, etc]. With these NFTs, we build a worldwide community based in mutually beneficial partnership, respect, and honor.</b></p>
                       <p style={{textAlign:"center"}}><img 
                               onClick={() => {
                                  this.sing();
                                 }
                               }

src={srcImg} height="200" width="200"/></p>



                       <p onClick={()=> { this.prodLookup(this.state.account) } }><Barcode value={upc} format="UPC" /></p>

                       <button 
                               style={{background: "#000000", color:"blue", width: "45vw", height: "20vw"}}
                               onClick={() => {
                               this.ask("")
                       	this.setState({offerState: "video"});
                               this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
                               this.ask();
                       }
                       	} >buy station [[{upc}]]</button>
                       <button 
                              style={{background: "#000000", color:"blue", width: "45vw", height: "20vw"}}
                              onClick={(e) => { 
				     this.channelFront(upc.substr(0,upc.length-1));
                                     this.setState({offerState: "video"});}
                                } >watch channel {channelNum} on {upc.substr(0,upc.length-1)}[[{channelNum}]] </button>
                   </div>



                   self.setState({player: offerBuy});
                   self.setState({offerState: "offer"});
                    //this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
		    //this.offer();
		}
                else {
                 var carousel;

                 let infoOwned = this.props.upcInfo(upc)
                  .then(data => {
                       var vr   = data['vr'];
                       var staker = data['staker'];

                       if( (vr.includes('###')) ||  (vr.includes('>>>') ) ) {
                          carousel = <StageCarousel upcInfo={this.props.upcInfo} nftInfo={this.props.nftInfo} upcId={upc} />
                          this.setState({player: carousel});
                       }
                       else {
                          this.heroFront(this.state.account);
                       }
                  });
                  self.setState({offerState: "video"});
                }
	   })
  }


  //set state player var
  heroFront = async (upcId) => {
          var self = this;
	  var mplayer = <h1 style={{textAlign:"center"}}>[[Loading]]</h1>;

          self.setState({mplayer: mplayer});
          if(self.state.offerState == "video") {
             self.setState({player: mplayer});
          }
          let infoOwned = this.props.upcInfo(upcId)
           .then(data => {


                var vr   = data['vr'];
                var staker = data['staker'];

                if(staker.includes('0x0000000000000000000')) {
                var lastChar = upcId.slice(-1);

                var fullNft = "00000000000" + lastChar;

                    let info = this.props.upcInfo(fullNft)
                      .then(data => {

                    var unownedVr = data.vr;
                    if(unownedVr.includes('tiktok')) {
                       mplayer = <TikTok url={unownedVr} />
                    }
                    //backwards compat, use iframe for shortened codes, or allow them to paste the full url.  full url
                    //pasting does not get the player with controls (this iframe player below)
		    else if(unownedVr.length == 11) {
                       const youtubeID = unownedVr
                       mplayer =
                       <iframe className='video'
                               style={{minHeight:"100vh",width:"100vw"}}
                               title='Youtube player'
                               sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                               src={`https://youtube.com/embed/${youtubeID}?autoplay=0`}>
                       </iframe>
                    }
		    else {
                       mplayer = <ReactPlayer 
                                    width="100vw"
                                    url={data['vr']} 
                                />

		    }

                            self.setState({mplayer: mplayer});
                            if(self.state.offerState == "video") {
                               self.setState({player: mplayer});
                            }
	            })
		}
		else {
	            
                    var vr   = data['vr'];
                    var mplayer;
                    if(vr.includes('tiktok')) {

                       mplayer = <TikTok url={vr} />
                    }
                    //backwards compat, use iframe for shortened codes, or allow them to paste the full url.  full url
                    //pasting does not get the player with controls (this iframe player below)
		    else if(vr.length == 11) {
                       const youtubeID = data['vr']
                       mplayer =
                       <iframe className='video'
                               style={{minHeight:"100vh",width:"100vw"}}
                               title='Youtube player'
                               sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                               src={`https://youtube.com/embed/${youtubeID}?autoplay=0`}>
                       </iframe>
                    }
		    //arbitrary url video
		    else if(!vr.includes('yout') && !vr.includes('facebook') 
			    && !vr.includes('soundcloud') && !vr.includes('vimeo') 
			    && !vr.includes('whistia') && !vr.includes('mixcloud') 
			    && !vr.includes('dailymotion') && !vr.includes('twitch')) {
                       const fullUrl = data['vr']
                       mplayer =
                       <iframe className='video'
                               style={{minHeight:"100vh",width:"100vw"}}
		               allow="camera; microphone"
                               title='1 upc dj player'
                               sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                               src={fullUrl}>
                       </iframe>
                    }


		    else {
                       mplayer = <ReactPlayer 
                                    width="100vw"
                                    url={data['vr']} 
                                />

		    }
                    self.setState({mplayer: mplayer});
                    if(self.state.offerState == "video") {
                       self.setState({player: mplayer});
                    }
		}
	   })
  }


  //set state player var
  channelFront = async (channel) => {
	  var mplayer = <ChannelCarousel2 nftInfo={this.props.nftInfo} upcInfo={this.props.upcInfo} channel={channel} />
          this.setState({channelSlider: mplayer});
          this.setState({showChannelShow: true});
  }









  DisplayTime = (timeZoneOffsetminutes) => {
  if (!document.all && !document.getElementById)
  return
  var timeElement=document.getElementById? document.getElementById("curTime"): document.all.tick2
  let d = new Date();
  var requiredDate=d.getUTCDate(timeZoneOffsetminutes)

  var hours=d.getHours();
  var minutes=d.getMinutes();
  var seconds=d.getSeconds();


  var day=d.getDate();
  var month=d.getMonth() + 1;
  var year=d.getUTCFullYear();


  if (hours>12) hours=hours-12;
  if (hours==0) hours=12;
  if (minutes<=9) minutes="0"+minutes;
  if (seconds<=9) seconds="0"+seconds;
  var currentTime=hours+":"+minutes+":"+seconds + " " + day + "/" + month + "/" + year;
  timeElement.innerHTML="<font style='font-family:Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800&subset=latin,cyrillic-ext,latin-extfont-size:14px;color:#000;'>"+currentTime+"</b>"
  }

//window.onload=DisplayTime(-330);

  getTimeZoneTimeObj = (timeZoneOffsetminutes) => {
     var localdate = new Date()
     var timeZoneDate = new Date(localdate.getTime() + ((localdate.getTimezoneOffset()- timeZoneOffsetminutes)*60*1000));
    return {'h':timeZoneDate.getHours(),'m':timeZoneDate.getMinutes(),'s':timeZoneDate.getSeconds()};
  }


  sing = async () => {

       var notes = ["A4","B4","C4","D4","E4","F4","G4","A3","B3","C3","D3","E3","F3","G3","A2","B2"]
       var noteMappings = []; // Creating a new array object
       noteMappings['0'] = 0; // Setting the attribute a to 200
       noteMappings['1'] = 1; // Setting the attribute a to 200
       noteMappings['2'] = 2; // Setting the attribute a to 200
       noteMappings['3'] = 3; // Setting the attribute a to 200
       noteMappings['4'] = 4; // Setting the attribute a to 200
       noteMappings['5'] = 5; // Setting the attribute a to 200
       noteMappings['6'] = 6; // Setting the attribute a to 200
       noteMappings['7'] = 7; // Setting the attribute a to 200
       noteMappings['8'] = 8; // Setting the attribute a to 200
       noteMappings['9'] = 9; // Setting the attribute a to 200
       noteMappings['a'] = 10; // Setting the attribute a to 200
       noteMappings['b'] = 11; // Setting the attribute a to 200
       noteMappings['c'] = 12; // Setting the attribute a to 200
       noteMappings['d'] = 13; // Setting the attribute a to 200
       noteMappings['e'] = 14; // Setting the attribute a to 200
       noteMappings['f'] = 15; // Setting the attribute a to 200



       var upcHash  = sha256(this.state.account)
       upcHash = sha256(upcHash);
       upcHash = sha256(upcHash);
       upcHash = sha256(upcHash);


       const synth = new Tone.Synth().toDestination();
       const now = Tone.now();
       synth.triggerAttackRelease("C4", "8n", now);
       var count = 0.5
       for(var i=1; i< upcHash.length; i++) {
          count += 0.5;
          var currentChar = upcHash.substring(i,i+1); 
          var noteIndex   = noteMappings[currentChar];
          var currentNote = notes[noteIndex];
          console.log("------@@@@@  current hash is " + upcHash)
          console.log("------@@@@@  current char is " + currentChar)
          console.log("------@@@@@  current note INDex is " + noteIndex)
          console.log("------@@@@@  current note is " + currentNote)
          synth.triggerAttackRelease(currentNote, "8n", now + count)
       }
  }





  getMplayer = (fullUrl) => {
      var mplayer = <iframe className='video'
              style={{height:"80vh",width:"88vw"}}
	      allow="camera; microphone"
              title='2 upc dj player'
              sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
              src={fullUrl}>
      </iframe>

      if(fullUrl.includes('tiktok')) {
         mplayer = <TikTok url={fullUrl} />
      }
      //backwards compat, use iframe for shortened codes, or allow them to paste the full url.  full url
      //pasting does not get the player with controls (this iframe player below)
      else if(fullUrl.length == 11 && !fullUrl.includes('http')) {
         const youtubeID = fullUrl
         mplayer =
         <iframe className='video'
                 style={{minHeight:"100vh",width:"100vw"}}
		 allow="camera; microphone"
                 title='Youtube player'
                 sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                 src={`https://youtube.com/embed/${youtubeID}?autoplay=0`}>
         </iframe>
      }

      else if(!fullUrl.includes('yout') && !fullUrl.includes('facebook') 
         && !fullUrl.includes('soundcloud') && !fullUrl.includes('vimeo') 
         && !fullUrl.includes('whistia') && !fullUrl.includes('mixcloud') 
         && !fullUrl.includes('dailymotion') && !fullUrl.includes('twitch')) {
            mplayer = <iframe className='video'
                    style={{height:"80vh",width:"88vw"}}
		    allow="camera; microphone"
                    title='3 upc dj player'
                    sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                    src={fullUrl}>
            </iframe>

      }



      else {
         mplayer = <ReactPlayer 
                      width="100vw"
                      url={fullUrl} 
                  />

      }

      return mplayer;
  }



  xtrade = async (nftId1,nftId2) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.executeTrade(nftId1,nftId2);
                      bal.then((value) => {
                         terminal.pushToStdout(`[[flip]]`);
                         terminal.pushToStdout(`If you are the owner of nftId1, and if this 'xtrade' transaction clears before anyone elses, then congratulations on the successful atomic swap. If successful, the {i} command will show you as the owner the new owner of the nftId2.`);
                         terminal.pushToStdout(`[[/flip]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
  }




  trade = async (nftId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.createTrade(nftId);
                      bal.then((value) => {
                         terminal.pushToStdout(`[[flip]]`);
                         terminal.pushToStdout(`Creating an atomic swap for your NFT. If successful, the {i} command will show the marketplace as the owner.  Run the {whois} command to see the trade market address.`);
                         terminal.pushToStdout(`[[/flip]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
  }

  flip= async (nftId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  var nftId = this.state.nftId
                  let bal = this.props.sendToMarket(nftId);
                      bal.then((value) => {
                         terminal.pushToStdout(`[[flip]]`);
                         terminal.pushToStdout(`Sending your NFT to the market.  Check the activity tab to monitor progress.  If this command completes, you must run 'smp' to set-market-price before the sale can begin.`);
                         terminal.pushToStdout(`[[/flip]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
  }

  angel = async (upc) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  terminal.clearStdout();
                  var theBal;
                  let bal = this.props.pbal(this.state.account);
                      bal.then((value) => {
                         theBal =window.web3.utils.fromWei(value, "ether");
                         if(theBal > 0) {
                            terminal.pushToStdout(`You have recieved Polygon from an angel.  Type 'tyvm' to withdraw the Polygon to your wallet`);
                         }

                         terminal.pushToStdout(`[[angel-balance]]`);
                         terminal.pushToStdout(`angel_balance: ${theBal} Polygon`);
                         terminal.pushToStdout(`[[/angel-balance]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
  }


  forward = (e) => {

    e.preventDefault();
    window.location.assign("https://google.com")
  }


  grep = async (word) => {

                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var latest;
                  let bal = this.props.latestTokenId();
                      bal.then((value) => {
                         latest = Math.round(value);
			 var i = 1;
			 for(i = 1; i < latest + 2; i++) {

                            let info = this.props.nftInfo(i)
                            
		   .then(data => {
                        //subtract 100 since we are naming the tlds with hundred in front for repeatability
			let hrTLD = tlds[data['tld']];
                        if(data['tld'] == 777) {
                           hrTLD = "coinbox";
                        }
                        
		        let tld = hrTLD + " (" + data['tld'] + ")";
			var tmpStamp = parseInt(data['latestTimestamp']);
                        var newDate = new Date(tmpStamp * 1000);
                        var payload = "{{ idj " + data['ipfs'] + " }}";
			var tmpStamp = parseInt(data['createdTimestamp']);
                        var created = new Date(tmpStamp * 1000);


                        var currentUrl = window.location.href;
                        var upcJson = '{"code":"' + data['word'] + '"}';
                        var upcEncoded = btoa(upcJson);
                        currentUrl = currentUrl.substring(0,currentUrl.lastIndexOf('/') + 1) + upcEncoded;


                        var upcLink = <a href={currentUrl}>{data['word']}</a>;




			var fileName = data['ipfs'];
                        var hrn = data['humanReadableName'];
			var og= data['og'];
			var upc = data['word'];
			var owner= data['staker'];
			var tldSearch= data['tld'];
			var upcHash= data['upcHash'];
			var vr= data['vr'];
			var tokenId = data['tokenId'];

		        if(fileName.includes(word) 
				|| hrn.includes(word)
				|| og.includes(word)
				|| owner.includes(word)
				|| tldSearch.includes(word)
				|| upcHash.includes(word)
				|| vr.includes(word)
				|| upc.includes(word)
			) {
				if(upc) {
				   terminal.pushToStdout(`[[ai-xintel]]`);
				   terminal.pushToStdout(`=====`);
				   terminal.pushToStdout(`owner: ${data['staker']}`);
				   terminal.pushToStdout(`=====`);
				   terminal.pushToStdout(`human_readable_name: ${data['humanReadableName']}`);
				   terminal.pushToStdout(`=====`);
				   terminal.pushToStdout(`token_id: ${tokenId}`);
				   terminal.pushToStdout(`=====`);
				   terminal.pushToStdout(`tld: ${tld}`);
				   terminal.pushToStdout(`=====`);
				   terminal.pushToStdout(`upc: <a onclick="window.location.assign('${currentUrl}');window.location.reload()" href="${currentUrl}">${upc}</a>`);
				   terminal.pushToStdout(`=====`);
				   terminal.pushToStdout(`stage: ${data['vr']}`);
				   terminal.pushToStdout(`=====`);
				   terminal.pushToStdout(`payload: ${payload}`);
				   terminal.pushToStdout(`=====`);
				   terminal.pushToStdout(`[[/ai-xintel]]`);
				}
                        }
                  });
	
        		 }
        		      
        		 // expected output: "Success!"
        	      });
                })

                return ''

  }



  splash = async (upcId) => {
                      this.setState({showModalSplash:true});
  }



  tutorial = async (term) => {
                      this.setState({showModalTutorial:true});
  }



  upcai = async (upcId) => {



                 const api_url = "https://api-inference.huggingface.co/models/OpenAssistant/oasst-sft-1-pythia-12b";
                 const pipeline = "text-generation/"
                 const payload = JSON.stringify({
                   "query": {"inputs": "write a poem about a jar of jelly from the perspective of a jar of peanut butter.  the jelly has done something extraordinary"},
                 });
                 
                 // Add your token from https://huggingface.co/settings/token
                 const body= {
                     'headers':  {"Authorization": "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"},
                     'wait_for_model': true,
                     'use_gpu': false,
                     'method' : "POST",
                     'contentType' : "application/json",
                     'payload' : payload
                   };
                 
                 var xmlHttp = new XMLHttpRequest();
                 xmlHttp.open("GET", api_url, false);
                 xmlHttp.send(body);
                 console.log(xmlHttp.responseText);
                 //const HF_API_TOKEN = "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";
                 //const model = "THUDM/chatglm-6b"
                 //const data = {inputs:"write a poem about a jar of jelly from the perspective of a jar of peanut butter.  the jelly has done something extraordinary"};
                 
  }





  search = async (term) => {
                  var result;
                  var self = this;
                  var searchForm =  <div style={{background:"black", textAlign:"center"}}>
                    <div>
                      <input
                        type="text"
                        ref={(humanReadableName) => { this.humanReadableName = humanReadableName }}
                        placeholder="search-term (no spaces)"
			style={{border: "1px solid blue",marginTop:"20px",height:"10vh",width:"90vw",background:"black", color:"white"}}
                        required />



                    </div>
                    <button
                         style={{background: "#000000", color:"blue", width: "45vw", height: "10vh", marginBottom:"20px"}}
		         onClick={(event) => {
                              event.preventDefault()
                              let upcId = this.state.account
                              let humanReadableName = this.humanReadableName.value.toString()

                              this.grep(humanReadableName)

                              this.setState({showModalSearch:false});
                              this.handleFlip(event)

		         }}
                  >
                  search
              </button>
                    <button 
                         style={{background: "yellow", color:"blue", width: "45vw", height: "10vh", marginBottom:"20px"}}
                         onClick={(event) => {

                            var scantool = <ScanWizard firstLookup={this.firstLookup} setAccount={this.setAccount} />;
                            self.setState({player: scantool });
                         }}
                    >
                       scanner
                    </button>
             </div>

                      {this.setState({player: searchForm}) }
                      //this.setState({player:searchForm});
                      //this.setState({searchModalContent:searchForm});
                      //this.setState({showModalSearch:true});
  }




  prodLookup= async (upc) => {
    var xhr = new XMLHttpRequest();
    var self = this;
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
           var resp = xhr.responseXML.body.outerHTML;

           var fullResp = '<html>' + resp + '</html>';
           self.setState({showProductContent:fullResp});
           self.setState({showProductModal:true});
        }
    }


    xhr.open('GET', 'https://cors-container.herokuapp.com/https://www.upcitemdb.com/upc/' + upc );
    xhr.responseType = 'document';
    xhr.send();
  }

  selectDomain(event) {
     this.setState({domain: event.target.value});
  }

  hero = async () => {
      this.setState({showCardModal:true});
  }

  offer = async () => {
      this.setState({showOfferModal:true});
  }


  getMaticBal= async () => {
      var addy = this.props.address;
      const balance = await window.web3.eth.getBalance(addy);
      this.setState({matic: balance});
  }





  ask = async (humanReadableName) => {

                  const terminal = this.progressTerminal.current
                  var buyForm =  <div>
		  <Barcode value={this.state.account} format="EAN13" />
                  <form className="mb-3" onSubmit={(event) => {
                      event.preventDefault()
                      let upcId = this.state.account
                      let humanReadableName = this.humanReadableName.value.toString()

                      let doBuy = this.props.buyNft(upcId,humanReadableName, this.state.domain)
                      doBuy.then((value) => {
                        terminal.pushToStdout(`The buy process has been completed. If all went well, you should be able to run the {i} command and see your address as the owner.  If this is the case, the final step before you own this NFT is to run the {own} command.`)
                         // expected output: "Success!"
                      });

                    }}>
                    <div className="input-group mb-4">
                      <input
                        type="text"
                        ref={(humanReadableName) => { this.humanReadableName = humanReadableName }}
                        className="form-control form-control-lg break"
                        placeholder=".upc Domain Name"
                        required />

                        <select id="lang" 
		      onChange={(e) => { this.setState({domain: e.target.value}) } }
			      >
                           <option selected>Select a domain</option>
                           <option value="0">.watch-this</option>
                           <option value="1">.hear-this</option>
                           <option value="2">.will-work</option>
                           <option value="3">.jokes</option>
                           <option value="4">.tutorial</option>
                           <option value="5">.mumia</option>
                           <option value="6">.profile</option>
                           <option value="7">.my-show</option>
                           <option value="8">.news</option>
                           <option value="9">.gif</option>
                           <option value="10">.BLACK-WALL-STREET</option>
                           <option value="11">.deliver</option>
                           <option value="12">.grind</option>
                           <option value="13">.11:11</option>
                           <option value="14">.prediction</option>
                           <option value="15">.dapp</option>
                           <option value="16">.txt</option>
                           <option value="17">.homeless</option>
                           <option value="18">.link</option>
                           <option value="19">.surprise</option>
                           <option value="20">.freestyle</option>
                           <option value="21">.poem</option>
                           <option value="22">.stretch</option>
                           <option value="23">.workout</option>
                           <option value="24">.recipe</option>
                           <option value="25">.moment-in-time</option>
                           <option value="26">.meme</option>
                           <option value="27">.upc</option>
                           <option value="28">.marriage</option>
                           <option value="29">.bowlgame</option>
                           <option value="30">.character</option>
                           <option value="31">.character-development</option>
                           <option value="32">.skit</option>
                           <option value="33">.ai</option>
                           <option value="34">.wiki</option>
                           <option value="35">.upcscript</option>
                           <option value="36">.comment</option>
                           <option value="37">.opposing-viewpoints</option>
                           <option value="38">.meditate</option>
                           <option value="39">.protest</option>
                           <option value="41">.king-piece</option>
                           <option value="42">.queen-piece</option>
                           <option value="43">.castle-piece</option>
                           <option value="44">.knight-piece</option>
                           <option value="45">.bishop-piece</option>
                           <option value="46">.pawn-piece</option>
                           <option value="47">.decentralized-email-list</option>
                           <option value="48">.sober-day</option>
                           <option value="49">.mic</option>
                           <option value="50">.afrika</option>
                           <option value="51">.dance</option>
                           <option value="52">.micro-finance</option>
                           <option value="53">.artwork</option>
                           <option value="54">.monthly-nft-club</option>
                           <option value="55">.cringe</option>
                           <option value="56">.thank-you</option>
                           <option value="57">.dunk</option>
                           <option value="58">.nice-try-DEVIL</option>
                           <option value="59">.ad</option>
                           <option value="60">.channel</option>
                           <option value="61">.barefoot</option>
                           <option value="62">.backup</option>
                           <option value="63">.dog-walk</option>
                           <option value="64">.dog-lost</option>
                           <option value="65">.promo-code</option>
                           <option value="66">.dream-log</option>
                           <option value="67">.sha256</option>
                           <option value="68">.slideshow</option>
                           <option value="69">.champion</option>
                           <option value="70">.for-sale</option>
                           <option value="71">.public-key</option>
                           <option value="72">.ticket</option>
                           <option value="73">.happy-birthday</option>
                           <option value="74">.metal-detect</option>
                           <option value="75">.open-room</option>
                           <option value="76">.scrap-bot</option>
                           <option value="77">.blog</option>
                           <option value="777">.coinbox</option>
                        </select>

                    </div>
                    <button
                   type="submit"
                   className="btn btn-primary btn-block btn-lg"
                  >
                  BUY NFT!
              </button>
                  </form>


             </div>

                      this.setState({buyModalContent:buyForm});
                      this.setState({showModalBuy:true});

  }

  dex = async () => {

	    var myDex = <Dex 

            address={this.props.address}
            mine={this.props.mine}

            buyNftNav={this.props.buyNftNav}
          
	    redeemUPCS={this.props.redeemUPCS}
	    buyUPCSWithNarativ={this.props.buyUPCSWithNarativ}
	    approveUPCS={this.props.approveUPCS}
	    approveTubman4UPCS={this.props.approveTubman4UPCS}


            mintNftNav={this.props.mintNftNav}
            approveNav={this.props.approveNav}
            upcInfoNav={this.props.upcInfoNav}
            nftInfoNav={this.props.nftInfoNav}
            latestTokenIdNav={this.props.latestTokenIdNav}
            approve={this.props.approve}
            approveUSDC={this.props.approveUSDC}
            swap={this.props.swap}
            wm={this.props.wm}
            wn={this.props.wn}
            wa={this.props.wa}
            pbal={this.props.pbal}
            getMyBalance={this.props.getMyBalance}
            getUPCSBalance={this.props.getUPCSBalance}
            getMyNfts={this.props.getMyNfts}
            getWalkieTalkie={this.props.getWalkieTalkie}
            setVr={this.props.setVr}
            setWt={this.props.setWt}
            setIpfs={this.props.setIpfs}
            upcInfo={this.props.upcInfo}
            nftInfo={this.props.nftInfo}
            getStableBalance={this.props.getStableBalance}


			      />
                      this.setState({dex:myDex});
                      this.setState({showDexModal:true});


      this.setState({showDexModal:true});
  }

  upload = async (comp) => {
      //this.setState({showUploadModal:true});
      var link = 'https://upcunderground.mypinata.cloud/ipfs/QmbbJuVZiJNZemDHMKzU7AJfA7JKSLCVrkCPE2CwFcFQWB/#/upload/'  + this.state.account;
      var myUpload = <h1><a href={link}>Proceed to Perma-Uploader App</a></h1>
      this.setState({player:myUpload});
  }


  inj = async (upcId,numNarativ) => {
      //this.setState({showUploadModal:true});
       var self = this;
       var fullMeeting;
       let inject = this.props.injectNarativ(upcId,numNarativ)
       .then(data => {
      });

  }


  price = async (upcId) => {
       const terminal = this.progressTerminal.current
      //this.setState({showUploadModal:true});
       var self = this;
       if(!upcId) {
         upcId = this.state.account;
       }



       let inject = this.props.getCoinboxPrice(upcId)
       .then(data => {
          var price  = window.web3.utils.fromWei(data, "ether");
          price += " MATIC/REP@" + upcId;
          terminal.pushToStdout(price)
      });



  }


  setTokenPrice= async (upcId,price) => {
      this.props.setTokenPrice(upcId,price);
  }

  setTokenFee= async (upcId,price) => {
      this.props.setTokenFee(upcId,price);
  }

  setAccount = async (code) => {
      this.setState({account: code});
      this.props.handleUpdateUpc(code);
  }




  claim = async (upcId) => {
      //this.setState({showUploadModal:true});
       var self = this;
       const terminal = this.progressTerminal.current

       let inject = this.props.getCoinboxPrice(upcId)
       .then(data => {
          var price  = data;
          let inject = this.props.claimNarativToken(upcId,price)
          var msg = "Attempting to claim .25 REP from [" + upcId + "] @price " + price + " MATIC";
          terminal.pushToStdout(msg)
      });

  }


  peek = async (upcId) => {
      //this.setState({showUploadModal:true});
       var self = this;
       var fullMeeting;
       const terminal = this.progressTerminal.current
       let inject = this.props.checkNarativBalance(upcId)
       .then(data => {
          var price  = window.web3.utils.fromWei(data, "ether");
          price += " Repatriate";
          terminal.pushToStdout(price)
      });

  }


  meeting = async (comp) => {
      //this.setState({showUploadModal:true});
       var self = this;
       var fullMeeting;
       let info = this.props.upcInfo(this.state.account)
       .then(data => {
	    var vrData = data['vr'];
            if(vrData.includes('hubs.mozilla.com') ) {
               fullMeeting = "https://talk.brave.com"
            }
            else {
               fullMeeting = data['vr'];
            }
            var radioString = "UPC DJ now playing [[" + data['word'] + "]] a.k.a {{" + data['ipfs'] + "}}"; 
            //var link = <h1><a href={fullMeeting} >Enter VR zone @[[{this.state.account}]]</a></h1>
	       self.setState({modalURL: fullMeeting});
	       self.setState({showModalUrl: true});

               //self.setState({player: link});
               //self.setState({upcRadioString: radioString});
      });
		  


      var link = 'https://upcunderground.mypinata.cloud/ipfs/QmPjvxXgsUXhPFNaosu9V2hHBBwQb1Y6YrJk4ojPZk1WYc/#/upload/'  + this.state.account;
      var myUpload = <h1>Loading...</h1>
      this.setState({player:myUpload});
  }



  pop = async (url) => {


            var vr   = url;
            var mplayer;
            if(vr.includes('tiktok')) {

               mplayer = <TikTok url={vr} />
            }
            //backwards compat, use iframe for shortened codes, or allow them to paste the full url.  full url
            //pasting does not get the player with controls (this iframe player below)
	    else if(vr.length == 11) {
               const youtubeID = url
               mplayer =
               <iframe className='video'
                       style={{minHeight:"100vh",width:"100vw"}}
                       title='Youtube player'
                       sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                       src={`https://youtube.com/embed/${youtubeID}?autoplay=0`}>
               </iframe>
            }
	    //arbitrary url video
	    else if(!vr.includes('yout') && !vr.includes('facebook') 
		    && !vr.includes('soundcloud') && !vr.includes('vimeo') 
		    && !vr.includes('whistia') && !vr.includes('mixcloud') 
		    && !vr.includes('dailymotion') && !vr.includes('twitch')) {
               const fullUrl = url
               mplayer =
               <iframe className='video'
                       style={{minHeight:"100vh",width:"100vw"}}
		       allow="camera; microphone"
                       title='4 upc dj player'
                       sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                       src={fullUrl}>
               </iframe>
            }


	    else {
               mplayer = <ReactPlayer 
                            width="100vw"
                            url={url} 
                        />

	    }
            //self.setState({mplayer: mplayer});
            this.setState({fullIpfs: mplayer});
            this.setState({showBigShow2: true});
            this.setState({showBigShow: true});


  }



  play= async (upcId,pip) => {

          
          var self = this;
          if( !upcId ) {
              upcId = this.state.account;
          }

          let infoOwned = this.props.upcInfo(upcId)
           .then(data => {


                var vr   = data['ipfs'];

                if( pip ) {
                   vr   = data['vr'];
                }

                var staker = data['staker'];

                if(staker.includes('0x0000000000000000000')) {
                var lastChar = upcId.slice(-1);

                var fullNft = "00000000000" + lastChar;

                    let info = this.props.upcInfo(fullNft)
                      .then(data => {

                    var unownedVr = data.ipfs;
                    if(unownedVr.includes('tiktok')) {
                       mplayer = <TikTok url={unownedVr} />
                    }
                    //backwards compat, use iframe for shortened codes, or allow them to paste the full url.  full url
                    //pasting does not get the player with controls (this iframe player below)
		    else if(unownedVr.length == 11) {
                       const youtubeID = unownedVr
                       mplayer =
                       <iframe className='video'
                               style={{minHeight:"100vh",width:"100vw"}}
                               title='Youtube player'
                               sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                               src={`https://youtube.com/embed/${youtubeID}?autoplay=0`}>
                       </iframe>
                    }
		    else {
                       mplayer = <ReactPlayer 
                                    width="100vw"
                                    url={vr} 
                                />

		    }


                           if( pip ) {

		             this.setState(prevState => ({ pipVisibility: !prevState.pipVisibility }));
		             this.setState(prevState => ({ pipDisplay: !prevState.pipDisplay }));
                           }
                           else {


                             self.setState({mplayer: mplayer});
                             if(self.state.offerState == "video") {
                                self.setState({player: mplayer});
                             }

                           }
	            })
		}
		else {
	            
                    var vr   = data['ipfs'];

                    if( pip ) {
                       vr   = data['vr'];
                    }


                    var mplayer;
                    if(vr.includes('tiktok')) {

                       mplayer = <TikTok url={vr} />
                    }
                    //backwards compat, use iframe for shortened codes, or allow them to paste the full url.  full url
                    //pasting does not get the player with controls (this iframe player below)
		    else if(vr.length == 11) {
                       const youtubeID = vr
                       mplayer =
                       <iframe className='video'
                               style={{minHeight:"100vh",width:"100vw"}}
                               title='Youtube player'
                               sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                               src={`https://youtube.com/embed/${youtubeID}?autoplay=0`}>
                       </iframe>
                    }
		    //arbitrary url video
		    else if(!vr.includes('yout') && !vr.includes('facebook') 
			    && !vr.includes('soundcloud') && !vr.includes('vimeo') 
			    && !vr.includes('whistia') && !vr.includes('mixcloud') 
			    && !vr.includes('dailymotion') && !vr.includes('twitch')) {
                       const fullUrl = vr
                       mplayer =
                       <iframe className='video'
                               style={{height:"80vh",width:"88vw"}}
		               allow="camera; microphone"
                               title='5 upc dj player'
                               sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                               src={fullUrl}>
                       </iframe>
                    }


		    else {
                       mplayer = <ReactPlayer 
                                    width="100vw"
                                    url={vr} 
                                />

		    }
                    //self.setState({mplayer: mplayer});
                    self.setState({fullIpfs: mplayer});
                    if( pip ) {

		      this.setState(prevState => ({ pipVisibility: !prevState.pipVisibility }));
		      this.setState(prevState => ({ pipDisplay: !prevState.pipDisplay }));
                    }
                    else {
                       self.setState({showBigShow2: true});
                       self.setState({showBigShow: true});
                    }



                    if(self.state.offerState == "video") {
                       //self.setState({player: mplayer});
                       self.setState({fullIpfs: mplayer});
                       if( pip ) {

		         this.setState(prevState => ({ pipVisibility: !prevState.pipVisibility }));
		         this.setState(prevState => ({ pipDisplay: !prevState.pipDisplay }));
                       }
                       else {
                          self.setState({showBigShow2: true});
                          self.setState({showBigShow: true});
                       }
                    }
		}
	   })


  }


  render () {

    var addy = this.props.address;
    addy  = addy.substr(0,15);

    var tutorial = "Welcome to \n <i style='color:#0057b7'> UPC Band Radio/TV </i>\n <i>wake.tf.up</i> \n <b style='color:red'> [always.ask.questions]</b> \n <i style='color:#d66900'>Powered by Repatriate Crypto</i> \n <i style='color:white'> <b style='color:red'>1.</b> Type <i style='color:red'>`help`</i> to see available commands \n <b style='color:red'> 2. </b> Type <i style='color:red'>`claim`</i> to get some Repatriate Token.  You must pay a access determined by the upc owner plus the infrastructure fee, and you recieve .25 Repatriate token each time you `claim`.  To check the price of tokens in a particular coinbox, type the `price` command.  To recap, in order to get the 1 token that you need to buy a UPC NFT, you must run the claim command 4 times. A user only needs one token to buy a UPC NFT, so no need to sit around typing claim a bunch of times trying to accumulate tokens. \n <b style='color:red'> 3. </b> Type <i style='color:red'>`i`</i> to check the [[intel]] encoded into [["+ this.state.account+"]]  \n  <b style='color:red'> 4. </b> Type <i style='color:red'>`recon`</i> to allow your wallet to spend your Repatriate token in our smart contract.  You will not be able to buy {{buy}} a upc until you have run this command \n Type <i style='color:red'>`buy`</i> to buy the UPC [[" + this.state.account + "]]" + "\n  Type <i style='color:red'>`own`</i> to mint if successful with program {buy} [[" + this.state.account + "]]" + "\n  <i style='color:red'>Type `sell` to sell renovated UPC unit [[" + this.state.account + "]]" + " </i> " +  "\n Type <i style='color:red'>`x`</i> view the UNIQUE NFT Creature for this UPC" + " \n Type <i style='color:red'>`clear`</i> to clear screen" + " \n Type <i style='color:red'>`ch [0-9]` to to watch the corresponding channel.  For example, type `ch 0` to watch channel 0, and type `ch 9` to watch channel 9.  Channel values 0-9 are valid";
    var promptlabel =  '[[ AWAITING COMMAND ]] => ';

          
	  var welcomeMsg = tutorial + "\n" + addy + "_@[[" + this.state.account + "]]";

var playButton =
<i style='color:hotpink'>Type `pl` or click  <a onClick={() => { this.setState({qIsOpen: true})}}>[[" + this.state.account + "]] </a> to activate payload </i>
	



    var upcHash  = sha256(this.state.account)
    upcHash = sha256(upcHash);
    upcHash = sha256(upcHash);
    upcHash = sha256(upcHash);
    var avatarType;
    switch(upcHash.substring(0,1)) {

	 case '0':
	   avatarType = "adventurer";
	   break;
	 case '1':
	   avatarType = "adventurer-neutral";
	   break;
	 case '2':
	   avatarType = "avataaars";
	   break;
	 case '3':
	   avatarType = "big-ears";
	   break;
	 case '4':
	   avatarType = "big-ears-neutral";
	   break;
	 case '5':
	   avatarType = "big-smile";
	   break;
	 case '6':
	   avatarType = "bottts";
	   break;
	 case '7':
	   avatarType = "croodles";
	   break;
	 case '8':
	   avatarType = "croodles-neutral";
	   break;
	 case '9':
	   avatarType = "gridy";
	   break;
	 case 'a':
	   avatarType = "micah";
	   break;
	 case 'b':
	   avatarType = "open-peeps";
	   break;
	 case 'c':
	   avatarType = "miniavs";
	   break;
	 case 'd':
	   avatarType = "personas";
	   break;
	 case 'e':
	   avatarType = "pixel-art";
	   break;
	 case 'f':
	   avatarType = "pixel-art-neutral";
	   break;
	 case '0':
	   avatarType = "jdenticon";
	   break;

    }

    
    const hero_unique_string = "this-is-repatriation-os";

    upcHash  += hero_unique_string;
    var srcImg = 'https://avatars.dicebear.com/api/' + avatarType + '/' + upcHash + ".svg";
    var cardValue = {
       value:  upcHash,
       intent: "hero",
       hv: this.props.address
    }
    var cardValueStr = JSON.stringify(cardValue);
    var myCard = 
    <div>
	<p><b>Say hello to the hero of this UPC!</b></p>
        <p><img src={srcImg} height="200" width="200"/></p>
	<p><QRCode size={128} value={cardValueStr} onClick={() => { this.setState({qIsOpen: true})}}/></p>
    </div>


    var offerBuy = this.state.offerBuy;


    var myProduct = <iframe srcDoc={this.state.showProductContent} style={{height:"90vh", width:"90vw"}}> </iframe>


    //var myUpload = <IpfsUpload upc={this.state.account} xpayload={this.props.setIpfs} /> 
    var myUpload = <iframe src={'https://upcunderground.mypinata.cloud/ipfs/QmWtLgy1fktyTutQFQ86zkJAYjGfzPgR4ezBXRszUgKaHn'} style={{height:"100vh", width:"100vw"}}> </iframe>
    //var myUpload = <IpfsUpload upc={this.state.account} xpayload={this.props.setIpfs} /> 

    var player;				
    const terminal = this.progressTerminal.current

    var vidd = <ReactPlayer 
          width="100vw"
          url='https://www.youtube.com/watch?v=eXvBjCO19QY' 
          />



    //var tutorial = "<html><body><h1>hello</h1></body></html>"
    return (
      <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal">
      <div>
	     <Modal style={{"color":"white","height":"90vh","alignItems":"normal", "display":"table-cell", "textAlign":"center"}} visible={this.state.showModalUrl} closemodal={(e) => {this.setState({ showModalUrl: false }); }} type="lightSpeedIn" ></Modal>
	     <Modal style={{"color":"white","height":"90vh","alignItems":"normal", "display":"table-cell", "textAlign":"center"}} visible={this.state.showModalTutorial} closemodal={(e) => {this.setState({ showModalTutorial: false }); }} type="lightSpeedIn" > {this.state.tutorial} </Modal>


	     <Modal style={{"color":"white","height":"90vh","alignItems":"normal", "display":"table-cell", "textAlign":"center"}} visible={this.state.showModalSplash} closemodal={(e) => {this.setState({ showModalSplash: false }); }} type="lightSpeedIn" > {this.state.tutorial} </Modal>


	     <Modal style={{"alignItems":"normal", "display":"table-cell", "textAlign":"center"}} visible={this.state.showBigShow} closemodal={(e) => {this.setState({ showBigShow: false }); }} type= "pulse" >{this.state.fullIpfs}</Modal>




             <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showUploadModal} closemodal={() => this.setState({ showUploadModal: false })} type="pulse" > {myUpload}</Modal>
	     <TrebleCleff channelFront={this.channelFront} handleFlip={this.handleFlip} printWelcomeMsg={this.printWelcomeMsg} play={this.play} dex={this.dex} search={this.search} meeting={this.meeting}  account={this.state.account} tutorial={this.tutorial} upcInfo={this.props.upcInfo} address={this.props.address} />

	     <Modal style={{"height":"90vh", "width":"100vw" , "alignItems":"normal", "display":"table-cell", "textAlign":"center"}} visible={this.state.showChannelShow} closemodal={(e) => {this.setState({ showChannelShow: false }); }} type="pulse" >{this.state.channelSlider}</Modal>

                 {this.state.player}
	     {this.state.bassCleff}

      </div>
      <div>
      <div id="curTime"></div>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showModal} closemodal={() => this.setState({ showModal: false })} type="pulse" >{this.state.vrLink}</Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showModalBuy} closemodal={() => this.setState({ showModalBuy: false })} type="pulse" > {this.state.buyModalContent}</Modal>



      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showModalSearch} closemodal={() => this.setState({ showModalSearch: false })} type="pulse" > {this.state.searchModalContent}</Modal>

      <Modal style={{ height:"95vh", width:"95vw"}} visible={this.state.showBigShow2} closemodal={() => this.setState({ showBigShow2: false })} type="pulse">{this.state.fullIpfs}</Modal>


      <Modal style={{ "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showBplayer} closemodal={() => this.setState({ showBplayer: false })} type="pulse" ><ReactPlayer playing={'true'} controls={'true'} width={'90vw'} height={'90vh'} pip={'true'} stopOnUnmount={'false'} url={this.state.fullIpfs} /></Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showQrModal} closemodal={() => this.setState({ showQrModal: false })} type="pulse" ><QRCode size={128} value={this.state.account} onClick={() => { this.setState({qIsOpen: true})}}/><br/>{this.state.account}</Modal>


	     <Modal style={{"height":"90vh", "width":"100vw" , "alignItems":"normal", "display":"table-cell", "textAlign":"center"}} visible={this.state.showChannelShow} closemodal={(e) => {this.setState({ showChannelShow: false }); }} type="pulse" >{this.state.channelSlider}</Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showMarketQrModal} closemodal={() => this.setState({ showMarketQrModal: false })} type="pulse" ><QRCode size={128} value={this.state.marketQr}/>
                       <br/>
                       <h2>{this.state.marketQr}</h2>
                       <CopyToClipboard text={this.state.marketQr}>
                         <button>Copy market address</button>
                       </CopyToClipboard>

	    </Modal>




      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showCardModal} closemodal={() => this.setState({ showCardModal: false })} type="pulse" > {myCard}</Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showOfferModal} closemodal={() => this.setState({ showOfferModal: false })} type="pulse" > {offerBuy}</Modal>



      <Modal className={"dex"} style={{"width":"90vw", "height":"90vh"}} visible={this.state.showDexModal} closemodal={() => this.setState({ showDexModal: false })} type="pulse" > {this.state.dex}</Modal>

      <Modal style={{"width":"90vw", "height":"90vh"}} visible={this.state.showEncryptModal} closemodal={() => this.setState({ showEncryptModal: false })} type="pulse" > {this.state.scanner}</Modal>


      <button onClick={(e) => { this.handleFlip(e)}} >Overview this UPC!</button>

      <Terminal
        style={{"minHeight":"75vh",backgroundColor: "#000",zIndex:"99"}}
        ref={this.progressTerminal}
        commands={{

            usdc: {
		    description: '<p style="color:hotpink;font-size:1.1em">** DONT USE THIS COMMAND STUB YET! Approve UPC Band Radio to spend 50 of your Repatriate.  After you have spent 50, you must run approve again.    You MUST run this command FIRST or all of your `colonize` and `own` commands will fail. Visit <a href="upc://000000000011">[[000000000011]]</a> to view a video tutorial on approve **</p>',
              fn: () => {
                  const terminal = this.progressTerminal.current
                var progress = 0;
                this.setState({approved: false});
                this.setState({ isProgressing: true }, () => {
                  let approval = this.props.approveUSDC();
                  approval.then((value) => {
		     terminal.pushToStdout(`You have approved UPC Band Radio to transfer sufficient Repatriate from your wallet when you buy an NFT.  This approval is good for 50 NFTs.  After you have bought 50, you must run this command again, or your 'colonize' and 'colonizeb' commands will fail`)
                     // expected output: "Success!"
                  });
                })

                         terminal.pushToStdout(`[[approve]]`);
		terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                         terminal.pushToStdout(`[[/approve]]`);
                return ''
              }
            },


            gpt: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open a upcGPT window for the 12 digit code passed in.  If no code is passed, the current upc code is used.  You can either use this command (for example) as `gpt 000000000000` if you want to open a upcGPT window to `The Zeros`. **</p>',
              fn: (upcId) => {
                 this.gpt(upcId);
              }
            },



            search: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Search upcs for content.  Fields searched are owner, human readable name, vr, and ipfs.  No spaces in the search term, use dashes or underscores depending on how the owner named the file/human readable name**</p>',
              fn: (humanReadableName) => {
		      this.search()
              }
            },


            preinject: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Call this prior to injecting tokens into a upc code to approve [wei] number of tokens. `Syntax: preinject [wei]`**</p>',
              fn: (numNarativ) => {
		      this.props.approveInjectNarative(numNarativ);
              }
            },



            prefed: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Call this prior to injecting deploying your os into the OpenFederation. `Syntax: prefed`**</p>',
              fn: () => {
		      this.props.approveFed();
              }
            },



            buy: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Please help this UPC by programming something constructive into its metadata! type the command `buy` and possibly scroll around to find the modal window that will allow you to name your potential UPC Nft.  the name that you choose cannot be undone so please choose accordingly. *</p>',
              fn: (humanReadableName) => {
		      this.ask(humanReadableName);
              }
            },


            pop : {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open artitrary link in a modal window*</p>',
              fn: (url) => {
		      this.pop(url);
              }
            },


            s: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open the front stage inside of the command line as a draggable interface</p>',
              fn: () => {

                      var upc = this.state.account;
                      var carousel = <StageCarousel upcInfo={this.props.upcInfo} nftInfo={this.props.nftInfo} upcId={upc} />

		      this.setState({ fullIpfs2: carousel });
		      this.setState(prevState => ({ pipDisplay2: true}));
		      this.setState(prevState => ({ pipVisibility2: true}));
              }
            },



            book: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open librivox in draggable interface</p>',
              fn: (bookUrl) => {

                          if(!bookUrl) {
                             bookUrl = 'https://librivox.org';
                          }
                          var mplayer = <iframe className='video'
                                  style={{height:"80vh",width:"88vw"}}
		                  allow="camera; microphone"
                                  title='6 upc dj player'
                                  sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                                  src={bookUrl}>
                          </iframe>

	                  this.setState(prevState => ({ fullIpfs: mplayer }));
		          this.setState(prevState => ({ pipVisibility: !prevState.pipVisibility }));
		          this.setState(prevState => ({ pipDisplay: !prevState.pipDisplay}));
                     }
            },




            upcgpt: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open client window in draggable interface</p>',
              fn: (fullUrl,winNum) => {

		      fullUrl = "https://chat.lmsys.org";
                      winNum = "0";
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ fullIpfs: mplayer }));
		         this.setState(prevState => ({ pipVisibility: !prevState.pipVisibility }));
		         this.setState(prevState => ({ pipDisplay: !prevState.pipDisplay}));
                      }
                      else if(winNum == "1") {
		         this.setState(prevState => ({ fullIpfs2: mplayer }));
		         this.setState(prevState => ({ pipVisibility2: !prevState.pipVisibility2 }));
		         this.setState(prevState => ({ pipDisplay2: !prevState.pipDisplay2}));
                      }
 
              }
            },


            com: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open chat client window in draggable interface</p>',
              fn: (fullUrl,winNum) => {

		      fullUrl = "https://chatcrypt.com";
                      winNum = "0";
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ fullIpfs: mplayer }));
		         this.setState(prevState => ({ pipVisibility: !prevState.pipVisibility }));
		         this.setState(prevState => ({ pipDisplay: !prevState.pipDisplay}));
                      }
                      else if(winNum == "1") {
		         this.setState(prevState => ({ fullIpfs2: mplayer }));
		         this.setState(prevState => ({ pipVisibility2: !prevState.pipVisibility2 }));
		         this.setState(prevState => ({ pipDisplay2: !prevState.pipDisplay2}));
                      }
 
              }
            },



            vc: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open video chat window</p>',
              fn: (fullUrl,winNum) => {

                      fullUrl = "https://meet.jit.si/";

                      winNum = "0";
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ fullIpfs: mplayer }));
		         this.setState(prevState => ({ pipVisibility: !prevState.pipVisibility }));
		         this.setState(prevState => ({ pipDisplay: !prevState.pipDisplay}));
                      }
                      else if(winNum == "1") {
		         this.setState(prevState => ({ fullIpfs2: mplayer }));
		         this.setState(prevState => ({ pipVisibility2: !prevState.pipVisibility2 }));
		         this.setState(prevState => ({ pipDisplay2: !prevState.pipDisplay2}));
                      }
 
              }
            },


            c: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open client window in draggable interface</p>',
              fn: (fullUrl,winNum) => {


                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ fullIpfs: mplayer }));
		         this.setState(prevState => ({ pipVisibility: !prevState.pipVisibility }));
		         this.setState(prevState => ({ pipDisplay: !prevState.pipDisplay}));
                      }
                      else if(winNum == "1") {
		         this.setState(prevState => ({ fullIpfs2: mplayer }));
		         this.setState(prevState => ({ pipVisibility2: !prevState.pipVisibility2 }));
		         this.setState(prevState => ({ pipDisplay2: !prevState.pipDisplay2}));
                      }
 
              }
            },




            xbuy: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Buy a UPC NFT without the GUI popup.  Example: If you are currently scanned into UPC #222222222222 and you would like to buy the upc foo.watch-this, you would type the following `xbuy foo 0`.  The `0` after `foo` corresponds to the domain ending that you are purchasing.**</p>',
              fn: (humanReadableName,domain) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  let approval = this.props.buyNft(this.state.account, humanReadableName,domain);
                      approval.then((value) => {
                         approval = value;
			 var congrats = "Thank you for your purchase! You now own NFT for " + this.state.account;
                         terminal.pushToStdout(`[[colonizeb]]`);
                         terminal.pushToStdout(congrats)
                         terminal.pushToStdout(`[[/colonizeb]]`);
			      
                         // expected output: "Success!"
                      });


                  const interval = setInterval(() => {
                    if (this.state.approved != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({approved: approval});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }
            },


            own: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Mint an NFT for which you have successfully executed the `buy` command</p>',
              fn: (upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  let approval = this.props.mintNft(this.state.account);
                      approval.then((value) => {
                         approval = value;
                         terminal.pushToStdout(`[[own]]`);
		         terminal.pushToStdout(`Congrats! You own UPCNFT for ${upcId}`)
                         terminal.pushToStdout(`[[/own]]`);
                         // expected output: "Success!"
                      });


                  const interval = setInterval(() => {
                    if (this.state.approved != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({approved: approval});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 } )
                    }
                  }, 1500)
                })

                return ''
              }
            },


            pwn: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Mint an NFT for which you have successfully executed the `buy` command</p>',
              fn: (upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  let approval = this.props.mintNft(this.state.account);
                      approval.then((value) => {
                         approval = value;
                         terminal.pushToStdout(`[[own]]`);
		         terminal.pushToStdout(`Congrats! You own UPCNFT for ${upcId}`)
                         terminal.pushToStdout(`[[/own]]`);
                         // expected output: "Success!"
                      });


                  const interval = setInterval(() => {
                    if (this.state.approved != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({approved: approval});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 } )
                    }
                  }, 1500)
                })

                return ''
              }
            },




            sell: {
              description: '<p style="color:hotpink;font-size:1.1em">** Sell this NFT!  Send it to the decentralized marketplace after you have put in the hard work of renovating this UPC property!  After this command succeeds, you can set-market-price with smp command.  Sale will not start until you set market price (smp) **</p>',
              fn: (nftId) => {
		      this.flip(nftId);
              }
            },


            grep: {
              description: '<p style="color:hotpink;font-size:1.1em">** Search upcs for a term.  No spaces.  For example, to search for `2pac`, issue command `grep 2pac` **</p>',
              fn: (word) => {
		      this.grep(word);
              }
            },



            pretrade: {
                    description: '<p style="color:hotpink;font-size:1.1em">** Approve UPC Band Radio to send [nftId] to the trade market. You can not trade your NFT until you have successfully run this comman**</p>',
              fn: (nftId) => {
                  
                var progress = 0;
                this.setState({approved: false});
                this.setState({ isProgressing: true }, () => {
                  let approval = this.props.approveTrade(nftId);
                  approval.then((value) => {
                    var apprMsg = "You have successfullly approved your NFT to be traded in the market.  You can create the atomic swap (trade) by typing the following command: {trade " + nftId + "}";
                    terminal.pushToStdout(``)
                     // expected output: "Success!"
                  });
                })
        
                         terminal.pushToStdout(`[[approve]]`);
                terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                         terminal.pushToStdout(`[[/approve]]`);
                return ''
              }
            },



            trade: {
              description: '<p style="color:hotpink;font-size:1.1em">** Send one of your UPC codes (NFTs) to the TradeMarket.  When your UPC code (NFT) is in the TradeMarket, any other user can execute on your offer as a 1 for 1 trade. When you send your NFT to the TradeMarket, there is no negotiating for the NFT that you get in exchange.  The crypto jargon for this type of trade is Atomic Swap, so if you run the `trade` command, you will be offering your NFT for an atomic swap.   syntax is `trade <myNftToCreateSwapOffer>`**</p>',
              fn: (nftId) => {
		      this.trade(nftId);
              }
            },



            xtrade: {
              description: '<p style="color:hotpink;font-size:1.1em">** Execute a trade sending one of your UPC codes (NFTs) to the TradeMarket in an atomic swap for one of the NFTs in the marketplace.  syntax is `xtrade <myNftToOffer> <tradeMarketNft>` **</p>',
              fn: (nftId1,nftId2) => {
		      this.xtrade(nftId1,nftId2);
              }
            },



            recon: {
                    description: '<p style="color:hotpink;font-size:1.1em">** Approve UPC Band Radio to spend 1 of your Repatriate.  Each time you program a UPC, you must run `recon` again.    You MUST run this command FIRST or all of your `buy` and `own` commands will fail.**</p>',
              fn: (numTokens) => {
                  
                var progress = 0;
                this.setState({approved: false});
                this.setState({ isProgressing: true }, () => {
                  let approval = this.props.approve(numTokens);
                  approval.then((value) => {
                    terminal.pushToStdout(`You have approved UPC Band Radio to transfer sufficient Repatriate from your wallet when you buy an NFT.  This approval is good for 1 NFT, and you must run this command each time before buying an NFT, or your 'buy' and 'own' commands will fail`)
                     // expected output: "Success!"
                  });
                })
        
                         terminal.pushToStdout(`[[approve]]`);
                terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                         terminal.pushToStdout(`[[/approve]]`);
                return ''
              }
            },



            bal: {
               description: '<p style="color:hotpink;font-size:1.1em">** Display your token balances **</p>',
               fn: () => {
                 this.setState({progressBal: ''});
                 this.setState({ isProgressing: true }, () => {

                  const terminal = this.progressTerminal.current
                   var theBal;

                   this.getMaticBal();
                   var matic = window.web3.utils.fromWei(this.state.matic,"ether");

                   let bal = this.props.getMyBalance();
                       bal.then((value) => {
                          theBal =window.web3.utils.fromWei(value, "ether");
                          terminal.pushToStdout(`================`);
                          terminal.pushToStdout(`[[balance-repatriate-token]]`);
        		  terminal.pushToStdout(`${theBal} Repatriate`)
                          terminal.pushToStdout(`[[/balance-repatriate-token]]`);
                          terminal.pushToStdout(`================`);
                          terminal.pushToStdout(`[[balance-MATIC]]`);
        		  terminal.pushToStdout(`${matic} MATIC`)
                          terminal.pushToStdout(`[[/balance-MATIC]]`);
                          terminal.pushToStdout(`================`);

                          // expected output: "Success!"
                       });

                 })
        
                 return ''
               }
             },
        
               
             swap: {
                     description: '<p style="color:hotpink;font-size:1.1em">** Repatriate is the token used to write [[intel]] to UPC codes.  In order to acquire Repatriate, you must run the `swap` command. This will `swap` Polygon that you have purchased likely from an exchange for Repatriate from our Decentralized Mint.  Specify the amount of Repatriate that you would like to exchange for the Polygon in your wallet in wei.  This will trigger a transaction that will mint equiv. Repatriate for Polygon 1:1.  Example: to buy 5 Repatriate type `swap 5000000000000000000`. In other words, this would send 5 Polygon from your wallet for 5 Repatriate from the Repatriate mint. </p>',
               fn: (amount) => {
                 this.setState({progressBal: ''});
                 this.setState({ isProgressing: true }, () => {
                   
                   let approval = this.props.swap(amount);
                   approval.then((value) => {
                      approval = value;
                          terminal.pushToStdout(`[[swap]]`);
                      terminal.pushToStdout(`You have just swapped Polygon for Repatriate.  Check your Activity tab below to track the transaction. \n  Type 'bal' to see your new balance! Balances can sometimes take minutes to update.  THANK YOU! ${approval}`)
                          terminal.pushToStdout(`[[/swap]]`);
                      // expected output: "Success!"
                   });
        
                 })
        
                 return ''
               }
             },


            peek: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display the coinbox balance of a UPC code.  For example, use as such: `peek 000000000000` to see the NRT balance of the coinbox attached to UPC code 000000000000 If you run peek with no parameters, the balance of the current coinbox will be displayed **</p>',
              fn: (upcId) => {
                      if(!upcId) {
                          upcId = this.state.account
                      }

		      this.peek(upcId);
              }
            },



            price : {
              description: '<p style="color:hotpink;font-size:1.1em">** check the price of tokens on a coinbox **</p>',
              fn: (upcId) => {
                      if(!upcId) {
                          upcId = this.state.account
                      }
		      this.price(upcId);
              }
            },


            price : {
              description: '<p style="color:hotpink;font-size:1.1em">** check the price of tokens on a coinbox **</p>',
              fn: (upcId) => {
                      if(!upcId) {
                          upcId = this.state.account
                      }
		      this.price(upcId);
              }
            },


            xprice : {
              description: '<p style="color:hotpink;font-size:1.1em">** set price for coinbox **</p>',
              fn: (upcId,price) => {
                      if(!upcId) {
                          upcId = this.state.account
                      }
		      this.setTokenPrice(upcId,price);
              }
            },



            xfee : {
              description: '<p style="color:hotpink;font-size:1.1em">** set price for coinbox **</p>',
              fn: (upcId,price) => {
                      if(!upcId) {
                          upcId = this.state.account
                      }
		      this.setTokenFee(upcId,price);
              }
            },





            inj: {
              description: '<p style="color:hotpink;font-size:1.1em">** Inject NRT token into the coinbox specified. You must run preinject before running this command.  An example of how to use this function `inj 000000000000 50000000000000000000` would inject 50 NRT tokens into the coinbox attached to 000000000000 **</p>',
              fn: (upcId, numNarativ) => {
                      if(!upcId) {
                          upcId = this.state.account;
                      }
		      this.inj(upcId,numNarativ);
              }
            },

            claim: {
              description: '<p style="color:hotpink;font-size:1.1em">** This is how YOU can obtain NRT token.  Use this command to Withdraw tokens from a coinbox.  If the coinbox is attached to an NFT that is of type `coinbox (777)`, one claim command will cost the claimer .15 matic.  Executing the claim command will trigger a transaction that will send .15 matic from your wallet (plus gas),  and then the coinbox will send .25 NRT to your wallet.  You must run this command 4 times to get one token.  **</p>',
              fn: (upcId) => {
                      if(!upcId) {
                          upcId = this.state.account
                      }
		      this.claim(upcId);
              }
            },




            mkt: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display the NFTs that are on the market **</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var latest;
                  let bal = this.props.latestTokenId();
                      bal.then((value) => {
                         latest = Math.round(value);
			 var i = 1;
			 for(i = 1; i < latest + 2; i++) {

                            let info = this.props.getSaleInfo(i)
                             .then((data) => {
				  var price  = window.web3.utils.fromWei(data['price'], "ether");
				  var priceRaw    = data['price'];
				  var tokenId = data['tokenId'];
				  var fee    = window.web3.utils.fromWei(data['fee'], "ether");
                                  var buyLink = "mbuy " + tokenId + " " + priceRaw ;
                                  var playLink = "{{ndj " + tokenId + "}}";
                                  var upcLink= "{{xi " + tokenId + "}}";

				  if(data['inProgress'] == true) {
                                     terminal.pushToStdout(`\n`);
                                     terminal.pushToStdout(`*********** ${data['tokenId']} ***********`);
                                     terminal.pushToStdout(`[[market-data]]`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`buy_now (copy/paste this command): ${buyLink}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`play_now: ${playLink}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`contract: ${data['nftContract']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`upc_id: ${upcLink}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`listing_title: ${data['humanReadableName']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`bidding_complete: ${data['bidIsComplete']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`seller: ${data['seller']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`winning_bidder: ${data['winningBidder']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`token_id: ${data['tokenId']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`asking_price (Polygon): ${price}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`in_progress: ${data['inProgress']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`fee (or 2%): ${fee}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`[[/market-data]]`);
                                     terminal.pushToStdout(`*********** ${data['tokenId']} ***********`);
                                     terminal.pushToStdout(`\n`);
			          }
                            });
	
			 }
			      
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            ads: {
              description: '<p style="color:hotpink;font-size:1.1em">** Mutate the DAO qr codes into ads that you can watch for CRYPTO! Command to be completed in future version **</p>',
              fn: (nftId, price) => {
                return ''
              }
            },



            mbuy: {
              description: '<p style="color:hotpink;font-size:1.1em">** Market-buy.  Buys [[nftId]] from the marketplace for [[price]] **</p>',
              fn: (nftId, price) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.buyFromMarket(nftId, price);
                      bal.then((value) => {
                         terminal.pushToStdout(`[[mbuy]]`);
                         terminal.pushToStdout(`Congratulations.  You have put in a buy order for nft ${nftId} at price of ${price} Polygon.  Check activity tab for details on your order`);
                         terminal.pushToStdout(`[[/mbuy]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            sttl: {
              description: '<p style="color:hotpink;font-size:1.1em">** Set listing title  for an NFT that you have sent to the market.  By default when you send an NFT to the market, the title is Anonymous UPC.  This is a chance to add some marketing to your UPC **</p>',
              fn: (nftId, hrn) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.setHRNMarket(nftId, hrn);
                      bal.then((value) => {
                         terminal.pushToStdout(`[[sttl]]`);
                         terminal.pushToStdout(`You have set the title on: ${nftId}. Check activity tab for detailed transaction information`);
                         terminal.pushToStdout(`[[/sttl]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },



            supc: {
              description: '<p style="color:hotpink;font-size:1.1em">** Set UPC for an NFT that you have sent to the market.  By default when you send an NFT to the market, the UPC is 000000000000.  This is a chance to add some branding to your UPC <a href="upc://000000000022">[[000000000022]]</a>  **</p>',
              fn: (nftId, upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.setUpcMarket(nftId, upcId);
                      bal.then((value) => {
                         terminal.pushToStdout(`[[supc]]`);
                         terminal.pushToStdout(`You have set the UPC ID on: ${nftId}. Check activity tab for detailed transaction information`);
                         terminal.pushToStdout(`[[/supc]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },





            smp: {
              description: '<p style="color:hotpink;font-size:1.1em">** Set market price for an NFT that you have sent to the market.  By default when you send an NFT to the market, the price is 1 Polygon.  The sale will not start until you run this command and set the price in GWEI **</p>',
              fn: (nftId, price) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.setMarketPrice(nftId, price);
                      bal.then((value) => {
                         terminal.pushToStdout(`[[smp]]`);
                         terminal.pushToStdout(`You have set the market price on: ${nftId}. Check activity tab for detailed transaction information`);
                         terminal.pushToStdout(`[[/smp]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },

            nfts: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display the NFTs that you own **</p>',
              fn: () => {
		      var addy = this.props.address;
                      addy  = addy.substr(0,15);
		      this.grep(addy);
              }
            },



            trades : {
              description: '<p style="color:hotpink;font-size:1.1em">** Display the NFTs that are on the **TRADES** market **</p>',
              fn: () => {

                      let addy = this.props.trademarketData.address;
                      addy  = addy.substr(0,15);
		      this.grep(addy);
              }
            },



            last : {
              description: '<p style="color:hotpink;font-size:1.1em">** Display the highest NFT ID in the UPC collection **</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var latest;
                  let bal = this.props.latestTokenId();
                      bal.then((value) => {
                         latest = value;
                         terminal.pushToStdout(`[[last]]`);
                         terminal.pushToStdout(`latest_id: ${latest}`);
                         terminal.pushToStdout(`[[/last]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },

            ab: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display the Guardian Angel tip jar balance of the current UPC</p>',
              fn: () => {
                  this.angel();
              }
            },


            store: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Display link to this UPCs store</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 var link = "<a href='"+value+"'>Visit this UPCs unique product store [[" + this.state.account + "]]</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            angel: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Be a guardian angel by injecting Polygon into a UPC. Example: Type `angel 777777777777 1000000000000000000` to inject 1 Polygon into upc terminal# 777777777777. Whoever owns the NFT for the UPC (terminal) can then withdraw it with the `tyvm` command</p>',
              fn: (upcId, amount) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.pigin(upcId, amount);
                      bal.then((amount, value) => {
                         terminal.pushToStdout(`Thank you for being an UPC Band Radio Angel! Type ab to see your angel balance`);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },

            tyvm: {
              description: '<p style="color:hotpink;font-size:1.1em">** Say Thank YOU! and Withdraw all Polygon from a UPC if you own the NFT for the UPC</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.pigout(this.state.account);
                      bal.then((value) => {
                         terminal.pushToStdout(`Your balance has increased thanks to a Guardian Angel! TYVM Guardian Angel!`);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },

            m411: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display market sale information about an nft id if that nft is on the market</p>',
              fn: (nftId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let info = this.props.getSaleInfo(nftId)
		   .then(data => {

			var price  = window.web3.utils.fromWei(data['price'], "ether");
			var fee    = window.web3.utils.fromWei(data['fee'], "ether");
                        terminal.pushToStdout(`[[market-data]]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`contract: ${data['nftContract']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`bidding_complete: ${data['bidIsComplete']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`seller: ${data['seller']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`listing_title: ${data['humanReadableName']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`upc: ${data['upcId']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`winning_bidder: ${data['winningBidder']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`token_id: ${data['tokenId']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`asking_price (Polygon): ${price}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`in_progress: ${data['inProgress']}`);
                        terminal.pushToStdout(`=====`);
		        terminal.pushToStdout(`fee (or 2%): ${fee}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`[[/market-data]]`);
                  });
		  

                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: info});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }
            },


            xi: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display intel about a NFT by passing the NFT ID.  Example `xi 35` will return intel about NFT #35.</p>',
              fn: (nftId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let info = this.props.nftInfo(nftId)
		   .then(data => {


			var upc = data['word'];
			let hrTLD = tlds[data['tld']];
                        if(data['tld'] == 777) {
                           hrTLD = "coinbox";
                        }
		        let tld = hrTLD + " (" + data['tld'] + ")";
			var tmpStamp = parseInt(data['latestTimestamp']);
                        var newDate = new Date(tmpStamp * 1000);
                        var payload = "{{ idj " + data['ipfs'] + " }}";
			var tmpStamp = parseInt(data['createdTimestamp']);
                        var created = new Date(tmpStamp * 1000);
                        var currentUrl = window.location.href;
                        var upcJson = '{"code":"' + data['word'] + '"}';
                        var upcEncoded = btoa(upcJson);
                        currentUrl = currentUrl.substring(0,currentUrl.lastIndexOf('/') + 1) + upcEncoded;


                        var upcLink = "<a href='"+ currentUrl +"'>[["+ data['word'] +"]]</a>";
                        terminal.pushToStdout(`[[xintel]]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`og_owner: ${data['og']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`owner: ${data['staker']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`human_readable_name: ${data['humanReadableName']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`tld: ${tld}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`token_id: ${data['tokenId']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`dna_hash: ${data['upcHash']}`);
                        terminal.pushToStdout(`=====`);
	                terminal.pushToStdout(`upc: <a onclick="window.location.assign('${currentUrl}');window.location.reload()" href="${currentUrl}">${upc}</a>`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`minted: ${data['minted']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`stage: ${data['vr']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`payload: ${payload}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`latest_update: ${newDate.toString()}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`created_date: ${created.toString()}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`[[/xintel]]`);
                  });
		  

                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: info});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }
            },

            xupc: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display intel about a UPC given the UPC. Example `xupc 078742254609` will return intel for upc 078742254609</p>',
              fn: (upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let info = this.props.upcInfo(upcId)
		   .then(data => {
			var tmpStamp = parseInt(data['latestTimestamp']);
                        var newDate = new Date(tmpStamp * 1000);

			var tmpStamp = parseInt(data['createdTimestamp']);
                        var created = new Date(tmpStamp * 1000);

                        var upc = data['word'];
			let hrTLD = tlds[data['tld']];
                        if(data['tld'] == 777) {
                           hrTLD = "coinbox";
                        }

		        let tld = hrTLD + " (" + data['tld'] + ")";

                        var currentUrl = window.location.href;
                        var upcJson = '{"code":"' + data['word'] + '"}';
                        var upcEncoded = btoa(upcJson);
                        currentUrl = currentUrl.substring(0,currentUrl.lastIndexOf('/') + 1) + upcEncoded;




                        terminal.pushToStdout(`[[intel]]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`og_owner: ${data['og']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`owner: ${data['staker']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`human_readable_name: ${data['humanReadableName']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`tld: ${tld}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`token_id: ${data['tokenId']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`dna_hash: ${data['upcHash']}`);
                        terminal.pushToStdout(`=====`);
	                terminal.pushToStdout(`upc: <a onclick="window.location.assign('${currentUrl}');window.location.reload()" href="${currentUrl}">${upc}</a>`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`minted: ${data['minted']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`stage: ${data['vr']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`payload: ${data['ipfs']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`latest_update: ${newDate.toString()}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`created_date: ${created.toString()}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`[[/intel]]`);
                  });
		  

                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: info});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }
            },

            i: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display intel from context of the current UPC terminal</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let info = this.props.upcInfo(this.state.account)
		   .then(data => {
			var tmpStamp = parseInt(data['latestTimestamp']);
                        var newDate = new Date(tmpStamp * 1000);

			var tmpStamp = parseInt(data['createdTimestamp']);
                        var created = new Date(tmpStamp * 1000);
			let hrTLD = tlds[data['tld']];
                        if(data['tld'] == 777) {
                           hrTLD = "coinbox";
                        }
 
		        let tld = hrTLD + " (" + data['tld'] + ")";

                        terminal.pushToStdout(`[[intel]]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`og_owner: ${data['og']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`owner: ${data['staker']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`human_readable_name: ${data['humanReadableName']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`tld: ${tld}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`token_id: ${data['tokenId']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`dna_hash: ${data['upcHash']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`upc: ${data['word']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`minted: ${data['minted']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`stage: ${data['vr']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`payload: ${data['ipfs']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`latest_update: ${newDate.toString()}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`created_date: ${created.toString()}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`[[/intel]]`);
                  });
		  

                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: info});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }
            },



            cd: {
              description: '<p style="color:hotpink;font-size:1.1em">** change directory (upc code) on command line without gui or scanner</p>',
              fn: async (upcId) => {
                        this.setAccount(upcId);
                        this.firstLookup(upcId);
              }
            },






            whois: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display the smart contract addresses that this system interacts with for your verification.**</p>',
              fn: async () => {
                  const terminal = this.progressTerminal.current
                        let nftAddress = this.props.upcNFTData.address;
                        var beLink = 'https://explorer.bitquery.io/matic/address/' + nftAddress;
			var nftLinkFinal = "<a href='"+beLink+"'>[" + nftAddress + "][verify]</a>";

                        let paytokenAddress = this.props.paytokenData.address;
                        var paytokenLink = 'https://explorer.bitquery.io/matic/address/' + paytokenAddress;
			var paytokenLinkFinal = "<a href='"+paytokenLink+"'>[" + paytokenAddress + "][verify]</a>";

                        let fedAddress = this.props.fedData.address;
                        var fedLink = 'https://explorer.bitquery.io/matic/address/' + fedAddress;
			var fedLinkFinal = "<a href='"+fedLink+"'>[" + fedAddress + "][verify]</a>";

                        let piggyAddress = this.props.piggyData.address;
                        var piggyLink = 'https://explorer.bitquery.io/matic/address/' + piggyAddress;
			var piggyLinkFinal = "<a href='"+piggyLink+"'>[" + piggyAddress + "][verify]</a>";

                        let coinboxAddress = this.props.coinboxData.address;
                        var coinboxLink = 'https://explorer.bitquery.io/matic/address/' + coinboxAddress;
			var coinboxLinkFinal = "<a href='"+coinboxLink+"'>[" + coinboxAddress + "][verify]</a>";

                        let walkieAddress = this.props.walkieData.address;
                        var walkieLink = 'https://explorer.bitquery.io/matic/address/' + walkieAddress;
			var walkieLinkFinal = "<a href='"+walkieLink+"'>[" + walkieAddress + "][verify]</a>";


                        let marketAddress = this.props.marketData.address;
                        var marketLink = 'https://explorer.bitquery.io/matic/address/' + marketAddress;
			var marketLinkFinal = "<a href='"+marketLink+"'>[" + marketAddress + "][verify]</a>";


                        let trademarketAddress = this.props.trademarketData.address;
                        var trademarketLink = 'https://explorer.bitquery.io/matic/address/' + trademarketAddress;
			var trademarketLinkFinal = "<a href='"+trademarketLink+"'>[" + trademarketAddress + "][verify]</a>";




                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`[upcos-instance-conntracts]`);
                        terminal.pushToStdout(`nft-platform: ` + nftLinkFinal);
                        terminal.pushToStdout(`currency: ` + paytokenLinkFinal);
                        terminal.pushToStdout(`open-federation: ` + fedLinkFinal);
                        terminal.pushToStdout(`angel: ` + piggyLinkFinal);
                        terminal.pushToStdout(`coinbox: ` + coinboxLinkFinal);
                        terminal.pushToStdout(`walkie: ` + walkieLinkFinal);
                        terminal.pushToStdout(`sell-market: ` + marketLinkFinal);
                        terminal.pushToStdout(`trade-market: ` + trademarketLinkFinal);
                        terminal.pushToStdout(`[/upcos-instance-conntracts]`);

                return ''
              }
            },

            ls: {
              description: '<p style="color:hotpink;font-size:1.1em">** list information about a federation.  Example `ls 3` to list information about federation number 3 **</p>',
              fn: async (fedId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let info = this.props.fedInfo(fedId)
		   .then(data => {
                        var fedid = data['id'] + ' of ' + this.state.totalFeds + ' total federations' ;

                        var repLink = data['link'];
		        var link = "<a href='"+repLink+"'>[" + repLink+ "]</a>";
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`[federation]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`id: ` + data['id']);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`name: ` + data['name']);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`link: ` + link);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`owner: ` + data['owner']);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`[/federation]`);
                  });
                })

                return ''
              }
            },


            upcdev: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Build a permanant website from client window in draggable interface</p>',
              fn: (fullUrl,winNum) => {

                      const terminal = this.progressTerminal.current


                      var upc = this.state.account;
                      var link = "https://tfktlwgahlg4t5jjpg6w25z7rkp4ktcmofvqifht3thabeu37ura.arweave.net/mVU12MA6zcn1KXm9bXc_ip_FTExxawQU89zOAJKb_SI/index.html#/upload/" + upc;


                      terminal.pushToStdout(`=====`);
                      terminal.pushToStdout(`[now-loading-external-upc-dev-environ]`);
                      terminal.pushToStdout(`=====`);
                      terminal.pushToStdout(`link: ` + link);
                      terminal.pushToStdout(`=====`);
                      terminal.pushToStdout(`[/now-loading-external-upc-dev-environ]`);
                      window.location.href = link;

              }
            },

            goto: {
              description: '<p style="color:hotpink;font-size:1.1em">** go to a federation given the id. if id is invalid or not passed, command will fail</p>',
              fn: async (fedId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let info = this.props.fedInfo(fedId)
		   .then(data => {
                        var fedid = data['id'] + ' of ' + this.state.totalFeds + ' total federations' ;
                        var link = data['link'];
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`[now-loading-external-republik]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`link: ` + link);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`[[/now-loading-external-republik]]`);
                        window.location.href = link;
                  });
		  

                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: info});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }
            },

            qr: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display QR for X-Referenced upcId</p>',
              fn: () => {
                      this.setState({showQrModal:true});
              }
            },


            export: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display deep link for current upc code **</p>',
              fn: () => {
                      const terminal = this.progressTerminal.current
                      var currentUrl = window.location.href;
                      var upcJson = '{"code":"' + this.state.account + '"}';
                      var upcEncoded = btoa(upcJson);
                      currentUrl = currentUrl.substring(0,currentUrl.lastIndexOf('/') + 1) + upcEncoded;


                      terminal.pushToStdout(`Visit ` + this.state.account + ` in a browser ` + currentUrl);
                      //this.setState({showProductModal:true});
              }
            },


            411: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display product information for UPC</p>',
              fn: () => {
                      const terminal = this.progressTerminal.current
                      terminal.pushToStdout(`Please wait... searching for data on upc # ${this.state.account}`);
                      this.prodLookup(this.state.account);
                      //this.setState({showProductModal:true});
              }
            },
            x411: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display product information for X-Referenced UPC</p>',
              fn: (upcId) => {
                      const terminal = this.progressTerminal.current
                      terminal.pushToStdout(`Please wait... searching for data on upc # ${upcId}`);
                      this.prodLookup(upcId);
                      //this.setState({showProductModal:true});
              }
            },

            up: {
              description: '<p style="color:hotpink;font-size:1.1em">** Upload a file to ipfs</p>',
              fn: () => {
                      this.setState({showUploadModal:true});
              }
            },
           
            x: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display hero that lives inside of UPC [[' +this.state.account+ ']]</p>',
              fn: () => {
		      this.hero();
              }
            },
            xpayload: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Set your payload resource by passing the ipfs/hash value.  Example `xpayload ipfs/QmXyNMhV8bQFp6wzoVpkz3NqDi7Fj72Deg7KphAuew3RYU` will set your IPFS resource to the default audiobook repository. If your NFT is linked to a frontend (theater or other app), populate intel into the frontend by specifying a comma separated list of valid NFT ids.  Example: If you run the command `xpayload 1,2,3,4,5` on NFT id 55, this will load NFT ids 1,2,3,4,5 into the frontend that reads from NFT id 55.  In other words, you will be attaching NFTs #1-5 to NFT #55, and when the frontend reads #55, it will read from the payload field which will now hold the value `1,2,3,4,5` </p>' ,
              fn: (_ipfsLink) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.setIpfs(this.state.account, _ipfsLink);
                      approval.then((value) => {
                         approval = value;
                         // expected output: "Success!"
                      });


                  const interval = setInterval(() => {
                    if (this.state.approved != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({approved: approval});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }
            },


            xstore: {
              description: '<p style="color:hotpink;font-size:1.1em">** Set the online store link for this UPC</p>' ,
              fn: (_wtLink) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.setWt(this.state.account, _wtLink);
                      approval.then((value) => {
                         approval = value;
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            mv: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Update params for your  UPC Open Federation operating system</p>' ,
              fn: (linkId,link) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.updateFedLink(linkId,link);
                      approval.then((value) => {
                         approval = value;
			 terminal.pushToStdout(`Your operating system has been updated if applicable.`)
                         // expected output: "Success!"
                      });

                })

                return ''
              }
            },




            deploy: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Deploy your operating system to the Open Federation</p>' ,
              fn: (name,link) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.addFed(name,link);
                      approval.then((value) => {
                         approval = value;
			 terminal.pushToStdout(`Your operating system has been deployed if applicable.  Welkom to the Federation: ${approval}`)
                         // expected output: "Success!"
                      });

                })

                return ''
              }
            },






            ss: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Set your stage by passing the string value.  Example `ss https://link.to.your.vr`` will set your front stage resource so that when the public lands on your upc, they will see `https://link.to.your.vr`.</p>' ,
              fn: (upcId, _vrLink) => {

                if( upcId && !_vrLink ) {
                   _vrLink = upcId;
                   upcId = this.state.account;
                }

                console.log( "params are " );
                console.log("id - " + upcId);
                console.log("link - " + _vrLink);
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.setVr(upcId, _vrLink);
                      approval.then((value) => {
                         approval = value;
			 terminal.pushToStdout(`Approved: ${approval}`)
                         // expected output: "Success!"
                      });


                  const interval = setInterval(() => {
                    if (this.state.approved != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({approved: approval});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }
            },







            enc : {
              description: '<p style="color:hotpink;font-size:1.1em">** sha256 hash a string and xpayload it to blockchain</p>',
              fn: () => {
                this.setState({progressBal: ''});
                  const terminal = this.progressTerminal.current
		  var self = this;
                  var encryptorLink = "https://hu7bvfsvvagyiw6o2cj3nnuml5jnw6ql6nuykmh6tb7p67xdpo7q.arweave.net/PT4allWoDYRbztCTtraMX1LbegvzaYUw_ph-_37je78/index.html#"+ "/" + this.state.account
		  var link = "<a href='"+encryptorLink+"'>Click to visit UPCBR encryptor/validator for UPC# [[" + this.state.account + "]]</a>";
                  terminal.pushToStdout(link);

              }

            },



            comics: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display XKCD comic interface</p>',
              fn: (rawHash) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
		  var self = this;
                  let info = this.props.upcInfo(this.state.account)
		   .then(data => {
			var fullIpfs = "https://ipfs.io/ipfs/QmP7UYTMQFhsiRHfbgPgEngALzXWroSRVkEyWSbJTd23yf"
			var link = <a href={fullIpfs} >View my IPFS Website!</a>
			   self.setState({fullIpfs: fullIpfs});
			   self.setState({showBigShow: true});
                  });
		  

                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: info});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }


            },




            dj: {
              description: '<p style="color:hotpink;font-size:1.1em">** Rule the DJ booth with this command!  This command plays the IPFS resource attached to this UPC.  Resources can be video, audio or even an app!  If it is an app, it is community practice to post a github link to the code so that we can compile and run from our own IPFS node to self verify code safety </p>',
              fn: () => {
		      this.play(this.state.account,true);
              }


            },



            bdj: {
              description: '<p style="color:hotpink;font-size:1.1em">** Background DJ! Play music in the background or with the screen off while you workout or do whatever! Resources can be video or audio, but only audio will play with the screen off. Playlists are being integrated into bplaya.</p>',
              fn: (upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var self = this;

                  let info = this.props.upcInfo(upcId)
                   .then(data => {
                        var ipfsLocal = data['ipfs'];

                        var fullIpfs = "https://upcunderground.mypinata.cloud/" + ipfsLocal;
                        if(fullIpfs.includes('QmXyNMhV8bQFp6wzoVpkz3NqDi7Fj72Deg7KphAuew3RYU') ) {

                           fullIpfs = fullIpfs.replace('upcunderground.mypinata.cloud','ipfs.io');
                        }

                        var link = <a href={fullIpfs} >View my IPFS Website!</a>
                           self.setState({fullIpfs: fullIpfs});
                           self.setState({showBplayer: true});


                        const interval = setInterval(() => {
                          if (this.state.progressBal != '') { // Stop at 100%
                            clearInterval(interval)
                            this.setState({ isProgressing: false, progress: 0 })
                          } else {
                            this.setState({progressBal: info});
                            var self = this;
                            this.setState({ progress: this.state.progress + 10 })
                          }
                        }, 1500)
                      })

                      return ''


                  });


              }


            },






            idj: {
              description: '<p style="color:hotpink;font-size:1.1em">** DjMediaPlayer! Loads the media player and plays the RAW IPFS resource attached to this UPC. Raw resources can include IPNS resources.  Just run ip /ipfs/##hash##` or `ipl /ipns/##hash##` and load those raw resouces.  Resources can be video, audio or even an app!  If it is an app, it is community practice to post a github link to the code so that we can compile and run from our own IPFS node to self verify code safety </p>',
              fn: (rawHash) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
		  var self = this;
                  let info = this.props.upcInfo(this.state.account)
		   .then(data => {
			var fullIpfs = "https://ipfs.io/" + rawHash;
			var link = <a href={fullIpfs} >View my IPFS Website!</a>
			   self.setState({fullIpfs: fullIpfs});
			   self.setState({showBigShow: true});
                  });
		  

                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: info});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }


            },




            ndj: {
              description: '<p style="color:hotpink;font-size:1.1em">** NFT ID DjMediaPlayer! Runs an X-Reference and reads the data from the [[nftId]] passed in.  Next the XBMP loads and plays the IPFS resource attached to XRd UPC.  Resources can be video, audio or even an app!  If it is an app, it is community practice to post a github link to the code so that we can compile and run from our own IPFS node to self verify code safety  </p>',
              fn: (nftId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
		  var self = this;

                  let info = this.props.nftInfo(nftId)
		   .then(data => {
                        var ipfsLocal = data['ipfs'];

      			var fullIpfs = "https://upcunderground.mypinata.cloud/" + ipfsLocal;
			if(fullIpfs.includes('QmXyNMhV8bQFp6wzoVpkz3NqDi7Fj72Deg7KphAuew3RYU') ) {

			   fullIpfs = fullIpfs.replace('upcunderground.mypinata.cloud','ipfs.io');
			}
      			   self.setState({fullIpfs: fullIpfs});
      			   self.setState({showBigShow: true});
      		  
      
                        const interval = setInterval(() => {
                          if (this.state.progressBal != '') { // Stop at 100%
                            clearInterval(interval)
                            this.setState({ isProgressing: false, progress: 0 })
                          } else {
                            this.setState({progressBal: info});
                            var self = this;
                            this.setState({ progress: this.state.progress + 10 })
                          }
                        }, 1500)
                      })
      
                      return ''


                  });
		  

              }


            },

            xdj: {
              description: '<p style="color:hotpink;font-size:1.1em">** DjMediaPlayer! Runs an X-Reference and reads the data from the [[############]] passed in.  Next the DMP loads and plays the IPFS resource attached to XRd UPC.  Resources can be video, audio or even an app!  If it is an app, it is community practice to post a github link to the code so that we can compile and run from our own IPFS node to self verify code safety  </p>',
              fn: (upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
		  var self = this;

                  let info = this.props.upcInfo(upcId)
		   .then(data => {
                        var ipfsLocal = data['ipfs'];

      			var fullIpfs = "https://upcunderground.mypinata.cloud/" + ipfsLocal;
			if(fullIpfs.includes('QmXyNMhV8bQFp6wzoVpkz3NqDi7Fj72Deg7KphAuew3RYU') ) {

			   fullIpfs = fullIpfs.replace('upcunderground.mypinata.cloud','ipfs.io');
			}

      			var link = <a href={fullIpfs} >View my IPFS Website!</a>
      			   self.setState({fullIpfs: fullIpfs});
      			   self.setState({showBigShow: true});
      		  
      
                        const interval = setInterval(() => {
                          if (this.state.progressBal != '') { // Stop at 100%
                            clearInterval(interval)
                            this.setState({ isProgressing: false, progress: 0 })
                          } else {
                            this.setState({progressBal: info});
                            var self = this;
                            this.setState({ progress: this.state.progress + 10 })
                          }
                        }, 1500)
                      })
      
                      return ''


                  });
		  

              }


            },

            room: {
              description: '<p style="color:hotpink;font-size:1.1em">** Create a VR room or dial into an existing room</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
		  var self = this;
                  let info = this.props.upcInfo(this.state.account)
		   .then(data => {

			var loc = "https://hubs.mozilla.com/link"
			var link = <a href={loc} >Dial into a room</a>


			//var link = <a href={data['vr']} >View my VR Experience!</a>

			   self.setState({vrLink: link});
			   self.setState({showModal: true});
                  });
		  

                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: info});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }


            },




            stage: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display UPC vr resource</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
		  var self = this;
                  let info = this.props.upcInfo(this.state.account)
		   .then(data => {
			 var vrLink = data['vr'];
			 var link = "<a href='"+vrLink+"'>Click to visit VR for [[" + this.state.account + "]]</a>";
                         terminal.pushToStdout(link);
                  });
		  

                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: info});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 })
                    }
                  }, 1500)
                })

                return ''
              }


            },


            ipfs411: {
              description: '<p style="color:hotpink;font-size:1.1em">** Learn commands that you can type to access different crypto related services via IPFS</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
		     terminal.pushToStdout(`type 'ip ipns/app.ens.eth'  ===TO GO TO==  ENS App`);
		     terminal.pushToStdout(`type 'ip ipns/app.uniswap.org'  ===TO GO TO== Uniswap App `);
		     terminal.pushToStdout(`type 'ip ipns/elasticdao.org'  ===TO GO TO== ElasticDAO `);
		     terminal.pushToStdout(`type 'ip ipns/gnosis-auction.eth'  ===TO GO TO== gnosis-auction.eth `);
		     terminal.pushToStdout(`type 'ip ipns/olympusdao.eth'  ===TO GO TO== Olympus DAO `);
		     terminal.pushToStdout(`type 'ip ipns/powerindex.io'  ===TO GO TO== PowerIndex `);
		     terminal.pushToStdout(`type 'ip ipns/rekt.eth'  ===TO GO TO== Rekt `);
		     terminal.pushToStdout(`type 'ip ipns/sourcify.eth'  ===TO GO TO== Sourcify `);
		     terminal.pushToStdout(`type 'ip ipns/tornado.cash'  ===TO GO TO== Tornado Cash `);
		     terminal.pushToStdout(`type 'ip ipns/zkeducation.eth'  ===TO GO TO== Zero Knowledge Education `);
                })

                return ''
              }
            },

            crown : {
              description: '<p style="color:hotpink;font-size:1.1em">** Crown a upc (give it the ability to mint tokens).  Crowner must hold nft (9999) and syntax is `crown <kingUpc> <crownedUpc>`</p>',
              fn: (kingUpc, upcId, numTokens ) => {
                      let nftAddress = this.props.upcNFTData.address;
                      const terminal = this.progressTerminal.current
                      terminal.pushToStdout(`Please wait... attempting to crown on upc # ${upcId}`);
                      this.props.addCrown(kingUpc, upcId, numTokens);
                      //this.setState({showProductModal:true});
              }
            },

            cc : {
              description: '<p style="color:hotpink;font-size:1.1em">** Check if a upc has a crown.  if this upc has been crownd, the owner can mint the tokens to their wallet.  The syntax is `cc <kingUpc>`</p>',
              fn: ( upcId ) => {
                   var theBal;

                   let bal = this.props.getCrown(upcId);
                       bal.then((value) => {
                          theBal =window.web3.utils.fromWei(value, "ether");
                          terminal.pushToStdout(`[[balance-Repatriate]]`);
        		  terminal.pushToStdout(`${theBal} Repatriate`)
                          terminal.pushToStdout(`[[/balance-Repatriate]]`);
                          terminal.pushToStdout(`================`);
                          // expected output: "Success!"
                       });
              }
            },


            ch : {
              description: '<p style="color:hotpink;font-size:1.1em">Play channel <n> .  Syntax:  `ch {0-9}`  For example, to watch channel 0, type `ch 0`.  To watch channel 9, type `ch 9`. Only channels 0-9 are currently valid </p>',
              fn: ( channel ) => {
                   var theBal;
                   let front = this.channelFront(channel);
              }
            },



            mine: {
              description: '<p style="color:hotpink;font-size:1.1em">** Mine Repatriate Token that has been Crowned into the UPC</p>',
              fn: (upcId, numTokens) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.mine(upcId, numTokens);
                  approval.then((value) => {
                     approval = value;
		     terminal.pushToStdout(`Congrats! You just mined some crypto. \n  Type 'bal' to see your new balance! ${approval}`)
                     // expected output: "Success!"
                  });
                })

                return ''
              }
            },
          }}
        welcomeMessage={welcomeMsg}
        promptLabel={promptlabel}
        dangerMode={true}
        autoFocus={true}
	promptLabelStyle={{"color":"green", "fontWeight":"bold", "fontSize":"1.1em"}}
      />


                <Draggable
		  style={{zIndex:"0"}}
                  axis="both"
                  handle=".handle"
                  positionOffset={{x: '0', y: '-50%'}}
                  defaultPosition={{x: 0, y: 0}}
                  position={null}
                  grid={[25, 25]}
                  scale={1}
                  onStart={this.handleStart}
                  onDrag={this.handleDrag}
                  onStop={this.handleStop}>
                  <div style={{ opacity:"0.9", background:"#ffffff" ,color:"#000000", visibility:this.state.pipVisibility, display: this.state.pipDisplay, width:"90vw",border:"3px dashed", padding:"5px"}}>
                    <div className="handle" style={{background:"green", display:"grid"}}><span style={{textAlign:"center"}}>drag-from-here (client0)</span></div>
                      <div style={{textAlign:"center"}}>
                         <input
                           type="text"
                           ref={(cSearch) => { this.cSearch = cSearch }}
                           placeholder="url"
		           style={{borderBottom: "2px solid green",borderLeft: "2px solid green",marginBottom:"20px",height:"10vh",width:"50vw",background:"black", color:"white"}}
                            />

                         <button
                              style={{borderBottom: "2px solid green", boxShadow:"none", borderRadius:"0px", borderRight: "2px solid green",background: "#000000", color:"green", height: "10vh", marginBottom:"20px"}}
		              onClick={(event) => {
                                   event.preventDefault()
                                   let upcId = this.state.account
                                   let cSearch = this.cSearch.value.toString()

                                   var mplayer = this.getMplayer(cSearch);
                                   this.setState({fullIpfs: mplayer});
		              }}
                         >
                            search
                         </button>


                         <button
                              style={{borderBottom: "2px solid green", boxShadow:"none", borderRadius:"0px", borderRight: "2px solid green",background: "#000000", color:"red", height: "10vh", marginBottom:"20px"}}
		              onClick={() => {
		                 this.setState(prevState => ({ pipVisibility: "false"}));
		                 this.setState(prevState => ({ pipDisplay: "none" }));
		              }}
                         >
                           [x]close 
                         </button>
                      </div>

                    <div>{this.state.fullIpfs}</div>
                  </div>
                </Draggable>




                <Draggable
		  style={{zIndex:"0"}}
                  axis="both"
                  handle=".handle2"
                  positionOffset={{x: '0', y: '-50%'}}
                  defaultPosition={{x: 0, y: 0}}
                  position={null}
                  grid={[25, 25]}
                  scale={1}
                  onStart={this.handleStart}
                  onDrag={this.handleDrag}
                  onStop={this.handleStop}>
                  <div style={{ opacity:"0.9", background:"#ffffff" ,color:"#000000", visibility:this.state.pipVisibility2, display: this.state.pipDisplay2, width:"90vw",border:"3px dashed", padding:"5px"}}>
                    <div className="handle2" style={{background:"red", display:"grid"}}><span style={{textAlign:"center"}}>drag-from-here (client1)</span></div>
                      <div style={{textAlign:"center"}}>
                         <input
                           type="text"
                           ref={(cSearch2) => { this.cSearch2 = cSearch2 }}
                           placeholder="url"
		           style={{borderBottom: "2px solid red",borderLeft: "2px solid red",marginBottom:"20px",height:"10vh",width:"50vw",background:"black", color:"white"}}
                            />

                         <button
                              style={{borderBottom: "2px solid red", boxShadow:"none", borderRadius:"0px", borderRight: "2px solid green",background: "#000000", color:"red", height: "10vh", marginBottom:"20px"}}
		              onClick={(event) => {
                                   event.preventDefault()
                                   let upcId = this.state.account
                                   let cSearch2 = this.cSearch2.value.toString()

                                   var mplayer = this.getMplayer(cSearch2);
                                   this.setState({fullIpfs2: mplayer});
		              }}
                         >
                            search
                         </button>


                         <button
                              style={{borderBottom: "2px solid red", boxShadow:"none", borderRadius:"0px", borderRight: "2px solid red",background: "#000000", color:"red", height: "10vh", marginBottom:"20px"}}
		              onClick={() => {
		                 this.setState(prevState => ({ pipVisibility2: "false"}));
		                 this.setState(prevState => ({ pipDisplay2: "none" }));
		              }}
                         >
                           [x]close 
                         </button>
                      </div>

                    <div>{this.state.fullIpfs2}</div>
                  </div>
                </Draggable>
      </div>
      </ReactCardFlip>

    )
  }
}
