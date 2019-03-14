export const updateFocus = (parentId=null, itemId=null) => ({
    type: 'UPDATE_FOCUS',
    parentId,
    itemId
});