import {combineReducers} from "redux";
import {items} from "./itemsReducer";
import {focus} from "./focusReducer";
import {dnd} from "./dndReducer";
import {layouts} from "./layoutsReducer"

const childrenReducers = combineReducers({
    items,
    focus,
    dnd,
    layouts
});

const rootReducer = (state={}, action) => {
    switch (action.type) {
        case 'RESET_DATA':
            return childrenReducers(undefined, action);
        case 'LOAD_DATA':
            return {
                ...state,
                items: action.items,
                layouts: action.layouts
            };
        default:
            return childrenReducers(state, action);
    }
}

export default rootReducer;