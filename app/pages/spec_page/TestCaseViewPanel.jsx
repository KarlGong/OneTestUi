import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS, untracked, runInAction, action} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input, message, Popconfirm, Select, Radio} from "antd";
import axios from "axios";
import RichTextEditor from "shared/RichTextEditor";
import guid from "shared/guid";
import {executionMap, importanceMap} from "shared/store";
import "./TestCaseViewPanel.css";

@observer
class TestCaseViewPanel extends Component {
    @observable testCase = {executionType: 0, importance: 1, testSteps: [], tags: []};
    @observable loading = false;

    componentDidMount = () => {
        this.loading = true;
        axios.get("/api/case/" + this.props.testCaseId).then((response) => {
            runInAction(() => {
                this.testCase = response.data;
                this.testCase.testSteps.map((testStep) => testStep.guid = guid());
                this.loading = false;
            });
        })
    };

    render = () => {
        return (
            <Spin spinning={this.loading}>
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
            </Spin>
        );
    };


}

export default TestCaseViewPanel;
