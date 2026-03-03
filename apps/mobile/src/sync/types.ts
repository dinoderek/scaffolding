export type SyncStatus = 'never_initialized' | 'idle' | 'syncing' | 'paused' | 'error';

export type SyncPausedReason =
  | 'auth_missing'
  | 'auth_expired'
  | 'backend_unconfigured'
  | 'offline'
  | 'backend_unavailable';

export type SyncAuthSession = {
  accessToken: string;
  userId: string;
  expiresAt: Date | null;
};

export type SyncStateSnapshot = {
  id: string;
  status: SyncStatus;
  pausedReason: SyncPausedReason | null;
  lastSuccessfulSyncAt: Date | null;
  lastFailedSyncAt: Date | null;
  lastAttemptedSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
