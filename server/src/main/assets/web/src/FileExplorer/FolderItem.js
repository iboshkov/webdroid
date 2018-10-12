import {Component} from "react";
import {Position, Spinner, Text, Tooltip} from "@blueprintjs/core";
import LazyLoad from "react-lazy-load";
import React from "react";

class FolderItem extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    isImage(path) {
        const extensions = [".jpg", ".png", ".gif"]
        for (let ext of extensions) {
            if (path.endsWith(ext)) return true;
        }
        return false;
    }

    render() {
        const { node, imageLoading } = this.props;
        let icon = node.isDirectory ? "folder-open" : "document";
        let p = node.name;
        let isImage = this.isImage(p);

        return (
            <div data-path-abs={node.absolutePath} data-path={this.relativePath(p)}
                     onDoubleClick={() => this._onDoubleClick(node)} onClick={() => this._onClick(node)}
                     className="grid-card target bp3-card bp3-elevation-0 bp3-interactive">
                    <span className={`bp3-icon-large bp3-icon-${icon} explorer-icon bp3-intent-primary`}/>
                <Text className="explorer card filename">
                    {node.name}
                </Text>
                <nav className=" .modifier">
                    <div className="bp3-navbar-group bp3-align-left">
                        <Tooltip content="Click to download!" position={Position.RIGHT}><a target="_blank"
                                                                                           href={this.download(this.props.node)}
                                                                                           className="bp3-button bp3-minimal bp3-icon-download"/></Tooltip>
                    </div>

                    <div className="bp3-navbar-group bp3-align-right">
                        <Tooltip content="Click to delete" position={Position.RIGHT}>
                            <button className="bp3-button bp3-minimal bp3-icon-trash"/>
                        </Tooltip>
                    </div>
                </nav>
            </div>
        )
    }
}

export default FolderItem;