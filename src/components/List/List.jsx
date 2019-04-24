import React, {Component} from 'react';

import './List.css'
import Item from '../Item';


class List extends Component {

    render() {
        let itemIdWithFocus = this.props.itemIdWithFocus;
        let items = this.props.children.slice(0);
        let history = this.props.history;
        let overlappedItemIndex = items.findIndex(item => item.id === this.props.overlappedItemId);
        if (overlappedItemIndex >= 0) {
            if (this.props.overlappedItemPos === 'below') overlappedItemIndex++;
            items.splice(overlappedItemIndex, 0, {'placeholder': true});
        }

        return (
            <div className="listContainer">
                <div className="listDelete" onClick={this.onDeleteList}>
                    X
                </div>
                <div className="listTitleContainer noDrag">
                    <input
                        className="listTitle"
                        type="text"
                        placeholder="Title"
                        value={this.props.parent.value}
                        onChange={this.onTitleChange}/>
                </div>
                <div className="listContent">
                    {this.activeItems(items, itemIdWithFocus)}
                    {this.completedItems(history)}
                </div>
            </div>
        );
    }

    activeItems(items, itemIdWithFocus) {
        return (
            <ul className="list noDrag"
                ref={this.onRef}>
                {items.map((item) =>
                    {
                        if (item.placeholder) {
                            return <li key={"placeholder"} style={{backgroundColor: 'lightyellow', listStyleType: 'none'}}>&nbsp;</li>
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

    completedItems(items) {
        if (items.length <= 0) {
            return null;
        }
        return (
            <div className="completed">
                <span className="completedTitle">Completed ({items.length})</span>
                <ul className="list noDrag">
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
            </div>
        )
    }

    onDeleteList = (e) => {
        this.props.onDeleteList(this.props.parent.id);
    };

    onTitleChange = (e, data) => {
        this.props.onItemChange(this.props.parent.id, e.target.value);
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