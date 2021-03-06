import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS, untracked, runInAction, action} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input, message, Popconfirm, Select, Radio} from "antd";
import axios from "axios";
import RichTextEditor from "~/components/RichTextEditor";
import guid from "~/utils/guid";
import clipboard from "~/utils/clipboard";
import {executionMap, importanceMap} from "~/utils/store";
import Validator from "~/utils/Validator";
import "./TestProjectEditPanel.css";

@observer
export default class TestProjectEditPanel extends Component {
    @observable testProject = {};
    @observable loading = false;
    @observable validator = new Validator(this.testProject, {
        name: {required: true}
    });

    static defaultProps = {
        testProjectId: null,
        onLoadingStart: () => {},
        onLoadingFinish: () => {},
        onSavingStart: () => {},
        onSavingFinish: () => {}
    };

    componentDidMount = () => {
        this.loading = true;
        this.props.onLoadingStart();
        axios.get("/api/project/" + this.props.testProjectId).then((response) => {
            runInAction(() => {
                this.testProject = response.data;
                this.validator.setSubject(this.testProject);
                this.props.onLoadingFinish();
                this.loading = false;
            });
        })
    };

    render = () => {
        return (
            <div className="test-project-editor">
                <Form layout="vertical">
                    <Form.Item label="Name" validateStatus={this.validator.getResult("name").status}
                               help={this.validator.getResult("name").message}>
                        <Input key={this.loading} style={{width: "45%"}}
                               defaultValue={untracked(() => this.testProject.name)}
                               onChange={(e) => {
                                   this.testProject.name = e.target.value;
                                   this.validator.resetResult("name");
                               }} onBlur={() => this.validator.validate("name")}/>
                    </Form.Item>
                    <Form.Item label="Description">
                        <RichTextEditor key={this.loading} defaultValue={untracked(() => this.testProject.description)}
                                        onChange={(value) => this.testProject.description = value}/>
                    </Form.Item>
                </Form>
            </div>
        );
    };

    save = () => {
        this.validator.validateAll(
            () => {
                this.props.onSavingStart();
                axios.post("/api/project/" + this.props.testProjectId, this.testProject).then((response) => {
                    this.props.onSavingFinish();
                });
            }
        );
    }
}
