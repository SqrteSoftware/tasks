import Bowser from 'bowser'
import { openDialog } from "../slices/dialogsSlice"


// Persistence Actions
export const INSTALL_TO_HOME = "INSTALL_TO_HOME"
export const INSTALL_TO_DOCK = "INSTALL_TO_DOCK"
export const ENABLE_NOTIFICATIONS = "ENABLE_NOTIFICATIONS"
export const ENABLE_PERSISTENCE = "ENABLE_PERSISTENCE"
export const UNKNOWN = "UNKNOWN"


let persistenceAction = getRequiredPersistenceAction()


export async function persistenceCheck(dispatch) {
    // If persistence is granted, do nothing
    if (await isPersisted()) return

    // Prompt the user to enable persistence
    dispatch(openDialog('welcome'))
}


export async function isPersisted() {
    console.log("Persistence Action: ", persistenceAction)
    if ([INSTALL_TO_HOME, INSTALL_TO_DOCK].includes(persistenceAction)) {
        // For Safari or iOS we're persisted if in 'standalone' mode
        console.log("Apple Detected: Standalone Enabled?", navigator.standalone)
        return navigator.standalone
    }
    if (navigator.standalone) {
        console.log("Generic Standalone Mode Detected")
        return true
    }
    if (await navigator.storage.persisted()) {
        console.log("Persistence Enabled")
        return true
    }
    console.log("Persistence Not Enabled")
    return false
}


/**
 * Ask the browser to protect this domain's local storage from user-agent cleanup:
 *   https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/offline-for-pwa
 *   https://storage.spec.whatwg.org/
 *   https://developers.google.com/web/updates/2016/06/persistent-storage
 * @returns true if persistence requirements are met.
 */
export async function enablePersistence() {

    // We can't programmatically enable persistence for Safari or iOS.
    // They will be directed to install the web app.
    if ([INSTALL_TO_HOME, INSTALL_TO_DOCK].includes(persistenceAction)) {
        return false
    }

    // First try requesting persistence directly. Firefox will show
    // a prompt and chromium browsers will ignore.
    if (await navigator.storage.persist()) {
        console.log("Persistence granted via direct request")
        return true
    }

    // Chromium browsers require permission to show notifications before
    // they will allow persistent storage to be requested.
    if ([ENABLE_NOTIFICATIONS, UNKNOWN].includes(persistenceAction)) {
        // Request notification permission
        if (await Notification.requestPermission() === 'granted') {
            // Now that we have notification permission, try requesting
            // persistence permission again.
            if (await navigator.storage.persist()) {
                console.log("Persistence granted via enabling notifications")
                return true
            }
        }
    }

    return false
}





/**
 * Determine what kind of action is needed to
 * enable persistence for this browser.
 * @returns one of the persistence actions from this module
 */
export function getRequiredPersistenceAction() {
    let systemInfo = Bowser.parse(navigator.userAgent)
    let browser = systemInfo.browser.name.toLowerCase()
    let os = systemInfo.os.name.toLowerCase()

    if (os.includes('ios')) {
        return INSTALL_TO_HOME
    }
    else if (browser.includes('safari')) {
        return INSTALL_TO_DOCK
    }
    else if (browser.includes('chrome')) {
        return ENABLE_NOTIFICATIONS
    }
    else if (browser.includes('edge')) {
        return ENABLE_NOTIFICATIONS
    }
    else if (browser.includes('firefox')) {
        return ENABLE_PERSISTENCE
    }
    else {
        return UNKNOWN
    }
}