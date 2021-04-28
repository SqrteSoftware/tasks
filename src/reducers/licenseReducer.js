import {set} from '../utils';

export function license(state = {}, action) {
    let license = state;
    license.inMemoryOnly = true;
    switch(action.type) {
        case 'SET_LICENSE_KEY':
            return set(license, 'licenseKey', action.licenseKey);
        default:
            return license;
    }
}