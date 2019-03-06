import React, {Component} from 'react';
import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import './App.css';
import List from '../List/List';
import { createViewData, getChildrenItems } from '../../utils';


class App extends Component {

    constructor(props) {
        super(props);

        this.itemRefsById = {};
        this.itemBoundsById = {};

        this.listRefsById = {};
        this.listBoundsById = {};
        this.listBoundsById = {};
    }

    render() {
        var listData = createViewData(this.props.items);
        let listIdWithFocus = this.props.focus.parentId;
        let itemIdWithFocus = this.props.focus.itemId;
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
                                 style={this.props.dnd.activeDragParentId === item.parent.id ? {zIndex: 1} : {zIndex: 0}}>
                                <List
                                    parent={item.parent}
                                    children={item.children}
                                    itemIdWithFocus={listIdWithFocus === item.parent.id ? itemIdWithFocus : null}
                                    onListRef={this.onListRef.bind(this)}
                                    onItemRef={this.onItemRef.bind(this)}
                                    onItemDragStart={this.onItemDragStart.bind(this)}
                                    onItemDrag={this.onItemDrag.bind(this)}
                                    onItemDragStop={this.onItemDragStop.bind(this)}
                                    overlappedItemId={this.props.dnd.overlappedItemId}
                                    overlappedItemPos={this.props.dnd.overlappedItemPos}
                                    onItemChange={this.props.updateItemText.bind(this)}
                                    onItemKeyUp={this.onItemKeyUp.bind(this)}
                                    onItemCheckboxChange={this.props.updateItemComplete.bind(this)}
                                    onItemFocus={this.onItemFocus.bind(this)}
                                />
                            </div>
                        )})
                    }
                </ReactGridLayout>
            </div>
        );
    }

    onItemKeyUp(itemId, parentId, event) {
        if (event.key === "Enter") {
            let currentItem = this.props.items.find(i => {return i.id === itemId});
            let currentItemParentMeta = currentItem.parents.find(parent => parent.id === parentId);
            this.props.createNewItemWithFocus(parentId, itemId, currentItemParentMeta.next);
        }
    }

    onItemFocus(itemId) {
        // If the item was given focus through state,
        // clear the state so that focus can now shift to
        // other elements again.
        if (this.props.focus.itemId !== null) {
            this.props.updateFocus()
        }
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
        this.props.updateDnd({'activeDragParentId': parentId});
    }

    onItemDrag(itemId) {
        // Update bound of dragged item
        let itemRef = this.itemRefsById[itemId];
        let itemBound = itemRef.getBoundingClientRect();
        this.itemBoundsById[itemId] = itemBound;

        // Find the currently overlapped list if any
        let overlappedListId = this.findCoveredId(itemId, itemBound, this.listBoundsById);
        if (this.props.dnd.overlappedListId !== overlappedListId) {
            this.props.updateDnd({'overlappedListId': overlappedListId});
        }

        if (overlappedListId) {
            let listItems = getChildrenItems(overlappedListId, this.props.items);
            let nearestItem = this.findNearestItem(itemId, listItems, this.itemBoundsById);
            this.props.updateDnd({
                'overlappedItemId': nearestItem.id,
                'overlappedItemPos': nearestItem.position
            });
        }
        else {
            this.props.updateDnd({
                'overlappedItemId': null,
                'overlappedItemPos': null
            });
        }
    }

    onItemDragStop(draggedItemId, currentListId) {
        let items = this.props.items.slice();
        let overlappedItemId = this.props.dnd.overlappedItemId;
        let overlappedItemPos = this.props.dnd.overlappedItemPos;
        let overlappedListId = this.props.dnd.overlappedListId;
        if (overlappedItemId) {
            // Find the dragged item's new prev and next
            let overlappedItem = items.find(item => item.id === overlappedItemId);
            let overlappedItemParent = overlappedItem.parents.find(parent => parent.id === overlappedListId);
            let draggedItemNewPrev = overlappedItemPos === 'above' ? overlappedItemParent.prev : overlappedItemId;
            let draggedItemNewNext = overlappedItemPos === 'above' ? overlappedItemId : overlappedItemParent.next;
            // Only insert dragged item into new position if the dragged item is
            // NOT the same as the new next or new prev item. If it is the same,
            // then we're dropping the item into the same place it was in.
            if (draggedItemId !== draggedItemNewPrev && draggedItemId !== draggedItemNewNext) {
                this.props.detachItemFromParent(draggedItemId, currentListId);
                this.props.attachItemToParent(
                    draggedItemId,
                    overlappedListId,
                    draggedItemNewPrev,
                    draggedItemNewNext
                );
            }
        }
        this.props.updateDnd({
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

export default App;
