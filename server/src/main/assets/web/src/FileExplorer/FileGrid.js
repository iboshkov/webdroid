import React, { Component } from 'react';
import Draggable from 'react-draggable'; // The default
import Rnd from 'react-rnd/lib/';
import * as path from 'path';
import * as Blueprint from "@blueprintjs/core";
import Selection from '../Selection/Selection'
import LazyLoad from 'react-lazy-load';
import Lightbox from 'react-images';
import { Dialog, Button, Intent, Position, Overlay, Spinner, NonIdealState, Text, Breadcrumb, Menu, MenuItem, MenuDivider, Tree, Tooltip, Classes, ITreeNode } from "@blueprintjs/core";
import Dropzone from 'react-dropzone';

class FileGrid extends Component {
    constructor(props) {
        super(props)

        this.state = {
            dialogOpen: false,
            loadedList: [],
            selection: [],
            files: [],
            backStack: ["/"],
            forwardStack: [],
        };
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
        this.setState({})
    }

    relativePath(to) {
        let _currentPath = this.props.currentPath;
        return _currentPath = path.join(_currentPath, to);
    }


    onDrop(acceptedFiles, rejectedFiles) {
        // do stuff with files...
        console.log("Dropped", acceptedFiles, rejectedFiles)
        if (!this.props.onDrop) {
            return;
        }

        this.props.onDrop(acceptedFiles, rejectedFiles);
    }


    download(node) {
        return `rest/filesystem/serve/?path=${this.relativePath(node.name)}`
    }

    afterSelect(selectedTargets) {
        const hasSelected = selectedTargets.length
        selectedTargets.forEach(target => {
            console.log(target.getAttribute("data-path-abs"))
        });
        this.setState({selection: selectedTargets}); // TODO: Not this.
        if (!this.props.onSelectionChanged) return;

        this.props.onSelectionChanged(selectedTargets);
    }

    isImage(path) {
        const extensions = [".jpg", ".png", ".gif"]
        for (let ext of extensions) {
            if (path.endsWith(ext)) return true;
        }
        return false;
    }

    _onDoubleClick(node) {
        if (!this.props.onItemDoubleClicked) return;

        this.props.onItemDoubleClicked(node);
    }

    _onClick(node) {
        if (!this.props.onItemClicked) return;

        this.props.onItemClicked(node);
    }

    render() {
        let { files, isLoading } = this.props;
        return (
            <Selection target=".target" afterSelect={this.afterSelect.bind(this)}>
                <Dropzone
                disableClick={files.length > 0}
                className="explorer-dropzone"
                onDrop={this.onDrop.bind(this)}>

                <div className="grid-container">
                    {!isLoading && files.map(node => {
                        let icon = node.isDirectory ? "folder-open" : "document";
                        let p = node.name;
                        let isImage = this.isImage(p);
                        let imageLoading = !this.state.loadedList.includes(p);
                        return (
                            <div data-path-abs={node.absolutePath} data-path={this.relativePath(p)} onDoubleClick={() => this._onDoubleClick(node)} onClick={() => this._onClick(node)} className="grid-card target pt-card pt-elevation-0 pt-interactive">
                                {isImage ? (
                                    <div>
                                        {imageLoading && <Spinner />}
                                        <LazyLoad style={{
                                            display: imageLoading ? 'none' : 'block'
                                        }} onContentVisible={() => {

                                        }} offset={100} >
                                            <img style={{
                                                display: imageLoading ? 'none' : 'block'
                                            }} onLoad={() => {
                                                this.state.loadedList.push(p);
                                                this.setState({ loadedList: this.state.loadedList });
                                            }} onClick={() => this.setState({ lightboxImage: this.download(node), lightboxIsOpen: true })} src={this.download(node)} />
                                        </LazyLoad>
                                    </div>
                                ) : (
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
                    {!isLoading && files.length == 0 && (
                        <NonIdealState className="explorer-nonideal-state" visual={"folder-open"} description={
                            `
                            Click here or drop some files to upload them here.
                            `
                        } title={"This folder is empty"} />
                    )}
                    {isLoading && (
                        <Spinner />
                    )}
                </div>
            </Dropzone>
            </Selection>
        );
    }
}

export default FileGrid;
