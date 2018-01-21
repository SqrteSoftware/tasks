import React, {Component} from 'react';
import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import './App.css';
import List from '../List/List';


class App extends Component {

    constructor(props) {
        super(props);

        this.itemRefsById = {};
        this.itemBoundsById = {};

        this.state = {
            'overlappedItemId': null,
            'activeDragParentId': null,
            'items': itemStore
        };
    }

    render() {
        var listData = createLists(this.state.items);
        return (
            <div className="App">
                <ReactGridLayout
                    className="layout"
                    cols={12}
                    rowHeight={30}
                    width={1200}
                    draggableCancel=".list">
                    {
                        listData.map(item => { return (
                            <div key={item.parent.id}
                                 data-grid={item.layout}
                                 className="App-list"
                                 style={this.state.activeDragParentId === item.parent.id ? {zIndex: 1} : {zIndex: 0}}>
                                <List
                                    parent={item.parent}
                                    children={item.children}
                                    onItemRef={this.onItemRef.bind(this)}
                                    onItemDragStart={this.onItemDragStart.bind(this)}
                                    onItemDrag={this.onItemDrag.bind(this)}
                                    onItemDragStop={this.onItemDragStop.bind(this)}
                                    overlappedItemId={this.state.overlappedItemId}
                                    onItemChange={this.onItemChange.bind(this)}/>
                            </div>
                        )})
                    }
                </ReactGridLayout>
            </div>
        );
    }

    onItemChange(itemId, value) {
        let items = this.state.items.slice();
        let itemIndex = items.findIndex(i => {return i.id === itemId});
        items[itemIndex] = Object.assign({}, items[itemIndex], {value: value});
        this.setState({'items': items});
    }

    onItemDragStart(itemId) {
        Object.keys(this.itemRefsById).forEach(itemId => {
            let itemRef = this.itemRefsById[itemId];
            this.itemBoundsById[itemId] = itemRef.getBoundingClientRect();
        });

        let item = this.state.items.find(i => { return i.id === itemId });
        this.setState({'activeDragParentId': item.pid});
    }

    onItemDrag(itemId) {
        let itemRef = this.itemRefsById[itemId];
        this.itemBoundsById[itemId] = itemRef.getBoundingClientRect();
        let overlappedItemId = this.findOverlappedItemId(itemId);
        if (this.state.overlappedItemId !== overlappedItemId) {
            this.setState({'overlappedItemId': overlappedItemId});
        }
    }

    onItemDragStop(draggedItemId) {
        let items = this.state.items;
        let overlappedItemId = this.state.overlappedItemId;
        if (overlappedItemId) {
            items = items.slice();
            // Save ref and remove dragged item
            let draggedItemIndex = items.findIndex(item => item.id === draggedItemId);
            let draggedItem = items[draggedItemIndex];
            items.splice(draggedItemIndex, 1);
            // Insert dragged item at new location
            let overlappedItemIndex = items.findIndex(item => item.id === overlappedItemId);
            let overlappedItem = items[overlappedItemIndex];
            draggedItem = Object.assign({}, draggedItem, {'pid': overlappedItem.pid});
            items.splice(overlappedItemIndex, 0, draggedItem);
        }
        this.setState({
            'items': items,
            'overlappedItemId': null,
            'activeDragParentId': null
        });
    }

    onItemRef(obj) {
        if (obj.ref !== null) {
            this.itemRefsById[obj.id] = obj.ref;
        }
        else {
            delete this.itemRefsById[obj.id];
        }
    }

    findOverlappedItemId(itemId) {
        let overlappedItemId = null;
        let draggedItemBound = this.itemBoundsById[itemId];
        Object.keys(this.itemRefsById).forEach((currentItemId) => {
            if (currentItemId === itemId) return;
            if (this.itemBoundsById[currentItemId] === undefined) return;
            let currentItemBound = this.itemBoundsById[currentItemId];
            if (draggedItemBound.x > currentItemBound.left && draggedItemBound.y > currentItemBound.top) {
                if (draggedItemBound.x < currentItemBound.right && draggedItemBound.y < currentItemBound.bottom) {
                    overlappedItemId = currentItemId;
                }
            }
        });
        return overlappedItemId;
    }
}

function createLists(items) {
    let listData = [];
    let index = 0;
    items.forEach((item) => {
        if (item.pid === "") {
            let parentId = item.id;
            listData.push({
                'parent': item,
                'children': items.filter(item => item.pid === parentId),
                'layout':  {x: index%3*4, y: 0, w: 4, h: 6, minW: 4, maxW: 4}
            });
            listData.push();
            index++;
        }
    });
    return listData;
}

// Generate testing items
let itemStore = [];
let parentId = null;
for (let i = 0; i < 40; i++) {
    let item = {
        id: "item" + i,
        value: "item value " + i,
        complete: false,
        // parents: [],
        pid: ""
    };
    if (i % 5 === 0) {
        parentId = "item" + i;
    }
    else {
        item.pid = parentId;
        // item.parents.push({id: parentId});
    }
    itemStore.push(item);
}

export default App;
