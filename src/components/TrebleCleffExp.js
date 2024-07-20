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
       missionButton: "mission",
       popsButton: "pops",
       showTerminal: showTerminal,
       upc: "",
       handleFlip: flipFunction
    }
  }


  componentDidMount = async () => {
    var consoleButton;
    console.log("terminal props is");
    console.log(this.props);

    var middleButton = this.props.showPops
    var showPost = this.props.showPost


    this.setState({upc: this.props.upc})
    this.setState({middleButton: this.props.showPops})
    this.setState({showPost: this.props.showPost})
    this.setState({hackButton: this.props.showMission})

    if(this.props.terminal==='true') {
       this.setState({consoleButton: 'etc'})
       this.setState({missionButton: 'hack'})
       this.setState({popsButton: 'hero'})
       this.setState({showTerminal: this.props.doEtc})
       this.setState({hackButton: this.hackIt})
       this.setState({middleButton: this.props.heroScan})
       this.setState({showPost: this.props.showPostTerminal})

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
       channelNum: channelNum,
       middleButton: middleButton
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


  hackIt = async () => {
     this.props.doHack(this.state.upcc);
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
                        onClick={this.state.middleButton}
                  >{this.state.popsButton}</button>




                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw", fontSize: "15px"}}
                        onClick={this.state.showPost}
                  >post</button>


                    <button
                        style={{background: "#FFFF00", fontSize:".9em", fontWeight:"bold", color:"red", width: "20vw", height: "20vw", fontSize: "15px", verticalAlign:"middle"}}
                        onClick={this.state.hackButton}
                  >{this.state.missionButton} [FLIP]</button>

         </div>
    );
  }
}

export default TrebleCleffExp;
