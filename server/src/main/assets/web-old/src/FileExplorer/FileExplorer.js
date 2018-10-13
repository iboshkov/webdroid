import React, { Component } from 'react';
import Draggable from 'react-draggable'; // The default
import Rnd from 'react-rnd/lib/';
import * as path from 'path';
import * as Blueprint from "@blueprintjs/core";
import Selection from '../Selection/Selection'
import LazyLoad from 'react-lazy-load';
import Lightbox from 'react-images';
import FileGrid from './FileGrid';
import * as request from 'superagent';
const uuidV1 = require('uuid/v1');

import { Toaster, Alert, Dialog, Button, Intent, Position, Overlay, Spinner, NonIdealState, Text, Breadcrumb, Menu, MenuItem, MenuDivider, Tree, Tooltip, Classes, ITreeNode } from "@blueprintjs/core";

import { config } from '../config';

class FileExplorer extends Component {
  constructor(props) {
    super(props)
    this.newFolderName = "";

    this.state = {
      dialogOpen: false,
      currentPath: "/",
      loadedList: [],
      files: [],
      backStack: ["/"],
      forwardStack: [],
      activeUploadSessions: {},
      isLoading: false,
      lightboxImage: null,
      lightboxIsOpen: false,
      deleteAlertOpen: false,
      newFolderAlertOpened: false,
      selection: []
    };
  }

  componentDidMount() {
      this.fetchList(this.state.currentPath);
  }

  onDrop(acceptedFiles, rejectedFiles) {
    acceptedFiles.forEach(file => {
      let sessionId = uuidV1();
      let { activeUploadSessions } = this.state;

      let req = request.post(`${config.baseUrl}/rest/filesystem/upload/?sess=${sessionId}`);
      activeUploadSessions[sessionId] = req;
      req.field("destPath", this.state.currentPath);

      req.attach(file.name, file);
      req.end((err, res) => {
        console.log(err, res);
        console.log(`Removing session ${sessionId}`)
        delete activeUploadSessions[sessionId];
        this.setState({ activeUploadSessions });
        this.fetchList(this.state.currentPath);
      });
      window.URL.revokeObjectURL(file.preview);
    });

  }

  fetchList(currentPath) {
    this.setState({ isLoading: true });
    fetch(`${config.baseUrl}/rest/filesystem/list/?path=${currentPath}`).then(r => r.json()).then(
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

  deleteAlertConfirmed() {
    fetch(`${config.baseUrl}/rest/filesystem/delete/`, {
      method: 'delete',
      body: JSON.stringify({
        files: this.state.selection
      })
    }).then(r => r.json()).then(
      data => {
        console.log(data)
        this.fetchList(this.state.currentPath)
        this.showDeleteToast(data);
      }
      ).catch(err => {
        console.error("Error during file deletion list");
        console.log(err)
      })

    this.setState({ deleteAlertOpen: false })
  }

  newFolderConfirmed() {
    fetch(`${config.baseUrl}/rest/filesystem/mkdir/`, {
      method: 'POST',
      body: JSON.stringify({
        name: this.relativePath(this.newFolderName)
      })
    }).then(r => r.json()).then(
      data => {
        console.log(data)
        this.fetchList(this.state.currentPath)
        let intent = data.status == 0 ? Intent.SUCCESS : Intent.DANGER
        this.toaster.show({ intent, iconName: "folder-open", message: data.message });

      }
      ).catch(err => {
        console.error("Error during file deletion list");
        console.log(err)
      })

    this.setState({ newFolderAlertOpened: false })
  }

  hasSelection() { return this.state.selection.length > 0 }

  showDeleteToast(data) {
    this.toaster.show({ intent: Intent.DANGER, iconName: "trash", message: `Sucecssfully deleted ${data.count} items!` });
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

  handleDownloadSelection() {
    fetch(`${config.baseUrl}/rest/filesystem/zipAndDownload/`, {
      method: 'post',
      body: JSON.stringify({
        files: this.state.selection
      })
    }).then(r => r.json()).then(
      data => {
        console.log(data)
        window.open(`${config.baseUrl}/rest/filesystem/serveAndDelete/?path=${data.absolutePath}`, "_blank");
        this.fetchList(this.state.currentPath)
      }
      ).catch(err => {
        console.error("Error during zip/download");
        console.log(err)
      })

  }

  navigateRelative(to) {
    this.navigateAbsolute(this.relativePath(to));
  }

  download(node) {
    return `${config.baseUrl}/rest/filesystem/serve/?path=${this.relativePath(node.name)}`
  }

  refresh() {
    console.log("REFRESH", this.state.currentPath);
    this.fetchList(this.state.currentPath);
  }

  afterSelect(selectedTargets) {
    const hasSelected = selectedTargets.length
    this.setState({
      selection: selectedTargets.map(target => {
        return target.getAttribute("data-path-abs");
      })
    });
  }

  openLightBox(path) {
    console.log(`Opening lightbox ${path}`)
    this.setState({ lightboxIsOpen: true, lightboxImage: path });
  }

  fileItemDoubleClicked(node) {
    if (node.isDirectory) {
      this.navigateRelative(node.name)
      return;
    }

    if (this.isImage(node.path)) {
      this.openLightBox(this.download(node));
      return;
    }

  }

  fileItemClicked(node) {
    if (node.isDirectory) {
      // Toggle selection
      // this.navigateRelative(node.name)
      return;
    }

    if (this.isImage(node.path)) {
      this.openLightBox(this.download(node));
      return;
    }

  }

  isImage(path) {
    const extensions = [".jpg", ".png", ".gif"]
    for (let ext of extensions) {
      if (path.endsWith(ext)) return true;
    }
    return false;
  }

  setFullscreen() {

  }

  render() {
    let { files } = this.state;
    console.log(files);
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
    <div>
        <div style={ { width: "100%", height: "100%" } } className="bp3-dialog bp3-dialog-window file-explorer">
          <div onDoubleClick={this.setFullscreen.bind(this)} className="bp3-dialog-header">
            <span className="bp3-icon-large bp3-icon-folder-open"></span>
            <h5>Files : {this.state.currentPath}</h5>
            <button aria-label="Close" className="bp3-dialog-close-button bp3-icon-small-cross"></button>
          </div>

          <nav className="bp3-navbar .modifier">
            <div className="bp3-navbar-group bp3-align-left">
              <div className="bp3-navbar-heading">WebDroid</div>
              <input className="bp3-input" placeholder="Search files..." type="text" />

            </div>
            <div className="bp3-navbar-group bp3-align-right">
              <button className="bp3-button bp3-minimal bp3-icon-home">Home</button>
              <button className="bp3-button bp3-minimal bp3-icon-document">Files</button>
              <span className="bp3-navbar-divider"></span>
              <button className="bp3-button bp3-minimal bp3-icon-user"></button>
              <button className="bp3-button bp3-minimal bp3-icon-notifications"></button>
              <button className="bp3-button bp3-minimal bp3-icon-cog"></button>
            </div>
          </nav>
          <nav className="bp3-navbar .modifier">
            <div className="bp3-navbar-group bp3-align-left">
              <Button disabled={this.state.backStack.length <= 1} onClick={this.navigateBack.bind(this)} className="bp3-button bp3-minimal bp3-icon-arrow-left"></Button>
              <Button disabled={this.state.forwardStack.length == 0} onClick={this.navigateForward.bind(this)} className="bp3-button bp3-minimal bp3-icon-arrow-right"></Button>
              <Button disabled={this.state.isLoading} onClick={this.refresh.bind(this)} className="bp3-button bp3-minimal bp3-icon-refresh"></Button>
              {this.state.isLoading && <Spinner className="bp3-small" />}
            </div>
            <div className="explorer-breadcrumbs bp3-navbar-group bp3-align-left">
              <ul className="bp3-breadcrumbs">

                {breadcrumbs.map((node, index) => {
                  return (
                    <li key={index}><a onClick={() => this.navigateAbsolute(node.partsStr, true, true)} href={`#${node.name}`} className="bp3-breadcrumb">{node.name}</a></li>
                  )
                })}
              </ul>
            </div>
            <div className="bp3-navbar-group bp3-align-right">
              <button disabled={!this.hasSelection()} onClick={() => { this.handleDownloadSelection() }} className="bp3-button bp3-minimal bp3-intent-primary bp3-icon-download">Download</button>
              <button disabled={!this.hasSelection()} onClick={() => this.setState({ deleteAlertOpen: true })} className="bp3-button bp3-minimal bp3-intent-danger bp3-icon-document">Delete</button>
              <span className="bp3-navbar-divider"></span>
              <button className="bp3-button bp3-minimal bp3-icon-add" onClick={() => this.setState({ newFolderAlertOpened: true })}>New Folder</button>
            </div>
          </nav>

          <div style={{ height: "100%" }} className="without-overflow">
            <div className="sm-col sm-col-3 with-overflow sidebar">
              <Menu>
                <MenuDivider />
                <MenuItem text="Settings..." />
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
              <FileGrid onDrop={this.onDrop.bind(this)} onSelectionChanged={this.afterSelect.bind(this)} onItemClicked={this.fileItemClicked.bind(this)} onItemDoubleClicked={this.fileItemDoubleClicked.bind(this)} currentPath={this.state.currentPath} files={files} isLoading={this.state.isLoading} />
            </div>
          </div>
          <div className="bp3-diralog-body">
          </div>

          <div className="bp3-dialog-footer">

            <div className="bp3-dialog-footer-actions">
              <div className="status">
                {this.state.selection.length > 0 && (`${this.state.selection.length} selected items`)}
              </div>
              <button type="button" className="bp3-button">Secondary button</button>
              <button type="submit" className="bp3-button bp3-intent-primary">Primary button</button>
            </div>
          </div>

          <Overlay className="lightbox bp3-overlay-scroll-container" isOpen={this.state.lightboxIsOpen} onClose={() => this.setState({ lightboxIsOpen: false })}>
            <div className="swing-transition bp3-card bp3-elevation-4">
              <img className="lightbox-image" src={this.state.lightboxImage} />
              <Button intent={Intent.DANGER} onClick={this.handleClose}>Close</Button>
              <Button onClick={this.focusButton} style={{ float: "right" }}>Focus button</Button>
            </div>
          </Overlay>
          <Alert
            className={this.props.themeName}
            intent={Intent.DANGER}
            isOpen={this.state.deleteAlertOpen}
            confirmButtonText="Delete"
            cancelButtonText="Cancel"
            iconName="trash"
            onConfirm={this.deleteAlertConfirmed.bind(this)}
            onCancel={() => this.setState({ deleteAlertOpen: false })}
          >
            <p>
              Are you sure you want delete the selected files ?<br />
              <b>This operation cannot be undone.</b>
            </p>
          </Alert>
          <Alert
            className={this.props.themeName}
            intent={Intent.SUCCESS}
            isOpen={this.state.newFolderAlertOpened}
            confirmButtonText="Create"
            cancelButtonText="Cancel"
            iconName="folder-open"
            onConfirm={this.newFolderConfirmed.bind(this)}
            onCancel={() => this.setState({ newFolderAlertOpened: false })}
          >
            <p>
              <div className="bp3-form-group bp3-intent-danger">
                <label autofocus={true} className="bp3-label" htmlFor="folder-name">
                  <b>New folder name:</b>
                </label>
                <div class="bp3-form-content">
                  <input style={{ width: "100%" }} name="folder-name" className="bp3-input" onChange={(e) => this.newFolderName = e.target.value} placeholder="Enter the name of the new folder." />
                </div>
              </div>
            </p>
          </Alert>
        </div>
        <Toaster position={Position.TOP_RIGHT} ref={ref => this.toaster = ref} />
      </div>
    );
  }
}

export default FileExplorer;
