import {combineReducers} from "redux";
import {items} from "./itemsReducer";
import {focus} from "./focusReducer";
import {dnd} from "./dndReducer";


const rootReducer = combineReducers({
    items,
    focus,
    dnd
});

export default rootReducer;