export const syncedUp = (date = new Date().toISOString()) => ({
    type: 'SYNCED_UP',
    date
});

export const syncedDown = (date = new Date().toISOString()) => ({
    type: 'SYNCED_DOWN',
    date
});

export const updateIsSyncing = (isSyncing = false) => {
    return {
        type: 'UPDATE_IS_SYNCING',
        isSyncing
    }
};