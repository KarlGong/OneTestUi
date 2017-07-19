import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input, message, Popconfirm, Select, Radio} from "antd";
import axios from "axios";
import RichTextEditor from "shared/RichTextEditor";
import guid from "shared/guid";
import clipboard from "shared/clipboard";
import "./TestCaseEditorPanel.css";

@observer
class TestCaseEditorPanel extends Component {
    @observable testCase = {tags: [], testSteps: []};
    @observable loading = false;
    @observable saving = false;
    @observable possibleTags = [];

    componentDidMount = () => {
        this.loading = true;
        axios.get("/api/case/" + this.props.testCaseId).then((response) => {
            this.testCase = response.data;
            this.testCase.testSteps.map((testStep) => testStep.guid = guid());
            this.testCase.executionType = this.testCase.executionType.toString();
            this.testCase.importance = this.testCase.importance.toString();
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
                                   defaultValue={this.testCase.name}
                                   onChange={(e) => this.testCase.name = e.target.value}/>
                        </Form.Item>
                        <Form.Item label="Summary">
                            <RichTextEditor key={this.loading} defaultValue={this.testCase.summary}
                                            onChange={(value) => this.testCase.summary = value}/>
                        </Form.Item>
                        <Form.Item label="Precondition">
                            <RichTextEditor key={this.loading} defaultValue={this.testCase.precondition}
                                            onChange={(value) => this.testCase.precondition = value}/>
                        </Form.Item>
                        <Form.Item label="Test Steps">
                            {this.testCase.testSteps.map((testStep, index) =>
                                <div key={toJS(testStep.guid)}>
                                    <div className="spliter-wrapper">
                                        <div className="spliter">
                                            <Button icon="plus" size="small"
                                                    onClick={this.addTestStep.bind(this, index)}
                                                    className="add action-button">Add Test Step</Button>
                                            <Button icon="paste" size="small"
                                                    onClick={this.pasteTestStep.bind(this, index)}
                                                    className="paste action-button">Paste Test Step</Button>
                                        </div>
                                    </div>
                                    <div className="test-step">
                                        <RichTextEditor key={"action" + this.loading} className="action"
                                                        defaultValue={testStep.action}
                                                        onChange={(value) => testStep.action = value}/>
                                        <RichTextEditor key={"result" + this.loading} className="expected-result"
                                                        defaultValue={testStep.expectedResult}
                                                        onChange={(value) => testStep.expectedResult = value}/>
                                        <Button
                                            className="copy action-icon"
                                            icon="copy"
                                            shape="circle"
                                            onClick={this.copyTestStep.bind(this, [testStep])}
                                        />
                                        <Popconfirm placement="topRight" title="Are you sure?" okText="Yes"
                                                    cancelText="No" onConfirm={this.removeTestStep.bind(this, index)}>
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
                                <Button icon="plus" size="small" onClick={this.addTestStep.bind(this, -1)}
                                        className="add action-button">Add Test Step</Button>
                                <Button icon="paste" size="small" onClick={this.pasteTestStep.bind(this, -1)}
                                        className="paste action-button">Paste Test Step</Button>
                            </div>
                        </Form.Item>
                    </Form>
                    <Form layout="inline" style={{display: "flex", alignItems: "center"}}>
                        <Form.Item label="Execution Type">
                            <Radio.Group key={this.loading} size="default"
                                         defaultValue={this.testCase.executionType || "0"}
                                         onChange={(e) => this.testCase.executionType = e.target.value}>
                                <Radio.Button value="0">Manual</Radio.Button>
                                <Radio.Button value="1">Automated</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item label="Importance">
                            <Select key={this.loading} size="default" defaultValue={this.testCase.importance || "1" }
                                    style={{width: "100px"}} onChange={(value) => this.testCase.importance = value}>
                                <Select.Option value="0">High</Select.Option>
                                <Select.Option value="1">Medium</Select.Option>
                                <Select.Option value="2">Low</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Tags">
                            <Select key={this.loading} size="default" mode="tags" notFoundContent=""
                                    defaultValue={this.testCase.tags.map((tag) => tag.value)} style={{width: "400px"}}
                                    onChange={(values) => this.testCase.tags = values.map((value) => {return {value}})}
                                    onSearch={this.searchTag}
                                    onFocus={this.searchTag.bind(this, "")}>
                                {
                                    this.possibleTags.map((tag) =>
                                        <Select.Option key={tag} value={tag}>{tag}</Select.Option>)
                                }
                            </Select>
                        </Form.Item>
                    </Form>
                    <div style={{borderTop: "1px #d9d9d9 solid", padding: "20px 0"}}>
                        <Button type="primary" loading={this.saving} onClick={this.save}>Save</Button>
                        <Button style={{marginLeft: "20px"}}>Cancel</Button>
                    </div>
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
                testStep.guid = guid();
                this.testCase.testSteps.push(testStep);
            });
        } else {
            testSteps.map((testStep, i) => {
                testStep.guid = guid();
                this.testCase.testSteps.splice(index + i, 0, testStep);
            });
        }
    };

    searchTag = (text) => {
        axios.get("/api/tag", {
            params: {
                searchText: text,
                limit: 10
            }
        }).then((response) => {
            this.possibleTags = response.data;
        })
    };

    save = () => {
        this.saving = true;
        axios.post("/api/case/" + this.testCase.id, this.testCase).then((response) => {
            message.success("Test case is saved successfully");
            this.saving = false;
        })
    }
}

export default TestCaseEditorPanel;
