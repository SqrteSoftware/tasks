import uuidv4 from 'uuid'

import { createItem } from './utils';

let itemId = 0;

export default function generateTestData()
{
    // Generate testing items
    let items= {};
    let layouts={lg: []};
    let parentId = null;
    let lastItem = null;
    let parentIndex = 0;
    for (let i = 0; i < 40; i++) {
        let itemId = "item-" + uuidv4();
        let item = createItem(itemId, "item value " + i);
        if (i % 5 === 0) {
            lastItem = null;
            parentId = itemId;
            layouts.lg.push({i: parentId, x: parentIndex%4*3, y: Math.floor(parentIndex/4)*6, w: 3, h: 6, minW: 3, maxW: 4})
            parentIndex++;
        } else if (lastItem === null) {
            item.parents[parentId] = {id: parentId, prev: null, next: null};
            lastItem = item;
        } else {
            item.parents[parentId] = {id: parentId, prev: lastItem.id, next: null};
            lastItem.parents[parentId].next = item.id;
            lastItem = item;
        }
        items[item.id] = item;
    }
    console.log(items, layouts);
    return {items, layouts};
}