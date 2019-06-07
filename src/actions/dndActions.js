export const updateDnd = ({
                              activeDragParentId = undefined,
                              overlappedListId = undefined,
                              nearestItemId = undefined,
                              nearestItemPos = undefined
                          }) => {
    let values = Object.assign({},
        activeDragParentId !== undefined && {activeDragParentId},
        overlappedListId !== undefined && {overlappedListId},
        nearestItemId !== undefined && {nearestItemId},
        nearestItemPos !== undefined && {nearestItemPos},
    );
    return {
        type: 'UPDATE_DND',
        values
    };
};