import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import throttle from 'lodash/throttle'

import App from './components/App';
import rootReducer from './reducers'
import * as serviceWorker from './serviceWorker';
import {loadStateFromLocalStorage, saveStateToLocalStorage} from './utils'

import './index.css';


let initialState = loadStateFromLocalStorage();

const store = createStore(
    rootReducer,
    initialState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

store.subscribe(
    throttle(() => saveStateToLocalStorage(store.getState()), 1000));

store.subscribe(() => {
   console.log("sync: ", store.getState().sync)
});

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
