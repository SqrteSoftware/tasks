
export const sync = (state={}, action, oldRootState={}, newRootState={}) => {
    let oldItem, oldItemParent;
    switch (action.type) {
        case 'FORCE_SYNC':
            let allItems = {};
            Object.keys(newRootState.items).forEach(itemId => {
                allItems[itemId] = 'UPDATED';
            });
            return allItems;
        case 'CLEAR_SYNC':
            return {};
        case 'CREATE_NEW_ITEM_WITH_FOCUS':
            return {
                ...state,
                [action.newItemId]: 'CREATED',
                ...(action.prevItemId && {[action.prevItemId]: 'UPDATED'}),
                ...(action.nextItemId && {[action.nextItemId]: 'UPDATED'})
            };
        case 'CREATE_NEW_PARENT_ITEM_WITH_FOCUS':
            return {
                ...state,
                ...(action.newParentItemId && {[action.newParentItemId]: 'CREATED'}),
                ...(action.newChildItemId && {[action.newChildItemId]: 'CREATED'})
            };
        case 'UPDATE_ITEM_TEXT':
            return {...state, [action.itemId]: 'UPDATED'};
        case 'UPDATE_ITEM_COMPLETE':
            return {...state, [action.itemId]: 'UPDATED'};
        case 'MOVE_ITEM':
            oldItem = oldRootState.items[action.itemId];
            oldItemParent = oldItem.parents[action.oldParentId];
            return {
                ...state,
                [action.itemId]: 'UPDATED',
                ...(action.newPrevItemId && {[action.newPrevItemId]: 'UPDATED'}),
                ...(action.newNextItemId && {[action.newNextItemId]: 'UPDATED'}),
                ...(oldItemParent.prev && {[oldItemParent.prev]: 'UPDATED'}),
                ...(oldItemParent.next && {[oldItemParent.next]: 'UPDATED'})
            };
        case 'REMOVE_ITEM_FROM_PARENT':
            oldItem = oldRootState.items[action.itemId];
            oldItemParent = oldItem.parents[action.parentId];
            return {
                ...state,
                // Only add the removed item if it hasn't been deleted
                [action.itemId]: newRootState.items[action.itemId] ? 'UPDATED' : 'DELETED',
                ...(oldItemParent.prev && {[oldItemParent.prev]: 'UPDATED'}),
                ...(oldItemParent.next && {[oldItemParent.next]: 'UPDATED'})
            };
        case 'DELETE_ITEM':
            let deletedItemIds = {};
            // Find the item deleted + any children
            Object.keys(oldRootState.items).forEach(itemId => {
                if (newRootState.items[itemId] === undefined) {
                    deletedItemIds[itemId] = 'DELETED';
                }
            });
            return {
                ...state,
                ...deletedItemIds
            };
        default:
            return state;
    }
};

