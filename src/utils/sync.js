import {BASE_URL} from '../config'
import {clearSync} from '../actions/syncActions'
import {syncItems} from '../actions/itemsActions'
import * as app_crypto from './app_crypto'
import * as utils from '.'


let apiUrl = BASE_URL + '/items';


export async function syncUpAll(store) {
    let items = store.getState().items;
    let userId = store.getState().user.id;

    if (userId === null) {
        console.log("No userId, skipping sync...");
        return;
    }

    let keys = await app_crypto.loadLocalKeys();
    let authToken = await app_crypto.generateAuthToken(userId, keys.privateSigningKey);

    // Encrypt items before sending
    let encrypted_items = [];
    let itemKeys = Object.keys(items);
    for (let i = 0; i < itemKeys.length; i++) {
        let item = utils.clone(items[itemKeys[i]]);
        item.value = await app_crypto.encrypt(item.value, keys.symmetricKey);
        encrypted_items.push(item);
    }

    // Split list of items into chunks
    let encrypted_item_chunks = [];
    let chunk_size = 50;
    for (let i = 0; i < encrypted_items.length; i += chunk_size) {
        let chunk = encrypted_items.slice(i, i + chunk_size);
        encrypted_item_chunks.push(chunk);
    }

    // Upload items in chunks
    encrypted_item_chunks.forEach(async (encrypted_item_chunk) => {
        fetch(apiUrl, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authToken
            },
            body: JSON.stringify(encrypted_item_chunk)
        }).then((res) => {
            console.log("UPDATE:", encrypted_item_chunk, res);
        }).catch(res => {
            console.log('Failed to upload items: ', encrypted_item_chunk, res)
        });
    });
}


export async function syncUp(store) {
    let changes = store.getState().sync;
    let items = store.getState().items;
    let userId = store.getState().user.id;

    if (!changes || Object.keys(changes).length <= 0) {
        console.log("No changes, skipping sync...");
        return;
    }

    // Being overly optimistic here! Calling this will cause syncUp to
    // be invoked again, but without changes so it will exit immediately.
    store.dispatch(clearSync());

    if (userId === null) {
        console.log("No userId, skipping sync...");
        return;
    }

    let keys = await app_crypto.loadLocalKeys();
    let authToken = await app_crypto.generateAuthToken(userId, keys.privateSigningKey);

    let updates = [];
    let deletions = [];
    Object.keys(changes).forEach((itemId) => {
        let change = changes[itemId];
        if (change === 'CREATED' || change === 'UPDATED') {
            updates.push(itemId);
        }
        else if (change === 'DELETED') {
            deletions.push(itemId);
        }
    });

    updates.forEach(async (itemId) => {
        let item = utils.clone(items[itemId]);
        // Encrypt item data before sending
        item.value = await app_crypto.encrypt(item.value, keys.symmetricKey);
        fetch(apiUrl, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authToken
            },
            body: JSON.stringify(item)
        }).then((res) => {
            console.log("UPDATE:", item, res);
        }).catch(res => {
            console.log('Failed to update item: ', item, res)
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
        }).catch(res => {
            console.log('Failed to delete item: ', itemId, res)
        });
    });
}

export async function syncDown(store) {
    let userId = store.getState().user.id;

    if (userId === null) return;

    let keys = await app_crypto.loadLocalKeys();
    let authToken = await app_crypto.generateAuthToken(userId, keys.privateSigningKey);

    fetch(apiUrl, {
        method: "GET",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Authorization": authToken
        }
    }).then((res) => {
        // Parse the response
        if (res.status >= 400) throw res
        return res.json();
    }).then(async (json) => {
        // Decrypt item data
        let items = json.map(async (item) => {
            if (item.value.data !== undefined) {
                item.value = await app_crypto.decrypt(item.value, keys.symmetricKey);
            }
            return item;
        })
        return Promise.all(items);
    }).then(items => {
        // Store downloaded items
        store.dispatch(syncItems(items));
    }).catch(res => {
        if (res.json) {
            res.json().then(err => console.log(err))
        }
        else {
            console.log('Error: ', res)
        }
    });
}