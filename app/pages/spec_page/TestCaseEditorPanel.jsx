import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input} from "antd";
import axios from "axios";
import RichTextEditor from "shared/RichTextEditor";
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
                            <Input key={this.loading} size="default" style={{width: "45%"}} defaultValue={this.testCase.name}/>
                        </Form.Item>
                        <Form.Item label="Summary">
                            <RichTextEditor key={this.loading} defaultValue={this.testCase.summary}/>
                        </Form.Item>
                        <Form.Item label="Precondition">
                            <RichTextEditor key={this.loading} defaultValue={this.testCase.precondition}/>
                        </Form.Item>
                        <Form.Item label="Test Steps">
                            {this.testCase.testSteps.map((item, i) =>
                                <div key={i} className="test-step">
                                    <RichTextEditor key={"action" + this.loading} className="action" defaultValue={item.action}/>
                                    <RichTextEditor key={"result" + this.loading} className="expected-result" defaultValue={item.expectedResult}/>
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
                                <Button type="dashed" onClick={this.addTestStep} style={{width: "100%"}}>
                                    <Icon type="plus"/> Add Test Step
                                </Button>
                            </Form.Item>
                        </Form.Item>
                    </Form>
                </div>
            </Spin>
        );
    };

    addTestStep = (e) => {
        this.testCase.testSteps.push({
            action: "<p></p>",
            expectedResult: "<p></p>"
        });
    };

}

export default TestCaseEditorPanel;
