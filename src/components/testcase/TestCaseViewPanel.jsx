import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS, untracked, runInAction, action} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input, message, Popconfirm, Select, Radio} from "antd";
import axios from "axios";
import RichTextEditor from "~/components/RichTextEditor";
import guid from "~/utils/guid";
import event from "~/utils/event";
import {executionMap, importanceMap} from "~/utils/store";
import "./TestCaseViewPanel.css";

@observer
export default class TestCaseViewPanel extends Component {
    @observable testCase = {executionType: "manual", importance: "medium", testSteps: [], tags: []};
    @observable loading = false;

    static defaultProps = {
        testCaseId: null,
        onLoadingStart: () => {},
        onLoadingFinish: () => {},
    };

    componentDidMount = () => {
        this.loading = true;
        this.props.onLoadingStart();
        axios.get("/api/case/" + this.props.testCaseId).then((response) => {
            runInAction(() => {
                this.testCase = response.data;
                this.testCase.testSteps.map((testStep) => testStep.guid = guid());
                this.props.onLoadingFinish();
                this.loading =false;
            });
        })
    };

    render = () => {
        return (
            <div className="test-case-view">
                <Form layout="vertical">
                    <Form.Item label="Name">
                        <span style={{padding: "4px 7px"}}>{this.testCase.name}</span>
                    </Form.Item>
                    <Form.Item label="Summary">
                        <RichTextEditor key={this.loading} viewMode defaultValue={this.testCase.summary}/>
                    </Form.Item>
                    <Form.Item label="Precondition">
                        <RichTextEditor key={this.loading} viewMode defaultValue={this.testCase.precondition}/>
                    </Form.Item>
                    <Form.Item label="Test Steps">
                        {this.testCase.testSteps.map((testStep, index) =>
                            <div key={testStep.guid}>
                                <div className="spliter" />
                                <div className="test-step">
                                    <RichTextEditor key={"action" + this.loading} viewMode className="action"
                                                    defaultValue={testStep.action}/>
                                    <RichTextEditor key={"result" + this.loading} viewMode
                                                    className="expected-result"
                                                    defaultValue={testStep.expectedResult}/>
                                </div>
                            </div>
                        )}
                        <div className="spliter" />
                    </Form.Item>
                </Form>
                <Form layout="inline" style={{display: "flex", alignItems: "center"}}>
                    <Form.Item label="Execution Type">
                        <span>{executionMap[this.testCase.executionType]}</span>
                    </Form.Item>
                    <Form.Item label="Importance">
                        <span>{importanceMap[this.testCase.importance]}</span>
                    </Form.Item>
                    <Form.Item label="Tags">
                        <span>{this.testCase.tags.map((tag) => tag.value).join(", ")}</span>
                    </Form.Item>
                </Form>
            </div>
        );
    };
}