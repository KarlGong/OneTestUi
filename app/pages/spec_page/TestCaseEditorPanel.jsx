import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input, message, Popconfirm} from "antd";
import axios from "axios";
import RichTextEditor from "shared/RichTextEditor";
import guid from "shared/guid";
import clipboard from "shared/clipboard";
import "./TestCaseEditorPanel.css";

@observer
class TestCaseEditorPanel extends Component {
    @observable testCase = {testSteps: []};
    @observable loading = false;

    componentDidMount = () => {
        this.loading = true;
        axios.get("/api/case/" + this.props.testCaseId).then((response) => {
            this.testCase = response.data;
            this.loading = false;
        })
    };

    render = () => {
        return (
            <Spin spinning={this.loading}>
                <div className="test-case-editor">
                    <Form layout="vertical">
                        <Form.Item label="Name" validateStatus="error">
                            <Input key={this.loading} size="default" style={{width: "45%"}}
                                   defaultValue={this.testCase.name}/>
                        </Form.Item>
                        <Form.Item label="Summary">
                            <RichTextEditor key={this.loading} defaultValue={this.testCase.summary}/>
                        </Form.Item>
                        <Form.Item label="Precondition">
                            <RichTextEditor key={this.loading} defaultValue={this.testCase.precondition}/>
                        </Form.Item>
                        <Form.Item label="Test Steps">
                            {this.testCase.testSteps.map((testStep, index) =>
                                <div key={testStep.guid}>
                                    <div className="spliter-wrapper">
                                        <div className="spliter">
                                            <Button icon="plus" size="small" onClick={this.addTestStep.bind(this, index)} className="add action-button">Add Test Step</Button>
                                            <Button icon="paste" size="small" onClick={this.pasteTestStep.bind(this, index)} className="paste action-button">Paste Test Step</Button>
                                        </div>
                                    </div>
                                    <div className="test-step">
                                        <RichTextEditor key={"action" + this.loading} className="action"
                                                        defaultValue={testStep.action}/>
                                        <RichTextEditor key={"result" + this.loading} className="expected-result"
                                                        defaultValue={testStep.expectedResult}/>
                                        <Button
                                            className="copy action-icon"
                                            icon="copy"
                                            shape="circle"
                                            onClick={this.copyTestStep.bind(this, [testStep])}
                                        />
                                        <Popconfirm placement="topRight" title="Are you sure?" okText="Yes" cancelText="No" onConfirm={this.removeTestStep.bind(this, index)}>
                                            <Button
                                                className="delete action-icon"
                                                icon="close-circle-o"
                                                shape="circle"
                                            />
                                        </Popconfirm>
                                    </div>
                                </div>
                            )}
                            <div className="spliter" style={{marginTop: "10px"}}>
                                <Button icon="plus" size="small" onClick={this.addTestStep.bind(this, -1)} className="add action-button">Add Test Step</Button>
                                <Button icon="paste" size="small" onClick={this.pasteTestStep.bind(this, -1)} className="paste action-button">Paste Test Step</Button>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </Spin>
        );
    };

    addTestStep = (index) => {
        if (index === -1) {
            this.testCase.testSteps.push({
                guid: guid(),
                action: "<p></p>",
                expectedResult: "<p></p>"
            });
        } else {
            this.testCase.testSteps.splice(index, 0, {
                guid: guid(),
                action: "<p></p>",
                expectedResult: "<p></p>"
            });
        }
    };

    removeTestStep = (index) => {
        this.testCase.testSteps.splice(index, 1);
    };

    copyTestStep = (testSteps) => {
        clipboard.set("testSteps", testSteps);
        message.success("Test Step is copied successfully")
    };

    pasteTestStep = (index) => {
        const testSteps = clipboard.get("testSteps");
        if (!testSteps) {
            message.warning("No test step is copied");
            return;
        }
        if (index === -1) {
            testSteps.map((testStep, i) => {
                let newTestStep = testStep;
                newTestStep.guid = guid();
                this.testCase.testSteps.push(newTestStep);
            });
        } else {
            testSteps.map((testStep, i) => {
                let newTestStep = testStep;
                newTestStep.guid = guid();
                this.testCase.testSteps.splice(index + i, 0, newTestStep);
            });
        }
    }
}

export default TestCaseEditorPanel;
