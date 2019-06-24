import {items} from "./itemsReducer";
import {focus} from "./focusReducer";
import {dnd} from "./dndReducer";
import {layouts} from "./layoutsReducer";
import {sync} from "./syncReducer";


const rootReducer = (state={}, action) => {
    switch (action.type) {
        case 'RESET_DATA':
            return customCombine(undefined, action);
        case 'LOAD_DATA':
            return {
                ...state,
                items: action.items,
                layouts: action.layouts
            };
        default:
            return customCombine(state, action);
    }
};

function customCombine(state={}, action) {
    let newState = {
        items: items(state.items, action),
        focus: focus(state.focus, action),
        dnd: dnd(state.dnd, action),
        layouts: layouts(state.layouts, action)
    };
    newState["sync"] = sync(state.sync, action, state, newState);
    return newState;
}

export default rootReducer;