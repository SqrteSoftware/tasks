import { migrateFromLinkedListsToOrderSequence } from "./v1-linked-to-order";

export function migrate() {
    let initialVersion = localStorage.getItem('schemaVersion');
    let latestMigration = schemaMigrations[schemaMigrations.length - 1].version;
    if (initialVersion === latestMigration) {
        console.log('Schema up to date');
        return;
    }
    let appState = JSON.parse(localStorage.getItem('appState'));
    if (!appState) {
        console.log('There is no app state to migrate');
        localStorage.setItem('schemaVersion', latestMigration);
        return;
    }
    let currentVersion = initialVersion;
    schemaMigrations.forEach(migration => {
        if (currentVersion < migration.version) {
            appState = migration.migrate(appState);
            currentVersion = migration.version;
        }
    })
    localStorage.setItem('schemaVersion', currentVersion);
    localStorage.setItem('appState', JSON.stringify(appState));
}

const schemaMigrations = [
    {
        version: 1,
        migrate: migrateFromLinkedListsToOrderSequence
    }
]

