import React, { Component } from 'react'
import farmer from '../farmer.png'
import Terminal from 'react-console-emulator'

class BassCleff extends Component {

  render() {
    return (
	    <div>

                    <button
                        style={{background: "#000000", color:"orange", width: "25vw", height: "25vw"}}
                        onClick={(e) => { 
                                //this.props.handleFlip(e) 
                                this.props.upload();
                        }}
                  >upload [[{this.props.account}]]</button>


                    <button
                        style={{background: "#000000", color:"orange", width: "25vw", height: "25vw"}}
                        onClick={(e) => { 
this.props.flip()
}}
                  >sell [[{this.props.account}]]</button>




                    <button
                        style={{background: "#000000", color:"orange", width: "25vw", height: "25vw"}}
                        onClick={(e) => { 
                                     this.props.handleFlip(e)
                                     this.props.angel();
                        }}
                  >angel [[{this.props.account}]]</button>




                    <button
                        style={{background: "#000000", color:"orange", width: "25vw", height: "25vw"}}
                        onClick={(e) => { 
                                     this.props.handleFlip(e)
                                     this.props.prodLookup(this.props.account);
                        }}
                  >set_price [[{this.props.account}]]</button>
         </div>
    );
  }
}

export default BassCleff;
