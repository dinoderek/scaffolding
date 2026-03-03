import { eq } from 'drizzle-orm';

import { bootstrapLocalDataLayer } from './bootstrap';
import { syncState } from './schema';
import type { SyncPausedReason, SyncStateSnapshot, SyncStatus } from '@/src/sync';

const DEFAULT_SYNC_STATE_ID = 'device';

export type SyncStateStore = {
  load(): Promise<SyncStateSnapshot | null>;
  save(input: SyncStateSnapshot): Promise<SyncStateSnapshot>;
};

export type { SyncStateSnapshot } from '@/src/sync';

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

const toDate = (value: Date | number | null | undefined): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  const converted = new Date(value);
  return isValidDate(converted) ? converted : null;
};

const mapSyncStateRow = (row: typeof syncState.$inferSelect): SyncStateSnapshot => {
  const createdAt = toDate(row.createdAt);
  const updatedAt = toDate(row.updatedAt);

  if (!createdAt || !updatedAt) {
    throw new Error('Sync state row contains invalid timestamp values');
  }

  return {
    id: row.id,
    status: row.status as SyncStatus,
    pausedReason: (row.pausedReason ?? null) as SyncPausedReason | null,
    lastSuccessfulSyncAt: toDate(row.lastSuccessfulSyncAt),
    lastFailedSyncAt: toDate(row.lastFailedSyncAt),
    lastAttemptedSyncAt: toDate(row.lastAttemptedSyncAt),
    createdAt,
    updatedAt,
  };
};

export const createDefaultSyncState = (now: Date = new Date()): SyncStateSnapshot => ({
  id: DEFAULT_SYNC_STATE_ID,
  status: 'never_initialized',
  pausedReason: null,
  lastSuccessfulSyncAt: null,
  lastFailedSyncAt: null,
  lastAttemptedSyncAt: null,
  createdAt: now,
  updatedAt: now,
});

export const createDrizzleSyncStateStore = (): SyncStateStore => ({
  async load() {
    const database = await bootstrapLocalDataLayer();
    const row = database.select().from(syncState).where(eq(syncState.id, DEFAULT_SYNC_STATE_ID)).get();

    return row ? mapSyncStateRow(row) : null;
  },
  async save(input) {
    const database = await bootstrapLocalDataLayer();
    const existing = database.select({ id: syncState.id }).from(syncState).where(eq(syncState.id, input.id)).get();

    if (existing) {
      database
        .update(syncState)
        .set({
          status: input.status,
          pausedReason: input.pausedReason,
          lastSuccessfulSyncAt: input.lastSuccessfulSyncAt,
          lastFailedSyncAt: input.lastFailedSyncAt,
          lastAttemptedSyncAt: input.lastAttemptedSyncAt,
          updatedAt: input.updatedAt,
        })
        .where(eq(syncState.id, input.id))
        .run();
    } else {
      database
        .insert(syncState)
        .values({
          id: input.id,
          status: input.status,
          pausedReason: input.pausedReason,
          lastSuccessfulSyncAt: input.lastSuccessfulSyncAt,
          lastFailedSyncAt: input.lastFailedSyncAt,
          lastAttemptedSyncAt: input.lastAttemptedSyncAt,
          createdAt: input.createdAt,
          updatedAt: input.updatedAt,
        })
        .run();
    }

    const saved = database.select().from(syncState).where(eq(syncState.id, input.id)).get();
    if (!saved) {
      throw new Error('Sync state save succeeded but no row was returned');
    }

    return mapSyncStateRow(saved);
  },
});

export const createSyncStateRepository = (store: SyncStateStore = createDrizzleSyncStateStore()) => ({
  async loadState({ now = new Date() }: { now?: Date } = {}): Promise<SyncStateSnapshot> {
    return (await store.load()) ?? createDefaultSyncState(now);
  },
  async saveState(
    patch: Partial<Omit<SyncStateSnapshot, 'id' | 'createdAt' | 'updatedAt'>>,
    { now = new Date() }: { now?: Date } = {}
  ): Promise<SyncStateSnapshot> {
    const current = await this.loadState({ now });

    return store.save({
      ...current,
      ...patch,
      updatedAt: now,
    });
  },
});
