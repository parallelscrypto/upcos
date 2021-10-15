import ReactFileReader from 'react-file-reader';
import Modal from "react-animated-modal";
import {CopyToClipboard} from 'react-copy-to-clipboard';
const React = require('react')
const FormData = require('form-data');

export default class IpfsUpload extends React.Component {
  constructor () {
    super()
    this.state = {
      uploadHash: "",
      uploadButton: "",
      imgUpload: null,
      file: null,
      showUploaderModal: false,
    }

    // bind methods
    this.pinFileToIPFS= this.pinFileToIPFS.bind(this)
    this.getBase64= this.getBase64.bind(this)
    this.getUploadHash= this.getUploadHash.bind(this)
    this.getUploadButton= this.getUploadButton.bind(this)
  }

  async pinFileToIPFS() {

       this.setState({
           uploadHash: "Uploading..."
       });

       var xmlHttpRequest = new XMLHttpRequest();
       var  self =  this;
       xmlHttpRequest.onreadystatechange = function() {
           if (xmlHttpRequest.readyState == XMLHttpRequest.DONE) {
	       var filename = self.state.file.name;
	       var resp = JSON.parse(xmlHttpRequest.responseText);
               var fullIpfsPaste =  "xipfs ipfs/"  +  resp.IpfsHash + "/" + filename;
               var  respMessage = 
                    <div>
                       <p><b>Your hash is {resp.IpfsHash} </b></p>
                       <CopyToClipboard text={fullIpfsPaste}
                         onCopy={() => self.setState({copied: true})}>
                         <button>Copy to clipboard with button</button>
                       </CopyToClipboard>
                       <p>Copy/Paste above command into terminal to assign current upload to this UPC</p>
                    </div>



               self.setState({
                   uploadHash: respMessage
               });
           }
       }



       xmlHttpRequest.open("POST", 'https://competent-kowalevski-330f95.netlify.app/.netlify/functions/cors/https://api.pinata.cloud/pinning/pinFileToIPFS', true);
       xmlHttpRequest.setRequestHeader("pinata_api_key", "981ec5b37a624a6c6126");
       xmlHttpRequest.setRequestHeader("pinata_secret_api_key", "b637f14db8620f6e16b3b079a74b95b9b0b82d8007432f6f54e0d8af921d2c31");
       xmlHttpRequest.setRequestHeader("Content-Disposition", "form-data");
       xmlHttpRequest.setRequestHeader("Conteht-Type", "multipart/form-data");
       xmlHttpRequest.setRequestHeader("Access-Control-Allow-Origin", "*");
       var formData = new FormData();
       var pinOptions = {"wrapWithDirectory": true}

       formData.append("file", this.state.file);
       formData.append("pinataOptions", JSON.stringify(pinOptions));
       await xmlHttpRequest.send(formData);
       var resp = xmlHttpRequest.response
  };

  getUploadButton() {
     return this.state.uploadButton;
  }

  getUploadHash() {
     return this.state.uploadHash;
  }


  getBase64(e) {
    var file = e.target.files[0]
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {

     var uplButton =  <button onClick={() => this.pinFileToIPFS()}> Upload </button>

      this.setState({
        imgUpload: reader.result,
        file: file,
        uploadButton: uplButton,
      })
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    }
  }


  render () {
    var uploadHash = this.getUploadHash();
    var uploadButton = this.getUploadButton();
    return (
      <div>
<Modal style={{"display":"table-cell", "textAlign":"center", "verticalAlign":"middle"}} visible={this.state.showUploaderModal} closemodal={() => this.setState({ showUploaderModal: false })} type="pulse" > {this.state.uploader}</Modal>

        <h2>Pick a file to upload</h2>
        <p>{uploadHash}</p>

          <input id="upload" ref="upload" type="file"
                     onChange={(event)=> { 
                         this.getBase64(event) 
                    }}
          />
        {uploadButton}
      </div>
    )
  }
}
