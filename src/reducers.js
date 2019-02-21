import {combineReducers} from "redux";


function items(state = [], action) {
    return state;
}

const rootReducer = combineReducers({
    items
});

export default rootReducer;