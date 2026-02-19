/* eslint-disable import/first */

const mockOpenDatabaseSync = jest.fn();
const mockDrizzle = jest.fn();
const mockMigrate = jest.fn();

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: (...args: unknown[]) => mockOpenDatabaseSync(...args),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: (...args: unknown[]) => mockDrizzle(...args),
}));

jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({
  migrate: (...args: unknown[]) => mockMigrate(...args),
}));

import { __resetLocalDataLayerForTests, bootstrapLocalDataLayer } from '@/src/data/bootstrap';
import { localRuntimeMigrations } from '@/src/data/migrations';

describe('bootstrapLocalDataLayer', () => {
  beforeEach(() => {
    __resetLocalDataLayerForTests();
    mockOpenDatabaseSync.mockReset();
    mockDrizzle.mockReset();
    mockMigrate.mockReset();
  });

  it('creates the local database and applies runtime migrations once', async () => {
    const sqliteClient = { name: 'sqlite-client' };
    const localDatabase = { name: 'local-db' };

    mockOpenDatabaseSync.mockReturnValue(sqliteClient);
    mockDrizzle.mockReturnValue(localDatabase);
    mockMigrate.mockResolvedValue(undefined);

    const firstBootstrap = await bootstrapLocalDataLayer();
    const secondBootstrap = await bootstrapLocalDataLayer();

    expect(firstBootstrap).toBe(localDatabase);
    expect(secondBootstrap).toBe(localDatabase);
    expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(1);
    expect(mockDrizzle).toHaveBeenCalledTimes(1);
    expect(mockMigrate).toHaveBeenCalledTimes(1);
    expect(mockMigrate).toHaveBeenCalledWith(localDatabase, localRuntimeMigrations);
  });

  it('retries runtime migrations on the next bootstrap call after a failure', async () => {
    const sqliteClient = { name: 'sqlite-client' };
    const localDatabase = { name: 'local-db' };

    mockOpenDatabaseSync.mockReturnValue(sqliteClient);
    mockDrizzle.mockReturnValue(localDatabase);
    mockMigrate.mockRejectedValueOnce(new Error('migration failed')).mockResolvedValueOnce(undefined);

    await expect(bootstrapLocalDataLayer()).rejects.toThrow('migration failed');
    await expect(bootstrapLocalDataLayer()).resolves.toBe(localDatabase);

    expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(1);
    expect(mockDrizzle).toHaveBeenCalledTimes(1);
    expect(mockMigrate).toHaveBeenCalledTimes(2);
  });
});
