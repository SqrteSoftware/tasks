

export function createItem(id=null, value="", complete=false, parents={}) {
    return {
        id,
        value,
        complete,
        parents
    };
}

export function createViewData(items) {
    let listData = [];
    Object.keys(items).forEach(itemId => {
        let item = items[itemId];
        if (Object.keys(item.parents).length <= 0) {
            let parentItem = item;
            let children = getChildrenItems(parentItem.id, items);
            listData.push({
                'parent': parentItem,
                'children': children.filter(i => !i.complete),
                'history': children.filter(i => i.complete)
            });
            listData.push();
        }
    });
    return listData;
}

export function getChildrenItems(parentId, items) {
    let children = [];
    Object.keys(items).forEach(itemId => {
       if (items[itemId].parents[parentId]) {
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

export function set() {
    let args = Array.prototype.slice.call(arguments);
    // last arg is value to set
    let value = args.pop();
    // second to last arg is key to set the value to
    let key = args.pop();
    // first arg it the toplevel object to be modified
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

export function saveStateToLocalStorage(state) {
    try {
        let serializedState = JSON.stringify(state);
        localStorage.setItem('appState', serializedState);
    }
    catch (e) {
        alert("There was an error while saving");
    }
}

export function downloadJSON(obj, filename) {
    // Serialize and create Blob and data URI out of data
    let serializedItems = JSON.stringify(obj, null, 2);
    var blob = new Blob([serializedItems], {type : 'application/json'});
    let dataUri = URL.createObjectURL(blob);

    // Create download link
    var el = document.createElement('a');
    el.setAttribute('href', dataUri);
    el.setAttribute('download', filename);

    // Add link to body and trigger download
    document.body.appendChild(el);
    el.click();

    // Cleanup link and data URI
    document.body.removeChild(el);
    URL.revokeObjectURL(dataUri);
}