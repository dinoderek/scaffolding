/* eslint-disable import/first */

const mockOpenDatabaseSync = jest.fn();
const mockDeleteDatabaseAsync = jest.fn();
const mockDrizzle = jest.fn();
const mockMigrate = jest.fn();
const mockSeedSystemExerciseCatalog = jest.fn();

jest.mock('expo-sqlite', () => ({
  deleteDatabaseAsync: (...args: unknown[]) => mockDeleteDatabaseAsync(...args),
  openDatabaseSync: (...args: unknown[]) => mockOpenDatabaseSync(...args),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: (...args: unknown[]) => mockDrizzle(...args),
}));

jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({
  migrate: (...args: unknown[]) => mockMigrate(...args),
}));

jest.mock('@/src/data/exercise-catalog-seeds', () => ({
  seedSystemExerciseCatalog: (...args: unknown[]) => mockSeedSystemExerciseCatalog(...args),
}));

import { __resetLocalDataLayerForTests, bootstrapLocalDataLayer, resetLocalAppData } from '@/src/data/bootstrap';
import { localRuntimeMigrations } from '@/src/data/migrations';

describe('bootstrapLocalDataLayer', () => {
  beforeEach(() => {
    __resetLocalDataLayerForTests();
    mockOpenDatabaseSync.mockReset();
    mockDeleteDatabaseAsync.mockReset();
    mockDrizzle.mockReset();
    mockMigrate.mockReset();
    mockSeedSystemExerciseCatalog.mockReset();
  });

  it('creates the local database, applies runtime migrations, and seeds the system exercise catalog once', async () => {
    const sqliteClient = { name: 'sqlite-client' };
    const localDatabase = { name: 'local-db' };

    mockOpenDatabaseSync.mockReturnValue(sqliteClient);
    mockDrizzle.mockReturnValue(localDatabase);
    mockMigrate.mockResolvedValue(undefined);
    mockSeedSystemExerciseCatalog.mockReturnValue(undefined);

    const firstBootstrap = await bootstrapLocalDataLayer();
    const secondBootstrap = await bootstrapLocalDataLayer();

    expect(firstBootstrap).toBe(localDatabase);
    expect(secondBootstrap).toBe(localDatabase);
    expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(1);
    expect(mockDrizzle).toHaveBeenCalledTimes(1);
    expect(mockMigrate).toHaveBeenCalledTimes(1);
    expect(mockMigrate).toHaveBeenCalledWith(localDatabase, localRuntimeMigrations);
    expect(mockSeedSystemExerciseCatalog).toHaveBeenCalledTimes(1);
    expect(mockSeedSystemExerciseCatalog).toHaveBeenCalledWith(localDatabase);
  });

  it('retries runtime migrations on the next bootstrap call after a failure', async () => {
    const sqliteClient = { name: 'sqlite-client' };
    const localDatabase = { name: 'local-db' };

    mockOpenDatabaseSync.mockReturnValue(sqliteClient);
    mockDrizzle.mockReturnValue(localDatabase);
    mockMigrate.mockRejectedValueOnce(new Error('migration failed')).mockResolvedValueOnce(undefined);
    mockSeedSystemExerciseCatalog.mockReturnValue(undefined);

    await expect(bootstrapLocalDataLayer()).rejects.toThrow('migration failed');
    await expect(bootstrapLocalDataLayer()).resolves.toBe(localDatabase);

    expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(1);
    expect(mockDrizzle).toHaveBeenCalledTimes(1);
    expect(mockMigrate).toHaveBeenCalledTimes(2);
    expect(mockSeedSystemExerciseCatalog).toHaveBeenCalledTimes(1);
  });

  it('retries system exercise catalog seeding on the next bootstrap call after a seed failure', async () => {
    const sqliteClient = { name: 'sqlite-client' };
    const localDatabase = { name: 'local-db' };

    mockOpenDatabaseSync.mockReturnValue(sqliteClient);
    mockDrizzle.mockReturnValue(localDatabase);
    mockMigrate.mockResolvedValue(undefined);
    mockSeedSystemExerciseCatalog.mockImplementationOnce(() => {
      throw new Error('seed failed');
    });

    await expect(bootstrapLocalDataLayer()).rejects.toThrow('seed failed');

    mockSeedSystemExerciseCatalog.mockImplementation(() => undefined);

    await expect(bootstrapLocalDataLayer()).resolves.toBe(localDatabase);

    expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(1);
    expect(mockDrizzle).toHaveBeenCalledTimes(1);
    expect(mockMigrate).toHaveBeenCalledTimes(1);
    expect(mockSeedSystemExerciseCatalog).toHaveBeenCalledTimes(2);
  });

  it('resets runtime app data by closing the database, deleting it, and re-running bootstrap', async () => {
    const sqliteClient = {
      closeAsync: jest.fn().mockResolvedValue(undefined),
      name: 'sqlite-client',
    };
    const resetSqliteClient = {
      closeAsync: jest.fn().mockResolvedValue(undefined),
      name: 'sqlite-client-after-reset',
    };
    const localDatabase = { name: 'local-db' };
    const resetLocalDatabase = { name: 'local-db-after-reset' };

    mockOpenDatabaseSync.mockReturnValueOnce(sqliteClient).mockReturnValueOnce(resetSqliteClient);
    mockDeleteDatabaseAsync.mockResolvedValue(undefined);
    mockDrizzle.mockReturnValueOnce(localDatabase).mockReturnValueOnce(resetLocalDatabase);
    mockMigrate.mockResolvedValue(undefined);
    mockSeedSystemExerciseCatalog.mockReturnValue(undefined);

    await bootstrapLocalDataLayer();
    const resetDatabase = await resetLocalAppData();

    expect(resetDatabase).toBe(resetLocalDatabase);
    expect(sqliteClient.closeAsync).toHaveBeenCalledTimes(1);
    expect(resetSqliteClient.closeAsync).not.toHaveBeenCalled();
    expect(mockDeleteDatabaseAsync).toHaveBeenCalledWith('scaffolding-local.db');
    expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(2);
    expect(mockDrizzle).toHaveBeenCalledTimes(2);
    expect(mockMigrate).toHaveBeenCalledTimes(2);
    expect(mockSeedSystemExerciseCatalog).toHaveBeenCalledTimes(2);
  });
});
