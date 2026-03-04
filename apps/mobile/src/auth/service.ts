import type { AuthChangeEvent, Session, SupabaseClient, User } from '@supabase/supabase-js';

import { getMobileAuthRuntimeConfig, getSupabaseMobileClient, __resetSupabaseMobileClientForTests } from './supabase';

export type AuthBootstrapStatus = 'idle' | 'restoring' | 'ready';

export type AuthSnapshot = {
  disabledReason: string | null;
  isConfigured: boolean;
  lastError: string | null;
  session: Session | null;
  status: AuthBootstrapStatus;
  user: User | null;
};

export type SignInWithPasswordCredentials = {
  email: string;
  password: string;
};

type AuthStateListener = () => void;

const listeners = new Set<AuthStateListener>();

let authSnapshot: AuthSnapshot = {
  status: 'idle',
  session: null,
  user: null,
  isConfigured: getMobileAuthRuntimeConfig().isConfigured,
  disabledReason: getMobileAuthRuntimeConfig().disabledReason,
  lastError: null,
};
let authBootstrapPromise: Promise<AuthSnapshot> | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;

const emitAuthSnapshot = () => {
  for (const listener of listeners) {
    listener();
  }
};

const setAuthSnapshot = (nextSnapshot: Partial<AuthSnapshot>) => {
  authSnapshot = {
    ...authSnapshot,
    ...nextSnapshot,
  };
  emitAuthSnapshot();
};

const createReadySnapshotFromSession = (session: Session | null): AuthSnapshot => {
  const runtimeConfig = getMobileAuthRuntimeConfig();

  return {
    status: 'ready',
    session,
    user: session?.user ?? null,
    isConfigured: runtimeConfig.isConfigured,
    disabledReason: runtimeConfig.disabledReason,
    lastError: null,
  };
};

const handleAuthStateChange = (_event: AuthChangeEvent, session: Session | null) => {
  authSnapshot = createReadySnapshotFromSession(session);
  emitAuthSnapshot();
};

const ensureAuthSubscription = (client: SupabaseClient) => {
  if (authSubscription) {
    return;
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange(handleAuthStateChange);

  authSubscription = subscription;
};

const getConfiguredClient = () => {
  const runtimeConfig = getMobileAuthRuntimeConfig();

  if (!runtimeConfig.isConfigured) {
    throw new Error(runtimeConfig.disabledReason ?? 'Supabase mobile auth is not configured.');
  }

  const client = getSupabaseMobileClient();

  if (!client) {
    throw new Error('Supabase mobile auth client could not be created.');
  }

  return client;
};

export const getAuthSnapshot = () => authSnapshot;

export const subscribeToAuthState = (listener: AuthStateListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const bootstrapAuthState = async () => {
  const runtimeConfig = getMobileAuthRuntimeConfig();

  if (!runtimeConfig.isConfigured) {
    authSnapshot = {
      status: 'ready',
      session: null,
      user: null,
      isConfigured: false,
      disabledReason: runtimeConfig.disabledReason,
      lastError: null,
    };
    emitAuthSnapshot();
    return authSnapshot;
  }

  if (authSnapshot.status === 'ready' && authSnapshot.isConfigured) {
    return authSnapshot;
  }

  if (!authBootstrapPromise) {
    const client = getConfiguredClient();

    ensureAuthSubscription(client);
    setAuthSnapshot({
      status: 'restoring',
      isConfigured: true,
      disabledReason: null,
      lastError: null,
    });

    authBootstrapPromise = client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          setAuthSnapshot({
            status: 'ready',
            session: null,
            user: null,
            lastError: error.message,
          });
          return authSnapshot;
        }

        authSnapshot = createReadySnapshotFromSession(data.session);
        emitAuthSnapshot();
        return authSnapshot;
      })
      .finally(() => {
        authBootstrapPromise = null;
      });
  }

  return authBootstrapPromise;
};

export const clearAuthError = () => {
  if (!authSnapshot.lastError) {
    return;
  }

  setAuthSnapshot({
    lastError: null,
  });
};

export const signInWithPassword = async ({ email, password }: SignInWithPasswordCredentials) => {
  const client = getConfiguredClient();

  setAuthSnapshot({
    lastError: null,
  });

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setAuthSnapshot({
      status: 'ready',
      session: null,
      user: null,
      lastError: error.message,
    });
    throw error;
  }

  authSnapshot = createReadySnapshotFromSession(data.session);
  emitAuthSnapshot();
  return data;
};

export const signOut = async () => {
  const client = getConfiguredClient();

  setAuthSnapshot({
    lastError: null,
  });

  const { error } = await client.auth.signOut();

  if (error) {
    setAuthSnapshot({
      lastError: error.message,
    });
    throw error;
  }

  authSnapshot = createReadySnapshotFromSession(null);
  emitAuthSnapshot();
};

export const __resetAuthForTests = () => {
  authSubscription?.unsubscribe();
  authSubscription = null;
  authBootstrapPromise = null;
  __resetSupabaseMobileClientForTests();

  const runtimeConfig = getMobileAuthRuntimeConfig();

  authSnapshot = {
    status: 'idle',
    session: null,
    user: null,
    isConfigured: runtimeConfig.isConfigured,
    disabledReason: runtimeConfig.disabledReason,
    lastError: null,
  };
  listeners.clear();
};
