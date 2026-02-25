import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { localRuntimeMigrations } from './migrations';
import { seedSystemExerciseCatalog } from './exercise-catalog-seeds';
import * as schema from './schema';

const LOCAL_DATABASE_NAME = 'scaffolding-local.db';

let sqliteDatabase: SQLiteDatabase | null = null;

export const getSqliteDatabase = () => {
  if (sqliteDatabase) {
    return sqliteDatabase;
  }

  sqliteDatabase = openDatabaseSync(LOCAL_DATABASE_NAME);
  return sqliteDatabase;
};

const createLocalDatabase = () => drizzle(getSqliteDatabase(), { schema });

export type LocalDatabase = ReturnType<typeof createLocalDatabase>;

let localDatabase: LocalDatabase | null = null;
let runtimeMigrationsComplete = false;
let runtimeMigrationPromise: Promise<void> | null = null;
let runtimeExerciseCatalogSeedComplete = false;
let runtimeExerciseCatalogSeedPromise: Promise<void> | null = null;

const runRuntimeMigrations = async (database: LocalDatabase) => {
  if (runtimeMigrationsComplete) {
    return;
  }

  if (!runtimeMigrationPromise) {
    runtimeMigrationPromise = migrate(database, localRuntimeMigrations)
      .then(() => {
        runtimeMigrationsComplete = true;
      })
      .catch((error) => {
        runtimeMigrationPromise = null;
        throw error;
      });
  }

  await runtimeMigrationPromise;
};

const runRuntimeExerciseCatalogSeed = async (database: LocalDatabase) => {
  if (runtimeExerciseCatalogSeedComplete) {
    return;
  }

  if (!runtimeExerciseCatalogSeedPromise) {
    runtimeExerciseCatalogSeedPromise = Promise.resolve()
      .then(() => {
        seedSystemExerciseCatalog(database);
        runtimeExerciseCatalogSeedComplete = true;
      })
      .catch((error) => {
        runtimeExerciseCatalogSeedPromise = null;
        throw error;
      });
  }

  await runtimeExerciseCatalogSeedPromise;
};

export const bootstrapLocalDataLayer = async () => {
  if (localDatabase) {
    await runRuntimeMigrations(localDatabase);
    await runRuntimeExerciseCatalogSeed(localDatabase);
    return localDatabase;
  }

  localDatabase = createLocalDatabase();
  await runRuntimeMigrations(localDatabase);
  await runRuntimeExerciseCatalogSeed(localDatabase);
  return localDatabase;
};

export const __resetLocalDataLayerForTests = () => {
  sqliteDatabase = null;
  localDatabase = null;
  runtimeMigrationsComplete = false;
  runtimeMigrationPromise = null;
  runtimeExerciseCatalogSeedComplete = false;
  runtimeExerciseCatalogSeedPromise = null;
};
