let initialState = {
    changes: {},
    lastSyncUp: null,
    lastSyncDown: null
}
export const sync = (state=initialState, action, oldRootState={}, newRootState={}) => {
    // let oldItem, oldItemParent;
    switch (action.type) {
        case 'FORCE_SYNC':
            let allItems = {};
            Object.keys(newRootState.items).forEach(itemId => {
                allItems[itemId] = 'UPDATED';
            });
            return {
                ...state,
                changes: allItems
            };
        case 'CLEAR_SYNC':
            return {
                ...state,
                changes: {}
            };
        case 'SYNCED_UP':
            return {
                ...state,
                lastSyncUp: action.date
            };
        case 'SYNCED_DOWN':
            return {
                ...state,
                lastSyncDown: action.date
            };
        // case 'CREATE_NEW_ITEM_WITH_FOCUS':
        //     return {
        //         ...state,
        //         changes: {
        //             ...state.changes,
        //             [action.newItemId]: 'CREATED',
        //             ...(action.prevItemId && {[action.prevItemId]: 'UPDATED'}),
        //             ...(action.nextItemId && {[action.nextItemId]: 'UPDATED'})
        //         }
        //     };
        // case 'CREATE_NEW_PARENT_ITEM_WITH_FOCUS':
        //     return {
        //         ...state,
        //         changes: {
        //             ...state.changes,
        //             ...(action.newParentItemId && {[action.newParentItemId]: 'CREATED'}),
        //             ...(action.newChildItemId && {[action.newChildItemId]: 'CREATED'})
        //         }
        //     };
        // case 'UPDATE_ITEM_TEXT':
        //     return {
        //         ...state,
        //         changes: {
        //             ...state.changes,
        //             [action.itemId]: 'UPDATED'
        //         }
        //     };
        // case 'UPDATE_ITEM_COMPLETE':
        //     oldItem = oldRootState.items[action.itemId];
        //     let newItem = newRootState.items[action.itemId];
        //     let newState = {
        //         ...state,
        //         changes: {
        //             ...state.changes,
        //             [action.itemId]: 'UPDATED'
        //         }
        //     };
        //     if (oldItem.complete) {
        //         Object.keys(oldItem.parents).forEach(parentId => {
        //             let parent = oldItem.parents[parentId];
        //             if (parent.prev) newState.changes[parent.prev] = 'UPDATED';
        //             if (parent.next) newState.changes[parent.next] = 'UPDATED';
        //         });
        //         Object.keys(newItem.parents).forEach(parentId => {
        //             let parent = newItem.parents[parentId];
        //             if (parent.next) newState.changes[parent.next] = 'UPDATED';
        //         });
        //     }
        //     return newState;
        // case 'MOVE_ITEM':
        //     oldItem = oldRootState.items[action.itemId];
        //     oldItemParent = oldItem.parents[action.oldParentId];
        //     return {
        //         ...state,
        //         changes: {
        //             ...state.changes,
        //             [action.itemId]: 'UPDATED',
        //             ...(action.newPrevItemId && {[action.newPrevItemId]: 'UPDATED'}),
        //             ...(action.newNextItemId && {[action.newNextItemId]: 'UPDATED'}),
        //             ...(oldItemParent.prev && {[oldItemParent.prev]: 'UPDATED'}),
        //             ...(oldItemParent.next && {[oldItemParent.next]: 'UPDATED'})
        //         }
        //     };
        // case 'REMOVE_ITEM_FROM_PARENT':
        //     oldItem = oldRootState.items[action.itemId];
        //     oldItemParent = oldItem.parents[action.parentId];
        //     return {
        //         ...state,
        //         changes: {
        //             ...state.changes,
        //             // Only add the removed item if it hasn't been deleted
        //             [action.itemId]: newRootState.items[action.itemId] ? 'UPDATED' : 'DELETED',
        //             ...(oldItemParent.prev && {[oldItemParent.prev]: 'UPDATED'}),
        //             ...(oldItemParent.next && {[oldItemParent.next]: 'UPDATED'})
        //         }
        //     };
        // case 'DELETE_ITEM':
        //     let deletedItemIds = {};
        //     // Find the item deleted + any children
        //     Object.keys(oldRootState.items).forEach(itemId => {
        //         if (newRootState.items[itemId] === undefined) {
        //             deletedItemIds[itemId] = 'DELETED';
        //         }
        //     });
        //     return {
        //         ...state,
        //         changes: {
        //             ...state.changes,
        //             ...deletedItemIds
        //         }
        //     };
        default:
            return state;
    }
};

