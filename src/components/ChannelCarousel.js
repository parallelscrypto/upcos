import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import ReactPlayer from 'react-player'
import { TikTok } from 'react-tiktok';



export default class ChannelCarousel extends Component {

  constructor(props) {
    super(props);
    var channel = props.channel;
    var fullNft = "00000000000" + channel;
    this.state = {
       channel: fullNft,
       slides: ''
    }
    this.loadOne= this.loadOne.bind(this);
  }


  componentDidMount = async () => {
    let infoOwned = this.props.upcInfo(this.state.channel)
     .then(data => {
          var self = this;
          var ipfs   = data['ipfs'];
          var nftIds = ipfs.split(",");
          for(var i = 0; i < nftIds.length; i++) {
             var vidSnippet; 
             let infoOwned = this.props.nftInfo(nftIds[i])
              .then(data2 => {
                   var vid = data2['vr'];
                   var oneVid = this.loadOne(vid);
                       oneVid.then((result) => {
                          var res = self.state.slides + result;
                          self.setState({slides: res})
                        })
                        .catch((error) => {
                          console.log(error);
                          return null;
                        });
              })
          }
    })

  }



  loadOne = async (vr) => {
    var mplayer;

    if(vr.includes('tiktok')) {

       mplayer = 
                <div>
                   <TikTok url={vr} />
                   <p className="legend">Legend 1</p>
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
                   <p className="legend">Legend 1</p>
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
                   <p className="legend">Legend 1</p>
                </div>
    }


    else {
       mplayer = 
                <div>
                   <ReactPlayer 
                      width="100vw"
                      url={vr}
                   />

                   <p className="legend">Legend 1</p>
                </div>
    }

       return mplayer
    }

    render() {


        return (
            <Carousel>
                {this.state.slides}
            </Carousel>
        );
    }
}

