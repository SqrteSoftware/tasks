import { v4 as uuidv4 } from 'uuid';

import { createItem } from './utils';

export default function generateTestData(log=true)
{
    // Generate testing items
    let items= {};
    let layouts={lg: []};
    let parentId = null;
    let lastItem = null;
    let parentIndex = 0;
    for (let i = 0; i < 500; i++) {
        let itemId = "item-" + uuidv4();
        let item = createItem(itemId, "item value " + i);
        if (i % 25 === 0) {
            lastItem = null;
            parentId = itemId;
            layouts.lg.push({i: parentId, x: parentIndex%4*3, y: Math.floor(parentIndex/4)*6, w: 3, h: 6, minW: 3, maxW: 4})
            parentIndex++;
        } else if (lastItem === null) {
            item.parents[parentId] = {id: parentId, order: 0};
            lastItem = item;
        } else {
            let lastOrder = lastItem.parents[parentId].order;
            item.parents[parentId] = {id: parentId, order: lastOrder + 100};
            lastItem = item;
        }
        items[item.id] = item;
    }
    log && console.log(items, layouts);
    return {items, layouts};
}