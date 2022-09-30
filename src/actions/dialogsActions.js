export const openDialog = (name) => {
    return {
        type: 'OPEN_DIALOG',
        name,
    }
};


export const closeDialog = () => {
    return {
        type: 'CLOSE_DIALOG'
    }
};


export const resetDialog = () => {
    return {
        type: 'RESET_DIALOG'
    }
};
