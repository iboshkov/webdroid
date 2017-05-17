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
import FileUploadToasts from '../FileUploadToasts/FileUploadToasts';
const uuidV1 = require('uuid/v1');

import { Toaster, Alert, Dialog, Button, Intent, Position, Overlay, Spinner, NonIdealState, Text, Breadcrumb, Menu, MenuItem, MenuDivider, Tree, Tooltip, Classes, ITreeNode } from "@blueprintjs/core";


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
      selection: [],
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
            { iconName: "document", label: "Item 0" },
            { iconName: "pt-icon-tag" },
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

    this.fetchList(this.state.currentPath);
  }

  onDrop(acceptedFiles, rejectedFiles) {
    acceptedFiles.forEach(file => {
      let sessionId = uuidV1();
      let { activeUploadSessions } = this.state;

      let req = request.post(`rest/filesystem/upload/?sess=${sessionId}`);
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

  deleteAlertConfirmed() {
    fetch(`rest/filesystem/delete/`, {
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
    fetch(`rest/filesystem/mkdir/`, {
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
    fetch(`rest/filesystem/zipAndDownload/`, {
      method: 'post',
      body: JSON.stringify({
        files: this.state.selection
      })
    }).then(r => r.json()).then(
      data => {
        console.log(data)
        window.open(`rest/filesystem/serveAndDelete/?path=${data.absolutePath}`, "_blank");
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
    return `rest/filesystem/serve/?path=${this.relativePath(node.name)}`
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
        <div className="pt-dialog pt-dialog-window">
          <div onDoubleClick={this.setFullscreen.bind(this)} className="pt-dialog-header">
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
              <button disabled={!this.hasSelection()} onClick={() => { this.handleDownloadSelection() }} className="pt-button pt-minimal pt-intent-primary pt-icon-download">Download</button>
              <button disabled={!this.hasSelection()} onClick={() => this.setState({ deleteAlertOpen: true })} className="pt-button pt-minimal pt-intent-danger pt-icon-document">Delete</button>
              <span className="pt-navbar-divider"></span>
              <button className="pt-button pt-minimal pt-icon-add" onClick={() => this.setState({ newFolderAlertOpened: true })}>New Folder</button>
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
              <FileGrid onDrop={this.onDrop.bind(this)} onSelectionChanged={this.afterSelect.bind(this)} onItemClicked={this.fileItemClicked.bind(this)} onItemDoubleClicked={this.fileItemDoubleClicked.bind(this)} currentPath={this.state.currentPath} files={files} isLoading={this.state.isLoading} />
            </div>
          </div>
          <div className="pt-diralog-body">
          </div>

          <div className="pt-dialog-footer">

            <div className="pt-dialog-footer-actions">
              <div className="status">
                {this.state.selection.length > 0 && (`${this.state.selection.length} selected items`)}
              </div>
              <button type="button" className="pt-button">Secondary button</button>
              <button type="submit" className="pt-button pt-intent-primary">Primary button</button>
            </div>
          </div>

          <Overlay className="lightbox pt-overlay-scroll-container" isOpen={this.state.lightboxIsOpen} onClose={() => this.setState({ lightboxIsOpen: false })}>
            <div className="swing-transition pt-card pt-elevation-4">
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
              <div className="pt-form-group pt-intent-danger">
                <label autofocus={true} className="pt-label" htmlFor="folder-name">
                  <b>New folder name:</b>
                </label>
                <div class="pt-form-content">
                  <input style={{ width: "100%" }} name="folder-name" className="pt-input" onChange={(e) => this.newFolderName = e.target.value} placeholder="Enter the name of the new folder." />
                </div>
              </div>
            </p>
          </Alert>
        </div>
        <Toaster position={Position.TOP_RIGHT} ref={ref => this.toaster = ref} />
        <FileUploadToasts activeUploadSessions={this.state.activeUploadSessions} />
      </Rnd>
    );
  }
}

export default FileExplorer;
