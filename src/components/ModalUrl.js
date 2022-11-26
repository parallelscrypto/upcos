import React, { Component, Fragment } from 'react'
import Modal from "react-animated-modal";

export default class ModalUrl extends Component {
  state = { isOpen: false }

  render () {

    return (
      <Fragment>
        <button onClick={() => this.setState({ modalOpen: true })}>{this.props.children}</button>
        <Modal isOpen={this.state.isOpen}>
          <iframe src={this.props.href} ></iframe>
        </Modal>
      </Fragment>
    )
  }
}
