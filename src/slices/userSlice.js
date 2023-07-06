import { createSlice } from '@reduxjs/toolkit'

const initialState = { id: null }

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        createUserId: {
            reducer: (state, action) => {
                state.id = action.payload
            }
        },
        deleteUserId: {
            reducer: (state) => {
                state.id = null
            }
        }
    }
  })
  
  export const { createUserId, deleteUserId } = userSlice.actions
  
  export default userSlice.reducer