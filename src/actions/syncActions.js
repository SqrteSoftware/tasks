export const syncedUp = (date = new Date().toISOString()) => ({
    type: 'SYNCED_UP',
    date
});

export const clearSync = () => ({
    type: 'CLEAR_SYNC'
});

export const forceSync = () => ({
    type: 'FORCE_SYNC'
});
window.forceSync = forceSync;