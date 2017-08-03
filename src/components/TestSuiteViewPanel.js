import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS, untracked, runInAction, action} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input, message, Popconfirm, Select, Radio} from "antd";
import axios from "axios";
import RichTextEditor from "~/components/RichTextEditor";
import event from "~/utils/event";
import {executionMap, importanceMap} from "~/utils/store";
import "./TestSuiteViewPanel.css";

@observer
export default class TestSuiteViewPanel extends Component {
    @observable testSuite = {};
    @observable loading = false;

    static defaultProps = {
        testSuiteId: null,
        onLoadingStart: () => {},
        onLoadingFinish: () => {},
    };

    componentDidMount = () => {
        this.loading = true;
        this.props.onLoadingStart();
        axios.get("/api/suite/" + this.props.testSuiteId).then((response) => {
            runInAction(() => {
                this.testSuite = response.data;
                this.props.onLoadingFinish();
                this.loading =false;
            });
        })
    };

    render = () => {
        return (
            <div className="test-suite-view">
                <Form layout="vertical">
                    <Form.Item label="Name">
                        <span style={{padding: "4px 7px"}}>{this.testSuite.name}</span>
                    </Form.Item>
                    <Form.Item label="Description">
                        <RichTextEditor key={this.loading} viewMode defaultValue={this.testSuite.description}/>
                    </Form.Item>
                </Form>
            </div>
        );
    };
}