import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import TestTree from "./TestTree";
import {Tabs, Button} from "antd";
import TabbedPanel from "./TabbedPanel";

class TestSpecPage extends Component {

    render() {
        return (
            <Layout>
                <Layout.Sider width={200} style={{background: "#fff", height: "calc(100% - 64px)"}}>
                    <TestTree/>
                </Layout.Sider>
                <Layout.Content>
                    <TabbedPanel/>
                </Layout.Content>
            </Layout>
        );
    }
}

export default TestSpecPage;
