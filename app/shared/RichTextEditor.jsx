import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import { AutoComplete, Input } from "antd";

@observer
class RichTextEditor extends Component {

    render() {

        return (

            <textarea onKeyPress={this.handleKeyPress} style={{ height: 50 }} defaultValue={this.props.value}></textarea>

        );
    }

}

export default RichTextEditor;
