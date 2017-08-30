import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, action, toJS, runInAction, isObservable} from "mobx";
import {render, unmountComponentAtNode} from "react-dom";
import {Modal, Input, Form, message, Icon} from "antd";
import axios from "axios";
import event from "~/utils/event";
import Validator from "~/utils/Validator";

const target = document.createElement("div");
document.body.appendChild(target);

function open(parentId, onSuccess) {
    render(<AddTestCaseModal parentId={parentId} onSuccess={onSuccess}/>, target);
}

function close() {
    unmountComponentAtNode(target);
}

@observer
class AddTestCaseModal extends Component {
    @observable loading = false;
    @observable testCase = {name: null};
    @observable validator;

    static defaultProps = {
        parentId: null,
        onSuccess: (id, name) => {}
    };

    componentDidMount = () => {
        this.validator = new Validator(this.testCase, {
            name: {required: true}
        });
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
                <Form.Item label="Name" validateStatus={this.validator && this.validator.results.name.status}
                           help={this.validator && this.validator.results.name.message}>
                    <Input size="default" onChange={(e) => {
                        this.testCase.name = e.target.value;
                        this.validator.validateField("name");
                    }}/>
                </Form.Item>
            </Form>
        </Modal>
    };

    handleOk = () => {
        this.validator.validate(
            () => {
                this.loading = true;
                axios.put("/api/case", {
                    parentId: this.props.parentId,
                    name: this.testCase.name,
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