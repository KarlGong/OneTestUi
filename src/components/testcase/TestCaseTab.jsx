import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, toJS, untracked, runInAction, action} from "mobx";
import {Spin, Row, Col, Form, Button, Icon, Input, message, Popconfirm, Select, Radio} from "antd";
import TestCaseViewPanel from "./TestCaseViewPanel";
import TestCaseEditPanel from "./TestCaseEditPanel";
import "./TestCaseTab.css";

@observer
export default class TestCaseTab extends Component {
    static defaultProps = {
        testCaseId: null,
        defaultMode: "view"
    };

    @observable mode = this.props.defaultMode;
    @observable loading = false;
    @observable saving = false;
    editPanel;

    render = () => {
        return (
            <Spin spinning={this.loading}>
                <div className="test-case-tab">{this.mode === "edit" ?
                    <div>
                        <TestCaseEditPanel testCaseId={this.props.testCaseId}
                                           onLoadingStart={() => this.loading = true}
                                           onLoadingFinish={() => this.loading = false}
                                           onSavingStart={() => this.saving = true}
                                           onSavingFinish={() => {this.saving = false; message.success("Test case is saved successfully");}}
                                           ref={instance => this.editPanel = instance}/>
                        <div className="actions">
                            <Button style={{marginRight: "10px"}} icon="save" type="primary" onClick={() => this.editPanel.save()}
                                    loading={this.saving}>Save</Button>
                            <Button key="mode" icon="rollback" type="default" onClick={() => this.mode = "view"}>Back to View</Button>
                        </div>
                    </div> :
                    <div>
                        <TestCaseViewPanel testCaseId={this.props.testCaseId}
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