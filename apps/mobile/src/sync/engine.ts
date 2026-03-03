import { resolveSyncEligibility, type SyncAuthSessionSource, type SyncBackendConfig } from './auth-session';
import { toSyncError } from './error';
import type { SyncPausedReason, SyncStateSnapshot, SyncTrigger } from './types';
import type { SyncAppStateSource, SyncConnectivitySource } from './runtime-sources';

export type SyncStateRepository = {
  loadState(options?: { now?: Date }): Promise<SyncStateSnapshot>;
  saveState(
    patch: Partial<Omit<SyncStateSnapshot, 'id' | 'createdAt' | 'updatedAt'>>,
    options?: { now?: Date }
  ): Promise<SyncStateSnapshot>;
};

type SyncServiceRunner = {
  runOnce(trigger: SyncTrigger): Promise<unknown>;
};

type SyncScheduler = {
  setInterval(callback: () => void | Promise<void>, intervalMs: number): unknown;
  clearInterval(handle: unknown): void;
};

const defaultScheduler: SyncScheduler = {
  setInterval(callback, intervalMs) {
    return globalThis.setInterval(callback, intervalMs);
  },
  clearInterval(handle) {
    globalThis.clearInterval(handle as ReturnType<typeof setInterval>);
  },
};

const RETRY_BYPASS_TRIGGERS = new Set<SyncTrigger>(['connectivity_regain', 'auth_change']);

export const calculateRetryDelayMs = (attemptCount: number, baseDelayMs: number, maxDelayMs: number) =>
  Math.min(maxDelayMs, baseDelayMs * 2 ** Math.max(0, attemptCount - 1));

export const createSyncEngine = ({
  authSessionSource,
  backendConfig,
  service,
  stateRepository,
  appStateSource,
  connectivitySource,
  scheduler = defaultScheduler,
  now = () => new Date(),
  pollIntervalMs = 60_000,
  retryBaseDelayMs = 5_000,
  retryMaxDelayMs = 60_000,
}: {
  authSessionSource: SyncAuthSessionSource;
  backendConfig: SyncBackendConfig | null;
  service: SyncServiceRunner;
  stateRepository: SyncStateRepository;
  appStateSource: SyncAppStateSource;
  connectivitySource: SyncConnectivitySource;
  scheduler?: SyncScheduler;
  now?: () => Date;
  pollIntervalMs?: number;
  retryBaseDelayMs?: number;
  retryMaxDelayMs?: number;
}) => {
  let started = false;
  let currentAppState = appStateSource.getCurrentState();
  let isOnline = true;
  let retryAttemptCount = 0;
  let retryNotBeforeMs = 0;
  let inFlight: Promise<void> | null = null;
  const queuedTriggers: SyncTrigger[] = [];
  let pollHandle: unknown = null;
  const subscriptions: (() => void)[] = [];

  const savePausedState = async (pausedReason: SyncPausedReason) => {
    await stateRepository.saveState(
      {
        status: 'paused',
        pausedReason,
      },
      { now: now() }
    );
  };

  const clearRetryWindow = () => {
    retryAttemptCount = 0;
    retryNotBeforeMs = 0;
  };

  const queueOrRun = async (trigger: SyncTrigger): Promise<void> => {
    if (inFlight) {
      queuedTriggers.push(trigger);
      return inFlight;
    }

    inFlight = (async () => {
      if (!started) {
        return;
      }

      if (trigger === 'poll' && currentAppState !== 'active') {
        return;
      }

      if (!isOnline) {
        await savePausedState('offline');
        return;
      }

      const currentNow = now();
      if (retryNotBeforeMs > currentNow.getTime() && !RETRY_BYPASS_TRIGGERS.has(trigger)) {
        return;
      }

      const eligibility = await resolveSyncEligibility({
        authSessionSource,
        backendConfig,
        now: currentNow,
      });

      if (!eligibility.isSyncEnabled) {
        clearRetryWindow();
        await savePausedState(eligibility.pausedReason ?? 'backend_unconfigured');
        return;
      }

      await stateRepository.saveState(
        {
          status: 'syncing',
          pausedReason: null,
          lastAttemptedSyncAt: currentNow,
        },
        { now: currentNow }
      );

      try {
        await service.runOnce(trigger);
        clearRetryWindow();
        await stateRepository.saveState(
          {
            status: 'idle',
            pausedReason: null,
            lastSuccessfulSyncAt: currentNow,
          },
          { now: currentNow }
        );
      } catch (error) {
        const syncError = toSyncError(error);
        const failedAt = currentNow;

        if (syncError.code === 'offline') {
          isOnline = false;
          clearRetryWindow();
          await stateRepository.saveState(
            {
              status: 'paused',
              pausedReason: 'offline',
              lastFailedSyncAt: failedAt,
            },
            { now: failedAt }
          );
          return;
        }

        if (
          syncError.code === 'auth_missing' ||
          syncError.code === 'auth_expired' ||
          syncError.code === 'backend_unconfigured'
        ) {
          clearRetryWindow();
          await stateRepository.saveState(
            {
              status: 'paused',
              pausedReason: syncError.code,
              lastFailedSyncAt: failedAt,
            },
            { now: failedAt }
          );
          return;
        }

        retryAttemptCount += 1;
        retryNotBeforeMs =
          failedAt.getTime() + calculateRetryDelayMs(retryAttemptCount, retryBaseDelayMs, retryMaxDelayMs);

        await stateRepository.saveState(
          {
            status: 'error',
            pausedReason: 'backend_unavailable',
            lastFailedSyncAt: failedAt,
          },
          { now: failedAt }
        );
      }
    })();

    try {
      await inFlight;
    } finally {
      inFlight = null;
      const nextTrigger = queuedTriggers.shift();
      if (nextTrigger) {
        await queueOrRun(nextTrigger);
      }
    }
  };

  return {
    async start() {
      if (started) {
        return;
      }

      started = true;
      currentAppState = appStateSource.getCurrentState();
      isOnline = await connectivitySource.getIsOnline();

      subscriptions.push(
        appStateSource.subscribe((nextState) => {
          const previousState = currentAppState;
          currentAppState = nextState;

          if (previousState !== 'active' && nextState === 'active') {
            void queueOrRun('resume');
          }
        })
      );

      subscriptions.push(
        connectivitySource.subscribe((nextOnline) => {
          const previousOnline = isOnline;
          isOnline = nextOnline;

          if (!nextOnline) {
            void savePausedState('offline');
            return;
          }

          if (!previousOnline && nextOnline) {
            clearRetryWindow();
            void queueOrRun('connectivity_regain');
          }
        })
      );

      subscriptions.push(
        authSessionSource.subscribe(() => {
          void queueOrRun('auth_change');
        })
      );

      if (pollIntervalMs > 0) {
        pollHandle = scheduler.setInterval(() => queueOrRun('poll'), pollIntervalMs);
      }

      if (!isOnline) {
        await savePausedState('offline');
        return;
      }

      await queueOrRun('bootstrap');
    },
    stop() {
      if (!started) {
        return;
      }

      started = false;
      subscriptions.splice(0).forEach((unsubscribe) => unsubscribe());
      if (pollHandle !== null) {
        scheduler.clearInterval(pollHandle);
        pollHandle = null;
      }
      queuedTriggers.splice(0, queuedTriggers.length);
      inFlight = null;
      clearRetryWindow();
    },
    async requestSync(trigger: SyncTrigger) {
      await queueOrRun(trigger);
    },
  };
};
