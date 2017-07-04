import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import TestTreeState from "./TestTreeState";
import axios from "axios"

@observer
class TestTree extends Component {
    myState = new TestTreeState();

    componentWillMount() {
        let self = this;
        axios.get("/api/suite/root", {
            params: {
                projectId: 1
            }
        }).then(function (response) {
            self.myState.treeData.push(response.data);
        })
    }

    render() {
        const loop = (data) => data.map((item) => {
            if (item.children && item.children.length) {
                return <Tree.TreeNode data={item} key={item.type + item.id}
                                      title={item.name + " (" + item.count + ")"}>{loop(item.children)}</Tree.TreeNode>;
            }
            if (item.type === "case") {
                return <Tree.TreeNode data={item} key={item.type + item.id} title={item.name} isLeaf={true}/>;
            } else {
                return <Tree.TreeNode data={item} key={item.type + item.id}
                                      title={item.name + " (" + item.count + ")"}/>;
            }
        });

        return (
            <Tree
                class="draggable-tree"
                // defaultExpandedKeys={this.state.expandedKeys}
                draggable
                showLine
                showicon
                loadData={this.loadChildren.bind(this)}
                onDragEnter={this.onDragEnter}
                onDrop={this.onDrop}
            >
                {loop(this.myState.treeData)}
            </Tree>
        );
    }

    loadChildren(treeNode) {
        let self = this;
        return new Promise((resolve) => {
            axios.get("/api/suite/" + treeNode.props.data.id + "/children")
                .then(function (response) {
                    self.myState.addChildren(treeNode.props.data, response.data);
                    resolve();
                });
        })
    }
}

export default TestTree;
