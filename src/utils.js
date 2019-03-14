

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
    let index = 0;
    Object.keys(items).forEach(itemId => {
        let item = items[itemId];
        if (Object.keys(item.parents).length <= 0) {
            let parentItem = item;
            listData.push({
                'parent': parentItem,
                'children': getChildrenItems(parentItem.id, items),
                'layout':  {x: index%3*4, y: 0, w: 4, h: 6, minW: 4, maxW: 4}
            });
            listData.push();
            index++;
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
    let firstChild = children.find(item => {
        return item.parents[parentId].prev === null;
    });
    let sortedChildren = [];
    let child = firstChild;
    let parent;
    const matchNextItem = item => item.id === parent.next;
    while (child) {
        sortedChildren.push(child);
        parent = child.parents[parentId];
        if (!parent || parent.next === null) {
            break;
        }
        child = children.find(matchNextItem);
    }
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