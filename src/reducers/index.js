import {combineReducers} from "redux";


function items(state = [], action) {
    switch (action.type) {
        case 'UPDATE_ITEM_TEXT':
            return state.map(item => {
                if (item.id === action.itemId) {
                    return {...item, value: action.text}
                }
                return item;
            });
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    items
});

export default rootReducer;