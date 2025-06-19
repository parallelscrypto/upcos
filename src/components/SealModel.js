import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Barcode from 'react-barcode';

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

    this.props.terminal.pushToStdout(`Visit ${this.props.account} in a browser`);
    this.props.terminal.pushToStdout(<a href={currentUrl} style={{color: '#ff5e00'}}>{currentUrl}</a>);
    this.props.terminal.pushToStdout("copy full link to your clipboard");
    this.props.terminal.pushToStdout(
      <CopyToClipboard text={currentUrl}>
        <button style={{
          background: 'rgba(5, 217, 232, 0.3)',
          border: '1px solid #05d9e8',
          color: 'white',
          padding: '8px 15px',
          margin: '5px',
          cursor: 'pointer'
        }}>
          COPY RAW URL
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
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'rgba(5, 1, 10, 0.9)',
          padding: '20px',
          border: '1px solid #ff5e00',
          boxShadow: '0 0 15px #ff5e00',
          color: '#05d9e8',
          fontFamily: "'Courier New', monospace",
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
           <div style={{
             width: '100%',
             display: 'flex',
             justifyContent: 'center',
             marginBottom: '20px'
           }}>
             {this.props.heroImg}
           </div>
           <div style={{
             width: '100%',
             display: 'flex',
             justifyContent: 'center'
           }}>
             <Barcode value={this.state.pwd} format="UPC" />
           </div>
                    
          {/* Tabs */}
          <div style={{
            display: 'flex',
            marginBottom: '20px',
            borderBottom: '1px solid #05d9e8',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}>
            <button 
              onClick={() => this.handleTabChange('seal')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#05d9e8',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Courier New', monospace",
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '14px',
                marginRight: '10px',
                flexShrink: 0,
                borderBottom: this.state.activeTab === 'seal' ? '2px solid #ff5e00' : 'none'
              }}
            >
              SEAL
            </button>
            <button 
              onClick={() => this.handleTabChange('compiler')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#05d9e8',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Courier New', monospace",
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '14px',
                marginRight: '10px',
                flexShrink: 0,
                borderBottom: this.state.activeTab === 'compiler' ? '2px solid #ff5e00' : 'none'
              }}
            >
              COMPILER
            </button>
          </div>

          {/* Seal Tab Content */}
          {this.state.activeTab === 'seal' && (
            <form onSubmit={this.handleSubmit}>
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', color: '#05d9e8'}}>SHORTLINK NAME</label>
                <input
                  type="text"
                  name="humanReadableName"
                  value={this.state.humanReadableName}
                  onChange={this.handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(5, 217, 232, 0.1)',
                    border: '1px solid #05d9e8',
                    color: '#00ff41',
                    fontFamily: "'Courier New', monospace"
                  }}
                  placeholder="https://is.gd/[your-shortlink]"
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', color: '#05d9e8'}}>MISSION BUTTON URL</label>
                <input
                  type="text"
                  name="missionUrl"
                  value={this.state.missionUrl}
                  onChange={this.handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(5, 217, 232, 0.1)',
                    border: '1px solid #05d9e8',
                    color: '#00ff41',
                    fontFamily: "'Courier New', monospace"
                  }}
                  placeholder="link for mission button"
                  required
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', color: '#05d9e8'}}>FRONT STAGE CONTENT</label>
                <input
                  type="text"
                  name="upcscript"
                  value={this.state.upcscript}
                  onChange={this.handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(5, 217, 232, 0.1)',
                    border: '1px solid #05d9e8',
                    color: '#00ff41',
                    fontFamily: "'Courier New', monospace"
                  }}
                  placeholder="Content for front stage. (UPCScript is allowed)"
                  required
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', color: '#05d9e8'}}>PAYLOAD (ETC BUTTON)</label>
                <input
                  type="text"
                  name="payload"
                  value={this.state.payload}
                  onChange={this.handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(5, 217, 232, 0.1)',
                    border: '1px solid #05d9e8',
                    color: '#00ff41',
                    fontFamily: "'Courier New', monospace"
                  }}
                  placeholder="payload (etc button)"
                  required
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', color: '#05d9e8'}}>CONFIG FILE URL</label>
                <input
                  type="text"
                  name="configUrl"
                  value={this.state.configUrl}
                  onChange={this.handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(5, 217, 232, 0.1)',
                    border: '1px solid #05d9e8',
                    color: '#00ff41',
                    fontFamily: "'Courier New', monospace"
                  }}
                  placeholder="json config file url"
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', color: '#05d9e8'}}>TERMINAL WELCOME MESSAGE</label>
                <textarea
                  name="exportMsg"
                  value={this.state.exportMsg}
                  onChange={this.handleInputChange}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '10px',
                    background: 'rgba(5, 217, 232, 0.1)',
                    border: '1px solid #05d9e8',
                    color: '#00ff41',
                    fontFamily: "'Courier New', monospace"
                  }}
                  placeholder="This text will be displayed in the exported terminal welcome message. If you put a upcscript in this box, you can execute it with the exe command"
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 94, 0, 0.5)',
                  border: '1px solid #ff5e00',
                  color: 'white',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255, 94, 0, 0.8)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255, 94, 0, 0.5)'}
              >
                ANON
              </button>
            </form>
          )}

          {/* Compiler Tab Content */}
          {this.state.activeTab === 'compiler' && (
            <div style={{
              height: '600px',
              border: '1px solid #05d9e8',
              boxShadow: '0 0 10px #05d9e8'
            }}>
              <iframe 
                src="https://f5bjhmleqpsheeovgoj3vhn6fo36d4w2g3kurtaqnkzgfvxlgnua.arweave.net/L0KTsWSD5HIR1TOTup2-K7fh8to21UjMEGqyYtbrM2g" 
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}


export default SealModel;
