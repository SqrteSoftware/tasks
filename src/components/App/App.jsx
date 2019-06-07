import React, {Component} from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faDownload, faUpload, faPlusSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './App.css';
import List from '../List';
import { createViewData, getChildrenItems, downloadJSON } from '../../utils';
import logo from '../../braindump90.png'

// FontAwesome
library.add(faDownload);
library.add(faUpload);
library.add(faPlusSquare);

const ResponsiveGridLayout = WidthProvider(Responsive);

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
        let listData = createViewData(this.props.items);
        let listIdWithFocus = this.props.focus.parentId;
        let itemIdWithFocus = this.props.focus.itemId;
        return (
            <div className="App">
                <div className="sidebar">
                    <img className="logo" alt="logo" src={logo}/>
                    <div className="add iconButton" title="Add a List" onClick={this.props.createNewParentItem.bind(this)}>
                        <FontAwesomeIcon icon="plus-square"/>
                    </div>
                    <div className="export iconButton" title="Export Data" onClick={this.onExportData.bind(this)}>
                        <FontAwesomeIcon icon="download"/>
                    </div>
                    <div className="import iconButton" title="Import Data" onClick={this.onImportData.bind(this)}>
                        <label className="importLabel">
                            <input className="importInput" type="file" onChange={this.onImportData.bind(this)}/>
                            <FontAwesomeIcon icon="upload"/>
                        </label>
                    </div>
                </div>
                <ResponsiveGridLayout
                    className="layout"
                    rowHeight={30}
                    breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
                    cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}
                    layouts={this.props.layouts}
                    onLayoutChange={this.onLayoutChange.bind(this)}
                    draggableCancel=".noDrag">
                    {
                        listData.map(item => { return (
                            <div key={item.parent.id}
                                 className="App-list"
                                 style={this.props.dnd.activeDragParentId === item.parent.id ? {zIndex: 1} : {zIndex: 0}}>
                                <List
                                    parent={item.parent}
                                    children={item.children}
                                    history={item.history}
                                    itemIdWithFocus={listIdWithFocus === item.parent.id ? itemIdWithFocus : null}
                                    onListRef={this.onListRef}
                                    onItemRef={this.onItemRef}
                                    onItemDragStart={this.onItemDragStart}
                                    onItemDrag={this.onItemDrag}
                                    onItemDragStop={this.onItemDragStop}
                                    nearestItemId={this.props.dnd.nearestItemId}
                                    nearestItemPos={this.props.dnd.nearestItemPos}
                                    onItemChange={this.props.updateItemText}
                                    onItemKeyDown={this.onItemKeyDown}
                                    onItemCheckboxChange={this.props.updateItemComplete}
                                    onItemFocus={this.onItemFocus}
                                    onDeleteList={this.props.deleteItem}
                                />
                            </div>
                        )})
                    }
                </ResponsiveGridLayout>
            </div>
        );
    }

    onExportData = (e) => {
        let state = {items: this.props.items, layouts: this.props.layouts};
        let now = Date.now();
        downloadJSON(state, 'braindump-backup-' + now + '.json');
    };

    onImportData = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            let file = e.target.files[0];
            if (file.type === "application/json") {
                let fileReader = new FileReader();
                fileReader.onload = e => {
                    let data = JSON.parse(e.target.result);
                    this.props.loadData(data);
                };
                fileReader.readAsText(file);
            }
            e.target.value = "";
        }
    };

    onLayoutChange = (currentLayout, allLayouts) => {
        this.props.updateAllLayouts(allLayouts);
    };

    onItemKeyDown = (itemId, parentId, event) => {
        if (event.key === "Enter") {
            let currentItem = this.props.items[itemId];
            let currentItemParentMeta = currentItem.parents[parentId];
            this.props.createNewItemWithFocus(parentId, itemId, currentItemParentMeta.next);
        }
        else if (event.key === "Backspace" && event.target.value === "") {
            let currentItem = this.props.items[itemId];
            let currentItemParentMeta = currentItem.parents[parentId];
            this.props.removeItemFromParent(itemId, parentId);
            if (currentItemParentMeta.prev !== null) {
                this.props.updateFocus(parentId, currentItemParentMeta.prev);
                // If we don't prevent default action here, the cursor will
                // move up to the next item and delete the last character there.
                event.preventDefault();
            }
        }
    };

    onItemFocus = (itemId) => {
        // If the item was given focus through state,
        // clear the state so that focus can now shift to
        // other elements again.
        if (this.props.focus.itemId !== null) {
            this.props.updateFocus();
        }
    };

    onItemDragStart = (itemId, parentId) => {
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

        this.setNearestItem(itemId);
    };

    onItemDrag = (itemId) => {
        // Update bound of dragged item
        let itemRef = this.itemRefsById[itemId];
        let itemBound = itemRef.getBoundingClientRect();
        this.itemBoundsById[itemId] = itemBound;

        this.setNearestItem(itemId);
    };

    setNearestItem = (itemId) => {
        let itemRef = this.itemRefsById[itemId];
        let itemBound = itemRef.getBoundingClientRect();

        // Find the currently overlapped list if any
        let overlappedListId = this.findOverlappedBoundId(itemId, itemBound, this.listBoundsById);
        if (this.props.dnd.overlappedListId !== overlappedListId) {
            this.props.updateDnd({'overlappedListId': overlappedListId});
        }

        if (overlappedListId) {
            let listItems = getChildrenItems(overlappedListId, this.props.items);
            this.updateItemBounds(listItems);
            let nearestItem = this.findNearestItem(itemId, listItems, this.itemBoundsById);
            this.props.updateDnd({
                'nearestItemId': nearestItem.id,
                'nearestItemPos': nearestItem.position
            });
        }
        else {
            this.props.updateDnd({
                'nearestItemId': null,
                'nearestItemPos': null
            });
        }
    };

    updateItemBounds(items) {
        items.forEach(item => {
            let itemRef = this.itemRefsById[item.id];
            this.itemBoundsById[item.id] = itemRef.getBoundingClientRect();
        });
    }

    onItemDragStop = (draggedItemId, currentListId) => {
        let nearestItemId = this.props.dnd.nearestItemId;
        let nearestItemPos = this.props.dnd.nearestItemPos;
        let overlappedListId = this.props.dnd.overlappedListId;
        if (nearestItemId) {
            // Find the dragged item's new prev and next
            let nearestItem = this.props.items[nearestItemId];
            let nearestItemParent = nearestItem.parents[overlappedListId];
            let draggedItemNewPrev = nearestItemPos === 'above' ? nearestItemParent.prev : nearestItemId;
            let draggedItemNewNext = nearestItemPos === 'above' ? nearestItemId : nearestItemParent.next;
            // Only insert dragged item into new position if the dragged item is
            // NOT the same as the new next or new prev item. If it is the same,
            // then we're dropping the item into the same place it was in.
            if (draggedItemId !== draggedItemNewPrev &&
                draggedItemId !== draggedItemNewNext) {
                this.props.moveItem(
                    draggedItemId,
                    currentListId,
                    overlappedListId,
                    draggedItemNewPrev,
                    draggedItemNewNext
                );
            }
        }
        this.props.updateDnd({
            'nearestItemId': null,
            'activeDragParentId': null
        });
    };

    onItemRef = (obj) => {
        if (obj.ref !== null) {
            this.itemRefsById[obj.id] = obj.ref;
        }
        else {
            delete this.itemRefsById[obj.id];
        }
    };

    onListRef = (obj) => {
        if (obj.ref !== null) {
            this.listRefsById[obj.id] = obj.ref;
        }
        else {
            delete this.listRefsById[obj.id];
        }
    };

    findOverlappedBoundId(hoverId, hoverBound, boundsById) {
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
                nearestItem.position = draggedMidY <= itemMidY ? 'above' : 'below';
            }
        });
        return nearestItem;
    }
}

export default App;
