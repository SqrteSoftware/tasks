let initialState = {
    lastSyncUp: null,
    lastSyncDown: null
}
export const sync = (state=initialState, action, oldRootState={}, newRootState={}) => {
    // let oldItem, oldItemParent;
    switch (action.type) {
        case 'SYNCED_UP':
            return {
                ...state,
                lastSyncUp: action.date
            };
        case 'SYNCED_DOWN':
            return {
                ...state,
                lastSyncDown: action.date
            };
        default:
            return state;
    }
};

