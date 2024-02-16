import { v4 as uuidv4 } from 'uuid';

let lastLoadedTime = Date.now()

export function keepFresh() {
    window.addEventListener('visibilitychange', async () => {
        if (isOnline()) {
            let currentTime = Date.now();
            if (currentTime - lastLoadedTime > (60 * 60 * 24 * 1000)) {
                // If it's been more than a day since
                // refresh then perform a refresh.
                refresh()
            }
        }
    });
}

async function isOnline() {
    try {
        // Will throw exception if not online
        await fetch(window.location.href + uuidQuery(), {method: 'HEAD'});
        return true
    } catch {
        return false
    }
}

function uuidQuery() {
    if (! localStorage.getItem('uuid')) {
        localStorage.setItem('uuid', uuidv4())
    }
    let query = '?' + new URLSearchParams({id: localStorage.getItem('uuid')})
    return query
}

export function refresh() {
    window.location.reload();
}