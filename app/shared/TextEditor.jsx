import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {AutoComplete, Input} from "antd";

@observer
class TextEditor extends Component {
    @observable dataSource = [];

    static defaultProps() {
        return {
            width: "100%",
            multiLine: false,
            style: {},
            className: null
        };
    }

    render() {
        if (this.props.multiLine) {
            return (
                <AutoComplete
                    dataSource={this.dataSource}
                    className={this.props.className}
                    style={{height: "66px", ...this.props.style}}
                    // onSelect={onSelect}
                    onSearch={this.handleSearch}
                >
                    <textarea onKeyPress={this.handleKeyPress} style={{resize: "none", height: "66px"}}/>
                </AutoComplete>
            );
        } else {
            return (
                <AutoComplete
                    dataSource={this.dataSource}
                    className={this.props.className}
                    style={{...this.props.style}}
                    // onSelect={onSelect}
                    onSearch={this.handleSearch}
                >
                    <input onBlur={this.handleKeyPress }/>}
                </AutoComplete>
            );
        }
    }

}

export default TextEditor;
