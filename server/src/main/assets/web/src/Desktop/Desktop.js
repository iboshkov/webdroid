import React, { Component } from 'react';
import Draggable from 'react-draggable'; // The default
import Rnd from 'react-rnd/lib/';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import "./Desktop.css";

import { Dialog, Button, Intent, Menu, MenuItem, MenuDivider, Position, ProgressBar, Tree, Tooltip, Classes, ITreeNode } from "@blueprintjs/core";

class Desktop extends Component {
    constructor(props) {
        super(props)

        this.nodes = [{
            
        }];

        this.state = {
            dialogOpen: false,
            summary: {},
            intent: {},
            status: {}
        }

    }

    chargeMessage() {
        let { status } = this.state;

        if (!status.charging) {
            return "Discharging";
        }

        let mode = status.chargeMode == "ac" ? "via charger" : "via USB";
        return `Charging ${mode}`;
    }


    render() {
        let { status, summary } = this.state;
        let os = summary ? summary.os : undefined;
        if (!os) return (<div />);
        console.log(status, summary);
        return (
            <div className="desktop">
                
            </div>
        );
    }
}

export default Desktop;
