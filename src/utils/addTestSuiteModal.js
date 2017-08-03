import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, action, toJS, runInAction} from "mobx";
import {render, unmountComponentAtNode} from "react-dom";
import {Modal, Input, Form, message, Icon} from "antd";
import axios from "axios";
import event from "~/utils/event";
import RichTextEditor from "~/components/RichTextEditor";
import TestSuiteTab from "~/components/TestSuiteTab";

const target = document.createElement("div");
document.body.appendChild(target);

function open(parentTestSuiteId) {
    render(<AddTestSuiteModal parentTestSuiteId={parentTestSuiteId}/>, target);
}

function close() {
    unmountComponentAtNode(target);
}

@observer
class AddTestSuiteModal extends Component {
    @observable loading = false;
    testSuiteName = null;
    testSuiteDescription = null;

    static defaultProps = {
        parentTestSuiteId: null,
    };

    render = () => {
        return <Modal
            title="Add Test Suite"
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
                    <Input size="default" onChange={(e) => this.testSuiteName = e.target.value}/>
                </Form.Item>
                <Form.Item label="Description">
                    <RichTextEditor onChange={(value) => this.testSuiteDescription = value}/>
                </Form.Item>
            </Form>
        </Modal>
    };

    handleOk = () => {
        this.loading = true;
        axios.put("/api/suite", {
            ParentSuiteId: this.props.parentTestSuiteId,
            name: this.testSuiteName,
            description: this.testSuiteDescription
        }).then((response) => {
            this.loading = false;
            message.success("Test suite is added successfully");
            event.emit("TabbedPanel.addPanel",
                {
                    key: "suite-" + response.data,
                    name: <span><Icon type="folder"/>{this.testSuiteName}</span>,
                    content: <TestSuiteTab defaultMode="edit" testSuiteId={response.data}/>
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