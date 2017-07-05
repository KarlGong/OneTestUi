import React, {Component} from "react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import TestTree from "./TestTree";
import TabbedPanel from "./TabbedPanel";

class SpecPage extends Component {

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

export default SpecPage;
