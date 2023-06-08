import {createItem, getFirstItemInList, set} from "../utils";
import { ITEM_ORDER_SPACING, reposition } from "../utils/order";

export function items(state = {}, action) {
    let items = state;
    switch (action.type) {
        case 'UPDATE_ITEM_TEXT':
            return updateItemText(items, action.itemId, action.text);
        case 'UPDATE_ITEM_COMPLETE':
            if (!action.complete) {
                Object.keys(items[action.itemId].parents).forEach(parentId => {
                    items = moveItemToTop(action.itemId, parentId, items);
                });
            }
            items = setItem(items, action.itemId, 'complete', action.complete);
            items = setItem(items, action.itemId, 'completeDate', action.completeDate);
            return items;
        case 'CREATE_NEW_ITEM_WITH_FOCUS':
            let newItem = createItem(action.newItemId);
            items = setItem(items, newItem.id, newItem);
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
            return mergeItems(items, action.items);
        default:
            return state;
    }
}


function updateItemText(items, itemId, text) {
    if (items[itemId] === undefined) return items;
    items = setItem(items, itemId, 'value', text);
    return items;
}


function moveItemToTop(itemId, parentId, items) {
    items = detachItemFromParent(
        itemId,
        parentId,
        items
    );
    let firstItem = getFirstItemInList(parentId, items);
    items = attachItemToParent(
        itemId,
        parentId,
        null,
        firstItem.id,
        items
    );
    return items;
}


function attachItemToParent(itemId, parentId, prevItemId, nextItemId, items) {

    let freeSpace = getSpaceBetweenItems(prevItemId, nextItemId, parentId, items);
    if (freeSpace <= 0) {
        items = repositionItems(prevItemId, nextItemId, parentId, items);
    }
    let newItemOrder = getInsertionPoint(prevItemId, nextItemId, parentId, items);

    // Add new parent to item
    let newParent = {
        id: parentId ? parentId : null,
        order: newItemOrder
    };
    items = setItem(items, itemId, 'parents', parentId, newParent);
    return items;
}


function getSpaceBetweenItems(itemPrevId, itemNextId, parentId, items) {
    if (itemPrevId === null || itemNextId === null) {
        return ITEM_ORDER_SPACING;
    }

    let prevItem = items[itemPrevId];
    let nextItem = items[itemNextId];

    let prevItemOrder = prevItem.parents[parentId].order;
    let nextItemOrder = nextItem.parents[parentId].order;

    let freeSpace = Math.abs(nextItemOrder - prevItemOrder) - 1;

    return freeSpace;
}


function getInsertionPoint(itemPrevId, itemNextId, parentId, items) {
    let prevItem = items[itemPrevId];
    let nextItem = items[itemNextId];

    if (prevItem === undefined && nextItem === undefined) {
        return 0;
    }
    if (prevItem === undefined) {
        return nextItem.parents[parentId].order - ITEM_ORDER_SPACING;
    }
    if (nextItem === undefined) {
        return prevItem.parents[parentId].order + ITEM_ORDER_SPACING;
    }

    let prevItemOrder = prevItem.parents[parentId].order;
    let nextItemOrder = nextItem.parents[parentId].order;
    let insertionPoint = Math.floor((prevItemOrder + nextItemOrder) / 2);
    return insertionPoint;
}


function repositionItems(prevItemId, nextItemId, parentId, items) {
    let listItems = [];
    Object.keys(items).forEach(itemId => {
        let item = items[itemId];
        if (item.parents[parentId] !== undefined) {
            listItems.push({
                id: item.id,
                order: item.parents[parentId].order
            })
        }
    });

    let spacedListItems = reposition(listItems);

    spacedListItems.forEach(item => {
        items = setItem(items, item.id, 'parents', parentId, 'order', item.order);
    });

    return items;
}


function detachItemFromParent(itemId, parentId, items) {
    let item = items[itemId];
    let itemParent = item.parents[parentId];
    if (itemParent === undefined) return;
    // Remove parent from item
    let newParents = {...item.parents};
    delete newParents[parentId];
    items = setItem(items, itemId, 'parents', newParents);
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
                items = setItem(items, id, 'parents', newParents)
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
    items = setItem(items, newParentItemId, newParentItem);
    items = setItem(items, newChildItemId, newChildItem);
    items = attachItemToParent(newChildItemId, newParentItemId, null, null, items);
    return items;
}


function mergeItems(currentItems, incomingItems) {
    let modifiedItems = currentItems;
    incomingItems.forEach(incomingItem => {
        let currentItem = currentItems[incomingItem.id];
        if (incomingItem.deleted) {
            modifiedItems = deleteItem(incomingItem.id, modifiedItems);
        }
        else if (currentItem === undefined) {
            // New item
            modifiedItems = set(modifiedItems, incomingItem.id, incomingItem);
        }
        else if (incomingItem.modifiedDate > currentItem.modifiedDate) {
            // Update item if incoming version is more recently modified
            modifiedItems = set(modifiedItems, incomingItem.id, incomingItem);
        }
    });
    return modifiedItems;
}


function setItem(items, itemId, ...args) {
    items = set(items, itemId, ...args);
    items = set(items, itemId, 'modifiedDate', new Date().toISOString());
    return items;
}