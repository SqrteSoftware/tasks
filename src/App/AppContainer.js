import {connect} from 'react-redux';

import {
    createNewItemWithFocus,
    updateItemText,
    updateItemComplete,
    updateFocus,
    updateDnd
} from '../actions';

import App from './App';

const mapStateToProps = (state) => {
    return {
        items: state.items,
        focus: state.focus,
        dnd: state.dnd
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateItemText: (itemId, text) =>
            dispatch(updateItemText(itemId, text)),
        updateItemComplete: (itemId, complete) =>
            dispatch(updateItemComplete(itemId, complete)),
        createNewItemWithFocus: (parentItemId, prevItemId, nextItemId) =>
            dispatch(createNewItemWithFocus(parentItemId, prevItemId, nextItemId)),
        updateFocus: (parentId, itemId) =>
            dispatch(updateFocus(parentId, itemId)),
        updateDnd: (obj) =>
            dispatch(updateDnd(obj))
    };
};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;