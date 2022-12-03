let initialState = {
    lastSyncUp: null,
    lastSyncDown: null
}
export const sync = (state=initialState, action, oldRootState={}, newRootState={}) => {
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
        case 'DELETE_USER_ID':
            // Reset sync state after disconnecting an account
            return initialState;
        default:
            return state;
    }
};

