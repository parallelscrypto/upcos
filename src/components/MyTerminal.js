import React, { Component } from 'react'
import Terminal from 'react-console-emulator'
import ScratchCard from './ScratchCard'
import IpfsUpload from './IpfsUpload'
import TrebleCleff from './TrebleCleff'
import BassCleff from './BassCleff'
import Modal from "react-animated-modal";
import Iframe from 'react-iframe';
import axios from "axios";
import 'react-dropdown/style.css';
import QRCode from "react-qr-code";
import Card from 'react-playing-card';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import ReactPlayer from 'react-player'
import ReactCardFlip from 'react-card-flip';


var Barcode = require('react-barcode');
var sha256 = require('js-sha256');

var welcomeMsgDefault = "Welcome to the UPCVerse \n TheHomelessChannel Loaded \n *Mission: Build strong NFT based entertainment economy for the homeless` \n *Amaze the world with your unique gift! \n *Record a video or take a pic and upload it to a UPC and flip the UPC! \n *Keep ya head up! \n *Put your crown back on! \n *Former homeless helping homeless \n *Together in unity with humanity! \n *92111* \n Type <i style='color:hotpink'>`help`</i> to see available commands \n  <a href='upc://000000000011'>[[000000000011]]</a> Type <i style='color:hotpink'>`swap`</i> to get some TubmanX\n <a href='upc://000000000012'>[[000000000012]]</a> Type <i style='color:hotpink'>`i`</i> to check the [[intel]] encoded \n  <a href='upc://000000000013'>[[000000000013]]</a> Type <i style='color:hotpink'>`recon`</i> to approve 50 of your TubmanX to be spent. \n <a href='upc://000000000014'>[[000000000014]]</a> Type <i style='color:hotpink'>`hack`</i> to buy the UPC " + "\n <a href='upc://000000000015'>[[000000000015]]</a> Type <i style='color:hotpink'>`own`</i> to mint if successful with hack " + "\n  <a href='upc://000000000016'>[[000000000016]]</a> <i style='color:hotpink'>Type `flip` to sell renovated UPC unit " + " </i> " +  "\n Type <i style='color:hotpink'>`x`</i> view the UNIQUE NFT Creature for this UPC" + " \n Type <i style='color:hotpink'>`clear`</i> to clear screen";

var tlds = ['watch-this' ,'hear-this' ,'will-work' ,'jokes' ,'tutorial' ,'mumia' ,'profile' ,'my-show' ,'news' ,'gif' ,'.BLACK-WALL-STREET' ,'.deliver' ,'.grind' ,'.11:11' ,'.prediction' ,'.dapp' ,'.txt' ,'.homeless' ,'.link' ,'.surprise' ,'.freestyle' ,'.poem' ,'.stretch' ,'.workout' ,'.recipe' ,'.moment-in-time' ,'.meme' ,'.upc', '.marriage', '.bowlgame','.character','.character-development','.skit','.ai','.wiki','.upcscript','.comment','.opposing-viewpoints','.meditate','.protest','.public-discussion','.king-piece','.queen-piece','.castle-piece','.knight-piece','.bishop-piece','.pawn-piece','.decentralized-email-list', '.sober-day', '.pac', '.afrika-power', '.lyoya', '.micro-finance','.artwork','.monthly-nft-club','.cringe','.thank-you','.dunk','nice-try-CIA']




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

	  
    var player = <ReactPlayer 
          width="100vw"
          url='https://www.youtube.com/watch?v=eXvBjCO19QY' 
          />

    this.state = {
       account: props.account,
       progress: 0,
       approved: '',
       vrLink: '',
       player: player,
       showModal: false,
       bassCleff: '',
       upcRadioString: "Welcome to UPC NFT Radio!",
       showModalBuy: false,
       showModalSearch: false,
       showCardModal: false,
       showUploadModal: false,
       showProductModal: false,
       showProductContent: '',
       showTutorialContent: '',
       showModalTutorial: false,
       showQrModal: false,
       showBigShow: false,
       showBigShow2: false,
       showBplayer: false,
       showMarketQrModal: false,
       buyModalContent: '',
       searchModalContent: '',
       qrContent: '',
       marketQr: '0x5Cd036705fd68468a8dEFdBD812dfd30e467015B',
       progressBal: '',
       domain: '',
       card: '',
    }

    this.selectDomain = this.selectDomain.bind(this);
    this.firstLookup= this.firstLookup.bind(this);
    this.prodLookup= this.prodLookup.bind(this);
    this.search= this.search.bind(this);
    this.tutorial= this.tutorial.bind(this);
    this.grep= this.grep.bind(this);
    this.heroFront= this.heroFront.bind(this);
    this.handleFlip= this.handleFlip.bind(this);
    this.DisplayTime = this.DisplayTime.bind(this);
    this.getTimeZoneTimeObj= this.getTimeZoneTimeObj.bind(this);
  }

  printWelcomeMsg() {
     const terminal = this.progressTerminal.current
     terminal.clearStdout();
     terminal.pushToStdout(welcomeMsgDefault);
  }



  handleFlip(e) {
    e.preventDefault();
    this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
    var player;
    if(this.state.isFlipped) {
       this.heroFront(this.state.account);
    }
    else {
       player = "";
    }

    this.setState(prevState => ({ player: player }));
  }


  componentDidMount = async () => {
    var self = this;
    this.firstLookup();


    this.heroFront(this.state.account);
    setInterval(function() {
        return self.DisplayTime(-300);
     }, 1000);

    return this.DisplayTime(-300);

  }


  firstLookup= async () => {
          var self = this;
          let info = this.props.upcInfo(this.props.account)
           .then(data => {
                var owner= data['staker'];
                var nftId= data['tokenId'];
                var addy = this.props.address;
		if(addy == owner) {

	           var bc = <BassCleff handleFlip={this.handleFlip} angel={this.angel} flip={this.flip} printWelcomeMsg={this.printWelcomeMsg} upload={this.upload} account={this.state.account} />
                   self.setState({nftId: nftId});
                   self.setState({bassCleff: bc});
		   
		}
	   })
  }


  //set state player var
  heroFront = async (upcId) => {
          var self = this;
	  var player;
          let infoOwned = this.props.upcInfo(upcId)
           .then(data => {

		console.log("ownership info is");
		console.log(data);

                var vr   = data['vr'];
                var staker = data['staker'];

                if(staker.includes('0x0000000000000000000')) {
                var lastChar = upcId.slice(-1);

                var fullNft = "00000000000" + lastChar;

                    let info = this.props.upcInfo(fullNft)
                      .then(data => {
                           var vr   = data['vr'];
                               player = <ReactPlayer 
                                            width="100vw"
                                            url={data['vr']} 
                                        />
                               self.setState({player: player});
	            })
		}
		else {
	            
                    player = <ReactPlayer 
                                 width="100vw"
                                 url={data['vr']} 
                             />
                    self.setState({player: player});
		}
	   })
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
  timeElement.innerHTML="<font style='font-family:Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800&subset=latin,cyrillic-ext,latin-extfont-size:14px;color:#fff;'>"+currentTime+"</b>"
  }

//window.onload=DisplayTime(-330);

  getTimeZoneTimeObj = (timeZoneOffsetminutes) => {
     var localdate = new Date()
     var timeZoneDate = new Date(localdate.getTime() + ((localdate.getTimezoneOffset()- timeZoneOffsetminutes)*60*1000));
    return {'h':timeZoneDate.getHours(),'m':timeZoneDate.getMinutes(),'s':timeZoneDate.getSeconds()};
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

  upload= async (upc) => {
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

			let hrTLD = tlds[data['tld']];
		        let tld = hrTLD + " (" + data['tld'] + ")";
			var tmpStamp = parseInt(data['latestTimestamp']);
                        var newDate = new Date(tmpStamp * 1000);
                        var payload = "{{ idj " + data['ipfs'] + " }}";
			var tmpStamp = parseInt(data['createdTimestamp']);
                        var created = new Date(tmpStamp * 1000);
                        var upcLink = "<a href='upc://"+ data['word'] +"'>[["+ data['word'] +"]]</a>";

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
				terminal.pushToStdout(`upc: ${upcLink}`);
				terminal.pushToStdout(`=====`);
				terminal.pushToStdout(`vr: ${data['vr']}`);
				terminal.pushToStdout(`=====`);
				terminal.pushToStdout(`payload: ${payload}`);
				terminal.pushToStdout(`=====`);
				terminal.pushToStdout(`[[/ai-xintel]]`);
                        }
                  });
	
        		 }
        		      
        		 // expected output: "Success!"
        	      });
                })

                return ''

  }




  tutorial = async (term) => {
                      this.setState({showModalTutorial:true});
  }






  search = async (term) => {
                  var searchForm =  <div>
                  <form className="mb-3" onSubmit={(event) => {
                      event.preventDefault()
                      let upcId = this.state.account
                      let humanReadableName = this.humanReadableName.value.toString()

                      this.grep(humanReadableName)

                      this.setState({showModalSearch:false});
                    }}>
                    <div className="input-group mb-4">
                      <input
                        type="text"
                        ref={(humanReadableName) => { this.humanReadableName = humanReadableName }}
                        className="form-control form-control-lg break"
                        placeholder="search-term (no spaces)"
                        required />

                    </div>
                    <button
                   type="submit"
                   className="btn btn-primary btn-block btn-lg"
                  >
                  Search!
              </button>
                  </form>


             </div>

                      this.setState({searchModalContent:searchForm});
                      this.setState({showModalSearch:true});
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
	  console.log("domain is " + this.state.domain);
  }

  hero = async () => {
      this.setState({showCardModal:true});
  }


  upload = async () => {
      this.setState({showUploadModal:true});
  }

  play= async () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  terminal.clearStdout();
		  var self = this;
                  let info = this.props.upcInfo(this.state.account)
		   .then(data => {
                        terminal.clearStdout();
			var fullIpfs = "https://upcunderground.mypinata.cloud/" + data['ipfs'];
			if(fullIpfs.includes('QmXyNMhV8bQFp6wzoVpkz3NqDi7Fj72Deg7KphAuew3RYU') ) {

			   fullIpfs = fullIpfs.replace('upcunderground.mypinata.cloud','ipfs.io');
			}
			if(data['ipfs'] == "") {
			   fullIpfs = "https://ipfs.io/ipfs/QmP7UYTMQFhsiRHfbgPgEngALzXWroSRVkEyWSbJTd23yf";
			}
                        var radioString = "UPC DJ now playing [[" + data['word'] + "]] a.k.a {{" + data['ipfs'] + "}}"; 
			var link = <a href={fullIpfs} >View my IPFS Website!</a>
			   self.setState({fullIpfs: fullIpfs});
			   self.setState({upcRadioString: radioString});
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


  render () {

    var addy = this.props.address;
    addy  = addy.substr(0,15);
    var promptlabel =  '[[ AWAITING COMMAND ]] => ';

          
	  var welcomeMsg =  addy + "_@[[" + this.state.account + "]]";

var playButton =
<i style='color:hotpink'>Type `pl` or click  <a onClick={() => { this.setState({qIsOpen: true})}}>[[" + this.state.account + "]] </a> to activate payload </i>
	


		  console.log(playButton);

    var upcHash  = sha256(this.state.account)
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

    
    var srcImg = 'https://avatars.dicebear.com/api/' + avatarType + '/' + upcHash + ".svg";
    console.log(srcImg);
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
    var myProduct = <iframe srcDoc={this.state.showProductContent} style={{height:"90vh", width:"90vw"}}> </iframe>


    var myUpload = <IpfsUpload upc={this.state.account} xpayload={this.props.setIpfs} /> 

    var player;				

    //var tutorial = "Welcome to \n <i style='color:#0057b7'> UPC Band Radio/TV  </i> \n <i style='color:#d66900'>Malcolm's Little Secret \n <b style='color:red'> [Black Is Beautiful! TV Network]</b>  \n <u style='color:green'>Scan any UPC code.  The last digit is the TV channel number. (Example: If the UPC code is <i style='color:white'> [[610764032820]] </i> and it is unowned, the front stage video will be the TV  <i style='color:white'> Black Is Beautiful! Channel `0` </i> since the last digit of the UPC is a <i style='color:white'> `0` </i>.  As soon as <i style='color:white'> [[610764032820]] </i> is hacked and owned, the front stage video will be blank, and it will stay this way until the owner explicitly issues the command {xvr} to update the programming. When the owner updates the programming, it is now <i style='color:white'> [[610764032820]] UPC Band Radio Station </i> owned, controlled, and protected by the NFT owners private key).  The titles and links for UPC Band TV Channels 0-9 are listed below. </u> \n <i style='color:white'>  Channel Definitions: </i> \n <i style='color:orange'> Channel 0: Black Is Beautiful!;\n <a href='upc://000000000000'>Watch Channel 0[[000000000000]]</a>.\n Or type command `ch0` to tune into UPC Band Theater Channel 0 \n <i style='color:orange'>  Channel 1: Black Travel; </i> \n <a href='upc://000000000001'>Watch Channel 1 [[000000000001]]</a>   \n Or type command `ch1` to tune into UPC Band Theater Channel 1 \n <i style='color:orange'>  Channel 2: Homeless Support; </i> \n <a href='upc://000000000002'>Watch Channel 2 [[000000000002]]</a>   \n Or type command `ch2` to tune into UPC Band Theater Channel 2 \n <i style='color:orange'>  Channel 3: Black Comedy/Entertainment/Music; </i> \n <a href='upc://000000000003'>Watch Channel 3 [[000000000003]]</a>  \n Or type command `ch3` to tune into UPC Band Theater Channel 3 \n <i style='color:orange'>  Channel 4: Fitness and Sports; </i>  \n <a href='upc://000000000004'>Watch Channel 4 [[000000000004]]</a>  \n Or type command `ch4` to tune into UPC Band Theater Channel 4 \n <i style='color:orange'>  Channel 5: Black Alt Community; </i>  \n <a href='upc://000000000005'>Watch Channel 5 [[000000000005]]</a>  \n Or type command `ch5` to tune into UPC Band Theater Channel 5 \n <i style='color:orange'>  Channel 6: Black Spirituality; <i>  \n <a href='upc://000000000006'>Watch Channel 6 [[000000000006]]</a>  \n Or type command `ch6` to tune into UPC Band Theater Channel 6 \n <i style='color:orange'>  Channel 7: Black Life Education; </i>  \n <a href='upc://000000000007'>Watch Channel 7 [[000000000007]]</a>  \n Or type command `ch7` to tune into UPC Band Theater Channel 7 \n <i style='color:orange'>  Channel 8: Black Business Connect; </i>  \n <a href='upc://000000000008'>Watch Channel 8 [[000000000008]]</a>  \n Or type command `ch8` to tune into UPC Band Theater Channel 8 \n <i style='color:orange'>  Channel 9: Black Health; </i>  \n <a href='upc://000000000009'>Watch Channel 9 [[000000000009]]</a>  \n Or type command `ch9` to tune into UPC Band Theater Channel 9 \n Type <i style='color:hotpink'>`help`</i> to see available commands \n  <a href='upc://000000000011'>[[000000000011]]</a> Type <i style='color:hotpink'>`swap`</i> to get some TubmanX\n <a href='upc://000000000012'>[[000000000012]]</a> Type <i style='color:hotpink'>`i`</i> to check the [[intel]] encoded into [["+ this.state.account+"]]  \n  <a href='upc://000000000013'>[[000000000013]]</a> Type <i style='color:hotpink'>`recon`</i> to approve 50 of your TubmanX to be spent. \n <a href='upc://000000000014'>[[000000000014]]</a> Type <i style='color:hotpink'>`hack`</i> to buy the UPC [[" + this.state.account + "]]" + "\n <a href='upc://000000000015'>[[000000000015]]</a> Type <i style='color:hotpink'>`own`</i> to mint if successful with hack [[" + this.state.account + "]]" + "\n  <a href='upc://000000000016'>[[000000000016]]</a> <i style='color:hotpink'>Type `flip` to sell renovated UPC unit [[" + this.state.account + "]]" + " </i> " +  "\n Type <i style='color:hotpink'>`x`</i> view the UNIQUE NFT Creature for this UPC" + " \n Type <i style='color:hotpink'>`clear`</i> to clear screen";
    var tutorial = "<html><body><h1>hello</h1></body></html>"

    return (
      <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal">
      <div>
	     <TrebleCleff handleFlip={this.handleFlip} printWelcomeMsg={this.printWelcomeMsg} play={this.play} hero={this.hero} search={this.search} prodLookup={this.prodLookup} account={this.state.account} tutorial={this.tutorial} />


                 {this.state.player}
	     {this.state.bassCleff}
      </div>
      <div>
      <div id="curTime"></div>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showModal} closemodal={() => this.setState({ showModal: false })} type="pulse" >{this.state.vrLink}</Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showModalBuy} closemodal={() => this.setState({ showModalBuy: false })} type="pulse" > {this.state.buyModalContent}</Modal>

      <Modal style={{"color":"white","height":"90vh","alignItems":"normal", "display":"table-cell", "textAlign":"center"}} visible={this.state.showModalTutorial} closemodal={(e) => {this.setState({ showModalTutorial: false }); }} type="pulse" > [[upc://{this.state.account}]] <iframe title={this.state.upcRadioString} style={{height:"95vh", width:"95vw","background":"white","color":"green"}} srcdoc={tutorial} />{tutorial}</Modal>


      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showModalSearch} closemodal={() => this.setState({ showModalSearch: false })} type="pulse" > {this.state.searchModalContent}</Modal>

      <Modal style={{ height:"95vh", width:"95vw"}} visible={this.state.showBigShow2} closemodal={() => this.setState({ showBigShow2: false })} type="pulse"> [[upc://{this.state.account}]] <iframe style={{height:"95vh", width:"95vw"}} src={this.state.fullIpfs} /></Modal>


      <Modal style={{"alignItems":"normal", "display":"table-cell", "textAlign":"center"}} visible={this.state.showBigShow} closemodal={(e) => {this.setState({ showBigShow: false }); }} type="pulse" > [[upc://{this.state.account}]] <iframe title={this.state.upcRadioString} style={{height:"95vh", width:"95vw"}} src={this.state.fullIpfs} /></Modal>

      <Modal style={{ "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showBplayer} closemodal={() => this.setState({ showBplayer: false })} type="pulse" ><ReactPlayer playing={'true'} controls={'true'} width={'90vw'} height={'90vh'} pip={'true'} stopOnUnmount={'false'} url={this.state.fullIpfs} /></Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showQrModal} closemodal={() => this.setState({ showQrModal: false })} type="pulse" ><QRCode size={128} value={this.state.account} onClick={() => { this.setState({qIsOpen: true})}}/><br/>{this.state.account}</Modal>



      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showMarketQrModal} closemodal={() => this.setState({ showMarketQrModal: false })} type="pulse" ><QRCode size={128} value={this.state.marketQr}/>
                       <br/>
                       <h2>{this.state.marketQr}</h2>
                       <CopyToClipboard text={this.state.marketQr}>
                         <button>Copy market address</button>
                       </CopyToClipboard>

	    </Modal>




      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showCardModal} closemodal={() => this.setState({ showCardModal: false })} type="pulse" > {myCard}</Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle","width":"95vw","height":"95vh"}} visible={this.state.showProductModal} closemodal={() => this.setState({ showProductModal: false })} type="pulse" > {myProduct}</Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showUploadModal} closemodal={() => this.setState({ showUploadModal: false })} type="pulse" > {myUpload}</Modal>
                    <button onClick={(e) => { this.handleFlip(e)}} >Overview this UPC!</button>
      <Terminal
        style={{"minHeight":"75vh",backgroundColor: "#000"}}
        dangerMode={false}
        ref={this.progressTerminal}
        commands={{

            swap: {
		    description: '<p style="color:hotpink;font-size:1.1em">** TubmanX is the token used to write [[intel]] to UPC codes.  In order to acquire TubmanX, you must run the `swap` command. This will `swap` Polygon that you have purchased likely from an exchange for TubmanX from our Decentralized Mint.  No KYC or middleman required.  Specify the amount of TubmanX that you would like to exchange for the Polygon in your wallet in wei.  This will trigger a transaction that will mint equiv. TubmanX for Polygon 1:1.  Example: to buy 5 TubmanX type `swap 5000000000000000000`. In other words, this would send 5 Polygon from your wallet for 5 TubmanX from the TubmanX mint.  Visit <a href="upc://000000000010">[[000000000010]]</a> to view a video tutorial on swap</p>',
              fn: (amount) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.swap(amount);
                  approval.then((value) => {
                     approval = value;
                         terminal.pushToStdout(`[[swap]]`);
		     terminal.pushToStdout(`You have just swapped Polygon for TubmanX.  Check your Activity tab below to track the transaction. \n  Type 'bal' to see your new balance! Balances can sometimes take minutes to update.  THANK YOU! ${approval}`)
                         terminal.pushToStdout(`[[/swap]]`);
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

            recon: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Approve UPC Band Radio to spend 50 of your TubmanX.  After you have spent 50, you must run recon again.    You MUST run this command FIRST or all of your `hack` and `own` commands will fail. Visit <a href="upc://000000000011">[[000000000011]]</a> to view a video tutorial on recon **</p>',
              fn: () => {
                  const terminal = this.progressTerminal.current
                var progress = 0;
                this.setState({approved: false});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.approve();
                  approval.then((value) => {
		     terminal.pushToStdout(`You have approved UPC Band Radio to transfer sufficient TubmanX from your wallet when you buy an NFT.  This approval is good for 50 NFTs.  After you have bought 50, you must run this command again, or your 'hack' and 'hackb' commands will fail`)
                     // expected output: "Success!"
                  });
                })

                         terminal.pushToStdout(`[[recon]]`);
		terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                         terminal.pushToStdout(`[[/recon]]`);
                return ''
              }
            },


            search: {
		    description: '<p style="color:hotpink;font-size:1.1em">** search upcs for content.  fields searched are owner, human readable name, vr, and ipfs.  No spaces in the search term, use dashes or underscores depending on how the owner named the file/human readable name**</p>',
              fn: (humanReadableName) => {
		      this.search()
              }
            },



            hack: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Buy an NFT using the GUI interface.  After completing this step, check the `Activity` tab below to make sure that your purchase went through.  After your transaction has been processed successfully, you can move to the last phase `step 2` Visit <a href="upc://000000000012">[[000000000012]]</a> to view a video tutorial on swap**</p>',
              fn: (humanReadableName) => {
                  var buyForm =  <div>
		  <Barcode value={this.state.account} format="EAN13" />
                  <form className="mb-3" onSubmit={(event) => {
                      event.preventDefault()
                      let upcId = this.state.account
                      let humanReadableName = this.humanReadableName.value.toString()

                      this.props.buyNft(upcId,humanReadableName, this.state.domain)
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
                           <option value="49">.pac</option>
                           <option value="50">.afrika-power</option>
                           <option value="51">.lyoya</option>
                           <option value="52">.micro-finance</option>
                           <option value="53">.artwork</option>
                           <option value="54">.monthly-nft-club</option>
                           <option value="55">.cringe</option>
                           <option value="56">.thank-you</option>
                           <option value="57">.dunk</option>
                           <option value="58">.nice-try-CIA</option>
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
            },




            xhack: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Buy a UPC NFT without the GUI popup.  Example: If you are currently scanned into UPC #222222222222 and you would like to buy the domain `foo.fire`, you would type the following `hackb foo 2`.  The `2` after `foo` corresponds to the domain ending that you are purchasing.  The choices are 0=.upc, 1=.afro, 2=.fire  **</p>',
              fn: (humanReadableName,domain) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.buyNft(this.state.account, humanReadableName,domain);
                      approval.then((value) => {
                         approval = value;
			 var congrats = "Thank you for your purchase! You now own NFT for " + this.state.account;
                         terminal.pushToStdout(`[[hackb]]`);
                         terminal.pushToStdout(congrats)
                         terminal.pushToStdout(`[[/hackb]]`);
			      
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
		    description: '<p style="color:hotpink;font-size:1.1em">** Mint an NFT for which you have successfully executed the `hack` or `xhack` command</p>',
              fn: (upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
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
		    description: '<p style="color:hotpink;font-size:1.1em">** Mint an NFT for which you have successfully executed the `hack` or `xhack` command</p>',
              fn: (upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
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

            flip: {
              description: '<p style="color:hotpink;font-size:1.1em">** Flip this NFT!  Send it to the decentralized marketplace after you have put in the hard work of renovating this UPC property!  After this command succeeds, you can set-market-price with smp command.  Sale will not start until you set market price (smp) **</p>',
              fn: (nftId) => {
		      this.flip(nftId);
              }
            },

            grep: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display the NFTs that are on the market **</p>',
              fn: (word) => {
		      this.grep(word);
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
                                  var buyLink = "{{mbuy " + tokenId + " " + priceRaw + "}}";
                                  var playLink = "{{ndj " + tokenId + "}}";
                                  var upcLink= "{{xi " + tokenId + "}}";

				  if(data['inProgress'] == true) {
                                     terminal.pushToStdout(`\n`);
                                     terminal.pushToStdout(`*********** ${data['tokenId']} ***********`);
                                     terminal.pushToStdout(`[[market-data]]`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`buy_now: ${buyLink}`);
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






            bal: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display your TubmanX balance **</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getMyBalance();
                      bal.then((value) => {
                         theBal =window.web3.utils.fromWei(value, "ether");
                         // expected output: "Success!"
                      });


                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: bal});
                      var self = this;
                         terminal.pushToStdout(`[[inclusion-balance]]`);
                      this.setState({ progress: this.state.progress + 10 }, () => terminal.pushToStdout(`Balance: ${theBal}` + " TubmanX"))
                         terminal.pushToStdout(`[[/inclusionx-balance]]`);
                    }
                  }, 1500)
                })

                return ''
              }
            },

            slast : {
              description: '<p style="color:hotpink;font-size:1.1em">** Display the highest NFT ID in the SuperNavalnyBrothers (SNB) collection **</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var latest;
                  let bal = this.props.latestTokenIdNav();
                      bal.then((value) => {
                         latest = value;
                         terminal.pushToStdout(`[[slast]]`);
                         terminal.pushToStdout(`latest_id: ${latest}`);
                         terminal.pushToStdout(`[[/slast]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
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


            ch0: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Visit UPC Band Theater: Black Is Beautiful! Channel</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 value  = "https://upcunderground.mypinata.cloud/ipfs/QmUpK67CyydMb9yV27M7fpyTMYLxmGzm9Tqfb8gZRxWFQQ"
			 var link = "<a href='"+value+"'>Click to travel to UPC Band Theater: Black Is Beautiful! Channel</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            ch1: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Visit UPC Band Theater: Black Travel Channel</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 value  = "https://upcunderground.mypinata.cloud/ipfs/QmWXFYqjMzdcXizN2bFuccp7NNEENKhuNPxmtrmcijkvU2"
			 var link = "<a href='"+value+"'>Click to travel to UPC Band Theater: Black Travel Channel</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },



            ch2: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Visit UPC Band Theater: Homeless Support Channel</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 value  = "https://upcunderground.mypinata.cloud/ipfs/QmQPcnATGo1jTWq4L9VZcvmtoChR3Cfnzv3pvkz7QtRd4s"
			 var link = "<a href='"+value+"'>Click to travel to UPC Band Theater: Homeless Support Channel</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },



            ch3: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Visit UPC Band Theater: Black Entertainment Channel</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 value  = "https://upcunderground.mypinata.cloud/ipfs/QmVUVaQ6icAtpnBmkj1vCUxQoM6S8ZnRujM7zmeyqjLiXr"
			 var link = "<a href='"+value+"'>Click to travel to UPC Band Theater: Black Entertainment Channel</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },



            ch4: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Visit UPC Band Theater: Fitness and Sports Channel</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 value  = "https://upcunderground.mypinata.cloud/ipfs/QmaCyEkPxqXdMRiUDdB7QQW7ppPJVy7ckA9tY4h78kqQoa"
			 var link = "<a href='"+value+"'>Click to travel to UPC Band Theater: Fitness and Sports Channel</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },



            ch5: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Visit UPC Band Theater: Black Alternative Community Channel</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 value  = "https://upcunderground.mypinata.cloud/ipfs/QmShhNEGmAVB4PYwLpzuoZB71tztWsWx6ddLYnu378qgJz"
			 var link = "<a href='"+value+"'>Click to travel to UPC Band Theater: Black Alt Community Channel</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            ch6: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Visit UPC Band Theater: Afro Spirituality Channel</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 value  = "https://upcunderground.mypinata.cloud/ipfs/QmZuLpH8yUEoriXyXMDJS8UEk5FFozB5XVmSjGseqsVLHV"
			 var link = "<a href='"+value+"'>Click to travel to UPC Band Theater: Afro Spirituality Channel</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            ch7: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Visit UPC Band Theater: Black Life Education Channel</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 value  = "https://upcunderground.mypinata.cloud/ipfs/QmRbz9GUgf5R8nNtqcA3kio4xVg5wCKHUd8aUvrytzQaxC"
			 var link = "<a href='"+value+"'>Click to travel to UPC Band Theater: Black Life Education Channel</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            ch8: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Visit UPC Band Theater: Black Business Connect Channel</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 value  = "https://upcunderground.mypinata.cloud/ipfs/QmT1wtfYwtxyuFzFLrysm8KCG49ThQ6UxitQpdbKRvk4ip"
			 var link = "<a href='"+value+"'>Click to travel to UPC Band Theater: Black Business Connect Channel</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            ch9: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Visit UPC Band Theater: Black Health Channel</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 value  = "https://upcunderground.mypinata.cloud/ipfs/Qmcc9ee8BsMufwS59z9q86xa9xKe1ppyw42RsGHpAVaHeo"
			 var link = "<a href='"+value+"'>Click to travel to UPC Band Theater: Black Health Channel</a>";
                         terminal.pushToStdout(link);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },





            wt: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Activate Walkie Talkie</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getWalkieTalkie(this.state.account);
                      bal.then((value) => {
			 var link = "<a href='"+value+"'>Click for Brave 2-Way-Chat on [[" + this.state.account + "]]</a>";
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

            snxi: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display intel about a Super Navalny Brothers NFT by passing the NFT ID.  Example `snxi 35` will return intel about SNB #35.</p>',
              fn: (nftId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let info = this.props.nftInfoNav(nftId)
		   .then(data => {

			let hrTLD = tlds[data['tld']];
		        let tld = hrTLD + " (" + data['tld'] + ")";
			var tmpStamp = parseInt(data['latestTimestamp']);
                        var newDate = new Date(tmpStamp * 1000);

			var tmpStamp = parseInt(data['createdTimestamp']);
                        var created = new Date(tmpStamp * 1000);

                        terminal.pushToStdout(`[[snxi]]`);
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
                        terminal.pushToStdout(`upc_hash: ${data['upcHash']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`upc: ${data['word']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`minted: ${data['minted']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`vr: ${data['vr']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`payload: ${data['ipfs']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`latest_update: ${newDate.toString()}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`created_date: ${created.toString()}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`[[/snxi]]`);
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

			let hrTLD = tlds[data['tld']];
		        let tld = hrTLD + " (" + data['tld'] + ")";
			var tmpStamp = parseInt(data['latestTimestamp']);
                        var newDate = new Date(tmpStamp * 1000);
                        var payload = "{{ idj " + data['ipfs'] + " }}";
			var tmpStamp = parseInt(data['createdTimestamp']);
                        var created = new Date(tmpStamp * 1000);
                        var upcLink = "<a href='upc://"+ data['word'] +"'>[["+ data['word'] +"]]</a>";
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
                        terminal.pushToStdout(`upc_hash: ${data['upcHash']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`upc: ${upcLink}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`minted: ${data['minted']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`vr: ${data['vr']}`);
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

            lsupc: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display intel about a UPC given the UPC. Example `srch 078742254609` will return intel for upc 078742254609</p>',
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

			let hrTLD = tlds[data['tld']];
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
                        terminal.pushToStdout(`upc_hash: ${data['upcHash']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`upc: ${data['word']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`minted: ${data['minted']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`vr: ${data['vr']}`);
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


            sni: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display intel from context of the current UPC terminal</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let info = this.props.upcInfoNav(this.state.account)
		   .then(data => {
			var tmpStamp = parseInt(data['latestTimestamp']);
                        var newDate = new Date(tmpStamp * 1000);

			var tmpStamp = parseInt(data['createdTimestamp']);
                        var created = new Date(tmpStamp * 1000);
			let hrTLD = tlds[data['tld']];
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
                        terminal.pushToStdout(`upc_hash: ${data['upcHash']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`upc: ${data['word']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`minted: ${data['minted']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`vr: ${data['vr']}`);
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
                        terminal.pushToStdout(`upc_hash: ${data['upcHash']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`upc: ${data['word']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`minted: ${data['minted']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`vr: ${data['vr']}`);
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


            qr: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display QR for X-Referenced upcId</p>',
              fn: () => {
                      this.setState({showQrModal:true});
              }
            },


            export: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display product information for UPC</p>',
              fn: () => {
                      const terminal = this.progressTerminal.current
		      var currentSite = window.location.href;
                      terminal.pushToStdout(`Visit ` + this.state.account + ` in a browser ` + currentSite);
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


            xwt: {
              description: '<p style="color:hotpink;font-size:1.1em">** Set the Walkie Talkie resource for this UPC</p>' ,
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



            xvr: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Set your VR resource by passing the ipfs/hash value.  Example `xvr https://link.to.your.vr`` will set your vr resource so that when the public scans this upc and types `vr` they will see `https://link.to.your.vr`.  This does not have to be a vr link, it can be a regular website if you choose</p>' ,
              fn: (_vrLink) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.setVr(this.state.account, _vrLink);
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
              description: '<p style="color:hotpink;font-size:1.1em">** OWN the DJ booth with player!  This command plays the IPFS resource attached to this UPC.  Resources can be video, audio or even an app!  If it is an app, it is community practice to post a github link to the code so that we can compile and run from our own IPFS node to self verify code safety </p>',
              fn: () => {
		      this.play();
              }


            },



            bdj: {
              description: '<p style="color:hotpink;font-size:1.1em">** BackgroundBeachMediaPlayer! Play music in the background or with the screen off while you workout or do whatever! Resources can be video or audio, but only audio will play with the screen off. Playlists are being integrated into bplaya.</p>',
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




            vr: {
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



            mine: {
              description: '<p style="color:hotpink;font-size:1.1em">** Mine some TubmanX</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
			console.log("props is ");
			console.log(this.props);
                  let approval = this.props.mine();
                  approval.then((value) => {
                     approval = value;
		     terminal.pushToStdout(`Congrats! You just mined some crypto. \n  Type 'bal' to see your new balance! ${approval}`)
                     // expected output: "Success!"
                  });
                })

                return ''
              }
            },

            snapr: {
              description: '<p style="color:hotpink;font-size:1.1em">** Approve UPC Band Radio to spend 50 of your TubmanX.  You MUST run this command FIRST or all of your `snbuy` and `xsnbuy` commands will fail</p>',
              fn: () => {
                  const terminal = this.progressTerminal.current
                var progress = 0;
                this.setState({approved: false});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.approveNav();
                  approval.then((value) => {
		     terminal.pushToStdout(`You have approved UPC Band Radio to transfer sufficient TubmanX from your wallet when you buy an NFT.  This approval is good for 50 NFTs.  After you have bought 50, you must run this command again, or your 'buy' and 'xbuy' commands will fail`)
                     // expected output: "Success!"
                  });
                })

		terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                return ''
              }
            },


            xsnbuy: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Buy a SNB NFT without the GUI popup.  Usage: `xsnbuy <domain_name> <tld_integer={0,1,2}>` </p>',
              fn: (humanReadableName,domain) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.buyNftNav(this.state.account, humanReadableName,domain);
                      approval.then((value) => {
                         approval = value;
			 var congrats = "Thank you for your purchase! You now own SNB NFT for " + this.state.account;
                         terminal.pushToStdout(congrats)
			      
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
            snbuy: {
              description: '<p style="color:hotpink;font-size:1.1em">** Buy an SNB NFT using the GUI interface</p>',
              fn: (humanReadableName) => {
                  var buyForm =  <div>
		  <Barcode value={this.state.account} format="EAN13" />
                  <form className="mb-3" onSubmit={(event) => {
                      event.preventDefault()
                      let upcId = this.state.account
                      let humanReadableName = this.humanReadableName.value.toString()

                      this.props.buyNftNav(upcId,humanReadableName, this.state.domain)
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
                           <option value="0">.upc</option>
                           <option value="1">.afro</option>
                           <option value="2">.fire</option>
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
            },




            snmint: {
              description: '<p style="color:hotpink;font-size:1.1em">** Mint an SNB NFT for which you have successfully executed the `snbuy` or `xsnbuy` command</p>',
              fn: (upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.mintNftNav(this.state.account);
                      approval.then((value) => {
                         approval = value;
		         terminal.pushToStdout(`Congrats! You own UPCNFT for ${upcId}`)
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

          }}
        welcomeMessage={welcomeMsg}
        promptLabel={promptlabel}
        autoFocus={true}
        dangerMode={true}
	promptLabelStyle={{"color":"green", "fontWeight":"bold", "fontSize":"1.1em"}}
      />

      </div>
      </ReactCardFlip>

    )
  }
}
