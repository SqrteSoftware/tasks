import React, {Component} from 'react';
import {Responsive, WidthProvider} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import './App.css';
import List from '../List';
import {createViewData, downloadJSON, disableTouchMove, enableTouchMove} from '../../utils';
import MobileMenu from "../Shared/MobileMenu";
import ToolBar from "../Shared/ToolBar";
import SyncDialog from "../Shared/SyncDialog";
import LicenseDialog from "../Shared/LicenseDialog";
import WelcomeDialog from "../Shared/WelcomeDialog";
import { findAdjacent } from '../../utils/order';


const ResponsiveGridLayout = WidthProvider(Responsive);

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
          "slidingMenuOpen": false,
          "syncModalOpen": false,
          "licenseModalOpen": props.license.paymentSession != null
        };
    }

    render() {
        let listData = createViewData(this.props.items);
        let listIdWithFocus = this.props.focus.parentId;
        let itemIdWithFocus = this.props.focus.itemId;
        let listSettings = this.props.lists || {};

        return (
            <div className="App">
                <ToolBar
                    isSyncing={this.props.sync.isSyncing}
                    onAddList={this.props.createNewParentItemWithFocus}
                    onExportData={this.onExportData}
                    onImportData={this.onImportData}
                    onSyncData={this.onSyncData}
                    onMenuClick={this.onMenuClick}
                />
                <MobileMenu
                    open={this.state.slidingMenuOpen}
                    onClose={this.onMenuClose}
                    onAddList={this.props.createNewParentItemWithFocus}
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
                <WelcomeDialog
                    open={this.props.dialogs.activeDialog === 'welcome'}
                    onClose={this.props.closeDialog}
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
                                    nearestItemId={this.props.dnd.nearestItemId}
                                    nearestItemPos={this.props.dnd.nearestItemPos}
                                    onItemKeyDown={this.onItemKeyDown}
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
        downloadJSON(state, 'sqrte-tasks-' + now + '.json');
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
            let adjacentItems = findAdjacent(currentItem.id, parentId, this.props.items)
            if (cursorPosition > 0 || itemValue.length === 0) {
                // Insert new item AFTER current item
                let nextId = adjacentItems.next?.id || null;
                this.props.createNewItemWithFocus(parentId, itemId, nextId);
            }
            else {
                // Insert new item BEFORE current item
                let prevId = adjacentItems.prev?.id || null;
                this.props.createNewItemWithFocus(parentId, prevId, itemId);
            }
        }
        else if (keyPressed === "Backspace" && itemValue === "") {
            let currentItem = this.props.items[itemId];
            let adjacentItems = findAdjacent(currentItem.id, parentId, this.props.items)
            let prevId = adjacentItems.prev?.id || null;
            this.props.removeItemFromParent(itemId, parentId);
            if (prevId !== null) {
                // If there's an item above the removed item, change focus to it.
                this.props.updateFocus(parentId, prevId);
                // If we don't prevent default action here, the cursor will
                // move up to the next item and delete the last character there.
                event.preventDefault();
            }
        }
    };
}

export default App;
