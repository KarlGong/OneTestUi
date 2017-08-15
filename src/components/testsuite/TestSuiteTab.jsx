import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS, untracked, runInAction, action} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input, message, Popconfirm, Select, Radio} from "antd";
import TestSuiteViewPanel from "./TestSuiteViewPanel";
import TestSuiteEditPanel from "./TestSuiteEditPanel";
import "./TestSuiteTab.css";

@observer
export default class TestSuiteTab extends Component {
    static defaultProps = {
        testSuiteId: null,
        defaultMode: "view"
    };

    @observable mode = this.props.defaultMode;
    @observable loading = false;
    @observable saving = false;
    editPanel = null;

    render = () => {
        return (
            <Spin spinning={this.loading}>
                <div className="test-suite-tab">{this.mode === "edit" ?
                    <div>
                        <TestSuiteEditPanel testSuiteId={this.props.testSuiteId}
                                           onLoadingStart={() => this.loading = true}
                                           onLoadingFinish={() => this.loading = false}
                                           onSavingStart={() => this.saving = true}
                                           onSavingFinish={() => {this.saving = false; message.success("Test suite is saved successfully");}}
                                           ref={instance => this.editPanel = instance}/>
                        <div className="actions">
                            <Button style={{marginRight: "10px"}} icon="save" type="primary" onClick={() => this.editPanel.save()}
                                    loading={this.saving}>Save</Button>
                            <Button key="mode" icon="rollback" type="default" onClick={() => this.mode = "view"}>Back to View</Button>
                        </div>
                    </div> :
                    <div>
                        <TestSuiteViewPanel testSuiteId={this.props.testSuiteId}
                                           onLoadingStart={() => this.loading = true}
                                           onLoadingFinish={() => this.loading = false}/>
                        <div className="actions">
                            <Button key="mode" icon="edit" type="default" onClick={() => this.mode = "edit"}>Edit</Button>
                        </div>
                    </div>}
                </div>
            </Spin>
        )
    };
}