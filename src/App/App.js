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
            'overlappedItemPos': null,
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
                                    overlappedItemPos={this.state.overlappedItemPos}
                                    onItemChange={this.onItemChange.bind(this)}
                                    onItemKeyUp={this.onItemKeyUp.bind(this)}
                                    onItemCheckboxChange={this.onItemCheckboxChange.bind(this)}
                                />
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

    onItemKeyUp(itemId, parentId, event) {
        if (event.key === "Enter") {
            let items = this.state.items.slice();
            let currentItem = items.find(i => {return i.id === itemId});
            let currentItemParentMeta = currentItem.parents.find(parent => parent.id === parentId);
            let newItem = createItem();
            items.push(newItem);

            items = this.insertItemIntoList(newItem, parentId, currentItem.id, currentItemParentMeta.next, items);

            this.setState({'items': items});
        }
    }

    insertItemIntoList(itemToInsert, parentId, prevItemId, nextItemId, items) {
        // Add item to parent list
        itemToInsert.parents.push({id: parentId, prev: prevItemId, next: nextItemId});
        // Find and point previous item to new item
        if (prevItemId !== null) {
            let prevItem = items.find(item => item.id === prevItemId);
            let prevItemParentMeta = prevItem.parents.find(parent => parent.id === parentId);
            prevItemParentMeta.next = itemToInsert.id;
        }
        // Find and point next item to new item
        if (nextItemId !== null) {
            let nextItem = items.find(item => item.id === nextItemId);
            let nextItemParentMeta = nextItem.parents.find(parent => parent.id === parentId);
            nextItemParentMeta.prev = itemToInsert.id;
        }
        return items;
    }

    onItemDragStart(itemId, parentId) {
        // Update the bounds of all items
        Object.keys(this.itemRefsById).forEach(itemId => {
            let itemRef = this.itemRefsById[itemId];
            this.itemBoundsById[itemId] = itemRef.getBoundingClientRect();
        });
        // Update the bounds of all lists
        Object.keys(this.listRefsById).forEach(listId => {
            let listRef = this.listRefsById[listId];
            this.listBoundsById[listId] = listRef.getBoundingClientRect();
        });
        this.setState({'activeDragParentId': parentId});
    }

    onItemDrag(itemId) {
        // Update bound of dragged item
        let itemRef = this.itemRefsById[itemId];
        let itemBound = itemRef.getBoundingClientRect();
        this.itemBoundsById[itemId] = itemBound;

        // Find the currently overlapped list if any
        let overlappedListId = this.findCoveredId(itemId, itemBound, this.listBoundsById);
        if (this.state.overlappedListId !== overlappedListId) {
            this.setState({'overlappedListId': overlappedListId});
        }

        if (overlappedListId) {
            let listItems = getChildrenItems(overlappedListId, this.state.items);
            let nearestItem = this.findNearestItem(itemId, listItems, this.itemBoundsById);

            this.setState({'overlappedItemId': nearestItem.id});
            this.setState({'overlappedItemPos': nearestItem.position});
        }
        else {
            this.setState({'overlappedItemId': null});
            this.setState({'overlappedItemPos': null});
        }
    }

    // TODO: refactor
    onItemDragStop(draggedItemId, currentListId) {
        let items = this.state.items.slice();
        let overlappedItemId = this.state.overlappedItemId;
        let overlappedItemPos = this.state.overlappedItemPos;
        let overlappedListId = this.state.overlappedListId;
        if (overlappedItemId) {
            items = items.slice();
            let draggedItem = items.find(item => item.id === draggedItemId);
            let overlappedItem = items.find(item => item.id === overlappedItemId);
            let overlappedItemParent = overlappedItem.parents.find(parent => parent.id === overlappedListId);
            // Find prior references to dragged item
            let draggedItemParent = draggedItem.parents.find(parent => parent.id === currentListId);
            let oldPrevItem = items.find(item => item.id === draggedItemParent.prev);
            let oldNextItem = items.find(item => item.id === draggedItemParent.next);
            // Remove prior references to dragged item from other items
            if (oldPrevItem) {
                let oldPrevItemParent = oldPrevItem.parents.find(parent => parent.id === currentListId);
                oldPrevItemParent.next = oldNextItem ? oldNextItem.id : null;
            }
            if (oldNextItem) {
                let oldNextItemParent = oldNextItem.parents.find(parent => parent.id === currentListId);
                oldNextItemParent.prev = oldPrevItem ? oldPrevItem.id : null;
            }
            // Remove the old parent list from dragged item
            draggedItem.parents = draggedItem.parents.filter(parent => parent.id !== currentListId);
            // Find the dragged item's new prev and next
            let draggedItemPrev = overlappedItemPos === 'above' ? overlappedItemParent.prev : overlappedItemId;
            let draggedItemNext = overlappedItemPos === 'above' ? overlappedItemId : overlappedItemParent.next;
            // Insert item into new list
            items = this.insertItemIntoList(draggedItem, overlappedListId, draggedItemPrev, draggedItemNext, items);
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

    onItemCheckboxChange(itemId, value) {
        let items = this.state.items.slice();
        let itemIndex = items.findIndex(i => {return i.id === itemId});
        items[itemIndex] = Object.assign({}, items[itemIndex], {complete: value});
        this.setState({'items': items});
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
        let hoverMidX = hoverBound.x + (hoverBound.width / 2);
        let hoverMidY = hoverBound.y + (hoverBound.height / 2);
        let coveredId = null;
        Object.keys(boundsById).forEach((boundId) => {
            if (boundId === hoverId) return;
            let bound = boundsById[boundId];
            if (hoverMidX > bound.left && hoverMidY > bound.top) {
                if (hoverMidX < bound.right && hoverMidY < bound.bottom) {
                    coveredId = boundId;
                }
            }
        });
        return coveredId;
    }

    findNearestItem(draggedId, listItems, itemBoundsById) {
        let draggedBound = itemBoundsById[draggedId];
        let draggedMidY = draggedBound.y + (draggedBound.height / 2);

        let nearestItem = {id: null, position: null};
        let currentLeastDistance = null;
        listItems.forEach((item) => {
            let itemId = item.id;
            if (itemId === draggedId) return;
            let itemBound = itemBoundsById[itemId];
            let itemMidY = itemBound.y + (itemBound.height / 2);
            if (Math.abs(draggedMidY - itemMidY) < currentLeastDistance
                || currentLeastDistance === null) {
                currentLeastDistance = Math.abs(draggedMidY - itemMidY);
                nearestItem.id = itemId;
                nearestItem.position = draggedMidY < itemMidY ? 'above' : 'below';
            }
        });
        return nearestItem;
    }
}


function createViewData(items) {
    let listData = [];
    let index = 0;
    items.forEach((item) => {
        if (item.parents.length <= 0) {
            let parentItem = item;
            listData.push({
                'parent': parentItem,
                'children': getChildrenItems(parentItem.id, items),
                'layout':  {x: index%3*4, y: 0, w: 4, h: 6, minW: 4, maxW: 4}
            });
            listData.push();
            index++;
        }
    });
    return listData;
}

function getChildrenItems(parentId, items) {
    let children = items.filter(item => {
        return item.parents.find(parent => parent.id === parentId);
    });
    let firstChild = children.find(item => {
        let parent = item.parents.find(parent => parent.id === parentId);
        return parent.prev === null;
    });
    let sortedChildren = [];
    let child = firstChild;
    let parent;
    while (child) {
        sortedChildren.push(child);
        parent = child.parents.find(parent => parent.id === parentId);
        if (!parent || parent.next === null) {
            break;
        }
        child = children.find(item => item.id === parent.next);
    }
    return sortedChildren;
}

let itemId = 0;
function createItem(value="", complete=false, parents=[]) {
    return {
        id: "item" + itemId++,
        value,
        complete,
        parents
    };
}

// Generate testing items
let itemStore = [];
let parentId = null;
let lastItem = null;
for (let i = 0; i < 40; i++) {
    let item = createItem("item value " + i);
    if (i % 5 === 0) {
        lastItem = null;
        parentId = "item" + i;
    }
    else if (lastItem === null) {
        item.parents.push({id: parentId, prev: null, next: null});
        lastItem = item;
    }
    else {
        item.parents.push({id: parentId, prev: lastItem.id, next: null});
        let lastItemParent = lastItem.parents.find(parent => parent.id === parentId);
        lastItemParent.next = item.id;
        lastItem = item;
    }
    itemStore.push(item);
}

export default App;
