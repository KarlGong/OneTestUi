import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, action} from "mobx";
import {Layout, Menu, Icon, Tree, Spin} from "antd";
import axios from "axios";
import event from "event";

@observer
export default class TestTree extends Component {
    @observable treeData = [];
    @observable loading = false;

    componentWillMount() {
        self = this;
        this.loading = true;
        axios.get("/api/project/1/rootsuite").then(function (response) {
            self.loading = false;
            self.treeData.push(response.data);
        })
    }

    render() {
        const loop = (data) => data.map((item) => {
            let key = item.type + "-" + item.id;
            if (item.children && item.children.length) { // expanded test suite
                return <Tree.TreeNode data={item} key={key}
                                      title={item.name + " (" + item.count + ")"}>{loop(item.children)}</Tree.TreeNode>;
            }
            if (item.type === "case") { // test case
                return <Tree.TreeNode data={item} key={key} title={item.name} isLeaf/>;
            } else { // collapsed test suite
                return <Tree.TreeNode data={item} key={key} title={item.name + " (" + item.count + ")"}/>;
            }
        });

        return (
            <Spin spinning={this.loading}>
                <div style={{height: "100%"}}>
                <Tree
                    class="draggable-tree"
                    draggable
                    showLine
                    showicon
                    loadData={this.loadChildren.bind(this)}
                    onDragEnter={this.onDragEnter}
                    onDrop={this.onDrop}
                    onSelect={this.handleSelect.bind(this)}
                >
                    {loop(this.treeData)}
                </Tree>
                </div>
            </Spin>
        );
    }

    loadChildren(treeNode) {
        return new Promise((resolve) => {
            axios.get("/api/suite/" + treeNode.props.data.id + "/children")
                .then(function (response) {
                    treeNode.props.data.children = response.data;
                    resolve();
                });
        })
    }

    handleSelect(selectedKeys, e) {
        let testNode = e.node.props.data;
        if (testNode.type === "case") {
            event.emit("TabbedPanel.addPanel", testNode.name, e.node.props.eventKey);
        }
    }
}
