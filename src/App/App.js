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

        this.listRefsById = {};
        this.listBoundsById = {};

        this.state = {
            'activeDragParentId': null,
            'overlappedItemId': null,
            'overlappedListId': null,
            'items': itemStore
        };
    }

    render() {
        var listData = createViewData(this.state.items);
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
                                    onListRef={this.onListRef.bind(this)}
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

    onItemDragStart(itemId, parentId) {
        Object.keys(this.itemRefsById).forEach(itemId => {
            let itemRef = this.itemRefsById[itemId];
            this.itemBoundsById[itemId] = itemRef.getBoundingClientRect();
        });
        Object.keys(this.listRefsById).forEach(listId => {
            let listRef = this.listRefsById[listId];
            this.listBoundsById[listId] = listRef.getBoundingClientRect();
        });
        this.setState({'activeDragParentId': parentId});
    }

    onItemDrag(itemId) {
        let itemRef = this.itemRefsById[itemId];
        let itemBound = itemRef.getBoundingClientRect();
        this.itemBoundsById[itemId] = itemBound;

        let overlappedItemId = this.findCoveredId(itemId, itemBound, this.itemBoundsById);
        if (this.state.overlappedItemId !== overlappedItemId) {
            this.setState({'overlappedItemId': overlappedItemId});
        }
        let overlappedListId = this.findCoveredId(itemId, itemBound, this.listBoundsById);
        if (this.state.overlappedListId !== overlappedListId) {
            this.setState({'overlappedListId': overlappedListId});
        }
    }

    // TODO:
    onItemDragStop(draggedItemId, currentListId) {
        let items = this.state.items;
        let overlappedItemId = this.state.overlappedItemId;
        let overlappedListId = this.state.overlappedListId;
        if (overlappedItemId) {
            items = items.slice();
            // Get dragged item object
            let draggedItemIndex = items.findIndex(item => item.id === draggedItemId);
            let draggedItem = items[draggedItemIndex];
            // Get overlapped item object
            let overlappedItemIndex = items.findIndex(item => item.id === overlappedItemId);
            let overlappedItem = items[overlappedItemIndex];
            // Get new parent and order
            let oldParent = overlappedItem.parents.find(parent => parent.id === overlappedListId);
            // Remove the old parent and add the new
            let newParents = draggedItem.parents.filter(parent => parent.id !== currentListId);
            newParents.push({id: overlappedListId, order: oldParent.order});
            draggedItem.parents = newParents;
            // Reorder list items
            items.forEach(item => {
                let parent = item.parents.find(parent => parent.id === overlappedListId);
                if (parent) {
                   if (item.id !== draggedItemId) {
                       if (parent.order >= oldParent.order) {
                           parent.order++;
                       }
                   }
               }
            });
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

    onListRef(obj) {
        if (obj.ref !== null) {
            this.listRefsById[obj.id] = obj.ref;
        }
        else {
            delete this.listRefsById[obj.id];
        }
    }

    findCoveredId(hoverId, hoverBound, boundsById) {
        let coveredId = null;
        Object.keys(boundsById).forEach((boundId) => {
            if (boundId === hoverId) return;
            let bound = boundsById[boundId];
            if (hoverBound.x > bound.left && hoverBound.y > bound.top) {
                if (hoverBound.x < bound.right && hoverBound.y < bound.bottom) {
                    coveredId = boundId;
                }
            }
        });
        return coveredId;
    }
}


function createViewData(items) {
    console.log("recompile view data")
    let listData = [];
    let index = 0;
    items.forEach((item) => {
        if (item.parents.length <= 0) {
            let parentItem = item;
            listData.push({
                'parent': parentItem,
                'children': items.filter(item => {
                    return item.parents.find(parent => parent.id === parentItem.id);
                }).sort((a, b) => {
                    let parentA = a.parents.find(parent => parent.id === parentItem.id);
                    let parentB = b.parents.find(parent => parent.id === parentItem.id);
                    return parentA.order - parentB.order;
                }),
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
        parents: []
    };
    if (i % 5 === 0) {
        parentId = "item" + i;
    }
    else {
        item.parents.push({id: parentId, order: i % 5});
    }
    itemStore.push(item);
}

export default App;
