import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, action} from "mobx";
import axios from "axios";
import {Tabs, Button} from "antd";
import event from "~/utils/event";
import "./TabbedPanel.css";


@observer
export default class TabbedPanel extends Component {
    @observable panels = [];
    @observable activePanelKey;
    disposer;

    componentDidMount() {
        this.disposer = event.on("TabbedPanel.addPanel", this.addPanel.bind(this));
    }

    componentWillUnMount() {
        this.disposer();
    }

    render() {
        return (<div className="tabbed-panel">{this.panels.length ?
                <Tabs
                    hideAdd
                    type="editable-card"
                    activeKey={this.activePanelKey}
                    onChange={this.selectPanel.bind(this)}
                    onEdit={this.removePanel.bind(this)}
                >
                    {this.panels.map(panel =>
                        <Tabs.TabPane tab={panel.name} key={panel.key}>{panel.content}</Tabs.TabPane>)}
                </Tabs> : <div className="info">Select TestCase / TestSuite in left panel.</div>}
            </div>
        );
    }

    selectPanel(key) {
        this.activePanelKey = key;
    }

    addPanel(panel) {
        this.activePanelKey = panel.key;
        for (let i = 0; i < this.panels.length; i++) {
            if (this.panels[i].key === panel.key) return;
        }
        this.panels.push(panel);
    }

    @action
    removePanel(key, action) {
        if (action === "remove") {
            if (this.activePanelKey === key) {
                let lastIndex = -1;
                this.panels.forEach((panel, i) => {
                    if (panel.key === key) {
                        lastIndex = i - 1;
                    }
                });
                if (lastIndex >= 0) {
                    this.activePanelKey = this.panels[lastIndex].key;
                } else if (this.panels.length > 1) {
                    this.activePanelKey = this.panels[1].key;
                }
            }
            this.panels = this.panels.filter(panel => panel.key !== key);
        }
    }
}
