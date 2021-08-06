import {set} from '../utils';

export function license(state = {}, action) {
    let license = state;
    // Don't persist license or session info
    license.inMemoryOnly = true;
    switch(action.type) {
        case 'CREATE_LICENSE_KEY':
            return set(license, 'licenseKey', action.licenseKey);
        case 'CREATE_PAYMENT_SESSION':
            return set(license, 'paymentSession', action.paymentSession);
        case 'DELETE_LICENSE_INFO':
            return {
                ...license,
                'licenseKey': null,
                'paymentSession': null
            }
        default:
            return license;
    }
}