import React, { useState } from 'react';

class InsertDataForm extends React.Component {
  constructor(props) {
    super(props);
console.log("##########   PROPPPPPPPPPPPPPPPZZZZZZZZ ############");
console.log(this.props);
    this.state = {
      link: '',
      hrn: '',
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    // Destructure values from state
    const { link, hrn } = this.state;
    const upc = this.props.upc;
    //const upc = "000000000000";
    // Call the popitPush function with the input values

console.log("///////////preinsert////////////");
console.log(upc);
console.log("#######preinsert###############");

    await this.props.popitPush(link,upc,hrn);

    // Optionally, you can reset the form fields here
    this.setState({ link: '', hrn: '' });
  };

  handleInputChange = (e) => {
    // Update state when input values change
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <div>
        <h1>Your Component</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            URL:
            <input type="text" name="link" value={this.state.link} onChange={this.handleInputChange} />
          </label>
          <br />

          <label>
            Private Protocol Link (PPL):
            <input type="text" name="hrn" value={this.state.hrn} onChange={this.handleInputChange} />
          </label>
          <br />

          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default InsertDataForm;
