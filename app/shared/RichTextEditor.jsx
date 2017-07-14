import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import cs from "classnames";
import {Editor, Raw, Mark, Plain, Block, Html} from "slate";
import {Icon} from "antd";
import SlateTable from "slate-edit-table";
import "./RichTextEditor.css";

/**
 * Define the default node type.
 */

const DEFAULT_NODE = "paragraph";
const slateTable = SlateTable({
    typeTable: "table",
    typeRow: "table-row",
    typeCell: "table-cell"
});

/**
 * Define a schema.
 *
 * @type {Object}
 */

const schema = {
    nodes: {
        "code": props => <pre {...props.attributes}><code>{props.children}</code></pre>,
        "block-quote": props => <blockquote {...props.attributes}>{props.children}</blockquote>,
        "numbered-list": props => <ol {...props.attributes}>{props.children}</ol>,
        "bulleted-list": props => <ul {...props.attributes}>{props.children}</ul>,
        "list-item": props => <li {...props.attributes}>{props.children}</li>,
        "table": props =>
            <table>
                <tbody {...props.attributes}>{props.children}</tbody>
            </table>,
        "table-row": props => <tr {...props.attributes}>{props.children}</tr>,
        "table-cell": (props) => {
            let align = props.node.get("data").get("align") || "left";
            return <td style={{textAlign: align}} {...props.attributes}>{props.children}</td>;
        },
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
        },
        color: ({mark, children}) => (
            <span style={{color: mark.data}}>
                {children}
            </span>
        )
    }
};

/**
 * The rich text example.
 *
 * @type {Component}
 */
@observer
class RichTextEditor extends Component {

    state = {
        state: Plain.deserialize("")
    };

    @observable isFocus = false;
    @observable isToolbarShow = false;

    componentDidMount() {
        this.setState({
            state: Plain.deserialize(this.props.defaultValue)
        })
    }

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
     * Render.
     *
     * @return {Element}
     */

    render = () => {
        return (
            <div className={cs("rich-text-editor", {"active": this.isFocus}, this.props.className)}
                style={this.props.style}>
                {this.renderToggleButton()}
                {this.renderToolbar()}
                {this.renderEditor()}
            </div>
        )
    };

    renderToggleButton = () => {
        return this.isToolbarShow ?
            <div className="toggle-button" onClick={() => this.isToolbarShow = false}><Icon type="up" /></div>
            : <div  className="toggle-button" onClick={() => this.isToolbarShow = true}><Icon type="ellipsis" /></div>
    };

    /**
     * Render the toolbar.
     *
     * @return {Element}
     */

    renderToolbar = () => {
        return ( this.isToolbarShow ?
            <div className="toolbar">
                {this.renderMarkButton("bold", "editor-b")}
                {this.renderMarkButton("italic", "editor-i")}
                {this.renderMarkButton("underlined", "editor-underline")}
                {this.renderBlockButton("code", "editor-code")}
                {this.renderBlockButton("block-quote", "editor-quote")}
                {this.renderBlockButton("numbered-list", "editor-ol")}
                {this.renderBlockButton("bulleted-list", "editor-ul")}
                {this.renderTableButtons()}
                {this.renderColorButton("#ED5565")}
                {this.renderColorButton("#F6BB42")}
                {this.renderColorButton("#A0D468")}
                {this.renderColorButton("#4FC1E9")}
                {this.renderColorButton("#967ADC")}
                {this.renderColorButton("rgba(0, 0, 0, 0.65)")}
            </div> : null
        )
    };

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
            <span className={cs("toolbar-button", {"active": isActive})} onMouseDown={onMouseDown}>
                <Icon className="icon" type={icon}/>
            </span>
        )
    };

    onClickColor = (e, color) => {
        e.preventDefault();
        let {state} = this.state;
        let transform = state.transform();

        state.marks.map((mark) => {
            if (mark.type === "color") {
                transform = transform.removeMark(mark);
            }
        });

        state = transform
            .addMark(new Mark({
                type: "color",
                data: color
            }))
            .apply();

        this.setState({state})
    };

    renderColorButton = (color) => {
        const onMouseDown = e => this.onClickColor(e, color);

        return (
            <span className="toolbar-color-button" style={{backgroundColor: color, borderColor: color}}
                  onMouseDown={onMouseDown}>
            </span>
        )
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

    onInsertTable = () => {
        let {state} = this.state;
        this.onChange(
            slateTable.transforms.insertTable(state.transform()).apply()
        );
    };

    onInsertColumn = () => {
        let {state} = this.state;
        this.onChange(
            slateTable.transforms.insertColumn(state.transform()).apply()
        );
    };

    onInsertRow = () => {
        let {state} = this.state;
        this.onChange(
            slateTable.transforms.insertRow(state.transform()).apply()
        );
    };

    onRemoveColumn = () => {
        let {state} = this.state;

        this.onChange(
            slateTable.transforms.removeColumn(state.transform()).apply()
        );
    };

    onRemoveRow = () => {
        let {state} = this.state;
        this.onChange(
            slateTable.transforms.removeRow(state.transform()).apply()
        );
    };

    onRemoveTable = () => {
        let {state} = this.state;
        let newState = slateTable.transforms.removeTable(state.transform()).apply();
        if (!newState.document.nodes.size) {
            newState = Plain.deserialize("");
        }
        this.onChange(newState);
    };

    renderTableButtons = () => {
        let {state} = this.state;
        let isTable = slateTable.utils.isSelectionInTable(state);

        if (!isTable) {
            return <span className="toolbar-button" onMouseDown={this.onInsertTable}>
                    <Icon className="icon" type="insert-table"/>
                </span>
        } else {
            return <span>
                <span className="toolbar-button" onMouseDown={this.onInsertRow}>
                    <Icon className="icon" type="insert-row"/>
                </span>
                <span className="toolbar-button" onMouseDown={this.onInsertColumn}>
                    <Icon className="icon" type="insert-column"/>
                </span>
                <span className="toolbar-button" onMouseDown={this.onRemoveRow}>
                    <Icon className="icon" type="delete-row"/>
                </span>
                <span className="toolbar-button" onMouseDown={this.onRemoveColumn}>
                    <Icon className="icon" type="delete-column"/>
                </span>
                <span className="toolbar-button" onMouseDown={this.onRemoveTable}>
                    <Icon className="icon" type="delete-table"/>
                </span>
            </span>
        }
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
                    onFocus={() => {
                        this.isFocus = true
                    }}
                    onBlur={() => {
                        this.isFocus = false
                    }}
                />
            </div>
        )
    };
}

/**
 * Export.
 */

export default RichTextEditor;
