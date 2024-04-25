import { clone } from '../utils'

export function reformatLayouts(state) {
    console.log("Reformatting Layouts")
    console.log("Current Layout State:", clone(state.layouts))
    if (state.layouts.breakpointLayouts) {
        console.log("Skipping v4 migration...not needed.")
        return state
    }
    let currentLayouts = state.layouts
    state.layouts = {
        breakpointLayouts: currentLayouts,
        currentBreakpoint: null,
        lastHeights: {},
    }
    console.log("Migrated Layout State:", state.layouts)
    return state
}

