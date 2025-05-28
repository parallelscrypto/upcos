import React, { Component } from 'react'
import farmer from '../farmer.png'
import Terminal from 'react-console-emulator'

class TrebleCleffExp extends Component {

  constructor(props) {
    super(props)

    var showTerminal = props.showTerminal
    var flipFunction= props.handleFlip

    const ogStyle = {
       background: "#000000", 
       color:"green", 
       width: "19vw", 
       height: "20vw", 
       fontSize: "15px"
    }

    const ogMission = {
       background: "#FFFF00", 
       fontSize:".9em", 
       fontWeight:"bold", 
       color:"red", 
       width: "19vw", 
       height: "20vw", 
       fontSize: "15px", 
       verticalAlign:"middle"
    }








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
       button0Style: ogStyle,
       button1Style: ogStyle,
       button2Style: ogStyle,
       button3Style: ogStyle,
       button4Style: ogMission,

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


    const ogStyle = {
       background: "#000000", 
       color:"green", 
       width: "19vw", 
       height: "20vw", 
       fontSize: "15px"
    }

    const ogMission = {
       background: "#FFFF00", 
       fontSize:".9em", 
       fontWeight:"bold", 
       color:"red", 
       width: "19vw", 
       height: "20vw", 
       fontSize: "15px", 
       verticalAlign:"middle"
    }


    let button0Label, button0Action, button0PPL,button0Custom=false, button1Label, button1Action, button1PPL, button1Custom=false, button2Label, button2Action, button2PPL, button2Custom=false,button3Action,button3Label, button3PPL, button3Custom=false,button4Action,button4Label, button4Custom=false,button4PPL, button0CSS, button1CSS, button2CSS, button3CSS, button4CSS;


    let data = this.state.buttonConfig;

    let isTerm = this.props.terminal;

    button0CSS = button1CSS = button2CSS = button3CSS = ogStyle;
    button4CSS = ogMission;
    if( !data ) {
       if(isTerm == 'true' ) {

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


          this.setState({button0CSS})
          this.setState({button1CSS})
          this.setState({button2CSS})
          this.setState({button3CSS})
          this.setState({button4CSS})
       }
       else {
          this.setState({button0CSS})
          this.setState({button1CSS})
          this.setState({button2CSS})
          this.setState({button3CSS})
          this.setState({button4CSS})
          console.log(data);
          console.log(isTerm);
       }
       return;
    }





    //apply original styles before applying anything from json config
    this.setState({button0CSS})
    this.setState({button1CSS})
    this.setState({button2CSS})
    this.setState({button3CSS})
    this.setState({button4CSS})

    // Loop through each item in the "buttons" array and log the details
    //console.log(`Position: ${button.position}, Title: ${button.title}, payload: ${button.payload}`);


    console.log("^^^^^^^IS CONSOLE",isConsole);
    if(!isConsole) {

       data.buttons.forEach(button => {
            let position = button.position;
            switch (position) {
              case 2:
                // Logic for position 0
                button2Label   = button.title;
                button2CSS     = button.style;
                button2Action  = this.props.dynamicPPL;
                button2PPL  = button.payload.trim().split(" ");
                console.log("^^^^^^^IS CONSOLE pos 2 no console",button2Action);
                this.setState({button2Terminal: false})
                this.setState({button2Label})
                this.setState({button2CSS})
                this.setState({button2Action})
                this.setState({button2PPL})
                this.setState({button2Custom: true})
                break;
              
              case 3:
                button3Label   = button.title;
                button3CSS     = button.style;
                button3Action  = this.props.dynamicPPL;
                button3PPL  = button.payload.trim().split(" ");
                this.setState({button3Terminal: false})
                this.setState({button3Label})
                this.setState({button3CSS})
                this.setState({button3Action})
                this.setState({button3PPL})
                this.setState({button3Custom: true})
                break;
              
              case 4:
                // Logic for position 2
                button4Label   = button.title;
                button4CSS     = button.style;
                button4Action  = this.props.dynamicPPL;
                button4PPL  = button.payload.trim().split(" ");
console.log("PPPPPPPPPPLLLLLLL" + button4PPL );
                this.setState({button4Terminal: false})
                this.setState({button4Label})
                this.setState({button4CSS})
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
              case 7:
                // Logic for position 4
                button2Label   = button2.title;
                button2CSS = button2.style;
                button2Action  = this.props.dynamicPPL;
                button2PPL  = button2.payload.trim().split(" ");
                this.setState({button2Terminal: true})
                this.setState({button2Label})
                this.setState({button2CSS})
                this.setState({button2Action})
                this.setState({button2PPL})
                this.setState({button2Custom: true})
                break;
              
              case 8:
                // Logic for position 5
                button3Label   = button2.title;
                button3CSS   = button2.style;
                button3Action  = this.props.dynamicPPL;
                button3PPL  = button2.payload.trim().split(" ");
                this.setState({button3Terminal: true})
                this.setState({button3Label})
                this.setState({button3CSS})
                this.setState({button3Action})
                this.setState({button3PPL})
                this.setState({button3Custom: true})
                break;
              
              case 9:
                // Logic for position 6
                button4Label   = button2.title;
                button4CSS   = button2.style;
                button4Action  = this.props.dynamicPPL;
                button4PPL  = button2.payload.trim().split(" ");
console.log("PPPPPPPPPPLLLLLLL" + button4PPL );
                this.setState({button4Terminal: true})
                this.setState({button4Label})
                this.setState({button4CSS})
                this.setState({button4Action})
                this.setState({button4PPL})
                this.setState({button4Custom: true})
                break;
              
             }

       });
    }


    this.setState({button0Label: "home"})
    this.setState({button0Action: this.props.showHome})


    this.setState({buttonLabel: "console"})
    this.setState({button1Action: this.props.showTerminal})

    
console.log("############CURRENT STATE ##############3",this.state);

   }


   componentDidMount = async () => {




    var consoleButton;
    console.log("terminal props is");
    console.log(this.props);

    //let jsonUrl = 'https://3tinxbjzlpl2oxah6nd77nafe3r6ebkbfth6hpt2vzr3ptx734ma.arweave.net/3NDbhTlb16dcB_NH_7QFJuPiBUEsz-O-eq5jt87_3xg';
    //let jsonUrl = 'https://7jllktrkyancne7eixsgpkyrd3wbimumubgnxzj6i4zt7bvyzvea.arweave.net/-la1TirAGiaT5EXkZ6sRHuwUMoygTNvlPkczP4a4zUg';
    //let jsonUrl = 'https://5tlkgdn2zyvbbtxasb25oe77urj5yye43f4rqmjfu5rbstwp7qfq.arweave.net/7NajDbrOKhDO4JB11xP_pFPcYJzZeRgxJadiGU7P_As';
    //let jsonUrl = 'https://6fh7ldgp2bo4xtqv4si5nvzj3tyna7o2emo5zy7dp4vex74t2dta.arweave.net/8U_1jM_QXcvOFeSR1tcp3PDQfdojHdzj438qS_-T0OY';
    //let jsonUrl = 'https://s7foe4veu7dvxjz3aqvafzsouyoihbfchlozq6qdo3heswnfvlda.arweave.net/l8ricqSnx1unOwQqAuZOphyDhKI63Zh6A3bOSVmlqsY';
    //let jsonUrl = 'https://c3i3bwxszycvdmn7o4toaqtu6247w3xkbzuyhaer3qqssm37f2bq.arweave.net/FtGw2vLOBVGxv3cm4EJ09rn7buoOaYOAkdwhKTN_LoM';
    //let jsonUrl = 'https://lx7lvmf4bxrvxxaqssrsi5pyfpdqdaxjpt3xnw3orj4a3ojci2vq.arweave.net/Xf66sLwN41vcEJSjJHX4K8cBgul893bbbop4DbkiRqs';

    let jsonUrl;

    let config;
    if(this.props.configUrl) {
       jsonUrl = this.props.configUrl;
       config  = await this.fetchConfig(jsonUrl);
    }

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    <button
                        style={this.state.button0CSS}
                        onClick={(e) => {

                                          let console0 = this.state.button0Terminal
                                          if( this.state.button0Custom ) {
                                             this.state.button0Action(this.state.button0PPL,console0)
                                          }
                                          else { 
                                             this.state.button0Action(e)
                                          } 
                        }}
                  >{this.state.button0Label}</button>

                    <button
                        style={this.state.button1CSS}
                        onClick={(e) => {
                                          let console1 = this.state.button1Terminal
                                          if( this.state.button1Custom ) {
console.log("MOOOOOOOO");
                                             this.state.button1Action(this.state.button1PPL, console1)
                                          }
                                          else { 

                                             this.state.button1Action(e)
                                          } 
                        }}
                  >{this.state.button1Label}</button>

                    <button
                        style={this.state.button2CSS}
                        onClick={() => {
                                          let console2 = this.state.button2Terminal
                                          if( this.state.button2Custom ) {

                                             console.log("^^^^^^^IS CONSOLE pos 2 no console",);
                                             this.state.button2Action(this.state.button2PPL,console2)
                                          }
                                          else { 
                                             this.state.button2Action()
                                          } 
                        }}

                  >{this.state.button2Label}</button>

                    <button
                        style={this.state.button3CSS}
                        onClick={() => {
                                          let console3 = this.state.button3Terminal
                                          if( this.state.button3Custom ) {
                                             this.state.button3Action(this.state.button3PPL,console3)
                                          }
                                          else { 
                                             this.state.button3Action()
                                          } 
                        }}

                  >{this.state.button3Label}</button>


                    <button
                        style={this.state.button4CSS}
                        onClick={() => {
                                          let console4 = this.state.button4Terminal
                                          if( this.state.button4Custom ) {
                                             this.state.button4Action(this.state.button4PPL,console4)
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
