export function dnd(state = {
    'activeDragParentId': null,
    'overlappedListId': null,
    'nearestItemId': null,
    'nearestItemPos': null
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