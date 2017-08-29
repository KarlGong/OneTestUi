import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS, untracked, runInAction, action} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input, message, Popconfirm, Select, Radio} from "antd";
import axios from "axios";
import RichTextEditor from "~/components/RichTextEditor";
import guid from "~/utils/guid";
import clipboard from "~/utils/clipboard";
import Validator from "~/utils/Validator";
import {executionMap, importanceMap} from "~/utils/store";
import "./TestCaseEditPanel.css";

@observer
export default class TestCaseEditPanel extends Component {
    @observable testCase = {executionType: "manual", importance: "medium", testSteps: [], tags: []};
    @observable loading = false;
    @observable possibleTags = [];
    @observable validator = null;

    static defaultProps = {
        testCaseId: null,
        onLoadingStart: () => {},
        onLoadingFinish: () => {},
        onSavingStart: () => {},
        onSavingFinish: () => {}
    };

    componentDidMount = () => {
        this.loading = true;
        this.props.onLoadingStart();
        axios.get("/api/case/" + this.props.testCaseId).then((response) => {
            runInAction(() => {
                this.testCase = response.data;
                this.testCase.testSteps.map((testStep) => testStep.guid = guid());
                this.props.onLoadingFinish();
                this.loading = false;
                this.validator = new Validator(this.testCase, {
                    name: {required: true}
                });
            });
        })
    };

    render = () => {
        return (
            <div className="test-case-editor">
                <Form layout="vertical">
                    <Form.Item label="Name" validateStatus={this.validator && this.validator.results.name.status}
                        help={this.validator && this.validator.results.name.message}>
                        <Input key={this.loading} size="default" style={{width: "45%"}}
                               defaultValue={this.testCase.name}
                               onChange={(e) => {
                                   this.testCase.name = e.target.value;
                                   this.validator.validateField("name");
                               }}/>
                    </Form.Item>
                    <Form.Item label="Summary">
                        <RichTextEditor key={this.loading} defaultValue={untracked(() => this.testCase.summary)}
                                        onChange={(value) => this.testCase.summary = value}/>
                    </Form.Item>
                    <Form.Item label="Precondition">
                        <RichTextEditor key={this.loading} defaultValue={untracked(() => this.testCase.precondition)}
                                        onChange={(value) => this.testCase.precondition = value}/>
                    </Form.Item>
                    <Form.Item label="Test Steps">
                        {this.testCase.testSteps.map((testStep, index) =>
                            <div key={testStep.guid}>
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
                                                    defaultValue={untracked(() => testStep.action)}
                                                    onChange={(value) => testStep.action = value}/>
                                    <RichTextEditor key={"result" + this.loading} className="expected-result"
                                                    defaultValue={untracked(() => testStep.expectedResult)}
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
                <Form layout="inline" style={{display: "flex", alignItems: "center", marginTop: "30px"}}>
                    <Form.Item label="Execution Type">
                        <Radio.Group key={this.loading} size="default"
                                     defaultValue={untracked(() => this.testCase.executionType)}
                                     onChange={(e) => this.testCase.executionType = e.target.value}>
                            {Object.keys(executionMap).map((k) =>
                                <Radio.Button key={k} value={k}>{executionMap[k]}</Radio.Button>)}
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="Importance">
                        <Select key={this.loading} size="default" defaultValue={untracked(() => this.testCase.importance)}
                                style={{width: "100px"}} onChange={(value) => this.testCase.importance = value}>
                            {Object.keys(importanceMap).map((k) =>
                                <Select.Option key={k} value={k}>{importanceMap[k]}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Tags">
                        <Select key={this.loading} size="default" mode="tags" notFoundContent=""
                                defaultValue={untracked(() => this.testCase.tags).map((tag) => tag.value)} style={{width: "400px"}}
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
            </div>
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
        message.success("Test Step is copied successfully");
    };

    @action
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
        this.validator.validate(
            () => {
                this.props.onSavingStart();
                axios.post("/api/case/" + this.props.testCaseId, this.testCase).then((response) => {
                    this.props.onSavingFinish();
                });
            }
        );
    }
}