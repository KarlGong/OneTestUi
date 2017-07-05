import React from "react";
import {render} from "react-dom";
import {AppContainer} from "react-hot-loader";
import {observable} from "mobx";
import {Layout, Menu} from "antd";
import SpecPage from "./pages/spec_page/Index";

render(
    <AppContainer>
        <Layout>
            <Layout.Header className="header">
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
            </Layout.Header>
            <SpecPage/>
        </Layout>
    </AppContainer>,
    document.getElementById("app")
);

if (module.hot && process.env.NODE_ENV !== "production") {
    module.hot.accept();
}
