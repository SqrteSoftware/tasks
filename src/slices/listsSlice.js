import { createSlice } from '@reduxjs/toolkit'
import { createNestedListWithChildFocus } from './itemsSlice'

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
      },
      resetActiveRoot: {
        reducer: (state, action) => {
          const {rootItemId} = action.payload;
          if (rootItemId) {
            state[rootItemId] = state[rootItemId] === undefined ? {} : state[rootItemId];
            state[rootItemId].activeRootItemId = undefined          
          }
        },
        prepare: (rootItemId) => {
          return { payload: { rootItemId } }
        }
      },
    },
    extraReducers: (builder) => {
      builder.addCase(createNestedListWithChildFocus, (state, action) => {
        const {rootItemId, parentItemId} = action.payload
        state[rootItemId] = state[rootItemId] === undefined ? {} : state[rootItemId];
        state[rootItemId].activeRootItemId = parentItemId;
      })
  }
  })
  
  export const { showCompletedItems, updateBackgroundColor, updateActiveRootItem, resetActiveRoot } = listsSlice.actions
  
  export default listsSlice.reducer