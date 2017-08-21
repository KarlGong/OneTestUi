import React from "react";
import {render} from "react-dom";
import {AppContainer} from "react-hot-loader";
import {observable} from "mobx";
import {Layout, Menu, message} from "antd";
import axios from "axios";
import SpecPage from "./pages/spec_page/Index";
import "./assets/fonts/extra-iconfont/iconfont.css";
import "./index.css";
import alert from "~/components/alert";

axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    alert.error(error.message);
    return Promise.reject(error);
});

render(
    <AppContainer>
        <Layout>
            <Layout.Header className="header" style={{height: "52px"}}>
                <div className="logo"/>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={["1"]}
                    style={{lineHeight: "52px"}}
                >
                    <Menu.Item key="1">Test Spec</Menu.Item>
                    <Menu.Item key="2">Test Execution</Menu.Item>
                    <Menu.Item key="3">Test Reports</Menu.Item>
                </Menu>
            </Layout.Header>
            <Layout style={{height: "calc(100% - 94px)"}}>
                <SpecPage/>
            </Layout>
            <Layout.Footer style={{textAlign: "center", padding: "12px 0"}}>
                One Test ©2017 Created by Karl Gong | <a href="https://github.com/KarlGong">GitHub</a> | <a
                href="mailto:karl.gong%40outlook.com">Contact Me</a>
            </Layout.Footer>
        </Layout>
    </AppContainer>,
    document.getElementById("app")
);

if (module.hot && process.env.NODE_ENV !== "production") {
    module.hot.accept();
}
