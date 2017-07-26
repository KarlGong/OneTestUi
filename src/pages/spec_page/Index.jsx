import React, {Component} from "react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import TabbedPanel from "~/components/TabbedPanel";
import TestTree from "./TestTree";

class SpecPage extends Component {

    render() {
        return (
            <Layout>
                <Layout.Sider width={200} style={{background: "#fff", borderRight: "1px #c0bdbd solid"}}>
                    <TestTree/>
                </Layout.Sider>
                <Layout style={{ background: "#fff"}}>
                    <TabbedPanel/>
                </Layout>
            </Layout>
        );
    }
}

export default SpecPage;