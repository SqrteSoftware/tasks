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
    const layouts = useSelector((state) => state.layouts)
    const dispatch = useDispatch()

    if (isCollapsed(parentId, layouts)) {
        return (
            <IconButton className='listMenuButton' onClick={e => {dispatch(expandLayout(parentId))}}>
                <UnfoldMoreIcon />
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

    if (! breakpointLayouts[currentBreakpoint]) {
        return false
    }

    let isCollapsed = breakpointLayouts[currentBreakpoint].some(layout => {
        return layout.i === itemId && layout.h === 1
    })
    return isCollapsed
}