import React, {Component} from 'react';

import './List.css'
import Item from '../Item/Item';


class List extends Component {

    render() {
        let items = this.props.children.slice(0);
        let overlappedItemIndex = items.findIndex(item => item.id === this.props.overlappedItemId);
        if (overlappedItemIndex >= 0) {
            if (this.props.overlappedItemPos === 'below') overlappedItemIndex++;
            items.splice(overlappedItemIndex, 0, {'placeholder': true});
        }

        return (
            <div className="listContainer">
                <h1 className="listTitle">{this.props.parent.value}</h1>
                <ul className="list"
                    ref={this.onRef.bind(this)}>
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
                                        onDragStart={this.onItemDragStart.bind(this)}
                                        onDrag={this.onItemDrag.bind(this)}
                                        onDragStop={this.onItemDragStop.bind(this)}
                                        onItemRef={this.onItemRef.bind(this)}
                                        onChange={this.onItemChange.bind(this)}
                                        onCheckboxChange={this.onItemCheckboxChange.bind(this)}
                                    />
                                )
                            }
                        }
                    )}
                </ul>
            </div>
        );
    }

    onItemChange(itemId, value) {
        this.props.onItemChange(itemId, value);
    }

    onItemDragStart(itemId, parentId) {
        this.props.onItemDragStart(itemId, parentId);
    }

    onItemDrag(meta) {
        this.props.onItemDrag(meta.id);
    }

    onItemDragStop(itemId, parentId) {
        this.props.onItemDragStop(itemId, parentId);
    }

    onItemRef(obj) {
        this.props.onItemRef(obj);
    }

    onItemCheckboxChange(itemId, value) {
        this.props.onItemCheckboxChange(itemId, value);
    }

    // Fired when item DOM element is mounted/unmounted
    onRef(ref) {
        if (ref !== null) {
            this.props.onListRef({'id': this.props.parent.id, 'ref': ref});
        }
        else {
            this.props.onListRef({'id': this.props.parent.id, 'ref': null});
        }
    }
};

export default List;