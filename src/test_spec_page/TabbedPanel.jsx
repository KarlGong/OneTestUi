import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import TestTreeState from "./TestTreeState";
import axios from "axios";
import {Tabs, Button} from "antd";
import TabbedPanelState from "./TabbedPanelState";

@observer
class TabbedPanel extends Component {
    myState = new TabbedPanelState();

    render() {
        return (
            <Tabs
                hideAdd
                type="editable-card"
                onEdit={this.onEdit.bind(this)}
            >
                {this.myState.panels.map(panel => <Tabs.TabPane tab={panel.title}
                                                                key={panel.key}>{panel.content}</Tabs.TabPane>)}
            </Tabs>
        );
    }

    onEdit(targetKey, action) {
        if (action === "remove") {
            this.myState.removePanel(targetKey);
        }
    }
}

export default TabbedPanel;
