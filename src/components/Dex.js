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
import { TikTok } from 'react-tiktok';


var Barcode = require('react-barcode');
var sha256 = require('js-sha256');




const commands = {
  echo: {
    description: '** Echo a passed string.',
    usage: 'echo <string>',
    fn: function () {
      return `${Array.from(arguments).join(' ')}`
    }
  }
}

export default class Dex extends Component {

  constructor(props) {
    super(props)
    this.progressTerminal = React.createRef()

	  
    this.state = {
       account: props.account,
       progress: 0,
       approved: '',
       vrLink: '',
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

  }

  printWelcomeMsg() {
     const terminal = this.progressTerminal.current
     terminal.clearStdout();
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


  render () {


    var tutorial = " <div style='color:black'> Type <i style='color:hotpink'>`help`</i> to see available commands \n  <a href='upc://000000000011'>[[000000000011]]</a> Type <i style='color:hotpink'>`swap`</i> to get some TubmanX\n <a href='upc://000000000012'>[[000000000012]]</a> Type <i style='color:hotpink'>`i`</i> to check the [[intel]] encoded into [["+ this.state.account+"]]  \n  <a href='upc://000000000013'>[[000000000013]]</a> Type <i style='color:hotpink'>`approve`</i> to approve 50 of your TubmanX to be spent. \n <a href='upc://000000000014'>[[000000000014]]</a> Type <i style='color:hotpink'>`hack`</i> to buy the UPC [[" + this.state.account + "]]" + "\n <a href='upc://000000000015'>[[000000000015]]</a> Type <i style='color:hotpink'>`own`</i> to mint if successful with hack [[" + this.state.account + "]]" + "\n  <a href='upc://000000000016'>[[000000000016]]</a> <i style='color:hotpink'>Type `flip` to sell renovated UPC unit [[" + this.state.account + "]]" + " </i> " +  "\n Type <i style='color:hotpink'>`x`</i> view the UNIQUE NFT Creature for this UPC" + " \n Type <i style='color:hotpink'>`clear`</i> to clear screen </div>";
    var promptlabel =  '[[ AWAITING COMMAND ]] => ';

          
	  var welcomeMsg = tutorial;



    return (
      <Terminal
        className={"dex"}
	style={{"backgroundColor":"#ae9d72e6","border":"3px","color":"black"}}
        dangerMode={false}
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

            usdc: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Approve UPC Band Radio to spend 50 of your TubmanX.  After you have spent 50, you must run approve again.    You MUST run this command FIRST or all of your `hack` and `own` commands will fail. Visit <a href="upc://000000000011">[[000000000011]]</a> to view a video tutorial on approve **</p>',
              fn: () => {
                  const terminal = this.progressTerminal.current
                var progress = 0;
                this.setState({approved: false});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.approveUSDC();
                  approval.then((value) => {
		     terminal.pushToStdout(`You have approved UPC Band Radio to transfer sufficient TubmanX from your wallet when you buy an NFT.  This approval is good for 50 NFTs.  After you have bought 50, you must run this command again, or your 'hack' and 'hackb' commands will fail`)
                     // expected output: "Success!"
                  });
                })

                         terminal.pushToStdout(`[[approve]]`);
		terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                         terminal.pushToStdout(`[[/approve]]`);
                return ''
              }
            },




            tubman: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Approve UPC Band Radio to spend 50 of your TubmanX.  After you have spent 50, you must run approve again.    You MUST run this command FIRST or all of your `hack` and `own` commands will fail. Visit <a href="upc://000000000011">[[000000000011]]</a> to view a video tutorial on approve **</p>',
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

                         terminal.pushToStdout(`[[approve]]`);
		terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                         terminal.pushToStdout(`[[/approve]]`);
                return ''
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


            mine: {
              description: '<p style="color:hotpink;font-size:1.1em">** Mine some TubmanX</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
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

          }}
        welcomeMessage={welcomeMsg}
        promptLabel={promptlabel}
        autoFocus={true}
        dangerMode={true}
	promptLabelStyle={{"color":"green", "fontWeight":"bold", "fontSize":"1.1em"}}
      />

    )
  }
}
