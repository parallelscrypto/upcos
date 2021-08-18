import React, { Component } from 'react'
import Terminal from 'react-console-emulator'
import ScratchCard from './ScratchCard'
import MatrixBg from './extra/matrixbg.png'
import Modal from "react-animated-modal";
import Iframe from 'react-iframe';
import axios from "axios";

const commands = {
  echo: {
    description: 'Echo a passed string.',
    usage: 'echo <string>',
    fn: function () {
      return `${Array.from(arguments).join(' ')}`
    }
  }
}

export default class MyTerminal extends Component {

  constructor(props) {
    super(props)
    this.progressTerminal = React.createRef()
    this.state = {
       account: props.account,
       progress: 0,
       approved: '',
       vrLink: '',
       showModal: false,
       progressBal: ''
    }
  }

  render () {
    var promptlabel = this.state.account + '@upc_shell>';
    return (
      <div>
      <Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showModal} closemodal={() => this.setState({ showModal: false })} type="hinge" >{this.state.vrLink}</Modal>
      <Terminal
        style={{"maxHeight":"300px",backgroundColor: "#000",   backgroundImage: "url(" + MatrixBg + ")",}}
        dangerMode={true}
        ref={this.progressTerminal}
        commands={{
            bal: {
              description: 'Displays a progress counter.',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getMyBalance();
                      bal.then((value) => {
                         theBal =window.web3.utils.fromWei(value, "ether");
                         // expected output: "Success!"
                      });


                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: bal});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 }, () => terminal.pushToStdout(`Balance: ${theBal}` + " xUPC"))
                    }
                  }, 1500)
                })

                return ''
              }
            },
            apr: {
              description: 'Displays a progress counter.',
              fn: () => {
                var progress = 0;
                this.setState({progressBal: ''});
                this.setState({progress: 0});
                this.setState({approved: false});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.approve();


                  const intervalApprov = setInterval(() => {
                    if (!this.state.approved) { // Stop at 100%
                      terminal.clearStdout();
                      this.setState({ progress: this.state.progress + 1 }, () => terminal.pushToStdout(`Request Processing: ${this.state.progress}`))
                    }
                  }, 1000)
                      approval.then((value) => {
                         approval = value;
                         // expected output: "Success!"

                         const interval = setInterval(() => {
                           if (!value) { // Stop at 100%
                             this.setState({ progress: this.state.progress + 10 }, () => terminal.pushToStdout(`Request Processing: ${progress}`))
                           } else {
                             this.setState({approved: true});
                             var self = this;
                             this.setState({ progress: this.state.progress + 10 }, () => terminal.pushToStdout(`Approved: ${approval}`))
                             
                             clearInterval(interval)
                           }
                         }, 1500)
                  });
                })

                return ''
              }
            },
            buy: {
              description: 'Displays a progress counter.',
              fn: (humanReadableName) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.buyNft(this.state.account, humanReadableName);
                      approval.then((value) => {
                         approval = value;
                         // expected output: "Success!"
                      });


                  const interval = setInterval(() => {
                    if (this.state.approved != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({approved: approval});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 }, () => terminal.pushToStdout(`Approved: ${approval}`))
                    }
                  }, 1500)
                })

                return ''
              }
            },


            vr: {
              description: 'Displays a progress counter.',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.getVrByUpcId(this.state.account);
	          var self = this;
                  approval.then((value) => {
		     self.setState({approved: "true"});
		     self.setState({showModal: true});
                     var link = <a href={value}>Click to visit my VR</a>
		     self.setState({vrLink: link});

		     axios.get(value)
                     .then(function (response) {
                       // handle success
                       console.log(response);
                     })
		     terminal.pushToStdout(value)
	          });
                })

                return ''
              }
            },


            mine: {
              description: 'Displays a progress counter.',
              fn: () => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.mine();
                  approval.then((value) => {
                     approval = value;
                     // expected output: "Success!"
                  });


                  const interval = setInterval(() => {
                    if (this.state.approved != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({approved: approval});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 }, () => terminal.pushToStdout(`Congrats! You just mined some crypto. \n  Type 'bal' to see your new balance! ${approval}`))
                    }
                  }, 1500)
                })

                return ''
              }
            },

            mint: {
              description: 'Displays a progress counter.',
              fn: (upcId) => {
                this.setState({progressBal: ''});
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  let approval = this.props.mintNft(upcId);
                      approval.then((value) => {
                         approval = value;
                         // expected output: "Success!"
                      });


                  const interval = setInterval(() => {
                    if (this.state.approved != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({approved: approval});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 }, () => terminal.pushToStdout(`Congrats! You own UPCNFT # ${approval}`))
                    }
                  }, 1500)
                })

                return ''
              }
            }
          }}
        welcomeMessage={'Welcome to UPC Matrix! \n Type `fire` for tutorial'}
        promptLabel={promptlabel}
        autoFocus={true}
	promptLabelStyle={{"color":"green", "fontWeight":"bold", "fontSize":"1.1em"}}
      />

      </div>
    )
  }
}
