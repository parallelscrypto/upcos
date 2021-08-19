import React, { Component } from 'react'
import dai from '../dai.png'
import MyTerminal from './MyTerminal'
import MyTicker from './MyTicker'
import UpcStatsTicker from './UpcStatsTicker'
import ReactCardFlip from 'react-card-flip';
import equalizer from './extra/equalizer.mp4';
import fps from './extra/fps.mp4';




class Intel extends Component {

  constructor(props) {
    super(props)
    this.state = {
      code: "",
      isFlipped: false,
    }
  }

  componentWillMount(){
    var self = this;
    var scan;
    var tmpCode;
    try {
          tmpCode = this.props.intel;
          tmpCode = tmpCode.substring(7);
          scan = JSON.parse(atob(tmpCode));
          this.state.code = scan.code;
       }   
       catch(e){
          scan = ""; 
       }   
      
  }

  flipCard = (data) => {
    this.setState({isFlipped: !this.state.isFlipped});
  }

  render() {
	  
      let vidBg;
      const rndInt = Math.floor(Math.random() * 2) + 1
      if(rndInt == 1) {
          vidBg = fps;
      }
      else {
          vidBg = equalizer;
      }
      let vid = 
      <div>
         <video style={{"position":"fixed","zIndex":"-1","opacity":"0.9","width":"100vw"}} autoPlay loop muted>
           <source src={vidBg} type='video/mp4' />
         </video>
      </div>;
    
    return (
	    <div>

	    <MyTerminal 
	    buyNft={this.props.buyNft} 
	    mine={this.props.mine} 
	    mintNft={this.props.mintNft} 
	    approve={this.props.approve} 
	    getMyBalance={this.props.getMyBalance} 
	    getVrByUpcId={this.props.getVrByUpcId} 
	    account={this.state.code} />

            <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal">
             <div>
	    {vid}
	        <MyTicker style={{"position":"absolute","bottom":"0"}} />
	        <UpcStatsTicker style={{"position":"absolute","bottom":"0"}} />
             </div>

             <div>
                  <form className="mb-3" onSubmit={(event) => {
                      event.preventDefault()
                      let upcId = this.upcId.value.toString()
                      let humanReadableName = this.humanReadableName.value.toString()
                      let deposit = this.deposit.value.toString()
		      deposit = window.web3.utils.toWei(deposit, "ether")

      		      this.props.buyNft(upcId,humanReadableName,deposit)
                    }}>
                    <div>
                      <label className="float-left"><b>Stake Tokens</b></label>
                      <span className="float-right text-muted">
                      </span>
                    </div>
                    <div className="input-group mb-4">
                      <input
                        type="text"
                        ref={(humanReadableName) => { this.humanReadableName = humanReadableName }}
                        className="form-control form-control-lg break"
                        placeholder=".upc Domain Name"
                        required />
      
                      <input
                        type="text"
                        ref={(upcId) => { this.upcId = upcId}}
                        className="form-control form-control-lg break"
                        placeholder="UPC"
	                value={this.state.code}
                        required />
      

                      <input
                        type="text"
                        ref={(deposit) => { this.deposit = deposit}}
                        className="form-control form-control-lg  break"
                        placeholder="Deposit Amount"
                        required />


                      <div className="input-group-append">
                        <div className="input-group-text">
                          <img src={dai} height='32' alt=""/>
                          &nbsp;&nbsp;&nbsp; xDAI
                        </div>
                      </div>
                    </div>
                    <button 
      	           type="submit" 
      	           className="btn btn-primary btn-block btn-lg"
      		  >
      		  STAKE!
      	      </button>
                  </form>

                <button onClick={() => this.flipCard('front')}
                   className="btn btn-primary btn-block btn-lg"
                >
                        Back
                </button>
             </div>
           </ReactCardFlip>
	  </div>);
  }
}

export default Intel;
