export const syncedUp = (date = new Date().toISOString()) => ({
    type: 'SYNCED_UP',
    date
});

export const syncedDown = (date = new Date().toISOString()) => ({
    type: 'SYNCED_DOWN',
    date
});
