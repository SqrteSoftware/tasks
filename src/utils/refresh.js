let lastLoadedTime = Date.now();

export function keepFresh() {
    window.addEventListener('blur', async () => {
        // The tab has lost focus. Check to see if it's been more than
        // a day since refresh. If it has, perform a refresh.
        let currentTime = Date.now();
        if (currentTime - lastLoadedTime > (60 * 60 * 24 * 1000)) {
            try {
                // Check if we're online - will throw exception if not
                await fetch(window.location.href, {method: 'HEAD'});
                // If we're online, refresh the page
                window.location.reload();
            } catch {}
        }
    });
}

export function refresh() {
    window.location.reload();
}