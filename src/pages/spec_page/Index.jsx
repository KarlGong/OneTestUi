import React, {Component} from "react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import TabbedPanel from "~/components/TabbedPanel";
import TestSpecTree from "./TestSpecTree";
import SplitPane from "react-split-pane";
import {observer} from "mobx-react";

@observer
class SpecPage extends Component {
    @observable size = parseInt(localStorage.getItem("oneTest-TestSpec-LeftPane-Width")) || 250;

    render() {
        return (
            <Layout>
                <SplitPane split="vertical" minSize={100} maxSize={1000} defaultSize={this.size}
                           pane2Style={{width: "calc(100% - " + (this.size + 1) + "px)"}} // consider width of resizer
                           onChange={size => this.size = size}
                           onDragFinished={size => localStorage.setItem("oneTest-TestSpec-LeftPane-Width", size)}>
                    <Layout style={{background: "#fff"}}>
                        <TestSpecTree/>
                    </Layout>
                    <Layout style={{background: "#fff"}}>
                        <TabbedPanel/>
                    </Layout>
                </SplitPane>
            </Layout>
        );
    }
}

export default SpecPage;
