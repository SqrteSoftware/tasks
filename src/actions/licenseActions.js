export const createLicenseKey = (licenseKey) => ({
    type: 'CREATE_LICENSE_KEY',
    licenseKey
});

export const createPaymentSession = (paymentSession) => ({
    type: 'CREATE_PAYMENT_SESSION',
    paymentSession
});