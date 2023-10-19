import { useState, useRef, useEffect, memo } from 'react'
import {DraggableCore} from 'react-draggable'
import DragIndicator from '@mui/icons-material/DragIndicatorOutlined'

import './Item.css'
import {disableTouchMove, enableTouchMove} from "../../utils"


export default memo(function Item(props) {
    const [activeDrag, setActiveDrag] = useState(false)
    const [position, setPosition] = useState({x: 0, y: 0})

    let afterOnDragCallback = useRef(null)
    let widthOnDragStart = useRef(null)
    let itemMiddleY = useRef(0)
    let handleMiddleX = useRef(0)

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
        props.onChange(props.item.id, e.target.value);
    }

    const onDragStart = (e, data) => {
        disableTouchMove();
        // Remove focus while dragging
        inputRef.current.blur()
        // Propagate event BEFORE re-rendering item with absolute positioning
        props.onDragStart(props.item.id, props.parentId);
        // Save current width
        widthOnDragStart.current = getComputedStyle(data.node)['width'];
        setActiveDrag(true)
        setPosition({x: data.x - handleMiddleX.current, y: data.y - itemMiddleY.current})
    }

    const onDrag = (e, data) => {
        setPosition({x: data.x - handleMiddleX.current, y: data.y - itemMiddleY.current})
        if (props.onDrag) {
            // Execute callback AFTER state changes from onDrag event are rendered.
            afterOnDragCallback.current = () => {
                props.onDrag({id: props.item.id});
            }
        }
    }

    const onDragStop = () => {
        enableTouchMove();
        setActiveDrag(false)
        setPosition({x: 0, y: 0})
        props.onDragStop(props.item.id, props.parentId);
    }

    const onCheckboxChange = (event) => {
        props.onCheckboxChange(props.item.id, event.target.checked);
    }

    // Fired when item DOM element is mounted/unmounted
    const onItemRef = (ref) => {
        itemRef.current = ref;
        let totalHeight = ref ? ref.offsetHeight : 0;
        props.onItemRef({'id': props.item.id, totalHeight, 'ref': ref});
        itemMiddleY.current = ref === null ? 0 : (ref.offsetHeight / 2) - 2;
        handleMiddleX.current = ref === null ? 0 : ref.children[0].getBoundingClientRect().width / 2;
    }

    const onInputFocus = () => {
        props.onItemFocus(props.item.id);
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
                    onFocus={onInputFocus}/>
            </li>
        </DraggableCore>
    );
})