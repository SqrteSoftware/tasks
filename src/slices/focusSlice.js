import { createSlice } from '@reduxjs/toolkit'

import {
    createNewParentItemWithFocus,
    createNewItemWithFocus } from './itemsSlice'

const initialState = {
    parentId: null,
    itemId: null
}


const focusSlice = createSlice({
    name: 'focus',
    initialState,
    reducers: {
        updateFocus: {
            reducer: (state, action) => {
                const {parentId, itemId} = action.payload
                state.parentId = parentId
                state.itemId = itemId
            },
            prepare: (parentId=null, itemId=null) => ({
                payload: {
                    parentId,
                    itemId
                }
            })
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createNewItemWithFocus, (state, { payload }) => {
                return {
                    'parentId': payload.parentItemId,
                    'itemId': payload.newItemId
                }
            })
            .addCase(createNewParentItemWithFocus, (state, { payload }) => {
                return {
                    'parentId': payload.newParentItemId,
                    'itemId': payload.newChildItemId
                }
            })
    }
  })


export const { updateFocus } = focusSlice.actions
export default focusSlice.reducer