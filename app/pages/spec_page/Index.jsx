import React, {Component} from "react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import TestTree from "./TestTree";
import TabbedPanel from "./TabbedPanel";

class SpecPage extends Component {

    render() {
        return (
            <Layout>
                <Layout.Sider width={200} style={{background: "#fff", height: "calc(100% - 106px)", borderRight: "1px #c0bdbd solid"}}>
                    <TestTree/>
                </Layout.Sider>
                <Layout style={{ background: "#fff", padding: "1px 0 0 5px"}}>
                    <TabbedPanel/>
                </Layout>
            </Layout>
        );
    }
}

export default SpecPage;
