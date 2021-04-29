import {set} from '../utils';

export function license(state = {}, action) {
    let license = state;
    license.inMemoryOnly = true;
    switch(action.type) {
        case 'CREATE_LICENSE_KEY':
            return set(license, 'licenseKey', action.licenseKey);
        case 'CREATE_PAYMENT_SESSION':
            return set(license, 'paymentSession', action.paymentSession);
        default:
            return license;
    }
}