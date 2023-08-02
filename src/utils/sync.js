import debounce from 'lodash/debounce'

import {BASE_URL} from '../config'
import {
    upsertChangeMarkers,
    updateIsSyncing,
    deleteChangeMarkers,
    updateSyncUpDate,
    updateSyncDownDate
} from '../slices/syncSlice'
import {syncItems} from '../actions/itemsActions'
import * as app_crypto from './app_crypto'
import * as utils from '.'
import { chunker } from '.';


let apiUrl = BASE_URL + '/items';
let globalPriorState = null;


export function initSync(store) {
    // Initialize prior state
    globalPriorState = store.getState();

    // When edits are being made, sync up every second
    store.subscribe(debounce(() => {
        let capturedNewChanges = attemptCaptureChanges(store);
        if (capturedNewChanges) {
            attemptSyncUp(store);
        }
    }, 1000, {leading: true}));

    // Sync up after going online
    window.addEventListener('online', () => {
        attemptSyncUp(store);
    });

    // Sync up when focus is received
    window.addEventListener('visibilitychange', () => {
        if (navigator.onLine && !document.hidden) {
            attemptSyncUp(store);
        }
    });

    // Sync down on page load
    syncDown(store);
}


function attemptCaptureChanges(store) {
    if (!hasUserAccount(store)) {
        return false;
    }
    if (!hasUncapturedChanges(store)) {
        return false;
    }
    return captureChanges(store)
}


function hasUncapturedChanges(store) {
    return store.getState().items !== globalPriorState.items;
}


function captureChanges(store) {
    let changeMarkers;
    if (store.getState().sync.lastSyncUp === null) {
        // Initial Sync. All items will have change markers assigned.
        changeMarkers = determineChanges(store.getState().items, {});
    }
    else {
        // Figure out which items have changed.
        changeMarkers = determineChanges(store.getState().items, globalPriorState.items);
    }
    // Now that changes have been determined, set current state as prior state.
    globalPriorState = store.getState();

    // Save the change markers if any were found
    if (Object.keys(changeMarkers).length > 0) {
        store.dispatch(upsertChangeMarkers(changeMarkers));
        return true;
    }
    return false;
}


function determineChanges(currentItems, priorItems) {
    let changeMarkers = {};

    // Collect changed/new items
    Object.keys(currentItems).forEach(currentItemId => {
        let currentItem = currentItems[currentItemId];
        let priorItem = priorItems[currentItemId];
        if (currentItem !== priorItem) {
            changeMarkers[currentItem.id] = {
                type: "UPDATED",
                date: currentItem.modifiedDate
            };
        }
    });

    // Collect deleted items
    Object.keys(priorItems).forEach(priorItemId => {
        if (currentItems[priorItemId] === undefined) {
            changeMarkers[priorItemId] = {
                type: "DELETED",
                date: new Date().toISOString()
            };
        }
    });

    return changeMarkers;
}


async function attemptSyncUp(store) {
    // Don't sync if syncing is already in process
    if (store.getState().sync.isSyncing) {
        console.log("SyncUp: Already Syncing")
        return;
    }
    // Don't sync if we're not online
    if (!navigator.onLine) {
        console.log("SyncUp: Not Online")
        return
    }
    // Don't sync if there is no user account
    if (!hasUserAccount(store)) {
        console.log("SyncUp: No User Account")
        // return;
    }
    // Exit if there are no changes to sync
    if (!hasCapturedChanges(store)) {
        console.log("SyncUp: No Changes")
        return;
    }
    await syncUp(store);
}


async function syncUp(store) {
    console.log('Syncing UP')
    store.dispatch(updateIsSyncing(true));

    let keys = await app_crypto.loadLocalKeys();
    let userId = store.getState().user.id;
    let authToken = await app_crypto.generateAuthToken(userId, keys.privateSigningKey);
    let success = false;
    do {
        let changeMarkers = store.getState().sync.changeMarkers;
        let preparedItems = await getPreparedItems(store.getState().items, changeMarkers, keys);
        let chunkedPreparedItems = chunker(preparedItems, 50);

        console.log(chunkedPreparedItems)

        success = await uploadBatches(chunkedPreparedItems, authToken);
        if (success) {
            store.dispatch(deleteChangeMarkers(changeMarkers));
            store.dispatch(updateSyncUpDate());
        }
        // If more changes came in while processing, keep syncing
    } while (success && hasCapturedChanges(store))

    store.dispatch(updateIsSyncing(false));
}


function hasUserAccount(store) {
    return store.getState().user.id !== null
}


function hasCapturedChanges(store) {
    return Object.keys(store.getState().sync.changeMarkers).length > 0;
}


async function getPreparedItems(items, changeMarkers, keys) {
    let preparedItems = [];

    // Build list of items based on change events
    Object.keys(changeMarkers).forEach(itemId => {
        let changeEvent = changeMarkers[itemId];
        let originalItem = items[itemId];

        if (changeEvent.type === 'UPDATED') {
            let preparedItem = utils.clone(originalItem);
            preparedItems.push(preparedItem)
        }
        else if (changeEvent.type === 'DELETED') {
            let preparedItem = {
                id: itemId,
                deleted: true,
                modifiedDate: changeEvent.date
            };
            preparedItems.push(preparedItem);
        }
    });

    // Encrypt data of any items that have values (ie: not deleted)
    for (const item of preparedItems) {
        if (item.value !== undefined) {
            item.value = await app_crypto.encrypt(item.value, keys.symmetricKey);
        }
    }

    return preparedItems;
}


async function uploadBatches(batches, authToken) {
    let success = true;
    let max_attempts = 3;
    for (const batch of batches) {
        for (let attempt = 1; attempt <= max_attempts; attempt++) {
            try {
                let res = await fetch(apiUrl, {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": authToken
                    },
                    body: JSON.stringify(batch)
                });
                if (res.status === 200)  {
                    console.log("PROCESSED:", attempt, batch, res);
                    success = true;
                    break;
                }
                success = false;
                console.log("ERROR STATUS CODE: ", attempt, batch, res);
            } catch (e) {
                success = false;
                console.log('Failed to update items: ', attempt, batch, e)
            }
            if (attempt < max_attempts) {
                // Wait before retrying
                await new Promise(r => setTimeout(r, 2000 * attempt));
            }
        }
    }
    return success;
}


export async function syncDown(store) {
    if (!hasUserAccount(store)) {
        return;
    }

    store.dispatch(updateIsSyncing(true));

    let keys = await app_crypto.loadLocalKeys();
    let userId = store.getState().user.id;
    let authToken = await app_crypto.generateAuthToken(userId, keys.privateSigningKey);

    let queryParams = '?'
    let lastSyncDown = store.getState().sync.lastSyncDown;
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
            store.dispatch(updateSyncDownDate(latestSyncDate));
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
    }).finally(() => {
        store.dispatch(updateIsSyncing(false));
    });
}