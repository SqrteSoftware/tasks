import {generateLicenseKey, createKeypack} from './crypto';
import {loadUrlQueryParams} from '../utils'
import {createPaymentSession, createLicenseKey} from '../actions/licenseActions';

export function handleNewRegistration(store) {
    let queryParams = loadUrlQueryParams();
    if (queryParams.session_id) {
        store.dispatch(createPaymentSession(queryParams.session_id));
        let license = generateLicenseKey();
        createKeypack(license).then(keyInfo => {
            console.log("LICENSE:",license);
            console.log("KEY GENERATED:",keyInfo);

            fetch('https://edk22w6pt5.execute-api.us-east-1.amazonaws.com/staging/users', {
                method: 'PUT',
                // mode: 'cors',
                cache: 'no-cache',
                credentials: 'omit',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': queryParams.session_id
                },
                body: JSON.stringify(keyInfo)
            }).then(resp => {
            console.log("RESPONSE:",resp);
            });
            store.dispatch(createLicenseKey(license));
        });
    }
}