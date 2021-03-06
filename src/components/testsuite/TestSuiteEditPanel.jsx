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
import "./TestSuiteEditPanel.css";

@observer
export default class TestSuiteEditPanel extends Component {
    @observable testSuite = {};
    @observable loading = false;
    @observable validator = new Validator(this.testSuite, {
        name: {required: true}
    });

    static defaultProps = {
        testSuiteId: null,
        onLoadingStart: () => {},
        onLoadingFinish: () => {},
        onSavingStart: () => {},
        onSavingFinish: () => {}
    };

    componentDidMount = () => {
        this.loading = true;
        this.props.onLoadingStart();
        axios.get("/api/suite/" + this.props.testSuiteId).then((response) => {
            runInAction(() => {
                this.testSuite = response.data;
                this.validator.setSubject(this.testSuite);
                this.props.onLoadingFinish();
                this.loading = false;
            });
        })
    };

    render = () => {
        return (
            <div className="test-suite-editor">
                <Form layout="vertical">
                    <Form.Item label="Name" validateStatus={this.validator.getResult("name").status}
                               help={this.validator.getResult("name").message}>
                        <Input key={this.loading} style={{width: "45%"}}
                               defaultValue={untracked(() => this.testSuite.name)}
                               onChange={(e) => {
                                   this.testSuite.name = e.target.value;
                                   this.validator.resetResult("name");
                               }} onBlur={() => this.validator.validate("name")}/>
                    </Form.Item>
                    <Form.Item label="Description">
                        <RichTextEditor key={this.loading} defaultValue={untracked(() => this.testSuite.description)}
                                        onChange={(value) => this.testSuite.description = value}/>
                    </Form.Item>
                </Form>
            </div>
        );
    };

    save = () => {
        this.validator.validateAll(
            () => {
                this.props.onSavingStart();
                axios.post("/api/suite/" + this.props.testSuiteId, this.testSuite).then((response) => {
                    this.props.onSavingFinish();
                });
            }
        );
    }
}
