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

function observeStore(store) {
    let currentItems = store.getState().items;

    function handleChange() {
        let newItems = store.getState().items;
        if (newItems !== currentItems) {
            Object.keys(newItems).forEach(itemId => {
               if (newItems[itemId] !== currentItems[itemId]) {
                   console.log("ITEM CHANGED:", newItems[itemId]);
               }
            });
            currentItems = newItems;
        }
    }

    let unsubscribe = store.subscribe(handleChange);
    return unsubscribe;
}
observeStore(store);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
