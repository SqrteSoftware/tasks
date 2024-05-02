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
import { breakpointColumns, breakpointWidths } from '../../slices/layoutsSlice';
import { migrate } from '../../migrations';


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

        return (
            <div className="App">
                <ToolBar
                    isSyncing={this.props.sync.isSyncing}
                    onAddList={this.props.createNewParentItemWithFocus}
                    onExportData={this.onExportData}
                    onImportData={this.onImportData}
                    onSyncData={this.onSyncData}
                    onMenuClick={this.onMenuClick}
                    onCollapseAll={this.props.collapseLayout}
                    onExpandAll={this.props.expandLayout}
                />
                <MobileMenu
                    open={this.state.slidingMenuOpen}
                    onClose={this.onMenuClose}
                    onAddList={this.props.createNewParentItemWithFocus}
                    onExportData={this.onExportData}
                    onImportData={this.onImportData}
                    onSyncData={this.onSyncData}
                    onCollapseAll={this.props.collapseLayout}
                    onExpandAll={this.props.expandLayout}
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
                <WelcomeDialog />
                <ResponsiveGridLayout
                    className="layout"
                    rowHeight={50}
                    breakpoints={breakpointWidths}
                    cols={breakpointColumns}
                    layouts={this.props.layouts.breakpointLayouts}
                    onLayoutChange={this.onLayoutChange}
                    onDragStart={disableTouchMove}
                    onDragStop={enableTouchMove}
                    onWidthChange={this.onWidthChange}
                    draggableCancel=".noDrag">
                    {
                        listData.map(item => { return (
                            <div key={item.parent.id}
                                 className="App-list"
                                 style={this.props.dnd.activeDragParentId === item.parent.id ? {zIndex: 1} : {zIndex: 0}}>
                                <List
                                    parent={item.parent}
                                    listItems={item.listItems}
                                    activeListItems={item.activeListItems}
                                    completedListItems={item.completedListItems}
                                    itemIdWithFocus={listIdWithFocus === item.parent.id ? itemIdWithFocus : null}
                                    freezeScroll={this.shouldFreezeListScroll(item.parent.id)}
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
        let state = {
            schema: this.props.schema,
            items: this.props.items,
            layouts: this.props.layouts,
            lists: this.props.lists,
        }
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
                    // Migrate imported data as necessary
                    data = migrate(data)
                    // Load the data into memory
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

    onWidthChange = (width) => {
        this.props.widthChanged(width)
    }
}

export default App;
