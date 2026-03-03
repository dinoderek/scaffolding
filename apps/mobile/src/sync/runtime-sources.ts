import NetInfo from '@react-native-community/netinfo';
import { AppState, type AppStateStatus } from 'react-native';

export type SyncAppRuntimeState = 'active' | 'background';

export type SyncAppStateSource = {
  getCurrentState(): SyncAppRuntimeState;
  subscribe(listener: (state: SyncAppRuntimeState) => void): () => void;
};

export type SyncConnectivitySource = {
  getIsOnline(): Promise<boolean>;
  subscribe(listener: (isOnline: boolean) => void): () => void;
};

const normalizeAppState = (state: AppStateStatus): SyncAppRuntimeState => (state === 'active' ? 'active' : 'background');

const normalizeConnectivity = (isConnected: boolean | null, isInternetReachable: boolean | null) =>
  Boolean(isConnected) && isInternetReachable !== false;

export const reactNativeAppStateSource: SyncAppStateSource = {
  getCurrentState() {
    return normalizeAppState(AppState.currentState);
  },
  subscribe(listener) {
    const subscription = AppState.addEventListener('change', (nextState) => {
      listener(normalizeAppState(nextState));
    });

    return () => subscription.remove();
  },
};

export const createNetInfoSyncConnectivitySource = (): SyncConnectivitySource => ({
  async getIsOnline() {
    const state = await NetInfo.fetch();
    return normalizeConnectivity(state.isConnected, state.isInternetReachable);
  },
  subscribe(listener) {
    const unsubscribe = NetInfo.addEventListener((state) => {
      listener(normalizeConnectivity(state.isConnected, state.isInternetReachable));
    });

    return () => unsubscribe();
  },
});
