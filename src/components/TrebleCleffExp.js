import React, { Component } from 'react'
import farmer from '../farmer.png'
import Terminal from 'react-console-emulator'

class TrebleCleffExp extends Component {

  constructor(props) {
    super(props)

    var showTerminal = props.showTerminal
    var flipFunction= props.handleFlip


    this.state = {
       upcStatus: "",
       buttonBg: "#000000",
       buttonFg: "green",
       consoleButton: "console",
       popsButton: "pops",
       showTerminal: showTerminal,
       handleFlip: flipFunction
    }
  }


  componentDidMount = async () => {
    var consoleButton;
    console.log("terminal props is");
    console.log(this.props);


    if(this.props.terminal==='true') {
       this.setState({consoleButton: 'terminal'})
       this.setState({popsButton: 'load'})
    }



    var upcNum  = this.props.account;

    var channelNum = upcNum.substr(-1);
    var upcInfo = this.props.upcInfo(upcNum);
    var myAddress = this.props.address;
    var upcStatus = "";
    var self = this;

    this.state = {
       account: this.props.account,
       upcStatus: upcStatus,
       channelNum: channelNum
    }



    upcInfo.then((value) => { 
        var og      = value['og'];
        var staker  = value['staker'];
        //not colonized, not minted
        if( staker.includes('000000') && og.includes('000000') ) {
           upcStatus = "buy";
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

    return (
	    <div>
                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw", fontSize: "15px"}}
                        onClick={this.props.showHome}
                  >home</button>


                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw", fontSize: "15px"}}
                        onClick= {this.state.showTerminal}
                  >{this.state.consoleButton}<br/></button>

                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw", fontSize: "15px"}}
                        onClick={this.props.showPops}
                  >{this.state.popsButton}</button>




                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw", fontSize: "15px"}}
                        onClick={this.props.showSearch}
                  >search</button>


                    <button
                        style={{background: "#FFFF00", fontSize:".9em", fontWeight:"bold", color:"red", width: "20vw", height: "20vw", fontSize: "15px", verticalAlign:"middle"}}
                        onClick={this.props.showMission}
                  >mission [FLIP]</button>

         </div>
    );
  }
}

export default TrebleCleffExp;
