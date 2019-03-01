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
        case 'DETACH_ITEM_FROM_PARENT':
            return detachItemFromParent(action.itemId, action.parentId, state);
        default:
            return state;
    }
}

function detachItemFromParent(itemId, parentId, items) {
    let item = items.find(i => i.id === itemId);
    let itemParent = item.parents.find(p => p.id === parentId);
    let oldPrevItem = items.find(i => i.id === itemParent.prev);
    let oldNextItem = items.find(i => i.id === itemParent.next);
    // Remove item from prev item and attach next item instead
    if (oldPrevItem) {
        let newNextId = oldNextItem ? oldNextItem.id : null;
        let newParents = oldPrevItem.parents.map(p =>
            p.id === parentId ? {...p, next: newNextId} : p);
        items = items.map(i =>
            i.id === oldPrevItem.id ? {...i, parents: newParents} : i);
    }
    // Remove item from next item and attach prev item instead
    if (oldNextItem) {
        let newPrevId = oldPrevItem ? oldPrevItem.id : null;
        let newParents = oldNextItem.parents.map(p =>
            p.id === parentId ? {...p, prev: newPrevId} : p);
        items = items.map(i =>
            i.id === oldNextItem.id ? {...i, parents: newParents} : i);
    }
    // Remove old parent from item
    let newParents = oldNextItem.parents.filter(p => p.id !== parentId);
    items = items.map(i =>
        i.id === item.id ? {...i, parents: newParents} : i);
    return items;
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

function dnd(state = {
    'activeDragParentId': null,
    'overlappedListId': null,
    'overlappedItemId': null,
    'overlappedItemPos': null
}, action) {
    switch (action.type) {
        case 'UPDATE_DND':
            return {
                ...state,
                ...action.values
            };
        default:
            return state;
    }
}

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

const rootReducer = combineReducers({
    items,
    focus,
    dnd
});

export default rootReducer;