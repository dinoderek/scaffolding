import { createSyncEngine } from '@/src/sync/engine';
import { SyncError } from '@/src/sync/error';
import type { SyncStateRepository } from '@/src/sync/engine';
import type { SyncAppStateSource, SyncConnectivitySource } from '@/src/sync/runtime-sources';
import type { SyncStatus, SyncTrigger, SyncAuthSession } from '@/src/sync/types';
import type { SyncAuthSessionSource } from '@/src/sync/auth-session';

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const buildSession = (overrides: Partial<SyncAuthSession> = {}): SyncAuthSession => ({
  accessToken: 'access-token-123',
  userId: 'user-123',
  expiresAt: new Date('2026-03-03T12:30:00.000Z'),
  ...overrides,
});

const createStateRepository = (): jest.Mocked<SyncStateRepository> => ({
  loadState: jest.fn(async () => ({
    id: 'device',
    status: 'never_initialized' as SyncStatus,
    pausedReason: null,
    lastSuccessfulSyncAt: null,
    lastFailedSyncAt: null,
    lastAttemptedSyncAt: null,
    createdAt: new Date('2026-03-03T11:00:00.000Z'),
    updatedAt: new Date('2026-03-03T11:00:00.000Z'),
  })),
  saveState: jest.fn(async (patch, { now }: { now?: Date } = {}) => ({
    id: 'device',
    status: 'idle' as SyncStatus,
    pausedReason: null,
    lastSuccessfulSyncAt: null,
    lastFailedSyncAt: null,
    lastAttemptedSyncAt: null,
    createdAt: new Date('2026-03-03T11:00:00.000Z'),
    updatedAt: now ?? new Date('2026-03-03T11:00:00.000Z'),
    ...patch,
  })),
});

const createAuthSource = (session: SyncAuthSession | null): SyncAuthSessionSource & { emit: (nextSession: SyncAuthSession | null) => void } => {
  let currentSession = session;
  const listeners = new Set<() => void>();

  return {
    async getSession() {
      return currentSession;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit(nextSession) {
      currentSession = nextSession;
      listeners.forEach((listener) => listener());
    },
  };
};

const createAppStateSource = (): SyncAppStateSource & { emit: (state: 'active' | 'background') => void } => {
  let currentState: 'active' | 'background' = 'active';
  const listeners = new Set<(state: 'active' | 'background') => void>();

  return {
    getCurrentState() {
      return currentState;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit(nextState) {
      currentState = nextState;
      listeners.forEach((listener) => listener(nextState));
    },
  };
};

const createConnectivitySource = (): SyncConnectivitySource & { emit: (isOnline: boolean) => void } => {
  let isOnline = true;
  const listeners = new Set<(nextOnline: boolean) => void>();

  return {
    async getIsOnline() {
      return isOnline;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit(nextOnline) {
      isOnline = nextOnline;
      listeners.forEach((listener) => listener(nextOnline));
    },
  };
};

const createScheduler = () => {
  const callbacks = new Map<number, () => void | Promise<void>>();
  let handle = 1;

  return {
    setInterval(callback: () => void | Promise<void>) {
      const nextHandle = handle++;
      callbacks.set(nextHandle, callback);
      return nextHandle;
    },
    clearInterval(intervalHandle: number) {
      callbacks.delete(intervalHandle);
    },
    async tickAll() {
      for (const callback of callbacks.values()) {
        await callback();
      }
    },
  };
};

describe('sync engine', () => {
  it('pauses immediately when sync is auth gated and no session exists', async () => {
    const authSessionSource = createAuthSource(null);
    const stateRepository = createStateRepository();
    const service = {
      runOnce: jest.fn(),
    };
    const engine = createSyncEngine({
      authSessionSource,
      backendConfig: {
        url: 'https://example.supabase.test',
        anonKey: 'anon-key',
      },
      service,
      stateRepository,
      appStateSource: createAppStateSource(),
      connectivitySource: createConnectivitySource(),
      scheduler: createScheduler(),
      now: () => new Date('2026-03-03T12:00:00.000Z'),
    });

    await engine.start();

    expect(service.runOnce).not.toHaveBeenCalled();
    expect(stateRepository.saveState).toHaveBeenCalledWith(
      {
        status: 'paused',
        pausedReason: 'auth_missing',
      },
      expect.any(Object)
    );
  });

  it('runs on bootstrap, resume, connectivity regain, and periodic polling while active', async () => {
    const authSessionSource = createAuthSource(buildSession());
    const stateRepository = createStateRepository();
    const service = {
      runOnce: jest.fn(async (_trigger: SyncTrigger) => undefined),
    };
    const appStateSource = createAppStateSource();
    const connectivitySource = createConnectivitySource();
    const scheduler = createScheduler();
    const engine = createSyncEngine({
      authSessionSource,
      backendConfig: {
        url: 'https://example.supabase.test',
        anonKey: 'anon-key',
      },
      service,
      stateRepository,
      appStateSource,
      connectivitySource,
      scheduler,
      now: () => new Date('2026-03-03T12:00:00.000Z'),
      pollIntervalMs: 60_000,
    });

    await engine.start();
    appStateSource.emit('background');
    appStateSource.emit('active');
    await flushMicrotasks();
    connectivitySource.emit(false);
    connectivitySource.emit(true);
    await flushMicrotasks();
    await scheduler.tickAll();
    await flushMicrotasks();

    expect(service.runOnce).toHaveBeenNthCalledWith(1, 'bootstrap');
    expect(service.runOnce).toHaveBeenNthCalledWith(2, 'resume');
    expect(service.runOnce).toHaveBeenNthCalledWith(3, 'connectivity_regain');
    expect(service.runOnce).toHaveBeenNthCalledWith(4, 'poll');
  });

  it('backs off after backend failures and retries again after the backoff window elapses', async () => {
    let currentNow = new Date('2026-03-03T12:00:00.000Z');
    const authSessionSource = createAuthSource(buildSession());
    const stateRepository = createStateRepository();
    const service = {
      runOnce: jest
        .fn()
        .mockRejectedValueOnce(new SyncError('backend_unavailable', 'backend down'))
        .mockResolvedValueOnce(undefined),
    };
    const scheduler = createScheduler();
    const engine = createSyncEngine({
      authSessionSource,
      backendConfig: {
        url: 'https://example.supabase.test',
        anonKey: 'anon-key',
      },
      service,
      stateRepository,
      appStateSource: createAppStateSource(),
      connectivitySource: createConnectivitySource(),
      scheduler,
      now: () => currentNow,
      pollIntervalMs: 60_000,
      retryBaseDelayMs: 5_000,
      retryMaxDelayMs: 30_000,
    });

    await engine.start();
    expect(service.runOnce).toHaveBeenCalledTimes(1);

    await engine.requestSync('poll');
    expect(service.runOnce).toHaveBeenCalledTimes(1);

    currentNow = new Date('2026-03-03T12:00:06.000Z');
    await engine.requestSync('poll');

    expect(service.runOnce).toHaveBeenCalledTimes(2);
    expect(stateRepository.saveState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        pausedReason: 'backend_unavailable',
      }),
      expect.any(Object)
    );
    expect(stateRepository.saveState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'idle',
        pausedReason: null,
      }),
      expect.any(Object)
    );
  });
});
