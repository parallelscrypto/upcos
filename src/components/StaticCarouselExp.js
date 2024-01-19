import React, { Component } from 'react'
import axios from "axios";
import Modal from "react-animated-modal";
import makeCarousel from 'react-reveal/makeCarousel';
import TrebleCleffExp from './TrebleCleffExp'
import BassCleff from './BassCleff'
import TableSlideshow from './TableSlideshow'
//import Popit from './Popit'
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
import InsertDataForm from './InsertDataForm'


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

    console.log("^^^^^^^^^^^^^^^^^^^  COOOOOOOOOOODDDDDDDDDDDDDDEEEEEEEEEEEE$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    console.log(upc);
    //this.setState({upc: upc});
    var missionUrl = atob(props.missionUrl);
    var manifest= props.manifest;
    var msg = atob(props.msg);



    var scan;
    scan = atob(manifest);

    scan = scan.split(',');
    console.log(scan);

    var owner = scan[1];
    //this.setState({owner: owner});

    this.state = { 
      owner: owner, 
      upc: upc, 
    };



    this.progressTerminal = React.createRef()
    var promptlabel =  '[[ AWAITING COMMAND@ ]] => ';
    var welcomeMsg ="\n[[ \n you are now on upcOS privately owned property owned by \n " + owner + "\n on {polygon} \n";
    welcomeMsg += "\n MSG from @_" + upc + " => \n " +  msg + "\n]]";
    
    var myTerm = <Terminal
      style={{"minHeight":"75vh",backgroundColor: "#000",zIndex:"0",wordBreak:"break-all"}}
      ref={this.progressTerminal}
      commands={{

            fire: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open firepad.io collab suite in a window & sheeit  (thank you and no affiliation) </p>',
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


            push: {
		    description: '<p style="color:hotpink;font-size:1.1em">** push a link to the popit repository </p>',
              fn: async () => {

                     const terminal = this.progressTerminal.current
		     const pushForm = <InsertDataForm upc={this.props.code} popitPush={this.props.popitPush} /> 

		     this.setState(prevState => ({ fullIpfs: pushForm }));
		     this.setState(prevState => ({ pipVisibility: !prevState.pipVisibility }));
		     this.setState(prevState => ({ pipDisplay: !prevState.pipDisplay}));

              }
            },


            pull: {
		    description: '<p style="color:hotpink;font-size:1.1em">** pull from the upcOS popit repository.  here is an example: pull ACTION ID, where ACTION can be one of the follwing values: `ppl` (private protocol link), `upc` (look up a push by upc code), `hash` (lookup pushes by hash) and then the corresponding ppl, upc or hash is substituted for ID. so if you want to search for ppl king-pac://king-pac-10, the command would be `pull ppl king-pac://king-pac-10` </p>',
              fn: async (type,id,end) => {


                      const terminal = this.progressTerminal.current
                      let tables = [];
                  
                      switch (type) {
                        case 'ppl':
		          let pulls= await this.props.popitPullPPL(id)

                          var [id, link, hash, address, upc, hrn,timestamp] = pulls.split(',');
                          var fullPage = this.printPull(id, link, hash, address, upc, hrn,timestamp);

                          terminal.pushToStdout(fullPage);
                          break;

                        case 'upc':

		          let pulls2= await this.props.popitPullUpc(id)

                          for(var i=0; i<pulls2.length; i++) {
                             var myPull = pulls2[i];
                             var [id, link, hash, address, upc, hrn, timestamp] = myPull.toString().split(',');
                             var fullPage = this.printPull(id, link, hash, address, upc, hrn,timestamp);
                             tables.push(fullPage);

                          }



                             var out = <TableSlideshow  tables={tables} ></TableSlideshow>


                             terminal.pushToStdout(out);

                        break;
                        case 'all':
                          //the index starts at zero, so add one to get proper range
                          id++;
                          end++;
		          let pulls3= await this.props.popitPullUniversal(id,end);

                          for(var i=0; i<pulls3.length; i++) {
                             var myPull = pulls3[i];
                             var [id, link, hash, address, upc, hrn, timestamp] = myPull.toString().split(',');
                             var fullPage = this.printPull(id,link, hash, address, upc, hrn, timestamp);
                             tables.push(fullPage);

                          }

                          var out = <TableSlideshow  tables={tables} ></TableSlideshow>
                          terminal.pushToStdout(out);


                          break;
                        default:
                          console.log('The string is not "name", "hash", or "upc".');
                          break;
                      }

                      

              }
            },




            draw: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open sketchpad in a window  (thank you and no affiliation to any unless explicitly stated) </p>',
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
		    description: '<p style="color:hotpink;font-size:1.1em">** get free beats for your rhymes (thank you and no affiliation) </p>',
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



            calc: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open graphing calculator in a window  (thank you and no affiliation) </p>',
              fn: (sheetNum) => {


		      var fullUrl = "https://desmos.com/calculator";
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



            ad: {
		    description: '<p style="color:hotpink;font-size:1.1em">** programatically create seal advertisements </p>',
              fn: (sheetNum) => {


		      var fullUrl = "https://tio.run/##nVhrc5vIEv3uX0G8@bBbFdsMEnLk2L4Vy4BEDLJ4DIIvWwMzNo/hEUAWaCu/PdvYcW78yObuRa6SZnqm6XO6T8@Uq7j6@vX0P1Vc7e3dbIqoTcpCiGpGWjZvc35NbtnvbxtG@CfWvxPeVqTnJaHv3t7WjLVJcfuH8NeeIAhvY1gsnAmnp6dzx7gapk7fXC5njn@tCIPt/H7qfhUnxe3ZPiv27@fupxmhj4NhnLOWCFFM6oa1Z/uuox68339hL0jOzvbvEratyrrdF6KyaFkB67cJbeMzyu6SiB3cD94JSZG0CeEHTUQ4O0OH4hN/bdJydr6poqV9evQw@MHatP2TCXjCkvYPwL8/N/D6gxuSJ7w/ET7W8LJ3QkOK5qBhdXLz4el2EmW3dbkp6EFU8rI@EX67kYfP02UVoRQoPhEkseqemr48GcXoWTCPXkf3zz9tPRxoI0nB6mcuclLfJsWJIApk05Yfntm6B2JPhPfii9heQ3f//ATd6KWHsjtoYkLL7fB@UUCwQqhvQ/K7@E749neI/vgnXNVPGJncP79ghLJnu1@DhIbPTyChF5Ae6DwIy7Yt819n9DBqyUHYFs/ioElTcQIFlhQccnYQ8jLKfsn@ePZRlcUPr/LxWmZa1rUHlEVlTYZ2cCIUZcH@AekraMKypqw@qAlNNs2JIP9vaE/i8u5FIb4GSCbiePpTj6dHTyR7evRjfzkdtPujvGlyJ0ScNM3Z/nct7D@V@2mMzpWuAiGzImLCfaMQnJKS/g04R88WV@d/fW@PX06PqhdmteS83AptzISmZVUjhOx@XApt3X/zfpeQ4Rdp2pOXLmLp3IaNggg2@P3cP06apBVOiRDX7OZsP27bqjk5OrrhSZW0m@owio7A9f75TwynR@T85@9Er79TgeZbP0CCw0LIWP9K3E@opuwZy4/cfTttXqHuCBz8JCzp9bBmZdULpKBQsEA1xJc0wrczDDQ0MA4RD/VO4Mj7PyM@Deuj87OzswactPB9P/7r8aj88mhmBX00/itko9eRXW@aeDjzmpIz4Rww1HlSEH74WsEpRVpCYTVQkA/l9eblql9Vy3caHqS6f@58r9Wi3L4ZimbvdTynR98lB0ju7wLDHeHD3jBTs3ZTFw/3hw97X/b2vkvnbH/OQCfvIEWkyIS@3MAZWwtNXG4fcOyDh8digbgkKXpPbig7lhCSwmN0TMIpYcfh5FgiVLoRxZH4ntDxhEwRIQiFaHTM3qORSKIpGkvTe2/fcvZfFjom8bsmu0km/Hic12U9KbKxNN7cdeNxyeNqxHbJWD7uNmmZfC5kSepGnw9JvWXkjh0WrD3aOPakd/Gc/znur8oDUucbt74p5lfLPwOjlEfTiR4ll2yCbqKjpKCsOxyY@O2IdcOt5oj1@o5o09EC/JO5JUZzY3LVT@OooNxfB/wqlzmdTXfuyJL9VDcsKahcF69pqs5sxVSX8@DaKSrFQuZVqKBra6ePiTLdGWo8s0cVXiTbxJemWWAvJov0485MFdlIld7cfdwa/aJZ5CgOc54Ha1McYnDWVRqJaEE0tCS5NXeQVVpYrb3MurYUt3NES7NENHfXPMAo6z2vtUMXTdx1FbDc6B0PYaZWLqxfWorSO4o1M9Xqs@eYNskb0c3wJwupk2AUL7FGx25ezYiIWitHy9CtVC@vTEMRe8cxlySrGgdTbHAV/NMlWdNR4FqqoVaKC@sJdzsvo4GBq/Y@HkXcOV5lDu/Ha24aGZ7A/sBU5NbJu2usxZWTV6mRyWs7h3izoHQyahmIt86aEkvhE4eDfwV99kecWEgvAY8KfCiOo5tYa2UHW7oB49W6glzcbgMlnrFsWkEeEkvqKl9CjZEvdsEIJ4ZYbZxLcxmq3If3xdYlHw12OoxT7BuF1QR4taXDurwLPKX67Lu@TDj33bwjRsplsHdEs2A8BX@89Xe6RzQT8Ex9Q9RLL9Xx0kWOV1QEi4HsOXoZ8KpdrnmCL9WNx2M7yM0WF1WGR7dbwDUOJWvhFjRl@VRyLnWNease53EWYoz8HHmGst0BD5mtdZXjtWNbrdpQ1W2cr3oH4082VrbYsTKy49cB5N9W3S2dmy52@MLx5DJEqx3wubbcygi8DkeS0YeanIQ4qB01HvhYM60jq50qQnxL6ALrQOtStob4JNkLlQ7i4xlGeDfkC/h3/RE1Gc92UH81U2SZQv2wTJ0MdlOZupZjJFczvY2kKFkmumdJ8YB1FmmmvEovYgvhwstRwzxj53o0NXhQ@hn1iMjnXmHGnqIWgUI95unrcI4DPKLIdnEdSKs@nJvJStQb4GZJeTXHHs0e/VO18kF/AZasxnZpQ12@gFwRV9Qv/SySSQ4ayKdg78BfbIcIcutRz@C48MX4E1GznVtcBMPYwxEa4sEFDow066BWtJBXziqvEiN1tz7YodbXsD8LvW7jYzommr6BcTL4By0Qw9PnptelUKM721XvbBQs7FRNBnygjQvmyspyNtUtLxZ9Hm2p21XmHBvE1XWPmzMiLXqoFd1WAK@ECIXaMTTgq7C2wNc4VKvLVTa1Q1UtvCwGJArk2tRBKxLk0gyQvmbzCx66QTXUXihyLdDiNAQt@znkI9fbpQPrxaDyUxNqjWv3ud6pIzs1Yb9VexynLI2vVhIqDc1arIrqmjixFFyamSF2GzfnqQHaDBQDkXzRG/MA5lUpgJ4XQfxW3qbMiWXHtXSWdRNrzQ3DlT8DHi/U9MrAVmztsq2jWjoV0WdnbZlY4eKg7UGb7tpaEmfVOa4hQi9wDKy67g6PIP@pLZq1VVSxkQPfBZ8xzVoP2gLtS34umz/UCwL8JNTMapXzoR6@8Vf2VmEaK3Gx9V2qGUoJPYtmRn77rd6MHQZtWjvQvmI@889nRDN6CloJM1QOvT30@C6CIyzkuA9n0ONzdeGmF6mtiJIzz2Tova5dmFmYyT3Uf23kuuLvLqAeKsmX4JbvDb2VL23V76G3Woa26Jk2TS1FbgIP1iuyG1xa0DsuJB/HGnVl115zDvaxo6FXewfmGMOFF2EeENvTteXlBcfrWHJUCut1H@bTEFfIFfHYVW@7SJETxqFXI4vYcKaECiZY5WOI16S5uja9lngaRT7oh2r6pbMOYrxztx6nI9CjHyptHLpcxh4a27kKve/CNVRdc7DbYRy4q0y2LW8rQf@2VxnCoG/Tuvw4XRTi2XArYFFc/qt/iXzY@/r1bw";
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





            chat: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open mirotalk in a window  (thank you and no affiliation) </p>',
              fn: (sheetNum) => {


		      var fullUrl = "https://mirotalk.up.railway.app";
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
		    description: '<p style="color:hotpink;font-size:1.1em">** Open voicechanger in a window  (thank you and no affiliation) </p>',
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
		    description: '<p style="color:hotpink;font-size:1.1em">** use this command for text to speech tts tool (thank you and no affiliation)  </p>',
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
		    description: '<p style="color:hotpink;font-size:1.1em">** Open wick suite in a window  (thank you and no affiliation) </p>',
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
		    description: '<p style="color:hotpink;font-size:1.1em">** Open coracle nostr client in a window  (thank you and no affiliation) </p>',
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
		    description: '<p style="color:hotpink;font-size:1.1em">** open a window powered by deepai.org (thank you and no affiliation) </p>',
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

		      var fullUrl = "https://iwt24fbqean5a4txesfxzik63m5penrfeoekwq5gdhih6pge3pra.arweave.net/RaeuFDAgG9BydySLfKFe2zryNiUjiKtDphnQfzzE2-I";
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





            foss: {
		    description: '<p style="color:hotpink;font-size:1.1em">** download core upcos zip file from 12-23-2023.  Thank you to all foss developers.</p>',
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
		    description: '<p style="color:hotpink;font-size:1.1em">** Open tio.run collab suite in a window & sheeit  (thank you and no affiliation) </p>',
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
		    description: '<p style="color:hotpink;font-size:1.1em">** Open blank html viewer in a window< (thank you and no affiliation) /p>',
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
		    description: '<p style="color:hotpink;font-size:1.1em">** Open librivox in draggable interface (thank you and no affiliation) </p>',
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
		    description: '<p style="color:hotpink;font-size:1.1em">** Open chat client window in draggable interface (thank you and no affiliation) </p>',
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


            localhost: {
              description: '<p style="color:hotpink;font-size:1.1em">** download html/css/js for this upcOS instance to run locally**</p>',

              fn: async () => {

                const terminal = this.progressTerminal.current
                var currentUrl = window.location.href;
                //terminal.pushToStdout(page);

var page = window.location.href;

var pageHtml = `
  <html>
    <head></head>
    <body>
      <iframe style="height: 100vh; width: 96vw;" src="${page}"></iframe>
    </body>
  </html>
`;

let data = new Blob([pageHtml], { type: 'text/html' });
let htmlURL = window.URL.createObjectURL(data);
let tempLink = document.createElement('a');
tempLink.href = htmlURL;
tempLink.setAttribute('download', 'upcOS.html');
tempLink.click();



              }
            },



            pop: {
              description: '<p style="color:hotpink;font-size:1.1em">** poppin a terminal already in your terminal**</p>',

              fn: async (url,param,id) => {
                let pullOutput;
                switch (url) {
                  case "fire":
		    url = "https://demo.firepad.io/";
                    break;
                  case "sheeit":
		    url = "https://ethercalc.net/";
                    break;
                  case "tio":
		    url = "https://tio.run";
                    break;
                  case "draw":
		    url = "https://sketch.io/sketchpad";
                    break;
                   case "beats":
		    url = "https://freebeats.io";
                    break;
                   case "calc":
		    url = "https://desmos.com/calculator";
                    break;
                   case "ad":
		      var url = "https://tio.run/#%23rXtrd5vIuub3/hU@OfvDOWt2OoCMJ@6d9KzIBiQckFVAFdSXWcWlg0QhYQlbiL32b9/zvDjJ6aST9Nkzk@61umUEVe/tuRROV3f//Oeb/9XV3U8//fa4K/rNfndRHCrVV4u@1ffqQ/UffzlWSt9V579e/KVTZ71X5V//8uFQVf1m9@E/L/7@08XFxV9qfPni7cWbN28WcfCefvTm325XN3F271zQtV@nH03f0mr34e2Lavdi@tn040qVnz7Q57bq1UVRq8Ox6t@@SGL35esXf7i@U2319sXTpjp1@0P/4qLY7/pqh@@fNmVfvy2rp01RvZw@/PVis9v0G6VfHgulq7fmz8YXz@s3va5@feyKVfTm1fOH31099ucvfoA/@b48Pwf@@c9vWP7lb6rd6PMvF@8OWOyvF0e1O748VofNb3/78nZVNB8O@8dd@bLY6/3hl4t//82mf778WqfKEin@5cIyuuHLS//44lNtfrWZT0@dTX9@dOvPlDa12VWHrx7RqsOHze6XC@NCPfb7v311bXhO7C8Xr40/7O1b0U1/vhPd7I9P2A8vj7Uq9yda37gw8Y2Lw4dc/Yfx14uP//5s/ueP4uq@k5Gr6c@fZKSsvrr7WyGZ9M93QjL/ENJzOl/m@77ft39e0Z@LXr3M@91X@yg3x04rNNhmp1Gzl7neF82fZv/y5p1rG3/7Zj6@VZm@GvqXZVXsD4rg4JeL3X5X/SDSb0ST7w9ldXh5UOXm8fjLhf3fi/aXev/0h0b8VkC2Mi6vv/vEN6@@GNk3r36PL29odn8/3uXm6aLQ6nh8@@LzLLz4ctzf1OavztBhkKtdUV1MQHER70t1/jc83Pzqy92vf/8Mj/9486r76rK6qA/Vb2///glL//F59eckvPj1dnOoiv7i/WbX4PnqD49391rvTxd9XV0c@6o7XuTV9Hl/0R/OH3f3tFH0f@rY//LHLdTWrxFuvDBwDf//9fP55rjpP2/0Rd333fGXV69@05tu0z92PxfFKzz6xa/fuUBb/v6a5rfXdADeh@eQQDYXTXX@xr6/KFVZfVWlT7n/yFbfSP0rPOA727K@va2bfXe@ULsSDY9UY3@b48XHumEGKePYMc2LAmX@X@74TX549evbt2@PeEiP/06f/6s9Pl2uduWni/9SZLNvR3b/eKyJM497XV38ihgO7Wan9M9/fDYVZ7tHYx3R0M/t9W/fbevvdssfujz@3Ku7/emrPv8injevPo8sIpm0BGmMv/1EPzlU/eNh96w//vbTP3766fPovX2xqDAnf0WJ1K65OO8fwdGHi2O9Pz3H8QJP@NQsb18YV6@vL6@UKi7L6qrMy9x6nb@27NdXxuvLq9fKNKxCzfLXr@3fzDxXuVX9ZpSqMm17dvnb63xmTk/7WLP/ysLT8cGyTtZmzA/92W7Ly7HtLvPuOOt2jx/@528n63L/2HTtqe2Lw5MqTqfi9PCzOpwq9VT9vKv6V4c7rxfGdpmNg/nhpcz@94f0bF33t7@9z9NFklzrNna9/Vwc74xXm11ZDT9TJv79VTWQKnpVnf1Redez5Xa/ud9e/g@1YEaxCK7en6@NqnUei5Y3921tlIv5uNq8fpLe9fh@1z3lbfL77x6LHR8L6/WjtLShFnzzvtVP703ZFTtmZmJI8ln5@IfPeG4e2/tywU7FuH96bw3nMg3H/GzvVMr2pVg@KvH6aS3sXbHTNyr1m@J8Pc/b8lwlfle0bPzvPiNJea2sZHxvuli/18EZ93jG72PQ5cbu8vG/sR@r1sUs@PTfRzyj/32O8oVvFrPw6X1bdqVXmxk993ydyJSdVRo8cY8bRau/sfe@Q2xNbpl10YZ7rKmz2foxb7mRe7qtIrsuFu9@t@fXg9q@G75a5yETNj5fn5Vwj@@F@ygX/pMS66el1Zl522/y2Xrz/sbf5hbTVPfVbWKGcTIGt@8ugzg7LTenTY77lJCIb71ZbfywavQYJ/U@T@wH6ZT33KvdRPSKOdcOi9175shFnJSs4joVsS@V6fdx2jFM2FU2@mHO@aXQDN@3nXXsB8xZGqLtZGD6D2pkEUu6RZJ2u8qxEzmrI9X4h1iYHtbro4Yr1RinOPbDwLAfonYIuZmc8X1WGoh1VmpG64luHrrdg0jLFXeMMTZYWLn6Ko5d2v9McCYU131E113nHBvlSjXXzrrVSmnZxWYpVGL2Ip7LQPv72GRhmJhXudeHzNA29usHjf2QtHpVNSY9nweJnfC0C5njGDFnsjQGJ7zp17n4cJJOfVM1191qIZtoMd/Hnn2Xu50Tiusmcv1ZNuueyuZ0TnZyW8WJlW2XZu7Oe3U7byLHv4qt5rJs/WW0dbeI24o9syk8tlC3rlQxP2W7xuaWm0XbecMNOfKmsAPL71a8rIWzP0m39ApTLlZxuMH3n6RTnO4sd5ls59vIMax40diFFT7yXbcNtrUptv4x8Nwlb3WQi8GKb@deyfdjtOUMn23R1GGp3TQU9jZvh9uM13fKCm2Kh43vDllSR4EXLuNYBlWsx8yyRdUG59WCq6A9nXAd@R36fCGDIMkGwUsjd0x7xX3a/xn9EZYC@9uxr/OHVtZmxovLf3H/q9zssnjXBYFjPwldo24D5XfDbykfdVRa4VU@w352tS1dXG99xGPXwvWfkD8f@0mxvgBqnTLLPFbNaUjaAfXpTtmsMTFDi2ARrtV2/VX8zUkK0y1F2PP2D/2g2Ii@9OwT6tvzqK8jd3nKjDoMm8FepeE21xJzs7xE/s/57RzX0Z@eeUS/DGI3x/Ul5e@Si@UoFzwIOPZj2VGA@atcvgksZuL7@8Dzk6/7rVroRjj2FfoHeOBmSXuN/D/n91v1XSU@8IDZkvO7wgv7BPmkeDK9pvhRr3JbtdfIt39ZCUb53lQxf8T9Ea6nEbCXj7XFOervOWfMyxf1/07/HKXXmIXnX/1r@3fOyhswL6aVxP4@94Ixxvq430imfLDletfdq7i2sqa@CwSu7yTiYahPuUf@ujCdY/@ao1@iSrhZnP6@/t/rH3bKWrNR1vIciHoL3Hqa4nebEdyzyTnub8pjLngc4nrkOF/FW19mwK/KGXq5mDfM@jAIMcWPfnAlHzn2V9jYT8p2YYB5MTGPd2Xrpkkq/WD3bsD6hkI/JGmI/PgPsVveKc/vk5SpoJEG4gkL1At4opLZB@oXkTuDw9ISeJwA39kc@Oao0ccchCPwbFsaJuHbPXOBb2lxfR8tj8vWHOV5ebVstM2QG974Tnwb3pRtOM@tzk9GLXjCQ@xtwXZdjVkBtoVR2IQ7XL/nwGhwA7DVvpIjWyntDOAODqzuGbCYm/wKWBtiZp04BTZjnbgpGT5fYbYVM50x1swPge0MWM1ddwYsvlGN@cDicBXo7oC9K/rM0zJMxPVDlJRN2S7PiSgVMzITn/fKC85qoTfBlmZVuxKzjN7xmSE77Ffljsbnehu05Q61DD9dB5YfM8u4LNHLYSobYMdRNOBtZ8jWO3oeOAa1zU2dYT3JwVnA9qE0dYreUsIxd9RreP5y3daaz2oLs8Cktabe3ahkaWJ9Lq1wCWyr1wawAfmRlp/mC2BdO1hZCz2EWQMWYj1mTuuBC2JB2G/uBA9vwOGY5XqDXjzh@TPa/yqVm4/P8wKsDyxuEsN/ELwwcD2LW8Tn@haed5d7/oK3iF/zHbDpjvInRLkJtN5JDq4RYbfelVJ4w5htfY@wYr0NJ@zE/kXwnL8GWGwK6DdgkY38KMR7FLxeUfyYXYX19yIOJ@wqrXJL9cnAZcrtbkOvxCzUwFrEi/1U2C9m@3n9BPfvJNXLzFoD@4EGaKl@fCfdArMTZpzicfy9BFaWWqdTPUZ@QHw3lVieV8KkeJ@wH@TfpXop4WG9MYww64hvrj7XA/WMpudLcJspsL@lsso62HJL3i6xi65fpRrrLQfCBsxun1nIF7Djd/1H2HUUrS0K44v603q36@28Zqak/jyWyef89OCmKCAuSUM/8gYLn31pNiP6A9ipabbvoHGW0OcbaGObsIu@T/lDv4xZE1L@lti/5OZy6pcJq7fz5/g15hfx5YtwA6xAfkrU313k4O7/6j/ec/Q3nn@e8m1Rf/Tqi/6Y9seAfeUqN/SCtaANa5jiof19jOdpqv90HfNidsff9S/lfwashPbA/Ow@9bfzCXs6aOsut2xetCfSpl9yZ@wD@7kdg8MIuwtPE1easS4GZdjLYsG2zPU7@j4wbhHGrqpaBsyFtvOWyKe/ZaMzZsifasNH0dYysNYj@rMhbGY73QRa7qVn8hL9xrfzIDC6IAG@Ye4WhdOlYvEOWrDcli7w3pMqEB9MaNNj4PoLQLrMvdrnWvJQ@IuA80hZzErE0FQ6vFqnsqb@RP12H7UQ5tW08HlfWktoMaynMzOx7JNy/Ss162I@m1sZlzdFYt/CB8SMtG4MvdnYh@qW36O/DsnW35euFtIN66DpllzXRC8P0BZJ5L0eML9RxPmj9Dqdx82ZO4y4f5E0bCUW84cM2rnUnZvELubf97mwG9XyHvlOmLM3MF8R9PUj8q25C27icp@ACxNdx8KVe/TpHnnz5CIkrYeeOJpCZ6cg9gWDjyOtihk4hLwTwa0DbcBxP/PWO1Yzxz8kBr8LNfBxZA30uB2bwBWXX/EtnpUYyO/RZrzMAOPgjb0pRHeXiXARNbXg3qCydlDo7wPi19AKuJ/dJMJP5Qx8IOpbifsL53opQP@qHc7o2X3UMlE4tcjT@iExErMwyyP6pEHP0/pRnJgH4H8KjIyi0feQv4d128Usfof81YdQuPAamtP98CB3pdm50rneBIvaSFrkT7vwFtcy8Oqbb9/P@mjHsP68Q/94gYn63bINM@xTrMsTvMrDeusDz9xFLAZgKusLr9vw2YdRNJwFwLekwfote5AC86qZE7d9zY095qGG51mC/0oZtMchi13iCOQP93vDk4iXQ2LxQznrBO5X1L@hLpeF4zfBresmvG5i7btsGyac@zfy9t3AEjtdiR79t6d5gbZluH@KH2vyO/ChQB4a8JGB62rqvwU4zTEvgS9hpdnjmng/6Z6EgPBojmf0MocXpPyfsP@lGnkdpHPgut2gf84leaHGfp@1/axC/Cvepazh56l/DHMRNzqB3gglZ8dCo34u8FAMWQYVBiA6FQuO/tVYXx6AF8BjvQHsnIToG3irRbxD/zvAC12uAlcfs4/ry9tQKRMaPJ4rxv33mVHewaPY35m/Dv0fhS7Nh43@ubazBnrFDT1o@YSN7ig97D@5Rlw6CnYfBvRfWAFP0D/34IsH2n/glodEl4r6H/m6RP4eky28RBvOaH5ofuFNIwYlg/pjftbneCsJX0PMhxno8qCcfsN289NU/9ZP462P/g9M4NldxFkG3RUFGjjo1E/f6p9oF07xo/9FxjF/O8q/nklvuCk9F14a9U/2Fr/1D6HHeqpfrv0ugeYstAZnktczr5K284Qu3WIRpnnM32eNPHHHToEfoWrcb9fPLA/AD/LiVwmtT/Wb5gd8Y5QRPBLy123UOP/m/SX4Uo3uJl/MHcIPir@6dVE/gPKtexQu60Vz/e38QWdWwHPkD/pkmh/oL57IGeZP1DH06wr5S1ATjfkh/GoKw/TUTNfQL8AveVeYDfDLxf1dEhuhQfWP0pLmf4W5vAyT61R5mH/yRuifyELMTr3B/WGmE9RPH@OYvQc/A3@7G6VDN7j1gd9Hk/IXeT6dZYSBd0L/GCYHXzNd3wN/gX/9ieYvG@fov6n/1TfxryX81DPuFEPe8hTef8Wtes@bZ/zHnpuguSQ9r4B/fXUrqX8PWTy/DLWbKccWjGcGd3m0brkbpm4EPrhHXY6lLgXwb5t70CDoJ8Iv3sJfcOeb/FMAf6oFU2zGQil6D/MjkkZqFk/4s48t98BjN4HHgj6b6vcYaZr/zgL@@/DEB/Drio96yn@A@hfQj2pWXgnwmrLgUog/2vBS3vp3kceXqN@Gxwl07vA9/NywdjC5R/zrov9p/tgCXt9D/z1y5A@69lII8xAAv4EfEv3DgB87wn/lhFqN@hQbmD/HPBTA31wcB9zvA78e1xr8h77jCfKP/sX6LN/N1@Bf8GeZBryEPvSX4H/gD63PZO5@O3@xNa0fEX9g/gT09VUU8zpPJDwzpJLgD9P@0b@IfxW2S/CGGaoxAf8R/qF/GuiydqjhAQX48zEf/5/4P2FNmUz8L8xLTvXfdch/MGQNn1UuO0aaA//KGfAP@oil4O8N8vq8Pvovm5Xf7n@jXMFPwu@4rMIsYX6a2OJH0kf5xB/yLufdIkjDDTNdG/xxFOhf5V2n3Omuvs2/fIH9b9gMWC5QF6wvXUn6Jfve/BJ@5U43Cs1D6G@RQ7cD3x4yzSXqS@s3PP1gQY/aysT921AG0G8T/oP/Ivh59C/hB92/wPzdCzo7FIMszTKJ2uuJvzivvzO/fRhAV2B@Teg3wp@Gzeoa@m@G@j3EzRf65Sh2wK8W9ffMFe5fgItZsJgPpJ8Sy3fzBerdDmvMnRcCQ5OdH2LmUDqaP37E/8fcOo3Q@@A/H/1fC/DDKNJulbQuX6XzGJy950bJKvAv1k6Bgee4qRv0BTjA5bnbvcfzRekxFzmMuCMFMCpKTHYER2yYYwOv3LvY1Vzsyi1v4RAbuQK@p@UI/ThjMfjGKxo7gU5OEe8e64hMBAP0c4Orq0Qzj@lsUM51kjv2ks5euPDh133oC8fkGqtreYzaOgTfe8C7m8T0gR/ALi7jLPaj2OQP6N8V1k8F8DZuyY9qwcf5JfdMUZjw0VgffnPgbjlWHkN8wH9Dppi3Gzx/Uboho/hlwgXyQ@thfmUKXRSVAv3Q2HWFXHBdnIhvsA7y4We84SdmsoTt0JXt9RX5I@wP@y8x112cxP4dt7Bv3QFfOKP4oRNFkpYc877niD/iEvjZpzmXZ/CvEm65XGvoN0fO0NN34G93xcuQa37Jt25TWsEZ622w7xTrq8TtUnynYdq95GJQsYnZ39US/Zly@GFs@mqtoY@S7j0wgMMxiyn@mO9RPxEi/soNt3liXibC9mLTGeEHeeB2d@DfQ2m5VP86sIqB37qE79C/Yap0p4D/B3wPeklCv8OHCHPPXf8I/BRMhJfZ6EdFux4lNARLOui3oQksDo9D88GwPnjLZAL4Cy3akX47ctPvk6aWfLY2pIP6c7fP3TJiek/4J/LpHYNOsH6H@kAzsbQYge@YVfTPnTLJv/AU@rNGf3il24zwJDEbPwzgF8Jf5LMOwZ@or7@v4PkwnzH0M/B32Ofuckygn3LXHzHfJ6ahRdsJP@5Qf8yvC7/N7oFPPEH9kX/0Wxkz3YHvk0FxCf4ALu3qJ9RfFDTvbrlRs/kK8fMA8w0/D/0j98AfBXzrCyfkFL/Yhk3G/VQ5TPFZAPxM7IiX0Bt2Db1u861/mZvrU0C@3BsE/PBNbvKswPMDQfFz@EP0v9tx8qt8mv89dCz43qodzO0YitDF4KW5GFYZ@qXC/CVNt0Lel9zr94qHbiiAF64cYw5c5dhr20fCW5uE37nlnCP0HvKP/k9MWIcT9EMM75zQ@Rnqf8hvQ@C3/8TBAUXLHa7nAv0GcztE4E8B/Erg@@GfeiU0cuaWkjf6kpv1Eb7FLZwB@qIeuSlX6IBFgVgZ@oHDHypzfQZ@JMKr1wn0Jeb/wJsyDLgvuOjvlGE6rJEcmHeA5rtj2s@gPwTiR855E5uhSDQnvDvivsuKZ@fK68Ej7iXwa68cg87yMX8@9LuMGA8P8E8b4IcP/Nsn5DcduYJ@VdBJ@8RlwL8wRXw8EYOn8Dz0capM@Vz/5jpb63kMfb8HP3qEf2riB/YAHtsH7npQC0hhU/KsqYFNwKUGe@Xd7af@L10GXHx9Bv7dAU8XyS7cgl9S1H9fTPzoNoh/GSfwpdA7a@ivAPoBfC1Lwyb/KGi@4Z9Q/XLBm1pjPxnWnwPPBJ3rov@Af3IPD@sVXg38lQCRAfGzY0z@h1P/y31huZ7YyijXwK1d55Wacfj3mDcS/Srhn@RCzjT1/4NMyggyXhD@YX6o/xvo96FwpnctwGzzsgSfTPM/xc/uRAv8ond9HnuPPEPOc8Qf6jwtbW6WRm6yHvWPc68WhH/ief6b3GPQSYkN/8CDWArwewy8f@5/tyN9cZXMujuG@sMfMeivBPwzr7B7tfBXwFojof5r/b7CsxE/9f@x4PDLngb@rS2a/0y4PEh5zVyaf7Chq/sA/Mhi7fyg/wn/nus/zT8DnncHxG@EHPUHwiL@AfpHTfPv0jvZ7j5uoT/hD4PE3nBrjXkoLzE3i6gpqf4d8Ocu1rpH/CvUcwF/1Ez1h6cLtnyE3oM/kg/wG8DjI/CPq7XFFvDiiJ8hfv4E/Qf/6K@gX0fUDxztH/CZQ9@OsZZR5IDPMX/AH8V5cYKW8xAn9JvNUX8Rg38qJ2zAp4T/8Bi4l/jf6aAnyqgEHwB/U@AjclNeMsOE/oNeTtH/2/kJXJ4Gwq1z8jeW7Qk3JP6Lq6ZbJKYUBfq/oP53oA/h/9D/4L2ao/5phv7JTQl9ex1iNlPomwj450bbOQDAvwW/rZgOH0j35WlwAu9coh7Qcprij2leAuCfIL67dReI/8jpzKu9Foj/FvgvKP4VYBj8eYf4zdLkC3BCjfgymn/0gbPeIqPU/02JWQF@3YbE/6uYl@CfMIO2ofmPqP/zdur/miX2MUvhv4DnygMxa30J/zDhP3hNcY3dOLIpuA9@sDfCo/4n/RGcOemvFvU3pEL90bPT/PsZ5hH@7Rg1wDvgfyZMUUJbkX5nKfw35gv6xA15fY/p6IB/u8ql@PutmoV20vb0LNQfPe7yGeKPIgHdSucPt@uB0zs8rgXbYv@ODYwFvprgmpRmUUrMn0n8XY7Ae0fG0Csn1P@A/t4Imge3NATiR49K8C71/y6AfIzpfJ1wDf4fXmcx6cF0bcQ6sQXVn/Bf7wfwnxHT91LSQ3i@Ue5jU37C/xT65wTehvek@XfrLJE@9Pkjeg@uZb4k/Mf8g/@1AH8eSf9UvCTtRvUn/gP/SA/5Rv79syT@n87vejr/hJjq4Z@gD9OujhZz@HdzrFydojc0NLfzJ/yH2epugMfH/FbGwKcD384VuLQPxHUNPjKgX1YT/pH@dzrEl5jQhz36J6T3F9T/ZWOmdH6pLPB/a0YF79LgFv3t@m5iwX@52Qn6LlHQNxlmvhD@kuLPwQ@Yj5vQsQ9T/WeY/7Z/Ar4k8a5scP086S/Pz9CP4P/uPc0D8A96GLqrWZ6Qv1XguR7mOhYeU3FC@Wd9ectWPNYZ/N4xbszleifR//57fO@OtXwJ7UrnOzV3iyH0lkO@8MHFfkD8T1oC@gfzD@2ZMMxYuACe0fnpneTkP/iC@h/8bYH/feBZD96C/gH/x2EEPYi57ppn/QM9YjmjHCf@u0f/32FiMf/Q39YR35OqpPMTwj9RI/7hVJoS/pXep03xA6Mxv1heNeCNW7cpTEn6R8B/@VR/bsJbbOWz/m4HGZD@Af8hxyPw76h4uVBUf/IfqI@gfnDlBvz3o/mvWcu8mMObeO6hcEPwIzycKb3SCyn@uoJOwmeVmw70X6ngT7Oshd5BvbH@FvHbEroT85@iJwUbOen9O8Y59I@M4F8s6v8E/Md2HIjl76f5n/QP@h/6KzPqSHHo35b4337KRpfwn5P@4emc89v5D@sP7bCneEVap/Af94n1OX4emJiHGP2O@Cf8j/k99P8uIP5zrus86UZuwf@0/KDGuUI@LQn9SvoHfBihf2bo/23lBdB/PnwE1jT4XeHqI@qmwacT/ykP9b8lzVrfTv7XW4/kH6b@56UReh/5TwzQWVLR@es0/xr84nVKJQbqYyfQ3wPwj/zPkvqf5h/7g2Z24L@YDKyBJ0ZxCZx3ouYafhbxc8y/YZwV6gD9dkjGdwPiPypviBD/QPq3AP@h/hz@Dvp3uKP@D0Vfw/8ZyOXdpH/dOenfGeF7iX4MhBbwD1fP@t85c9J/LfFff5rwPyb/M4zchZfyfC7ofCyd3/5Q/y/miMX8qH@vE8I/zAPpn2yNfJB/zLbP/i@i87XZxP@mMjE/ulbIf52g3uA/6C/0U6x9@E3wn3sU0AWYf2gTOv9lB@XpeMK/7VwgfiFd0mbygDluQo758a7p/ZeY6u@im5OB9N898T@n361C/ZV1Gkn/Q/8dwtTXzJVr6uaM6yP8KvE/@Klfof8PmHeO@U@hf4AXZQb9QfwXTPxvliKm84fZnPS/AT2crNs@wfxDu9TQ8/R@7ZpDvy/I/wO7Dog/BJ954Ia9gl6N4P@FA/2vCe@hfyf/43NuHYnbpvMH6F/gu88qz/eUV4f0u0D47k1p0Xkpj9WoD9D7N8D3I/gxhX714GWhZyX6fU76fyT859w9wn@KAD762f9S/f178Cn8jzwplz@w1qX5n039D7@jbueEf9B/4LaP@D/5O/fP9B9qZOH@hUvvd2rgH82/g9wC/53J/5P/od/lE8/@h36XD3FCzZlyCf9wQr9na8w/5vEB83AH/vMU@f/P/ocfET@d90zvH9D/Av6nBr9bSQu61/4V29FJDIsTwj8ReusW@tUqJ/@rWjr/k8T/CvxM@vco6fw7nXuiKWxo1h5@PAE/0PxT/E5E788c8AT8a2RN5z@c9J8U5gz8D30LvcF9I7GGPZ7ron@m@ZfeAPzv3JXA/bFj8dYwofg/9b@C3mP0fhh6nPzvAPxHjf1knQJ/RX0mLzXpP8L/lM6/Oq/45H9nrKPzj3Caf7fGDJtZAt@P@Q8TJqFf7uEvbPaj/gf@faw/zb8Bv6LQt8Bj/uz/4O0KLh9FO81/Mp1/GHYP/UL@d5XpsgnMMoX/XTGjW1D9FdaPGltCLw9xI0@M3o@S/m@gSbZLswD/Ad/JH9H51wF97Yrm@/r/@fxDbhT8JRf2qaDzr6YOoT@O5P@gzUm/EP8toH9XiP@KNwP9PsoP/C@j8w8Oz6aQG/iP8uP5DzeUXp6KWxf6F/pPDB/1Xx3Dv8c/9H/oX@hH6n/4v0n/P5H/A99fJYR/yf4EUI/WlkN5iRUwJhbmGEznP77GXnyKPzEwL1uf9D/47t3AEH@OPWIGn@DvTmvgP6f44X/R/8B/noZpyZE/jvoDrzH/Dvm/JTJK/e8vMCsblr4DyroK@gqzxMC/w4rmP6H@9@yp/xH/Kvfcqxz9H3h1/ez/wscJ/w1jALZgmpgnFy69f0D96x31f7CoY@BAOp1/8BBzZNP55/P8C8zjD86/Cg3@0yH8L89iTIfi5P9riv@QWf1Y8Yn/a9R/AP@DgU3Mv4aekfB/74wA@jIjvddkFuJH/SXwtcQc8EvMlCfQXyEHf6fFCfX3gPhDsaB5qOPn8y@Wli7pP9BrCv2D/pcjsLi5PEH/A9fCDP4/ZBY0rwe/Dd8C/U/1Rx3A/@C/0rHxPXcW01msWZL/EJ/x3@RH@I8I3gc@wRjg/@n9QprjXjr/jSb8L8FvWgInj7kHnNxp4J@c6k/8B/6B5pqvkP8IeAj@B/6lc@DmuwFARv6I/O8V9P8J@r8vZvVH/ZsM7E/4D7P1sN6VqPvJSizDpPNP6GHyP0@k/0vPXcYT/smz4OT/gEgJ/I8YVnFS3wRT/wNPDW1z0U/nH8kO/nN8Z8bT@U/4QPiLPpd0Psgt9xCk7iZyJOE/@F1fwf@u1Ej1L43J/8w6@B97Jj1zOv9F/8O/1vXkd2gegH/oJ@gu@yZA/n7o/6B/n/2Pb6H/o2g6/5A6Qstk0O8ZZ2kQsw3qfwa/RrED/ictMZvfYv5XrDHRnzxmwHPBiyFqOeafafA/4d@@hP@JgGfA/@n8N3H//59/A6Mxv3NwUXcXWOtBLoBB0D/Ixyma6l/C/6P/6R2DKY/i@fwrJv1XmG6fezpl1ofx2f8/@59n/zfc/Wj@0f8N4k@AfzX0Ywx@HFB/9CLbTvGn0Emczv@uGZ1/iG14Ep4PvYN6Y33M5aESjH6/E3iNngQbRj/Wf8T/x@fzD/i/pIT@DzP4Kar/dP4XOn@Kf64iPKD3H6aEPwUeevBcuznq759iMzgzOv9p/PuP@l9AN2yn83DMewz8DxP4fe3XxH/E/@LZ/2ekfzB/Iqffn4E@BP8T/mWFQ3@XoAP@9@T/kvyj/sms4U/wLzELzRLgH/wPEMtD/Sf858/6L/ZXkQs/487p/dfX5/8dvX@i@idNCP6fz@j8E/yXgpekspB/IxkE/C/qj3lb0vz7pWGn9P72@fxrUIXm2D/W1/4yIz3QTOc/PKDzQC55pafzz1BpmT2f//rQWDrBvKbJdH4BXatD0gPwn5gNPeEfvX88gOfo/Rf0/0Dvvzx6/7c21@Q/IviDu4zXDfkvfH@DfqT33UduOfR3Jyb9Dkj0yo/nN1wQfknC1WM@0/GE3@LZvyL2JsCow5@v4D@HaFdyPjoG@Tfoh@W0f@hPXG8is8S8oYYpZj32oxL4Df6Cf4cecesT5gjrQz/P6hH5iYAftH@aNxf4xTDPvHJYnGv4X@jrUNPvXwDJdSdJf0St26/S@ffx2@Lg85Lw6kjvbzj465N@JT1H@oXtOkW/bwH@uOGJifpBxt@@s5c74y39jbOqqPf/0l/X/9tP//zn/wE";
                    break;
                  case "chat":
		    url = "https://mirotalk.up.railway.app";
                    break;
                   case "vc":
		    url = "https://voicechanger.io";
                    break;
                   case "speak":
		    url = "https://ttstool.com";
                    break;
                   case "gif":
		    url = "https://wickeditor.com/editor";
                    break;
                   case "nostr":
		    url = "https://coracle.social";
                    break;
                   case "unseal":
		    url = "https://iwt24fbqean5a4txesfxzik63m5penrfeoekwq5gdhih6pge3pra.arweave.net/RaeuFDAgG9BydySLfKFe2zryNiUjiKtDphnQfzzE2-I";
                    break;
                   case "blank":
		    url = "https://goonlinetools.com/html-viewer/";
                    break;
                   case "book":
                    url = 'https://librivox.org';
                    break;
                   case "com":
		    url = "https://chatcrypt.com";
                    break;
                   case "upcms":
                    url = "https://pitrgclmhs7vogwhp5twz44y4p4jswq2dmihll2navrv5adfg4wq.arweave.net/eicTCWw8v1cax39nbPOY4_iZWhobEHWvTQVjXoBlNy0/index.html#/upload/" + upc;
                    break;
                   case "wurdup":
		    url = "https://codverter.com/src/index";
                    break;
                   case "jokes":
                    if(param) {
		       param = "/en/search/?name="+param;
                    }
                    else {
                       param = "";
                    }
		    url = "https://www.myinstants.com" + param;
                    break;
                  case "links":
		    url = "https://tio.run/#%23fVXvU9pAEP2ev@JM/YAzauSHaGsZR0FGLJ12EOhg7WSO5EKuJrnz7oJgx7/d7l0SCNKagZkk9/btvt23wEP@@vr5nIfcsoI08RRlCVICJzJgIp6wVKVTMhr0K7upiPbQHwsh5DioHRLvAdEAqZAgOEYeSxSmiUT2UsccTomtoYCoSCU4k4Zgv3S8h3ZaLRTgSJKcN6MeEB5hj5SQ6ImqMH@ekkOPxXYO15yohSCDK7KwyjpsfzNk36D3znToi5XruPB9ZJN4Snwb4UARgbwQJzOazIwyn8Ugynov04q9/OhklKuUViFNpSIxzDHzaUCJr5unT0V2pPFnFpS3HgZZwDg8NcYR9UcigkYyQaFCHEFo0Tkgv@URVYYbitQCpktkh0pxGymGJOFYYEWKgUmr6J8EWWTBI@aDJIOHssspTMdQkaaXUEWhlmeCMBQXc7VEWAi8RGAYSM1E0by5rriUa14ogIQmovKWGvqflShYOgsRwV5ozIUTH@aSOw5EUpmRm0BIa4CVTAyWqGRVc2kT7phKMxeXz/LU32GoBLKsG1YYG25j/EB0Wgwuj3lEFCmmtrpye@Thh/kcy4i3GUeSoIBGINmdY6HTGEmlEW1EaA1reL5M3V5/eDVwxxf9XudieOUaQ/xjqzYTg6iigfsIwwJo27D1yMyIzIC2wtcz/PkL5G6rfLE2717WAy4cvqLIfF62WtFB@clxijV2vlx/7Xm19uMsZeeStuaT4/q3ya17cOD9qEbS28IfXD@Fz/2Q3TxKjY96v@vdgXs3upmQtO2LLfwQX7p38TJsdK40/npYndaGo9P5ye0NbzbpFv62HpBxjY7ZuKfxg0H83L1rXHrUTU6eegv7zNqVXCv5cJ/oD7ywdgXxtQH1PuuTHSflnhNiCU5n6tk5WgTNk@7H085lt31aPT6tdo/8Gg6a005Qb9S9k2aNVEmz3Thq3ieaz9pYpvd/Ic4s4oVslZQzbjjMy1JdwJpvUqVEvrlNGdF9AhxIu/z//xOwAZIf6u/WjR47sl5f/wI";
                    break;

                  case "pull":
                      const terminal = this.progressTerminal.current
                      let tables = [];
                  
                      switch (param) {
                        case 'ppl':
		          let pulls= await this.props.popitPullPPL(id)

                          var [id, link, hash, address, upc, hrn,timestamp] = pulls.split(',');
                          var fullPage = this.printPull(id, link, hash, address, upc, hrn, timestamp);
                          pullOutput = true;
                          terminal.pushToStdout(fullPage);
                          break;

                        case 'upc':

		          let pulls2= await this.props.popitPullUpc(id)
console.log("%%%%%%%%%%%%%%%%%%%%");
console.log(pulls2);
                          for(var i=0; i<pulls2.length; i++) {
                             var myPull = pulls2[i];
                             var [id, link, hash, address, upc, hrn,timestamp] = myPull.toString().split(',');
                             var fullPage = this.printPull(id, link, hash, address, upc, hrn,timestamp);
                             tables.push(fullPage);

                          }



                             pullOutput = <TableSlideshow  tables={tables} ></TableSlideshow>


                             terminal.pushToStdout(pullOutput);

                     }
                  break;
                  default:
                    url = url;
                }


                if(!pullOutput)
                {

                const terminal = this.progressTerminal.current
                //var currentUrl = window.location.href;
                var currentUrl = url;
                var page = <html>
<head><title>forever upcOS hasta que terminemos!</title></head>
<body>
<iframe style={{height:"90vh",width:"90vw"}} src={currentUrl} />
</body>
</html>
                terminal.pushToStdout(page);
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






            serial: {
              description: '<p style="color:hotpink;font-size:1.1em">** Display product information for UPC from go upc  (thank you and no affiliation)  </p>',
              fn: () => {
                      var currentUrl = window.location.href;
                      var upcHash  = sha256(currentUrl)
                      const terminal = this.progressTerminal.current
                      terminal.pushToStdout(`Please wait... calculating serial on this instance of # ${upc}`);
                      terminal.pushToStdout(`###### BEGIN ######`);
                      terminal.pushToStdout(`${upcHash}`);
                      terminal.pushToStdout(`###### END #######`);
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
		    description: '<p style="color:hotpink;font-size:1.1em">** Open codeverter.com window  (thank you and no affiliation) </p>',
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

            pops: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open POPScript interpreter </p>',
              fn: () => {



		      //var fullUrl = "https://codverter.com/src/index";
                   var winNum = "1";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      if(winNum == "1") {
		         this.setState(prevState => ({ pipVisibility2: "true" }));
		         this.setState(prevState => ({ pipDisplay2: "block"}));
		         this.setState(prevState => ({ showBigShow2: true}));
                      }
              }
            },



            reconppl: {
		    description: '<p style="color:hotpink;font-size:1.1em">** approve your flip token to be spent for a PPL</p>',
              fn: async () => {


                      const terminal = this.progressTerminal.current
                      terminal.pushToStdout(`Please wait... approving tokens so that you can buy your PPL!`);
                      let latest = await this.props.approvePPL("100000000000000000");  
                      terminal.pushToStdout(`###### BEGIN ######`);
                      terminal.pushToStdout( `approve_status: ` + `${latest}`);
                      terminal.pushToStdout(`###### END #######`);

              }
            },




            pplast: {
		    description: '<p style="color:hotpink;font-size:1.1em">** display the highest ppl id </p>',
              fn: async () => {


                      const terminal = this.progressTerminal.current
                      let latest = await this.props.latestTokenId() - 1;  
                      terminal.pushToStdout(`Please wait... fetching latest PPL id`);
                      terminal.pushToStdout(`###### BEGIN ######`);
                      terminal.pushToStdout( `latest_ppl_id: ` + `${latest}`);
                      terminal.pushToStdout(`###### END #######`);

              }
            },


            pops: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open POPScript interpreter </p>',
              fn: () => {



		      //var fullUrl = "https://codverter.com/src/index";
                   var winNum = "1";

                      //this.cSearch.value = "";
                      //this.cSearch.value = fullUrl;
                      if(winNum == "1") {
		         this.setState(prevState => ({ pipVisibility2: "true" }));
		         this.setState(prevState => ({ pipDisplay2: "block"}));
		         this.setState(prevState => ({ showBigShow2: true}));
                      }
              }
            },




            ppl: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open PPL (private protocol link) minibrowser </p>',
              fn: async (url) => {



		      //var fullUrl = "https://codverter.com/src/index";
                   var winNum = "1";

                      this.cSearch.value = "";
                      this.cSearch3.value = url;
                      if(winNum == "1") {
                         let resolvedPage = await this.resolvePPL(url);
                         // Rest of your code remains the same
                         this.setState({fullIpfs3: resolvedPage});
 
		         this.setState(prevState => ({ pipVisibility3: "true" }));
		         this.setState(prevState => ({ pipDisplay3: "block"}));
		         this.setState(prevState => ({ showBigShow3: true}));
                      }
              }
            },





            sheeit: {
		    description: '<p style="color:hotpink;font-size:1.1em">** Open ethercalc collab suite in a window & sheeit  (thank you and no affiliation) </p>',
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
                      if(!upcScript) {
                         upcScript = this.state.upcscript.substr(3);
                      }
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





    this.state = {
       code: upc,
       mplayer: "",
       channel: channel,
       manifest: manifest,
       missionUrl: missionUrl,
       slides: [],
       res: [],
       terminal: myTerm,
//       terminalSwitch: devIframe,
       pipVisibility3: "false",
       pipDisplay3: "none",
       pipVisibility2: "false",
       pipDisplay2: "none",
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







  showPops= async () => {
    this.setState(prevState => ({ pipVisibility2: "true" }));
    this.setState(prevState => ({ pipDisplay2: "block"}));
    this.setState(prevState => ({ showBigShow2: true}))
    this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
  }











  showLoad= async () => {

  this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
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







  printPull=  (id,link,hash,address,upc,hrn,timestamp) => {



	    var tmpStamp = parseInt(timestamp);
	    var timestamp = new Date(tmpStamp * 1000);

            let hrnBare = hrn;
            let defaultHrn = "ppl " + hrn;
            let pullHrn = "pull ppl " + hrn;
            let pullUpc = "pull upc " + upc;
            let pullAll = "pull all " + id + " " + id;
            //let pullHash = "pull hash " + hash;


            let hrnTmp = 
    <select selected={defaultHrn} id="commands" onchange="copySelectedOption()">
      <option value={pullHrn}>{pullHrn}</option>
      <option value={pullUpc}>{pullUpc}</option>
    </select>


     let hrnDL = 
       <div>
         <pre style={{color:"black", background:"green"}}>
           {defaultHrn} <br/>
           {pullHrn}  <br/>
           {pullAll}  <br/>
           {pullUpc}  <br/>
         </pre>
       </div>


            hrn = hrnDL;

            var fullPage = (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <tr>
                  <th style={{ border: '1px solid #ddd', backgroundColor: '#f2f2f2', padding: '8px', textAlign: 'left' }}>Field</th>
                  <th style={{ border: '1px solid #ddd', backgroundColor: '#f2f2f2', padding: '8px', textAlign: 'left' }}>Value</th>
                </tr>
            

                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{id}</td>
                </tr>


                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Link</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{link}</td>
                </tr>
            
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Hash</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{hash}</td>
                </tr>
            
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Owner</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{address}</td>
                </tr>
            
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>UPC</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{upc}</td>
                </tr>
            
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Private Protocol Link (PPL)</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{hrnBare}</td>
                </tr>
            
                <tr style={{color:"black", background:"green"}}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>PPL Commands</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{hrn}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Timestamp</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>${timestamp.toString()}</td>
                </tr>

              </table>
            );

            return fullPage;

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



   resolvePPL= async (id) => {

               let pulls= await this.props.popitPullPPL(id)
               var [id, link, hash, address, upc, hrn] = pulls.split(',');
               var page = <html>
                     <head><title>{hash}</title></head>
                     <body>
                     <iframe style={{height:"100vh",width:"96vw"}} src={link} />
                     </body>
                     </html>

               return page; 
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
                                       sandbox='allow-downloads allow-modals allow-same-origin allow-forms allow-popuAllallow-scripts allow-presentation'
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



      parsePop  = async (upcScript) => {
            var self = this;
            const terminal = this.progressTerminal.current

 const lines = upcScript.split('\n');
  const output = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#')) {
      terminal.pushToStdout(`${line}`);
    } else if (line.startsWith('pop')) {

                var remainder = line.substring(4);

                var words = remainder.split(" ");
console.log("REMAINDERRRRRRRR");
console.log(remainder);

                switch (words[0]) {
                  case "fire":
		    remainder= "https://demo.firepad.io/";
                    break;
                  case "sheeit":
		    remainder = "https://ethercalc.net/";
                    break;
                  case "tio":
		    remainder = "https://tio.run";
                    break;
                  case "draw":
		    remainder = "https://sketch.io/sketchpad";
                    break;
                   case "beats":
		    remainder = "https://freebeats.io";
                    break;
                   case "calc":
		    remainder = "https://desmos.com/calculator";
                    break;
                   case "ad":
		      remainder = "https://tio.run/##nVhrc5vIEv3uX0G8@bBbFdsMEnLk2L4Vy4BEDLJ4DIIvWwMzNo/hEUAWaCu/PdvYcW78yObuRa6SZnqm6XO6T8@Uq7j6@vX0P1Vc7e3dbIqoTcpCiGpGWjZvc35NbtnvbxtG@CfWvxPeVqTnJaHv3t7WjLVJcfuH8NeeIAhvY1gsnAmnp6dzx7gapk7fXC5njn@tCIPt/H7qfhUnxe3ZPiv27@fupxmhj4NhnLOWCFFM6oa1Z/uuox68339hL0jOzvbvEratyrrdF6KyaFkB67cJbeMzyu6SiB3cD94JSZG0CeEHTUQ4O0OH4hN/bdJydr6poqV9evQw@MHatP2TCXjCkvYPwL8/N/D6gxuSJ7w/ET7W8LJ3QkOK5qBhdXLz4el2EmW3dbkp6EFU8rI@EX67kYfP02UVoRQoPhEkseqemr48GcXoWTCPXkf3zz9tPRxoI0nB6mcuclLfJsWJIApk05Yfntm6B2JPhPfii9heQ3f//ATd6KWHsjtoYkLL7fB@UUCwQqhvQ/K7@E749neI/vgnXNVPGJncP79ghLJnu1@DhIbPTyChF5Ae6DwIy7Yt819n9DBqyUHYFs/ioElTcQIFlhQccnYQ8jLKfsn@ePZRlcUPr/LxWmZa1rUHlEVlTYZ2cCIUZcH@AekraMKypqw@qAlNNs2JIP9vaE/i8u5FIb4GSCbiePpTj6dHTyR7evRjfzkdtPujvGlyJ0ScNM3Z/nct7D@V@2mMzpWuAiGzImLCfaMQnJKS/g04R88WV@d/fW@PX06PqhdmteS83AptzISmZVUjhOx@XApt3X/zfpeQ4Rdp2pOXLmLp3IaNggg2@P3cP06apBVOiRDX7OZsP27bqjk5OrrhSZW0m@owio7A9f75TwynR@T85@9Er79TgeZbP0CCw0LIWP9K3E@opuwZy4/cfTttXqHuCBz8JCzp9bBmZdULpKBQsEA1xJc0wrczDDQ0MA4RD/VO4Mj7PyM@Deuj87OzswactPB9P/7r8aj88mhmBX00/itko9eRXW@aeDjzmpIz4Rww1HlSEH74WsEpRVpCYTVQkA/l9eblql9Vy3caHqS6f@58r9Wi3L4ZimbvdTynR98lB0ju7wLDHeHD3jBTs3ZTFw/3hw97X/b2vkvnbH/OQCfvIEWkyIS@3MAZWwtNXG4fcOyDh8digbgkKXpPbig7lhCSwmN0TMIpYcfh5FgiVLoRxZH4ntDxhEwRIQiFaHTM3qORSKIpGkvTe2/fcvZfFjom8bsmu0km/Hic12U9KbKxNN7cdeNxyeNqxHbJWD7uNmmZfC5kSepGnw9JvWXkjh0WrD3aOPakd/Gc/znur8oDUucbt74p5lfLPwOjlEfTiR4ll2yCbqKjpKCsOxyY@O2IdcOt5oj1@o5o09EC/JO5JUZzY3LVT@OooNxfB/wqlzmdTXfuyJL9VDcsKahcF69pqs5sxVSX8@DaKSrFQuZVqKBra6ePiTLdGWo8s0cVXiTbxJemWWAvJov0485MFdlIld7cfdwa/aJZ5CgOc54Ha1McYnDWVRqJaEE0tCS5NXeQVVpYrb3MurYUt3NES7NENHfXPMAo6z2vtUMXTdx1FbDc6B0PYaZWLqxfWorSO4o1M9Xqs@eYNskb0c3wJwupk2AUL7FGx25ezYiIWitHy9CtVC@vTEMRe8cxlySrGgdTbHAV/NMlWdNR4FqqoVaKC@sJdzsvo4GBq/Y@HkXcOV5lDu/Ha24aGZ7A/sBU5NbJu2usxZWTV6mRyWs7h3izoHQyahmIt86aEkvhE4eDfwV99kecWEgvAY8KfCiOo5tYa2UHW7oB49W6glzcbgMlnrFsWkEeEkvqKl9CjZEvdsEIJ4ZYbZxLcxmq3If3xdYlHw12OoxT7BuF1QR4taXDurwLPKX67Lu@TDj33bwjRsplsHdEs2A8BX@89Xe6RzQT8Ex9Q9RLL9Xx0kWOV1QEi4HsOXoZ8KpdrnmCL9WNx2M7yM0WF1WGR7dbwDUOJWvhFjRl@VRyLnWNease53EWYoz8HHmGst0BD5mtdZXjtWNbrdpQ1W2cr3oH4082VrbYsTKy49cB5N9W3S2dmy52@MLx5DJEqx3wubbcygi8DkeS0YeanIQ4qB01HvhYM60jq50qQnxL6ALrQOtStob4JNkLlQ7i4xlGeDfkC/h3/RE1Gc92UH81U2SZQv2wTJ0MdlOZupZjJFczvY2kKFkmumdJ8YB1FmmmvEovYgvhwstRwzxj53o0NXhQ@hn1iMjnXmHGnqIWgUI95unrcI4DPKLIdnEdSKs@nJvJStQb4GZJeTXHHs0e/VO18kF/AZasxnZpQ12@gFwRV9Qv/SySSQ4ayKdg78BfbIcIcutRz@C48MX4E1GznVtcBMPYwxEa4sEFDow066BWtJBXziqvEiN1tz7YodbXsD8LvW7jYzommr6BcTL4By0Qw9PnptelUKM721XvbBQs7FRNBnygjQvmyspyNtUtLxZ9Hm2p21XmHBvE1XWPmzMiLXqoFd1WAK@ECIXaMTTgq7C2wNc4VKvLVTa1Q1UtvCwGJArk2tRBKxLk0gyQvmbzCx66QTXUXihyLdDiNAQt@znkI9fbpQPrxaDyUxNqjWv3ud6pIzs1Yb9VexynLI2vVhIqDc1arIrqmjixFFyamSF2GzfnqQHaDBQDkXzRG/MA5lUpgJ4XQfxW3qbMiWXHtXSWdRNrzQ3DlT8DHi/U9MrAVmztsq2jWjoV0WdnbZlY4eKg7UGb7tpaEmfVOa4hQi9wDKy67g6PIP@pLZq1VVSxkQPfBZ8xzVoP2gLtS34umz/UCwL8JNTMapXzoR6@8Vf2VmEaK3Gx9V2qGUoJPYtmRn77rd6MHQZtWjvQvmI@889nRDN6CloJM1QOvT30@C6CIyzkuA9n0ONzdeGmF6mtiJIzz2Tova5dmFmYyT3Uf23kuuLvLqAeKsmX4JbvDb2VL23V76G3Woa26Jk2TS1FbgIP1iuyG1xa0DsuJB/HGnVl115zDvaxo6FXewfmGMOFF2EeENvTteXlBcfrWHJUCut1H@bTEFfIFfHYVW@7SJETxqFXI4vYcKaECiZY5WOI16S5uja9lngaRT7oh2r6pbMOYrxztx6nI9CjHyptHLpcxh4a27kKve/CNVRdc7DbYRy4q0y2LW8rQf@2VxnCoG/Tuvw4XRTi2XArYFFc/qt/iXzY@/r1bw";
                    break;
                  case "chat":
		    remainder = "https://mirotalk.up.railway.app";
                    break;
                   case "vc":
		    remainder = "https://voicechanger.io";
                    break;
                   case "speak":
		    remainder = "https://ttstool.com";
                    break;
                   case "gif":
		    remainder = "https://wickeditor.com/editor";
                    break;
                   case "nostr":
		    remainder = "https://coracle.social";
                    break;
                   case "unseal":
		    remainder = "https://iwt24fbqean5a4txesfxzik63m5penrfeoekwq5gdhih6pge3pra.arweave.net/RaeuFDAgG9BydySLfKFe2zryNiUjiKtDphnQfzzE2-I";
                    break;
                   case "blank":
		    remainder = "https://goonlinetools.com/html-viewer/";
                    break;
                   case "book":
                    remainder = 'https://librivox.org';
                    break;
                   case "com":
		    remainder = "https://chatcrypt.com";
                    break;
                   case "upcms":
                    remainder = "https://pitrgclmhs7vogwhp5twz44y4p4jswq2dmihll2navrv5adfg4wq.arweave.net/eicTCWw8v1cax39nbPOY4_iZWhobEHWvTQVjXoBlNy0/index.html#/upload/";
                    break;
                   case "wurdup":
		    remainder = "https://codverter.com/src/index";
                    break;
                   case "jokes":



                   var param = "";
                   // Check if there are at least 2 words
                   if (words.length >= 2) {
                     // Return the second word
		     param = "/en/search/?name=" + words[1];
                   }
  
		    remainder = "https://www.myinstants.com" + param;
                    break;
                  case "links":
		    remainder = "https://tio.run/#%23fVXvU9pAEP2ev@JM/YAzauSHaGsZR0FGLJ12EOhg7WSO5EKuJrnz7oJgx7/d7l0SCNKagZkk9/btvt23wEP@@vr5nIfcsoI08RRlCVICJzJgIp6wVKVTMhr0K7upiPbQHwsh5DioHRLvAdEAqZAgOEYeSxSmiUT2UsccTomtoYCoSCU4k4Zgv3S8h3ZaLRTgSJKcN6MeEB5hj5SQ6ImqMH@ekkOPxXYO15yohSCDK7KwyjpsfzNk36D3znToi5XruPB9ZJN4Snwb4UARgbwQJzOazIwyn8Ugynov04q9/OhklKuUViFNpSIxzDHzaUCJr5unT0V2pPFnFpS3HgZZwDg8NcYR9UcigkYyQaFCHEFo0Tkgv@URVYYbitQCpktkh0pxGymGJOFYYEWKgUmr6J8EWWTBI@aDJIOHssspTMdQkaaXUEWhlmeCMBQXc7VEWAi8RGAYSM1E0by5rriUa14ogIQmovKWGvqflShYOgsRwV5ozIUTH@aSOw5EUpmRm0BIa4CVTAyWqGRVc2kT7phKMxeXz/LU32GoBLKsG1YYG25j/EB0Wgwuj3lEFCmmtrpye@Thh/kcy4i3GUeSoIBGINmdY6HTGEmlEW1EaA1reL5M3V5/eDVwxxf9XudieOUaQ/xjqzYTg6iigfsIwwJo27D1yMyIzIC2wtcz/PkL5G6rfLE2717WAy4cvqLIfF62WtFB@clxijV2vlx/7Xm19uMsZeeStuaT4/q3ya17cOD9qEbS28IfXD@Fz/2Q3TxKjY96v@vdgXs3upmQtO2LLfwQX7p38TJsdK40/npYndaGo9P5ye0NbzbpFv62HpBxjY7ZuKfxg0H83L1rXHrUTU6eegv7zNqVXCv5cJ/oD7ywdgXxtQH1PuuTHSflnhNiCU5n6tk5WgTNk@7H085lt31aPT6tdo/8Gg6a005Qb9S9k2aNVEmz3Thq3ieaz9pYpvd/Ic4s4oVslZQzbjjMy1JdwJpvUqVEvrlNGdF9AhxIu/z//xOwAZIf6u/WjR47sl5f/wI";
                    break;

                  default:
                    remainder = remainder;
                }



                var currentUrl = remainder;
                var page = <html>
<head><title>forever upcOS hasta que terminemos!</title></head>
<body>
<iframe style={{height:"100vh",width:"96vw"}} src={currentUrl} />
</body>
</html>
                terminal.pushToStdout(page);
    }
  }



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
    <TrebleCleffExp showHome={this.showHome} showSearch={this.showSearch} showPops={this.showPops} showLoad={this.showLoad} handleFlip={this.handleFlip} showMission={this.showMission} showTerminal={this.handleFlip} terminal={"false"}/>
    <Carousel maxTurns={'0'}>
      {this.state.slides}
    </Carousel>
  </div>
  <div>
    <TrebleCleffExp  showHome={this.handleFlip} handleFlip={this.handleFlip} showPops={this.showLoad} showTerminal={this.showTerminal} showMission={this.handleFlip} terminal={"true"}/>
    {this.state.terminal}
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
                  <div style={{ opacity:"0.9", background:"#000000" ,color:"#ffffff", visibility:this.state.pipVisibility, display: this.state.pipDisplay, width:"98vw",border:"3px dashed", padding:"5px"}}>
                    <div className="handle" style={{background:"black", display:"grid"}}><span style={{textAlign:"center"}}>drag-from-here (client0)</span></div>
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
                  handle=".handle"
                  positionOffset={{x: '0', y: '-50%'}}
                  defaultPosition={{x: 0, y: 0}}
                  grid={[25, 25]}
                  scale={1}
                  onStart={this.handleStart}
                  onDrag={this.handleDrag}
                  onStop={this.handleStop}>
                  <div style={{ opacity:"0.9", background:"#000000" ,color:"#ffffff", visibility:this.state.pipVisibility2, display: this.state.pipDisplay2, width:"98vw",border:"3px dashed", padding:"5px"}}>
                    <div className="handle" style={{background:"black", display:"grid"}}><span style={{textAlign:"center",border:"dashed", borderColor:"red",color:"white" }}>drag-from-here (client1)</span></div>
                      <div style={{textAlign:"center"}}>
                         <button
                              style={{borderBottom: "2px solid white", boxShadow:"none", borderRadius:"0px", borderRight: "2px solid white",background: "#000000", color:"white", height: "10vh", marginBottom:"20px"}}
		              onClick={(event) => {
                                   event.preventDefault()
                                   let upcId = this.state.account
                                   let cSearch2 = this.cSearch2.value.toString()
                                   this.parsePop(cSearch2);
		                   this.setState(prevState => ({ pipVisibility2: "false"}));
		                   this.setState(prevState => ({ pipDisplay2: "none" }));
                                   //var mplayer = this.getMplayer(cSearch2);
                                   //this.setState({fullIpfs2: mplayer});
		              }}
                         >
                           execute 
                         </button>


                         <button
                              style={{borderBottom: "2px solid white", boxShadow:"none", borderRadius:"0px", borderRight: "2px solid white",background: "#000000", color:"red", height: "10vh", marginBottom:"20px"}}
		              onClick={() => {
		                 this.setState(prevState => ({ pipVisibility2: "false"}));
		                 this.setState(prevState => ({ pipDisplay2: "none" }));
		              }}
                         >
                           [x]close 
                         </button>
                      </div>

                    <div>
                   <textarea
                                      ref={(cSearch2) => { this.cSearch2 = cSearch2 }}
                                      id="value"
                                      name="value"
                                      placeholder="paste your #!/upc/pop script here"
                                      style={{background:"black", color:"green", border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'Arial, sans-serif', width: '100vw', height: '100vh' }}
			    />



</div>
                  </div>
                </Draggable>





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
                  <div style={{ opacity:"0.9", background:"#000000" ,color:"#ffffff", visibility:this.state.pipVisibility3, display: this.state.pipDisplay3, width:"98vw",border:"3px dashed", padding:"5px"}}>
                    <div className="handle" style={{background:"black", color:"white", display:"grid"}}><span style={{textAlign:"center",border:"dashed"}}>drag-from-here (ppl-mini-brwsr)</span></div>
                      <div style={{textAlign:"left"}}>
                         <div
                              style={{width: "96vw", marginLeft:"1px dashed white", marginRight:"1px dashed white"}}
                         >
                         <button
                              style={{width: "48vw", boxShadow:"none", borderRadius:"0px", background: "#000000", color:"green", height: "10vh"}}


                              onClick={async (event) => { 
                                event.preventDefault();
                                let upcId = this.state.account;
                                let cSearch3 = this.cSearch3.value.toString();
                                let resolvedPage = await this.resolvePPL(cSearch3);
                                // Rest of your code remains the same
                                this.setState({fullIpfs3: resolvedPage});
                              }}

                         >
                           resolve 
                         </button>


                         <button
                              style={{width: "48vw",  boxShadow:"none", borderRadius:"0px",background: "#000000", color:"red", height: "10vh"}}
		              onClick={() => {
		                 this.setState(prevState => ({ pipVisibility3: "false"}));
		                 this.setState(prevState => ({ pipDisplay3: "none" }));
		              }}
                         >
                           [x]close 
                         </button>
                         </div>

                         <input
                           type="text"
                           ref={(cSearch3) => { this.cSearch3 = cSearch3 }}
                           placeholder="url"
		           style={{textAlign:"center",fontSize:"1.2em",border: "5px dashed green",height:"15vh",width:"95vw",background:"black", color:"white"}}
                            />
                         <br/>

                      </div>

                    <div>
                    <div>{this.state.fullIpfs3}</div>
                    </div>
                  </div>
                </Draggable>







  </div>

</ReactCardFlip>


return show
}
}
