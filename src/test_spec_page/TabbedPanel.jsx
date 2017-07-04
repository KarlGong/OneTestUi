import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import axios from "axios";
import {Tabs, Button} from "antd";
import state from "./State";
import "./TabbedPanel.css";

@observer
class TabbedPanel extends Component {

    render() {
        return (<div class="right-panel">{state.panels.length ?
                <Tabs
                    hideAdd
                    type="editable-card"
                    activeKey={state.activePanelKey}
                    onChange={this.onChange.bind(this)}
                    onEdit={this.onEdit.bind(this)}
                >
                    {state.panels.map(panel =>
                        <Tabs.TabPane tab={panel.title} key={panel.key}>{panel.content}</Tabs.TabPane>)}
                </Tabs> : <div class="info-text">Select TestCase / TestSuite in left panel.</div>}
            </div>
        );
    }

    onChange(key) {
        state.selectPanel(key);
    }

    onEdit(key, action) {
        if (action === "remove") {
            state.removePanel(key);
        }
    }
}

export default TabbedPanel;
