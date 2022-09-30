let defaultState = {
    // Open welcome dialog on first load
    activeDialog: 'welcome'
}
export function dialogs(state = defaultState, action) {
    switch (action.type) {
        case 'OPEN_DIALOG':
            return {
                ...state,
                activeDialog: action.name
            }
        case 'CLOSE_DIALOG':
            return {
                ...state,
                activeDialog: ''
            }
        default:
            return state;
    }
}