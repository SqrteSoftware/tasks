import lists from "./listsSlice"
import dialogs from "./dialogsSlice"
import user from "./userSlice"
import dnd from "./dndSlice"
import layouts from "./layoutsSlice"
import focus from "./focusSlice"
import license from "./licenseSlice"
import sync from "./syncSlice"
import items from "./itemsSlice"


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
        layouts: layouts(state.layouts, action),
        lists: lists(state.lists, action),
        license: license(state.license, action),
        user: user(state.user, action),
        dialogs: dialogs(state.dialogs, action),
        sync: sync(state.sync, action),
    };
    return newState;
};

export default rootReducer;