import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import throttle from 'lodash/throttle';
import uuidv4 from 'uuid/v4'

import App from './components/App';
import rootReducer from './reducers';
import * as serviceWorker from './serviceWorker';
import {loadStateFromLocalStorage, saveStateToLocalStorage} from './utils';
import {loadUrlQueryParams} from './utils';
import {syncUp, syncDown} from './utils/sync';
import {createEncodedKeypair} from './utils/crypto';
import './index.css';

import {testCrypto} from './utils/crypto';
window.testCrypto = testCrypto;

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
    // https://developers.google.com/web/updates/2016/06/persistent-storage
    navigator.storage.persisted().then((persisted) => {
        if (!persisted) {
            navigator.storage.persist().then(persist => {
                if (!persist) {
                    console.log("WARNING: request for persistent storage was denied.");
                }
            })
        }
    });
}

syncDown(store);

let queryParams = loadUrlQueryParams();
if (queryParams.session) {
    let license = uuidv4().toUpperCase();
    createEncodedKeypair(license).then(keyInfo => {
        console.log("LICENSE:",license);
        console.log("KEY GENERATED:",keyInfo);
        // store.dispatch();
    });
}

ReactDOM.render(
    <Provider store={store}>
        <App queryParams={queryParams}/>
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
