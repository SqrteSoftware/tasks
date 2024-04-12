import { migrateFromLinkedListsToOrderSequence } from "./v1-linked-to-order";
import { cleanupLayouts } from "./v2-clean-layouts";
import { reformatLayouts } from "./v3-rerformat-layouts";

export function migrate() {
    let initialVersion = localStorage.getItem('schemaVersion');
    let latestMigration = schemaMigrations[schemaMigrations.length - 1].version;
    if (initialVersion === latestMigration) {
        console.log('Schema up to date');
        return;
    }
    let appState = JSON.parse(localStorage.getItem('appState'));

    let migratedAppState = migrateAppState(appState, initialVersion)

    localStorage.setItem('schemaVersion', latestMigration);
    localStorage.setItem('appState', JSON.stringify(migratedAppState));
}

export function migrateAppState(appState, initialVersion) {
    let latestMigration = schemaMigrations[schemaMigrations.length - 1].version;
    if (initialVersion === latestMigration) {
        console.log('Schema up to date');
        return;
    }
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
    return appState
}

const schemaMigrations = [
    {
        version: 1,
        migrate: migrateFromLinkedListsToOrderSequence
    },
    {
        version: 2,
        migrate: cleanupLayouts
    },
    {
        version: 3,
        migrate: reformatLayouts
    },
]
