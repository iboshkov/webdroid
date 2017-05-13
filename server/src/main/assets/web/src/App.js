import React, { Component } from 'react';
import './app.css';
import Draggable from 'react-draggable'; // The default
import Rnd from 'react-rnd/lib/';
import ResizableDialog from './ResizableDialog';
import PhoneStatusWidget from './PhoneStatusWidget';
import FileExplorer from './FileExplorer';

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
        <div className="center-menu">
          <nav className="pt-navbar pt-dark .modifier">
            <div className="pt-navbar-group pt-align-left">
              <div className="pt-navbar-heading">WebDroid</div>
              <input className="pt-input full-width" placeholder="Search files..." type="text" />
            </div>
            <div className="pt-navbar-group pt-align-right">
              <button className="pt-button pt-minimal pt-icon-home">Home</button>
              <button className="pt-button pt-minimal pt-icon-document">Files</button>
              <span className="pt-navbar-divider"></span>
              <button className="pt-button pt-minimal pt-icon-user"></button>
              <button className="pt-button pt-minimal pt-icon-notifications"></button>
              <button className="pt-button pt-minimal pt-icon-cog"></button>
            </div>
          </nav>
        </div>
        <PhoneStatusWidget />
        <FileExplorer />
        {/*<ResizableDialog>
          <div className="grid-container">

            {this.nodes.map(node => {
              return (
                <div className="grid-card pt-card pt-elevation-0 pt-interactive">
                  <img src="http://lorempixel.com/192/192/" />
                  <nav className=" .modifier">
                    <div className="pt-navbar-group pt-align-left">
                      <Tooltip content="Click to download!" position={Position.RIGHT}><button className="pt-button pt-minimal pt-icon-download"></button></Tooltip>
                    </div>
                    <div className="pt-navbar-group pt-align-right">
                      <Tooltip content="Click to delete" position={Position.RIGHT}><button className="pt-button pt-minimal pt-icon-trash"></button></Tooltip>
                    </div>
                  </nav>
                </div>
              )
            })}

          </div>

        </ResizableDialog>*/}
      </div>
    );
  }
}

export default App;
