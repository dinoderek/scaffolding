import { createContext, useContext, type PropsWithChildren } from 'react';

import type { SyncAuthSession, SyncPausedReason } from './types';
export type { SyncAuthSession } from './types';

export type SyncAuthSessionSource = {
  getSession(): Promise<SyncAuthSession | null>;
  subscribe(listener: () => void): () => void;
};

export type SyncEligibility = {
  isSyncEnabled: boolean;
  pausedReason: SyncPausedReason | null;
  session: SyncAuthSession | null;
};

export type SyncBackendConfig = {
  url: string;
  anonKey: string;
};

const noopUnsubscribe = () => undefined;

export const loggedOutSyncAuthSessionSource: SyncAuthSessionSource = {
  async getSession() {
    return null;
  },
  subscribe() {
    return noopUnsubscribe;
  },
};

export const createStaticSyncAuthSessionSource = (session: SyncAuthSession | null): SyncAuthSessionSource => ({
  async getSession() {
    return session;
  },
  subscribe() {
    return noopUnsubscribe;
  },
});

const SyncAuthSessionSourceContext = createContext<SyncAuthSessionSource>(loggedOutSyncAuthSessionSource);

export const SyncAuthSessionProvider = ({
  children,
  source = loggedOutSyncAuthSessionSource,
}: PropsWithChildren<{
  source?: SyncAuthSessionSource;
}>) => <SyncAuthSessionSourceContext.Provider value={source}>{children}</SyncAuthSessionSourceContext.Provider>;

export const useSyncAuthSessionSource = () => useContext(SyncAuthSessionSourceContext);

const isSessionExpired = (session: SyncAuthSession, now: Date) =>
  session.expiresAt !== null && session.expiresAt.getTime() <= now.getTime();

export const resolveSyncEligibility = async ({
  authSessionSource,
  backendConfig,
  now = new Date(),
}: {
  authSessionSource: SyncAuthSessionSource;
  backendConfig: SyncBackendConfig | null;
  now?: Date;
}): Promise<SyncEligibility> => {
  const session = await authSessionSource.getSession();

  if (!backendConfig) {
    return {
      isSyncEnabled: false,
      pausedReason: 'backend_unconfigured',
      session,
    };
  }

  if (!session) {
    return {
      isSyncEnabled: false,
      pausedReason: 'auth_missing',
      session: null,
    };
  }

  if (isSessionExpired(session, now)) {
    return {
      isSyncEnabled: false,
      pausedReason: 'auth_expired',
      session,
    };
  }

  return {
    isSyncEnabled: true,
    pausedReason: null,
    session,
  };
};
