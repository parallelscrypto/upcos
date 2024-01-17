import React, { Component } from 'react';

class TableSlideshow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
    };
  }

  showPrevious = () => {
    this.setState((prevState) => ({
      currentIndex: prevState.currentIndex === 0 ? this.props.tables.length - 1 : prevState.currentIndex - 1,
    }));
  };

  showNext = () => {
    this.setState((prevState) => ({
      currentIndex: prevState.currentIndex === this.props.tables.length - 1 ? 0 : prevState.currentIndex + 1,
    }));
  };

  render() {
    const { currentIndex } = this.state;
    const { tables } = this.props;

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={this.showPrevious}>&lt;</button>
        <div
          style={{
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            width: '100vw', // Adjust the width as needed
          }}
        >
          <div style={{ display: 'flex' }}>
            {tables.map((table, index) => (
              <div
                key={index}
                style={{
                  flex: '0 0 100vw',
                  maxWidth: '100%',
                  display: index === currentIndex ? 'block' : 'none',
                  visibility: index === currentIndex ? 'visible' : 'hidden',
                  transition: 'transform 0.3s ease-in-out',
                }}
              >
                {table}
              </div>
            ))}
          </div>
        </div>
        <button onClick={this.showNext}>&gt;</button>
      </div>
    );
  }
}

export default TableSlideshow;
