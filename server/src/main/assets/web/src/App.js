import React, { Component } from 'react';
import './App.css';
import Draggable from 'react-draggable'; // The default
import Rnd from 'react-rnd/lib/';
import ResizableDialog from './ResizableDialog';
import PhoneStatusWidget from './PhoneStatusWidget';
import {FileExplorer} from './FileExplorer';
import {Desktop} from './Desktop';

import { Dialog, Button, Intent, Menu, MenuItem, MenuDivider, Position, Tree, Tooltip, Classes, ITreeNode } from "@blueprintjs/core";

class App extends Component {
  constructor(props) {
    super(props)

    this.nodes = [1, 2, 3, 4, 5, 6, 7];

    this.state = {
      dialogOpen: false,
    }
  }



  render() {

    return (
      <div className="App">
        <Desktop />

        <div className="center-menu">
          <nav className="bp3-navbar bp3-dark .modifier">
            <div className="bp3-navbar-group bp3-align-left">
              <div className="bp3-navbar-heading">WebDroid</div>
              <input className="bp3-input full-width" placeholder="Search files..." type="text" />
            </div>
            <div className="bp3-navbar-group bp3-align-right">
              <button className="bp3-button bp3-minimal bp3-icon-home">Home</button>
              <button className="bp3-button bp3-minimal bp3-icon-document">Files</button>
              <span className="bp3-navbar-divider"></span>
              <button className="bp3-button bp3-minimal bp3-icon-user"></button>
              <button className="bp3-button bp3-minimal bp3-icon-notifications notif-badge" data-badge="13"></button>
              <button className="bp3-button bp3-minimal bp3-icon-cog"></button>
            </div>
          </nav>
        </div>
        <PhoneStatusWidget />
        <FileExplorer />
      </div>
    );
  }
}

export default App;
