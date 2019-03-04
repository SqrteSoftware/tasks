import {connect} from 'react-redux';

import {
    createNewItemWithFocus,
    updateItemText,
    updateItemComplete,
    updateFocus,
    updateDnd,
    detachItemFromParent,
    attachItemToParent
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
        detachItemFromParent: (itemId, parentId) =>
            dispatch(detachItemFromParent(itemId, parentId)),
        attachItemToParent: (itemId, parentId, prevItemId, nextItemId) =>
            dispatch(attachItemToParent(itemId, parentId, prevItemId, nextItemId)),

        updateFocus: (parentId, itemId) =>
            dispatch(updateFocus(parentId, itemId)),
        updateDnd: (obj) =>
            dispatch(updateDnd(obj))
    };
};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;