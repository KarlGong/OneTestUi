import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, action, toJS, runInAction} from "mobx";
import {render, unmountComponentAtNode} from "react-dom";
import {Modal, Input, Form, message, Icon} from "antd";
import axios from "axios";
import event from "~/utils/event";
import TestCaseTab from "~/components/TestCaseTab";

const target = document.createElement("div");
document.body.appendChild(target);

function open(testSuiteId) {
    render(<AddTestCaseModal testSuiteId={testSuiteId}/>, target);
}

function close() {
    unmountComponentAtNode(target);
}

@observer
class AddTestCaseModal extends Component {
    @observable loading = false;
    testCaseName = null;

    static defaultProps = {
        testSuiteId: null,
    };

    render = () => {
        return <Modal
            title="Add Test Case"
            okText="Add"
            cancelText="Cancel"
            visible
            maskClosable={false}
            confirmLoading={this.loading}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
        >
            <Form layout="vertical">
                <Form.Item label="Name" validateStatus="error">
                    <Input size="default" onChange={(e) => this.testCaseName = e.target.value}/>
                </Form.Item>
            </Form>
        </Modal>
    };

    handleOk = () => {
        this.loading = true;
        axios.put("/api/case", {
            testSuiteId: this.props.testSuiteId,
            name: this.testCaseName
        }).then((response) => {
            this.loading = false;
            message.success("Test case is added successfully");
            event.emit("TabbedPanel.addPanel",
                {
                    key: "case-" + response.data,
                    name: <span><Icon type="file"/>{this.testCaseName}</span>,
                    content: <TestCaseTab defaultMode="edit" testCaseId={response.data}/>
                }
            );
            close();
        })
    };

    handleCancel = () => {
        close();
    };
}

export default {open, close};