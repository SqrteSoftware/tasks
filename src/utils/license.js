import {generateLicenseKey, createKeypack} from './crypto';
import {loadUrlQueryParams} from '../utils'
import {createPaymentSession, createLicenseKey} from '../actions/licenseActions';

export function handleNewRegistration(store) {
    let queryParams = loadUrlQueryParams();
    if (queryParams.session_id) {
        store.dispatch(createPaymentSession(queryParams.session_id));
        let license = generateLicenseKey();
        createKeypack(license).then(keypack => {
            console.log("KEYPACK GENERATED:",keypack);
            fetch('https://edk22w6pt5.execute-api.us-east-1.amazonaws.com/staging/users', {
                method: 'PUT',
                cache: 'no-cache',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': queryParams.session_id
                },
                body: JSON.stringify(keypack)
            }).then(resp => {
                if (resp.status === 200) {
                    console.log("USER CREATION RESP:",resp);
                    store.dispatch(createLicenseKey(license));
                }
                else {
                    alert('An error occurred during account setup. Please contact support.');
                }

            });
        });
    }
}