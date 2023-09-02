import * as actions from './licenseSlice'
import rootReducer from '../reducers'


describe('CREATE_LICENSE_KEY', () => {

    test('stores a license key', () => {

        let licenseKey = 'license123'
        let action = actions.createLicenseKey(licenseKey)
        let newState = rootReducer(undefined, action)

        expect(newState.license.licenseKey).toEqual(licenseKey)
        expect(newState.license.inMemoryOnly).toEqual(true)
    });
});

describe('CREATE_PAYMENT_SESSION', () => {

    test('stores a payment session', () => {

        let paymentSession = 'session123'
        let action = actions.createPaymentSession(paymentSession)
        let newState = rootReducer(undefined, action)

        expect(newState.license.paymentSession).toEqual(paymentSession)
        expect(newState.license.inMemoryOnly).toEqual(true)
    });
});

describe('DELETE_LICENSE_INFO', () => {

    test('delete pre-existing license state', () => {
        let initialState = {
            license: {
                inMemoryOnly: true,
                licenseKey: 'license123',
                paymentSession: 'session123'
            }
        }

        // Popuactionste with initial state
        let action = {type:null}
        let newState = rootReducer(initialState, action)
        expect(newState.license).toEqual(initialState.license)
        expect(newState.license.inMemoryOnly).toEqual(true)

        // Delete license state
        action = actions.deleteLicenseInfo()
        newState = rootReducer(newState, action)
        expect(newState.license.licenseKey).toBeNull()
        expect(newState.license.paymentSession).toBeNull()
        expect(newState.license.inMemoryOnly).toEqual(true)
    });

    test('delete empty license state', () => {

        // Popuactionste with initial state
        let action = {type:null}
        let newState = rootReducer(undefined, action)
        expect(newState.license.licenseKey).toBeNull()
        expect(newState.license.paymentSession).toBeNull()
        expect(newState.license.inMemoryOnly).toEqual(true)

        // Delete license state
        action = actions.deleteLicenseInfo()
        newState = rootReducer(newState, action)
        expect(newState.license.licenseKey).toBeNull()
        expect(newState.license.paymentSession).toBeNull()
        expect(newState.license.inMemoryOnly).toEqual(true)
    });
});


