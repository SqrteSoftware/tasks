import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import { IconButton } from '@mui/material';
import { Circle } from 'react-color/lib/components/circle/Circle';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { useDispatch, useSelector } from 'react-redux';

import { updateBackgroundColor } from '../../slices/listsSlice';
import { deleteItem } from '../../slices/itemsSlice';
import './ListMenu.css'
import { collapseLayout, expandLayout } from '../../slices/layoutsSlice';


export default function ListMenu({parentId}) {
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [deleteList, setDeleteList] = React.useState(false)
    const open = Boolean(anchorEl)
    const colors = [
        "#fff2f2",
        "#fff4e5",
        "#fffee5",
        "#e5ffe8",
        "#e5fdff",
        "#f2f2fd",
        "#fcf2fd",
        "#ffffff"
    ]

    function handleMenuButtonClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    function handleColorPicked(color, event) {
        dispatch(updateBackgroundColor(parentId, color.hex))
        setAnchorEl(null)
    }

    function handleDeleteList(e) {
        setDeleteList(true)
        setAnchorEl(null)
    }

    function handleTransitionEnd(e) {
        // Allow the menu to fully close before displaying the
        // synchronous deletion confirmation dialog
        if (deleteList) {
            setDeleteList(false)
            let msg = "Are you sure you want to delete? This cannot be undone!";
            let confirmed = window.confirm(msg)
            if (confirmed) {
                dispatch(deleteItem(parentId))
            }
        }
    }

    return (
        // stopPropagation required to disable dragging lists while menu is open
        <div onMouseDown={e => e.stopPropagation()}>
            <CollapseToggle parentId={parentId}/>
            <IconButton className='listMenuButton' onClick={handleMenuButtonClick}>
                <ExpandCircleDownOutlinedIcon />
            </IconButton>
            <Menu
                onTransitionEnd={handleTransitionEnd}
                className='listMenu nodrag'
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                transformOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <MenuItem>
                    <Circle
                        colors={colors}
                        onChange={handleColorPicked}
                        width="175px"
                    />
                </MenuItem>
                <Divider />
                <MenuItem className='listMenuItem delete' onClick={handleDeleteList}>
                    <span>Delete List</span>
                </MenuItem>
            </Menu>
        </div>
    )
}


function CollapseToggle({parentId}) {
    const dispatch = useDispatch()

    const layouts = useSelector((state) => state.layouts)
    const itemCount = useSelector((state) => {
        let count = 0
        Object.values(state.items).forEach(item => {
            if (item.parents[parentId] && !item.complete) {
                count++
            } 
        })
        return count
    })
    
    let externalItemCount = itemCount > 99 ? '99+' : itemCount.toString()

    let style = {
        'padding': '2px',
        'fontSize': '12px',
        'width': '15px',
        'height': '15px',
        'marginLeft': '-5px',
    }

    if (isCollapsed(parentId, layouts)) {
        return (
            <IconButton className='listMenuButton' onClick={e => {dispatch(expandLayout(parentId))}}>
                <UnfoldMoreIcon />
                {itemCount > 0 && <span style={style}>{externalItemCount}</span>}
            </IconButton>
        )
    } else {
        return (
            <IconButton className='listMenuButton' onClick={e => {dispatch(collapseLayout(parentId))}}>
                <UnfoldLessIcon />
            </IconButton>
        )
    }

}


function isCollapsed(itemId, layouts) {
    let breakpointLayouts = layouts.breakpointLayouts
    let currentBreakpoint = layouts.currentBreakpoint
    let layoutsForBreakpoint = breakpointLayouts[currentBreakpoint]

    let isCollapsed
    if (layoutsForBreakpoint) {
        isCollapsed = layoutsForBreakpoint.some(layout => {
            return layout.i === itemId && layout.h === 1
        })
    } else {
        // Fallback if current layout can't be found
        isCollapsed = true
        Object.values(breakpointLayouts).forEach(layouts => {
            layouts.forEach(layout => {
                if (layout.i === itemId && layout.h > 1) {
                    isCollapsed = false
                }
            })
        })
    }

    return isCollapsed
}