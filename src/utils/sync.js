import debounce from 'lodash/debounce'

import {BASE_URL} from '../config'
import {clearSync} from '../actions/syncActions'
import {syncItems} from '../actions/itemsActions'
import * as app_crypto from './app_crypto'
import * as utils from '.'


let apiUrl = BASE_URL + '/items';


export function initSync(store) {
    // When edits are being made, sync up every second
    store.subscribe(debounce(() => {
        if (navigator.onLine) {
            console.log('syncUp')
            syncUp(store);
        }
    }, 1000, {leading: true}));

    // Sync up after going online
    window.addEventListener('online', () => {
        syncUp(store);
    });

    // Sync up when focus is received
    window.addEventListener('visibilitychange', () => {
        if (navigator.onLine && !document.hidden) {
            syncUp(store);
        }
    });

    // Sync down on page load
    syncDown(store);
}


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

    if (userId === null) {
        console.log("No userId, skipping sync...");
        return;
    }

    let keys = await app_crypto.loadLocalKeys();
    let authToken = await app_crypto.generateAuthToken(userId, keys.privateSigningKey);

    let preparedItems = []
    Object.keys(changes).forEach((itemId) => {
        let changeType = changes[itemId];
        if (changeType === 'CREATED' || changeType === 'UPDATED') {
            let item = utils.clone(items[itemId]);
            preparedItems.push(item);
        }
        else if (changeType === 'DELETED') {
            let item = {id: itemId, deleted: true};
            preparedItems.push(item);
        }
    });

    // Encrypt data of any items that have values (ie: not deleted)
    for (const item of preparedItems) {
        if (item.value) {
            item.value = await app_crypto.encrypt(item.value, keys.symmetricKey);
        }
    }

    // Group items by chunkSize so they can be sent in bulk requests
    let chunkedPreparedItems = [];
    let chunkSize = 50;
    for (let i = 0; i < preparedItems.length; i += chunkSize) {
        let chunkOfItems = preparedItems.slice(i, i + chunkSize);
        chunkedPreparedItems.push(chunkOfItems);
    }

    // Upload items in chunks
    for (const chunk of chunkedPreparedItems) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                let res = await fetch(apiUrl, {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": authToken
                    },
                    body: JSON.stringify(chunk)
                });
                if (res.status === 200)  {
                    console.log("PROCESSED:", attempt, chunk, res);
                    // Calling this will cause syncUp to be invoked again,
                    // but without changes so it will exit immediately.
                    store.dispatch(clearSync());
                    break;
                }
                console.log("ERROR STATUS CODE: ", attempt, chunk, res);
            } catch (e) {
                console.log('Failed to update items: ', attempt, chunk, e)
            }
        }
    }
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