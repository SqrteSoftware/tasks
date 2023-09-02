import {clone} from '../utils'
import { createSlice } from '@reduxjs/toolkit'

import { createNewParentItemWithFocus } from './itemsSlice'

const initialState = {
    lg: []
}


const layoutsSlice = createSlice({
    name: 'layouts',
    initialState,
    reducers: {
        updateAllLayouts: {
            reducer: (state, action) => clone(action.payload)
      }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createNewParentItemWithFocus, (state, { payload }) => {
                let newParentItemId = payload.newParentItemId
                return {
                    lg: shiftAndAddLayout(state, 'lg', newParentItemId),
                    md: shiftAndAddLayout(state, 'md', newParentItemId),
                    sm: shiftAndAddLayout(state, 'sm', newParentItemId),
                    xs: shiftAndAddLayout(state, 'xs', newParentItemId),
                    xxs: shiftAndAddLayout(state, 'xxs', newParentItemId)
                }
            })
    }
  })


  function shiftAndAddLayout(layouts, breakpoint, newParentItemId) {
    let layoutsForBreakpoint = layouts[breakpoint] || [];
    return [
        // move existing leftmost lists down to make space for new list
        ...layoutsForBreakpoint.map(l => l.x === 0 ? {...l, y: l.y + 6} : l),
        // add new layout for new list
        {i: newParentItemId, x: 0, y: 0, w: 3, h: 6, minW: 3, maxW: 4, minH: 3}
    ]
}


export const { updateAllLayouts } = layoutsSlice.actions
export default layoutsSlice.reducer