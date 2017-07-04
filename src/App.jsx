import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Layout, Menu, Breadcrumb, Icon} from "antd";
import TestSpecPage from "./test_spec_page/TestSpecPage";


const {SubMenu} = Menu;
const {Header, Content, Sider} = Layout;

class App extends Component {
    render() {
        return (
            <Layout>
                <Header className="header">
                    <div className="logo"/>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={["1"]}
                        style={{lineHeight: "64px"}}
                    >
                        <Menu.Item key="1">Test Spec</Menu.Item>
                        <Menu.Item key="2">Test Execution</Menu.Item>
                        <Menu.Item key="3">Test Reports</Menu.Item>
                    </Menu>
                </Header>
                <TestSpecPage/>
            </Layout>
        );
    }
}

export default App;
