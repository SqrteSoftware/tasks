import {set} from '../utils'


export function lists(state = {}, action) {
    let lists = state;
    switch(action.type) {
        case 'SHOW_COMPLETED_ITEMS':
            return set(lists, action.listId, 'showCompletedItems', action.show);
        default:
            return lists;
    }
}