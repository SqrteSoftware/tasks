import { useState, useRef, useEffect, memo } from 'react'
import { useDispatch } from 'react-redux'
import {DraggableCore} from 'react-draggable'
import DragIndicator from '@mui/icons-material/DragIndicatorOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import './Item.css'
import {disableTouchMove, enableTouchMove} from "../../utils"
import * as dnd from "../../utils/dnd"
import { moveItem, updateItemComplete, updateItemText, createNestedListWithChildFocus } from '../../slices/itemsSlice'
import { updateFocus } from '../../slices/focusSlice'
import { updateDnd } from '../../slices/dndSlice'


export default memo(function Item(props) {
    const dispatch = useDispatch()

    const [activeDrag, setActiveDrag] = useState(false)
    const [position, setPosition] = useState({x: 0, y: 0})
    const [inputHasFocus, setInputHasFocus] = useState(false)

    // Drag and Drop related state
    let afterOnDragCallback = useRef(null)
    let widthOnDragStart = useRef(null)
    let itemMiddleY = useRef(0)
    let handleMiddleX = useRef(0)

    // DOM Refs
    let inputRef = useRef()
    let itemRef = useRef(null)

    let {item} = props

    useEffect(() => {
        if (inputRef.current !== null && props.giveFocus) {
            inputRef.current.focus()
        }
        if (afterOnDragCallback.current && activeDrag) {
            // The activeDrag MUST be checked because this may be called
            // after the onDragStop event fires due to the fact that
            // effects execute after render.
            afterOnDragCallback.current()
            afterOnDragCallback.current = null
        }
    });

    const getListItemStyles = (activeDrag, position, width) => {
        if (activeDrag) {
            // When dragging, we switch to absolute positioning. Before
            // doing this, we must lock in the item's current relative
            // position and width.
            return {
                position: 'absolute',
                top: position.y,
                left: position.x,
                zIndex: 1,
                width: width
            }
        }
        else {
            return {
                position: 'relative'
            }
        }
    }

    const onKeyDown = (event) => {
        let cursorPosition = event.target.selectionStart;
        let inputValue = event.target.value;
        let keyPressed = event.key;
        props.onKeyDown(
            props.item.id,
            props.parentId,
            keyPressed,
            inputValue,
            cursorPosition,
            event
        );
    }

    const onChange = (e, data) => {
        dispatch(updateItemText(props.item.id, e.target.value))
    }

    const onDragStart = (e, data) => {
        disableTouchMove();
        // Remove focus while dragging
        inputRef.current.blur()
        // Propagate event BEFORE re-rendering item with absolute positioning
        let result = dnd.onItemDragProgress(props.item.id)
        dispatch(updateDnd(props.parentId, ...result))
        // Save current width
        widthOnDragStart.current = getComputedStyle(data.node)['width'];
        setActiveDrag(true)
        setPosition({x: data.x - handleMiddleX.current, y: data.y - itemMiddleY.current})
    }

    const onDrag = (e, data) => {
        setPosition({x: data.x - handleMiddleX.current, y: data.y - itemMiddleY.current})
        // Execute callback AFTER state changes from onDrag event are rendered.
        afterOnDragCallback.current = () => {
            let result = dnd.onItemDragProgress(props.item.id);
            dispatch(updateDnd(undefined, ...result))
        }
    }

    const onDragStop = () => {
        enableTouchMove();
        setActiveDrag(false)
        setPosition({x: 0, y: 0})
        let result = dnd.onItemDragStop(props.item.id, props.parentId);
        if (result) {
            dispatch(moveItem(...result))
        }
        dispatch(updateDnd(null, null, null, null))
    }

    const onCheckboxChange = (event) => {
        dispatch(updateItemComplete(props.item.id, event.target.checked))
    }

    // Fired when item DOM element is mounted/unmounted
    const onItemRef = (ref) => {
        // DraggableCore requires a ref to the child component
        itemRef.current = ref;

        let totalHeight = ref ? ref.offsetHeight : 0;
        if (props.onItemRef) {
            props.onItemRef({'id': props.item.id, totalHeight, 'ref': ref});
        }
        dnd.onItemRef({'item': props.item, 'ref': ref});
        itemMiddleY.current = ref === null ? 0 : (ref.offsetHeight / 2) - 2;
        handleMiddleX.current = ref === null ? 0 : ref.children[0].getBoundingClientRect().width / 2;
    }

    const onInputFocus = () => {
        // When an item receives focus, it should clear
        // the global focus state so that subsequent renders
        // do not try to re-apply focus.
        dispatch(updateFocus())
        setInputHasFocus(true)
    }

    const onInputBlur = () => {
        setInputHasFocus(false)
    }

    return (
        <DraggableCore
            nodeRef={itemRef}
            disabled={item.complete}
            onDrag={onDrag}
            onStart={onDragStart}
            onStop={onDragStop}
            handle={'.itemHandle'}>
            <li className={"item" + (item.complete ? " complete" : "")}
                ref={onItemRef}
                style={getListItemStyles(activeDrag, position, widthOnDragStart.current)}>
                {item.complete ? '' : <DragIndicator className="dragHandle itemHandle"></DragIndicator>}
                <input
                    className="itemCheckbox"
                    type="checkbox"
                    checked={item.complete}
                    onChange={onCheckboxChange}/>
                <input
                    className="itemInput"
                    ref={inputRef}
                    type="text"
                    enterKeyHint="Go" /* For Android */
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    disabled={item.complete}
                    value={item.value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}/>
                <SublistButton
                    show={inputHasFocus} 
                    parentId={props.parentId} 
                    itemId={item.id}
                />
            </li>
        </DraggableCore>
    );
})


function SublistButton({show, parentId, itemId}) {
    const dispatch = useDispatch()

    function handleCreateNestedList() {
        dispatch(createNestedListWithChildFocus(
            parentId,
            itemId,
        ))
    }
    if (show) {
        return (
            <ChevronRightIcon 
                className='itemSublistButton' 
                onMouseDown={handleCreateNestedList}
            />
        )
    }
}