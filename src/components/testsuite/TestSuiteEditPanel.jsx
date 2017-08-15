import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS, untracked, runInAction, action} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input, message, Popconfirm, Select, Radio} from "antd";
import axios from "axios";
import RichTextEditor from "~/components/RichTextEditor";
import guid from "~/utils/guid";
import clipboard from "~/utils/clipboard";
import {executionMap, importanceMap} from "~/utils/store";
import "./TestSuiteEditPanel.css";

@observer
export default class TestSuiteEditPanel extends Component {
    @observable testSuite = {};
    @observable loading = false;

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
                this.props.onLoadingFinish();
                this.loading = false;
            });
        })
    };

    render = () => {
        return (
            <div className="test-suite-editor">
                <Form layout="vertical">
                    <Form.Item label="Name" validateStatus="error">
                        <Input key={this.loading} size="default" style={{width: "45%"}}
                               defaultValue={untracked(() => this.testSuite.name)} // it's a trick to untrack changes here
                               onChange={(e) => this.testSuite.name = e.target.value}/>
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
        this.props.onSavingStart();
        axios.post("/api/suite/" + this.props.testSuiteId, this.testSuite).then((response) => {
            this.props.onSavingFinish();
        });
    }
}
