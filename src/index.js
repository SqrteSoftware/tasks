import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import throttle from 'lodash/throttle'

import App from './components/App';
import rootReducer from './reducers'
import * as serviceWorker from './serviceWorker';
import {loadStateFromLocalStorage, saveStateToLocalStorage} from './utils'
import {syncUp, syncDown} from './sync';
import './index.css';


let initialState = loadStateFromLocalStorage();

const store = createStore(
    rootReducer,
    initialState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

store.subscribe(
    throttle(() => saveStateToLocalStorage(store.getState()), 1000));

store.subscribe(throttle(() => {
    if (navigator.onLine) {
        syncUp(store);
    }
}, 1000));

window.addEventListener('online', () => {
    syncUp(store);
});

window.addEventListener('visibilitychange', () => {
    if (navigator.onLine && !document.hidden) {
        syncUp(store);
    }
});

if (navigator.storage && navigator.storage.persisted && navigator.storage.persist) {
    // Ask the browser to protect this domain's local storage
    // from user-agent cleanup:
    // https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/offline-for-pwa
    // https://storage.spec.whatwg.org/
    navigator.storage.persisted().then((persisted) => {
        if (!persisted) {
            navigator.storage.persist().then(persist => {
                if (!persist) {
                    alert("WARNING: Something went wrong while requesting persistent storage.");
                }
            })
        }
    });
}

syncDown(store);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
