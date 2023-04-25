import React, { Component } from "react";
import axios from "axios";

const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";
const GOOGLE_SEARCH_ENGINE_ID = "YOUR_GOOGLE_SEARCH_ENGINE_ID";
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";

class PoemBot extends Component {
  constructor(props) {
    super(props);

    this.state = {
      productType: "",
      poem: "",
      error: "",
    };
  }

  componentDidMount() {
    const { upcCode } = this.props;
    if (upcCode) {
      this.handleLookup(upcCode);
    }
  }

  handleLookup = (upcCode) => {
    axios
      .get(
        `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${upcCode}`
      )
      .then((response) => {
        if (response.data.items && response.data.items.length > 0) {
          const productType = response.data.items[0].pagemap.product[0].category;
          axios
            .post(
              "https://api.openai.com/v1/engines/davinci-codex/completions",
              {
                prompt: `I am a ${productType} and here is a poem about me:\n`,
                max_tokens: 100,
                temperature: 0.5,
                n: 1,
                stop: ["\n"],
              },
              {
                headers: {
                  Authorization: `Bearer ${OPENAI_API_KEY}`,
                  "Content-Type": "application/json",
                },
              }
            )
            .then((response) => {
              const poem = response.data.choices[0].text.trim();
              this.setState({
                productType: productType,
                poem: poem,
                error: "",
              });
            });
        } else {
          this.setState({
            error: "Sorry, I couldn't find any product information for that UPC code.",
            productType: "",
            poem: "",
          });
        }
      })
      .catch((error) => {
        console.error(error);
        this.setState({
          error: "Sorry, there was an error looking up the product information.",
          productType: "",
          poem: "",
        });
      });
  };

  render() {
    const { productType, poem, error } = this.state;

    return (
      <div>
        <h2>Product Lookup</h2>
        {error && <p>{error}</p>}
        {productType && (
          <p>
            I know I'm just a {productType}, but I have a poem for you about me.
          </p>
        )}
        {poem && <p>{poem}</p>}
      </div>
    );
  }
}

export default PoemBot;

