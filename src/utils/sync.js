import {BASE_URL} from '../config'
import {clearSync} from '../actions/syncActions'
import {syncItems} from '../actions/itemsActions'
import * as crypto from './crypto'


let apiUrl = BASE_URL + '/items';

export async function syncUp(store) {
    let changes = store.getState().sync;
    let items = store.getState().items;
    let fingerprint = localStorage.getItem('fingerprint');

    if (!changes || Object.keys(changes).length <= 0) {
        console.log("No changes, skipping sync...");
        return;
    }

    // Being overly optimistic here! Calling this will cause syncUp to
    // be invoked again, but without changes so it will exit immediately.
    store.dispatch(clearSync());

    if (fingerprint === null) {
        console.log("No Fingerprint, skipping sync...");
        return;
    }

    let keys = await crypto.loadLocalKeys();
    let authToken = await crypto.generateAuthToken(fingerprint, keys.privateSigningKey);
    console.log(authToken)

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
                "Authorization": authToken
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
                "Authorization": authToken
            },
            body: JSON.stringify(wrappedItem)
        }).then((res) => {
            console.log("DELETE:", itemId, res);
        });
    });
}

export async function syncDown(store) {
    let fingerprint = localStorage.getItem('fingerprint');

    if (fingerprint === null) return;

    let keys = await crypto.loadLocalKeys();
    let authToken = await crypto.generateAuthToken(fingerprint, keys.privateSigningKey);
    console.log(authToken)

    fetch(apiUrl, {
        method: "GET",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Authorization": authToken
        }
    }).then((res) => {
        return res.json();
    }).then((json) => {
        let items = [];
        json.Items.forEach((item) => {
           items.push(item);
        });
        store.dispatch(syncItems(items));
    });
}