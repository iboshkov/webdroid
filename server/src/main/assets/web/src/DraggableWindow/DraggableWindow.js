import React, { Component } from 'react';
import Draggable from 'react-draggable'; // The default
import Rnd from 'react-rnd/lib/';
import * as path from 'path';
import * as Blueprint from "@blueprintjs/core";
import Selection from '../Selection/Selection'
import LazyLoad from 'react-lazy-load';
import { Dialog, Button, Intent, Position, Spinner, NonIdealState, Text, Breadcrumb, Menu, MenuItem, MenuDivider, Tree, Tooltip, Classes, ITreeNode } from "@blueprintjs/core";
/*
    -- TODO --
*/
class DraggableWindow extends Component {
  constructor(props) {
    super(props)
  }

  fetchList(currentPath) {
    this.setState({ isLoading: true });
    fetch(`rest/filesystem/list/?path=${currentPath}`).then(r => r.json()).then(
      data => {
        console.log(`Got files for currentPath ${currentPath}`)
        console.log(data)
        this.setState({ files: data.files, isLoading: false })
      }
    ).catch(err => {
      this.setState({ isLoading: false });
      console.error("Error fetching file list");
    })
  }

  handleNodeClick(nodeData, _nodecurrentPath, e) {
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

  navigateAbsolute(to, _toBackStack = true, nukeForwardStack = false) {
    let backStack = this.state.backStack;

    if (_toBackStack) {
      backStack.push(to);
      console.log("Changing backstack", backStack);
    }

    if (nukeForwardStack) {
      this.setState({ forwardStack: [] })
    }

    this.setState({ backStack, currentPath: to });

    this.fetchList(to);
  }

  navigateBack() {
    let { backStack, forwardStack, currentPath } = this.state;
    console.log("Backstack", backStack);
    let prev = backStack.pop();
    forwardStack.push(prev)
    prev = backStack[backStack.length - 1]
    this.navigateAbsolute(prev, false);
    console.log("going to ", prev);
    console.log("Backstack", backStack);
    this.setState({ backStack, forwardStack });
  }

  navigateForward() {
    let { forwardStack } = this.state;

    console.log(forwardStack);
    let prev = forwardStack.pop();
    this.navigateAbsolute(prev);
  }

  relativePath(to) {
    let _currentPath = this.state.currentPath;
    return _currentPath = path.join(_currentPath, to);
  }

  navigateRelative(to) {
    this.navigateAbsolute(this.relativePath(to));
  }

  download(node) {
    return `rest/filesystem/serve/?path=${this.relativePath(node.name)}`
  }

  refresh() {
    console.log("REFRESH", this.state.currentPath);
    this.fetchList(this.state.currentPath);
  }

  afterSelect(selectedTargets ) {
      const hasSelected = selectedTargets.length
      selectedTargets.forEach(target => {
        console.log(target.getAttribute("data-path"))
      });
  }

  isImage(path) {
    const extensions = [".jpg", ".png", ".gif"]
    for (let ext of extensions) {
      if (path.endsWith(ext)) return true;
    }
    return false;
  }

  render() {
    let { files } = this.state;
    let wholePath = this.state.currentPath;
    let crumbs = ["/", ...wholePath.split(path.sep).filter(str => str !== "")];
    let crumbsWhole = crumbs;
    let refreshClass = "";
    crumbs = crumbs.map((p, i) => {
      let parts = crumbsWhole.slice(0, i + 1)
      return {
        name: p,
        parts,
        partsStr: parts.slice(1).join("/")
      }
    })
    let breadcrumbs = crumbs;
    console.log("currentPathS", breadcrumbs);
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
        z={1003}
        dragHandlerClassName={".pt-dialog-header"}
      >
        <div className="pt-dialog">
          <div className="pt-dialog-header">
            <span className="pt-icon-large pt-icon-folder-open"></span>
            <h5>Files : {this.state.currentPath}</h5>
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
          <nav className="pt-navbar .modifier">
            <div className="pt-navbar-group pt-align-left">
              <Button disabled={this.state.backStack.length <= 1} onClick={this.navigateBack.bind(this)} className="pt-button pt-minimal pt-icon-arrow-left"></Button>
              <Button disabled={this.state.forwardStack.length == 0} onClick={this.navigateForward.bind(this)} className="pt-button pt-minimal pt-icon-arrow-right"></Button>
              <Button disabled={this.state.isLoading} onClick={this.refresh.bind(this)} className="pt-button pt-minimal pt-icon-refresh"></Button>
              {this.state.isLoading && <Spinner className="pt-small" />}
            </div>
            <div className="explorer-breadcrumbs pt-navbar-group pt-align-left">
              <ul className="pt-breadcrumbs">

                {breadcrumbs.map(node => {
                  return (
                    <li><a onClick={() => this.navigateAbsolute(node.partsStr, true, true)} href={`#${node.name}`} className="pt-breadcrumb">{node.name}</a></li>
                  )
                })}
              </ul>
            </div>
            <div className="pt-navbar-group pt-align-right">
              <button className="pt-button pt-minimal pt-icon-download">Download</button>
              <button className="pt-button pt-minimal pt-icon-document">Delete</button>
              <span className="pt-navbar-divider"></span>
              <button className="pt-button pt-minimal pt-icon-user"></button>
              <button className="pt-button pt-minimal pt-icon-notifications"></button>
              <button className="pt-button pt-minimal pt-icon-cog"></button>
            </div>
          </nav>

          <div style={{ height: "100%" }} className="without-overflow">
            <div className="sm-col sm-col-3 with-overflow sidebar">
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
              <Selection target=".target" afterSelect={this.afterSelect}>
              
              <div className="grid-container">

                  {!this.state.isLoading && files.map(node => {
                    let icon = node.isDirectory ? "folder-close" : "document";
                    let p = node.name;
                    let isImage = this.isImage(p);
                    return (
                      <div data-path={this.relativePath(p)} onDoubleClick={() => node.isDirectory && this.navigateRelative(p)} className="grid-card target pt-card pt-elevation-0 pt-interactive">
                        {isImage ? (
                          <LazyLoad >
                            <img src={this.download(node)} />
                          </LazyLoad>
                        ): (
                          <span className={`pt-icon-large pt-icon-${icon} explorer-icon pt-intent-primary`} />
                        )}

                        <Text className="explorer card filename">
                          {node.name}
                        </Text>
                        <nav className=" .modifier">
                          <div className="pt-navbar-group pt-align-left">
                            <Tooltip content="Click to download!" position={Position.RIGHT}><a target="_blank" href={this.download(node)} className="pt-button pt-minimal pt-icon-download"></a></Tooltip>
                          </div>

                          <div className="pt-navbar-group pt-align-right">
                            <Tooltip content="Click to delete" position={Position.RIGHT}><button className="pt-button pt-minimal pt-icon-trash"></button></Tooltip>
                          </div>
                        </nav>
                      </div>
                    )
                  })}
                  {!this.state.isLoading && files.length == 0 && (
                    <NonIdealState visual={"folder-open"} description={"This folder is empty."} title={"Empty"} />
                  )}
                  {this.state.isLoading && (
                    <Spinner />
                  )}
              </div>
                </Selection>
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

export default DraggableWindow;
