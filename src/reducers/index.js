import {combineReducers} from "redux";
import {items} from "./itemsReducer";
import {focus} from "./focusReducer";
import {dnd} from "./dndReducer";
import {layouts} from "./layoutsReducer"


const rootReducer = combineReducers({
    items,
    focus,
    dnd,
    layouts
});

export default rootReducer;