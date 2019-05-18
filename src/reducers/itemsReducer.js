import {createItem, set} from "../utils";

export function items(state = {}, action) {
    let items = state;
    switch (action.type) {
        case 'UPDATE_ITEM_TEXT':
            return set(items, action.itemId, 'value', action.text);
        case 'UPDATE_ITEM_COMPLETE':
            return set(items, action.itemId, 'complete', action.complete);
        case 'CREATE_NEW_ITEM_WITH_FOCUS':
            let newItem = createItem(action.newItemId);
            items = set(items, newItem.id, newItem);
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
        case 'DELETE_ITEM':
            return deleteItem(action.itemId, items);
        case 'CREATE_NEW_PARENT_ITEM_WITH_FOCUS':
            return createNewParentItem(
                state,
                action.newParentItemId,
                action.newChildItemId
            );
        case 'SYNC_ITEMS':
            return mergeItems(state, action.items);
        case 'REPAIR_ITEM_LINKS':
            return repairItemLinks(state);
        default:
            return state;
    }
}

function attachItemToParent(itemId, parentId, prevItemId, nextItemId, items) {
    // Add new parent to item
    let newParent = {id: parentId, prev: prevItemId, next: nextItemId};
    items = set(items, itemId, 'parents', parentId, newParent);
    // Find previous item and mutate parent to point to inserted item
    if (prevItemId) {
        items = set(items, prevItemId, 'parents', parentId, 'next', itemId);
    }
    // Find next item and mutate parent to point to inserted item
    if (nextItemId) {
        items = set(items, nextItemId, 'parents', parentId, 'prev', itemId);
    }
    return items;
}

function detachItemFromParent(itemId, parentId, items) {
    let item = items[itemId];
    let itemParent = item.parents[parentId];
    let oldPrevItem = items[itemParent.prev];
    let oldNextItem = items[itemParent.next];
    // Remove parent from item
    let newParents = {...item.parents};
    delete newParents[parentId];
    items = set(items, itemId, 'parents', newParents);
    // Remove item from prev item and attach next item instead
    if (oldPrevItem) {
        let newNextId = oldNextItem ? oldNextItem.id : null;
        items = set(items, oldPrevItem.id, 'parents', parentId, 'next', newNextId);
    }
    // Remove item from next item and attach prev item instead
    if (oldNextItem) {
        let newPrevId = oldPrevItem ? oldPrevItem.id : null;
        items = set(items, oldNextItem.id, 'parents', parentId, 'prev', newPrevId);
    }
    return items;
}

function removeItemFromParent(itemId, parentId, items) {
    items = detachItemFromParent(itemId, parentId, items);
    // Delete the item if it now has 0 parents
    if (Object.keys(items[itemId].parents).length <= 0) {
        delete items[itemId];
    }
    return items;
}

function deleteItem(itemId, items) {
    items = {...items};
    // If this item has any children, detach them
    // all and delete them if they have no other parents
    Object.keys(items).forEach(id =>{
        let i = items[id];
        if (i.parents.hasOwnProperty(itemId)) {
            let newParents = {...i.parents};
            delete newParents[itemId];
            if (Object.keys(newParents).length > 0) {
                items[id] = {...i, parents: newParents};
            } else {
                delete items[id];
            }

        }
    });
    // Delete the item
    delete items[itemId];
    return items;
}

function createNewParentItem(items, newParentItemId, newChildItemId) {
    let newParentItem = createItem(newParentItemId);
    let newChildItem = createItem(newChildItemId);
    items = set(items, newParentItemId, newParentItem);
    items = set(items, newChildItemId, newChildItem);
    items = attachItemToParent(newChildItemId, newParentItemId, null, null, items);
    return items;
}

function mergeItems(currentItems, incomingItems) {
    let newItems = currentItems;
    let incomingItem, parent;
    Object.keys(incomingItems).forEach(incomingItemId => {
        incomingItem = incomingItems[incomingItemId];
        Object.keys(incomingItem.parents).forEach(parentId => {
            parent = incomingItem.parents[parentId];
            let prevItem = currentItems[parent.prev];
            let nextItem = currentItems[parent.next];
            let prevItemId = prevItem ? prevItem.id : null;
            let nextItemId = nextItem ? nextItem.id : null;
            let prevNextId = prevItem ? prevItem.parents[parentId].next : null;
            let nextPrevId = nextItem ? nextItem.parents[parentId].prev : null;

            if (prevItemId === null) {
                let currentFirstItemId = Object.keys(currentItems).find(id => {
                    let item = currentItems[id];
                    return item.parents[parentId] && item.parents[parentId].prev === null
                });
                newItems = attachItemToParent(
                    incomingItemId, parentId, prevItemId, currentFirstItemId, newItems);
            }
            else if (nextItemId === null) {
                let currentLastItemId = Object.keys(currentItems).find(id => {
                    let item = currentItems[id];
                    return item.parents[parentId] && item.parents[parentId].next === null
                });
                newItems = attachItemToParent(
                    incomingItemId, parentId, currentLastItemId, nextItemId, newItems);
            }
            else if (prevNextId === nextItemId && nextPrevId === prevItemId) {
                // Item needs to be inserted between two already connected items
                newItems = attachItemToParent(
                    incomingItemId, parentId, prevItem.id, nextItem.id, newItems);
            }
            else if (prevNextId === incomingItemId && nextPrevId === incomingItemId) {
                // Both prevNextId and nextPrevId are already pointing at the incoming item.
                // Just insert the item directly into the list to update its other values.
                newItems = set(newItems, incomingItemId, incomingItem);
            }
            else if (prevNextId === incomingItemId) {
                // Insert incoming item between prev and prev's next.
                newItems = attachItemToParent(
                    incomingItemId, parentId, prevItem.id, prevItem.next, newItems);
            }
            else if (nextPrevId === incomingItemId) {
                // Insert incoming item between next and next's prev.
                newItems = attachItemToParent(
                    incomingItemId, parentId, nextItem.id, nextItem.prev, newItems);
            }
            else {
                // The prev/next items are not connected to each other and are not
                // already connected in any way to the incoming item. Since the incoming
                // item claims relation to both, we must pick which to associate it with.
                // By convention, we will insert the incoming item between prev and prev's next.
                newItems = attachItemToParent(
                    incomingItemId, parentId, prevItem.id, prevItem.next, newItems);
            }

        });
    });
    return newItems;
}

function repairItemLinks(items) {
    items = {...items};
    let itemsByParent = {};

    Object.keys(items).forEach(itemId => {
        let item = items[itemId];
        if (Object.keys(item.parents).length <= 0) {
            if (itemsByParent[item.id]) {
                itemsByParent[item.id].parent = item;
            }
            else {
                itemsByParent[item.id] = {
                    'parent': item,
                    'children': []
                };
            }
        }
        else {
            Object.keys(item.parents).forEach(parentItemId => {
                if (itemsByParent[parentItemId]) {
                    itemsByParent[parentItemId].children.push(item);
                }
                else {
                    itemsByParent[parentItemId] = {
                        'parent': null,
                        'children': [item]
                    };
                }
            })
        }
    });

    Object.keys(itemsByParent).forEach(parentId => {
        let lastChild = null;
        itemsByParent[parentId].children.forEach(child => {
            if (lastChild) {
                child.parents[parentId].prev = lastChild.id;
                lastChild.parents[parentId].next = child.id;
            }
            else {
                child.parents[parentId].prev = null;
            }
            child.parents[parentId].next = null;
            lastChild = child;
        });
    });

    return items;
}