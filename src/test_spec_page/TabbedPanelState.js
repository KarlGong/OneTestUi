import {observable, action} from "mobx";

class TabbedPanelState {
    @observable panels = [];

    constructor(){
        this.panels.push({title: "abc", key:"abc"});
        this.panels.push({title: "abc1", key:"abc1", content: "fdsaklfjdsalkfjdsakljf"});
    }

    @action
    addPanel(title, key) {
        this.panels.push({title, key});
    }

    @action
    removePanel(key) {
        this.panels = this.panels.filter(panel => panel.key !== key);
    }
}

export default TabbedPanelState;
