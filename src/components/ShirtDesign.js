import React, { Component } from 'react';
import { ethers } from 'ethers';
import { toDataURL } from 'qrcode';

class GenericDesignRenderer {
  static safeEval(expr, variables) {
    const allowedVars = Object.keys(variables).join('|');
    const sanitized = expr
      .replace(new RegExp(`\\b(${allowedVars}|Math\\.\\w+)\\b`, 'g'), '$$$1')
      .replace(/[^0-9+\-*\/\s().,$$]/g, '');
    
    try {
      return new Function('$', `return ${sanitized}`)(variables);
    } catch {
      console.warn(`Evaluation error: ${expr}`);
      return 0;
    }
  }

  static async render(ctx, design, centerX, centerY) {
    if (!ctx || !design) {
      console.error('Invalid parameters to render');
      return;
    }

    const variables = Object.assign({}, design.variables || {}, {
      centerX,
      centerY,
      canvasWidth: ctx.canvas.width,
      canvasHeight: ctx.canvas.height
    });

    ctx.save();
    
    // Ensure operations exists and is iterable
    const operations = Array.isArray(design.operations) ? design.operations : [];
    
    for (const op of operations) {
      try {
        await this.executeOperation(ctx, op, variables);
      } catch (error) {
        console.error(`Error executing ${op.type}:`, error);
      }
    }
    
    ctx.restore();
  }

  static async executeOperation(ctx, op, variables) {
    if (!op || typeof op !== 'object') return;

    const resolveArgs = function(args) {
      if (!Array.isArray(args)) return [];
      return args.map(function(arg) {
        return typeof arg === 'string' ? 
          this.safeEval(arg, variables) : 
          arg;
      }.bind(this));
    }.bind(this);

    switch (op.type) {
      case 'save': ctx.save(); break;
      case 'restore': ctx.restore(); break;
      case 'setStyle': 
        if (op.properties && typeof op.properties === 'object') {
          Object.keys(op.properties).forEach(function(prop) {
            const value = op.properties[prop];
            ctx[prop] = typeof value === 'string' ? 
              this.safeEval(value, variables) : 
              value;
          }.bind(this));
        }
        break;
      case 'beginPath': ctx.beginPath(); break;
      case 'closePath': ctx.closePath(); break;
      case 'moveTo': 
        const moveToArgs = resolveArgs(op.args);
        if (moveToArgs.length >= 2) ctx.moveTo(...moveToArgs); 
        break;
      case 'lineTo': 
        const lineToArgs = resolveArgs(op.args);
        if (lineToArgs.length >= 2) ctx.lineTo(...lineToArgs);
        break;
      case 'arc': 
        const arcArgs = resolveArgs(op.args);
        if (arcArgs.length >= 5) ctx.arc(...arcArgs);
        break;
      case 'rect': 
        const rectArgs = resolveArgs(op.args);
        if (rectArgs.length >= 4) ctx.rect(...rectArgs);
        break;
      case 'fill': 
        if (op.style && op.style.fillStyle) {
          ctx.fillStyle = op.style.fillStyle;
        }
        ctx.fill(op.fillRule); 
        break;
      case 'stroke': 
        if (op.style && op.style.strokeStyle) {
          ctx.strokeStyle = op.style.strokeStyle;
        }
        ctx.stroke(); 
        break;
      case 'applyGradient':
        if (op.gradient && typeof op.gradient === 'object') {
          const params = resolveArgs(op.gradient.params);
          const grad = op.gradient.type === 'linear' ?
            ctx.createLinearGradient(...params) :
            ctx.createRadialGradient(...params);
          
          if (Array.isArray(op.gradient.stops)) {
            op.gradient.stops.forEach(function(stop) {
              if (stop && typeof stop === 'object') {
                grad.addColorStop(
                  this.safeEval(stop.position, variables),
                  typeof stop.color === 'string' ? 
                    this.safeEval(stop.color, variables) : stop.color
                );
              }
            }.bind(this));
          }
          
          ctx.fillStyle = grad;
          ctx.fill();
        }
        break;
      case 'drawImage':
        if (op.imageUrl) {
          const img = new Image();
          img.src = op.imageUrl;
          await new Promise(function(resolve) { img.onload = resolve; });
          const drawArgs = resolveArgs(op.args);
          if (drawArgs.length >= 2) {
            ctx.drawImage(img, ...drawArgs);
          }
        }
        break;
      default:
        if (op.type && ctx[op.type] && typeof ctx[op.type] === 'function') {
          const args = resolveArgs(op.args);
          ctx[op.type](...args);
        }
    }
  }
}

class ShirtDesign extends Component {
  constructor(props) {
    super(props);
    this.state = {
      designs: {},
      currentDesign: null,
      currentTab: 'front',
      upcNumber: props.upcNumber || '',
      userData: '',
      isLoading: true,
      error: null,
      isConnected: false,
      provider: null,
      signer: null,
      account: '',
      qrData: ''
    };
    
    this.frontCanvasRef = React.createRef();
    this.backCanvasRef = React.createRef();
    this.handleResize = this.handleResize.bind(this);
    this.initConnection = this.initConnection.bind(this);
    this.generateFront = this.generateFront.bind(this);
    this.generateBack = this.generateBack.bind(this);
    this.fetchUpcData = this.fetchUpcData.bind(this);
    this.downloadMerged = this.downloadMerged.bind(this);
    this.handleDesignChange = this.handleDesignChange.bind(this);
  }

  async componentDidMount() {
    try {
      await this.initConnection();
      await this.loadDesigns(this.props.designsUrl);
      this.generateFront();
      window.addEventListener('resize', this.handleResize);
    } catch (error) {
      this.setState({ error: error.message, isLoading: false });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.generateFront();
    this.generateBack();
  }

  async initConnection() {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask!');
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    
    this.setState({
      provider: provider,
      signer: signer,
      account: account,
      isConnected: true,
      isLoading: false
    });
  }

  async loadDesigns(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load designs');
      }
      
      const designs = await response.json();
      
      // Validate designs structure
      if (typeof designs !== 'object' || designs === null) {
        throw new Error('Invalid designs format');
      }
      
      const designIds = Object.keys(designs);
      if (designIds.length === 0) {
        throw new Error('No designs found');
      }
      
      this.setState({ 
        designs: designs,
        currentDesign: designIds[0],
        isLoading: false 
      });
    } catch (error) {
      console.error('Design loading error:', error);
      this.setState({ 
        error: 'Design loading failed: ' + error.message,
        isLoading: false 
      });
      throw error;
    }
  }

  async generateFront() {
    const canvas = this.frontCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const design = this.state.designs[this.state.currentDesign];
    if (!design) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
      await GenericDesignRenderer.render(
        ctx,
        design,
        canvas.width / 2,
        canvas.height / 2
      );
    } catch (error) {
      console.error('Render error:', error);
      // Fallback rendering
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('Design rendering failed', 20, 30);
    }
  }

  generateBack() {
    const canvas = this.backCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#121212');
    gradient.addColorStop(1, '#002244');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid pattern
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.height; i += 4) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Text rendering
    if (this.state.userData) {
      const lines = this.state.userData.trim().split('\n');
      const textBlockHeight = lines.length * 30 + 40;
      const startY = (canvas.height - textBlockHeight) / 2;
      let yPos = startY;

      ctx.textAlign = 'center';
      ctx.font = '16px Orbitron';

      for (const line of lines) {
        if (line.startsWith('=====')) {
          ctx.fillStyle = 'white';
          ctx.fillText(line, canvas.width / 2, yPos);
          yPos += 30;
        } else if (line.includes(':')) {
          const [label, value] = line.split(':').map(function(s) { return s.trim(); });
          ctx.fillStyle = 'white';
          ctx.fillText(label + ':', canvas.width / 2, yPos);
          yPos += 30;
          ctx.fillText(value, canvas.width / 2, yPos);
          yPos += 30;
        } else {
          ctx.fillStyle = 'white';
          ctx.fillText(line, canvas.width / 2, yPos);
          yPos += 30;
        }
      }
    }

    // Border
    ctx.strokeStyle = 'var(--cyber-orange)';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  }

  async fetchUpcData() {
    if (!this.state.upcNumber || !this.state.provider) return;

    this.setState({ isLoading: true, error: null });

    try {
      const contract = new ethers.Contract(
        '0x2C343942548319cCfc05666FF15d73E8569FaEdf',
        [
          "function upcInfo(string) view returns (tuple(uint256,address,address,bytes32,string,string,string,string,bool,bool,uint256,uint256,uint256))"
        ],
        this.state.signer
      );

      const data = await contract.upcInfo(this.state.upcNumber.toString());
      const createdDate = new Date(parseInt(data.createdTimestamp) * 1000);
      
      const formattedData = [
        '[[intel]]',
        'owner: ' + data.staker,
        '=====',
        'name: ' + data.humanReadableName,
        '=====',
        'created: ' + createdDate.toString(),
        '=====',
        '[[/intel]]'
      ].join('\n');

      this.setState({ 
        userData: formattedData,
        qrData: data[5], // IPFS URL
        isLoading: false
      }, this.generateBack);
      
    } catch (error) {
      this.setState({ 
        error: 'Failed to fetch UPC data: ' + error.message,
        isLoading: false 
      });
    }
  }

  downloadMerged() {
    const frontCanvas = this.frontCanvasRef.current;
    const backCanvas = this.backCanvasRef.current;
    if (!frontCanvas || !backCanvas) return;
    
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = Math.max(frontCanvas.width, backCanvas.width);
    mergedCanvas.height = frontCanvas.height + backCanvas.height + 40;
    const ctx = mergedCanvas.getContext('2d');

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, mergedCanvas.width, mergedCanvas.height);
    ctx.drawImage(frontCanvas, (mergedCanvas.width - frontCanvas.width) / 2, 20);

    ctx.strokeStyle = 'var(--cyber-orange)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(50, frontCanvas.height + 30);
    ctx.lineTo(mergedCanvas.width - 50, frontCanvas.height + 30);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.drawImage(backCanvas, (mergedCanvas.width - backCanvas.width) / 2, frontCanvas.height + 40);

    ctx.fillStyle = 'var(--cyber-orange)';
    ctx.font = 'bold 24px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('CYBERPUNK UPCSCRIPT SHIRT DESIGN', mergedCanvas.width / 2, 30);

    const link = document.createElement('a');
    link.href = mergedCanvas.toDataURL('image/png');
    link.download = 'cyberpunk-upcscript-shirt.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  handleDesignChange(designId) {
    this.setState({ currentDesign: designId }, this.generateFront);
  }

  renderDesignThumbnails() {
    const designs = this.state.designs;
    const currentDesign = this.state.currentDesign;
    
    return Object.keys(designs).map(function(id) {
      return (
        <canvas
          key={id}
          className={'design-thumbnail ' + (currentDesign === id ? 'active' : '')}
          width={100}
          height={100}
          title={designs[id].designName}
          onClick={function() { this.handleDesignChange(id); }.bind(this)}
          ref={function(canvas) {
            if (canvas && designs[id]) {
              GenericDesignRenderer.render(
                canvas.getContext('2d'),
                designs[id],
                50,
                50
              );
            }
          }.bind(this)}
        />
      );
    }.bind(this));
  }

  render() {
    if (this.state.isLoading) {
      return (
        <div className="loading-screen">
          <h2>CONNECTING TO BLOCKCHAIN...</h2>
          <div className="spinner"></div>
        </div>
      );
    }
    
    if (this.state.error) {
      return (
        <div className="error-screen">
          <h2>ERROR</h2>
          <p>{this.state.error}</p>
          <button onClick={this.initConnection}>RETRY</button>
        </div>
      );
    }
    
    if (!this.state.isConnected) {
      return (
        <div className="connect-screen">
          <h2>CONNECT WALLET</h2>
          <button onClick={this.initConnection}>CONNECT</button>
        </div>
      );
    }

    return (
      <div className="cyberpunk-container">
        <style>
          {`
            :root {
              --cyber-orange: #FF8C00;
              --cyber-dark: #121212;
              --cyber-light: #00F0FF;
            }
            .cyberpunk-container {
              font-family: 'Orbitron', sans-serif;
              background-color: var(--cyber-dark);
              color: white;
              padding: 20px;
            }
            .cyber-border {
              border: 1px solid var(--cyber-orange);
              padding: 15px;
              position: relative;
            }
            .cyber-border::before {
              content: "";
              position: absolute;
              top: -5px;
              left: -5px;
              right: -5px;
              bottom: -5px;
              border: 1px solid var(--cyber-light);
              pointer-events: none;
              z-index: -1;
            }
            canvas {
              background: black;
              border: 2px solid var(--cyber-orange);
              max-width: 100%;
              margin: 15px 0;
            }
            #tshirtFrontCanvas { height: 600px; }
            #tshirtBackCanvas { height: 800px; }
            .design-options {
              display: flex;
              gap: 15px;
              overflow-x: auto;
              padding: 10px 0;
              margin: 15px 0;
            }
            .design-thumbnail {
              width: 100px;
              height: 100px;
              border: 2px solid var(--cyber-orange);
              cursor: pointer;
              flex-shrink: 0;
            }
            .design-thumbnail.active {
              border-color: var(--cyber-light);
              box-shadow: 0 0 10px var(--cyber-light);
            }
            button, input, textarea {
              font-family: 'Orbitron', sans-serif;
              margin: 10px 0;
              display: block;
              width: 100%;
              padding: 10px;
              background: rgba(0,0,0,0.5);
              border: 1px solid var(--cyber-orange);
              color: white;
            }
            button {
              cursor: pointer;
              transition: all 0.3s;
            }
            button:hover {
              background: var(--cyber-orange);
              color: black;
            }
            .tab-buttons {
              display: flex;
              gap: 10px;
              margin-bottom: 20px;
            }
            .tab-button {
              flex: 1;
              background: var(--cyber-dark);
              color: var(--cyber-orange);
              border: 2px solid var(--cyber-orange);
              padding: 10px;
              cursor: pointer;
            }
            .tab-button.active {
              background: var(--cyber-orange);
              color: black;
            }
            .account-info {
              color: var(--cyber-light);
              text-align: right;
              margin-bottom: 10px;
              font-size: 0.9em;
            }
          `}
        </style>

        <div className="cyber-border">
          <div className="account-info">
            Connected: {this.state.account.substring(0, 6)}...{this.state.account.slice(-4)}
          </div>
          
          <h1>DYNAMIC SHIRT DESIGNER</h1>
          
          <div className="tab-buttons">
            <button 
              className={'tab-button ' + (this.state.currentTab === 'front' ? 'active' : '')}
              onClick={function() { 
                this.setState({ currentTab: 'front' }, this.generateFront); 
              }.bind(this)}
            >
              FRONT DESIGN
            </button>
            <button 
              className={'tab-button ' + (this.state.currentTab === 'back' ? 'active' : '')}
              onClick={function() { 
                this.setState({ currentTab: 'back' }, this.generateBack); 
              }.bind(this)}
            >
              BACK DESIGN
            </button>
          </div>

          {this.state.currentTab === 'front' ? (
            <div id="front">
              <h3>SELECT DESIGN:</h3>
              <div className="design-options">
                {this.renderDesignThumbnails()}
              </div>
              
              <input
                type="text"
                value={this.state.upcNumber}
                onChange={function(e) { 
                  this.setState({ upcNumber: e.target.value }); 
                }.bind(this)}
                placeholder="ENTER UPC NUMBER"
              />
              
              <button onClick={this.generateFront}>REFRESH DESIGN</button>
              <button 
                onClick={this.fetchUpcData} 
                disabled={!this.state.upcNumber}
              >
                FETCH UPC DATA
              </button>
              
              <canvas 
                id="tshirtFrontCanvas" 
                ref={this.frontCanvasRef}
                width={600}
                height={600}
              />
            </div>
          ) : (
            <div id="back">
              <textarea
                value={this.state.userData}
                onChange={function(e) { 
                  this.setState({ userData: e.target.value }); 
                }.bind(this)}
                placeholder="Back design data..."
                rows={8}
              />
              <button onClick={this.generateBack}>UPDATE BACK DESIGN</button>
              <canvas 
                id="tshirtBackCanvas" 
                ref={this.backCanvasRef}
                width={600}
                height={800}
              />
            </div>
          )}
          
          <button onClick={this.downloadMerged}>DOWNLOAD FULL DESIGN</button>
        </div>
      </div>
    );
  }
}

export default ShirtDesign;
