import {clearSync} from './actions/syncActions'

export function sync(store) {
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
        let url = "https://u9ncjz9oza.execute-api.us-east-1.amazonaws.com/default/bdProcessItems";
        fetch(url, {
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
        let url = "https://u9ncjz9oza.execute-api.us-east-1.amazonaws.com/default/bdProcessItems";
        fetch(url, {
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
