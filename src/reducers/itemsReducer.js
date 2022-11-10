import {createItem, getFirstItemInList, getFirstItemInList2, set} from "../utils";
import { ITEM_ORDER_SPACING, reposition } from "../utils/order";

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
            items = setItem(items, action.itemId, 'complete', action.complete);
            items = setItem(items, action.itemId, 'completeDate', action.completeDate);
            return items;
        case 'CREATE_NEW_ITEM_WITH_FOCUS':
            let newItem = createItem(action.newItemId);
            items = setItem(items, newItem.id, newItem);
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
            return mergeItemsOld(state, action.items);
        case 'MERGE_ITEMS':
            return mergeItems(items, action.items)
        case 'REPAIR_ITEM_LINKS':
            return repairItemLinks(state);
        default:
            return state;
    }
}

function updateItemText(items, itemId, text) {
    if (items[itemId] === undefined) return items;
    items = setItem(items, itemId, 'value', text);
    return items;
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

function moveItemToTop2(itemId, parentId, items) {
    let item = items[itemId];
    if (item.parents[parentId].prev === null) return items;
    items = detachItemFromParent(
        itemId,
        parentId,
        items
    );
    let firstItem = getFirstItemInList2(parentId, items);
    items = attachItemToParent2(
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
    items = setItem(items, itemId, 'parents', parentId, newParent);
    // Find previous item and mutate parent to point to inserted item
    if (prevItemId) {
        items = setItem(items, prevItemId, 'parents', parentId, 'next', itemId);
    }
    // Find next item and mutate parent to point to inserted item
    if (nextItemId) {
        items = setItem(items, nextItemId, 'parents', parentId, 'prev', itemId);
    }
    return items;
}

function attachItemToParent2(itemId, parentId, prevItemId, nextItemId, items) {

    let freeSpace = getSpaceBetweenItems(prevItemId, nextItemId, parentId, items);
    if (freeSpace <= 0) {
        items = repositionItems(prevItemId, nextItemId, parentId, items);
    }
    let newItemOrder = getInsertionPoint(prevItemId, nextItemId, parentId, items);

    // Add new parent to item
    let newParent = {
        id: parentId ? parentId : null,
        order: newItemOrder
    };
    items = setItem(items, itemId, 'parents', parentId, newParent);
    return items;
}


function getSpaceBetweenItems(itemPrevId, itemNextId, parentId, items) {
    if (itemPrevId === null || itemNextId === null) {
        return ITEM_ORDER_SPACING;
    }

    let prevItem = items[itemPrevId];
    let nextItem = items[itemNextId];

    let prevItemOrder = prevItem.parents[parentId].order;
    let nextItemOrder = nextItem.parents[parentId].order;

    let freeSpace = Math.abs(nextItemOrder - prevItemOrder) - 1;

    return freeSpace;
}


function getInsertionPoint(itemPrevId, itemNextId, parentId, items) {
    let prevItem = items[itemPrevId];
    let nextItem = items[itemNextId];

    if (prevItem === undefined && nextItem === undefined) {
        return 0;
    }
    if (prevItem === undefined) {
        return nextItem.parents[parentId].order - ITEM_ORDER_SPACING;
    }
    if (nextItem === undefined) {
        return prevItem.parents[parentId].order + ITEM_ORDER_SPACING;
    }

    let prevItemOrder = prevItem.parents[parentId].order;
    let nextItemOrder = nextItem.parents[parentId].order;
    let insertionPoint = Math.floor((prevItemOrder + nextItemOrder) / 2);
    return insertionPoint;
}


function repositionItems(prevItemId, nextItemId, parentId, items) {
    let listItems = [];
    Object.keys(items).forEach(itemId => {
        let item = items[itemId];
        if (item.parents[parentId] !== undefined) {
            listItems.push({
                id: item.id,
                order: item.parents[parentId].order
            })
        }
    });

    let spacedListItems = reposition(listItems);

    spacedListItems.forEach(item => {
        items = setItem(items, item.id, 'parents', parentId, 'order', item.order);
    });

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
    items = setItem(items, itemId, 'parents', newParents);
    // Remove item from prev item and attach next item instead
    if (oldPrevItem) {
        let newNextId = oldNextItem ? oldNextItem.id : null;
        items = setItem(items, oldPrevItem.id, 'parents', parentId, 'next', newNextId);
    }
    // Remove item from next item and attach prev item instead
    if (oldNextItem) {
        let newPrevId = oldPrevItem ? oldPrevItem.id : null;
        items = setItem(items, oldNextItem.id, 'parents', parentId, 'prev', newPrevId);
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
                items = setItem(items, id, 'parents', newParents)
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
    items = setItem(items, newParentItemId, newParentItem);
    items = setItem(items, newChildItemId, newChildItem);
    items = attachItemToParent(newChildItemId, newParentItemId, null, null, items);
    return items;
}

function mergeItems(currentItems, incomingItems) {
    let modifiedItems = currentItems;
    incomingItems.forEach(incomingItem => {
        let currentItem = currentItems[incomingItem.id];
        if (incomingItem.modifiedDate > currentItem.modifiedDate) {
            // Last write wins
            modifiedItems = set(modifiedItems, incomingItem.id, incomingItem);
        }
    });
    return modifiedItems;
}

// function mergeItems(currentItems, incomingItems) {
// /*
//     for item in incomingItems:
//         if currentItems[item.id] === undefined:
//             continue
//         detachItem(item.id)

//     for item in incomingItems:
//         if item.deleted:
//             deleteItem(item.id)
//         removeItem(item, incomingItems)

//     Segments = find all segments in the incoming items
//      for segment in segments:
//          prevAnchor = currentItems[segment.prev]
//          nextAnchor = currentItems[segment.next]
//          if (prevAnchor.next === nextAnchor.prev) {
//             // Items are adjacent. Insert segment.
//          }
//          else {
//             // Mark items in segment conflicted
//             // Add items to top of list?
//          }
// */
//     return currentItems;
// }

// The following merging algorithm assumes that the lists
// we're merging items into have referential integrity. Each
// merge operation must also yield a list with the same integrity.
// Incoming data is not trusted as it may not be intact referentially.
// We do our best to place it. If a good placement can't be found,
// we place the incoming item at the top of the list by default.
function mergeItemsOld(currentItems, incomingItems) {
    let modifiedItems = currentItems;

    let parents = incomingItems.filter(i => Object.keys(i.parents).length <= 0);
    parents.forEach(incomingParent => {
        if (incomingParent.deleted) {
            // Delete parent and any orphaned children
            modifiedItems = deleteItem(incomingParent.id, modifiedItems);
            return;
        }

        // Root items can be added verbatim since they have no references to maintain
        modifiedItems = set(modifiedItems, incomingParent.id, incomingParent);

        // Now handle root's children
        getSortedChildren(incomingParent.id, incomingItems).forEach(incomingItem => {
            if (incomingItem.deleted) {
                modifiedItems = removeItemFromParent(incomingItem.id, incomingParent.id, modifiedItems);
                return;
            }

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

function setItem(items, itemId, ...args) {
    items = set(items, itemId, ...args);
    items = set(items, itemId, 'modifiedDate', new Date().toISOString());
    return items;
}