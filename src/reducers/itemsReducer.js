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
    let incomingItem;
    Object.keys(incomingItems).forEach(incomingItemId => {
        incomingItem = incomingItems[incomingItemId];
        if (newItems[incomingItemId]) {
            // Item already exists. Just leave it where it is adn update its values.
            newItems = set(newItems, incomingItemId, 'value', incomingItem.value);
            newItems = set(newItems, incomingItemId, 'complete', incomingItem.complete);
            return;
        }

        if (Object.keys(incomingItem.parents).length <= 0) {
            // Item does not exist and is a parent. Can be added verbatim.
            newItems = set(newItems, incomingItemId, incomingItem);
            return;
        }

        // Item does not exist, and is a child. Add to top of list(s).
        Object.keys(incomingItem.parents).forEach(parentId => {
            let currentFirstItemId = Object.keys(newItems).find(id => {
                let item = newItems[id];
                return item.parents[parentId] && item.parents[parentId].prev === null
            });
            newItems = set(newItems, incomingItemId, incomingItem);
            newItems = attachItemToParent(incomingItemId, parentId, null, currentFirstItemId, newItems);
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