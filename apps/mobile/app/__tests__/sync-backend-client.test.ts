import {
  createStaticSyncAuthSessionSource,
  resolveSyncEligibility,
  type SyncAuthSession,
} from '@/src/sync/auth-session';
import { createSyncBackendClient } from '@/src/sync/backend-client';

const buildSession = (overrides: Partial<SyncAuthSession> = {}): SyncAuthSession => ({
  accessToken: 'access-token-123',
  userId: 'user-123',
  expiresAt: new Date('2026-03-03T12:45:00.000Z'),
  ...overrides,
});

describe('sync backend client foundation', () => {
  it('reports auth_missing when the backend is configured but no authenticated session exists', async () => {
    const eligibility = await resolveSyncEligibility({
      authSessionSource: createStaticSyncAuthSessionSource(null),
      backendConfig: {
        url: 'https://example.supabase.test',
        anonKey: 'anon-key',
      },
    });

    expect(eligibility).toEqual({
      isSyncEnabled: false,
      pausedReason: 'auth_missing',
      session: null,
    });
  });

  it('reports auth_expired when the session is present but already expired', async () => {
    const eligibility = await resolveSyncEligibility({
      authSessionSource: createStaticSyncAuthSessionSource(
        buildSession({
          expiresAt: new Date('2026-03-03T12:00:00.000Z'),
        })
      ),
      backendConfig: {
        url: 'https://example.supabase.test',
        anonKey: 'anon-key',
      },
      now: new Date('2026-03-03T12:01:00.000Z'),
    });

    expect(eligibility).toEqual({
      isSyncEnabled: false,
      pausedReason: 'auth_expired',
      session: buildSession({
        expiresAt: new Date('2026-03-03T12:00:00.000Z'),
      }),
    });
  });

  it('attaches the user bearer token when an authenticated session is available', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    const client = createSyncBackendClient({
      authSessionSource: createStaticSyncAuthSessionSource(buildSession()),
      backendConfig: {
        url: 'https://example.supabase.test',
        anonKey: 'anon-key',
      },
      fetchImplementation: fetchMock,
    });

    await client.request('/rest/v1/sessions', {
      method: 'POST',
      schema: 'app_public',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 'session-1' }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.supabase.test/rest/v1/sessions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ id: 'session-1' }),
      })
    );

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init.headers as HeadersInit);

    expect(headers.get('apikey')).toBe('anon-key');
    expect(headers.get('authorization')).toBe('Bearer access-token-123');
    expect(headers.get('accept-profile')).toBe('app_public');
    expect(headers.get('content-profile')).toBe('app_public');
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('remains safe when logged out by omitting the bearer token while preserving public client headers', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    const client = createSyncBackendClient({
      authSessionSource: createStaticSyncAuthSessionSource(null),
      backendConfig: {
        url: 'https://example.supabase.test',
        anonKey: 'anon-key',
      },
      fetchImplementation: fetchMock,
    });

    await client.request('/rest/v1/sessions?select=id', {
      method: 'GET',
      schema: 'app_public',
    });

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init.headers as HeadersInit);

    expect(headers.get('apikey')).toBe('anon-key');
    expect(headers.get('authorization')).toBeNull();
    expect(headers.get('accept-profile')).toBe('app_public');
    expect(headers.get('content-profile')).toBeNull();
  });
});
