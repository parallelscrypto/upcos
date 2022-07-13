import React, { Component } from 'react'
import farmer from '../farmer.png'
import Terminal from 'react-console-emulator'

class TrebleCleff extends Component {

  render() {
    return (
	    <div>
                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw"}}
                        onClick={(e) => { 
this.props.handleFlip(e)
this.props.play()
}}
                  >play [[{this.props.account}]]</button>

                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw"}}
                        onClick={(e) => { 
                                this.props.handleFlip(e) 
                                this.props.printWelcomeMsg();
                        }}
                  >hack [[{this.props.account}]]</button>




                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw"}}
                        onClick={(e) => { 
                                     this.props.handleFlip(e)
                                     this.props.dex();
                        }}
                  >dex [[*****]]</button>




                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw"}}
                        onClick={(e) => { 
                                     this.props.handleFlip(e)
                                     this.props.search();
                        }}
                  >search [[*****]]</button>


                    <button
                        style={{background: "#FFFF00", fontSize:".9em", fontWeight:"bold", color:"red", width: "20vw", height: "20vw"}}
                        onClick={(e) => { 
                                     this.props.handleFlip(e)
                                     this.props.tutorial();
                        }}
                  >tutorial [[*****]]</button>

         </div>
    );
  }
}

export default TrebleCleff;
