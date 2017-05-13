import React, { Component } from 'react';
import './app.css';
import Draggable from 'react-draggable'; // The default
import Rnd from 'react-rnd/lib/';
import ResizableDialog from './ResizableDialog';

import { Dialog, Button, Intent, Menu, MenuItem, MenuDivider, Position, ProgressBar, Tree, Tooltip, Classes, ITreeNode } from "@blueprintjs/core";

class PhoneStatusWidget extends Component {
    constructor(props) {
        super(props)

        this.nodes = [1, 2, 3, 4, 5, 6, 7];

        this.state = {
            dialogOpen: false,
            summary: {},
            intent: {},
            status: {}
        }

        fetch("http://localhost:3000/rest/phone/info").then(r => r.json())
            .then(json => {
                this.setState({ summary: json })
            }).catch((response) => {
                console.log("Error getting phone data");
            })
        this.fetchStatus();
        setInterval(this.fetchStatus.bind(this), 10000);
    }

    fetchStatus() {
        fetch("http://localhost:3000/rest/phone/status").then(r => r.json())
            .then(json => {
                let intent = Intent.PRIMARY;
                if (json.percent == 1) intent = Intent.SUCCESS;
                if (json.percent < 0.5) intent = Intent.WARNING;
                if (json.percent < 0.20) intent = Intent.DANGER;
                this.setState({ status: json, intent })
            }).catch((response) => {
                console.log("Error getting phone status");
            })
    }
    
    chargeMessage() {
        let {status} = this.state;
        
        if (!status.charging) {
            return "Discharging";
        }

        let mode = status.chargeMode == "ac" ? "via charger" : "via USB";
        return `Charging ${mode}`;
    }


    render() {
        let {status, summary} = this.state;
        let os = summary ? summary.os : undefined;
        if (!os) return (<div/>);
        console.log(status, summary);
        return (
            <div className="App">
                <Draggable>
                    <div className="phone-status-widget pt-dark">
                        <h3>{summary.brand} {summary.device}</h3>
                        <div className="phone-image">
                            <img height="300px" src="http://image3.mouthshut.com/images/Restaurant/Photo/LG-G3-58772_3498.png" />
                        </div>
                        <div className="phone-details">
                            <table className="pt-table .modifier">
                                <tbody>
                                    <tr>
                                        <td>Battery {status.percent ? Math.round(status.percent * 100) : "Unknown"} %, {this.chargeMessage()}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2"><ProgressBar className="pt-no-stripes" intent={this.state.intent} value={status.percent ? status.percent : null} /></td>
                                    </tr>
                                    <tr>
                                        <td>Android {os.release}</td>
                                    </tr>
                                    <tr>
                                        <td>SVG, TypeScript, D3</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Draggable>
            </div>
        );
    }
}

export default PhoneStatusWidget;
