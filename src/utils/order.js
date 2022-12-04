export const ITEM_ORDER_SPACING = 1000000000

// items == [{id: "some uuid", order: 12345}, ...]
export function reposition(items) {
    items.sort((a, b) => { return a.order - b.order });

    for (let i = 0; i < items.length; i++) {
        items[i].order = i * ITEM_ORDER_SPACING;
    }

    return items;
}


/**
 * Find items positioned directly before and after the startItemId.
 * @param {*} startItemId the item to find nearest surrounding items for.
 * @param {*} parentId the item id of the list whose items to consider.
 * @param {*} items the global dictionary of all items.
 * @returns An object containing the item objects that are directly prior
 *          and next in order with respect to the item specified by startItemId.
 */
export function findAdjacent(startItemId, parentId, items) {
    let startItem = items[startItemId];
    let startItemOrder = startItem.parents[parentId].order;

    let currentNextOrder = null;
    let currentNextItem = null;

    let currentPrevOrder = null;
    let currentPrevItem = null;

    Object.keys(items).forEach(itemId => {
        let item = items[itemId];
        if (isItemChildOfParent(item, parentId)) {
            let itemOrder = item.parents[parentId].order;
            if (startItemOrder > itemOrder) {
                if (currentPrevOrder === null || itemOrder > currentPrevOrder) {
                    currentPrevOrder = itemOrder;
                    currentPrevItem = item;
                }
            }
            else if (startItemOrder < itemOrder) {
                if (currentNextOrder === null || itemOrder < currentNextOrder) {
                    currentNextOrder = itemOrder;
                    currentNextItem = item;
                }
            }
        }
    });
    return {
        prev: currentPrevItem,
        next: currentNextItem
    };
}


export function isItemChildOfParent(item, parentId) {
    return item.parents[parentId] !== undefined;
}


    /*
function reposition(item, prevItem, nextItem, items) {
    desiredPosition = getDesiredPosition();

    let spaceCount = 1;

    let originalPrevItemOrder = prevItem.parents[parentId].order;
    let originalNextItemOrder = nextItem.parents[parentId].order;

    let currentPrevItemOrder = originalPrevItemOrder;
    let currentNextItemOrder = originalNextItemOrder;

    let spaceBetween = Math.abs(currentNextItemOrder - currentPrevItemOrder) - 1;
    if (spaceBetween >= 1) {
        let newOrder = Math.ceil((currentNextItemOrder + currentPrevItemOrder) / 2);
        return newOrder;
    }

    while (spaceBetween <= 0) {
        spaceCount++;

        currentPrevItemOrder = findItemOrderBefore(currentPrevItemOrder)
        if (currentPrevItemOrder === null) {
            repositionItemsBackward(originalPrevItemOrder, DEFAULT_SEPARATION, null)
            return originalPrevItemOrder;
        }
        let spaceBetweenPrev = Math.abs(originalPrevItemOrder - currentPrevItemOrder) - 1;
        let spacesPerSpace = Math.floor(spaceBetweenPrev / spaceCount);
        if (spacesPerSpace >= 1) {
            repositionItemsBackward(originalPrevItemOrder, spacesPerSpace, currentPrevItemOrder)
            return originalPrevItemOrder;
        }

        currentNextItemOrder = fundItemOrderAfter(currentNextItemOrder)
        if (currentNextItemOrder === null) {
            repositionItemsForward(originalNextItemOrder, DEFAULT_SEPARATION, null)
            return originalNextItemOrder;
        }
        let spaceBetweenNext = Math.abs(originalNextItemOrder - currentNextItemOrder) - 1;
        let spacesPerSpace = Math.floor(spaceBetweenNext / spaceCount);
        if (spacesPerSpace >= 1) {
            repositionItemsForward(originalNextItemOrder, spacesPerSpace, currentNextItemOrder)
            return originalNextItemOrder;
        }
    }
}
*/