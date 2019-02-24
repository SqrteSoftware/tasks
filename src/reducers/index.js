import {combineReducers} from "redux";
import {createItem} from "../utils";


function items(state = [], action) {
    switch (action.type) {
        case 'UPDATE_ITEM_TEXT':
            return state.map(item => {
                if (item.id === action.itemId) {
                    return {...item, value: action.text}
                }
                return item;
            });
        case 'UPDATE_ITEM_COMPLETE':
            return state.map(item => {
                if (item.id === action.itemId) {
                    return {...item, complete: action.complete}
                }
                return item;
            });
        case 'CREATE_NEW_ITEM_WITH_FOCUS':
            let items = state.slice();
            let newItem = createItem(action.id);
            newItem.id = action.newItemId;
            // Add new item to primary list
            items.push(newItem);
            // Add parent to new item
            newItem.parents.push({
                id: action.parentItemId,
                prev: action.prevItemId,
                next: action.nextItemId
            });
            // Find and point previous item to new item
            if (action.prevItemId !== null) {
                let prevItemIndex = items.findIndex(item => item.id === action.prevItemId);
                let prevItem = clone(items[prevItemIndex]);
                let prevItemParentMeta = prevItem.parents.find(parent => parent.id === action.parentItemId);
                prevItemParentMeta.next = newItem.id;
                items[prevItemIndex] = prevItem;
            }
            // Find and point next item to new item
            if (action.nextItemId !== null) {
                let nextItemIndex = items.findIndex(item => item.id === action.nextItemId);
                let nextItem = clone(items[nextItemIndex]);
                let nextItemParentMeta = nextItem.parents.find(parent => parent.id === action.parentItemId);
                nextItemParentMeta.prev = newItem.id;
                items[nextItemIndex] = nextItem;
            }
            return items;
        default:
            return state;
    }
}

function focus(state = {'parentId': null, 'itemId': null}, action) {
    switch (action.type) {
        case 'UPDATE_FOCUS':
            return Object.assign({}, {
                'parentId': action.parentId,
                'itemId': action.itemId
            });
        case 'CREATE_NEW_ITEM_WITH_FOCUS':
            return Object.assign({}, {
                'parentId': action.parentItemId,
                'itemId': action.newItemId
            });
        default:
            return state;
    }
}

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

const rootReducer = combineReducers({
    items,
    focus
});

export default rootReducer;