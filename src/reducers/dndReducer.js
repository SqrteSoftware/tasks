export function dnd(state = {
    'activeDragParentId': null,
    'overlappedListId': null,
    'overlappedItemId': null,
    'overlappedItemPos': null
}, action) {
    switch (action.type) {
        case 'UPDATE_DND':
            return {
                ...state,
                ...action.values
            };
        default:
            return state;
    }
}