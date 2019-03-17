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
    newItemId: "item-" + Math.floor(Math.random() * 1000000000),
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

export const createNewParentItem = () => ({
    type: 'CREATE_NEW_PARENT_ITEM_WITH_FOCUS',
    newParentItemId: "item-" + Math.floor(Math.random() * 1000000000),
    newChildItemId: "item-" + Math.floor(Math.random() * 1000000000),
});