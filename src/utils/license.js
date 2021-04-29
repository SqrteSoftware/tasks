import uuidv4 from 'uuid/v4'
import {createEncodedKeypair} from './crypto';
import {loadUrlQueryParams} from '../utils'
import {createPaymentSession, createLicenseKey} from '../actions/licenseActions';

export function handleNewSession(store) {
    let queryParams = loadUrlQueryParams();
    if (queryParams.session) {
        store.dispatch(createPaymentSession(queryParams.session));
        let license = uuidv4().toUpperCase();
        createEncodedKeypair(license).then(keyInfo => {
            console.log("LICENSE:",license);
            console.log("KEY GENERATED:",keyInfo);
            store.dispatch(createLicenseKey(license));
        });
    }
}