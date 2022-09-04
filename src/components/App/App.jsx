import React, {Component} from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import throttle from 'lodash/throttle'

import './App.css';
import List from '../List';
import {createViewData, getSortedListItems, downloadJSON, disableTouchMove, enableTouchMove} from '../../utils';
import MobileMenu from "../Shared/MobileMenu";
import ToolBar from "../Shared/ToolBar";
import SyncDialog from "../Shared/SyncDialog";
import LicenseDialog from "../Shared/LicenseDialog";


const ResponsiveGridLayout = WidthProvider(Responsive);

class App extends Component {

    constructor(props) {
        super(props);

        this.itemRefsById = {};
        this.itemBoundsById = {};

        this.listRefsById = {};
        this.listBoundsById = {};

        this.throttledUpdateBoundCache = throttle(this.updateBoundCache, 200);

        this.state = {
          "slidingMenuOpen": false,
          "syncModalOpen": false,
          "licenseModalOpen": props.license.paymentSession != null
        };
    }

    componentDidMount = () => {
        window.addEventListener('scroll', this.throttledUpdateBoundCache);
    };

    componentWillUnmount = () => {
        window.removeEventListener('scroll', this.throttledUpdateBoundCache);
    };

    render() {
        let listData = createViewData(this.props.items);
        let listIdWithFocus = this.props.focus.parentId;
        let itemIdWithFocus = this.props.focus.itemId;
        let listSettings = this.props.lists || {};

        return (
            <div className="App">
                <ToolBar
                    onAddList={this.props.createNewParentItem}
                    onExportData={this.onExportData}
                    onImportData={this.onImportData}
                    onSyncData={this.onSyncData}
                    onMenuClick={this.onMenuClick}
                />
                <MobileMenu
                    open={this.state.slidingMenuOpen}
                    onClose={this.onMenuClose}
                    onAddList={this.props.createNewParentItem}
                    onExportData={this.onExportData}
                    onImportData={this.onImportData}
                    onSyncData={this.onSyncData}
                />
                <SyncDialog
                    open={this.state.syncModalOpen}
                    user={this.props.user}
                    onClose={this.onSyncModalClose}
                    onCreateUserId={this.props.createUserId}
                    onDeleteUserId={this.props.deleteUserId}
                />
                <LicenseDialog
                    open={this.state.licenseModalOpen}
                    licenseKey={this.props.license.licenseKey}
                    onClose={this.onLicenseModalClose}
                />
                <ResponsiveGridLayout
                    className="layout"
                    rowHeight={30}
                    breakpoints={{xxs: 0, xs: 480, sm: 768, md: 996, lg: 1200}}
                    cols={{xxs: 2, xs: 6, sm: 6, md: 9, lg: 12,}}
                    layouts={this.props.layouts}
                    onLayoutChange={this.onLayoutChange.bind(this)}
                    onDragStart={ disableTouchMove }
                    onDragStop={ enableTouchMove }
                    draggableCancel=".noDrag">
                    {
                        listData.map(item => { return (
                            <div key={item.parent.id}
                                 className="App-list"
                                 style={this.props.dnd.activeDragParentId === item.parent.id ? {zIndex: 1} : {zIndex: 0}}>
                                <List
                                    parent={item.parent}
                                    firstChild={item.firstChild}
                                    children={item.children}
                                    history={item.history}
                                    itemIdWithFocus={listIdWithFocus === item.parent.id ? itemIdWithFocus : null}
                                    freezeScroll={this.shouldFreezeListScroll(item.parent.id)}
                                    settings={listSettings[item.parent.id]}
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
                                    onToggleCompleted={this.props.showCompletedItems}
                                    createNewItemWithFocus={this.props.createNewItemWithFocus}
                                />
                            </div>
                        )})
                    }
                </ResponsiveGridLayout>
                { listData.length <= 0 && this.entryMessage() }

            </div>
        );
    }

    shouldFreezeListScroll = (listId) => {
        // Freeze list scrolling when a list's item that is currently
        // being dragged is not over its parent list.
        return this.props.dnd.activeDragParentId === listId &&
            this.props.dnd.activeDragParentId !== this.props.dnd.overlappedListId;
    };

    entryMessage() {
        return (
            <h1 className="noListTip">
                Select the <span className="noWrap">"New List"</span> button to create a list
            </h1>
        )
    }

    onMenuClick = (e) => {
        this.setState({"slidingMenuOpen": true});
    };

    onMenuClose = (e) => {
        this.setState({"slidingMenuOpen": false});
    };

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

    onSyncData = (e) => {
        this.setState({"syncModalOpen": true})
    };

    onSyncModalClose = (e) => {
        this.setState({"syncModalOpen": false})
    };

    onLicenseModalClose = (e) => {
        this.setState({"licenseModalOpen": false})
        // Clear sensitive info on close
        this.props.deleteLicenseInfo();
        // Remove session info from URL
        window.history.replaceState(null, null, window.location.pathname)
    };

    onLayoutChange = (currentLayout, allLayouts) => {
        this.props.updateAllLayouts(allLayouts);
    };

    onItemKeyDown = (itemId, parentId, keyPressed, itemValue, cursorPosition, event) => {
        if (keyPressed === "Enter") {

            let currentItem = this.props.items[itemId];
            let currentItemParentMeta = currentItem.parents[parentId];
            if (cursorPosition > 0 || itemValue.length === 0) {
                // Insert new item AFTER current item
                this.props.createNewItemWithFocus(parentId, itemId, currentItemParentMeta.next);
            }
            else {
                // Insert new item BEFORE current item
                this.props.createNewItemWithFocus(parentId, currentItemParentMeta.prev, itemId);
            }
        }
        else if (keyPressed === "Backspace" && itemValue === "") {
            let currentItem = this.props.items[itemId];
            let currentItemParentMeta = currentItem.parents[parentId];
            this.props.removeItemFromParent(itemId, parentId);
            if (currentItemParentMeta.prev !== null) {
                // If there's an item above the removed item, change focus to it.
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
        this.updateBoundCache();

        let overlappedListId = this.getOverlappedListId(itemId, this.itemRefsById, this.listBoundsById);
        let listItems = getSortedListItems(overlappedListId, this.props.items);
        let nearestItem = this.findNearestItem(itemId, listItems, this.itemBoundsById);
        this.props.updateDnd({
            'activeDragParentId': parentId,
            'overlappedListId': overlappedListId,
            'nearestItemId': nearestItem.id,
            'nearestItemPos': nearestItem.position
        });
    };

    updateBoundCache = () => {
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
    };

    onItemDrag = (itemId) => {
        // Update bound of dragged item
        let itemRef = this.itemRefsById[itemId];
        let itemBound = itemRef.getBoundingClientRect();
        this.itemBoundsById[itemId] = itemBound;

        // Update bounds of items for currently overlapped list
        let overlappedListId = this.getOverlappedListId(itemId, this.itemRefsById, this.listBoundsById);
        let listItems = getSortedListItems(overlappedListId, this.props.items);
        this.updateItemBounds(listItems);

        let nearestItem = this.findNearestItem(itemId, listItems, this.itemBoundsById);
        this.props.updateDnd({
            'overlappedListId': overlappedListId,
            'nearestItemId': nearestItem.id,
            'nearestItemPos': nearestItem.position
        });
    };

    getOverlappedListId = (itemId, itemRefsById, listBoundsById) => {
        let itemRef = itemRefsById[itemId];
        let itemBound = itemRef.getBoundingClientRect();
        return this.findOverlappedBoundId(itemId, itemBound, listBoundsById);
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
            'activeDragParentId': null,
            'overlappedListId': null,
            'nearestItemId': null,
            'nearestItemPos': null
        });
    };

    onItemRef = (obj) => {
        if (obj.ref !== null) {
            this.itemRefsById[obj.id] = obj.ref;
        }
        else {
            delete this.itemRefsById[obj.id];
            delete this.itemBoundsById[obj.id];
        }
    };

    onListRef = (obj) => {
        if (obj.ref !== null) {
            this.listRefsById[obj.id] = obj.ref;
        }
        else {
            delete this.listRefsById[obj.id];
            delete this.listBoundsById[obj.id];
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
