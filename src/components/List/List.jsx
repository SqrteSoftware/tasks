import React, {Component} from 'react';

import './List.css'
import Item from '../Item';


class List extends Component {

    render() {
        let itemIdWithFocus = this.props.itemIdWithFocus;
        let items = this.props.children.slice(0);
        let history = this.props.history;
        let nearestItemIndex = items.findIndex(item => item.id === this.props.nearestItemId);
        if (nearestItemIndex >= 0) {
            if (this.props.nearestItemPos === 'below') nearestItemIndex++;
            items.splice(nearestItemIndex, 0, {'placeholder': true});
        }

        return (
            <div className="listContainer">
                <div className="listDelete" onClick={this.onDeleteList}>
                    X
                </div>
                <div className="listTitleContainer">
                    <span className="listTitleHandle dragHandle"></span>
                    <input
                        className="listTitle noDrag"
                        type="text"
                        placeholder="Title"
                        value={this.props.parent.value}
                        onChange={this.onTitleChange}/>
                </div>
                <div className="listContent noDrag">
                    {this.activeItems(items, itemIdWithFocus)}
                    {this.completedItems(history)}
                </div>
            </div>
        );
    }

    activeItems(items, itemIdWithFocus) {
        return (
            <ul className="list"
                ref={this.onRef}>
                {items.map((item) =>
                    {
                        if (item.placeholder) {
                            return <li key={"placeholder"} style={{height: 24, backgroundColor: '#eeeeee', listStyleType: 'none'}}>&nbsp;</li>
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
        let msg = "Are you sure you want to delete? This cannot be undone!";
        let confirmed = window.confirm(msg);
        if (confirmed) {
            this.props.onDeleteList(this.props.parent.id);
        }
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