import {connect} from 'react-redux';

import * as actions from '../../slices/allActions';

import App from './App';

const mapStateToProps = (state) => {
    return {
        schema: state.schema,
        items: state.items,
        focus: state.focus,
        dnd: state.dnd,
        layouts: state.layouts,
        lists: state.lists,
        license: state.license,
        user: state.user,
        dialogs: state.dialogs,
        sync: state.sync
    }
};

const mapDispatchToProps = {
    ...actions
};

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default AppContainer;