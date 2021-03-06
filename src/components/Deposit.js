import React, { Component } from 'react'
import dai from '../dai.png'
import ReactCardFlip from 'react-card-flip';

class Deposit extends Component {

  constructor(props) {
    super(props)
    this.state = {
      daiTokenBalance: '0',
      isFlipped: false,
    }
  }

   getScannables = async () => {
    const { accounts, contract } = this.state;


    let balance = this.props.getMyBalance();
    let self = this;
    balance.then(function(balanceResult){
      self.setState({daiTokenBalance: balanceResult});
    });
    return balance;

  };

 
  componentDidMount(){
    var self = this;
    setInterval(function() {
        return self.getScannables();
     }, 5000);
 
    return this.getScannables();
  }

  flipCard = (data) => {
    this.setState({isFlipped: !this.state.isFlipped});
  }


  render() {
    return (

            <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal">
             <div>
                <button onClick={() => this.flipCard('spin')}
                   className="btn btn-success btn-block btn-lg"
                >
                        Play Chip
                </button>
                <button onClick={() => this.flipCard('cm')}
                   className="btn btn-dark btn-block btn-lg"
                >
                  *crypto mode*
                </button>
             </div>
             <div>
                  <form className="mb-3" onSubmit={(event) => {
                      event.preventDefault()
                      let amount
                      amount = this.input.value.toString()
                      amount = window.web3.utils.toWei(amount, 'Ether')
                      let upc
      		upc = this.input2.value.toString()
      		this.props.stakeTokens(amount,upc)
                    }}>
                    <div>
                      <label className="float-left"><b>Stake Tokens</b></label>
                      <span className="float-right text-muted">
                        Your Balance: {window.web3.utils.fromWei(this.state.daiTokenBalance, 'Ether')}
                      </span>
                    </div>
                    <div className="input-group mb-4">
                      <input
                        type="text"
                        ref={(input) => { this.input = input }}
                        className="form-control form-control-lg"
      	          onChange={this.props.handleChange}
                        placeholder="xDAI"
                        required />
      
                      <input
                        type="text"
                        ref={(input2) => { this.input2 = input2 }}
                        className="form-control form-control-lg"
      	          onChange={this.props.updateUpc}
                        placeholder="String"
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
           </ReactCardFlip>);
  }
}

export default Deposit;
