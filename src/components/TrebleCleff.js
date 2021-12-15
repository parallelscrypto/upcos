import React, { Component } from 'react'
import farmer from '../farmer.png'
import Terminal from 'react-console-emulator'

class TrebleCleff extends Component {

  render() {
    return (
	    <div>
                    <button
                        style={{background: "#000000", color:"green", width: "25vw", height: "25vw"}}
                        onClick={(e) => { 
this.props.handleFlip(e)
this.props.play()
}}
                  >play [[{this.props.account}]]</button>

                    <button
                        style={{background: "#000000", color:"green", width: "25vw", height: "25vw"}}
                        onClick={(e) => { 
                                this.props.handleFlip(e) 
                                this.props.printWelcomeMsg();
                        }}
                  >hack [[{this.props.account}]]</button>




                    <button
                        style={{background: "#000000", color:"green", width: "25vw", height: "25vw"}}
                        onClick={(e) => { 
                                     this.props.handleFlip(e)
                                     this.props.hero();
                        }}
                  >hero [[{this.props.account}]]</button>




                    <button
                        style={{background: "#000000", color:"green", width: "25vw", height: "25vw"}}
                        onClick={(e) => { 
                                     this.props.handleFlip(e)
                                     this.props.prodLookup(this.props.account);
                        }}
                  >product [[{this.props.account}]]</button>
         </div>
    );
  }
}

export default TrebleCleff;
