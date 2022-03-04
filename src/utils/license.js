import {BASE_URL} from '../config'
import * as crypto from './crypto'
import {loadUrlQueryParams} from '../utils'
import {createPaymentSession, createLicenseKey} from '../actions/licenseActions';

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
    // e.preventDefault();

    let fingerprint = await crypto.getHash(license);
    // Hash license to get fingerprint
    // Use fingerprint to download license from server


    window.grecaptcha.ready(function() {
        window.grecaptcha.execute(
            '6LdGv_EZAAAAAHPwtoTIPLs9FbLDOYUwHJCc4xVm', {action: 'submit'})
            .then(function(token) {
                console.log("Captcha token:",token);
                console.log("Fingerprint:",fingerprint);
                fetch(BASE_URL + '/users/' + encodeURIComponent(fingerprint), {
                    method: 'GET',
                    headers: {
                        'Authorization': token
                    }
                })
                .then(resp => resp.json())
                .then(data => {
                    console.log(data);
                    if (data.error) {
                        alert(data.error.message);
                    }
                    // Import keypack from server
                })
                .catch(function(error) {
                    console.error('Error:', error);
                });
        });
    });

}