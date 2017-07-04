import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import axios from "axios";
import state from "./State";

@observer
class TestTree extends Component {
    componentWillMount() {
        axios.get("/api/suite/root", {
            params: {
                projectId: 1
            }
        }).then(function (response) {
            state.treeData.push(response.data);
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
                {loop(state.treeData)}
            </Tree>
        );
    }

    loadChildren(treeNode) {
        return new Promise((resolve) => {
            axios.get("/api/suite/" + treeNode.props.data.id + "/children")
                .then(function (response) {
                    state.addChildNodes(treeNode.props.data, response.data);
                    resolve();
                });
        })
    }

    handleSelect(selectedKeys, e) {
        let testNode = e.node.props.data;
        if (testNode.type === "case") {
            state.addPanel(testNode.name, e.node.props.eventKey);
        }
    }
}

export default TestTree;
