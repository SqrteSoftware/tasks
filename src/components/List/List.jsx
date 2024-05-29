import React, { useCallback, useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DragIndicator from '@mui/icons-material/DragIndicatorOutlined'

import './List.css'
import Item from '../Item';
import * as dnd from "../../utils/dnd"
import { findAdjacent } from '../../utils/order';
import {CollapseIndicator} from "../Shared/CollapseIndicator"
import { createNewItemWithFocus, removeItemFromParent, updateItemText } from '../../slices/itemsSlice';
import { showCompletedItems, resetActiveRoot } from '../../slices/listsSlice';
import { updateFocus } from '../../slices/focusSlice';
import ListMenu from './ListMenu';


export default memo(function List(props) {
    const parentId = props.parent.id

    const dndState = useSelector((state) => state.dnd)
    const listState = useSelector((state) => state.lists[parentId] || {})

    const dispatch = useDispatch()

    function handleTitleChange(e, data) {
        dispatch(updateItemText(parentId, e.target.value))
    }

    function handleTitleKeyDown(e) {
        if (e.key === "Enter") {
            let firstChild = props.listItems[0]
            let nextId = firstChild ? firstChild.id : null
            dispatch(createNewItemWithFocus(parentId, null, nextId))
        }
    }

    // Fired when list DOM element is mounted/unmounted
    const onListRef = useCallback((ref) => {
        if (ref !== null) {
            dnd.onListRef({'id': parentId, 'ref': ref});
        }
        else {
            dnd.onListRef({'id': parentId, 'ref': null});
        }
    }, [parentId])

    let showCompleted = listState.showCompletedItems === undefined ? true : listState.showCompletedItems;
    let itemIdWithFocus = props.itemIdWithFocus;
    let items = props.activeListItems.slice(0);
    let completedListItems = props.completedListItems;
    let nearestItemIndex = items.findIndex(item => item.id === dndState.nearestItemId);
    if (nearestItemIndex >= 0) {
        if (dndState.nearestItemPos === 'below') nearestItemIndex++;
        items.splice(nearestItemIndex, 0, {'placeholder': true});
    }
    return (
        <div className="list" style={{"backgroundColor": listState.backgroundColor}}>
            {
            props.rootParentItem?.id !== props.parent.id && 
            <span onClick={e => {dispatch(resetActiveRoot(props.rootParentItem?.id))}}>
                {props.rootParentItem?.value}
            </span>
            }
            <div className="listHeader">
                <div className="listDragHandle">
                    <DragIndicator className="dragHandle"></DragIndicator>
                </div>
                <div className="listTitle">
                    <input
                        className="listTitleInput noDrag"
                        type="text"
                        enterKeyHint="Go" /* For Android */
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        placeholder="Title"
                        value={props.parent.value}
                        onChange={handleTitleChange}
                        onKeyDown={handleTitleKeyDown}/>
                </div>
                <div className="listMenu noDrag">
                    <ListMenu {...{parentId}}/>
                </div>
            </div>
            <div className="listContent noDrag" ref={onListRef} style={props.freezeScroll ? {overflow: 'hidden'} : {}}>
                <ActiveItemsList
                    listItems={props.listItems}
                    activeItems={items}
                    itemIdWithFocus={itemIdWithFocus}
                    parentId={parentId}
                />
                <CompletedItemsList
                    items={completedListItems}
                    {...{parentId, showCompleted}}
                />
            </div>
        </div>
    );
})


function ActiveItemsList(props) {
    let dispatch = useDispatch()
    let {activeItems, listItems, itemIdWithFocus, parentId} = props

    let itemPlaceholderHeight = useRef(0)

    function handleNewItemClick(e) {
        let firstChild = listItems[0]
        let nextId = firstChild ? firstChild.id : null
        dispatch(createNewItemWithFocus(parentId, null, nextId))
    }

    const handleItemKeyDown = useCallback((itemId, parentId, keyPressed, itemValue, cursorPosition, event) => {
        if (keyPressed === "Enter") {
            let itemsHash = {}
            listItems.forEach(item => { itemsHash[item.id] = item})
            let currentItem = itemsHash[itemId];
            let adjacentItems = findAdjacent(currentItem.id, parentId, itemsHash)
            if (cursorPosition > 0 || itemValue.length === 0) {
                // Insert new item AFTER current item
                let nextId = adjacentItems.next?.id || null;
                dispatch(createNewItemWithFocus(parentId, itemId, nextId))
            }
            else {
                // Insert new item BEFORE current item
                let prevId = adjacentItems.prev?.id || null;
                dispatch(createNewItemWithFocus(parentId, prevId, itemId))
            }
        }
        else if (keyPressed === "Backspace" && itemValue === "") {
            let itemsHash = {}
            listItems.forEach(item => { itemsHash[item.id] = item})
            let currentItem = itemsHash[itemId];
            let adjacentItems = findAdjacent(currentItem.id, parentId, itemsHash)
            let prevId = adjacentItems.prev?.id || null;
            dispatch(removeItemFromParent(itemId, parentId))
            if (prevId !== null) {
                // If there's an item above the removed item, change focus to it.
                // this.props.updateFocus(parentId, prevId);
                dispatch(updateFocus(parentId, prevId))
                // If we don't prevent default action here, the cursor will
                // move up to the next item and delete the last character there.
                event.preventDefault();
            }
        }
    }, [listItems, dispatch])

    // Fired when item DOM element is mounted/unmounted
    const onItemRef = useCallback((obj) => {
        if (obj.ref !== null) {
            // Save the height of items so we know how
            // tall a placeholder should be
            itemPlaceholderHeight.current = obj.totalHeight;
        }
    }, [])

    if (activeItems.length > 0) {
        return (
            <ul className="listContentActive">
                {activeItems.map((item) =>
                    {
                        if (item.placeholder) {
                            return <li key={"placeholder"} style={{height: itemPlaceholderHeight.current, backgroundColor: '#eeeeee', listStyleType: 'none'}}>&nbsp;</li>
                        }
                        else {
                            return (
                                <Item
                                    key={item.id}
                                    item={item}
                                    parentId={parentId}
                                    giveFocus={itemIdWithFocus === item.id}
                                    onItemRef={onItemRef}
                                    onKeyDown={handleItemKeyDown}
                                />
                            )
                        }
                    }
                )}
            </ul>
        )
    }
    else {
        return (
            <span
                className="listEmptyNotice"
                onClick={handleNewItemClick}
            >
                Click here to create a new item
            </span>
        )

    }
}


function CompletedItemsList({parentId, items, showCompleted}) {
    const dispatch = useDispatch()

    function handleToggleCompleted(e) {
        dispatch(showCompletedItems(parentId, !showCompleted))
    }

    if (items.length <= 0) {
        return null;
    }
    return (
        <div className="completed">
            <span className="completedTitle" onClick={handleToggleCompleted}>
                <CollapseIndicator expanded={showCompleted}>
                    {'Completed (' + items.length + ')'}
                </CollapseIndicator>
            </span>
            <ul className="listContentCompleted noDrag">
                {showCompleted && items.map((item) =>
                    {
                        return (
                            <Item
                                key={item.id}
                                item={item}
                                parentId={parentId}
                            />
                        )
                    }
                )}
            </ul>
        </div>
    )
}
