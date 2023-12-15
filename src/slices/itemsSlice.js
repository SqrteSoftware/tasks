import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';

import {createItem, getFirstItemInList, set} from "../utils";
import { ITEM_ORDER_SPACING, reposition } from "../utils/order";


const initialState = {}

const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        updateItemText: {
            reducer: (items, action) => {
                const {itemId, text} = action.payload
                if (items[itemId] === undefined) return
                items[itemId].value = text
                items[itemId].modifiedDate = new Date().toISOString()
            },
            prepare: (itemId, text) => ({
                payload: { itemId, text }
            })
        },
        updateItemComplete: {
            reducer: (items, action) => {
                const { itemId, complete, completeDate } = action.payload
                if (!complete) {
                    Object.keys(items[itemId].parents).forEach(parentId => {
                        items = moveItemToTop(itemId, parentId, items);
                    });
                }
                items = setItem(items, itemId, 'complete', complete);
                items = setItem(items, itemId, 'completeDate', completeDate);
                return items
            },
            prepare: (itemId, complete, completeDate = new Date().toISOString()) => ({
                payload: {
                    itemId,
                    complete,
                    completeDate: complete ? completeDate : null
                }
            })
        },
        createNewItemWithFocus: {
            reducer: (items, action) => {
                const {
                    newItemId,
                    parentItemId,
                    prevItemId,
                    nextItemId
                } = action.payload
                let newItem = createItem(newItemId)
                items = setItem(items, newItem.id, newItem)
                return attachItemToParent(
                    newItemId, parentItemId, prevItemId, nextItemId, items)
            },
            prepare: (parentItemId, prevItemId, nextItemId) => ({
                payload: {
                    newItemId: "item-" + uuidv4(),
                    parentItemId,
                    prevItemId,
                    nextItemId
                 }
            })
        },
        moveItem: {
            reducer: (items, { payload }) => {
                items = detachItemFromParent(
                    payload.itemId,
                    payload.oldParentId,
                    items
                );
                items = attachItemToParent(
                    payload.itemId,
                    payload.newParentId,
                    payload.newPrevItemId,
                    payload.newNextItemId,
                    items
                );
                return items;
            },
            prepare: (itemId, oldParentId, newParentId, newPrevItemId, newNextItemId) => ({
                payload: {
                    itemId,
                    oldParentId,
                    newParentId,
                    newPrevItemId,
                    newNextItemId
                }
            })
        },
        removeItemFromParent: {
            reducer: (items, { payload }) => {
                return handleRemoveItemFromParent(
                    payload.itemId, payload.parentId, items)
            },
            prepare: (itemId, parentId) => ({
                payload: {
                    itemId,
                    parentId
                }
            })
        },
        deleteItem: {
            reducer: (items, { payload }) => {
                return handleDeleteItem(payload.itemId, items)
            },
            prepare: (itemId) => ({
                payload: { itemId }
            })
        },
        createNewParentItemWithFocus: {
            reducer: (items, { payload }) => {
                return createNewParentItem(
                    items, payload.newParentItemId, payload.newChildItemId)
            },
            prepare: () => ({
                payload: {
                    newParentItemId: "item-" + uuidv4(),
                    newChildItemId: "item-" + uuidv4(),
                }
            })
        },
        syncItems: {
            reducer: (items, { payload }) => {
                return mergeItems(items, payload.items)
            },
            prepare: (items) => ({
                payload: { items }
            })
        }
    }
})

export default itemsSlice.reducer

export const {
    updateItemText,
    updateItemComplete,
    createNewItemWithFocus,
    moveItem,
    removeItemFromParent,
    deleteItem,
    createNewParentItemWithFocus,
    syncItems
} = itemsSlice.actions


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
        firstItem && firstItem.id,
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


function handleRemoveItemFromParent(itemId, parentId, items) {
    items = detachItemFromParent(itemId, parentId, items);
    // Delete the item if it now has 0 parents
    if (Object.keys(items[itemId].parents).length <= 0) {
        delete items[itemId];
    }
    return items;
}


function handleDeleteItem(itemId, items) {
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
            modifiedItems = handleDeleteItem(incomingItem.id, modifiedItems);
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