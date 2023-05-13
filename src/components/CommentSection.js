import React from 'react';
import commentBox from 'commentbox.io';

export default class CommentSection extends React.Component {

    constructor(props) {
      super(props)

      var upc = this.props.upc;
      this.state = {
         upc : upc
      };
    }


    componentDidMount() {

        var upc = this.props.upc;
        this.state = {
           "upc" : upc
        };
        this.removeCommentBox = commentBox('5676066584657920-proj');

    }

    componentWillUnmount() {

        this.removeCommentBox();
    }

    render() {
       
         return (
            <div className="commentbox" id={this.state.upc}
            />
        );
    }
}
