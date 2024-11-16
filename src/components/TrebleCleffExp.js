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
       button0Label: "home",
       button1Label: "console",
       button2Label: "hero",
       button3Label: "discuss",
       button4Label: "mission",
       showTerminal: showTerminal,
       upc: "",
       msg: props.msg,
       handleFlip: flipFunction
    }
  }

  execute= async () => {
     console.log("in terminal");
     console.log(this.props.msg);
     this.props.execute(this.state.msg);
  }

   fetchConfig = async (url) => {
     
       // Fetch the data from the URL
       const response = await fetch(url);
       
       // Check if the response is successful
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
       
       // Parse the JSON data
       const data = await response.json();
       this.setState({ buttonConfig: data})
       

   }

   //position 0-4 as params
   setButtons = async (isConsole=false) => {

    let data = this.state.buttonConfig;
    let button0Label, button0Action, button0PPL,button0Custom=false, button1Label, button1Action, button1PPL, button1Custom=false, button2Label, button2Action, button2PPL, button2Custom=false,button3Action,button3Label, button3PPL, button3Custom=false,button4Action,button4Label, button4Custom=false,button4PPL, button5Label, button5Action, button5PPL ,button6Label, button6Action, button6PPL


    // Loop through each item in the "buttons" array and log the details
    //console.log(`Position: ${button.position}, Title: ${button.title}, payload: ${button.payload}`);


    if(!isConsole) {

       data.buttons.forEach(button => {
            let position = button.position;
            switch (position) {
              case 2:
                // Logic for position 0
                button2Label   = button.title;
                button2Action  = this.props.dynamicPPL;
                button2PPL  = button.link.trim().split(" ");
                this.setState({button2Label})
                this.setState({button2Action})
                this.setState({button2PPL})
                this.setState({button2Custom: true})
                break;
              
              case 3:
                button3Label   = button.title;
                button3Action  = this.props.dynamicPPL;
                button3PPL  = button.link.trim().split(" ");
                this.setState({button3Label})
                this.setState({button3Action})
                this.setState({button3PPL})
                this.setState({button3Custom: true})
                break;
              
              case 4:
                // Logic for position 2
                button4Label   = button.title;
                button4Action  = this.props.dynamicPPL;
                button4PPL  = button.link.trim().split(" ");
console.log("PPPPPPPPPPLLLLLLL" + button4PPL );
                this.setState({button4Label})
                this.setState({button4Action})
                this.setState({button4PPL})
                this.setState({button4Custom: true})
                break;
              
            }




       });
    }
    else {

       button1Label = 'exe';
       button2Label = 'etc';
       button3Label = 'discuss';
       button4Label = 'anon';


       button1Action = this.props.showPopsWithCode
       button2Action = this.props.doEtc
       button3Action = this.props.showPostTerminal
       button4Action = this.hackIt


       this.setState({button1Label})
       this.setState({button1Action})

       this.setState({button2Label})
       this.setState({button2Action})

       this.setState({button3Label})
       this.setState({button3Action})

       this.setState({button4Label})
       this.setState({button4Action})

       data.buttons.forEach(button2 => {
            let position2 = button2.position;
            switch (position2) {
              case 6:
                // Logic for position 3
                button1Label   = button2.title;
                button1Action  = this.props.dynamicPPL;
                button1PPL     = button2.link.trim().split(" ");
                this.setState({button1Label})
                this.setState({button1Action})
                this.setState({button1PPL})
                this.setState({button1Custom: true})
                break;
              
              case 7:
                // Logic for position 4
                button2Label   = button2.title;
                button2Action  = this.props.dynamicPPL;
                button2PPL  = button2.link.trim().split(" ");
                this.setState({button2Label})
                this.setState({button2Action})
                this.setState({button2PPL})
                this.setState({button2Custom: true})
                break;
              
              case 8:
                // Logic for position 5
                button3Label   = button2.title;
                button3Action  = this.props.dynamicPPL;
                button3PPL  = button2.link.trim().split(" ");
                this.setState({button3Label})
                this.setState({button3Action})
                this.setState({button3PPL})
                this.setState({button3Custom: true})
                break;
              
              case 9:
                // Logic for position 6
                button4Label   = button2.title;
                button4Action  = this.props.dynamicPPL;
                button4PPL  = button2.link.trim().split(" ");
console.log("PPPPPPPPPPLLLLLLL" + button4PPL );
                this.setState({button4Label})
                this.setState({button4Action})
                this.setState({button4PPL})
                this.setState({button4Custom: true})
                break;
              
             }

       });
    }


    this.setState({button0Label: "home"})
    this.setState({button0Action: this.props.showHome})


    //if on front stage
    if(this.props.terminal==='false') {
       if(!button1Label) {
          this.setState({buttonLabel: "console"})
          this.setState({button1Action: this.props.showTerminal})
       }
       else {
          this.setState({button1Label})
          this.setState({button1Action})
       }
    }

    

   }


   componentDidMount = async () => {
    var consoleButton;
    console.log("terminal props is");
    console.log(this.props);

    //let jsonUrl = 'https://3tinxbjzlpl2oxah6nd77nafe3r6ebkbfth6hpt2vzr3ptx734ma.arweave.net/3NDbhTlb16dcB_NH_7QFJuPiBUEsz-O-eq5jt87_3xg';
    //let jsonUrl = 'https://7jllktrkyancne7eixsgpkyrd3wbimumubgnxzj6i4zt7bvyzvea.arweave.net/-la1TirAGiaT5EXkZ6sRHuwUMoygTNvlPkczP4a4zUg';
    //let jsonUrl = 'https://5tlkgdn2zyvbbtxasb25oe77urj5yye43f4rqmjfu5rbstwp7qfq.arweave.net/7NajDbrOKhDO4JB11xP_pFPcYJzZeRgxJadiGU7P_As';
    //let jsonUrl = 'https://6fh7ldgp2bo4xtqv4si5nvzj3tyna7o2emo5zy7dp4vex74t2dta.arweave.net/8U_1jM_QXcvOFeSR1tcp3PDQfdojHdzj438qS_-T0OY';
    let jsonUrl = 'https://xcpfgr4l24syfcrsb3jsn533oe2ab266tmho43ax2xh45skx2moq.arweave.net/uJ5TR4vXJYKKMg7TJvd7cTQA696bDu5sF9XPzslX0x0';


    let config = await this.fetchConfig(jsonUrl);

    var middleButton = this.props.showPops
    var showPost = this.props.showPost

    this.state = {
       account: this.props.account,
       upcStatus: upcStatus,
       channelNum: channelNum,
       middleButton: middleButton
    }

    let button0Action = this.props.showHome;
    let button1Action = this.props.showTerminal;
    let button2Action = this.props.middleButton;
    let button3Action = this.props.showPost;
    let button4Action = this.props.showMission;

    this.setState({upc: this.props.upc})
    this.setState({ button0Action})
    this.setState({ button1Action})
    this.setState({ button2Action})
    this.setState({ button3Action})
    this.setState({ button4Action})

    let isSet = await this.setButtons();
    if(this.props.terminal==='true') {
       isSet = await this.setButtons(true);
    }


console.log("STATE");
console.log(this.state);

    var upcNum  = this.props.account;

    var channelNum = upcNum.substr(-1);
    var upcInfo = this.props.upcInfo(upcNum);
    var myAddress = this.props.address;
    var upcStatus = "";
    var self = this;



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
                        onClick={this.state.button0Action}
                  >{this.state.button0Label}</button>


                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw", fontSize: "15px"}}
                        onClick={this.state.button1Action}
                  >{this.state.button1Label}</button>

                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw", fontSize: "15px"}}
                        onClick={this.state.button2Action}
                  >{this.state.button2Label}</button>




                    <button
                        style={{background: "#000000", color:"green", width: "20vw", height: "20vw", fontSize: "15px"}}
                        onClick={this.state.button3Action}
                  >{this.state.button3Label}</button>


                    <button
                        style={{background: "#FFFF00", fontSize:".9em", fontWeight:"bold", color:"red", width: "20vw", height: "20vw", fontSize: "15px", verticalAlign:"middle"}}
                        onClick={() => {
                                          if( this.state.button4Custom ) {
                                             this.state.button4Action(this.state.button4PPL)
                                          }
                                          else { 
                                             this.state.button4Action()
                                          } 
                        }}

                  >{this.state.button4Label} [FLIP]</button>

         </div>
    );
  }
}

export default TrebleCleffExp;
