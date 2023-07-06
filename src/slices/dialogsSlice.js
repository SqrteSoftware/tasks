import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    // Open welcome dialog on first load
    activeDialog: 'welcome'
}

const dialogsSlice = createSlice({
    name: 'dialogs',
    initialState,
    reducers: {
        openDialog: {
            reducer: (state, action) => {
                const {name} = action.payload
                state.activeDialog = name
            },
            prepare: (name) => ({payload: {name}})
        },
        closeDialog: {
            reducer: (state) => {
                state.activeDialog = ''
            }
        }
    }
  })
  
  export const { openDialog, closeDialog } = dialogsSlice.actions
  
  export default dialogsSlice.reducer