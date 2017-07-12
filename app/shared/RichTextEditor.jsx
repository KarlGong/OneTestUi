import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import cs from "classnames";
import {Editor, Raw} from "slate";
import {Icon} from "antd";
import "./RichTextEditor.css";

/**
 * Define the default node type.
 */

const DEFAULT_NODE = "paragraph";

/**
 * Define a schema.
 *
 * @type {Object}
 */

const schema = {
    nodes: {
        "code": props => <pre {...props.attributes}><code>{props.children}</code></pre>,
        "heading-one": props => <h1 {...props.attributes}>{props.children}</h1>,
        "heading-two": props => <h2 {...props.attributes}>{props.children}</h2>,
        "heading-three": props => <h3 {...props.attributes}>{props.children}</h3>,
        "heading-four": props => <h4 {...props.attributes}>{props.children}</h4>,
        "block-quote": props => <blockquote {...props.attributes}>{props.children}</blockquote>,
        "numbered-list": props => <ol {...props.attributes}>{props.children}</ol>,
        "bulleted-list": props => <ul {...props.attributes}>{props.children}</ul>,
        "list-item": props => <li {...props.attributes}>{props.children}</li>,
    },
    marks: {
        bold: {
            fontWeight: "bold"
        },
        italic: {
            fontStyle: "italic"
        },
        underlined: {
            textDecoration: "underline"
        }
    }
};

/**
 * The rich text example.
 *
 * @type {Component}
 */

class RichTextEditor extends Component {

    /**
     * Deserialize the initial editor state.
     *
     * @type {Object}
     */

    state = {
        state: Raw.deserialize({
            "nodes": [
                {
                    "kind": "block",
                    "type": "paragraph",
                    "nodes": []
                }
            ]
        }, {terse: true})
    };

    isFocus = false;

    /**
     * Check if the current selection has a mark with `type` in it.
     *
     * @param {String} type
     * @return {Boolean}
     */

    hasMark = (type) => {
        const {state} = this.state;
        return state.marks.some(mark => mark.type === type);
    };

    /**
     * Check if the any of the currently selected blocks are of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */

    hasBlock = (type) => {
        const {state} = this.state;
        return state.blocks.some(node => node.type === type);
    };

    /**
     * On change, save the new state.
     *
     * @param {State} state
     */

    onChange = (state) => {
        this.setState({state});
    };

    /**
     * On key down, if it's a formatting command toggle a mark.
     *
     * @param {Event} e
     * @param {Object} data
     * @param {State} state
     * @return {State}
     */

    onKeyDown = (e, data, state) => {
        if (data.key === "enter" && e.shiftKey) { // shift enter
            state = state
                .transform()
                .insertText("\n")
                .apply();

            e.preventDefault();
            return state;
        } else if (data.isMod) { // shortcut
            let mark;

            switch (data.key) {
                case "b":
                    mark = "bold";
                    break;
                case "i":
                    mark = "italic";
                    break;
                case "u":
                    mark = "underlined";
                    break;
                case "`":
                    mark = "code";
                    break;
                default:
                    return;
            }

            state = state
                .transform()
                .toggleMark(mark)
                .apply();

            e.preventDefault();
            return state
        }
    };

    /**
     * When a mark button is clicked, toggle the current mark.
     *
     * @param {Event} e
     * @param {String} type
     */

    onClickMark = (e, type) => {
        e.preventDefault();
        let {state} = this.state;

        state = state
            .transform()
            .toggleMark(type)
            .apply();

        this.setState({state})
    };

    /**
     * When a block button is clicked, toggle the block type.
     *
     * @param {Event} e
     * @param {String} type
     */

    onClickBlock = (e, type) => {
        e.preventDefault();
        let {state} = this.state;
        const transform = state.transform();
        const {document} = state;

        // Handle everything but list buttons.
        if (type !== "bulleted-list" && type !== "numbered-list") {
            const isActive = this.hasBlock(type);
            const isList = this.hasBlock("list-item");

            if (isList) {
                transform
                    .setBlock(isActive ? DEFAULT_NODE : type)
                    .unwrapBlock("bulleted-list")
                    .unwrapBlock("numbered-list")
            }

            else {
                transform
                    .setBlock(isActive ? DEFAULT_NODE : type)
            }
        }

        // Handle the extra wrapping required for list buttons.
        else {
            const isList = this.hasBlock("list-item");
            const isType = state.blocks.some((block) => {
                return !!document.getClosest(block.key, parent => parent.type === type)
            });

            if (isList && isType) {
                transform
                    .setBlock(DEFAULT_NODE)
                    .unwrapBlock("bulleted-list")
                    .unwrapBlock("numbered-list")
            } else if (isList) {
                transform
                    .unwrapBlock(type === "bulleted-list" ? "numbered-list" : "bulleted-list")
                    .wrapBlock(type)
            } else {
                transform
                    .setBlock("list-item")
                    .wrapBlock(type)
            }
        }

        state = transform.apply();
        this.setState({state});
    };

    /**
     * Render.
     *
     * @return {Element}
     */

    render = () => {
        return (
            <div className={cs("rich-text-editor", {"active" : this.isFocus})}>
                {this.renderToolbar()}
                {this.renderEditor()}
            </div>
        )
    };

    /**
     * Render the toolbar.
     *
     * @return {Element}
     */

    renderToolbar = () => {
        return (
            <div className="toolbar">
                {this.renderMarkButton("bold", "editor-b")}
                {this.renderMarkButton("italic", "editor-i")}
                {this.renderMarkButton("underlined", "editor-underline")}
                {this.renderBlockButton("code", "editor-code")}
                {this.renderBlockButton("heading-one", "editor-h1")}
                {this.renderBlockButton("heading-two", "editor-h2")}
                {this.renderBlockButton("heading-three", "editor-h3")}
                {this.renderBlockButton("heading-four", "editor-h4")}
                {this.renderBlockButton("block-quote", "editor-quote")}
                {this.renderBlockButton("numbered-list", "editor-ol")}
                {this.renderBlockButton("bulleted-list", "editor-ul")}
            </div>
        )
    };

    /**
     * Render a mark-toggling toolbar button.
     *
     * @param {String} type
     * @param {String} icon
     * @return {Element}
     */

    renderMarkButton = (type, icon) => {
        const isActive = this.hasMark(type);
        const onMouseDown = e => this.onClickMark(e, type);

        return (
            <span className={"toolbar-button" + (isActive ? " active" : "")} onMouseDown={onMouseDown}>
                <Icon className="icon" type={icon}/>
            </span>
        )
    };

    /**
     * Render a block-toggling toolbar button.
     *
     * @param {String} type
     * @param {String} icon
     * @return {Element}
     */

    renderBlockButton = (type, icon) => {
        const isActive = this.hasBlock(type);
        const onMouseDown = e => this.onClickBlock(e, type);

        return (
            <span className={cs("toolbar-button", {"active": isActive})} onMouseDown={onMouseDown}>
                <Icon className="icon" type={icon}/>
            </span>
        )
    };

    /**
     * Render the Slate editor.
     *
     * @return {Element}
     */

    renderEditor = () => {
        return (
            <div className="editor">
                <Editor
                    spellCheck
                    schema={schema}
                    state={this.state.state}
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                    onFocus={() => {this.isFocus = true}}
                    onBlur={() => {this.isFocus = false}}
                />
            </div>
        )
    };
}

/**
 * Export.
 */

export default RichTextEditor;
