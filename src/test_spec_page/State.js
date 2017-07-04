import {observable, action} from "mobx";

class State {
    @observable treeData = [];
    @observable panels = [];
    @observable activePanelKey;

    @action
    addChildNodes(node, nodes) {
        node.children = nodes;
    }

    @action
    selectPanel(key) {
        this.activePanelKey = key;
    }

    @action
    addPanel(title, key) {
        this.activePanelKey = key;
        let newPanel = {title, key};
        for (let i = 0; i < this.panels.length; i++) {
            if (this.panels[i].key === newPanel.key) return;
        }
        this.panels.push(newPanel);
    }

    @action
    removePanel(key) {
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

let state = new State();

export default state;
