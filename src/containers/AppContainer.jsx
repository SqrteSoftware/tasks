import {connect} from 'react-redux';

import * as actions from '../actions';

import App from '../components/App/App';

const mapStateToProps = (state) => {
    return {
        items: state.items,
        focus: state.focus,
        dnd: state.dnd
    }
};

const mapDispatchToProps = {...actions};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;