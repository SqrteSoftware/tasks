import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import throttle from 'lodash/throttle';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import App from './components/App';
import rootReducer from './reducers';
import * as serviceWorker from './serviceWorker';
import {loadStateFromLocalStorage, saveStateToLocalStorage} from './utils';
import {handleNewRegistration} from './utils/license';
import {syncUp, syncDown} from './utils/sync';
import './index.css';

import {testCryptoStorage} from './utils/app_crypto';
window.testCryptoStorage = testCryptoStorage;


let initialState = loadStateFromLocalStorage();

const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState
});

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
handleNewRegistration(store);

const theme = createTheme();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </Provider>
    </React.StrictMode>
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
