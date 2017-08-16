import React, {Component} from "react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import TabbedPanel from "~/components/TabbedPanel";
import TestSpecTree from "./TestSpecTree";
import SplitPane from "react-split-pane";

class SpecPage extends Component {

    render() {
        return (
            <Layout>
                <SplitPane split="vertical" minSize={100} maxSize={1000}
                           defaultSize={parseInt(localStorage.getItem("oneTest-TestSpec-LeftPane-Width")) || 250}
                           onChange={size => localStorage.setItem("oneTest-TestSpec-LeftPane-Width", size)}>
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
