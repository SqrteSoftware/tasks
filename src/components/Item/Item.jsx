import React, {PureComponent} from 'react';
import {DraggableCore} from 'react-draggable';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './Item.css';


// FontAwesome
library.add(faGripVertical);

class Item extends PureComponent {

    constructor(props) {
        super(props);
        this.widthOnDragStart = null;
        this.inputRef = null;
        this.itemMiddle = 0;
        this.state = {
            'activeDrag': false,
            'position': {x: 0, y: 0}
        };
    }

    componentDidMount() {
        this.handleFocus();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.handleFocus();
    }

    handleFocus() {
        if (this.inputRef !== null && this.props.giveFocus) {
            this.inputRef.focus();
        }
    }

    render() {
        let item = this.props.item;
        let activeDrag = this.state.activeDrag;
        let position = this.state.position;

        return (
            <DraggableCore
                disabled={item.complete}
                onDrag={this.onDrag}
                onStart={this.onDragStart}
                onStop={this.onDragStop}
                handle={'.itemHandle'}>
                <li className="item"
                    ref={this.onItemRef}
                    style={this.getListItemStyles(activeDrag, position, this.widthOnDragStart)}>
                    {item.complete ? '' : <FontAwesomeIcon icon="grip-vertical" className="dragHandle itemHandle"></FontAwesomeIcon>}
                    <input
                        className="itemCheckbox"
                        type="checkbox"
                        checked={item.complete}
                        onChange={this.onCheckboxChange}/>
                    <input
                        className={"itemInput" + (item.complete ? " complete" : "")}
                        ref={ref => this.inputRef = ref}
                        type="text"
                        disabled={item.complete}
                        value={item.value}
                        onChange={ this.onChange}
                        onKeyDown={this.onKeyDown}
                        onFocus={this.onInputFocus}/>
                </li>
            </DraggableCore>
        );
    }

    getListItemStyles(activeDrag, position, width) {
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

    onKeyDown = (event) => {
        let cursorPosition = event.target.selectionStart;
        let inputValue = event.target.value;
        let keyPressed = event.key;
        this.props.onKeyDown(
            this.props.item.id,
            this.props.parentId,
            keyPressed,
            inputValue,
            cursorPosition,
            event
        );
    };

    onChange = (e, data) => {
        this.props.onChange(this.props.item.id, e.target.value);
    };

    onDragStart = (e, data) => {
        // Propagate event BEFORE re-rendering item with absolute positioning
        this.props.onDragStart(this.props.item.id, this.props.parentId);
        // Save current width
        this.widthOnDragStart = getComputedStyle(data.node)['width'];
        this.setState({
            'activeDrag': true,
            'position': {x: data.x, y: data.y - this.itemMiddle}
        }, () => {
            if (this.props.onAfterDragStart) {
                // fire onAfterDragStart only AFTER the item has re-rendered with absolute positioning
                this.props.onAfterDragStart(this.props.item.id, this.props.parentId);
            }
        });
    };

    onDrag = (e, data) => {
        this.setState({
            'position': {x: data.x, y: data.y - this.itemMiddle}
        }, () => {
            data.id = this.props.item.id;
            this.props.onDrag(data);
        });
    };

    onDragStop = () => {
        this.setState({
            'activeDrag': false,
            'position': {x: 0, y: 0}
        });
        this.props.onDragStop(this.props.item.id, this.props.parentId);
    };

    onCheckboxChange = (event) => {
        this.props.onCheckboxChange(this.props.item.id, event.target.checked);
    };

    // Fired when item DOM element is mounted/unmounted
    onItemRef = (ref) => {
        let totalHeight = ref ? ref.offsetHeight : 0;
        this.props.onItemRef({'id': this.props.item.id, totalHeight, 'ref': ref});
        this.itemMiddle = ref === null ? 0 : (ref.offsetHeight / 2) - 2;
    };

    onInputFocus = () => {
        this.props.onItemFocus(this.props.item.id);
    };
}

export default Item;