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
import { config } from '../config';
import { SelectableGroup, createSelectable } from 'react-selectable-fast'
import FolderItem from "./FolderItem";

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
        return `${config.baseUrl}/rest/filesystem/serve/?path=${this.relativePath(node.name)}`
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
            <SelectableGroup
                className="main"
                clickClassName="tick"
                enableDeselect
                globalMouse={false}
                allowClickWithoutSelected={false}
                onSelectionFinish={this.afterSelect.bind(this)}
                ignoreList={['.not-selectable', '.item:nth-child(10)', '.item:nth-child(27)']}
            >

                <Dropzone
                disableClick={files.length > 0}
                className="explorer-dropzone"
                onDrop={this.onDrop.bind(this)}>

                <div className="grid-container">
                    {!isLoading && files.map((node, index) => {
                        let icon = node.isDirectory ? "folder-open" : "document";
                        let p = node.name;
                        let imageLoading = !this.state.loadedList.includes(p);
                        return (
                            <FolderItem imageLoading={false} key={index} node={node} />
                        )
                    })}
                    {!isLoading && files.length === 0 && (
                        <NonIdealState className="explorer-nonideal-state" visual={"folder-open"} description={
                            `
                            Click here or drop some files to upload them here. ${files.length}
                            `
                        } title={"This folder is empty"} />
                    )}
                    {isLoading && (
                        <Spinner />
                    )}
                </div>
            </Dropzone>
            </SelectableGroup>
        );
    }
}

export default FileGrid;
