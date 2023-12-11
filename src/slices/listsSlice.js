import { createSlice } from '@reduxjs/toolkit'

const initialState = {}

const listsSlice = createSlice({
    name: 'lists',
    initialState,
    reducers: {
      showCompletedItems: {
        reducer: (state, action) => {
          const {listId, show} = action.payload;
          state[listId] = state[listId] === undefined ? {} : state[listId];
          state[listId].showCompletedItems = show;
        },
        prepare: (listId, show) => {
          return { payload: { listId, show } }
        }
      },
      updateBackgroundColor: {
        reducer: (state, action) => {
          const {listId, backgroundColor} = action.payload;
          state[listId] = state[listId] === undefined ? {} : state[listId];
          state[listId].backgroundColor = backgroundColor;
        },
        prepare: (listId, backgroundColor) => {
          return { payload: { listId, backgroundColor } }
        }
      }
    }
  })
  
  export const { showCompletedItems, updateBackgroundColor } = listsSlice.actions
  
  export default listsSlice.reducer