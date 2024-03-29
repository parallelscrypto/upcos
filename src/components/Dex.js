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


    step0t: {
            description: '<p style="color:hotpink;font-size:1.1em">** Approve UPC Band Radio to spend 50 of your Narativ.  After you have spent 50, you must run approve again.    You MUST run this command FIRST or all of your `hack` and `own` commands will fail. Visit <a href="upc://000000000011">[[000000000011]]</a> to view a video tutorial on approve **</p>',
      fn: () => {
          const terminal = this.terminal.current
        var progress = 0;
        this.setState({approved: false});
        this.setState({ isProgressing: true }, () => {
          let approval = this.props.approveUPCS();
          approval.then((value) => {
             terminal.pushToStdout(`You have approved UPC Band Radio to transfer sufficient Narativ from your wallet when you buy an NFT.  This approval is good for 50 NFTs.  After you have bought 50, you must run this command again, or your 'hack' and 'hackb' commands will fail`)
             // expected output: "Success!"
          });
        })

                 terminal.pushToStdout(`[[approve]]`);
        terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                 terminal.pushToStdout(`[[/approve]]`);
        return ''
      }
    },

    step0u: {
            description: '<p style="color:hotpink;font-size:1.1em">** Approve UPC Band Radio to spend 99999 of your Narativ.  After you have spent 99999, you must run approve again.    You MUST run this command FIRST or all of your `hack` and `own` commands will fail. Visit <a href="upc://000000000011">[[000000000011]]</a> to view a video tutorial on approve **</p>',
      fn: () => {
          const terminal = this.terminal.current
        var progress = 0;
        this.setState({approved: false});
        this.setState({ isProgressing: true }, () => {
          let approval = this.props.approveTubman4UPCS();
          approval.then((value) => {
             terminal.pushToStdout(`You can now swap your Narativ tokens for UPCStable using the 'upcs' command.  If you want 5 upcs, you need 25 Narativ as there is a 5:1 exchange ratio.  The command to swap 25 Narativ for 5 UPCS would be 'upcs 5000000000000000000'`)
             // expected output: "Success!"
          });
        })

                 terminal.pushToStdout(`[[approve]]`);
        terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                 terminal.pushToStdout(`[[/approve]]`);
        return ''
      }
    },




    recon: {
            description: '<p style="color:hotpink;font-size:1.1em">** Approve UPC Band Radio to spend 50 of your Narativ.  After you have spent 50, you must run approve again.    You MUST run this command FIRST or all of your `hack` and `own` commands will fail. Visit <a href="upc://000000000011">[[000000000011]]</a> to view a video tutorial on approve **</p>',
      fn: () => {
          const terminal = this.terminal.current
        var progress = 0;
        this.setState({approved: false});
        this.setState({ isProgressing: true }, () => {
          let approval = this.props.approve();
          approval.then((value) => {
             terminal.pushToStdout(`You have approved UPC Band Radio to transfer sufficient Narativ from your wallet when you buy an NFT.  This approval is good for 50 NFTs.  After you have bought 50, you must run this command again, or your 'hack' and 'hackb' commands will fail`)
             // expected output: "Success!"
          });
        })

                 terminal.pushToStdout(`[[approve]]`);
        terminal.pushToStdout(`Processing approval. Check the activity tab for detailed info`)
                 terminal.pushToStdout(`[[/approve]]`);
        return ''
      }
    },
    bal: {
       description: '<p style="color:hotpink;font-size:1.1em">** Display your Narativ balance **</p>',
       fn: () => {
         this.setState({progressBal: ''});
         this.setState({ isProgressing: true }, () => {
           const terminal = this.terminal.current
           var theBal;
           let bal = this.props.getMyBalance();
               bal.then((value) => {
                  theBal =window.web3.utils.fromWei(value, "ether");
                  terminal.pushToStdout(`[[balance-narativ]]`);
		  terminal.pushToStdout(`${theBal} Narativ`)
                  terminal.pushToStdout(`[[/balance-narativ]]`);
                  terminal.pushToStdout(`================`);
                  terminal.pushToStdout(`================`);
                  // expected output: "Success!"
               });


           let balUPCS = this.props.getUPCSBalance();
               balUPCS.then((value) => {
                  theBal =window.web3.utils.fromWei(value, "ether");
                  terminal.pushToStdout(`[[balance-upcs]]`);
		  terminal.pushToStdout(`${theBal} UPCS`)
                  terminal.pushToStdout(`[[/balance-upcs]]`);
                  terminal.pushToStdout(`================`);
                  terminal.pushToStdout(`================`);
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
                  terminal.pushToStdout(`[[/balance-usdc]] \n\n`);
                  terminal.pushToStdout(`================`);
                  terminal.pushToStdout(`================`);
              // expected output: "Success!"
           });




         })

         return ''
       }
     },



    baltx: {
       description: '<p style="color:hotpink;font-size:1.1em">** Display your Narativ balance **</p>',
       fn: () => {
         this.setState({progressBal: ''});
         this.setState({ isProgressing: true }, () => {
           const terminal = this.terminal.current
           var theBal;
           let bal = this.props.getMyBalance();
               bal.then((value) => {
                  theBal =window.web3.utils.fromWei(value, "ether");
                  terminal.pushToStdout(`[[balance-narativ]]`);
		  terminal.pushToStdout(`${theBal}`)
                  terminal.pushToStdout(`[[/balance-narativ]]`);
                  // expected output: "Success!"
               });

         })

         return ''
       }
     },



     balusdc: {
             description: '<p style="color:hotpink;font-size:1.1em">** Narativ is the token used to write [[intel]] to UPC codes.  In order to acquire Narativ, you must run the `swap` command. This will `swap` Polygon that you have purchased likely from an exchange for Narativ from our Decentralized Mint.  No KYC or middleman required.  Specify the amount of Narativ that you would like to exchange for the Polygon in your wallet in wei.  This will trigger a transaction that will mint equiv. Narativ for Polygon 1:1.  Example: to buy 5 Narativ type `swap 5000000000000000000`. In other words, this would send 5 Polygon from your wallet for 5 Narativ from the Narativ mint.  Visit <a href="upc://000000000010">[[000000000010]]</a> to view a video tutorial on swap</p>',
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
             description: '<p style="color:hotpink;font-size:1.1em">** Narativ is the token used to write [[intel]] to UPC codes.  In order to acquire Narativ, you must run the `swap` command. This will `swap` Polygon that you have purchased likely from an exchange for Narativ from our Decentralized Mint.  No KYC or middleman required.  Specify the amount of Narativ that you would like to exchange for the Polygon in your wallet in wei.  This will trigger a transaction that will mint equiv. Narativ for Polygon 1:1.  Example: to buy 5 Narativ type `swap 5000000000000000000`. In other words, this would send 5 Polygon from your wallet for 5 Narativ from the Narativ mint.  Visit <a href="upc://000000000010">[[000000000010]]</a> to view a video tutorial on swap</p>',
       fn: (amount) => {
         this.setState({progressBal: ''});
         this.setState({ isProgressing: true }, () => {
           const terminal = this.terminal.current
           let approval = this.props.swap(amount);
           approval.then((value) => {
              approval = value;
                  terminal.pushToStdout(`[[swap]]`);
              terminal.pushToStdout(`You have just swapped Polygon for Narativ.  Check your Activity tab below to track the transaction. \n  Type 'bal' to see your new balance! Balances can sometimes take minutes to update.  THANK YOU! ${approval}`)
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
