import React, { Component } from 'react';
import ReactGridLayout from 'react-grid-layout';
import logo from './logo.svg';
import './App.css';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

class App extends Component {
  render() {
    var layout = [
      {i: 'a', x: 0, y: 0, w: 4, h: 4, minW: 4, maxW: 4},
      {i: 'b', x: 0, y: 0, w: 4, h: 4, minW: 4, maxW: 4}
    ];
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React yo!</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <ReactGridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200} draggableCancel=".noDrag">
          <div key="a" className="App-list">
            <List/>
          </div>
          <div key="b" className="App-list">
            <List/>
          </div>
        </ReactGridLayout>
      </div>
    );
  }
}

const List = () => {
  let items = ['one', 'two', 'three'];
  return (
    <ul className="noDrag">
      { items.map((item, index) => <ListItem index={index} item={ item }/>) }
    </ul>

  );
};

const ListItem = ({item, index}) => {
  return (
    <li key={index}>
      <input type="text" value={item}/>
    </li>
  );
};

export default App;
