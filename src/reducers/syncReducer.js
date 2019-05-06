
export const sync = (state={}, action, oldRootState={}, newRootState={}) => {
    let oldItem, oldItemParent;
    switch (action.type) {
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

//         case 'REMOVE_ITEM_FROM_PARENT':
//             let newState = state;
//             // Only list item as deleted if it actually has been deleted
//             if (newRootState.items[action.itemId] === undefined) {
//                 newState = [...state, action.itemId];
//             }
//             return newState;
//         case 'DELETE_ITEM':
//             let deletedItemIds = [];
//             // Find the item deleted + any children
//             Object.keys(oldRootState.items).forEach(itemId => {
//                 if (newRootState.items[itemId] === undefined) {
//                     deletedItemIds.push(itemId);
//                 }
//             });
//             return [...state, ...deletedItemIds];

        default:
            return state;
    }
};


// export const sync = (syncState={}, action, oldRootState={}, newRootState={}) => {
//     return {
//         newItemIds: newItemIds(syncState.newItemIds, action, oldRootState, newRootState),
//         updatedItemIds: updatedItemIds(syncState.updatedItemIds, action, oldRootState, newRootState),
//         deletedItemIds: deletedItemIds(syncState.deletedItemIds, action, oldRootState, newRootState)
//     };
// };
//
// function newItemIds(state=[], action, oldRootState, newRootState) {
//     switch (action.type) {
//         case 'CREATE_NEW_ITEM_WITH_FOCUS':
//             return [...state, action.itemId];
//         case 'CREATE_NEW_PARENT_ITEM_WITH_FOCUS':
//             return [
//                 ...state,
//                 action.newParentItemId,
//                 action.newChildItemId
//             ].filter(id => id !== null);
//         default:
//             return state;
//     }
// }
//
// function updatedItemIds(state=[], action, oldRootState, newRootState) {
//     let oldItem, oldItemParent;
//     switch (action.type) {
//         case 'CREATE_NEW_ITEM_WITH_FOCUS':
//             return [
//                 ...state,
//                 action.prevItemId,
//                 action.nextItemId
//             ].filter(id => id !== null);
//         case 'UPDATE_ITEM_TEXT':
//         case 'UPDATE_ITEM_COMPLETE':
//             return [...state, action.itemId];
//         case 'MOVE_ITEM':
//             oldItem = oldRootState.items[action.itemId];
//             oldItemParent = oldItem.parents[action.oldParentId];
//             return [
//                 ...state,
//                 action.itemId,
//                 action.newPrevItemId,
//                 action.newNextItemId,
//                 oldItemParent.prev,
//                 oldItemParent.next
//             ].filter(id => id !== null);
//         case 'REMOVE_ITEM_FROM_PARENT':
//             oldItem = oldRootState.items[action.itemId];
//             oldItemParent = oldItem.parents[action.parentId];
//             let newUpdatedItems = [
//                 ...state,
//                 oldItemParent.prev,
//                 oldItemParent.next
//             ].filter(id => id !== null);
//             // Only add the removed item if it hasn't been deleted
//             if (newRootState.items[action.itemId]) {
//                 newUpdatedItems.push(action.itemId);
//             }
//             return newUpdatedItems;
//         default:
//             return state;
//     }
// }
//
// function deletedItemIds(state=[], action, oldRootState, newRootState) {
//     switch (action.type) {
//         case 'REMOVE_ITEM_FROM_PARENT':
//             let newState = state;
//             // Only list item as deleted if it actually has been deleted
//             if (newRootState.items[action.itemId] === undefined) {
//                 newState = [...state, action.itemId];
//             }
//             return newState;
//         case 'DELETE_ITEM':
//             let deletedItemIds = [];
//             // Find the item deleted + any children
//             Object.keys(oldRootState.items).forEach(itemId => {
//                 if (newRootState.items[itemId] === undefined) {
//                     deletedItemIds.push(itemId);
//                 }
//             });
//             return [...state, ...deletedItemIds];
//         default:
//             return state;
//     }
// }