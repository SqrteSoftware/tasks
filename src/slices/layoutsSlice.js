import { clone } from '../utils'
import { createSlice } from '@reduxjs/toolkit'

import { createNewParentItemWithFocus, syncItems } from './itemsSlice'

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
                    lg: shiftAndAddLayout(state['lg'], newParentItemId),
                    md: shiftAndAddLayout(state['md'], newParentItemId),
                    sm: shiftAndAddLayout(state['sm'], newParentItemId),
                    xs: shiftAndAddLayout(state['xs'], newParentItemId),
                    xxs: shiftAndAddLayout(state['xxs'], newParentItemId)
                }
            })
            .addCase(syncItems, (state, { payload }) => {
                let items = payload.items
                return addLayoutsForItems(state, items)
            })
    }
})


function addLayoutsForItems(layouts, items) {
    items.forEach(item => {
        if (Object.keys(item.parents).length <= 0 && item.deleted === false) {
            // New root items need layouts added
            layouts = adjustLayoutsForItem(layouts, item.id)
        }
    })
    return layouts
}


function adjustLayoutsForItem(layouts, itemId) {
    let breakpoints = ['xxs', 'xs', 'sm', 'md', 'lg']
    breakpoints.forEach(breakpoint => {
        let layoutsForBreakpoint = layouts[breakpoint] || []
        if (layoutsForBreakpoint.find(layout => layout.i === itemId)) {
            // Do nothing if a layout already exists for the item
            return
        }
        layouts = {
            ...layouts,
            [breakpoint]: shiftAndAddLayout(layoutsForBreakpoint, itemId)
        }
    })
    return layouts
}


function shiftAndAddLayout(layoutsForBreakpoint, newParentItemId) {
    layoutsForBreakpoint = layoutsForBreakpoint || [];
    return [
        // move existing leftmost lists down to make space for new list
        ...layoutsForBreakpoint.map(l => l.x === 0 ? { ...l, y: l.y + 5 } : l),
        // add new layout for new list
        { i: newParentItemId, x: 0, y: 0, w: 3, h: 5, minW: 3, maxW: 4, minH: 1 }
    ]
}


export const { updateAllLayouts } = layoutsSlice.actions
export default layoutsSlice.reducer