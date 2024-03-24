import { clone } from '../utils'
import { createSlice } from '@reduxjs/toolkit'

import { createNewParentItemWithFocus, syncItems, deleteItem } from './itemsSlice'

const initialState = {
    lg: []
}

const breakpoints = {'xs': 2, 'sm': 6, 'md': 9, 'lg': 12}


const layoutsSlice = createSlice({
    name: 'layouts',
    initialState,
    reducers: {
        updateAllLayouts: {
            reducer: (state, action) => {
                return clone(action.payload)
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createNewParentItemWithFocus, (state, { payload }) => {
                let newParentItemId = payload.newParentItemId
                return {
                    lg: shiftAndAddLayoutV2(state['lg'], newParentItemId, 12),
                    md: shiftAndAddLayoutV2(state['md'], newParentItemId, 9),
                    sm: shiftAndAddLayoutV2(state['sm'], newParentItemId, 6),
                    xs: shiftAndAddLayoutV2(state['xs'], newParentItemId, 2),
                }
            })
            .addCase(syncItems, (state, { payload }) => {
                let items = payload.items
                return addLayoutsForItems(state, items)
            })
            .addCase(deleteItem, (state, { payload }) => {
                let itemId = payload.itemId
                return removeLayoutsForItem(state, itemId)
            })
    }
})


function addLayoutsForItems(layouts, items) {
    items.forEach(item => {
        if (Object.keys(item.parents).length <= 0) {
            if (item.deleted === false) {
                // New root items need layouts added
                layouts = adjustLayoutsForItem(layouts, item.id)
            }
            else {
                layouts = removeLayoutsForItem(layouts, item.id)
            }
        }
    })
    return layouts
}


function removeLayoutsForItem(layouts, itemId) {
    Object.keys(breakpoints).forEach(breakpoint => {
        let layoutsForBreakpoint = layouts[breakpoint] || []
        layouts = {
            ...layouts,
            [breakpoint]: layoutsForBreakpoint.filter(layout => layout.i !== itemId)
        }
    })
    return layouts
}


function adjustLayoutsForItem(layouts, itemId) {
    Object.entries(breakpoints).forEach(([breakpoint, columnWidth]) => {
        let layoutsForBreakpoint = layouts[breakpoint] || []
        if (layoutsForBreakpoint.find(layout => layout.i === itemId)) {
            // Do nothing if a layout already exists for the item
            return
        }
        layouts = {
            ...layouts,
            [breakpoint]: shiftAndAddLayoutV2(layoutsForBreakpoint, itemId, columnWidth)
        }
    })
    return layouts
}


function shiftAndAddLayoutV2(layoutsForBreakpoint, newParentItemId, layoutColumns) {
    layoutsForBreakpoint = layoutsForBreakpoint || [];
    // Count the number of layouts in each column
    let listWidth = 3
    let listHeight = 5

    let shortestColumn = getShortestColumn(layoutsForBreakpoint, listWidth, layoutColumns)
    return [
        // move existing leftmost lists down to make space for new list
        ...layoutsForBreakpoint.map(l => layoutOverlapsListColumn(l, shortestColumn, listWidth) ? { ...l, y: l.y + listHeight } : l),
        // add new layout for new list
        { i: newParentItemId,
            x: shortestColumn * listWidth,
            y: 0,
            w: listWidth,
            h: listHeight,
            minW: 3,
            maxW: 4,
            minH: 1 }
    ]
}


function getShortestColumn(layoutsForBreakpoint, listColWidth, columnsForLayout) {
    layoutsForBreakpoint = layoutsForBreakpoint || [];
    let numListColumns = columnsForLayout / listColWidth
    let columnHeights = []
    for (let column = 0; column < numListColumns; column++) {
        columnHeights[column] = 0
        layoutsForBreakpoint.forEach(layout => {
            if (layoutOverlapsListColumn(layout, column, listColWidth)) {
                columnHeights[column] += layout.h
            }
        })
    }
    let shortestColumn = Math.max(columnHeights.indexOf(Math.min(...columnHeights)), 0)

    return shortestColumn
}


function layoutOverlapsListColumn(layout, listColumn, listColWidth) {
    let leftColBound = listColWidth * listColumn
    let righColBound = listColWidth * (listColumn + 1)
    let layoutOverlapsListColumn = (
        // top left layout corner is in the column
        (layout.x > leftColBound && layout.x < righColBound) ||
        // top right layout corner is in the column
        ((layout.x + layout.w) > leftColBound && (layout.x + layout.w) < righColBound) ||
        // layout is same size or larger than column and overlaps whole thing
        (layout.x <= leftColBound && (layout.x + layout.w) >= righColBound)
    )
    return layoutOverlapsListColumn
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