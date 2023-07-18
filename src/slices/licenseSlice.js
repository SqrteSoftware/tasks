import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    inMemoryOnly: true,
    licenseKey: null,
    paymentSession: null
}

const licenseSlice = createSlice({
    name: 'license',
    initialState,
    reducers: {
        createLicenseKey: {
            reducer: (state, action) => {
                const licenseKey = action.payload
                state.licenseKey = licenseKey
            }
        },
        createPaymentSession: {
            reducer: (state, action) => {
                const paymentSession = action.payload
                state.paymentSession = paymentSession
            }
        },
        deleteLicenseInfo: {
            reducer: (state) => ({
                ...state,
                licenseKey: null,
                paymentSession: null
            })
        }
    }
  })
  
export const {
    createLicenseKey,
    createPaymentSession,
    deleteLicenseInfo
} = licenseSlice.actions
  
  export default licenseSlice.reducer