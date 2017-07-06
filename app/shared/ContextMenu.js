import React, {Component} from "react";
import {observer} from "mobx-react";
import {render, unmountComponentAtNode} from "react-dom";
import {observable} from "mobx";
import {Dropdown, Menu} from "antd";

const target = document.createElement("div");
document.body.appendChild(target);

export function openContextMenu(x, y, items) {
    render(<ContextMenuComponent x={x} y={y} items={items}/>, target);
}

export function closeContextMenu() {
    unmountComponentAtNode(target);
}

class ContextMenuComponent extends Component {

    clickOutside(e) {
        if (!target.contains(e.target)) {
            closeContextMenu();
        }
    }

    componentDidMount() {
        document.addEventListener("click", this.clickOutside.bind(this), true);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.clickOutside.bind(this), true);
    }

    handleClick(e) {
        e.item.props.data.onClick();
        setTimeout(closeContextMenu, 200);
    }

    render() {
        return <Menu style={{position: "absolute", top: this.props.y, left: this.props.x}} mode="inline"
                     onClick={this.handleClick.bind(this)} inlineIndent={15}>
            {this.props.items.map((item, i) => item ?
                <Menu.Item style={{height: "25px", lineHeight: "25px"}} key={i} data={item}>{item.name}</Menu.Item> :
                <Menu.Divider key={i}/>
            )}
        </Menu>
    }
}
