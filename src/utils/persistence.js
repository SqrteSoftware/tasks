let currentMutations = 1;
let mutationThreshold = 2;
let persistenceActive = false;

// Ask the browser to protect this domain's local storage
// from user-agent cleanup:
// https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/offline-for-pwa
// https://storage.spec.whatwg.org/
// https://developers.google.com/web/updates/2016/06/persistent-storage
export function persistenceCheck(hasSync) {
    if (persistenceActive) return;
    if (currentMutations++ % mutationThreshold !== 0) return;

    // Only users without sync subscriptions need to see persistence alerts
    if (!hasSync) {
        if (navigator.vendor.toLowerCase().includes('apple')) {
            let msg = "WARNING: Unfortunately Safari (and iOS in general) do not adequately support " +
                "persistent storage. This means your local data could be deleted without warning. " +
                "We recommend using one of these browsers instead while using the free version of " +
                "Sqrte Tasks: Brave, Chrome, Edge, and FireFox.\n\n" +

                "Alternatively, you can also sign up for a sync subscription, which will store your data " +
                "safely in the cloud.";
            alert(msg);
            return;
        }
        else if ((!navigator.storage || !navigator.storage.persisted || !navigator.storage.persist)) {
            let msg = "WARNING: Unfortunately your browser does not adequately support persistent storage. " +
                "This means your local data could be deleted without warning. We recommend using one of " +
                "these browsers instead while using the free version of Sqrte Tasks: " +
                "Brave, Chrome, Edge, and FireFox.\n\n" +

                "Alternatively, you can also sign up for a sync subscription, which will store your data " +
                "safely in the cloud.";
            alert(msg);
            return;
        }
    }

    navigator.storage.persisted().then((persisted) => {
        persistenceActive = persisted;
        if (persistenceActive) return undefined;
        return navigator.storage.persist();
    }).then(persisted => {
        if (persisted === undefined) return;
        persistenceActive = persisted;
        // Only users without sync subscriptions need to see persistence alerts
        if (!hasSync && !persistenceActive) {
            let msg = "WARNING: Sqrte Tasks was denied permission to use 'protected persistent storage', " +
                "which is required to preserve your data.\n\n" +

                "This can happen if the browser does not consider the site to be important. " +
                "Try bookmarking the page to indicate importance.\n\n" +

                "If you explicitly denied a prompt to use persistent storage, you " +
                "will need to manually unblock the request.\n\n" +

                "Permission will be requested again soon. You will be notified if the issue remains."
            alert(msg);
        }
    })
}