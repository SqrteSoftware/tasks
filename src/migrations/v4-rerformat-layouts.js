import { clone } from '../utils'

export function reformatLayouts(state) {
    console.log("Reformatting Layouts")
    console.log("Current Layout State:", clone(state.layouts))
    let currentLayouts = state.layouts
    state.layouts = {
        breakpointLayouts: currentLayouts.breakpointLayouts || currentLayouts,
        currentBreakpoint: null,
        lastHeights: currentLayouts.lastHeights || {},
    }
    console.log("Migrated Layout State:", state.layouts)
    return state
}

