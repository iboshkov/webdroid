import React, { Component } from 'react';
import './App.css';
import Draggable from 'react-draggable'; // The default
import Rnd from 'react-rnd/lib/';

// or just take everything!
import * as Blueprint from "@blueprintjs/core";
import { Dialog, Button, Intent, Position, Menu, MenuItem, MenuDivider, Tree, Tooltip, Classes, ITreeNode } from "@blueprintjs/core";
class ResizableDialog extends Component {
  constructor(props) {
    super(props)
    const tooltipLabel = <Tooltip content="An eye!"><span className="pt-icon-standard pt-icon-eye-open" /></Tooltip>;
    const longLabel = "Organic meditation gluten-free, sriracha VHS drinking vinegar beard man.";

    this.state = {
      dialogOpen: false,
      nodes: [
        {
          hasCaret: true,
          iconName: "folder-close",
          label: "Folder 0",
        },
        {
          iconName: "folder-close",
          isExpanded: true,
          label: <Tooltip content="I'm a folder <3">Folder 1</Tooltip>,
          childNodes: [
            { iconName: "document", label: "Item 0", secondaryLabel: tooltipLabel },
            { iconName: "pt-icon-tag", label: longLabel },
            {
              hasCaret: true,
              iconName: "pt-icon-folder-close",
              label: <Tooltip content="foo">Folder 2</Tooltip>,
              childNodes: [
                { label: "No-Icon Item" },
                { iconName: "pt-icon-tag", label: "Item 1" },
                {
                  hasCaret: true, iconName: "pt-icon-folder-close", label: "Folder 3",
                  childNodes: [
                    { iconName: "document", label: "Item 0" },
                    { iconName: "pt-icon-tag", label: "Item 1" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }
  handleNodeClick(nodeData, _nodePath, e) {
    const originallySelected = nodeData.isSelected;
    if (!e.shiftKey) {
      this.forEachNode(this.state.nodes, (n) => n.isSelected = false);
    }
    console.log("Click");
    nodeData.isSelected = originallySelected == null ? true : !originallySelected;
    this.setState(this.state);
  }

  handleNodeCollapse(nodeData) {
    console.log("Click");
    nodeData.isExpanded = false;
    this.setState(this.state);
  }

  handleNodeExpand(nodeData) {
    console.log("Click");
    nodeData.isExpanded = true;
    this.setState(this.state);
  }

  forEachNode(nodes, callback) {
    if (nodes == null) {
      return;
    }

    for (const node of nodes) {
      callback(node);
      this.forEachNode(node.childNodes, callback);
    }
  }

  render() {

    return (
        <Rnd
          default={{
            x: 100,
            y: 100,
            width: 1024,
            height: 600,
          }}
          minWidth={550}
          minHeight={300}
        >
          <div className="pt-dialog">
            <div className="pt-dialog-header">
              <span className="pt-icon-large pt-icon-camera"></span>
              <h5>Photos</h5>
              <button aria-label="Close" className="pt-dialog-close-button pt-icon-small-cross"></button>
            </div>

            <nav className="pt-navbar .modifier">
              <div className="pt-navbar-group pt-align-left">
                <div className="pt-navbar-heading">WebDroid</div>
                <input className="pt-input" placeholder="Search files..." type="text" />
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

            <div style={{height: "100%"}} className="without-overflow">
              <div  className="sm-col sm-col-3 border with-overflow sidebar">
                <Menu>
                  <MenuItem
                    iconName="new-text-box"
                    onClick={this.handleClick}
                    text="New text box"
                  />
                  <MenuItem
                    iconName="new-object"
                    onClick={this.handleClick}
                    text="New object"
                  />
                  <MenuItem
                    iconName="new-link"
                    onClick={this.handleClick}
                    text="New link"
                  />
                  <MenuDivider />
                  <MenuItem text="Settings..." iconName="cog" />
                </Menu>
                <Tree
                  contents={this.state.nodes}
                  onNodeClick={this.handleNodeClick.bind(this)}
                  onNodeCollapse={this.handleNodeCollapse.bind(this)}
                  onNodeExpand={this.handleNodeExpand.bind(this)}
                  className={Classes.ELEVATION_0}
                />
              </div>
              <div className="sm-col sm-col-9  with-overflow">
                {this.props.children}
              </div>
            </div>
            <div className="pt-dialog-body" />

            <div className="pt-dialog-footer">
              <div className="pt-dialog-footer-actions">
                <button type="button" className="pt-button">Secondary button</button>
                <button type="submit" className="pt-button pt-intent-primary">Primary button</button>
              </div>
            </div>
          </div>
        </Rnd>
    );
  }
}

export default ResizableDialog;
