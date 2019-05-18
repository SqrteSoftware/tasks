import uuidv4 from 'uuid/v4'

export const updateItemText = (itemId, text) => ({
    type: 'UPDATE_ITEM_TEXT',
    itemId,
    text
});

export const updateItemComplete = (itemId, complete) => ({
    type: 'UPDATE_ITEM_COMPLETE',
    itemId,
    complete
});

export const createNewItemWithFocus = (parentItemId, prevItemId, nextItemId) => ({
    type: 'CREATE_NEW_ITEM_WITH_FOCUS',
    newItemId: "item-" + uuidv4(),
    parentItemId,
    prevItemId,
    nextItemId
});

export const moveItem = (itemId, oldParentId, newParentId, newPrevItemId, newNextItemId) => ({
    type: 'MOVE_ITEM',
    itemId,
    oldParentId,
    newParentId,
    newPrevItemId,
    newNextItemId
});

export const removeItemFromParent = (itemId, parentId) => ({
    type: 'REMOVE_ITEM_FROM_PARENT',
    itemId,
    parentId
});

export const deleteItem = (itemId) => ({
   type: 'DELETE_ITEM',
   itemId
});

export const createNewParentItem = () => ({
    type: 'CREATE_NEW_PARENT_ITEM_WITH_FOCUS',
    newParentItemId: "item-" + uuidv4(),
    newChildItemId: "item-" + uuidv4(),
});

export const syncItems = (items) => ({
    type: 'SYNC_ITEMS',
    items
});

export const repairItemLinks = () => ({
    type: 'REPAIR_ITEM_LINKS'
});