import { createSlice } from '@reduxjs/toolkit'

const initialState = {}

const listsSlice = createSlice({
    name: 'lists',
    initialState,
    reducers: {
      showCompletedItems(state, action) {
        const {listId, show} = action.payload;
        state[listId] = state[listId] === undefined ? {} : state[listId];
        state[listId].showCompletedItems = show;
      }
    }
  })
  
  export const { showCompletedItems } = listsSlice.actions
  
  export default listsSlice.reducer