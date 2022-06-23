import React, { Component } from 'react'
import Terminal from 'react-console-emulator'

export default class MyTerminal extends Component {
  constructor (props) {
    super(props)
    this.terminal = React.createRef()
  }

  // Experimental syntax, requires Babel with the transform-class-properties plugin
  // You may also define commands within render in case you don't have access to class field syntax
  render () {

  var commands = {
    wait: {
      description: 'Waits one second and sends a message.',
      fn: () => {
        const terminal = this.terminal.current
        setTimeout(() => terminal.pushToStdout('Hello after 1 second!'), 1500)
        return 'Running, please wait...'
      }
    },

    bal: {
       description: '<p style="color:hotpink;font-size:1.1em">** Display your TubmanX balance **</p>',
       fn: () => {
         this.setState({progressBal: ''});
         this.setState({ isProgressing: true }, () => {
           const terminal = this.terminal.current
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
                  terminal.pushToStdout(`[[inclusion-balance]]`);
               this.setState({ progress: this.state.progress + 10 }, () => terminal.pushToStdout(`Balance: ${theBal}` + " TubmanX"))
                  terminal.pushToStdout(`[[/inclusionx-balance]]`);
             }
           }, 1500)
         })

         return ''
       }
     },

  }



    return (
      <Terminal
        ref={this.terminal} // Assign ref to the terminal here
        commands={commands}
      />
    )
  }
}
