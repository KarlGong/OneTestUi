import React, {Component} from "react";
import {observer} from "mobx-react";
import {render, unmountComponentAtNode} from "react-dom";
import {observable, action, toJS, runInAction} from "mobx";
import {Layout, Menu, Icon, Tree, Spin, Popover, Modal, message} from "antd";
import clipboard from "~/utils/clipboard";
import axios from "axios";
import event from "~/utils/event";
import contextMenu from "~/utils/contextMenu";
import TestCaseTab from "~/components/testcase/TestCaseTab";
import TestSuiteTab from "~/components/testsuite/TestSuiteTab";
import TestProjectTab from "~/components/testproject/TestProjectTab";
import addTestCaseModal from "~/utils/addTestCaseModal";
import addTestSuiteModal from "~/utils/addTestSuiteModal";

@observer
export default class TestSpecTree extends Component {
    @observable testProjects = [];
    @observable loading = false;
    dragNode = null;

    componentDidMount = () => {
        this.loading = true;
        axios.get("/api/node/1").then((response) => {
            runInAction(() => {
                this.testProjects.push(response.data);
                this.loading = false;
            });
        })
    };

    render = () => {
        const loop = (data) => data.map((item) => {
            if (item.type === "case") { // test case
                return <Tree.TreeNode data={item} key={item.id} title={item.name} isLeaf/>;
            } else { // test project and test suite
                return <Tree.TreeNode data={item} key={item.id}
                                      title={item.name}>{loop(item.children)}</Tree.TreeNode>;
            }
        });

        return (
            <Spin spinning={this.loading}>
                <div style={{height: "100%", overflow: "auto"}}>
                    <Tree
                        className="test-spec-tree"
                        draggable
                        showLine
                        showicon
                        loadData={(treeNode) => this.loadChildren(treeNode.props.data)}
                        onRightClick={this.handleRightClick}
                        onDragStart={this.onDragStart}
                        onDragEnter={this.onDragEnter}
                        onDragOver={this.onDragOver}
                        onDrop={this.onDrop}
                        onDragEnd={this.onDragEnd}
                        onSelect={this.handleSelect}
                    >
                        {loop(this.testProjects)}
                    </Tree>
                </div>
            </Spin>
        );
    };

    onDragStart = (info) => {
        this.dragNode = info.node;
        let testNode = info.node.props.data;
        testNode.children = [];
        if (testNode.type === "project") {
            info.event.dataTransfer.effectAllowed = "none";
        }
    };

    onDragEnter = (info) => {
        let testNode = info.node.props.data;
        if (testNode.type !== "case" && this.dragNode.props.data.id !== info.node.props.data.id) {
            this.loadChildren(testNode);
        }
    };

    onDragOver = (info) => {
        if ((info.node.props.data.type === "case" && info.node.props.dragOver)
            || (info.node.props.data.type === "project" && !info.node.props.dragOver)) {
            info.event.dataTransfer.dropEffect = "none";
        }
    };

    onDrop = (info) => {
        let dragTestNode = info.dragNode.props.data;
        let targetTestNode = info.node.props.data;

        if (dragTestNode.type !== "project") {
            if (info.dropToGap) { // drop to gap
                axios.post("/api/node/" + dragTestNode.id + "/move", {
                    toParentId: targetTestNode.parentId,
                    toPosition: Math.max(targetTestNode.position, info.dropPosition)
                }).then((response) => {
                    if (dragTestNode.parent.id === targetTestNode.parent.id) {
                        this.loadChildren(dragTestNode.parent);
                    } else {
                        if (info.dragNode.props.pos.indexOf(info.node.props.pos) !== -1) {
                            this.loadChildren(dragTestNode.parent).then(() => this.loadChildren(targetTestNode.parent));
                        } else {
                            this.loadChildren(targetTestNode.parent).then(() => this.loadChildren(dragTestNode.parent));
                        }
                    }
                });
            } else { // drop to test suite
                axios.post("/api/node/" + dragTestNode.id + "/move", {
                    toParentId: targetTestNode.id,
                    toPosition: -1
                }).then((response) => {
                    if (info.dragNode.props.pos.indexOf(info.node.props.pos) !== -1) {
                        this.loadChildren(dragTestNode.parent).then(() => this.loadChildren(targetTestNode));
                    } else {
                        this.loadChildren(targetTestNode).then(() => this.loadChildren(dragTestNode.parent));
                    }
                });
            }
        }


    };

    onDragEnd = () => {
        this.dragNode = null;
    };

    loadChildren = (testNode) => {
        return axios.get("/api/node/" + testNode.id + "/children").then(function (response) {
            if (testNode.children.length) {
                response.data.map((responseTestNode) => {
                    if (responseTestNode.type !== "case") {
                        let loadedChildTestSuites = testNode.children.filter((node) => node.id === responseTestNode.id && node.type === responseTestNode.type);
                        if (loadedChildTestSuites.length) {
                            responseTestNode.children = loadedChildTestSuites[0].children;
                        }
                    }
                });
                testNode.children = response.data;
            } else {
                testNode.children = response.data;
            }
            testNode.children.map((child) => child.parent = testNode);
        });
    };

    handleSelect = (selectedKeys, e) => {
        let testNode = e.node.props.data;
        switch (testNode.type) {
            case "project": this.pinProject(testNode);break;
            case "suite": this.pinSuite(testNode);break;
            case "case": this.pinCase(testNode);break;
        }
    };

    handleRightClick = (e) => {
        let testNode = e.node.props.data;
        switch (testNode.type) {
            case "project":
                contextMenu.open(e.event.nativeEvent.pageX, e.event.nativeEvent.pageY, [
                    {
                        name: "Open",
                        onClick: () => this.openProject(testNode)
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
                    }
                ]);
                break;
            case "suite":
                contextMenu.open(e.event.nativeEvent.pageX, e.event.nativeEvent.pageY, [
                    {
                        name: "Open",
                        onClick: () => this.openSuite(testNode)
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
                        name: "Open",
                        onClick: () => this.openCase(testNode)
                    },
                    {
                        name: "Copy",
                        onClick: () => this.copyCase(testNode)
                    },
                    {
                        name: "Duplicate",
                        onClick: () => this.duplicateCase(testNode)
                    },
                    null,
                    {
                        name: "Delete",
                        onClick: () => this.deleteCase(testNode)
                    }
                ]);
                break;
        }
    };

    pinProject = (testProject) => {
        event.emit("TabbedPanel.addPinnedPanel",
            {
                key: "pinned-project-" + testProject.id,
                name: <span><Icon type="folder"/>{testProject.name}</span>,
                content: <TestProjectTab testProjectId={testProject.id}/>
            }
        );
    };

    openProject = (testProject) => {
        event.emit("TabbedPanel.addPanel",
            {
                key: "project-" + testProject.id,
                name: <span><Icon type="folder"/>{testProject.name}</span>,
                content: <TestProjectTab testProjectId={testProject.id}/>
            }
        );
    };

    addSuite = (testNode) => {
        addTestSuiteModal.open(testNode.id, (ts) => {
            message.success("Test suite is added successfully");
            event.emit("TabbedPanel.addPanel",
                {
                    key: "suite-" + ts.id,
                    name: <span><Icon type="folder"/>{ts.name}</span>,
                    content: <TestSuiteTab defaultMode="edit" testSuiteId={ts.id}/>
                }
            );
            this.loadChildren(testNode);
        });
    };

    pinSuite = (testSuite) => {
        event.emit("TabbedPanel.addPinnedPanel",
            {
                key: "pinned-suite-" + testSuite.id,
                name: <span><Icon type="folder"/>{testSuite.name}</span>,
                content: <TestSuiteTab testSuiteId={testSuite.id}/>
            }
        );
    };

    openSuite = (testSuite) => {
        event.emit("TabbedPanel.addPanel",
            {
                key: "suite-" + testSuite.id,
                name: <span><Icon type="folder"/>{testSuite.name}</span>,
                content: <TestSuiteTab testSuiteId={testSuite.id}/>
            }
        );
    };

    deleteSuite = (testSuite) => {
        Modal.confirm({
            title: "Do you want to delete this test suite?",
            content: "All the test cases & test suites under this suite will also be deleted.",
            okText: "Delete",
            cancelText: "Cancel",
            onOk: (close) => {
                axios.delete("/api/suite/" + testSuite.id).then((response) => {
                    message.success("The test suite is deleted successfully");
                    close();
                    this.loadChildren(testSuite.parent);
                })
            }
        })
    };

    pinCase = (testCase) => {
        event.emit("TabbedPanel.addPinnedPanel",
            {
                key: "pinned-case-" + testCase.id,
                name: <span><Icon type="file"/>{testCase.name}</span>,
                content: <TestCaseTab testCaseId={testCase.id}/>
            }
        );
    };

    openCase = (testCase) => {
        event.emit("TabbedPanel.addPanel",
            {
                key: "case-" + testCase.id,
                name: <span><Icon type="file"/>{testCase.name}</span>,
                content: <TestCaseTab testCaseId={testCase.id}/>
            }
        );
    };

    addCase = (testNode) => {
        addTestCaseModal.open(testNode.id, (tc) => {
            message.success("Test case is added successfully");
            event.emit("TabbedPanel.addPanel",
                {
                    key: "case-" + tc.id,
                    name: <span><Icon type="file"/>{tc.name}</span>,
                    content: <TestCaseTab defaultMode="edit" testCaseId={tc.id}/>
                }
            );
            this.loadChildren(testNode);
        });
    };

    copyCase = (testCase) => {
        clipboard.set("testCase", testCase.id);
        message.success("Test case is copied successfully");
    };

    pasteCase = (testSuite) => {
        const testCaseId = clipboard.get("testCase");
        if (!testCaseId) {
            message.warning("No test case is copied");
            return;
        }
        axios.get("/api/case/" + testCaseId).then((response) => {
            let testCase = response.data;
            testCase.name = testCase.name + "-copy";
            testCase.parentId = testSuite.id;
            testCase.position = -1;
            return axios.put("/api/case", testCase);
        }).then((response) => {
            message.success("Test case is pasted successfully");
            this.loadChildren(testSuite);
            event.emit("TabbedPanel.addPanel",
                {
                    key: "case-" + response.data.id,
                    name: <span><Icon type="file"/>{response.data.name}</span>,
                    content: <TestCaseTab defaultMode="edit" testCaseId={response.data.id}/>
                }
            );
        });
    };

    duplicateCase = (testCase) => {
        axios.get("/api/case/" + testCase.id).then((response) => {
            let testCase = response.data;
            testCase.name = testCase.name + "-copy";
            testCase.position++;
            return axios.put("/api/case", testCase);
        }).then((response) => {
            message.success("Test case is duplicated successfully");
            this.loadChildren(testCase.parent);
            event.emit("TabbedPanel.addPanel",
                {
                    key: "case-" + response.data.id,
                    name: <span><Icon type="file"/>{response.data.name}</span>,
                    content: <TestCaseTab defaultMode="edit" testCaseId={response.data.id}/>
                }
            );
        });
    };

    deleteCase = (testCase) => {
        Modal.confirm({
            title: "Do you want to delete this test case?",
            content: "All the related data will also be deleted.",
            okText: "Delete",
            cancelText: "Cancel",
            onOk: (close) => {
                axios.delete("/api/case/" + testCase.id).then((response) => {
                    message.success("The test case is deleted successfully");
                    close();
                    this.loadChildren(testCase.parent);
                })
            }
        })
    };
}
