import React, { Component } from 'react'
import Terminal from 'react-console-emulator'

export default class Dex extends Component {
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
                  terminal.pushToStdout(`[[balance-tubmanx]]`);
		  terminal.pushToStdout(`${theBal} TubmanX`)
                  terminal.pushToStdout(`[[/balance-tubmanx]]`);
                  // expected output: "Success!"
               });

           let balU = this.props.getStableBalance();
           balU.then((value) => {
              bal = value;
                  var balLen = bal.length;
                  var leadingNums = balLen - 6;  //there are 6 decimals for USDC
                  var firstX = bal.substr(0, leadingNums);
                  var last6 =  bal.substr(-6,6);
                  last6 = last6.padStart(6,'0');
                  
                  var balReconstructed = firstX + '.' + last6
                  terminal.pushToStdout(`[[balance-usdc]]`);
		  terminal.pushToStdout(`${balReconstructed} USDC`)
                  terminal.pushToStdout(`[[/balance-usdc]]`);
              // expected output: "Success!"
           });




         })

         return ''
       }
     },


    baltx: {
       description: '<p style="color:hotpink;font-size:1.1em">** Display your TubmanX balance **</p>',
       fn: () => {
         this.setState({progressBal: ''});
         this.setState({ isProgressing: true }, () => {
           const terminal = this.terminal.current
           var theBal;
           let bal = this.props.getMyBalance();
               bal.then((value) => {
                  theBal =window.web3.utils.fromWei(value, "ether");
                  terminal.pushToStdout(`[[balance-tubmanx]]`);
		  terminal.pushToStdout(`${theBal}`)
                  terminal.pushToStdout(`[[/balance-tubmanx]]`);
                  // expected output: "Success!"
               });

         })

         return ''
       }
     },



     balusdc: {
             description: '<p style="color:hotpink;font-size:1.1em">** TubmanX is the token used to write [[intel]] to UPC codes.  In order to acquire TubmanX, you must run the `swap` command. This will `swap` Polygon that you have purchased likely from an exchange for TubmanX from our Decentralized Mint.  No KYC or middleman required.  Specify the amount of TubmanX that you would like to exchange for the Polygon in your wallet in wei.  This will trigger a transaction that will mint equiv. TubmanX for Polygon 1:1.  Example: to buy 5 TubmanX type `swap 5000000000000000000`. In other words, this would send 5 Polygon from your wallet for 5 TubmanX from the TubmanX mint.  Visit <a href="upc://000000000010">[[000000000010]]</a> to view a video tutorial on swap</p>',
       fn: (amount) => {
         this.setState({progressBal: ''});
         this.setState({ isProgressing: true }, () => {
           const terminal = this.terminal.current
           let bal = this.props.getStableBalance();
           bal.then((value) => {
              bal = value;
                  terminal.pushToStdout(`[[balance-usdc]]`);
		  terminal.pushToStdout(`${bal}`)
                  terminal.pushToStdout(`[[/balance-usdc]]`);
              // expected output: "Success!"
           });

         })

         return ''
       }
     },

     swap: {
             description: '<p style="color:hotpink;font-size:1.1em">** TubmanX is the token used to write [[intel]] to UPC codes.  In order to acquire TubmanX, you must run the `swap` command. This will `swap` Polygon that you have purchased likely from an exchange for TubmanX from our Decentralized Mint.  No KYC or middleman required.  Specify the amount of TubmanX that you would like to exchange for the Polygon in your wallet in wei.  This will trigger a transaction that will mint equiv. TubmanX for Polygon 1:1.  Example: to buy 5 TubmanX type `swap 5000000000000000000`. In other words, this would send 5 Polygon from your wallet for 5 TubmanX from the TubmanX mint.  Visit <a href="upc://000000000010">[[000000000010]]</a> to view a video tutorial on swap</p>',
       fn: (amount) => {
         this.setState({progressBal: ''});
         this.setState({ isProgressing: true }, () => {
           const terminal = this.terminal.current
           let approval = this.props.swap(amount);
           approval.then((value) => {
              approval = value;
                  terminal.pushToStdout(`[[swap]]`);
              terminal.pushToStdout(`You have just swapped Polygon for TubmanX.  Check your Activity tab below to track the transaction. \n  Type 'bal' to see your new balance! Balances can sometimes take minutes to update.  THANK YOU! ${approval}`)
                  terminal.pushToStdout(`[[/swap]]`);
              // expected output: "Success!"
           });

         })

         return ''
       }
     },



  }



    return (
      <Terminal
        style={{"textAlign":"left","backgroundColor":"#826a43","minHeight":"100vh","color":"black"}}
        ref={this.terminal} // Assign ref to the terminal here
        commands={commands}
      />
    )
  }
}
