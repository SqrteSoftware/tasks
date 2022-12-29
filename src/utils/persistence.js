let currentMutations = 1;
let mutationThreshold = 2;


// Ask the browser to protect this domain's local storage
// from user-agent cleanup:
// https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/offline-for-pwa
// https://storage.spec.whatwg.org/
// https://developers.google.com/web/updates/2016/06/persistent-storage
export async function persistenceCheck(hasSync) {
    if (currentMutations++ % mutationThreshold !== 0) return;

    if (await navigator.storage.persisted()) {
        // Storage was already persistent. Nothing more to do.
        console.log('Persistence Granted')
        return;
    }

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

    if (await navigator.storage.persist()) {
        // Storage was not persistent, but now it is.
        return;
    }

    if (await Notification.requestPermission() === 'granted') {
        // Chromium browsers require permission to show notifications before
        // they will allow persistent storage to be requested. Now that we have
        // notification permission, try requesting persistence permission again.
        if (await navigator.storage.persist()) {
            return;
        }
    }

    // Despite our best efforts, the user/browser has denied all attempts to mark
    // local storage as persistent. Display a warning to the user.
    if (!hasSync) {
        let msg = "WARNING: Permission to use Persistent Storage was denied. " +
            "Without this, your browser may delete your local data.\n\n" +

            "To fix this, reset permissions for this page and grant the " +
            "permissions that you are subsequently prompted for."
        alert(msg);
    }
}