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
    let newParent = {
        id: parentId ? parentId : null,
        prev: prevItemId ? prevItemId : null,
        next: nextItemId ? nextItemId : null
    };
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
    let incomingItem, incomingItemParent, incomingItemParentIds;
    Object.keys(incomingItems).forEach(incomingItemId => {
        incomingItem = incomingItems[incomingItemId];
        incomingItemParentIds = Object.keys(incomingItem.parents);

        if (incomingItemParentIds.length <= 0) {
            // Root items have no references and need no further processing
            newItems = set(newItems, incomingItemId, incomingItem);
            return;
        }

        incomingItemParentIds.forEach(parentId => {
            incomingItemParent = incomingItem.parents[parentId];
            let incomingItemPrev = newItems[incomingItemParent.prev];
            let incomingItemNext = newItems[incomingItemParent.next];

            if (newItems[incomingItemId] !== undefined) {
                // The incoming item already exists in the current list.
                // Detach it from the current parent list so it can move around.
                newItems = detachItemFromParent(incomingItemId, parentId, newItems);
            }

            // SCENARIO: Incoming item specifies null prev peer.
            // ACTION: Make incoming item new FIRST item in list.
            if (incomingItemParent.prev === null) {
                let currentFirstItemId = Object.keys(newItems).find(id => {
                    let item = newItems[id];
                    return item.parents[parentId] && item.parents[parentId].prev === null
                });
                newItems = set(newItems, incomingItemId, incomingItem);
                newItems = attachItemToParent(
                    incomingItemId, parentId, null, currentFirstItemId, newItems);
                return;
            }

            // SCENARIO: Incoming item specifies null next peer.
            // ACTION: Make incoming item new LAST item in list.
            if (incomingItemParent.next === null) {
                let currentLastItemId = Object.keys(newItems).find(id => {
                    let item = newItems[id];
                    return item.parents[parentId] && item.parents[parentId].next === null
                });
                newItems = set(newItems, incomingItemId, incomingItem);
                newItems = attachItemToParent(
                    incomingItemId, parentId, currentLastItemId, null, newItems);
                return;
            }

            // SCENARIO: Incoming item specifies non-null peers that don't exist in list yet
            // ACTION: Make incoming item the arbitrarily FIRST item in list.
            if (incomingItemPrev === undefined && incomingItemNext === undefined) {
                let currentFirstItemId = Object.keys(newItems).find(id => {
                    let item = newItems[id];
                    return item.parents[parentId] && item.parents[parentId].prev === null
                });
                newItems = set(newItems, incomingItemId, incomingItem);
                newItems = attachItemToParent(
                    incomingItemId, parentId, null, currentFirstItemId, newItems);
                return;
            }

            // SCENARIO: Incoming item specifies non-null peers but only the next peer exists.
            // ACTION: Insert incoming item between its next peer and next's prev.
            if (incomingItemPrev === undefined) {
                let nextPrevId = incomingItemNext.parents[parentId].prev;
                newItems = set(newItems, incomingItemId, incomingItem);
                newItems = attachItemToParent(
                    incomingItemId, parentId, nextPrevId, incomingItemNext.id, newItems);
                return;
            }

            // SCENARIO: Incoming item specifies non-null peers but only the prev peer exists.
            // ACTION: Insert incoming item between its prev peer and prev's next.
            if (incomingItemNext === undefined) {
                // Only prev peers exists. Insert between prev peer and its adjacent peer.
                let prevNextId = incomingItemPrev.parents[parentId].next;
                newItems = set(newItems, incomingItemId, incomingItem);
                newItems = attachItemToParent(
                    incomingItemId, parentId, incomingItemPrev.id, prevNextId, newItems);
                return;
            }

            // SCENARIO: Incoming item already exists between its existing peers.
            // ACTION: Simply reattach incoming item and update in place.
            if (incomingItemPrev.parents[parentId].next === incomingItem.id &&
                     incomingItemNext.parents[parentId].prev === incomingItem.id) {
                newItems = set(newItems, incomingItemId, incomingItem);
                newItems = attachItemToParent(
                    incomingItemId, parentId, incomingItemParent.prev, incomingItemParent.next, newItems);
                return;
            }

            // SCENARIO: Incoming item both exist and are adjacent
            // ACTION: Insert incoming item in between peers.
            if (incomingItemPrev.parents[parentId].next === incomingItemNext.id &&
                     incomingItemNext.parents[parentId].prev === incomingItemPrev.id) {
                newItems = set(newItems, incomingItemId, incomingItem);
                newItems = attachItemToParent(
                    incomingItemId, parentId, incomingItemPrev.id, incomingItemNext.id, newItems);
                return;
            }

            // SCENARIO: Both peers exist, but are not adjacent.
            // ACTION: Arbitrarily insert incoming item between prev and prev's next.
            let prevNextId = incomingItemPrev.parents[parentId].next;
            newItems = set(newItems, incomingItemId, incomingItem);
            newItems = attachItemToParent(
                incomingItemId, parentId, incomingItemPrev.id, prevNextId, newItems);
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