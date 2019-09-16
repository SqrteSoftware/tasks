import {createItem, getFirstItemInList, set} from "../utils";

export function items(state = {}, action) {
    let items = state;
    switch (action.type) {
        case 'UPDATE_ITEM_TEXT':
            return updateItemText(items, action.itemId, action.text);
        case 'UPDATE_ITEM_COMPLETE':
            if (!action.complete) {
                Object.keys(items[action.itemId].parents).forEach(parentId => {
                    items = moveItemToTop(action.itemId, parentId, items);
                });
            }
            items = set(items, action.itemId, 'complete', action.complete);
            items = set(items, action.itemId, 'completeDate', action.completeDate);
            return items;
        case 'CREATE_NEW_ITEM_WITH_FOCUS':
            let newItem = createItem(action.newItemId);
            items = set(items, newItem.id, newItem);
            return attachItemToParent(
                action.newItemId,
                action.parentItemId,
                action.prevItemId,
                action.nextItemId,
                items
            );
        case 'MOVE_ITEM':
            items = detachItemFromParent(
                action.itemId,
                action.oldParentId,
                items
            );
            items = attachItemToParent(
                action.itemId,
                action.newParentId,
                action.newPrevItemId,
                action.newNextItemId,
                items
            );
            return items;
        case 'REMOVE_ITEM_FROM_PARENT':
            return removeItemFromParent(action.itemId, action.parentId, state);
        case 'DELETE_ITEM':
            return deleteItem(action.itemId, items);
        case 'CREATE_NEW_PARENT_ITEM_WITH_FOCUS':
            return createNewParentItem(
                state,
                action.newParentItemId,
                action.newChildItemId
            );
        case 'SYNC_ITEMS':
            return mergeItems(state, action.items);
        case 'REPAIR_ITEM_LINKS':
            return repairItemLinks(state);
        default:
            return state;
    }
}

function updateItemText(items, itemId, text) {
    if (items[itemId] === undefined) return items;
    return set(items, itemId, 'value', text);
}

function moveItemToTop(itemId, parentId, items) {
    let item = items[itemId];
    if (item.parents[parentId].prev === null) return items;
    items = detachItemFromParent(
        itemId,
        parentId,
        items
    );
    let firstItem = getFirstItemInList(parentId, items);
    items = attachItemToParent(
        itemId,
        parentId,
        null,
        firstItem.id,
        items
    );
    return items;
}

function attachItemToParent(itemId, parentId, prevItemId, nextItemId, items) {
    // Add new parent to item
    let newParent = {
        id: parentId ? parentId : null,
        prev: prevItemId ? prevItemId : null,
        next: nextItemId ? nextItemId : null
    };
    items = set(items, itemId, 'parents', parentId, newParent);
    // Find previous item and mutate parent to point to inserted item
    if (prevItemId) {
        items = set(items, prevItemId, 'parents', parentId, 'next', itemId);
    }
    // Find next item and mutate parent to point to inserted item
    if (nextItemId) {
        items = set(items, nextItemId, 'parents', parentId, 'prev', itemId);
    }
    return items;
}

function detachItemFromParent(itemId, parentId, items) {
    let item = items[itemId];
    let itemParent = item.parents[parentId];
    if (itemParent === undefined) return;
    let oldPrevItem = items[itemParent.prev];
    let oldNextItem = items[itemParent.next];
    // Remove parent from item
    let newParents = {...item.parents};
    delete newParents[parentId];
    items = set(items, itemId, 'parents', newParents);
    // Remove item from prev item and attach next item instead
    if (oldPrevItem) {
        let newNextId = oldNextItem ? oldNextItem.id : null;
        items = set(items, oldPrevItem.id, 'parents', parentId, 'next', newNextId);
    }
    // Remove item from next item and attach prev item instead
    if (oldNextItem) {
        let newPrevId = oldPrevItem ? oldPrevItem.id : null;
        items = set(items, oldNextItem.id, 'parents', parentId, 'prev', newPrevId);
    }
    return items;
}

function removeItemFromParent(itemId, parentId, items) {
    items = detachItemFromParent(itemId, parentId, items);
    // Delete the item if it now has 0 parents
    if (Object.keys(items[itemId].parents).length <= 0) {
        delete items[itemId];
    }
    return items;
}

function deleteItem(itemId, items) {
    items = {...items};
    // If this item has any children, detach them
    // all and delete them if they have no other parents
    Object.keys(items).forEach(id =>{
        let i = items[id];
        if (i.parents.hasOwnProperty(itemId)) {
            let newParents = {...i.parents};
            delete newParents[itemId];
            if (Object.keys(newParents).length > 0) {
                items[id] = {...i, parents: newParents};
            } else {
                delete items[id];
            }

        }
    });
    // Delete the item
    delete items[itemId];
    return items;
}

function createNewParentItem(items, newParentItemId, newChildItemId) {
    let newParentItem = createItem(newParentItemId);
    let newChildItem = createItem(newChildItemId);
    items = set(items, newParentItemId, newParentItem);
    items = set(items, newChildItemId, newChildItem);
    items = attachItemToParent(newChildItemId, newParentItemId, null, null, items);
    return items;
}

// The following merging algorithm assumes that the lists
// we're merging items into have referential integrity. Each
// merge operation must also yield a list with the same integrity.
// Incoming data is not trusted as it may not be intact referentially.
// We do our best to place it. If a good placement can't be found,
// we place the incoming item at the top of the list by default.
function mergeItems(currentItems, incomingItems) {
    let modifiedItems = currentItems;

    let parents = incomingItems.filter(i => Object.keys(i.parents).length <= 0);
    parents.forEach(incomingParent => {
        // Root items can be added verbatim since they have no references to maintain
        modifiedItems = set(modifiedItems, incomingParent.id, incomingParent);

        // Now handle root's children
        getSortedChildren(incomingParent.id, incomingItems).forEach(incomingItem => {
            // If item exists in list, it must be detached before being moved
            let existingItem = modifiedItems[incomingItem.id];
            if (existingItem) {
                Object.keys(existingItem.parents).forEach(parentId => {
                    modifiedItems = detachItemFromParent(incomingItem.id, parentId, modifiedItems);
                });
            }

            let incomingItemNextId = incomingItem.parents[incomingParent.id].next;
            let incomingItemPrevId = incomingItem.parents[incomingParent.id].prev;
            let incomingItemPrev = modifiedItems[incomingItemPrevId];

            // If incoming item's prev is null, attach as first item in list
            if (incomingItemPrevId === null) {
                let currentFirstItemId = Object.keys(modifiedItems).find(id => {
                    let item = modifiedItems[id];
                    return item.parents[incomingParent.id] && item.parents[incomingParent.id].prev === null
                });
                modifiedItems = set(modifiedItems, incomingItem.id, incomingItem);
                modifiedItems = attachItemToParent(incomingItem.id, incomingParent.id, null, currentFirstItemId, modifiedItems);
                return;
            }

            // If incoming item's next is null, attach as last item in list
            if (incomingItemNextId === null) {
                let currentLastItemId = Object.keys(modifiedItems).find(id => {
                    let item = modifiedItems[id];
                    return item.parents[incomingParent.id] && item.parents[incomingParent.id].next === null
                });
                modifiedItems = set(modifiedItems, incomingItem.id, incomingItem);
                modifiedItems = attachItemToParent(incomingItem.id, incomingParent.id, currentLastItemId, null, modifiedItems);
                return;
            }

            // If incoming item's prev exists, attach item between prev and prev's next
            if (incomingItemPrev) {
                let incomingItemPrevNextId = incomingItemPrev.parents[incomingParent.id].next;
                modifiedItems = set(modifiedItems, incomingItem.id, incomingItem);
                modifiedItems = attachItemToParent(incomingItem.id, incomingParent.id, incomingItemPrevId, incomingItemPrevNextId, modifiedItems);
                return;
            }

            // We failed to find a sane placement for the incoming item.
            // Just place it at the top of the list.
            let currentFirstItemId = Object.keys(modifiedItems).find(id => {
                let item = modifiedItems[id];
                return item.parents[incomingParent.id] && item.parents[incomingParent.id].prev === null
            });
            modifiedItems = set(modifiedItems, incomingItem.id, incomingItem);
            modifiedItems = attachItemToParent(incomingItem.id, incomingParent.id, null, currentFirstItemId, modifiedItems);
        });

    });

    return modifiedItems;
}

function getSortedChildren(parentId, items) {
    let sortedChildren = [];

    let children = items.filter(i => i.parents && i.parents[parentId]);
    let childrenHash = {};
    children.forEach(i => childrenHash[i.id] = i);
    let firstItems = children.filter(i => !childrenHash[i.parents[parentId].prev]);

    let nextChildId;
    let findChild = i => i.id === nextChildId;
    firstItems.forEach(item => {
        let child = item;
        let childIndex = children.findIndex(i => i.id === child.id);
        while (true) {
            sortedChildren.push(child);
            // Remove processed child from list
            children.splice(childIndex, 1);
            // Proceed to the next child
            nextChildId = child.parents[parentId].next;
            if (nextChildId === null) break;
            // Find next child
            childIndex = children.findIndex(findChild);
            if (childIndex < 0) break;
            child = children[childIndex]
        }
    });
    // There may be children left that we could not sort.
    // Add them to the end of the list.
    sortedChildren = sortedChildren.concat(children);
    
    return sortedChildren;
}

function repairItemLinks(items) {
    items = {...items};
    let itemsByParent = {};

    Object.keys(items).forEach(itemId => {
        let item = items[itemId];
        if (Object.keys(item.parents).length <= 0) {
            if (itemsByParent[item.id]) {
                itemsByParent[item.id].parent = item;
            }
            else {
                itemsByParent[item.id] = {
                    'parent': item,
                    'children': []
                };
            }
        }
        else {
            Object.keys(item.parents).forEach(parentItemId => {
                if (itemsByParent[parentItemId]) {
                    itemsByParent[parentItemId].children.push(item);
                }
                else {
                    itemsByParent[parentItemId] = {
                        'parent': null,
                        'children': [item]
                    };
                }
            })
        }
    });

    Object.keys(itemsByParent).forEach(parentId => {
        let lastChild = null;
        itemsByParent[parentId].children.forEach(child => {
            if (lastChild) {
                child.parents[parentId].prev = lastChild.id;
                lastChild.parents[parentId].next = child.id;
            }
            else {
                child.parents[parentId].prev = null;
            }
            child.parents[parentId].next = null;
            lastChild = child;
        });
    });

    return items;
}