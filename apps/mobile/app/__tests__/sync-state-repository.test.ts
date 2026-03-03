import {
  createDefaultSyncState,
  createSyncStateRepository,
  type SyncStateStore,
  type SyncStateSnapshot,
} from '@/src/data/sync-state';

const createMockStore = (): jest.Mocked<SyncStateStore> => ({
  load: jest.fn(),
  save: jest.fn(),
});

describe('sync state repository', () => {
  it('returns the explicit never-initialized state when nothing has been persisted yet', async () => {
    const store = createMockStore();
    const repository = createSyncStateRepository(store);
    const now = new Date('2026-03-03T12:00:00.000Z');

    store.load.mockResolvedValue(null);

    await expect(repository.loadState({ now })).resolves.toEqual(createDefaultSyncState(now));
  });

  it('merges and persists sync-state updates against the current snapshot', async () => {
    const store = createMockStore();
    const repository = createSyncStateRepository(store);
    const existingState: SyncStateSnapshot = {
      id: 'device',
      status: 'paused',
      pausedReason: 'auth_missing',
      lastSuccessfulSyncAt: null,
      lastFailedSyncAt: null,
      lastAttemptedSyncAt: null,
      createdAt: new Date('2026-03-03T11:30:00.000Z'),
      updatedAt: new Date('2026-03-03T11:30:00.000Z'),
    };
    const now = new Date('2026-03-03T12:15:00.000Z');

    store.load.mockResolvedValue(existingState);
    store.save.mockImplementation(async (input) => input);

    const result = await repository.saveState(
      {
        status: 'idle',
        pausedReason: null,
        lastAttemptedSyncAt: now,
        lastSuccessfulSyncAt: now,
      },
      { now }
    );

    expect(store.save).toHaveBeenCalledWith({
      ...existingState,
      status: 'idle',
      pausedReason: null,
      lastAttemptedSyncAt: now,
      lastSuccessfulSyncAt: now,
      updatedAt: now,
    });
    expect(result).toEqual({
      ...existingState,
      status: 'idle',
      pausedReason: null,
      lastAttemptedSyncAt: now,
      lastSuccessfulSyncAt: now,
      updatedAt: now,
    });
  });
});
