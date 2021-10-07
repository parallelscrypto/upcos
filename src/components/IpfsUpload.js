import ReactFileReader from 'react-file-reader';
const React = require('react')
const ipfsClient = require('ipfs-http-client')
const axios = require('axios');
const FormData = require('form-data');

export default class IpfsUpload extends React.Component {
  constructor () {
    super()
    this.state = {
      added_file_hash: null,
      imgUpload: null,
      file: null,
    }
    this.ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

    // bind methods
    this.pinFileToIPFS= this.pinFileToIPFS.bind(this)
    this.getBase64= this.getBase64.bind(this)
  }

  async pinFileToIPFS() {

console.log(this.state.file);
       var xmlHttpRequest = new XMLHttpRequest();
       xmlHttpRequest.open("POST", 'https://cors.bridged.cc/https://api.pinata.cloud/pinning/pinFileToIPFS', true);
       xmlHttpRequest.setRequestHeader("pinata_api_key", "981ec5b37a624a6c6126");
       xmlHttpRequest.setRequestHeader("pinata_secret_api_key", "b637f14db8620f6e16b3b079a74b95b9b0b82d8007432f6f54e0d8af921d2c31");
       xmlHttpRequest.setRequestHeader("Content-Disposition", "form-data");
       xmlHttpRequest.setRequestHeader("Conteht-Type", "multipart/form-data");
       xmlHttpRequest.setRequestHeader("Access-Control-Allow-Origin", "*");
       var formData = new FormData();
       formData.append("file", this.state.file);
       xmlHttpRequest.send(formData);
  };

  getBase64(e) {
    var file = e.target.files[0]
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      this.setState({
        imgUpload: reader.result,
        file: file,
      })
      console.log(reader.result)
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    }
  }


  render () {
    return (

      <div>
          <input id="upload" ref="upload" type="file"
                     onChange={(event)=> { 
                         this.getBase64(event) 
                    }}
          />
          <button onClick={() => this.pinFileToIPFS()}>
              Upload
          </button>
      </div>
    )
  }
}
