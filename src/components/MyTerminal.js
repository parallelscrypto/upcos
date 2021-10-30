import React, { Component } from 'react'
import Terminal from 'react-console-emulator'
import ScratchCard from './ScratchCard'
import IpfsUpload from './IpfsUpload'
import Modal from "react-animated-modal";
import Iframe from 'react-iframe';
import axios from "axios";
import 'react-dropdown/style.css';
import QRCode from "react-qr-code";
import Card from 'react-playing-card';
import ScratchOff from './ScratchOff';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import ReactPlayer from 'react-player'


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

export default class MyTerminal extends Component {

  constructor(props) {
    super(props)
    this.progressTerminal = React.createRef()
    this.state = {
       account: props.account,
       progress: 0,
       approved: '',
       vrLink: '',
       showModal: false,
       showModalBuy: false,
       showCardModal: false,
       showUploadModal: false,
       showProductModal: false,
       showProductContent: '',
       showModalTutorial: false,
       showQrModal: false,
       showBigShow: false,
       showBplayer: false,
       showMarketQrModal: false,
       buyModalContent: '',
       qrContent: '',
       marketQr: '0x5Cd036705fd68468a8dEFdBD812dfd30e467015B',
       progressBal: '',
       domain: '',
       card: '',
    }

    this.selectDomain = this.selectDomain.bind(this);
    this.prodLookup= this.prodLookup.bind(this);
    this.DisplayTime = this.DisplayTime.bind(this);
    this.getTimeZoneTimeObj= this.getTimeZoneTimeObj.bind(this);
  }



  componentDidMount = async () => {
    var self = this;
    setInterval(function() {
        return self.DisplayTime(-300);
     }, 1000);

    return this.DisplayTime(-300);
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

  render () {

    var addy = this.props.address;
    addy  = addy.substr(0,10);
    var promptlabel =  addy + '_@' + this.state.account + '>';
    var welcomeMsg = "Welcome to UPC Underground! \n TERMINAL#" + this.state.account  +"\n Type `help` to see available commands"
    var upcHash  = sha256(this.state.account)
    var srcImg = 'https://avatars.dicebear.com/api/adventurer/'  + upcHash + ".svg";
    var cardValue = {
       value:  upcHash,
       intent: "upcHero"
    }
    var cardValueStr = JSON.stringify(cardValue);
    var myCard = 
    <div>
	<p><b>Say hello to the hero of this UPC!</b></p>
        <p><img src={srcImg} height="200" width="200"/></p>
	<p><QRCode size={128} value={cardValueStr} onClick={() => { this.setState({qIsOpen: true})}}/></p>
    </div>
    var myProduct = <iframe srcDoc={this.state.showProductContent} style={{height:"90vh", width:"90vw"}}> </iframe>


    var myUpload = <IpfsUpload /> 



    return (
      <div>
      <div id="curTime"></div>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showModal} closemodal={() => this.setState({ showModal: false })} type="pulse" >{this.state.vrLink}</Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showModalBuy} closemodal={() => this.setState({ showModalBuy: false })} type="pulse" > {this.state.buyModalContent}</Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showModalTutorial} closemodal={() => this.setState({ showModalTutorial: false })} type="pulse" ><iframe style={{height:"100vh"}} src="https://gateway.pinata.cloud/ipfs/QmStW8PBZjxjSkwnxvr15rHvRajCUkPRMEJGQejQu8EE4W" /></Modal>

      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showBigShow} closemodal={() => this.setState({ showBigShow: false })} type="pulse" ><iframe style={{height:"95vh", width:"95vw"}} src={this.state.fullIpfs} /></Modal>

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
      <Terminal
        style={{"minHeight":"75vh",backgroundColor: "#000"}}
        dangerMode={false}
        ref={this.progressTerminal}
        commands={{

            swap: {
		    description: '<p style="color:hotpink;font-size:1.1em">** IntelX is the token used to write [[intel]] to UPC codes.  In order to acquire IntelX, you must run the `swap` command. This will `swap` MATIC that you have purchased likely from an exchange for IntelX from our Decentralized Mint.  No KYC or middleman required.  Specify the amount of IntelX that you would like to exchange for the MATIC in your wallet in wei.  This will trigger a transaction that will mint equiv. IntelX for MATIC 1:1.  Example: to buy 5 IntelX type `swap 5000000000000000000`. In other words, this would send 5 MATIC from your wallet for 5 IntelX from the IntelX mint.  Visit <a href="upc://000000000010">[[000000000010]]</a> to view a video tutorial on swap</p>',
              fn: (amount) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.swap(amount);
                  approval.then((value) => {
                     approval = value;
                         terminal.pushToStdout(`[[swap]]`);
		     terminal.pushToStdout(`You have just swapped MATIC for IntelX.  Check your Activity tab below to track the transaction. \n  Type 'bal' to see your new balance! Balances can sometimes take minutes to update.  THANK YOU! ${approval}`)
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

            step0: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Approve the Underground to spend 50 of your IntelX.  After you have spent 50, you must run step0 again.    You MUST run this command FIRST or all of your `step1` and `step2` commands will fail. Visit <a href="upc://000000000011">[[000000000011]]</a> to view a video tutorial on step0**</p>',
              fn: () => {
                  const terminal = this.progressTerminal.current
                var progress = 0;
                this.setState({approved: false});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.approve();
                  approval.then((value) => {
		     terminal.pushToStdout(`You have approved the Underground to transfer sufficient IntelX from your wallet when you buy an NFT.  This approval is good for 50 NFTs.  After you have bought 50, you must run this command again, or your 'step1' and 'step1b' commands will fail`)
                     // expected output: "Success!"
                  });
                })

                         terminal.pushToStdout(`[[step0]]`);
		terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                         terminal.pushToStdout(`[[/step0]]`);
                return ''
              }
            },
            step1: {
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
                           <option value="0">.upc</option>
                           <option value="1">.afro</option>
                           <option value="2">.nunya</option>
                           <option value="3">.barefoot</option>
                           <option value="4">.peace</option>
                           <option value="5">.verify</option>
                           <option value="6">.rivalry</option>
                           <option value="7">.prediction</option>
                           <option value="8">.mp3</option>
                           <option value="9">.mp4</option>
                           <option value="19">.txt</option>
                           <option value="11">.playlist</option>
                           <option value="12">.app</option>
                           <option value="13">.alexi</option>
                           <option value="14">.profile</option>
                           <option value="15">.ozzie</option>
                           <option value="16">.strutt</option>
                           <option value="17">.monkian</option>
                           <option value="18">.underground-dictionary</option>
                           <option value="19">.fire</option>
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




            step1b: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Buy a UPC NFT without the GUI popup.  Example: If you are currently scanned into UPC #222222222222 and you would like to buy the domain `foo.fire`, you would type the following `step1b foo 2`.  The `2` after `foo` corresponds to the domain ending that you are purchasing.  The choices are 0=.upc, 1=.afro, 2=.fire  **</p>',
              fn: (humanReadableName,domain) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.buyNft(this.state.account, humanReadableName,domain);
                      approval.then((value) => {
                         approval = value;
			 var congrats = "Thank you for your purchase! You now own NFT for " + this.state.account;
                         terminal.pushToStdout(`[[step1b]]`);
                         terminal.pushToStdout(congrats)
                         terminal.pushToStdout(`[[/step1b]]`);
			      
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

            step2: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Mint an NFT for which you have successfully executed the `step1` or `step1b` command</p>',
              fn: (upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.mintNft(this.state.account);
                      approval.then((value) => {
                         approval = value;
                         terminal.pushToStdout(`[[step2]]`);
		         terminal.pushToStdout(`Congrats! You own UPCNFT for ${upcId}`)
                         terminal.pushToStdout(`[[/step2]]`);
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
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
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
			 var i = 0;
			 for(i = 0; i < latest; i++) {

                            let info = this.props.getSaleInfo(i)

                             .then((data) => {
				  if(data['tokenId'] > 0) {
                                     terminal.pushToStdout(`\n`);
                                     terminal.pushToStdout(`*********** ${data['tokenId']} ***********`);
                                     terminal.pushToStdout(`[[market-data]]`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`contract: ${data['nftContract']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`bidding_complete: ${data['bidIsComplete']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`seller: ${data['seller']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`winning_bidder: ${data['winningBidder']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`token_id: ${data['tokenId']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`asking_price (wei): ${data['price']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`in_progress: ${data['inProgress']}`);
                                     terminal.pushToStdout(`=====`);
                                     terminal.pushToStdout(`fee (or 2%): ${data['fee']}`);
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
                         terminal.pushToStdout(`Congratulations.  You have put in a buy order for nft ${nftId} at price of ${price} MATIC.  Check activity tab for details on your order`);
                         terminal.pushToStdout(`[[/mbuy]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            smp: {
              description: '<p style="color:hotpink;font-size:1.1em">** Set market price for an NFT that you have sent to the market.  By default when you send an NFT to the market, the price is 1 MATIC.  The sale will not start until you run this command and set the price in GWEI **</p>',
              fn: (nftId, price) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.setMarketPrice(nftId, price);
                      bal.then((value) => {
                         theBal =window.web3.utils.fromWei(value, "ether");
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
              description: '<p style="color:hotpink;font-size:1.1em">** Display your IntelX balance **</p>',
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
                         terminal.pushToStdout(`[[intelx-balance]]`);
                      this.setState({ progress: this.state.progress + 10 }, () => terminal.pushToStdout(`Balance: ${theBal}` + " IntelX"))
                         terminal.pushToStdout(`[[/intelx-balance]]`);
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
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.pbal(this.state.account);
                      bal.then((value) => {
                         theBal =window.web3.utils.fromWei(value, "ether");
                         terminal.pushToStdout(`[[angel-balance]]`);
                         terminal.pushToStdout(`angel_balance: ${theBal} MATIC`);
                         terminal.pushToStdout(`[[/angel-balance]]`);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },


            angel: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Be a guardian angel by injecting MATIC into a UPC. Example: Type `angel 777777777777 1000000000000000000` to inject 1 MATIC into upc terminal# 777777777777. Whoever owns the NFT for the UPC (terminal) can then withdraw it with the `tyvm` command</p>',
              fn: (upcId, amount) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.pigin(upcId, amount);
                      bal.then((amount, value) => {
                         terminal.pushToStdout(`Thank you for being an Underground Angel! Type ab to see your angel balance`);
                         // expected output: "Success!"
                      });
                })

                return ''
              }
            },

            tyvm: {
              description: '<p style="color:hotpink;font-size:1.1em">** Say Thank YOU! and Withdraw all MATIC from a UPC if you own the NFT for the UPC</p>',
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
                        terminal.pushToStdout(`[[market-data]]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`contract: ${data['nftContract']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`bidding_complete: ${data['bidIsComplete']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`seller: ${data['seller']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`winning_bidder: ${data['winningBidder']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`token_id: ${data['tokenId']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`price: ${data['price']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`in_progress: ${data['inProgress']}`);
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
                        terminal.pushToStdout(`tld: ${data['tld']}`);
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
                        terminal.pushToStdout(`ipfs: ${data['ipfs']}`);
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

			var tmpStamp = parseInt(data['latestTimestamp']);
                        var newDate = new Date(tmpStamp * 1000);

			var tmpStamp = parseInt(data['createdTimestamp']);
                        var created = new Date(tmpStamp * 1000);

                        terminal.pushToStdout(`[[xintel]]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`og_owner: ${data['og']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`owner: ${data['staker']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`human_readable_name: ${data['humanReadableName']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`tld: ${data['tld']}`);
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
                        terminal.pushToStdout(`ipfs: ${data['ipfs']}`);
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

            srch: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display intel regarding the current UPC given the UPC. Example `srch 078742254609` will return intel for upc 078742254609</p>',
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

                        terminal.pushToStdout(`[[intel]]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`og_owner: ${data['og']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`owner: ${data['staker']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`human_readable_name: ${data['humanReadableName']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`tld: ${data['tld']}`);
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
                        terminal.pushToStdout(`ipfs: ${data['ipfs']}`);
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

                        terminal.pushToStdout(`[[intel]]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`og_owner: ${data['og']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`owner: ${data['staker']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`human_readable_name: ${data['humanReadableName']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`tld: ${data['tld']}`);
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
                        terminal.pushToStdout(`ipfs: ${data['ipfs']}`);
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

                        terminal.pushToStdout(`[[intel]]`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`og_owner: ${data['og']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`owner: ${data['staker']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`human_readable_name: ${data['humanReadableName']}`);
                        terminal.pushToStdout(`=====`);
                        terminal.pushToStdout(`tld: ${data['tld']}`);
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
                        terminal.pushToStdout(`ipfs: ${data['ipfs']}`);
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




            mqr: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display QR code for the MARKETPLACE</p>',
              fn: () => {
                      this.setState({showMarketQrModal:true});
              }
            },

            qr: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display QR for X-Referenced upcId</p>',
              fn: () => {
                      this.setState({showQrModal:true});
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
           
            hero: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display hero for this UPC</p>',
              fn: () => {
                      this.setState({showCardModal:true});
              }
            },
            ezgo: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display cringey video.  Updated regularly</p>',
              fn: () => {
                      this.setState({showModalTutorial:true});
              }
            },
            ezcome: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display funny video.  Updated regularly</p>',
              fn: () => {
                      this.setState({showModalTutorial:true});
              }
            },


            xipfs: {
              description: '<p style="color:hotpink;font-size:1.1em">** Set your IPFS resource by passing the ipfs/hash value.  Example `xipfs ipfs/QmXyNMhV8bQFp6wzoVpkz3NqDi7Fj72Deg7KphAuew3RYU` will set your IPFS resource to our welcome page.  The public will use the `ipfs` command to view what you set using this command </p>' ,
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

            xvr: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Set your VR resource by passing the ipfs/hash value.  Example `xvr https://link.to.your.vr`` will set your vr resource so that when the public scans this upc and types `vr` they will see `https://link.to.your.vr`.  This does not have to be a vr link, it can be a regular website if you choose</p>' ,
              description: '<p style="color:hotpink;font-size:1.1em">** Displays a progress counter.</p>',
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


            playa: {
              description: '<p style="color:hotpink;font-size:1.1em">** BeachMediaPlayer! Loads the media player and plays the IPFS resource attached to this UPC.  Resources can be video, audio or even an app!  If it is an app, it is community practice to post a github link to the code so that we can compile and run from our own IPFS node to self verify code safety </p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
		  var self = this;
                  let info = this.props.upcInfo(this.state.account)
		   .then(data => {
			var fullIpfs = "https://upcunderground.mypinata.cloud/" + data['ipfs'];
			if(fullIpfs.includes('QmXyNMhV8bQFp6wzoVpkz3NqDi7Fj72Deg7KphAuew3RYU') ) {

			   fullIpfs = fullIpfs.replace('upcunderground.mypinata.cloud','ipfs.io');
			}

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


            iplaya: {
              description: '<p style="color:hotpink;font-size:1.1em">** RawBeachMediaPlayer! Loads the media player and plays the RAW IPFS resource attached to this UPC. Raw resources can include IPNS resources.  Just run iplaya /ipfs/##hash##` or `iplaya /ipns/##hash##` and load those raw resouces.  Resources can be video, audio or even an app!  If it is an app, it is community practice to post a github link to the code so that we can compile and run from our own IPFS node to self verify code safety </p>',
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




            jplaya: {
              description: '<p style="color:hotpink;font-size:1.1em">** CrossBeachMediaPlayer! Runs an X-Reference and reads the data from the [[nftId]] passed in.  Next the XBMP loads and plays the IPFS resource attached to XRd UPC.  Resources can be video, audio or even an app!  If it is an app, it is community practice to post a github link to the code so that we can compile and run from our own IPFS node to self verify code safety  </p>',
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



            bplaya: {
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





            xplaya: {
              description: '<p style="color:hotpink;font-size:1.1em">** CrossBeachMediaPlayer! Runs an X-Reference and reads the data from the [[upcId]] passed in.  Next the XBMP loads and plays the IPFS resource attached to XRd UPC.  Resources can be video, audio or even an app!  If it is an app, it is community practice to post a github link to the code so that we can compile and run from our own IPFS node to self verify code safety  </p>',
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




            vr: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display UPC vr resource</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
		  var self = this;
                  let info = this.props.upcInfo(this.state.account)
		   .then(data => {
			var link = <a href={data['vr']} >View my VR Experience!</a>
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




            wn: {
              description: '',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.wn();
                  approval.then((value) => {
                     approval = value;
		     terminal.pushToStdout(`Withdrawal from NFT initiated if authorized.  Check activity tab to monitor transaction`)
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





            wm: {
              description: '',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.wm();
                  approval.then((value) => {
                     approval = value;
		     terminal.pushToStdout(`Withdrawal from MINES initiated if authorized.  Check activity tab to monitor transaction`)
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






            wa: {
              description: '',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.wa();
                  approval.then((value) => {
                     approval = value;
		     terminal.pushToStdout(`Withdrawal from NFT and MINRS initiated if authorized.  Check activity tab to monitor transaction`)
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




            ipfs411: {
              description: '<p style="color:hotpink;font-size:1.1em">** Learn commands that you can type to access different crypto related services via IPFS</p>',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
		     terminal.pushToStdout(`type 'iplaya ipns/app.ens.eth'  ===TO GO TO==  ENS App`);
		     terminal.pushToStdout(`type 'iplaya ipns/app.uniswap.org'  ===TO GO TO== Uniswap App `);
		     terminal.pushToStdout(`type 'iplaya ipns/elasticdao.org'  ===TO GO TO== ElasticDAO `);
		     terminal.pushToStdout(`type 'iplaya ipns/gnosis-auction.eth'  ===TO GO TO== gnosis-auction.eth `);
		     terminal.pushToStdout(`type 'iplaya ipns/olympusdao.eth'  ===TO GO TO== Olympus DAO `);
		     terminal.pushToStdout(`type 'iplaya ipns/powerindex.io'  ===TO GO TO== PowerIndex `);
		     terminal.pushToStdout(`type 'iplaya ipns/rekt.eth'  ===TO GO TO== Rekt `);
		     terminal.pushToStdout(`type 'iplaya ipns/sourcify.eth'  ===TO GO TO== Sourcify `);
		     terminal.pushToStdout(`type 'iplaya ipns/tornado.cash'  ===TO GO TO== Tornado Cash `);
		     terminal.pushToStdout(`type 'iplaya ipns/zkeducation.eth'  ===TO GO TO== Zero Knowledge Education `);
                })

                return ''
              }
            },



            mine: {
              description: '<p style="color:hotpink;font-size:1.1em">** Mine some IntelX</p>',
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
              description: '<p style="color:hotpink;font-size:1.1em">** Approve the Underground to spend 50 of your IntelX.  You MUST run this command FIRST or all of your `snbuy` and `xsnbuy` commands will fail</p>',
              fn: () => {
                  const terminal = this.progressTerminal.current
                var progress = 0;
                this.setState({approved: false});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.approveNav();
                  approval.then((value) => {
		     terminal.pushToStdout(`You have approved the Underground to transfer sufficient IntelX from your wallet when you buy an NFT.  This approval is good for 50 NFTs.  After you have bought 50, you must run this command again, or your 'buy' and 'xbuy' commands will fail`)
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
    )
  }
}
