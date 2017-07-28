import React, {Component} from "react";
import {observer} from "mobx-react";
import {render, unmountComponentAtNode} from "react-dom";
import {observable, action, toJS, runInAction} from "mobx";
import {Layout, Menu, Icon, Tree, Spin, Popover, Modal, message} from "antd";
import clipboard from "~/utils/clipboard";
import axios from "axios";
import event from "~/utils/event";
import contextMenu from "~/utils/contextMenu";
import TestCasePanel from "~/components/TestCasePanel";
import addTestCaseModal from "~/utils/addTestCaseModal";
import addTestSuiteModal from "~/utils/addTestSuiteModal";

@observer
export default class TestSpecTree extends Component {
    @observable treeData = [];
    @observable loading = false;
    @observable selectedKeys = [];

    componentDidMount() {
        this.loading = true;
        axios.get("/api/project/1/rootsuite").then((response) => {
            runInAction(() => {
                this.treeData.push(response.data);
                this.loading = false;
            });
        })
    }

    render() {
        const loop = (data) => data.map((item) => {
            let key = item.type + "-" + item.id;
            if (item.type === "case") { // test case
                return <Tree.TreeNode data={item} key={key} title={item.name} isLeaf/>;
            } else { // test suite
                return <Tree.TreeNode data={item} key={key}
                                      title={item.name}>{loop(item.children)}</Tree.TreeNode>;
            }
        });

        return (
            <Spin spinning={this.loading}>
                <div style={{height: "100%"}}>
                    <Tree
                        className="test-spec-tree"
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
            this.pinCase(testNode);
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
                        onClick: () => this.addSuite(testNode)
                    },
                    {
                        name: "Add Test Case",
                        onClick: () => this.addCase(testNode)
                    },
                    {
                        name: "Paste Test Case",
                        onClick: () => this.pasteCase(testNode)
                    },
                    null,
                    {
                        name: "Delete",
                        onClick: () => this.deleteSuite(testNode)
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
                        name: "Copy",
                        onClick: () => this.copyCase(testNode)
                    },
                    null,
                    {
                        name: "Delete",
                        onClick: () => this.deleteCase(testNode)
                    }
                ]);
                break;
        }
    }

    addSuite(testSuite) {
        addTestSuiteModal.open(testSuite.id);
    };

    deleteSuite(testSuite) {
        Modal.confirm({
            title: "Do you want to delete this test suite?",
            content: "All the test cases & test suites under this suite will also be deleted.",
            okText: "Delete",
            cancelText: "Cancel",
            onOk: (close) => {
                axios.delete("/api/suite/" + testSuite.id).then((response) => {
                    message.success("The test suite is deleted successfully");
                    close();
                })
            }
        })
    };

    pinCase(testCase) {
        event.emit("TabbedPanel.addPinnedPanel",
            {
                key: "pinned-case-" + testCase.id,
                name: <span><Icon type="file"/>{testCase.name}</span>,
                content: <TestCasePanel testCaseId={testCase.id}/>
            }
        );
    }

    viewCase(testCase) {
        event.emit("TabbedPanel.addPanel",
            {
                key: "case-" + testCase.id,
                name: <span><Icon type="file"/>{testCase.name}</span>,
                content: <TestCasePanel testCaseId={testCase.id}/>
            }
        );
    }

    addCase(testSuite) {
        addTestCaseModal.open(testSuite.id);
    };

    copyCase(testCase) {
        clipboard.set("testCase", testCase.id);
        message.success("Test case is copied successfully");
    }

    pasteCase(testSuite) {
        const testCaseId = clipboard.get("testCase");
        if (!testCaseId) {
            message.warning("No test case is copied");
            return;
        }
        axios.get("/api/case/" + testCaseId).then((response) => {
            let testCase = response.data;
            return axios.put("/api/case",
                Object.assign({}, testCase, {
                    testSuiteId: testSuite.id,
                    name: testCase.name + "-copy"
                }));
        }).then((response) => {
            message.success("Test case is pasted successfully");
        });
    }

    deleteCase(testCase) {
        Modal.confirm({
            title: "Do you want to delete this test case?",
            content: "All the related data will also be deleted.",
            okText: "Delete",
            cancelText: "Cancel",
            onOk: (close) => {
                axios.delete("/api/case/" + testCase.id).then((response) => {
                    message.success("The test case is deleted successfully");
                    close();
                })
            }
        })
    }
}
