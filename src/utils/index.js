

export function createItem(id=null, value="", complete=false, date=null, parents={}) {
    date = date || new Date().toISOString();
    return {
        id,
        value,
        complete,
        completeDate: complete ? date : null,
        createdDate: date,
        modifiedDate: date,
        parents
    };
}

export function createViewData(items) {
    let listData = [];
    Object.keys(items).forEach(itemId => {
        let item = items[itemId];
        if (Object.keys(item.parents).length <= 0) {
            let parentItem = item;
            let children = getSortedListItems(parentItem.id, items, false);
            listData.push({
                'parent': parentItem,
                'firstChild': children[0],
                'children': children.filter(i => !i.complete),
                'history': children.filter(i => i.complete)
                    .sort((a, b) => compareDates(a.completeDate, b.completeDate))
            });
            listData.push();
        }
    });
    return listData;
}

function compareDates(date1, date2) {
    if (!date1) return 1;
    if (!date2) return -1;

    if (date1 > date2) return -1;
    if (date1 < date2) return 1;

    return 0;
}

export function getItemsInList(parentId, items) {
    if (!parentId) return [];
    let children = [];
    Object.keys(items).forEach(itemId => {
        if (items[itemId].parents[parentId]) {
            children.push(items[itemId]);
        }
    });
    return children;
}

export function getFirstItemInList(parentId, items) {
    let firstItemId = Object.keys(items).find(itemId => {
        let item = items[itemId];
        return item.parents[parentId] && item.parents[parentId].prev === null;
    });
    return items[firstItemId];
}

export function getFirstItemInList2(parentId, items) {
    let currentFirstItem = null;
    let currentMinOrder = null;
    let currentOrder = null;
    Object.keys(items).forEach(itemId => {
        let item = items[itemId];
        if (item.parents[parentId]) {
            currentOrder = item.parents[parentId].order;
            if (currentMinOrder === null || currentOrder < currentMinOrder) {
                currentFirstItem = item;
                currentMinOrder = currentOrder;
            }
        }
    });
    return currentFirstItem;
}

export function getSortedListItems(parentId, items, activeOnly=true) {
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

export function getSortedListItems2(parentId, items, activeOnly=true) {
    if (!parentId) return [];
    let children = [];
    Object.keys(items).forEach(itemId => {
        let item = items[itemId]
        if (item.parents[parentId]) {
            if (activeOnly && item.complete) return;
            children.push(item);
        }
    });
    let sortedChildren = [];
    children.sort((item1, item2) => {
        let item1Order = item1.parents[parentId].order;
        let item2Order = item2.parents[parentId].order;
        return  item1Order - item2Order;
    })
    return sortedChildren;
}

export function set() {
    let args = Array.prototype.slice.call(arguments);
    // last arg is value to set
    let value = args.pop();
    // second to last arg is key to set the value to
    let key = args.pop();
    // first arg is the toplevel object to be modified
    let newObj = Object.assign({}, args[0]);
    let retVal = newObj;
    for (let i = 1; i < args.length; i++) {
        newObj[args[i]] = Object.assign({}, newObj[args[i]]);
        newObj = newObj[args[i]];
    }
    newObj[key] = value;
    return retVal;
}

export function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function loadStateFromLocalStorage() {
    try {
        let state = localStorage.getItem('appState');
        if (state === null) {
            return undefined;
        }
        return JSON.parse(state);
    }
    catch (e) {
        return undefined;
    }
}

export function loadUrlQueryParams() {
    let queryParams = new URLSearchParams(window.location.search);
    let queryParamObject = {};
    queryParams.forEach((value, key) => queryParamObject[key] = value);
    return queryParamObject;
}

export function saveStateToLocalStorage(state) {
    try {
        // Before saving to disk, remove any state that should
        // only be stored in-memory.
        let stateToSave = {};
        for (var key in state) {
            if (!state[key].inMemoryOnly) {
                stateToSave[key] = state[key];
            }
        }
        let serializedState = JSON.stringify(stateToSave);
        localStorage.setItem('appState', serializedState);
    }
    catch (e) {
        alert("There was an error while saving");
    }
}

export function downloadJSON(obj, filename) {
    // Serialize and create Blob and data URI out of data
    let serializedItems = JSON.stringify(obj, null, 2);
    var blob = new Blob([serializedItems], {type : 'application/octet-stream'});
    let dataUri = URL.createObjectURL(blob);

    // Create download link
    var el = document.createElement('a');
    el.setAttribute('href', dataUri);
    el.setAttribute('download', filename);

    // Add link to body and trigger download
    document.body.appendChild(el);
    el.click();

    // Cleanup link and data URI
    // Delay required to work around iOS bug
    setTimeout(function(){
        document.body.removeChild(el);
        URL.revokeObjectURL(dataUri);
    }, 500);
}

export function disableTouchMove() {
    // iPhone's dumb. Have to manually disable page scrolling while dragging
    // document.addEventListener('touchmove', preventEvent, {passive: false});
    document.ontouchmove = function(e){ e.preventDefault(); return false; }
}

export function enableTouchMove() {
    // iPhone's dumb. Have to manually re-enable page scrolling while dragging
    // document.removeEventListener('touchmove', preventEvent);
    document.ontouchmove = function(){ return true; }
}

export const preventEvent = (e) => { e.preventDefault(); return false; }

/**
 * Split a list up into a list of chunks
 *
 * @param {*} list the list to split up into chunks
 * @param {*} chunkSize the size of the sub lists
 * @returns a list of lists of size chunksize or smaller
 */
export function chunker(list, chunkSize) {
    let chunkedList = [];
    let currentIndex = 0;
    let endIndex = currentIndex + chunkSize;
    while (currentIndex < list.length) {
        let chunk = []
        while (currentIndex < endIndex) {
            chunk.push(list[currentIndex])
            currentIndex++;
        }
        chunkedList.push(chunk);
        endIndex = Math.min(currentIndex + chunkSize, list.length);
    }
    return chunkedList;
}