export function focus(state = {'parentId': null, 'itemId': null}, action) {
    switch (action.type) {
        case 'UPDATE_FOCUS':
            return {
                'parentId': action.parentId,
                'itemId': action.itemId
            };
        case 'CREATE_NEW_ITEM_WITH_FOCUS':
            return {
                'parentId': action.parentItemId,
                'itemId': action.newItemId
            };
        default:
            return state;
    }
}