import {connect} from 'react-redux';

import {updateItemText} from '../actions';

import App from './App';

const mapStateToProps = (state) => {
    return {
        items: state.items
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateItemText: (itemId, text) => dispatch(updateItemText(itemId, text))
    };
};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;