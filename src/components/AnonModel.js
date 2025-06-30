import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Barcode from 'react-barcode';
import axios from "axios";


class SealModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'seal',
      humanReadableName: '',
      missionUrl: '',
      upcscript: '',
      payload: '',
      configUrl: '',
      exportMsg: '',
      pwd: props.pwd,
      code: props.code,
      msg: props.msg,
      showModal: true
    };
  }

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab });
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { pwd, code, msg, humanReadableName, missionUrl, upcscript, payload, configUrl, exportMsg } = this.state;
    let rejectCustomShell = false;
    const wallet = await this.props.getMyAddress();
    let info = await this.props.upcInfo(pwd);
    let assistInfo = await this.props.upcInfo(code);
    var qOwner = info['staker'];
    var tokenId = info['tokenId'];
    var assistOwner = assistInfo['staker'];

    if (tokenId != 0) {
      if ((qOwner != wallet)) {
        this.props.terminal.pushToStdout("You must cd or scan into a anon-able upc code...");
        rejectCustomShell = true;
        return false;
      }
    } else {
      rejectCustomShell = true;
    }

    if (wallet == assistOwner) {
      rejectCustomShell = false;
    }

    const lines = exportMsg.split('\n');
    const firstLine = lines[0].trim();

    if (rejectCustomShell == true) {
      let parentMsg = msg;
      const linesParent = parentMsg.split('\n');
      let shebangParent = "#!/bin/upc";
      const shebangRegex = /^#!\/bin\/([^\/]+)(?:\/([^\/]+))?$/;
      const firstLineParent = linesParent[0].trim();
      const matchShebangParent = shebangRegex.exec(firstLineParent);
      
      if (matchShebangParent) {
        shebangParent = firstLineParent;
      }

      const matchShebangFlex = shebangRegex.exec(firstLine);
      if (!matchShebangFlex) {
        lines.unshift(shebangParent); 
        this.setState({ exportMsg: lines.join('\n') });
      } else {
        lines[0] = shebangParent;
        this.setState({ exportMsg: lines.join('\n') });
      }
    }

    var currentUrl = window.location.href;
    const hackerAddress = await this.props.getMyAddress();
    const currTime = Math.floor(Date.now() / 1000);
    const hrn = "anoned-upc-" + pwd + "-" + currTime;

    var manifestAr = [hackerAddress, qOwner, 0, 0, 0, payload, upcscript, hrn, 0, 0, 0, currTime, currTime, code, currentUrl];
    var manifestEncoded = btoa(manifestAr);

    const encodedExportMsg = btoa(exportMsg);
    const encodedMissionUrl = btoa(missionUrl);

    var upcJson = {
      show: upcscript,
      code: pwd,
      assist: code,
      manifest: manifestEncoded,
      msg: encodedExportMsg,
      missionUrl: encodedMissionUrl,
      configUrl: configUrl
    };

    var upcEncoded = btoa(JSON.stringify(upcJson));
    currentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1) + upcEncoded;
    currentUrl = currentUrl.replace('intel', 'export');
//    currentUrl= currentUrl.replace('http://localhost:3000', 'https://flipitup.cc');  //remember to comment out.  need to uncomment to get shortened test url when using localhost



      var encodedWeb2 = encodeURIComponent(currentUrl);
      var toShorten = "https://is.gd/create.php?format=json&url=" + currentUrl;
      if (!(humanReadableName === '' || humanReadableName === null)) {
        toShorten += "&shorturl=" + humanReadableName;
      }    


      let response;
      var shortUrl;
      try {
        // Code that might throw an error
        response = await axios.get(toShorten, {
          params: {
            format: 'json',
            shorturl: humanReadableName,
            url: currentUrl
          }
        })

        shortUrl = response.data.shorturl;
      } catch (error) {
        // Code to run if an error occurs
        console.error('An error occurred:', error.message);
      }    

      console.log(response);


    this.props.terminal.pushToStdout(`Visit ${code} in a browser`);
    this.props.terminal.pushToStdout(<a href={shortUrl} style={{color: '#ff5e00'}}>{shortUrl}</a>);
    this.props.terminal.pushToStdout("copy full link to your clipboard");
    this.props.terminal.pushToStdout(
      <CopyToClipboard text={shortUrl}>
        <button style={{
          background: 'rgba(5, 217, 232, 0.3)',
          border: '1px solid #05d9e8',
          color: 'white',
          padding: '8px 15px',
          margin: '5px',
          cursor: 'pointer'
        }}>
          COPY SHORT URL
        </button>
      </CopyToClipboard>
    );
    this.props.terminal.pushToStdout("=================================");

    this.setState({ showModal: false });
    this.props.onClose();
  };



render() {
  if (!this.state.showModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      zIndex: 1000,
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch', // For smooth iOS scrolling
      padding: '10px'
    }}>
      <div style={{
        backgroundColor: 'rgba(5, 1, 10, 0.95)',
        padding: '15px',
        border: '1px solid #ff5e00',
        boxShadow: '0 0 15px #ff5e00',
        color: '#05d9e8',
        fontFamily: "'Courier New', monospace",
        width: '100%',
        maxWidth: '800px',
        maxHeight: '95vh',
        display: 'flex',
        flexDirection: 'column',
        margin: '10px 0',
        overflow: 'hidden' // Prevent nested scrolling
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          {this.props.heroImg}
          <Barcode value={this.state.pwd} format="UPC" style={{ marginTop: '10px' }} />
        </div>

        {/* Tabs - Fixed for Mobile */}
        <div style={{
          display: 'flex',
          marginBottom: '15px',
          borderBottom: '1px solid #05d9e8',
          overflowX: 'visible', // Changed from auto
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}>
          <button 
            onClick={() => this.handleTabChange('seal')}
            style={{
              padding: '12px 20px',
              backgroundColor: this.state.activeTab === 'seal' ? 'rgba(255, 94, 0, 0.3)' : 'transparent',
              color: '#05d9e8',
              border: 'none',
              borderBottom: this.state.activeTab === 'seal' ? '2px solid #ff5e00' : 'none',
              cursor: 'pointer',
              fontFamily: "'Courier New', monospace",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '14px',
              marginRight: '10px',
              flexShrink: 0
            }}
          >
            SEAL
          </button>
          <button 
            onClick={() => this.handleTabChange('compiler')}
            style={{
              padding: '12px 20px',
              backgroundColor: this.state.activeTab === 'compiler' ? 'rgba(255, 94, 0, 0.3)' : 'transparent',
              color: '#05d9e8',
              border: 'none',
              borderBottom: this.state.activeTab === 'compiler' ? '2px solid #ff5e00' : 'none',
              cursor: 'pointer',
              fontFamily: "'Courier New', monospace",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '14px',
              marginRight: '10px',
              flexShrink: 0
            }}
          >
            COMPILER
          </button>
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Seal Tab Content */}
          {this.state.activeTab === 'seal' && (
            <form onSubmit={this.handleSubmit} style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingRight: '5px' // Compensate for scrollbar
            }}>
              {/* ... (keep all your seal form fields exactly as they were) ... */}
            </form>
          )}

          {/* Compiler Tab Content - Fixed for Mobile */}
          {this.state.activeTab === 'compiler' && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              border: '1px solid #05d9e8',
              boxShadow: '0 0 10px #05d9e8',
              overflow: 'auto'
            }}>
              <iframe 
                src="https://mla52jgnxq6n2absm4ainsmpjlkeh2vd4jb2phqhv5jhldz43waa.arweave.net/YsHdJM28PN0AMmcAhsmPStRD6qPiQ6eeB69SdY883YA" 
                style={{
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  minHeight: '60vh',
                  border: 'none',
                  overflow: 'auto'
                }}
                allow="fullscreen"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




}


export default SealModel;
