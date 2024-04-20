import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import throttle from 'lodash/throttle';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import './index.css';
import App from './components/App';
import rootReducer from './slices/allReducers';
import * as serviceWorker from './serviceWorker';
import {loadStateFromLocalStorage, preprocessInitialState, saveStateToLocalStorage} from './utils';
import { persistenceCheck } from './utils/persistence';
import {handleNewRegistration} from './utils/license';
import {initSync} from './utils/sync';
import {testCryptoStorage} from './utils/app_crypto';
import { keepFresh } from './utils/refresh';
import { migrate } from './migrations';


let appState = loadStateFromLocalStorage()
appState = migrate(appState)

let initialState = preprocessInitialState(appState);

const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState
});

store.subscribe(
    throttle(() => saveStateToLocalStorage(store.getState()), 1000));

persistenceCheck(store.dispatch)
keepFresh();
initSync(store);
handleNewRegistration(store);

const theme = createTheme({
    palette: {
        secondary: {
            main: "#cccccc",
            light: "#dddddd",
            dark: "#bbbbbb",
            contrastText: "#000000"
        }
    }
});
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

// Make util methods public
window.testCryptoStorage = testCryptoStorage;