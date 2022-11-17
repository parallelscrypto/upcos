import React, { Component } from 'react'
import farmer from '../farmer.png'
import Terminal from 'react-console-emulator'

class TrebleCleff extends Component {

  constructor(props) {
    super(props)
    this.state = {
       upcStatus: "",
       buttonBg: "#000000",
       buttonFg: "green",

    }
  }


  componentDidMount = async () => {

    this.state = {
       account: this.props.account,
       upcStatus: upcStatus
    }
    var upcNum  = this.props.account;
    var upcInfo = this.props.upcInfo(upcNum);
    var myAddress = this.props.address;
    var upcStatus = "";
    var self = this;
    upcInfo.then((value) => { 
        var og      = value['og'];
        var staker  = value['staker'];
        //not colonized, not minted
        if( staker.includes('000000') && og.includes('000000') ) {
           upcStatus = "ask";
        }
        //colonized, not minted
        else if( !staker.includes('000000') && og.includes('000000') ) {
           upcStatus = "*mint*";
           this.setState({buttonBg: "orange"});
           this.setState({buttonFg: "green"});
        }
        //visitor
        else if( (myAddress != staker) && ( !staker.includes('000000') && !og.includes('000000') ) ) {
           upcStatus = "console";
        }
        //owner
        else if( (myAddress == staker) && ( !staker.includes('000000') && !og.includes('000000') ) ) {
           upcStatus = "admin";
        }
        else {
           upcStatus = "other";
        }

        self.setState({
           upcStatus: upcStatus
        })



       });

  }


  render() {
    var bcfg = {background: this.state.buttonBg, color: this.state.buttonFg, width: "20vw", height: "20vw"}
    return (
	    <div>
                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw"}}
                        onClick={(e) => { 
this.props.play()
}}
                  >play [[{this.props.account}]]</button>

                    <button
                        style={bcfg}
                        onClick={(e) => { 
                                this.props.handleFlip(e) 
                                this.props.printWelcomeMsg();
                        }}
                  >{this.state.upcStatus} [[{this.props.account}]]</button>




                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw"}}
                        onClick={(e) => { 
                                     this.props.meeting();
                        }}
                  >meeting [[*****]]</button>




                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw"}}
                        onClick={(e) => { 
                                     //this.props.handleFlip(e)
                                     this.props.search();
                        }}
                  >search [[*****]]</button>


                    <button
                        style={{background: "#FFFF00", fontSize:".9em", fontWeight:"bold", color:"red", width: "20vw", height: "20vw"}}
                        onClick={(e) => { 
                                     this.props.tutorial();
                        }}
                  >mission [[*****]]</button>

         </div>
    );
  }
}

export default TrebleCleff;
