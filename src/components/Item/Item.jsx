import React, {PureComponent} from 'react';
import {DraggableCore} from 'react-draggable';

import './Item.css';

class Item extends PureComponent {

    constructor(props) {
        super(props);
        this.widthOnDragStart = null;
        this.inputRef = null;
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
                    ref={this.onRef}
                    style={this.getListItemStyles(activeDrag, position, this.widthOnDragStart)}>
                    {item.complete ? '' : <span className="itemHandle dragHandle"></span>}
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
        this.props.onKeyDown(this.props.item.id, this.props.parentId, event);
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
            'position': {x: data.node.offsetLeft, y: data.node.offsetTop}
        }, () => {
            if (this.props.onAfterDragStart) {
                // fire onAfterDragStart only AFTER the item has re-rendered with absolute positioning
                this.props.onAfterDragStart(this.props.item.id, this.props.parentId);
            }
        });
    };

    onDrag = (e, data) => {
        this.setState({
            'position': {x: data.x, y: data.y}
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
    onRef = (ref) => {
        if (ref !== null) {
            this.props.onItemRef({'id': this.props.item.id, 'ref': ref});
        }
        else {
            this.props.onItemRef({'id': this.props.item.id, 'ref': null});
        }
    };

    onInputFocus = () => {
        this.props.onItemFocus(this.props.item.id);
    };
}

export default Item;