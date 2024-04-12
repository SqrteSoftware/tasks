import { clone } from '../utils'
import { createSlice } from '@reduxjs/toolkit'

import { createNewParentItemWithFocus, syncItems, deleteItem } from './itemsSlice'

import {Responsive} from 'react-grid-layout'
const getBreakpointFromWidth = Responsive.utils.getBreakpointFromWidth


export const breakpoints = {
    xs: {
        cols: 2,
        width: 0
    }, 
    sm: {
        cols: 6,
        width: 480
    },
    md: {
        cols: 9,
        width: 996
    },
    lg: {
        cols: 12,
        width: 1200
    }
}

export const breakpointColumns = Object.fromEntries(
    Object.entries(breakpoints).map(v => [v[0], v[1].cols]))


export const breakpointWidths = Object.fromEntries(
    Object.entries(breakpoints).map(v => [v[0], v[1].width]))


const initialState = {
    'breakpointLayouts': Object.fromEntries(
        Object.entries(breakpoints).map(v => [v[0], []])),
    'currentBreakpoint': null,
    'lastHeights': {}
}


const layoutsSlice = createSlice({
    name: 'layouts',
    initialState,
    reducers: {
        updateAllLayouts: {
            reducer: (layouts, action) => {
                let breakpointLayouts = action.payload

                // RGL sends us this data. Clone it to break any reference
                // that RGL might be holding onto.
                layouts.breakpointLayouts = clone(breakpointLayouts)

                // Cleanup any lastHeights that no longer have layouts (ie: have been deleted)
                let layoutsForBreakpoint = breakpointLayouts[layouts.currentBreakpoint] || []
                if (layoutsForBreakpoint) {
                    Object.keys(layouts.lastHeights).forEach(itemId => {
                        if (! layoutsForBreakpoint.some(layout => layout.i === itemId)) {
                            delete layouts.lastHeights[itemId]
                        }
                    })
                }
            }
        },
        collapseLayout: {
            reducer: (layouts, {payload}) => {
                let parentId = payload
                let breakpointLayouts = layouts.breakpointLayouts
                Object.keys(breakpointLayouts).forEach(breakpoint => {
                    breakpointLayouts[breakpoint].forEach(layout => {
                        if (layout.i === parentId) {
                            layouts.lastHeights[layout.i] = layout.h
                            layout.h = 1
                            layout.minH = 1
                        }
                    })
                })
            }
        },
        expandLayout: {
            reducer: (layouts, {payload}) => {
                let parentId = payload
                let breakpointLayouts = layouts.breakpointLayouts
                Object.keys(breakpointLayouts).forEach(breakpoint => {
                    breakpointLayouts[breakpoint].forEach(layout => {
                        if (layout.i === parentId) {
                            layout.h = layouts.lastHeights[layout.i] || 5
                            layout.minH = 1
                        }
                    })
                })
            }
        },
        widthChanged: {
            reducer: (layouts, {payload}) => {
                let width = payload
                layouts.currentBreakpoint = getBreakpointFromWidth(breakpointWidths, width)
            }
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(createNewParentItemWithFocus, (layouts, { payload }) => {
                let newParentItemId = payload.newParentItemId
                layouts.breakpointLayouts = {
                    lg: shiftAndAddLayoutV2(
                        layouts.breakpointLayouts['lg'], newParentItemId, 12),
                    md: shiftAndAddLayoutV2(
                        layouts.breakpointLayouts['md'], newParentItemId, 9),
                    sm: shiftAndAddLayoutV2(
                        layouts.breakpointLayouts['sm'], newParentItemId, 6),
                    xs: shiftAndAddLayoutV2(
                        layouts.breakpointLayouts['xs'], newParentItemId, 2),
                }
            })
            .addCase(syncItems, (layouts, { payload }) => {
                let items = payload.items
                layouts.breakpointLayouts = addLayoutsForItems(
                    layouts.breakpointLayouts, items)
            })
            .addCase(deleteItem, (layouts, { payload }) => {
                let itemId = payload.itemId
                layouts.breakpointLayouts = removeLayoutsForItem(
                    layouts.breakpointLayouts, itemId)
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
    Object.keys(breakpointColumns).forEach(breakpoint => {
        let layoutsForBreakpoint = layouts[breakpoint] || []
        layouts = {
            ...layouts,
            [breakpoint]: layoutsForBreakpoint.filter(layout => layout.i !== itemId)
        }
    })
    return layouts
}


function adjustLayoutsForItem(layouts, itemId) {
    Object.entries(breakpointColumns).forEach(([breakpoint, columnWidth]) => {
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


export const { updateAllLayouts, collapseLayout, expandLayout, widthChanged } = layoutsSlice.actions
export default layoutsSlice.reducer