import {observable, action} from "mobx";

class TestTreeState {
    @observable treeData = [];

    @action
    addChildren(testNode, testNodes) {
        testNode.children = testNodes;
    }
}

export default TestTreeState;
