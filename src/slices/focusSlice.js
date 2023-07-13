import { createSlice } from '@reduxjs/toolkit'


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
            .addCase('CREATE_NEW_ITEM_WITH_FOCUS', (state, action) => {
                return {
                    'parentId': action.parentItemId,
                    'itemId': action.newItemId
                }
            })
            .addCase('CREATE_NEW_PARENT_ITEM_WITH_FOCUS', (state, action) => {
                return {
                    'parentId': action.newParentItemId,
                    'itemId': action.newChildItemId
                }
            })
    }
  })


export const { updateFocus } = focusSlice.actions
export default focusSlice.reducer