

export function createItem(id=null, value="", complete=false, parents=[]) {
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
    items.forEach((item) => {
        if (item.parents.length <= 0) {
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
    let children = items.filter(item => {
        return item.parents.find(parent => parent.id === parentId);
    });
    let firstChild = children.find(item => {
        let parent = item.parents.find(parent => parent.id === parentId);
        return parent.prev === null;
    });
    let sortedChildren = [];
    let child = firstChild;
    let parent;
    const matchNextItem = item => item.id === parent.next;
    while (child) {
        sortedChildren.push(child);
        parent = child.parents.find(parent => parent.id === parentId);
        if (!parent || parent.next === null) {
            break;
        }
        child = children.find(matchNextItem);
    }
    return sortedChildren;
}