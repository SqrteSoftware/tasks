import { clone } from '../utils'

export function cleanupLayouts(state) {
    let items = state.items
    let layouts = state.layouts
    console.log("Cleaning Up Layouts")
    console.log("Current Layout State:", clone(layouts))
    Object.keys(layouts).forEach(breakpoint => {
        console.log("Cleanup Breakpoint:", breakpoint)
        let layoutsForBreakpoint = layouts[breakpoint]
        // Remove any layouts whose item no longer exists
        layouts[breakpoint] = layoutsForBreakpoint.filter(layout => items[layout.i])
    })
    console.log("Migrated Layout State:", layouts)
    return state;
}

