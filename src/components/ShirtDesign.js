import React, { Component } from 'react';
import { ethers } from 'ethers';
import { sha256 } from 'js-sha256';
import { toDataURL } from 'qrcode';

class ShirtDesign extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'front',
      currentDesign: 'cyberCircle',
      upcNumber: props.upcNumber,
      userData: '',
      isLoading: true,
      error: null,
      isConnected: false,
      provider: null,
      signer: null,
      account: '',
      qrData: ''
    };
    
    this.designTemplates = {
      cyberCircle: {
        name: "Cyber Circle Crown",
        generator: async (ctx, canvas, upcNumber, qrData) => {
          // Background
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Grid pattern
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
          ctx.lineWidth = 1;
          for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
          }

          // Main circle design
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          // Outer glow
          ctx.beginPath();
          ctx.arc(centerX, centerY, 180, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 140, 0, 0.3)';
          ctx.lineWidth = 30;
          ctx.stroke();
          
          // King's Crown (wider and properly positioned)
          ctx.save();
          ctx.translate(centerX, centerY - 180);
          ctx.beginPath();
          ctx.moveTo(-120, 0);  // Made wider
          ctx.lineTo(-80, -60);
          ctx.lineTo(-40, -30);
          ctx.lineTo(0, -80);
          ctx.lineTo(40, -30);
          ctx.lineTo(80, -60);
          ctx.lineTo(120, 0);  // Made wider
          ctx.lineTo(100, 0);
          ctx.lineTo(100, 40);
          ctx.lineTo(-100, 40);
          ctx.lineTo(-100, 0);
          ctx.closePath();
          ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Crown jewels (enlarged)
          ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
          ctx.beginPath();
          ctx.arc(-80, -20, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, -40, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(80, -20, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // Text
          ctx.textAlign = 'center';
          ctx.fillStyle = 'white';
          ctx.font = 'bold 20px Orbitron';
          ctx.fillText('<upcscript race="black" continent="afrika"/>', centerX, centerY - 50);
          
          ctx.font = 'bold 36px Orbitron';
          ctx.fillText(`[${upcNumber}]`, centerX, centerY + 10);
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'var(--cyber-orange)';
          ctx.fillText(`[${upcNumber}]`, centerX, centerY + 10);
          ctx.shadowBlur = 0;
          
          ctx.font = 'bold 24px Orbitron';
          ctx.fillStyle = 'var(--cyber-light)';
          ctx.fillText('[FLIP] for [INTEL]', centerX, centerY + 70);
          ctx.fillText('HIGH-IQ.BLACK/NETWORK', centerX, centerY + 110);

          // QR Code - using the blockchain data[5] URL
          if (qrData) {
            const qrDataURL = await toDataURL(qrData, {
              width: 128,
              margin: 1,
              color: {
                dark: '#00F0FF',
                light: '#00000000'
              }
            });
            
            const qrImg = new Image();
            qrImg.src = qrDataURL;
            await new Promise((resolve) => { qrImg.onload = resolve; });
            ctx.drawImage(qrImg, centerX - 64, centerY + 150, 128, 128);
          }
        }
      },
      cyberHex: {
        name: "Cyber Hex Grid",
        generator: async (ctx, canvas, upcNumber, qrData) => {
          // Background
          ctx.fillStyle = 'rgba(0,0,0,0.9)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Hex grid pattern
          const hexSize = 40;
          const rows = Math.ceil(canvas.height / (hexSize * Math.sqrt(3))) + 1;
          const cols = Math.ceil(canvas.width / (hexSize * 1.5)) + 1;
          
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
          ctx.lineWidth = 1;
          
          for (let row = -1; row < rows; row++) {
            for (let col = -1; col < cols; col++) {
              const x = col * hexSize * 1.5;
              const y = row * hexSize * Math.sqrt(3) + (col % 2) * hexSize * Math.sqrt(3) / 2;
              
              this.drawHexagon(ctx, x, y, hexSize);
            }
          }
          
          // Center hexagon with glow
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          // Glow effect
          const gradient = ctx.createRadialGradient(
            centerX, centerY, 100,
            centerX, centerY, 180
          );
          gradient.addColorStop(0, 'rgba(255, 140, 0, 0.5)');
          gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 180, 0, Math.PI * 2);
          ctx.fill();
          
          // Main hexagon
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
          ctx.lineWidth = 4;
          this.drawHexagon(ctx, centerX, centerY, 120);
          
          // Text
          ctx.textAlign = 'center';
          ctx.fillStyle = 'white';
          ctx.font = 'bold 20px Orbitron';
          ctx.fillText('<upcscript race="black" continent="afrika"/>', centerX, centerY - 50);
          
          ctx.font = 'bold 36px Orbitron';
          ctx.fillText(`[${upcNumber}]`, centerX, centerY + 10);
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'var(--cyber-orange)';
          ctx.fillText(`[${upcNumber}]`, centerX, centerY + 10);
          ctx.shadowBlur = 0;
          
          ctx.font = 'bold 24px Orbitron';
          ctx.fillStyle = 'var(--cyber-light)';
          ctx.fillText('[FLIP] for [INTEL]', centerX, centerY + 70);
          ctx.fillText('HIGH-IQ.BLACK/NETWORK', centerX, centerY + 110);

          // QR Code
          if (qrData) {
            const qrDataURL = await toDataURL(qrData, {
              width: 128,
              margin: 1,
              color: {
                dark: '#00F0FF',
                light: '#00000000'
              }
            });
            
            const qrImg = new Image();
            qrImg.src = qrDataURL;
            await new Promise((resolve) => { qrImg.onload = resolve; });
            ctx.drawImage(qrImg, centerX - 64, centerY + 150, 128, 128);
          }
        }
      }
    };
  }

  async componentDidMount() {
    try {
      await this.initConnection();
      this.initDesignThumbnails();
      this.generateFront();
      window.addEventListener('resize', this.resizeCanvas);
      this.resizeCanvas();
      
      // Automatically fetch UPC data if upcNumber is provided
      if (this.state.upcNumber) {
        await this.fetchUpcData();
      }
    } catch (error) {
      this.setState({ 
        isLoading: false,
        error: error.message
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeCanvas);
  }

  initConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.enable();
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        
        this.setState({
          provider,
          signer,
          account,
          isConnected: true,
          isLoading: false
        });
      } else {
        throw new Error('No Ethereum provider detected. Please install MetaMask!');
      }
    } catch (error) {
      this.setState({
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  };

  initDesignThumbnails = () => {
    console.log('Initializing design thumbnails');
    console.log('Available designs:', Object.keys(this.designTemplates));
    
    setTimeout(() => {
      const container = document.getElementById('frontDesignOptions');
      if (!container) {
        console.error('Design options container not found');
        return;
      }
      
      container.innerHTML = '';
      
      Object.keys(this.designTemplates).forEach(key => {
        const design = this.designTemplates[key];
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.className = 'design-thumbnail';
        thumbCanvas.width = 100;
        thumbCanvas.height = 100;
        thumbCanvas.dataset.template = key;
        thumbCanvas.title = design.name;
        
        const thumbCtx = thumbCanvas.getContext('2d');
        design.generator(thumbCtx, thumbCanvas, 'UPC', '');
        
        thumbCanvas.onclick = () => {
          this.setState({ currentDesign: key }, this.generateFront);
          document.querySelectorAll('.design-thumbnail').forEach(t => t.classList.remove('active'));
          thumbCanvas.classList.add('active');
        };
        
        container.appendChild(thumbCanvas);
      });
      
      if (container.firstChild && !this.state.currentDesign) {
        container.firstChild.classList.add('active');
        this.setState({ currentDesign: Object.keys(this.designTemplates)[0] });
      }
    }, 100);
  }

  drawHexagon = (ctx, x, y, size) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i;
      ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
    }
    ctx.closePath();
    ctx.stroke();
  }

  openTab = (tabName) => {
    this.setState({ currentTab: tabName }, () => {
      if (tabName === 'front') {
        this.generateFront();
      }
    });
  }

  generateFront = () => {
    const canvas = document.getElementById('tshirtFrontCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const upcNumber = this.state.upcNumber || '850645008653';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (this.designTemplates[this.state.currentDesign]) {
      this.designTemplates[this.state.currentDesign].generator(ctx, canvas, upcNumber, this.state.qrData);
    }
  }

  fetchUpcData = async () => {
    const { upcNumber, provider } = this.state;
    if (!upcNumber || !provider) return;

    this.setState({ isLoading: true, error: null });

    try {
      const signer = this.state.signer;
      
      const rawMaterial = new ethers.Contract(
        '0x2C343942548319cCfc05666FF15d73E8569FaEdf',
        [
          {
            "inputs": [
              {
                "internalType": "string",
                "name": "upcId",
                "type": "string"
              }
            ],
            "name": "upcInfo",
            "outputs": [
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                  },
                  {
                    "internalType": "address",
                    "name": "staker",
                    "type": "address"
                  },
                  {
                    "internalType": "address",
                    "name": "og",
                    "type": "address"
                  },
                  {
                    "internalType": "bytes32",
                    "name": "upcHash",
                    "type": "bytes32"
                  },
                  {
                    "internalType": "string",
                    "name": "word",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "ipfs",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "vr",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "humanReadableName",
                    "type": "string"
                  },
                  {
                    "internalType": "bool",
                    "name": "minted",
                    "type": "bool"
                  },
                  {
                    "internalType": "bool",
                    "name": "bought",
                    "type": "bool"
                  },
                  {
                    "internalType": "uint256",
                    "name": "tld",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "createdTimestamp",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "latestTimestamp",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct UPCNFT.NFTMeta",
                "name": "",
                "type": "tuple"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        signer
      );

      const upcString = upcNumber.toString();
      const data = await rawMaterial.upcInfo(upcString);
      
      const tmpStamp = parseInt(data.createdTimestamp);
      const newDate = new Date(tmpStamp * 1000);
      const tmpStampMod = parseInt(data.latestTimestamp);
      const newDateMod = new Date(tmpStampMod * 1000);
      
      const formattedData = [
        `[[intel]]`,
        `owner: ${data.staker}`,
        `=====`,
        `human_readable_name: ${data.humanReadableName}`,
        `=====`,
        `created: ${newDate.toString()}`,
        `=====`,
        `[[/intel]]`
      ].join('\n');

      this.setState({ 
        userData: formattedData,
        qrData: data[5], // Using the ipfs URL from blockchain for QR code
        isLoading: false,
        error: null
      }, this.generateBack);
      
    } catch (error) {
      console.error('Detailed error:', error);
      const errorMessage = error.message || "Unknown error occurred";
      
      this.setState({ 
        error: `Failed to fetch UPC data: ${errorMessage}`,
        isLoading: false 
      });
    }
  }

  generateBack = () => {
    const canvas = document.getElementById('tshirtBackCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rawData = this.state.userData;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!rawData) {
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'var(--cyber-orange)';
      ctx.font = 'bold 24px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('ENTER UPC NUMBER AND CLICK "FETCH DATA"', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#121212');
    gradient.addColorStop(1, '#002244');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.height; i += 4) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    const lines = rawData.trim().split('\n');
    const textBlockHeight = lines.length * 30 + 40;
    const startY = (canvas.height - textBlockHeight) / 2;
    let yPos = startY;

    ctx.textAlign = 'center';

    for (const line of lines) {
      if (line.startsWith('=====')) {
        ctx.fillStyle = 'white';
        ctx.font = '16px Orbitron';
        ctx.fillText(line, canvas.width / 2, yPos);
        yPos += 30;
      } else if (line.includes(':')) {
        const [label, value] = line.split(':').map(s => s.trim());
        ctx.fillStyle = 'white';
        ctx.font = '16px Orbitron';
        
        ctx.fillText(label + ':', canvas.width / 2, yPos);
        yPos += 30;
        
        if (label === 'og_owner' || label === 'owner') {
          ctx.fillText(value, canvas.width / 2, yPos);
          yPos += 30;
        } else {
          ctx.fillText(value, canvas.width / 2, yPos);
          yPos += 30;
        }
      } else if (line.startsWith('[[')) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Orbitron';
        ctx.fillText(line, canvas.width / 2, yPos);
        yPos += 40;
      } else {
        ctx.fillStyle = 'white';
        ctx.font = '16px Orbitron';
        ctx.fillText(line, canvas.width / 2, yPos);
        yPos += 30;
      }
    }

    ctx.strokeStyle = 'var(--cyber-orange)';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  }

  downloadMerged = () => {
    const frontCanvas = document.getElementById('tshirtFrontCanvas');
    const backCanvas = document.getElementById('tshirtBackCanvas');
    
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

  resizeCanvas = () => {
    const frontCanvas = document.getElementById('tshirtFrontCanvas');
    const backCanvas = document.getElementById('tshirtBackCanvas');
    
    if (!frontCanvas || !backCanvas) return;
    
    if (window.innerWidth < 768) {
      const scale = window.innerWidth / 600;
      frontCanvas.style.width = (600 * scale) + 'px';
      frontCanvas.style.height = (600 * scale) + 'px';
      backCanvas.style.width = (600 * scale) + 'px';
      backCanvas.style.height = (800 * scale) + 'px';
    } else {
      frontCanvas.style.width = '';
      frontCanvas.style.height = '';
      backCanvas.style.width = '';
      backCanvas.style.height = '';
    }
  }

  handleUPCChange = (e) => {
    this.setState({ upcNumber: e.target.value });
  }

  handleDataChange = (e) => {
    this.setState({ userData: e.target.value });
  }

  render() {
    const { isLoading, error, isConnected } = this.state;

    if (isLoading) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#00F0FF',
          fontFamily: "'Orbitron', sans-serif"
        }}>
          <h2>CONNECTING TO BLOCKCHAIN...</h2>
          <p>Please approve the connection in your wallet</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#FF3D3D',
          fontFamily: "'Orbitron', sans-serif"
        }}>
          <h2>CONNECTION ERROR</h2>
          <p>{error}</p>
          <button 
            onClick={this.initConnection}
            style={{
              background: 'transparent',
              color: '#FF8C00',
              border: '2px solid #FF8C00',
              padding: '10px 20px',
              fontFamily: "'Orbitron', sans-serif",
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            RETRY CONNECTION
          </button>
        </div>
      );
    }

    if (!isConnected) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#FF8C00',
          fontFamily: "'Orbitron', sans-serif"
        }}>
          <h2>WALLET NOT CONNECTED</h2>
          <p>Please connect your wallet to continue</p>
          <button 
            onClick={this.initConnection}
            style={{
              background: 'transparent',
              color: '#00F0FF',
              border: '2px solid #00F0FF',
              padding: '10px 20px',
              fontFamily: "'Orbitron', sans-serif",
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            CONNECT WALLET
          </button>
        </div>
      );
    }

    return (
      <div>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
            
            :root {
              --cyber-orange: #FF8C00;
              --cyber-dark: #121212;
              --cyber-light: #00F0FF;
            }
            
            .cyberpunk-container {
              font-family: 'Orbitron', sans-serif;
              margin: 0;
              padding: 15px;
              background-color: var(--cyber-dark);
              color: white;
              line-height: 1.5;
            }
            
            .cyberpunk-container h1, 
            .cyberpunk-container h2 {
              color: var(--cyber-orange);
              text-shadow: 0 0 5px var(--cyber-orange);
            }
            
            .cyber-border {
              border: 1px solid var(--cyber-orange);
              padding: 15px;
              margin: 15px 0;
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
            
            .tab-buttons {
              display: flex;
              gap: 10px;
              margin-bottom: 20px;
              flex-wrap: wrap;
            }
            
            .tab-button {
              flex: 1;
              min-width: 120px;
              background: var(--cyber-dark);
              color: var(--cyber-orange);
              border: 2px solid var(--cyber-orange);
              padding: 10px;
              font-family: 'Orbitron', sans-serif;
              cursor: pointer;
            }
            
            .tab-button.active {
              background: var(--cyber-orange);
              color: black;
            }
            
            .tab-content {
              display: none;
            }
            
            .tab-content.active {
              display: block;
            }
            
            canvas {
              background: black;
              border: 2px solid var(--cyber-orange);
              max-width: 100%;
              margin-top: 15px;
            }
            
            #tshirtFrontCanvas {
              height: 600px;
            }
            
            #tshirtBackCanvas {
              height: 800px;
            }
            
            input, textarea {
              width: 100%;
              padding: 10px;
              margin: 10px 0;
              background: rgba(0,0,0,0.5);
              border: 1px solid var(--cyber-orange);
              color: white;
              font-family: 'Orbitron', sans-serif;
            }
            
            textarea {
              min-height: 200px;
            }
            
            button {
              background: var(--cyber-dark);
              color: var(--cyber-orange);
              border: 2px solid var(--cyber-orange);
              padding: 10px 15px;
              font-family: 'Orbitron', sans-serif;
              margin: 10px 0;
              cursor: pointer;
              transition: all 0.3s;
            }
            
            button:hover {
              background: var(--cyber-orange);
              color: black;
              box-shadow: 0 0 15px var(--cyber-orange);
            }
            
            button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            
            .design-options {
              display: flex;
              gap: 15px;
              overflow-x: auto;
              padding: 10px 0;
              margin: 15px 0;
              min-height: 120px;
            }
            
            .design-thumbnail {
              width: 100px;
              height: 100px;
              border: 2px solid var(--cyber-orange);
              cursor: pointer;
              transition: all 0.3s;
              flex-shrink: 0;
            }
            
            .design-thumbnail:hover {
              transform: scale(1.05);
              box-shadow: 0 0 10px var(--cyber-orange);
            }
            
            .design-thumbnail.active {
              border-color: var(--cyber-light);
              box-shadow: 0 0 15px var(--cyber-light);
            }
            
            .loading {
              color: var(--cyber-light);
              text-align: center;
              margin: 20px 0;
            }
            
            .error {
              color: #ff4444;
              text-align: center;
              margin: 20px 0;
            }
            
            .account-info {
              color: var(--cyber-light);
              text-align: right;
              margin-bottom: 10px;
              font-size: 0.9em;
            }
            
            @media (max-width: 768px) {
              #tshirtFrontCanvas {
                height: 400px;
              }
              
              #tshirtBackCanvas {
                height: 600px;
              }
            }
          `}
        </style>
        
        <div className="cyberpunk-container">
          <div className="cyber-border">
            <div className="account-info">
              Connected: {this.state.account.substring(0, 8)}...{this.state.account.substring(36)}
            </div>
            <h1>CYBERPUNK UPCSCRIPT</h1>
            <h2>T-Shirt Designer</h2>
            
            <div className="tab-buttons">
              <button 
                className={`tab-button ${this.state.currentTab === 'front' ? 'active' : ''}`} 
                onClick={() => this.openTab('front')}
              >
                FRONT DESIGN
              </button>
              <button 
                className={`tab-button ${this.state.currentTab === 'back' ? 'active' : ''}`} 
                onClick={() => this.openTab('back')}
              >
                BACK DESIGN
              </button>
            </div>

            <div id="front" className={`tab-content ${this.state.currentTab === 'front' ? 'active' : ''}`}>
              <h3>SELECT FRONT DESIGN:</h3>
              <div className="design-options" id="frontDesignOptions">
                {/* Thumbnails will be added here by JavaScript */}
              </div>
              
              <input 
                type="text" 
                id="upcNumber" 
                placeholder="ENTER UPC NUMBER" 
                value={this.state.upcNumber}
                onChange={this.handleUPCChange}
              />
              <button onClick={this.generateFront}>UPDATE FRONT DESIGN</button>
              <button 
                onClick={this.fetchUpcData}
                disabled={this.state.isLoading}
              >
                {this.state.isLoading ? 'FETCHING DATA...' : 'FETCH UPC DATA'}
              </button>
              {this.state.error && <div className="error">{this.state.error}</div>}
              <canvas id="tshirtFrontCanvas" width="600" height="600"></canvas>
            </div>

            <div id="back" className={`tab-content ${this.state.currentTab === 'back' ? 'active' : ''}`}>
              {this.state.isLoading && <div className="loading">LOADING UPC DATA...</div>}
              
              <textarea 
                id="userData" 
                placeholder="UPC data will appear here after fetching or paste custom data here..." 
                value={this.state.userData}
                onChange={this.handleDataChange}
              ></textarea>
              <button onClick={this.generateBack}>UPDATE BACK DESIGN</button>
              <canvas id="tshirtBackCanvas" width="600" height="800"></canvas>
            </div>

            <button onClick={this.downloadMerged}>DOWNLOAD FULL SHIRT DESIGN</button>
          </div>
        </div>
      </div>
    );
  }
}

export default ShirtDesign;
