import React, {Component} from 'react';

import './List.css'
import Item from '../Item/Item';


class List extends Component {

    render() {
        let items = this.props.children.slice(0);
        let overlappedItemIndex = items.findIndex(item => item.id === this.props.overlappedItemId);
        if (overlappedItemIndex >= 0) {
            items.splice(overlappedItemIndex, 0, {'placeholder': true});
        }

        return (
            <div>
                <h1 className="listTitle">{this.props.parent.value}</h1>
                <ul className="list">
                    {items.map((item) =>
                        {
                            if (item.placeholder) {
                                return <li key={"placeholder"} style={{backgroundColor: 'lightyellow'}}>drop here</li>
                            }
                            else {
                                return (
                                    <Item
                                        key={item.id}
                                        item={item}
                                        onDragStart={this.onItemDragStart.bind(this)}
                                        onDrag={this.onItemDrag.bind(this)}
                                        onDragStop={this.onItemDragStop.bind(this)}
                                        onRef={this.onItemRef.bind(this)}
                                        onChange={this.onItemChange.bind(this)}/>
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

    onItemDragStart(itemId) {
        this.props.onItemDragStart(itemId);
    }

    onItemDrag(meta) {
        this.props.onItemDrag(meta.id);
    }

    onItemDragStop(itemId) {
        this.props.onItemDragStop(itemId);
    }

    onItemRef(obj) {
        this.props.onItemRef(obj);
    }
};

export default List;