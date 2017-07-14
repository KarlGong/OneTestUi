import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, action, toJS} from "mobx";
import {Layout, Menu, Icon, Tree, Spin, Popover} from "antd";
import axios from "axios";
import event from "shared/Event";
import contextMenu from "shared/ContextMenu";
import TestCaseEditorPanel from "./TestCaseEditorPanel";

@observer
export default class TestTree extends Component {
    @observable treeData = [];
    @observable loading = false;
    @observable selectedKeys = [];

    componentDidMount() {
        this.loading = true;
        axios.get("/api/project/1/rootsuite").then((response) => {
            this.treeData.push(response.data);
            this.loading = false;
        })
    }

    render() {
        const loop = (data) => data.map((item) => {
            let key = item.type + "-" + item.id;
            if (item.type === "case") { // test case
                return <Tree.TreeNode data={item} key={key} title={item.name} isLeaf/>;
            } else { // test suite
                return <Tree.TreeNode data={item} key={key}
                                      title={item.name + " (" + item.count + ")"}>{loop(item.children)}</Tree.TreeNode>;
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
                        selectedKeys={toJS(this.selectedKeys)}
                        loadData={this.loadChildren.bind(this)}
                        onRightClick={this.handleRightClick.bind(this)}
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
            this.viewCase(testNode);
        }
    }

    handleRightClick(e) {
        let testNode = e.node.props.data;
        switch (testNode.type) {
            case "rootSuite":
            case "suite":
                contextMenu.open(e.event.nativeEvent.pageX, e.event.nativeEvent.pageY, [
                    {
                        name: "View",
                        onClick: () => console.log("open")
                    },
                    {
                        name: "Edit",
                        onClick: () => console.log("open")
                    },
                    {
                        name: "Add Test Suite",
                        onClick: () => console.log("clicked")
                    },
                    {
                        name: "Add Test Case",
                        onClick: () => console.log("clicked")
                    },
                    null,
                    {
                        name: "Delete",
                        onClick: () => console.log("delete")
                    }
                ]);
                break;
            case "case":
                contextMenu.open(e.event.nativeEvent.pageX, e.event.nativeEvent.pageY, [
                    {
                        name: "View",
                        onClick: () => this.viewCase(testNode)
                    },
                    {
                        name: "Edit",
                        onClick: () => console.log("open")
                    },
                    {
                        name: "Copy",
                        onClick: () => console.log("open")
                    },
                    {
                        name: "Paste",
                        onClick: () => console.log("open")
                    },
                    null,
                    {
                        name: "Delete",
                        onClick: () => console.log("delete")
                    }
                ]);
                break;
        }
    }

    viewCase(testCase) {
        event.emit("TabbedPanel.addPanel",
            {
                key: testCase.type + "-" + testCase.id,
                name: testCase.name,
                view: <TestCaseEditorPanel testCaseId={testCase.id}/>
            }
        );
    }
}
