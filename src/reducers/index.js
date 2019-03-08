import {combineReducers} from "redux";
import {createItem} from "../utils";


function items(state = [], action) {
    let items = state;
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
            items = state.slice();
            let newItem = createItem(action.id);
            newItem.id = action.newItemId;
            // Add new item to primary list
            items.push(newItem);
            return attachItemToParent(
                action.newItemId,
                action.parentItemId,
                action.prevItemId,
                action.nextItemId,
                items
            );
        case 'MOVE_ITEM':
            items = detachItemFromParent(
                action.itemId,
                action.oldParentId,
                items
            );
            items = attachItemToParent(
                action.itemId,
                action.newParentId,
                action.newPrevItemId,
                action.newNextItemId,
                items
            );
            return items;
        case 'REMOVE_ITEM_FROM_PARENT':
            return removeItemFromParent(action.itemId, action.parentId, state);
        default:
            return state;
    }
}

function removeItemFromParent(itemId, parentId, items) {
    items = detachItemFromParent(itemId, parentId, items);
    // Delete the item if it now has 0 parents
    items = items.filter(i => i.id !== itemId || i.parents.length > 0);
    return items;
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
    let newParents = item.parents.filter(p => p.id !== parentId);
    items = items.map(i =>
        i.id === item.id ? {...i, parents: newParents} : i);
    return items;
}

function attachItemToParent(itemId, parentId, prevItemId, nextItemId, items) {
    // Add new parent to item
    let item = clone(items.find(i => i.id === itemId));
    item.parents.push({id: parentId, prev: prevItemId, next: nextItemId});
    items = items.map(i => i.id === itemId ? item : i);
    // Find previous item and mutate parent to point to inserted item
    if (prevItemId) {
        let prevItem = clone(items.find(i => i.id === prevItemId));
        let newParents = prevItem.parents.map(p =>
            (p.id === parentId && p.next === nextItemId) ? {...p, next: itemId} : p);
        items = items.map(i =>
            i.id === prevItemId ? {...i, parents: newParents} : i);
    }
    // Find next item and mutate parent to point to inserted item
    if (nextItemId) {
        let nextItem = clone(items.find(i => i.id === nextItemId));
        let newParents = nextItem.parents.map(p =>
            (p.id === parentId && p.prev === prevItemId) ? {...p, prev: itemId} : p);
        items = items.map(i =>
            i.id === nextItemId ? {...i, parents: newParents} : i);
    }
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