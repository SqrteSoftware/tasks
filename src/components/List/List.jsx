import React, {Component} from 'react';
import DragIndicator from '@mui/icons-material/DragIndicatorOutlined'

import './List.css'
import Item from '../Item';
import {CollapseIndicator} from "../Shared/CollapseIndicator"


class List extends Component {

    constructor(props) {
        super(props);
        this.itemPlaceholderHeight = 0;
    }

    render() {
        let settings = this.props.settings || {};
        let showCompletedItems = settings.showCompletedItems === undefined ? true : settings.showCompletedItems;
        let itemIdWithFocus = this.props.itemIdWithFocus;
        let items = this.props.children.slice(0);
        let history = this.props.history;
        let nearestItemIndex = items.findIndex(item => item.id === this.props.nearestItemId);
        if (nearestItemIndex >= 0) {
            if (this.props.nearestItemPos === 'below') nearestItemIndex++;
            items.splice(nearestItemIndex, 0, {'placeholder': true});
        }
        return (
            <div className="list">
                <div className="listDelete noDrag" onClick={this.onDeleteList}>
                    X
                </div>
                <div className="listTitle">
                    <DragIndicator className="listTitleHandle dragHandle"></DragIndicator>
                    <input
                        className="listTitleInput noDrag"
                        type="text"
                        enterKeyHint="Go" /* For Android */
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        placeholder="Title"
                        value={this.props.parent.value}
                        onChange={this.onTitleChange}
                        onKeyDown={this.onTitleKeyDown}/>
                </div>
                <div className="listContent noDrag" ref={this.onRef} style={this.props.freezeScroll ? {overflow: 'hidden'} : {}}>
                    {this.activeItems(items, itemIdWithFocus)}
                    {this.completedItems(history, showCompletedItems)}
                </div>
            </div>
        );
    }

    activeItems(items, itemIdWithFocus) {
        if (items.length > 0) {
            return (
                <ul className="listContentActive">
                    {items.map((item) =>
                        {
                            if (item.placeholder) {
                                return <li key={"placeholder"} style={{height: this.itemPlaceholderHeight, backgroundColor: '#eeeeee', listStyleType: 'none'}}>&nbsp;</li>
                            }
                            else {
                                return (
                                    <Item
                                        key={item.id}
                                        item={item}
                                        parentId={this.props.parent.id}
                                        giveFocus={itemIdWithFocus === item.id}
                                        onItemFocus={this.onItemFocus}
                                        onDragStart={this.onItemDragStart}
                                        onDrag={this.onItemDrag}
                                        onDragStop={this.onItemDragStop}
                                        onItemRef={this.onItemRef}
                                        onChange={this.onItemChange}
                                        onKeyDown={this.props.onItemKeyDown}
                                        onCheckboxChange={this.onItemCheckboxChange}
                                    />
                                )
                            }
                        }
                    )}
                </ul>
            )
        }
        else {
            return (
                <span className="listEmptyNotice">
                    Click list title and press enter to insert item
                </span>
            )

        }
    }

    completedItems(items, show) {
        if (items.length <= 0) {
            return null;
        }
        return (
            <div className="completed">
                <span className="completedTitle" onClick={this.onToggleCompleted}>
                    <CollapseIndicator expanded={show}>
                        {'Completed (' + items.length + ')'}
                    </CollapseIndicator>
                </span>
                {this.completedItemsList(items, show)}
            </div>
        )
    }

    completedItemsList(items, show) {
        if (!show) return null;
        return (
            <ul className="listContentCompleted noDrag">
                {items.map((item) =>
                    {
                        return (
                            <Item
                                key={item.id}
                                item={item}
                                parentId={this.props.parent.id}
                                onItemRef={this.onItemRef}
                                onCheckboxChange={this.onItemCheckboxChange}
                            />
                        )
                    }
                )}
            </ul>
        )
    }

    onToggleCompleted = (e) => {
        let showCompletedItems = this.props.settings ? this.props.settings.showCompletedItems : true;
        this.props.onToggleCompleted(this.props.parent.id, !showCompletedItems);
    };

    onDeleteList = (e) => {
        let msg = "Are you sure you want to delete? This cannot be undone!";
        let confirmed = window.confirm(msg);
        if (confirmed) {
            this.props.onDeleteList(this.props.parent.id);
        }
    };

    onTitleChange = (e, data) => {
        this.props.onItemChange(this.props.parent.id, e.target.value);
    };

    onTitleKeyDown = (e) => {
        if (e.key === "Enter") {
            let firstChild = this.props.firstChild;
            let nextId = firstChild ? firstChild.id : null;
            let prevId = firstChild ? firstChild.parents[this.props.parent.id].prev : null;
            this.props.createNewItemWithFocus(this.props.parent.id, prevId, nextId);
        }
    };

    onItemChange = (itemId, value) => {
        this.props.onItemChange(itemId, value);
    };

    onItemDragStart = (itemId, parentId) => {
        this.props.onItemDragStart(itemId, parentId);
    };

    onItemDrag = (meta) => {
        this.props.onItemDrag(meta.id);
    };

    onItemDragStop = (itemId, parentId) => {
        this.props.onItemDragStop(itemId, parentId);
    };

    onItemRef = (obj) => {
        if (obj.ref !== null) {
            // Save the height of items so we know how
            // tall a placeholder should be
            this.itemPlaceholderHeight = obj.totalHeight;
        }
        this.props.onItemRef(obj);
    };

    onItemCheckboxChange = (itemId, value) => {
        this.props.onItemCheckboxChange(itemId, value);
    };

    onItemFocus = (itemId) => {
        this.props.onItemFocus(itemId);
    };

    // Fired when item DOM element is mounted/unmounted
    onRef = (ref) => {
        if (ref !== null) {
            this.props.onListRef({'id': this.props.parent.id, 'ref': ref});
        }
        else {
            this.props.onListRef({'id': this.props.parent.id, 'ref': null});
        }
    };
}

export default List;