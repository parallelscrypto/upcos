import React, { Component } from 'react'
import makeCarousel from 'react-reveal/makeCarousel';
// we'll need the Slide component for sliding animations
// but you can use any other effect
import Slide from 'react-reveal/Slide';
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



export default class StageCarousel extends Component {



  constructor(props) {
    super(props);
    var channel = props.upcId;
    this.state = {
       channel: channel,
       slides: []
    }
    this.loadOne= this.loadOne.bind(this);
  }


  componentDidMount = async () => {
    let infoOwned = this.props.upcInfo(this.state.channel)
     .then(data => {
          var self = this;
          var ipfs   = data['vr'];
          var nftIds = ipfs.split("#");
console.log("NFTIDS      " + nftIds);
          for(var i = 0; i < nftIds.length; i++) {
             var vidSnippet;
             var vid;

             var tmpId = nftIds[i];
             //keep ss string clean.
             if(tmpId.length == 11) {
                var oneVid = this.loadOne(7777777,tmpId);
                    oneVid.then((result) => {
                       var res = self.state.slides;
                       res.push(result)
                       self.setState({slides: res})
                     })
                     .catch((error) => {
                       console.log(error);
                       return null;
                     });
             }
             else {

                let infoOwned = this.props.nftInfo(nftIds[i])
                  .then(data2 => {
                       vid = data2['vr'];
                       var id  = data2['tokenId'];
                       var oneVid = this.loadOne(id,vid);
                           oneVid.then((result) => {
                              var res = self.state.slides;
                              res.push(result)
                              self.setState({slides: res})
                            })
                            .catch((error) => {
                              console.log(error);
                              return null;
                            });
                  })
             }
          }
    })

  }



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
                   <p className="legend">externally-hosted-tiktok-vid</p>
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
                           title='Youtube player'
                           sandbox='allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                           src={`https://youtube.com/embed/${youtubeID}?autoplay=0`}>
                   </iframe>
                   <p className="legend">external-vid</p>
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
                           title='upc dj player'
                           sandbox='allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                           src={fullUrl}>
                   </iframe>
                   <p className="legend">external-url</p>
                </div>
    }


    else {
       mplayer = 
                <div>
                   <ReactPlayer 
                      width="100vw"
                      url={vr}
                   />

                   <p className="legend">external-vid</p>
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
