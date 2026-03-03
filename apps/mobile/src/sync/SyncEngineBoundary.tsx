import { useEffect } from 'react';

import { createSyncStateRepository } from '@/src/data';

import { useSyncAuthSessionSource } from './auth-session';
import { createSyncBackendClient, resolveSyncBackendConfigFromEnv } from './backend-client';
import { createSyncEngine } from './engine';
import { createSyncLocalStore } from './local-store';
import { createSyncRemoteStore } from './remote-store';
import { createNetInfoSyncConnectivitySource, reactNativeAppStateSource } from './runtime-sources';
import { createSyncService } from './service';

export const SyncEngineBoundary = () => {
  const authSessionSource = useSyncAuthSessionSource();

  useEffect(() => {
    const backendConfig = resolveSyncBackendConfigFromEnv();
    const backendClient = createSyncBackendClient({
      authSessionSource,
      backendConfig,
    });
    const engine = createSyncEngine({
      authSessionSource,
      backendConfig,
      service: createSyncService({
        localStore: createSyncLocalStore(),
        remoteStore: createSyncRemoteStore({
          backendClient,
        }),
      }),
      stateRepository: createSyncStateRepository(),
      appStateSource: reactNativeAppStateSource,
      connectivitySource: createNetInfoSyncConnectivitySource(),
    });

    void engine.start();

    return () => {
      engine.stop();
    };
  }, [authSessionSource]);

  return null;
};
