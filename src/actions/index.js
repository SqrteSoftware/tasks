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

export const detachItemFromParent = (itemId, parentId) => ({
    type: 'DETACH_ITEM_FROM_PARENT',
    itemId,
    parentId
});

export const attachItemToParent = (itemId, parentId, prevItemId, nextItemId) => ({
    type: 'ATTACH_ITEM_TO_PARENT',
    itemId,
    parentId,
    prevItemId,
    nextItemId
});

export const updateFocus = (parentId=null, itemId=null) => ({
    type: 'UPDATE_FOCUS',
    parentId,
    itemId
});

export const updateDnd = ({
    activeDragParentId = undefined,
    overlappedListId = undefined,
    overlappedItemId = undefined,
    overlappedItemPos = undefined
}) => {
    let values = Object.assign({},
        activeDragParentId !== undefined && {activeDragParentId},
        overlappedListId !== undefined && {overlappedListId},
        overlappedItemId !== undefined && {overlappedItemId},
        overlappedItemPos !== undefined && {overlappedItemPos},
    );
    return {
        type: 'UPDATE_DND',
        values
    };
};

