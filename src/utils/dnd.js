import { getSortedListItems } from '.';
import { findAdjacent } from './order';


let itemsState = null
let dndState = null
let itemRefsById = {}
let listRefsById = {}


export function setItemsState(items) {
    itemsState = items
}

export function setDndState(dnd) {
    dndState = dnd
}

export function onItemRef(obj) {
    if (obj.ref !== null) {
        itemRefsById[obj.id] = obj.ref;
    }
    else {
        delete itemRefsById[obj.id];
    }
}

export function onListRef(obj) {
    if (obj.ref !== null) {
        listRefsById[obj.id] = obj.ref;
    }
    else {
        delete listRefsById[obj.id];
    }
}

export function onItemDragStart(itemId, parentId) {
    let listBoundsById = getListBounds()
    let overlappedListId = getOverlappedListId(itemId, itemRefsById, listBoundsById)
    let listItems = getSortedListItems(overlappedListId, itemsState)
    let itemBoundsById = getItemBounds(listItems)
    let nearestItem = findNearestItem(itemId, listItems, itemBoundsById)

    return [parentId, overlappedListId, nearestItem.id, nearestItem.position]
}

export function onItemDrag(itemId) {
    // Update bounds of items for currently overlapped list
    let listBoundsById = getListBounds()
    let overlappedListId = getOverlappedListId(itemId, itemRefsById, listBoundsById);
    let listItems = getSortedListItems(overlappedListId, itemsState);

    // Add dragged item
    listItems.push(itemsState[itemId])
    // Find the nearest item in the currently overlapped list
    let itemBoundsById = getItemBounds(listItems)
    let nearestItem = findNearestItem(itemId, listItems, itemBoundsById);

    return [undefined, overlappedListId, nearestItem.id, nearestItem.position]
}

export function onItemDragStop(draggedItemId, currentListId) {
    let nearestItemId = dndState.nearestItemId;
    let nearestItemPos = dndState.nearestItemPos;
    let overlappedListId = dndState.overlappedListId;
    if (nearestItemId) {
        // Find the dragged item's new prev and next
        let adjacentItems = findAdjacent(nearestItemId, overlappedListId, itemsState);
        let nextId = adjacentItems.next?.id || null;
        let prevId = adjacentItems.prev?.id || null;
        let draggedItemNewPrev = nearestItemPos === 'above' ? prevId : nearestItemId;
        let draggedItemNewNext = nearestItemPos === 'above' ? nearestItemId : nextId;
        // Only insert dragged item into new position if the dragged item is
        // NOT the same as the new next or new prev item. If it is the same,
        // then we're dropping the item into the same place it was in.
        if (draggedItemId !== draggedItemNewPrev &&
            draggedItemId !== draggedItemNewNext) {
            return [
                draggedItemId,
                currentListId,
                overlappedListId,
                draggedItemNewPrev,
                draggedItemNewNext
            ]
        }
    }
}

function getListBounds() {
    let listBoundsById = {}
    Object.keys(listRefsById).forEach(listId => {
        listBoundsById[listId] = listRefsById[listId].getBoundingClientRect()
    })
    return listBoundsById
}

function getItemBounds(items) {
    let itemBoundsById = {}
    items.forEach(item => {
        itemBoundsById[item.id] = itemRefsById[item.id].getBoundingClientRect()
    })
    return itemBoundsById
}

function getOverlappedListId(itemId, itemRefsById, listBoundsById) {
    let itemRef = itemRefsById[itemId];
    let itemBound = itemRef.getBoundingClientRect();
    return findOverlappedBoundId(itemId, itemBound, listBoundsById);
}

function findOverlappedBoundId(hoverId, hoverBound, boundsById) {
    let hoverMidX = hoverBound.x + (hoverBound.width / 2);
    let hoverMidY = hoverBound.y + (hoverBound.height / 2);
    let coveredId = null;
    Object.keys(boundsById).forEach((boundId) => {
        if (boundId === hoverId) return;
        let bound = boundsById[boundId];
        if (hoverMidX > bound.left && hoverMidY > bound.top) {
            if (hoverMidX < bound.right && hoverMidY < bound.bottom) {
                coveredId = boundId;
            }
        }
    });
    return coveredId;
}

function findNearestItem(draggedId, listItems, itemBoundsById) {
    let draggedBound = itemBoundsById[draggedId];
    let draggedMidY = draggedBound.y + (draggedBound.height / 2);

    let nearestItem = {id: null, position: null};
    let currentLeastDistance = null;
    listItems.forEach((item) => {
        let itemId = item.id;
        if (itemId === draggedId) return;
        let itemBound = itemBoundsById[itemId];
        let itemMidY = itemBound.y + (itemBound.height / 2);
        if (Math.abs(draggedMidY - itemMidY) < currentLeastDistance
            || currentLeastDistance === null) {
            currentLeastDistance = Math.abs(draggedMidY - itemMidY);
            nearestItem.id = itemId;
            nearestItem.position = draggedMidY <= itemMidY ? 'above' : 'below';
        }
    });
    return nearestItem;
}