import {BASE_URL} from '../config'
import {generateLicenseKey, createKeypack, importKeypack, storeLocalKeys} from './crypto';
import {loadUrlQueryParams} from '../utils'
import {createPaymentSession, createLicenseKey} from '../actions/licenseActions';

export async function handleNewRegistration(store) {
    let queryParams = loadUrlQueryParams();
    if (!queryParams.session_id) {
        return
    }
    store.dispatch(createPaymentSession(queryParams.session_id));
    let license = generateLicenseKey();

    let keypack = await createKeypack(license);
    console.log("KEYPACK GENERATED:",keypack);
    let keyObjects = await importKeypack(license, keypack);
    await storeLocalKeys({...keyObjects});

    let resp = await fetch(BASE_URL + '/users', {
        method: 'PUT',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': queryParams.session_id
        },
        body: JSON.stringify(keypack)
    });
    if (resp.status === 200) {
        console.log("USER CREATION RESP:",resp);
        store.dispatch(createLicenseKey(license));
        localStorage.setItem('fingerprint', keypack.fingerprint);
    }
    else {
        alert('An error occurred during account setup. Please contact support.');
    }
}

export async function handleExistingLicense(license) {
    // Hash license to get fingerprint
    // Use fingerprint to download license from server
}