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
    @observable selectedKeys = [];

    componentDidMount() {
        this.loading = true;
        axios.get("/api/project/1/rootsuite").then((response) => {
            this.loading = false;
            this.treeData.push(response.data);
        })
    }

    render() {
        const loop = (data) => data.map((item) => {
            let key = item.type + "-" + item.id;
            if (item.type === "case") { // test case
                return <Tree.TreeNode data={item} key={key} title={item.name} isLeaf/>;
            } else { // test suite
                return <Tree.TreeNode data={item} key={key} title={item.name + " (" + item.count + ")"}>{loop(item.children)}</Tree.TreeNode>;
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
                        selectedKeys={this.selectedKeys}
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
            if (!treeNode.props.data.children.length) {
                axios.get("/api/suite/" + treeNode.props.data.id + "/children")
                    .then(function (response) {
                        treeNode.props.data.children = response.data;
                        resolve();
                    });
            } else {
                resolve();
            }
        })
    }

    handleSelect(selectedKeys, e) {
        this.selectedKeys = [e.node.props.eventKey];
        let testNode = e.node.props.data;
        if (testNode.type === "case") {
            event.emit("TabbedPanel.addPanel",
                {
                    name: testNode.name,
                    key: e.node.props.eventKey,
                    data: testNode
                }
            );
        }
    }
}
