
export function removeSchemaVersion(state) {
    localStorage.removeItem('schemaVersion')
    return state;
}

