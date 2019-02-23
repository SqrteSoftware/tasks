import {connect} from 'react-redux';

import {createNewItemWithFocus, updateItemText, updateFocus} from '../actions';

import App from './App';

const mapStateToProps = (state) => {
    return {
        items: state.items,
        focus: state.focus
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateItemText: (itemId, text) =>
            dispatch(updateItemText(itemId, text)),
        createNewItemWithFocus: (parentItemId, prevItemId, nextItemId) =>
            dispatch(createNewItemWithFocus(parentItemId, prevItemId, nextItemId)),
        updateFocus: (parentId, itemId) =>
            dispatch(updateFocus(parentId, itemId))
    };
};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;