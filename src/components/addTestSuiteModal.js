import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, action, toJS, runInAction} from "mobx";
import {render, unmountComponentAtNode} from "react-dom";
import {Modal, Input, Form, message, Icon} from "antd";
import axios from "axios";
import event from "~/utils/event";
import RichTextEditor from "~/components/RichTextEditor";
import Validator from "~/utils/Validator";

const target = document.createElement("div");
document.body.appendChild(target);

function open(parentId, onSuccess) {
    render(<AddTestSuiteModal parentId={parentId} onSuccess={onSuccess}/>, target);
}

function close() {
    unmountComponentAtNode(target);
}

@observer
class AddTestSuiteModal extends Component {
    @observable loading = false;
    testSuite = {name: null, description: null};
    @observable validator = new Validator(this.testSuite, {
        name: {required: true}
    });

    static defaultProps = {
        parentId: null,
        onSuccess: (id, name) => {},
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
                <Form.Item label="Name" validateStatus={this.validator.getResult("name").status}
                           help={this.validator.getResult("name").message}>
                    <Input onChange={(e) => {
                        this.testSuite.name = e.target.value;
                        this.validator.resetResult("name");
                    }} onBlur={() => this.validator.validate("name")}/>
                </Form.Item>
                <Form.Item label="Description">
                    <RichTextEditor onChange={(value) => this.testSuite.description = value}/>
                </Form.Item>
            </Form>
        </Modal>
    };

    handleOk = () => {
        this.validator.validateAll(
            () => {
                this.loading = true;
                axios.put("/api/suite", {
                    parentId: this.props.parentId,
                    name: this.testSuite.name,
                    description: this.testSuite.description,
                    position: -1
                }).then((response) => {
                    this.props.onSuccess(response.data);
                    this.loading = false;
                    close();
                })
            }
        );
    };

    handleCancel = () => {
        close();
    };
}

export default {open, close};