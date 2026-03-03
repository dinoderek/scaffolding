import type { SyncAuthSessionSource, SyncBackendConfig } from './auth-session';

export type SyncBackendRequestOptions = RequestInit & {
  schema?: string;
};

export type SyncBackendClient = {
  request(path: string, init?: SyncBackendRequestOptions): Promise<Response>;
};

const ensureNoTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const resolveSyncBackendConfigFromEnv = (
  env: NodeJS.ProcessEnv = process.env
): SyncBackendConfig | null => {
  const url = env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return {
    url: ensureNoTrailingSlash(url),
    anonKey,
  };
};

export const createSyncBackendClient = ({
  authSessionSource,
  backendConfig = resolveSyncBackendConfigFromEnv(),
  fetchImplementation = fetch,
}: {
  authSessionSource: SyncAuthSessionSource;
  backendConfig?: SyncBackendConfig | null;
  fetchImplementation?: typeof fetch;
}): SyncBackendClient => ({
  async request(path, init = {}) {
    if (!backendConfig) {
      throw new Error('Sync backend is not configured');
    }

    const headers = new Headers(init.headers ?? {});
    const method = (init.method ?? 'GET').toUpperCase();
    const session = await authSessionSource.getSession();

    headers.set('apikey', backendConfig.anonKey);
    headers.delete('authorization');

    if (session?.accessToken) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
    }

    if (init.schema) {
      headers.set('Accept-Profile', init.schema);
      if (method !== 'GET' && method !== 'HEAD') {
        headers.set('Content-Profile', init.schema);
      } else {
        headers.delete('Content-Profile');
      }
    }

    const url = path.startsWith('http://') || path.startsWith('https://') ? path : `${backendConfig.url}${path}`;

    return fetchImplementation(url, {
      ...init,
      method,
      headers,
    });
  },
});
