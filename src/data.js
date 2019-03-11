import { createItem } from './utils';

let itemId = 0;

export default function generateTestData()
{
    // Generate testing items
    let itemStore = {};
    let parentId = null;
    let lastItem = null;
    for (let i = 0; i < 40; i++) {
        let item = createItem("item" + itemId++,"item value " + i);
        if (i % 5 === 0) {
            lastItem = null;
            parentId = "item" + i;
        } else if (lastItem === null) {
            item.parents[parentId] = {id: parentId, prev: null, next: null};
            lastItem = item;
        } else {
            item.parents[parentId] = {id: parentId, prev: lastItem.id, next: null};
            lastItem.parents[parentId].next = item.id;
            lastItem = item;
        }
        itemStore[item.id] = item;
    }
    console.log(itemStore);
    return itemStore;
}