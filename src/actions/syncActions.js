export const updateSyncUpDate = (date = new Date().toISOString()) => ({
    type: 'UPDATE_SYNC_UP_DATE',
    date
});

export const updateSyncDownDate = (date = new Date().toISOString()) => ({
    type: 'UPDATE_SYNC_DOWN_DATE',
    date
});

export const updateIsSyncing = (isSyncing = false) => {
    return {
        type: 'UPDATE_IS_SYNCING',
        isSyncing
    }
};

export const upsertChangeMarkers = (changeMarkers) => ({
    type: 'UPSERT_CHANGE_MARKERS',
    changeMarkers
});

export const deleteChangeMarkers = (changeMarkers) => ({
    type: 'DELETE_CHANGE_MARKERS',
    changeMarkers
});