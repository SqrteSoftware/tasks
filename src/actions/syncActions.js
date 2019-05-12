export const clearSync = () => ({
    type: 'CLEAR_SYNC'
});

export const forceSync = () => ({
    type: 'FORCE_SYNC'
});
window.forceSync = forceSync;