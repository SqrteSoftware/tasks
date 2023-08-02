import { createSlice } from '@reduxjs/toolkit'

import { deleteUserId } from './userSlice'

const initialState = {
    lastSyncUp: null,
    lastSyncDown: null,
    isSyncing: false,
    changeMarkers: {}
}

const syncSlice = createSlice({
    name: 'sync',
    initialState,
    reducers: {
        updateSyncUpDate: {
            reducer: (state, action) => ({
                ...state,
                lastSyncUp: action.payload.date
            }),
            prepare: (date = new Date().toISOString()) => ({
                payload: { date }
            })
        },
        updateSyncDownDate: {
            reducer: (state, action) => ({
                ...state,
                lastSyncDown: action.payload.date
            }),
            prepare: (date = new Date().toISOString()) => ({
                payload: { date }
            })
        },
        updateIsSyncing: {
            reducer: (state, action) => ({
                ...state,
                isSyncing: action.payload.isSyncing
            }),
            prepare: (isSyncing = false) => ({
                payload: { isSyncing }
            })
        },
        upsertChangeMarkers: {
            reducer: (state, action) => {
                return {
                    ...state,
                    changeMarkers: action.payload
                }
            },
        },
        deleteChangeMarkers: {
            reducer: (state, action) => {
                return handleDeleteChangeMarkers(state, action.payload)
            },
        }
    },
    extraReducers: (builder) => {
        builder.addCase(deleteUserId, (state, action) => {
            return initialState
        })
    }
  })

export default syncSlice.reducer

export const {
    updateSyncUpDate,
    updateSyncDownDate,
    updateIsSyncing,
    upsertChangeMarkers,
    deleteChangeMarkers
} = syncSlice.actions

function handleDeleteChangeMarkers(state, changeMarkers) {
    let newState = {
        ...state,
        changeMarkers: {...state.changeMarkers}
    }
    Object.keys(changeMarkers).forEach(id => {
        if (newState.changeMarkers[id] === undefined) {
            return;
        }
        if (newState.changeMarkers[id].date !== changeMarkers[id].date) {
            return;
        }
        if (newState.changeMarkers[id].type !== changeMarkers[id].type) {
            return;
        }
        delete newState.changeMarkers[id];
    })
    return newState;
}