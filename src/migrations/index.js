import { migrateFromLinkedListsToOrderSequence } from "./v1-linked-to-order";
import { cleanupLayouts } from "./v2-clean-layouts";
import { removeSchemaVersion } from "./v3-remove-schema-version";


export function migrate(appState) {
    if (!appState) {
        console.log('No data to migrate. Initializing to latest migration version.')
        return {schema: {version: LATEST_MIGRATION_VERSION}}
    }
    let initialVersion = appState?.schema?.version
    if (initialVersion === undefined) {
        // This will happen when using the app for the first time or
        // when importing an old JSON export that has no schema version.
        // All JSON exports AFTER v2 will record the schema version and
        // the v2 migration is idempotent, so defaulting to v1 is safe.
        console.log("No schema found. Defaulting to version 1")
        initialVersion = 1
    } else {
        console.log("Current Schema Version:", initialVersion)
    }
    if (initialVersion === LATEST_MIGRATION_VERSION) {
        console.log('Schema is up to date')
        return appState
    }
    let currentVersion = initialVersion
    schemaMigrations.forEach(migration => {
        if (currentVersion < migration.version) {
            console.log("Migrating schema to version: ", migration.version)
            appState = migration.migrate(appState)
            currentVersion = migration.version
        }
    })
    appState.schema = {version: currentVersion}
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
        migrate: removeSchemaVersion
    },
]


const LATEST_MIGRATION_VERSION = schemaMigrations[schemaMigrations.length - 1].version