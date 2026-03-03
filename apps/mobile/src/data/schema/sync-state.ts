import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const syncState = sqliteTable(
  'sync_state',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .default(sql`'device'`),
    status: text('status', { enum: ['never_initialized', 'idle', 'syncing', 'paused', 'error'] })
      .notNull()
      .default('never_initialized'),
    pausedReason: text('paused_reason', {
      enum: ['auth_missing', 'auth_expired', 'backend_unconfigured', 'offline', 'backend_unavailable'],
    }),
    lastSuccessfulSyncAt: integer('last_successful_sync_at', { mode: 'timestamp_ms' }),
    lastFailedSyncAt: integer('last_failed_sync_at', { mode: 'timestamp_ms' }),
    lastAttemptedSyncAt: integer('last_attempted_sync_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    statusIdx: index('sync_state_status_idx').on(table.status),
    statusGuard: check(
      'sync_state_status_guard',
      sql`${table.status} in ('never_initialized', 'idle', 'syncing', 'paused', 'error')`
    ),
    pausedReasonGuard: check(
      'sync_state_paused_reason_guard',
      sql`${table.pausedReason} is null or ${table.pausedReason} in ('auth_missing', 'auth_expired', 'backend_unconfigured', 'offline', 'backend_unavailable')`
    ),
  })
);

export type SyncState = typeof syncState.$inferSelect;
export type NewSyncState = typeof syncState.$inferInsert;
