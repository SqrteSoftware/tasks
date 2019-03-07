import {connect} from 'react-redux';

import {
    createNewItemWithFocus,
    updateItemText,
    updateItemComplete,
    updateFocus,
    updateDnd,
    detachItemFromParent,
    attachItemToParent,
    removeItemFromParent
} from '../actions';

import App from '../components/App/App';

const mapStateToProps = (state) => {
    return {
        items: state.items,
        focus: state.focus,
        dnd: state.dnd
    }
};

const mapDispatchToProps = {
    updateItemText,
    updateItemComplete,
    createNewItemWithFocus,
    detachItemFromParent,
    attachItemToParent,
    updateFocus,
    updateDnd,
    removeItemFromParent
};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;