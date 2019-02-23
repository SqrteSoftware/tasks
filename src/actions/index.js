export const updateItemText = (itemId, text) => ({
    type: 'UPDATE_ITEM_TEXT',
    itemId,
    text
});

export const createNewItemWithFocus = (parentItemId, prevItemId, nextItemId) => ({
    type: 'CREATE_NEW_ITEM_WITH_FOCUS',
    newItemId: "item-" + Math.floor(Math.random() * 1000000000),
    parentItemId,
    prevItemId,
    nextItemId
});

export const updateFocus = (parentId=null, itemId=null) => ({
    type: 'UPDATE_FOCUS',
    parentId,
    itemId
})