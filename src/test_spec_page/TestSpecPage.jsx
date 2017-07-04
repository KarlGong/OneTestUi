import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Layout, Menu, Icon, Tree} from "antd";
import TestTree from "./TestTree";


const {Sider} = Layout;

class TestSpecPage extends Component {
    render() {
        return (
            <Layout>
                <Sider width={200} style={{background: "#fff", height: "calc(100% - 64px)"}}>
                    <TestTree/>
                </Sider>
                <Layout style={{padding: "0 24px 24px"}}>

                </Layout>
            </Layout>
        );
    }
}

export default TestSpecPage;
