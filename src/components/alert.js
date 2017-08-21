import React, {Component} from "react";
import {observer} from "mobx-react";
import {render, unmountComponentAtNode} from "react-dom";
import {observable} from "mobx";
import {Dropdown, Menu, Alert} from "antd";
import event from "~/utils/event";

@observer
class Alerts extends Component {
    @observable alerts = [];
    disposers = [];

    componentDidMount = () => {
        this.disposers.push(event.on("Alerts.addAlert", this.addAlert));
    };

    componentWillUnMount = () => {
        this.disposers.map((disposer) => disposer());
    };

    addAlert = (type, message, description) => {
        this.alerts.push({type, message, description})
    };

    render = () => {
        return <div style={{position: "fixed", top: 0, left: "50%", transform: "translate(-50%)"}}>
            {this.alerts.map((alert, i) =>
                <Alert style={{marginTop: "16px"}} key={i} type={alert.type} message={alert.message} description={alert.description} closable showIcon/>)}
        </div>
    };
}

const target = document.createElement("div");
document.body.appendChild(target);
render(<Alerts/>, target);

function alert(type, message, description) {
    event.emit("Alerts.addAlert", type, message, description)
}

function success(message, description) {
    alert("success", message, description)
}

function info(message, description) {
    alert("info", message, description)
}

function warning(message, description) {
    alert("warning", message, description)
}

function error(message, description) {
    alert("error", message, description)
}

export default {success, info, warning, error}