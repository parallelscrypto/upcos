import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import AppExp from './components/AppExp';
import * as serviceWorker from './serviceWorker';
import Intel from './components/Intel';
import { HashRouter, Route, Link } from "react-router-dom";

var routing;

const routingIntel = (
  <HashRouter>
      <Route path="/intel/:code" component={App} />
  </HashRouter>
)

const routingExport = (
  <HashRouter>
      <Route path="/export/:code" component={AppExp} />
  </HashRouter>
)

const currentPath = window.location.href
if( currentPath.includes("intel") ) {
  routing = routingIntel;
}
else {
  routing = routingExport;
}    


ReactDOM.render(routing, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
