import {clearSync} from './actions/syncActions'
import {syncItems} from './actions/itemsActions'


let apiUrl = "https://u9ncjz9oza.execute-api.us-east-1.amazonaws.com/default/bdProcessItems";

export function syncUp(store) {
    let changes = store.getState().sync;
    let items = store.getState().items;
    let apiKey = localStorage.getItem('apiKey');

    if (!changes || Object.keys(changes).length <= 0 || apiKey === null) {
        console.log("No changes, skipping sync...")
        return;
    }

    // Being overly optimistic here!
    store.dispatch(clearSync());

    let updates = [];
    let deletions = [];
    Object.keys(changes).forEach((itemId) => {
        let change = changes[itemId];
        if (change === 'CREATED' || change === 'UPDATED') {
            updates.push(items[itemId]);
        }
        else if (change === 'DELETED') {
            deletions.push(itemId);
        }
    });

    updates.forEach((item) => {
        let wrappedItem = {Item: item};
        fetch(apiUrl, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
            },
            body: JSON.stringify(wrappedItem)
        }).then((res) => {
            console.log("UPDATE:", item, res);
        });
    });

    deletions.forEach((itemId) => {
        let wrappedItem = {Key: {id: itemId}};
        fetch(apiUrl, {
            method: "DELETE",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
            },
            body: JSON.stringify(wrappedItem)
        }).then((res) => {
            console.log("DELETE:", itemId, res);
        });
    });
}

export function syncDown(store) {
    let apiKey = localStorage.getItem('apiKey');
    if (apiKey === null) return;

    fetch(apiUrl, {
        method: "GET",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
        }
    }).then((res) => {
        return res.json();
    }).then((json) => {
        let items = {};
        json.Items.forEach((item) => {
           items[item.id] = item;
        });
        store.dispatch(syncItems(items));
    });
}