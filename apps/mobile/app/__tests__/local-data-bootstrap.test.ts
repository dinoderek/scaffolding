/* eslint-disable import/first */

const mockOpenDatabaseSync = jest.fn();
const mockDrizzle = jest.fn();
const mockMigrate = jest.fn();
const mockSeedSystemExerciseCatalog = jest.fn();

jest.mock('expo-sqlite', () => ({
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

import { __resetLocalDataLayerForTests, bootstrapLocalDataLayer } from '@/src/data/bootstrap';
import { localRuntimeMigrations } from '@/src/data/migrations';

describe('bootstrapLocalDataLayer', () => {
  beforeEach(() => {
    __resetLocalDataLayerForTests();
    mockOpenDatabaseSync.mockReset();
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
});
