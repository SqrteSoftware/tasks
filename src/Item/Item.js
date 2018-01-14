import React, {Component} from 'react';
import {DraggableCore} from 'react-draggable';

import './Item.css';

class Item extends Component {

    constructor(props) {
        super(props);
        this.widthOnDragStart = null;
        this.state = {
            'activeDrag': false,
            'position': {x: 0, y: 0}
        };
    }

    render() {
        let item = this.props.item;
        let activeDrag = this.state.activeDrag;
        let position = this.state.position;
        return (
            <DraggableCore
                onDrag={this.onDrag.bind(this)}
                onStart={this.onDragStart.bind(this)}
                onStop={this.onDragStop.bind(this)}
                handle={'.itemHandle'}>
                <li className="item"
                    ref={this.onRef.bind(this)}
                    style={this.getListItemStyles(activeDrag, position, this.widthOnDragStart)}>
                    <span className="itemHandle"></span>
                    <input className="itemInput" type="text" value={item.value} onChange={ this.onChange.bind(this) }/>
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
                widthOnDragStart: width
            }
        }
        else {
            return {
                position: 'relative'
            }
        }
    }


    onChange(e, data) {
        this.props.onChange(this.props.item.id, e.target.value);
    }

    onDragStart(e, data) {
        this.widthOnDragStart = getComputedStyle(data.node)['width'];
        this.setState({
            'activeDrag': true,
            'position': {x: data.node.offsetLeft, y: data.node.offsetTop}
        }, () => {
            // fire onDragStart only AFTER the item has re-rendered with absolute positioning
            this.props.onDragStart(this.props.item.id);
        });
    }

    onDrag(e, meta) {
        this.setState({
            'position': {x: meta.x, y: meta.y}
        }, () => {
            meta.id = this.props.item.id;
            this.props.onDrag(meta);
        });
    }

    onDragStop() {
        this.setState({
            'activeDrag': false,
            'position': {x: 0, y: 0}
        });
        this.props.onDragStop(this.props.item.id);
    }

    // Fired when item DOM element is mounted/unmounted
    onRef(ref) {
        if (ref !== null) {
            this.props.onRef({'id': this.props.item.id, 'ref': ref});
        }
        else {
            this.props.onRef({'id': this.props.item.id, 'ref': null});
        }
    }
};

export default Item;