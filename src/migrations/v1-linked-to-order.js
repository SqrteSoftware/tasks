import { ITEM_ORDER_SPACING } from "../utils/order";

export function migrateFromLinkedListsToOrderSequence(state) {
    let items = state.items;
    let sortedListData = createSortedListData(items);

    sortedListData.forEach(list => {
        let order = 0
        let parentId = list.parent.id;
        list.children.forEach(childItem => {
            childItem.parents[parentId].order = order;
            delete childItem.parents[parentId].prev;
            delete childItem.parents[parentId].next;
            order += ITEM_ORDER_SPACING;
        });
    });

    return state;
}


function createSortedListData(items) {
    let listData = [];
    Object.keys(items).forEach(itemId => {
        let item = items[itemId];
        if (Object.keys(item.parents).length <= 0) {
            let parentItem = item;
            let children = getSortedListItems(parentItem.id, items, false);
            listData.push({
                'parent': parentItem,
                'children': children
            });
        }
    });
    return listData;
}


function getSortedListItems(parentId, items, activeOnly=true) {
    if (!parentId) return [];
    let children = [];
    Object.keys(items).forEach(itemId => {
        let item = items[itemId]
        if (item.parents[parentId]) {
            if (activeOnly && item.complete) return;
            children.push(items[itemId]);
        }
    });
    let childIndex = children.findIndex(item => {
        return item.parents[parentId].prev === null;
    });
    let child = children[childIndex];
    let sortedChildren = [];
    let parent;
    const matchNextItem = item => item.id === parent.next;
    while (child && childIndex >= 0) {
        // Remove child from children list
        children.splice(childIndex, 1);
        // Add child to sorted children list
        sortedChildren.push(child);
        // Should we exit?
        parent = child.parents[parentId];
        if (!parent || parent.next === null) {
            break;
        }
        // Get the next child
        childIndex = children.findIndex(matchNextItem);
        child = children[childIndex];
    }
    // Append any leftover children we couldn't sort
    sortedChildren = sortedChildren.concat(children);
    return sortedChildren;
}