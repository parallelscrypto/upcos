import React, { Component } from 'react'
import makeCarousel from 'react-reveal/makeCarousel';
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



export default class StaticCarousel extends Component {



  constructor(props) {
    super(props);
    var channel = props.upcId;
    this.state = {
       channel: channel,
       slides: []
    }
    this.loadOne= this.loadOne.bind(this);
    this.getLink= this.getLink.bind(this);
  }




  getYt = async (tmpId) => {
                var res;
                var oneVid = await this.loadOne(7777777,tmpId);
	        res = this.state.slides;
	        res.push(oneVid)
	        this.setState({slides: res})

  }


  getNft = async (i, nftIds) => {
                let infoOwned = await this.props.nftInfo(nftIds[i])
                let vid = infoOwned['vr'];
                var id  = infoOwned['tokenId'];
                var oneVid = await this.loadOne(id,vid);
		var res = this.state.slides;
		res.push(oneVid)
		this.setState({slides: res})
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
                                       sandbox='allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                                       src={vr}>
                               </iframe>
                            </div>
                }


                var toPush = <Zoom right> {mplayer} </Zoom>
		res.push(toPush)
		this.setState({slides: res})
   }




  componentDidMount = async () => {
    var res;
    var ipfs   = this.props.show;
    
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
            loadHtml = true;
       }

       if( stagePiece.includes('yout') ) {
            loadYt = true;
       }

       if (containsGreaterThan && loadHtml && !containsLinkType && !loadYt) {
          var entry = await this.getHTML(nftIds[i]); 
       } else if (containsLinkType) {
        console.log("LINKKKKKKK");
        var entry = this.getLink(nftIds[i]);
       }
       else if(tmpId.length == 11) {
          var entry = await this.getYt(tmpId); 
       }
       else if(loadYt) {

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
            <h2>[title: {title}]</h2>
            <p>
              [link:{' '}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
              ]
            </p>
          </div>
      </Zoom>
    );

    res.push(toPush);
    this.setState({ slides: res });
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
                           sandbox='allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
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
                           sandbox='allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
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
  <Carousel  maxTurns={'0'}>
    {this.state.slides}
  </Carousel>

return show
}
}