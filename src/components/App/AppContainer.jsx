import {connect} from 'react-redux';

import {
    createNewItemWithFocus,
    updateItemText,
    updateItemComplete,
    updateFocus,
    updateDnd,
    detachItemFromParent,
    attachItemToParent
} from '../../actions';

import App from './App';

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
    updateDnd
};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;