import type { SyncPausedReason } from './types';

export type SyncErrorCode = SyncPausedReason | 'session_graph_stale' | 'unknown';

export class SyncError extends Error {
  readonly code: SyncErrorCode;

  constructor(code: SyncErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
    this.name = 'SyncError';
  }
}

export const toSyncError = (error: unknown): SyncError => {
  if (error instanceof SyncError) {
    return error;
  }

  if (error instanceof Error) {
    return new SyncError('unknown', error.message, { cause: error });
  }

  return new SyncError('unknown', 'Unknown sync failure');
};
