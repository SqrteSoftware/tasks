import React, {Component} from 'react';
import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import './App.css';
import List from '../List/List';

let itemStore = [
    {id: "item1", value: "test 1", pid: ""},
    {id: "item2", value: "test 2", pid: "item1"},
    {id: "item3", value: "test 3", pid: "item1"},
    {id: "item4", value: "test 4", pid: "item1"},
    {id: "item5", value: "test 5", pid: "item1"},

    {id: "item6", value: "test 6", pid: ""},
    {id: "item7", value: "test 7", pid: "item6"},
    {id: "item8", value: "test 8", pid: "item6"},
    {id: "item9", value: "test 9", pid: "item6"},
    {id: "item10", value: "test 10", pid: "item6"},

    {id: "item11", value: "test 11", pid: ""},
    {id: "item12", value: "test 12", pid: "item11"},
    {id: "item13", value: "test 13", pid: "item11"},
    {id: "item14", value: "test 14", pid: "item11"},
    {id: "item15", value: "test 15", pid: "item11"},

    {id: "item16", value: "test 16", pid: ""},
    {id: "item17", value: "test 17", pid: "item16"},
    {id: "item18", value: "test 18", pid: "item16"},
    {id: "item19", value: "test 19", pid: "item16"},
    {id: "item20", value: "test 10", pid: "item16"},

    {id: "item21", value: "test 21", pid: ""},
    {id: "item22", value: "test 22", pid: "item21"},
    {id: "item23", value: "test 23", pid: "item21"},
    {id: "item24", value: "test 24", pid: "item21"},
    {id: "item25", value: "test 25", pid: "item21"},

    {id: "item26", value: "test 26", pid: ""},
    {id: "item27", value: "test 27", pid: "item26"},
    {id: "item28", value: "test 28", pid: "item26"},
    {id: "item29", value: "test 29", pid: "item26"},
    {id: "item30", value: "test 30", pid: "item26"},
    {id: "item31", value: "test 31", pid: "item26"},
];


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

export default App;
