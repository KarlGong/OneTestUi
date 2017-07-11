import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Spin, Row, Col, Form, Button, Icon} from "antd";
import axios from "axios";
import RichTextEditor from "shared/RichTextEditor";
import "./TestCaseEditorPanel.css";

@observer
class TestCaseEditorPanel extends Component {
    @observable testCase = {testSteps: []};
    @observable loading = false;

    componentDidMount() {
        this.loading = true;
        axios.get("/api/case/" + this.props.testCaseId).then((response) => {
            this.loading = false;
            this.testCase = response.data;
        })
    }

    render() {
        return (
            <Spin spinning={this.loading}>
                <div className="test-case-editor">
                    <Form layout="vertical">
                        <Form.Item label="Name" validateStatus="error">
                            <RichTextEditor style={{width: "45%"}} defaultValue={this.testCase.name}/>
                        </Form.Item>
                        <Form.Item label="Summary">
                            <RichTextEditor multiLine defaultValue={this.testCase.summary}/>
                        </Form.Item>
                        <Form.Item label="Precondition">
                            <RichTextEditor multiLine defaultValue={this.testCase.precondition}/>
                        </Form.Item>
                        <Form.Item label="Test Steps">
                            {this.testCase.testSteps.map((item, i) =>
                                <div key={i} className="test-step">
                                    <RichTextEditor className="action" multiLine defaultValue={item.action}/>
                                    <RichTextEditor className="expected-result" multiLine defaultValue={item.expectedResult}/>
                                    <Icon
                                        className="delete button"
                                        type="close-circle-o"
                                        onClick
                                    />
                                    <Icon
                                        className="insert button"
                                        type="plus-circle-o"
                                        onClick
                                    />
                                </div>
                            )}
                            <Form.Item>
                                <Button type="dashed" onClick={this.addTestStep.bind(this)} style={{width: "100%"}}>
                                    <Icon type="plus"/> Add Test Step
                                </Button>
                            </Form.Item>
                        </Form.Item>
                    </Form>
                </div>
            </Spin>
        );
    }

    addTestStep() {
        this.testCase.testSteps.push({
            action: "",
            expectedResult: ""
        })
    }

}

export default TestCaseEditorPanel;
