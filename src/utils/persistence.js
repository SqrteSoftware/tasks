let currentMutations = 1;
let mutationThreshold = 2;
let persistenceActive = false;

// Ask the browser to protect this domain's local storage
// from user-agent cleanup:
// https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/offline-for-pwa
// https://storage.spec.whatwg.org/
// https://developers.google.com/web/updates/2016/06/persistent-storage
export function persistenceCheck() {
    if (persistenceActive) return;
    if (currentMutations++ % mutationThreshold !== 0) return;

    if (!navigator.storage || !navigator.storage.persisted || !navigator.storage.persist) {
        let msg = "WARNING: This browser does not support protected persistent " +
            "storage. Please use a different browser to prevent data loss." +
            "Any of these should work: Brave, Chrome, Edge, FireFox, or Safari."
        alert(msg);
        return;
    }

    navigator.storage.persisted().then((persisted) => {
        persistenceActive = persisted;
        if (persistenceActive) return undefined;
        return navigator.storage.persist();
    }).then(persisted => {
        if (persisted === undefined) return;
        persistenceActive = persisted;
        if (persistenceActive) {
            let msg = "Sqrte Tasks successfully received permission to use 'protected " +
            "persistent storage'. Your data is now protected."
            alert(msg);
        }
        else {
            let msg = "WARNING: Sqrte Tasks was denied permission to use 'protected persistent storage', " +
            "which is required to preserve your data.\n\n" +

            "This can happen if the browser does not consider the site to be important. " +
            "Try bookmarking the page to indicate importance.\n\n" +

            "If you explicitly denied a prompt to use persistent storage, you " +
            "will need to manually unblock the request.\n\n" +

            "Permission will be requested again soon."
            alert(msg);
        }
    })
}