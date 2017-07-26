import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, action} from "mobx";
import axios from "axios";
import {Tabs, Button, Icon} from "antd";
import event from "~/utils/event";
import "./TabbedPanel.css";


@observer
export default class TabbedPanel extends Component {
    @observable panels = [];
    @observable previewPanel = {name: <span><Icon type="lock" />Preview</span>, key: "preview", content: <div className="info">Select TestCase / TestSuite in left panel.</div>};
    @observable activePanelKey = "preview";
    disposers = [];

    componentDidMount() {
        this.disposers.push(event.on("TabbedPanel.addPanel", this.addPanel.bind(this)));
        this.disposers.push(event.on("TabbedPanel.addPreviewPanel", this.addPreviewPanel.bind(this)));
    }

    componentWillUnMount() {
        this.disposers.map((disposer) => disposer());
    }

    render() {
        return (<div className="tabbed-panel">
                <Tabs
                    hideAdd
                    type="editable-card"
                    activeKey={this.activePanelKey}
                    onChange={this.selectPanel.bind(this)}
                    onEdit={this.removePanel.bind(this)}
                >
                    <Tabs.TabPane tab={this.previewPanel.name} key={this.previewPanel.key} closable={false}>{this.previewPanel.content}</Tabs.TabPane>
                    {this.panels.map(panel =>
                        <Tabs.TabPane tab={panel.name} key={panel.key}>{panel.content}</Tabs.TabPane>)}
                </Tabs>
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

    addPreviewPanel(panel) {
        this.activePanelKey = panel.key;
        this.previewPanel = panel;
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
                } else {
                    this.activePanelKey = this.previewPanel.key;
                }
            }
            this.panels = this.panels.filter(panel => panel.key !== key);
        }
    }
}
