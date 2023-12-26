import React, { Component } from 'react'
import axios from "axios";
import Modal from "react-animated-modal";
import makeCarousel from 'react-reveal/makeCarousel';
import TrebleCleffExp from './TrebleCleffExp'
import BassCleff from './BassCleff'
import ReactCardFlip from 'react-card-flip';
import Terminal from 'react-console-emulator'
import UPCScriptGenerator from './UPCScriptGenerator'
// we'll need the Slide component for sliding animations
// but you can use any other effect
import Slide from 'react-reveal/Slide';
import Flip from 'react-reveal/Flip';
import Zoom from 'react-reveal/Zoom';
// we'll use styled components for this tutorial
// but you can use any other styling options ( like plain old css )
import styled, { css } from 'styled-components';
import ReactPlayer from 'react-player'
import { TikTok } from 'react-tiktok';
import Draggable from 'react-draggable';



var sha256 = require('js-sha256');
var Barcode = require('react-barcode');
const width = '100%', height='75vh';
const Container = styled.div`
  border: 1px dashed red;
  position: relative;
  overflow: hidden;
  text-align: center;
  width: ${width};
`;
const Children  = styled.div`
  width: ${width};
  position: relative;
  height: ${height};
`;
const Arrow = styled.div`
  text-shadow: 1px 1px 1px #fff;
  z-index: 100;
  line-height: ${height};
  text-align: center;
  position: absolute;
  top: 0;
  width: 10%;
  font-size: 3em;
  cursor: pointer;
  user-select: none;
  ${props => props.right ? css`left: 90%;` : css`left: 0%;`}
`;
const Dot = styled.span`
  font-size: 1.5em;
  cursor: pointer;
  text-shadow: 1px 1px 1px #fff;
  user-select: none;
`;
const Dots = styled.span`
  text-align: center;
  width: ${width};
  z-index: 100;
`;
const CarouselUI = ({ position, total, handleClick, children }) => (
  <Container>
    <Children>
      {children}
      <Arrow onClick={handleClick} data-position={position - 1}>{'<'}</Arrow>
      <Arrow right onClick={handleClick} data-position={position + 1}>{'>'}</Arrow>
    </Children>
    <Dots>
      {Array(...Array(total)).map( (val, index) =>
        <Dot key={index} onClick={handleClick} data-position={index}>
          {index === position ? '● ' : '○ ' }
        </Dot>
      )}
    </Dots>
  </Container>
);
const Carousel = makeCarousel(CarouselUI);



export default class StaticCarouselExp extends Component {



  constructor(props) {
    super(props);
    var channel = props.upcId;
    var upc = props.code;
    var missionUrl = atob(props.missionUrl);
    var manifest= props.manifest;
    var msg = atob(props.msg);



    var scan;
    scan = atob(manifest);

    console.log("MMMMMMMMMSSSSSSSSSSSSSSSAGGGGGGGGGGGGG");
    scan = scan.split(',');
    console.log(scan);

    var owner = scan[1];
    console.log(owner);
    this.progressTerminal = React.createRef()
    var promptlabel =  '[[ AWAITING COMMAND@ ]] => ';
    var welcomeMsg ="\n[[ \n you are now on upcOS privately owned property owned by \n " + owner + "\n on {polygon} \n";
    welcomeMsg += "\n MSG from @_" + upc + " => \n " +  msg + "\n]]";
    
    var myTerm = <Terminal
      style={{"minHeight":"75vh",backgroundColor: "#000",zIndex:"99"}}
      ref={this.progressTerminal}
      commands={{

            fire: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open firepad.io collab suite in a window & sheeit  (no affiliation) </p>',
              fn: (sheetNum) => {


                      if (Number.isInteger(sheetNum) && sheetNum < 0) {
                         sheetNum = 0;
                      }

                      var upcHash  = sha256(upc)
                      for(var i=0; i<sheetNum; i++) {
                          upcHash = sha256(upcHash);
                      } 


		      var fullUrl = "https://demo.firepad.io/#" + upcHash;
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },

            draw: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open sketchpad in a window  (no affiliation to any unless explicitly stated) </p>',
              fn: (sheetNum) => {


		      var fullUrl = "https://sketch.io/sketchpad";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },


            beats: {
		    description: '<p style="color:hotpink;font-size:1.1em">** get free beats for your rhymes (no affiliation) </p>',
              fn: (sheetNum) => {


		      var fullUrl = "https://freebeats.io";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },


            vc: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open voicechanger in a window  (no affiliation) </p>',
              fn: (sheetNum) => {


		      var fullUrl = "https://voicechanger.io";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },


            speak: {
		    description: '<p style="color:hotpink;font-size:1.1em">** use this command for text to speech tts tool (no affiliation)  </p>',
              fn: (sheetNum) => {


		      var fullUrl = "https://ttstool.com";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },







            gif: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open wick suite in a window  (no affiliation) </p>',
              fn: (sheetNum) => {


		      var fullUrl = "https://wickeditor.com/editor";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },



            nostr : {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open firepad.io collab suite in a window & sheeit  (no affiliation) </p>',
              fn: (sheetNum) => {


		      var fullUrl = "https://coracle.social";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },



            ai: {
		    description: '<p style="color:hotpink;font-size:1.1em">** open a window powered by deepai.org (no affiliation) </p>',
              fn: () => {

		      var fullUrl = "https://deepai.org/chat";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },



            unseal: {
		    description: '<p style="color:hotpink;font-size:1.1em">** unseal a sha256 sealed upcOS experience</p>',
              fn: () => {

		      var fullUrl = "https://yfp7xiovzzkpcy2rgizdrgs57wij4xq2xpt545ywbdjlgsjesdkq.arweave.net/wV_7odXOVPFjUTIyOJpd_ZCeXhq75953FgjSs0kkkNU";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },





            core: {
		    description: '<p style="color:hotpink;font-size:1.1em">** download core upcos zip file from 12-23-2023 </p>',
              fn: () => {

		      var fullUrl = "https://gtixptuq3s5k35cek7h34monodq3bu2y4fbssb6mqqsmbzhsw7sq.arweave.net/NNF3zpDcuq30RFfPvjHNcOGw01jhQykHzIQkwOTyt-U/upcos-flipitup.zip";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },




            tio: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open tio.run collab suite in a window & sheeit  (no affiliation) </p>',
              fn: (sheetNum) => {


                      if (Number.isInteger(sheetNum) && sheetNum < 0) {
                         sheetNum = 0;
                      }

                      var upcHash  = sha256(upc)
                      for(var i=0; i<sheetNum; i++) {
                          upcHash = sha256(upcHash);
                      } 


		      var fullUrl = "https://tio.run";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },





            blank: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open blank html viewer in a window< (no affiliation) /p>',
              fn: (sheetNum) => {


		      var fullUrl = "https://goonlinetools.com/html-viewer/";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },



            batch: {
		    description: '<p style="color:hotpink;font-size:1.1em">** create a UPCScript for a batch of url/resources from a UI.  replace the ss with {dj} to use as a player, or {x} to create slideshow from the resulting string </p>',
              fn: () => {


                      var winNum = 0;
                      var mplayer = <UPCScriptGenerator />

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


            book: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open librivox in draggable interface (no affiliation) </p>',
              fn: (bookUrl) => {

                          if(!bookUrl) {
                             bookUrl = 'https://librivox.org';
                          }
                          var mplayer = <iframe className='video'
                                  style={{height:"80vh",width:"96vw"}}
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


            com: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open chat client window in draggable interface (no affiliation) </p>',
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


            upcms : {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open chat client window in draggable interface  </p>',
              fn: (fullUrl,winNum) => {

                      fullUrl = "https://pitrgclmhs7vogwhp5twz44y4p4jswq2dmihll2navrv5adfg4wq.arweave.net/eicTCWw8v1cax39nbPOY4_iZWhobEHWvTQVjXoBlNy0/index.html#/upload/" + upc;
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


            url: {
              description: '<p style="color:hotpink;font-size:1.1em">** create a shortened url from a given url.  takes in one param, and use as such: `url https://sample.website` , and this will return a shortened url**</p>',

              fn: async (currentUrl, slug) => {


                const terminal = this.progressTerminal.current

                var toShorten = "https://is.gd/create.php?format=json&url="+currentUrl;
                //currentUrl= currentUrl.replace('http://localhost:3000', 'https://flipitup.cc');  //remember to comment out.  need to uncomment to get shortened test url when using localhost

                console.log("SHORTTTTTTTTTening");
                console.log(currentUrl);

                const response = await axios.get(toShorten, {
                      params: {
                        format: 'json',
                        shorturl: slug,
                        url: currentUrl
                      }
                    })


                console.log(response);


                var shortUrl = response.data.shorturl;
                terminal.pushToStdout(`Visit ` + this.state.account + ` in a browser ` + shortUrl);
                var shortLink = <a href={shortUrl}>Go Now! </a>
                terminal.pushToStdout(shortLink);

              }
            },






            411: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display product information for UPC from go upc  (no affiliation)  </p>',
              fn: (upc) => {
                      const terminal = this.progressTerminal.current
                      terminal.pushToStdout(`Please wait... searching for data on upc # ${upc}`);
                      this.prodLookup(upc);
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






            x: {
		    description: '<p style="color:hotpink;font-size:1.1em">** execute arbitrary upcscript starting with >>> characters delimited by > characters </p>',
                    fn: async (upcscript) => {
                      if(!upcscript) {
                         upcscript = this.state.upcscript;
                      }

                      var mplayer = await this.executeUpcScript(upcscript);
		       //terminal.pushToStdout(`[[band-topic]]`);
		       //terminal.pushToStdout(`<u style="color:orange;font-size:1em">band: </u> ${band}`);
		       //terminal.pushToStdout(`<u style="color:orange;font-size:1em">topic: </u> ${topic['topicId']}`);
		       //terminal.pushToStdout(`<u style="color:orange;font-size:1em">topic: </u> ${topic['name']}`);
		       //terminal.pushToStdout(`[[/band-topic]]`);

                    }
            },





            wurdup: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open codeverter.com window  (no affiliation) </p>',
              fn: () => {



		      var fullUrl = "https://codverter.com/src/index";
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },


            sheeit: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open ethercalc collab suite in a window & sheeit  (no affiliation) </p>',
              fn: (sheetNum) => {


                      if (Number.isInteger(sheetNum) && sheetNum < 0) {
                         sheetNum = 0;
                      }

                      var upcHash  = sha256(upc)
                      for(var i=0; i<sheetNum; i++) {
                          upcHash = sha256(upcHash);
                      } 


		      var fullUrl = "https://ethercalc.net/" + upcHash;
                      var winNum = "0";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      var mplayer = this.getMplayer(fullUrl);
                      if(winNum == "0") {
		         this.setState(prevState => ({ pipVisibility: "true" }));
		         this.setState(prevState => ({ pipDisplay: "block"}));
                         this.setState({fullIpfs: mplayer});
		         this.setState(prevState => ({ showBigShow: true}));
                      }
              }
            },




            dj: {
              description: '<p style="color:hotpink;font-size:1.1em">**  instantiate the dj upc to perform a substring extraction, and play spinz for all of the resulting videos in succession</p>',
              fn: (upcScript) => {
		      this.djupc(upcScript);
              }


            },







          search: {
      	    description: '<p style="color:hotpink;font-size:1.1em">** Search upcs for content.  Fields searched are owner, human readable name, vr, and ipfs.  No spaces in the search term, use dashes or underscores depending on how the owner named the file/human readable name**</p>',
            fn: (humanReadableName) => {
      	      this.search()
            }
          },
        }}
      welcomeMessage={welcomeMsg}
      promptLabel={promptlabel}
      dangerMode={true}
      autoFocus={true}
      promptLabelStyle={{"color":"green", "fontWeight":"bold", "fontSize":"1.1em"}}
    />


    var devIframe = 
        <iframe className='video'
                style={{minHeight:"100vh",width:"100vw"}}
                title='Youtube player'
                sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                src={`https://is.gd/upcos_ai_02`}>
        </iframe>



    this.state = {
       pipVisibility: "false",
       pipDisplay: "none",
       mplayer: ""
    }





    this.state = {
       code: upc,
       channel: channel,
       manifest: manifest,
       missionUrl: missionUrl,
       slides: [],
       res: [],
       terminal: myTerm,
       terminalSwitch: devIframe,
       pipVisibility: "false",
       pipDisplay: "none"
    }







    this.loadOne= this.loadOne.bind(this);
    this.getMplayer= this.getMplayer.bind(this);
    this.showTerminal= this.showTerminal.bind(this);
    this.handleFlip= this.handleFlip.bind(this);
    this.getLink= this.getLink.bind(this);
  }


  handleFlip(e) {
    e.preventDefault();
    this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
    var mplayer;
    if(this.state.isFlipped) {
       //this.firstLookup(this.state.account);
    }   
    else {
       mplayer = ""; 
    }   

    //const terminal = this.progressTerminal.current
    //terminal.clearStdout();
    this.setState({offerState: 'video'});
    this.setState(prevState => ({ player: mplayer }));
  }

  getMplayer = (fullUrl) => {
      var mplayer = <iframe className='video'
              style={{height:"100vh",width:"96vw"}}
	      allow="camera; microphone"
              title='2 upc dj player'
              sandbox='allow-downloads allow-fullscreen allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
              src={fullUrl} allowfullscreen>
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
                 sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-fullscreen allow-popups allow-scripts allow-presentation'
                 src={`https://youtube.com/embed/${youtubeID}?autoplay=0`} allowfullscreen>
         </iframe>
      }

      else if(!fullUrl.includes('yout') && !fullUrl.includes('facebook') 
         && !fullUrl.includes('soundcloud') && !fullUrl.includes('vimeo') 
         && !fullUrl.includes('whistia') && !fullUrl.includes('mixcloud') 
         && !fullUrl.includes('dailymotion') && !fullUrl.includes('twitch')) {
            mplayer = <iframe className='video'
                    style={{height:"100vh",width:"96vw"}}
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



  showLoad= async () => {

  var vr = "https://64szxopgvre624553cuefbq3w5vy7hg7osihtrps4qoditqwzq6a.arweave.net/9yWbueasSe1zvdioQoYbt2uPnN90kHnF8uQcNE4WzDw";

               var loader =
                           <div>
                               <iframe className='video'
                                       style={{minHeight:"80vh",width:"90vw"}}
                                       allow='camera;microphone'
                                       title='upcOS-init'
                                       sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                                       src={vr}>
                               </iframe>
                            </div>
 

	        this.setState({slides: loader})
  }


  showSearch= async () => {

  var vr = "https://kbin.social/m/upcscript";

               var loader =
                           <div>
                               <iframe className='video'
                                       style={{minHeight:"80vh",width:"90vw"}}
                                       allow='camera;microphone'
                                       title='upcOS-init'
                                       sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                                       src={vr}>
                               </iframe>
                            </div>
 

	        this.setState({slides: loader})
  }


  showMission= async () => {

  var vr = this.state.missionUrl;

               var loader =
                           <div>
                               <iframe className='video'
                                       style={{minHeight:"80vh",width:"90vw"}}
                                       allow='camera;microphone'
                                       title='upcOS-init'
                                       sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                                       src={vr}>
                               </iframe>
                            </div>
 

	        this.setState({slides: loader})
  }




  prodLookup= async (upc) => {

      var fullUrl = "https://go-upc.com/search?q=" + upc;
      var winNum = "0";
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



  executeUpcScript= async (upcScript) => {

    var info = [];

    this.setState({slides: []})
    this.setState({fullIpfs: []})
    this.setState({res: []})




    var upcscript = upcScript.split('>');
    for(var i = 0; i < upcscript.length; i++) {
       if(!upcscript[i]) continue;
       var vidSnippet;
       var vid;

       var tmpId = upcscript[i];
       info[i] = { 
          order: i,
          data: upcscript[i]
       }

       console.log(info[i]);
       //keep ss string clean.


       var stagePiece = upcscript[i];
       var containsLinkType = stagePiece.includes('[') && stagePiece.includes('|') && stagePiece.includes(']');
       var loadYt = false;
       var loadHtml = false;
       if( stagePiece.includes('https:') ) {
            loadHtml = true;
       }

       if( stagePiece.includes('yout') ) {
        console.log("LINKKKKKKK2");
            loadYt = true;
       }

       if (loadHtml && !containsLinkType && !loadYt) {
          var entry = await this.getHTML(upcscript[i]); 
       } else if (containsLinkType) {
        console.log("LINKKKKKKK3");
        var entry = this.getLink(upcscript[i]);
       }
       else if(tmpId.length == 11) {
        console.log("LINKKKKKKK4");
          var entry = await this.getYt(tmpId); 
       }
       else if(loadYt) {

        console.log("LINKKKKKKK5");
          var entry = await this.getYt(tmpId); 
          //this class can not connect to web3, so it is up to the calling code to decode the nftId's content and pass that raw to this function
          //var entry = await this.getNft(i,upcscript); 
       }
       else{
        console.log("EEEEEEEELLLLLLLLSSSSSSSSSSEEEEEEEEE");
          var entry = await this.getHTML(upcscript[i]); 
       }
    }


    var newshow = 
    <Carousel maxTurns={'0'}>
      {this.state.slides}
    </Carousel>
 
    this.setState({ fullIpfs: newshow});
    this.setState(prevState => ({ pipDisplay: true}));
    this.setState(prevState => ({ pipVisibility: true}));











  }





  showHome= async () => {

	        this.setState({slides: this.state.res})
  }





  showTerminal = async () => {
	        this.setState({terminalSwitch: this.state.terminal})
  }




  getYt = async (tmpId) => {
                var res;
                var oneVid = await this.loadOne(7777777,tmpId);
	        res = this.state.slides;
	        res.push(oneVid)
	        this.setState({slides: res})
	        this.setState({res: res})

  }


  getNft = async (i, nftIds) => {
                let infoOwned = await this.props.nftInfo(nftIds[i])
                let vid = infoOwned['vr'];
                var id  = infoOwned['tokenId'];
                var oneVid = await this.loadOne(id,vid);
		var res = this.state.slides;
		res.push(oneVid)
		this.setState({slides: res})
		this.setState({res: res})
   }


  getHTML = async (vr) => {
                //arbitrary url video

                var mplayer = "";
		var res = this.state.slides;

                if(vr.includes('https:') ) {
                   const fullUrl = vr
                   mplayer =
                           <div>
                               <iframe className='video'
                                       style={{minHeight:"80vh",width:"90vw"}}
                                       allow='camera;microphone'
                                       title='upcOS-init'
                                       sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                                       src={vr}>
                               </iframe>
                            </div>
                }


                var toPush = <Zoom right> {mplayer} </Zoom>
		if(res) {

                   res.push(toPush)
                }
		this.setState({slides: res})
		this.setState({res: res})
   }

  djupc = async (upcScript) => {
            var self = this;
            const terminal = this.progressTerminal.current
            var mplayer;

                        //var skring = '>>>https://www.youtube.com/shorts/UPI4drHniys>https://youtu.be/ISajeWJ3Cts>wnQxbXA_T4I>https://google.com>thistest';
                        var pieces = upcScript.split('>');
                        var result = [];

                        for(var i=0; i< pieces.length; i++) {
                           var piece = pieces[i];
		           if(piece.includes('yout')) {
                              result.push(piece);
                           }
                           else if(piece.length ==11) {
                              var fullUrl = "https://youtu.be/" + piece;
                              result.push(fullUrl);
                           }
                           else {
                              result.push(piece);
                           }

                        }
                        terminal.pushToStdout(`will parse stage ${upcScript}`);
mplayer = <ReactPlayer
  url={result}
/>
 	   self.setState(prevState => ({ fullIpfs: mplayer }));
	   self.setState(prevState => ({ pipVisibility: !prevState.pipVisibility }));
	   self.setState(prevState => ({ pipDisplay: !prevState.pipDisplay}));
  }





  componentDidMount = async () => {

    var scan;
    scan = atob(this.state.manifest);

    scan = scan.split(',');
    var res;
    var ipfs   = this.props.show;
    console.log("manifest is " + scan );
    
    if (!ipfs.includes(">>>")) {
       ipfs = ">>>" + ipfs;
    }

    var info = [];
    const containsGreaterThan = ipfs.includes('>');

    var nftIds;

    if(containsGreaterThan) {
       nftIds = ipfs.split(">");
    }
    else {
       nftIds = ipfs.split("#");
    }
    var splash = 
             <Modal style={{"background":'##86a865',"height":"50vh","alignItems":"normal", "display":"table-cell", "textAlign":"center"}} visible={'true'} closemodal={(e) => {this.setState({ showModalSplash: false }); }} type="lightSpeedIn" >
                <div style={{background:"#451206", verticalAlign:"middle", textAlign:"center" }}> 
                  <div>
                    <Zoom left> <i  style={{color:"red"}}>Now Playing:</i></Zoom>
                    <br/>
                    <Zoom left> <b>Raw Material Property ID#</b></Zoom>
                     <br/>

                     <Flip right> <Barcode value={this.state.code} format="UPC" /> </Flip>
    
                     <br/>
                     <i  style={{color:"red"}}>[[{this.state.code}]]</i>
                     <b style={{color:"white"}}>powered by upcOS </b>
                  </div>
                </div>
             </Modal>;

   var owner = scan[1];
   var word = scan[7];
   var createdData = scan[11];
   var modifiedData = scan[12];

   var createdDate = parseInt(createdData);
   var created = new Date(createdDate * 1000);

   var modifiedDate = parseInt(modifiedData);
   var modified = new Date(modifiedDate * 1000);
   var upcscript = scan[6];
   this.setState({ upcscript: upcscript });
   var currentUrl = window.location.href;
   var currentUrl = currentUrl.replace('export','intel');
   var currentUrlLink = <a href={currentUrl}>link</a>
   var content = 
                <div style={{overflow:"scroll",wordWrap:"break-word",height:"100vh",background:"#000000", verticalAlign:"middle", textAlign:"center" }}> 
                  <div>
                    <Zoom left> <b style={{color:"white"}}>[intel]</b></Zoom>
                    <br/>
                    <Zoom left> <b>----------</b></Zoom>
                    <Zoom left> <b style={{color:"red"}}>web3-url:{currentUrlLink}</b></Zoom>
                    <br/>
                    <Zoom left> <b>----------</b></Zoom>
                    <br/>
                    <Zoom left> <b style={{color:"red"}}>owner:</b><i>{owner}</i></Zoom>
                    <br/>
                    <Zoom left> <b>----------</b></Zoom>
                    <br/>
                    <Zoom left> <b style={{color:"red"}}>title:</b><i>{word}</i></Zoom>
                    <br/>
                    <Zoom left> <b>----------</b></Zoom>
                    <br/>
                    <Zoom left> <b style={{color:"red"}}>modified:</b><i>{modified.toString()}</i></Zoom>
                    <br/>
                    <Zoom left> <b>----------</b></Zoom>
                    <br/>
                    <Zoom left> <b style={{color:"red"}}>created:</b><i>{created.toString()}</i></Zoom>
                    <br/>
                    <Zoom left> <b>----------</b></Zoom>
                    <br/>
                    <Zoom left> <b style={{color:"red"}}>UPCScript:</b><i>s {upcscript}</i></Zoom>
                  </div>
                </div>


    var res = this.state.slides;
    console.log("RES COUNT = " + res.length);
    if(res.length == 0 ) {
       res.push(splash);
       res.push(content);
    }



    for(var i = 0; i < nftIds.length; i++) {
       if(!nftIds[i]) continue;
       var vidSnippet;
       var vid;

       var tmpId = nftIds[i];
       info[i] = { 
          order: i,
          data: nftIds[i]
       }

       console.log(info[i]);
       //keep ss string clean.


       var stagePiece = nftIds[i];
       var containsLinkType = stagePiece.includes('[') && stagePiece.includes('|') && stagePiece.includes(']');
       var loadYt = false;
       var loadHtml = false;
       if( stagePiece.includes('https:') ) {
        console.log("LINKKKKKKK1");
            loadHtml = true;
       }

       if( stagePiece.includes('yout') ) {
        console.log("LINKKKKKKK2");
            loadYt = true;
       }

       if (containsGreaterThan && loadHtml && !containsLinkType && !loadYt) {
          var entry = await this.getHTML(nftIds[i]); 
       } else if (containsLinkType) {
        console.log("LINKKKKKKK3");
        var entry = this.getLink(nftIds[i]);
       }
       else if(tmpId.length == 11) {
        console.log("LINKKKKKKK4");
          var entry = await this.getYt(tmpId); 
       }
       else if(loadYt) {

        console.log("LINKKKKKKK5");
          var entry = await this.getYt(tmpId); 
          //this class can not connect to web3, so it is up to the calling code to decode the nftId's content and pass that raw to this function
          //var entry = await this.getNft(i,nftIds); 
       }
    }
  }


  getLink = linkEntity => {
    const linkParts = linkEntity.slice(1, -1).split('|');
    const title = linkParts[0];
    const url = linkParts[1];


    var postObject;
    var postText = ""; 
    var isPost = false;
    if(title == "post") {
       isPost = true;
       postText = atob(url);
       postObject = JSON.parse(postText);
    }   




    var res = this.state.slides;


    var toPush = ( 
      <Zoom>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'black',
          color: 'white'
        }}
      >   
        <h3 style={{ color: 'green' }}>[user-provided-external-link]</h3>
        <h2>[key: {title}]</h2>
        {isPost ? ( 

            <div>
               <p style={{background:"green"}}>
               title: <br/>
               {postObject.title}
               </p>

               <p style={{minHeight:"50vh",background:"green"}}>
               body: <br/>
               {postObject.body}
               </p>
            </div>

        ) : (
          <p>
            [link:{' '}
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
            ]{' '}
          </p>
        )}
      </div>
      </Zoom>
    );
               






    res.push(toPush);
    this.setState({ slides: res });
    this.setState({ res: res });
  };





  loadOne = async (id,vr) => {
    var mplayer;

    if(vr.includes('tiktok')) {

       mplayer = 
                <div>
                   <pre>
                      #!/sbin/upc
                      xi {id}
                   </pre>
                   <TikTok url={vr} />
                </div>
    }
    //backwards compat, use iframe for shortened codes, or allow them to paste the full url.  full url
    //pasting does not get the player with controls (this iframe player below)
    else if(vr.length == 11) {
       const youtubeID = vr
       mplayer =
                <div>
                   <iframe className='video'
                           style={{minHeight:"100vh",width:"100vw"}}
                           allow="camera; microphone"
                           title='Youtube player'
                           sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                           src={`https://youtube.com/embed/${youtubeID}?autoplay=0`}>
                   </iframe>
                </div>
    }
    //arbitrary url video
    else if(!vr.includes('yout') && !vr.includes('facebook') 
            && !vr.includes('soundcloud') && !vr.includes('vimeo')
            && !vr.includes('whistia') && !vr.includes('mixcloud')
            && !vr.includes('dailymotion') && !vr.includes('twitch')) {
       const fullUrl = vr
       mplayer =
               <div>
                   <iframe className='video'
                           style={{minHeight:"100vh",width:"100vw"}}
                           allow='camera;microphone'
                           title='upcOS-init'
                           sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                           src={fullUrl}>
                   </iframe>
                </div>
    }

    else {
       mplayer = 
                <div>
                   <ReactPlayer 
                      width="100vw"
                      url={vr}
                   />

                </div>
    }

       return <Zoom right> {mplayer} </Zoom>
    }


render () { 
var show =
<ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal">
  <div>
    <TrebleCleffExp showHome={this.showHome} showSearch={this.showSearch} showLoad={this.showLoad} handleFlip={this.handleFlip} showMission={this.showMission} showTerminal={this.handleFlip} terminal={"false"}/>
    <Carousel maxTurns={'0'}>
      {this.state.slides}
    </Carousel>
  </div>
  <div>
    <TrebleCleffExp  showHome={this.handleFlip} handleFlip={this.handleFlip} showTerminal={this.showTerminal} showMission={this.showMission} terminal={"true"}/>
    {this.state.terminalSwitch}
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
                  <div style={{ opacity:"0.9", background:"#ffffff" ,color:"#000000", visibility:this.state.pipVisibility, display: this.state.pipDisplay, width:"98vw",border:"3px dashed", padding:"5px"}}>
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

  </div>

</ReactCardFlip>


return show
}
}