import React, { useCallback, useRef, memo } from 'react';
import DragIndicator from '@mui/icons-material/DragIndicatorOutlined'

import './List.css'
import Item from '../Item';
import * as dnd from "../../utils/dnd"
import {CollapseIndicator} from "../Shared/CollapseIndicator"

export default memo(function List(props) {
    let itemPlaceholderHeight = useRef(0)

    const parentId = props.parent.id

    function onTitleChange(e, data) {
        props.onItemChange(props.parent.id, e.target.value);
    };

    function onTitleKeyDown(e) {
        if (e.key === "Enter") {
            let firstChild = props.firstChild;
            let nextId = firstChild ? firstChild.id : null;
            props.createNewItemWithFocus(props.parent.id, null, nextId);
        }
    };

    function onToggleCompleted(e) {
        let showCompletedItems = props.settings ? props.settings.showCompletedItems : true;
        props.onToggleCompleted(props.parent.id, !showCompletedItems);
    }

    function onDeleteList(e) {
        let msg = "Are you sure you want to delete? This cannot be undone!";
        let confirmed = window.confirm(msg);
        if (confirmed) {
            props.onDeleteList(props.parent.id);
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

    // Fired when item DOM element is mounted/unmounted
    const onItemRef = useCallback((obj) => {
        if (obj.ref !== null) {
            // Save the height of items so we know how
            // tall a placeholder should be
            itemPlaceholderHeight.current = obj.totalHeight;
        }
    }, [])

    function activeItems(items, itemIdWithFocus) {
        if (items.length > 0) {
            return (
                <ul className="listContentActive">
                    {items.map((item) =>
                        {
                            if (item.placeholder) {
                                return <li key={"placeholder"} style={{height: itemPlaceholderHeight.current, backgroundColor: '#eeeeee', listStyleType: 'none'}}>&nbsp;</li>
                            }
                            else {
                                return (
                                    <Item
                                        key={item.id}
                                        item={item}
                                        parentId={props.parent.id}
                                        giveFocus={itemIdWithFocus === item.id}
                                        onItemRef={onItemRef}
                                        onKeyDown={props.onItemKeyDown}
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
                <span className="listEmptyNotice">
                    Click list title and press enter to insert item
                </span>
            )

        }
    }

    function completedItems(items, show) {
        if (items.length <= 0) {
            return null;
        }
        return (
            <div className="completed">
                <span className="completedTitle" onClick={onToggleCompleted}>
                    <CollapseIndicator expanded={show}>
                        {'Completed (' + items.length + ')'}
                    </CollapseIndicator>
                </span>
                {completedItemsList(items, show)}
            </div>
        )
    }

    function completedItemsList(items, show) {
        if (!show) return null;
        return (
            <ul className="listContentCompleted noDrag">
                {items.map((item) =>
                    {
                        return (
                            <Item
                                key={item.id}
                                item={item}
                                parentId={props.parent.id}
                                onItemRef={onItemRef}
                            />
                        )
                    }
                )}
            </ul>
        )
    }

    let settings = props.settings || {};
    let showCompletedItems = settings.showCompletedItems === undefined ? true : settings.showCompletedItems;
    let itemIdWithFocus = props.itemIdWithFocus;
    let items = props.children.slice(0);
    let history = props.history;
    let nearestItemIndex = items.findIndex(item => item.id === props.nearestItemId);
    if (nearestItemIndex >= 0) {
        if (props.nearestItemPos === 'below') nearestItemIndex++;
        items.splice(nearestItemIndex, 0, {'placeholder': true});
    }
    return (
        <div className="list">
            <div className="listDelete noDrag" onClick={onDeleteList}>
                X
            </div>
            <div className="listTitle">
                <DragIndicator className="listTitleHandle dragHandle"></DragIndicator>
                <input
                    className="listTitleInput noDrag"
                    type="text"
                    enterKeyHint="Go" /* For Android */
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    placeholder="Title"
                    value={props.parent.value}
                    onChange={onTitleChange}
                    onKeyDown={onTitleKeyDown}/>
            </div>
            <div className="listContent noDrag" ref={onListRef} style={props.freezeScroll ? {overflow: 'hidden'} : {}}>
                {activeItems(items, itemIdWithFocus)}
                {completedItems(history, showCompletedItems)}
            </div>
        </div>
    );
})
