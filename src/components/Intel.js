import React, { Component } from 'react'
import dai from '../dai.png'
import MyTerminal from './MyTerminal'
import NftPopupTicker from './NftPopupTicker'
import UpcStatsTicker from './UpcStatsTicker'
import ReactCardFlip from 'react-card-flip';
import Modal from 'react-modal';




class Intel extends Component {

  constructor(props) {
    super(props)
    this.state = {
      code: "",
      isFlipped: false,
      modalIsOpen: false
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

  openModal = () => {
    this.setState({modalIsOpen: true});
  }

  closeModal = () => {
    this.setState({modalIsOpen: false});
  }



  render() {

    return (
	    <div>

	    <MyTerminal 
	    address={this.props.address} 
	    mine={this.props.mine} 

	    buyNftNav={this.props.buyNftNav} 
	    mintNftNav={this.props.mintNftNav} 
	    approveNav={this.props.approveNav} 
	    upcInfoNav={this.props.upcInfoNav} 
	    nftInfoNav={this.props.nftInfoNav} 
	    latestTokenIdNav={this.props.latestTokenIdNav} 


	    buyNft={this.props.buyNft} 
	    mintNft={this.props.mintNft} 
	    approve={this.props.approve} 
	    swap={this.props.swap}
	    wm={this.props.wm}
	    wn={this.props.wn}
	    wa={this.props.wa}
	    pbal={this.props.pbal}
	    pigin={this.props.pigin}
	    pigout={this.props.pigout}
	    setMarketPrice={this.props.setMarketPrice}
	    sendToMarket={this.props.sendToMarket}
	    buyFromMarket={this.props.buyFromMarket}
	    collectFromMarket={this.props.collectFromMarket}
	    getSaleInfo={this.props.getSaleInfo}
	    getMyBalance={this.props.getMyBalance} 
	    getVrByUpcId={this.props.getVrByUpcId} 
	    getMyNfts={this.props.getMyNfts} 
	    setVr={this.props.setVr} 
	    setIpfs={this.props.setIpfs} 
	    upcInfo={this.props.upcInfo} 
	    nftInfo={this.props.nftInfo} 
	    latestTokenId={this.props.latestTokenId} 
	    account={this.state.code} />

            <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal">
             <div>
	        <NftPopupTicker code={this.state.code} style={{"position":"absolute","bottom":"0"}} />
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
