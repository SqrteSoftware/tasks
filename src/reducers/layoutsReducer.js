import {clone} from '../utils'

export function layouts(state={}, action) {
    let layouts = state;
    switch (action.type) {
        case 'CREATE_NEW_PARENT_ITEM_WITH_FOCUS':
            return {
              lg: [
                  // move existing leftmost lists down to make space for new list
                  ...layouts.lg.map(l => l.x === 0 ? {...l, y: l.y + 6} : l),
                  // add new layout for new list
                  {i: action.newParentItemId, x: 0, y: 0, w: 3, h: 6, minW: 3, maxW: 4}
              ]
            };
        case 'UPDATE_ALL_LAYOUTS':
            return clone(action.allLayouts);
        default:
            return state;
    }
}
