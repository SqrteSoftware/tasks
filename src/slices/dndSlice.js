import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    activeDragParentId: null,
    overlappedListId: null,
    nearestItemId: null,
    nearestItemPos: null
}

const dndSlice = createSlice({
    name: 'dnd',
    initialState,
    reducers: {
      updateDnd: {
        reducer: (state, action) => {
            return {
                ...state,
                ...action.payload
            }
        },
        prepare: (activeDragParentId, overlappedListId, nearestItemId, nearestItemPos) => {
            return {
                payload: {
                    ...(activeDragParentId !== undefined && {activeDragParentId}),
                    overlappedListId,
                    nearestItemId,
                    nearestItemPos
                }
            }
        }
      }
    }
  })
  
  export const { updateDnd } = dndSlice.actions
  
  export default dndSlice.reducer