let initialState = {
    lastSyncUp: null,
    lastSyncDown: null,
    isSyncing: false,
    changeMarkers: {}
}
export const sync = (state=initialState, action) => {
    switch (action.type) {
        case 'UPDATE_SYNC_UP_DATE':
            return {
                ...state,
                lastSyncUp: action.date
            };
        case 'UPDATE_SYNC_DOWN_DATE':
            return {
                ...state,
                lastSyncDown: action.date
            };
        case 'UPDATE_IS_SYNCING':
            return {
                ...state,
                isSyncing: action.isSyncing
            }
        case 'DELETE_USER_ID':
            // Reset sync state after disconnecting an account
            return initialState;
        case 'UPSERT_CHANGE_MARKERS':
            return {
                ...state,
                changeMarkers: {...state.changeMarkers, ...action.changeMarkers}
            }
        case 'DELETE_CHANGE_MARKERS':
            return deleteChangeMarkers(state, action.changeMarkers);
        case 'RESET_CHANGE_MARKERS':
            return {
                ...state,
                changeMarkers: {}
            }
        default:
            return state;
    }
};

function deleteChangeMarkers(state, changeMarkers) {
    let newState = {
        ...state,
        changeMarkers: {...state.changeMarkers}
    }
    Object.keys(changeMarkers).forEach(id => {
        if (newState.changeMarkers[id] === undefined) {
            return;
        }
        if (newState.changeMarkers[id].date !== changeMarkers[id].date) {
            return;
        }
        if (newState.changeMarkers[id].type !== changeMarkers[id].type) {
            return;
        }
        delete newState.changeMarkers[id];
    })
    return newState;
}