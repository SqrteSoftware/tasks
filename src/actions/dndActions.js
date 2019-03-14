export const updateDnd = ({
                              activeDragParentId = undefined,
                              overlappedListId = undefined,
                              overlappedItemId = undefined,
                              overlappedItemPos = undefined
                          }) => {
    let values = Object.assign({},
        activeDragParentId !== undefined && {activeDragParentId},
        overlappedListId !== undefined && {overlappedListId},
        overlappedItemId !== undefined && {overlappedItemId},
        overlappedItemPos !== undefined && {overlappedItemPos},
    );
    return {
        type: 'UPDATE_DND',
        values
    };
};