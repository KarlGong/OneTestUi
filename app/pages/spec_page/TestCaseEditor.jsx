import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Spin, Row, Col} from "antd";
import axios from "axios";
import RichTextEditor from "shared/RichTextEditor";

@observer
class TestCaseEditor extends Component {
    @observable testCase;
    @observable loading = false;

    componentWillMount() {
        this.loading = true;
        axios.get("/api/case/" + this.props.testCaseId).then((response) => {
            this.loading = false;
            this.testCase = response.data;
        })
    }

    render() {
        return (
            <Spin spinning={this.loading}>
                <div style={{height: "calc(100% - 113px)"}}>
                    {this.testCase ?
                        <div>
                            <Row>
                            <h3>Name</h3>
                            </Row>
                            <Row>
                            <RichTextEditor value={this.testCase.name}/>
                            </Row>
                        </div> : null
                    }
                </div>
            </Spin>
        );
    }

}

export default TestCaseEditor;