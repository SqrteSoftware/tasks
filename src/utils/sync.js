import debounce from 'lodash/debounce'

import {BASE_URL} from '../config'
import {syncedUp, syncedDown} from '../actions/syncActions'
import {syncItems} from '../actions/itemsActions'
import * as app_crypto from './app_crypto'
import * as utils from '.'

const ITEMS_TO_SYNC_STORAGE_KEY = 'itemsToSync';

let apiUrl = BASE_URL + '/items';
let globalPriorState = null;

export function initSync(store) {
    globalPriorState = store.getState();

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
    let items = store.getState().items;
    let userId = store.getState().user.id;
    let priorState = globalPriorState;
    globalPriorState = store.getState();

    if (priorState.items === items) {
        console.log("No changes, skipping sync...");
        return;
    }

    if (userId === null) {
        console.log("No userId, skipping sync...");
        return;
    }

    let itemsToSync = getItemsToSync(store, priorState);
    let keys = await app_crypto.loadLocalKeys();
    let authToken = await app_crypto.generateAuthToken(userId, keys.privateSigningKey);

    // Encrypt data of any items that have values (ie: not deleted)
    for (const item of itemsToSync) {
        if (item.value !== undefined) {
            item.value = await app_crypto.encrypt(item.value, keys.symmetricKey);
        }
    }

    // Group items by chunkSize so they can be sent in bulk requests
    let chunkedPreparedItems = [];
    let chunkSize = 50;
    for (let i = 0; i < itemsToSync.length; i += chunkSize) {
        let chunkOfItems = itemsToSync.slice(i, i + chunkSize);
        chunkedPreparedItems.push(chunkOfItems);
    }

    // Upload items in chunks
    let error = false;
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
                    break;
                }
                error = true;
                console.log("ERROR STATUS CODE: ", attempt, chunk, res);
            } catch (e) {
                error = true;
                console.log('Failed to update items: ', attempt, chunk, e)
            }
        }
    }
    if (!error) {
        // Calling this will cause syncUp to be invoked again,
        // but without changes so it will exit immediately.
        store.dispatch(syncedUp());
        clearItemsToSync();
    }
}


function getItemsToSync(store, priorState) {
    let lastSyncUp = store.getState().sync.lastSyncUp;
    let items = store.getState().items;
    let priorItems = priorState.items;

    let preparedItems = loadItemsToSync();
    if (lastSyncUp === null) {
        // First time syncing. Sync all items. No deletions needed.
        preparedItems = {};
        Object.keys(items).forEach(itemId => {
            let item = utils.clone(items[itemId]);
            preparedItems[item.id] = item;
        });
    }
    else {
        // Collect changed/new items
        Object.keys(items).forEach(itemId => {
            let item = items[itemId];
            let priorItem = priorItems[itemId];
            if (item !== priorItem) {
                let preparedItem = utils.clone(item);
                preparedItems[item.id] = preparedItem;
            }
        });
        // Collect deleted items
        Object.keys(priorItems).forEach(priorItemId => {
            if (items[priorItemId] === undefined) {
                let preparedItem = {
                    id: priorItemId,
                    deleted: true,
                    modifiedDate: new Date().toISOString()
                };
                preparedItems[priorItemId] = preparedItem;
            }
        });
    }
    saveItemsToSync(preparedItems);

    let listOfPreparedItems = [];
    Object.keys(preparedItems).forEach(itemId => {
        listOfPreparedItems.push(preparedItems[itemId]);
    });
    return listOfPreparedItems;
}


function saveItemsToSync(preparedItems) {
    localStorage.setItem(
        ITEMS_TO_SYNC_STORAGE_KEY, JSON.stringify(preparedItems));
}

function loadItemsToSync() {
    let items = JSON.parse(localStorage.getItem(ITEMS_TO_SYNC_STORAGE_KEY));
    return  items || {};
}

function clearItemsToSync() {
    localStorage.setItem(
        ITEMS_TO_SYNC_STORAGE_KEY, JSON.stringify({}));
}


export async function syncDown(store) {
    let userId = store.getState().user.id;

    let lastSyncDown = store.getState().sync.lastSyncDown;

    if (userId === null) return;

    let keys = await app_crypto.loadLocalKeys();
    let authToken = await app_crypto.generateAuthToken(userId, keys.privateSigningKey);

    let queryParams = '?'
    if (typeof lastSyncDown === 'string') {
         // Get items synced since the last sync date
        queryParams += 'synced-since=' + encodeURIComponent(lastSyncDown);
    }

    let latestSyncDate = '';
    fetch(apiUrl + queryParams, {
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
        latestSyncDate = json.latestSyncDate
        let raw_items = json.items;
        let items = raw_items.map(async (item) => {
            if (item.value.data !== undefined) {
                item.value = await app_crypto.decrypt(item.value, keys.symmetricKey);
            }
            return item;
        })
        return Promise.all(items);
    }).then(items => {
        if (items.length > 0) {
            // Store downloaded items
            store.dispatch(syncItems(items));
            // Indicate sync down complete
            store.dispatch(syncedDown(latestSyncDate));
        }
        else {
            console.log("Sync: no items updated since last sync")
        }
    }).catch(res => {
        if (res.json) {
            res.json().then(err => console.log(err))
        }
        else {
            console.log('Error: ', res)
        }
    });
}
