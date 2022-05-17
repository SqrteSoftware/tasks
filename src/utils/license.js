import {BASE_URL} from '../config'
import * as crypto from './crypto'
import {loadUrlQueryParams} from '../utils'
import {createPaymentSession, createLicenseKey} from '../actions/licenseActions';
import { createUserId } from '../actions/userActions';

export async function handleNewRegistration(store) {
    let queryParams = loadUrlQueryParams();
    if (!queryParams.session_id) {
        return
    }
    store.dispatch(createPaymentSession(queryParams.session_id));
    let license = crypto.generateLicenseKey();

    let keypack = await crypto.createKeypack(license);
    console.log("KEYPACK GENERATED:",keypack);
    let keyObjects = await crypto.importKeypack(license, keypack);
    await crypto.storeLocalKeys({...keyObjects});

    let resp = await fetch(BASE_URL + '/users', {
        method: 'PUT',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': queryParams.session_id
        },
        body: JSON.stringify(keypack)
    });
    if (resp.status === 201) {
        console.log("USER CREATION RESP:",resp);
        store.dispatch(createLicenseKey(license));
        let user = await resp.json()
        store.dispatch(createUserId(user.id))
    }
    else {
        alert('An error occurred during account setup. Please contact support.');
    }
}

export async function handleExistingLicense(license, onCreateUserId, onDeleteUserId) {
    // Hash license to get fingerprint
    // Use fingerprint to download keypack from server
    let fingerprint = await crypto.getHash(license);

    window.grecaptcha.ready(function() {
        window.grecaptcha.execute(
            '6LdGv_EZAAAAAHPwtoTIPLs9FbLDOYUwHJCc4xVm', {action: 'submit'})
            .then(function(token) {
                return fetch(BASE_URL + '/users/' + encodeURIComponent(fingerprint), {
                    method: 'GET',
                    headers: {
                        'Authorization': token
                    }
                })
            })
            .then(resp => resp.json())
            .then(data => {
                if (data.error) {
                    alert(data.error.message);
                }
                onCreateUserId(data.id);
                return crypto.importKeypack(license, data.keypack);
            })
            .then(keyObjects => {
                return crypto.storeLocalKeys({...keyObjects});
            })
            .catch(function(error) {
                console.error('Error:', error);
                onDeleteUserId();
            });
    });
}