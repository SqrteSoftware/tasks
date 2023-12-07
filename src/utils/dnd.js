import { getSortedListItems } from '.';
import { findAdjacent } from './order';


let items = {}
let itemRefsById = {}
let listRefsById = {}

let dndStatus = {
    overlappedListId: null,
    nearestItemId: null,
    nearestItemPos: null
}


export function onItemRef(e) {
    let {item, ref} = e
    if (ref !== null) {
        itemRefsById[item.id] = ref
        items[item.id] = item
    }
    else {
        delete itemRefsById[item.id]
        delete items[item.id]
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


export function onItemDragProgress(itemId) {
    let overlappedListId = findOverlappedBoundId(getItemBound(itemId), getListBoundsById())
    let listItems = getSortedListItems(overlappedListId, items)
    let nearestItem = findNearestBound(itemId, getItemBound(itemId), getItemBoundsById(listItems))

    setDndStatus(overlappedListId, nearestItem.id, nearestItem.position)
    return [overlappedListId, nearestItem.id, nearestItem.position]
}


export function onItemDragStop(draggedItemId, currentListId) {
    let { overlappedListId, nearestItemId, nearestItemPos} = dndStatus
    setDndStatus(null, null, null)

    if (nearestItemId) {
        // Find the dragged item's new prev and next
        let adjacentItems = findAdjacent(nearestItemId, overlappedListId, items);
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


function getItemBound(itemId) {
    return itemRefsById[itemId].getBoundingClientRect()
}


function getItemBoundsById(items) {
    let boundsById = {}
    items.forEach(item => {
        boundsById[item.id] = itemRefsById[item.id].getBoundingClientRect()
    })
    return boundsById
}


function getListBoundsById() {
    let listBoundsById = {}
    Object.keys(listRefsById).forEach(listId => {
        listBoundsById[listId] = listRefsById[listId].getBoundingClientRect()
    })
    return listBoundsById
}


function setDndStatus(overlappedListId, nearestItemId, nearestItemPos) {
    dndStatus = {overlappedListId, nearestItemId, nearestItemPos}
}


/**
 * Given a bound, find the bound it overlaps from the list of bounds.
 * @param hoverBound The bound to compare to other bounds
 * @param boundsById The other bounds to check for overlap
 * @returns The id of the overlapped bound or null
 */
function findOverlappedBoundId(hoverBound, boundsById) {
    let hoverMidX = hoverBound.x + (hoverBound.width / 2);
    let hoverMidY = hoverBound.y + (hoverBound.height / 2);
    let overlappedId = null;
    Object.keys(boundsById).forEach((boundId) => {
        let bound = boundsById[boundId];
        if (hoverMidX > bound.left && hoverMidY > bound.top) {
            if (hoverMidX < bound.right && hoverMidY < bound.bottom) {
                overlappedId = boundId;
            }
        }
    });
    return overlappedId;
}


/**
 * Given a dragged bound and a set of other bounds around it, find the nearest
 * bound to the one being dragged.
 * @param {*} draggedBoundId the id of the dragged bound
 * @param {*} draggedBound the DOM bound of the dragged bound
 * @param {*} otherBoundsById the other DOM bounds to compare to
 * @returns an object conveying the id and position of the nearest bound.
 */
function findNearestBound(draggedBoundId, draggedBound, otherBoundsById) {
    let draggedMidY = draggedBound.y + (draggedBound.height / 2);
    let nearestBound = {id: null, position: null};
    let currentLeastDistance = null;
    Object.keys(otherBoundsById).forEach((otherBoundId) => {
        if (otherBoundId === draggedBoundId) return;
        let otherBound = otherBoundsById[otherBoundId]
        let otherBoundMidY = otherBound.y + (otherBound.height / 2)
        if (Math.abs(draggedMidY - otherBoundMidY) < currentLeastDistance
            || currentLeastDistance === null) {
            currentLeastDistance = Math.abs(draggedMidY - otherBoundMidY);
            nearestBound.id = otherBoundId;
            nearestBound.position = draggedMidY <= otherBoundMidY ? 'above' : 'below';
        }
    });
    return nearestBound;
}