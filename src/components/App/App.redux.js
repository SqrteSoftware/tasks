import {connect} from 'react-redux';

import * as actions from '../../actions';

import App from './App';

const mapStateToProps = (state) => {
    return {
        items: state.items,
        focus: state.focus,
        dnd: state.dnd,
        layouts: state.layouts,
        lists: state.lists
    }
};

const mapDispatchToProps = {...actions};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;