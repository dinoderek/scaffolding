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

export type SyncTrigger = 'bootstrap' | 'resume' | 'connectivity_regain' | 'poll' | 'auth_change';

export type SyncGymRecord = {
  id: string;
  name: string;
  originScopeId: string;
  originSourceId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SyncSetRecord = {
  id: string;
  sessionExerciseId: string;
  orderIndex: number;
  weightValue: string;
  repsValue: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SyncExerciseRecord = {
  id: string;
  sessionId: string;
  orderIndex: number;
  name: string;
  machineName: string | null;
  originScopeId: string;
  originSourceId: string;
  createdAt: Date;
  updatedAt: Date;
  sets: SyncSetRecord[];
};

export type SyncLocalSessionStatus = 'active' | 'completed';

export type SyncSessionGraph = {
  sessionId: string;
  gymId: string | null;
  status: SyncLocalSessionStatus;
  startedAt: Date;
  completedAt: Date | null;
  durationSec: number | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  exercises: SyncExerciseRecord[];
};

export type SyncDataset = {
  gyms: SyncGymRecord[];
  sessionGraphs: SyncSessionGraph[];
};

export type SyncRunResult = {
  gymsPulled: number;
  gymsPushed: number;
  sessionGraphsPulled: number;
  sessionGraphsPushed: number;
};

export type SyncLocalStore = {
  pullDataset(): Promise<SyncDataset>;
  upsertGym(gym: SyncGymRecord): Promise<void>;
  replaceSessionGraph(graph: SyncSessionGraph): Promise<void>;
};

export type SyncRemoteStore = {
  pullDataset(): Promise<SyncDataset>;
  createGym(gym: SyncGymRecord): Promise<void>;
  updateGym(gym: SyncGymRecord): Promise<void>;
  replaceSessionGraph(
    graph: SyncSessionGraph,
    options: {
      expectedUpdatedAt: Date | null;
    }
  ): Promise<SyncSessionGraph>;
  pullSessionGraph(sessionId: string): Promise<SyncSessionGraph | null>;
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
