import {generateLicenseKey, createKeypack} from './crypto';
import {loadUrlQueryParams} from '../utils'
import {createPaymentSession, createLicenseKey} from '../actions/licenseActions';

export function handleNewRegistration(store) {
    let queryParams = loadUrlQueryParams();
    if (queryParams.session) {
        store.dispatch(createPaymentSession(queryParams.session));
        let license = generateLicenseKey();
        createKeypack(license).then(keyInfo => {
            console.log("LICENSE:",license);
            console.log("KEY GENERATED:",keyInfo);
            store.dispatch(createLicenseKey(license));
        });
    }
}