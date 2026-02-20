import type { DraftAutosaveController } from './draft-autosave';

export const shouldFlushOnAppStateChange = (nextState: string) =>
  nextState === 'background' || nextState === 'inactive';

export const createSessionRecorderLifecycleHelpers = (
  autosaveController: Pick<DraftAutosaveController, 'flushForLifecycle'>
) => ({
  onScreenBlur: () => autosaveController.flushForLifecycle('screen-blur'),
  onRouteChange: () => autosaveController.flushForLifecycle('route-change'),
  onAppStateChange: (nextState: string) => {
    if (!shouldFlushOnAppStateChange(nextState)) {
      return Promise.resolve();
    }

    return autosaveController.flushForLifecycle('app-background');
  },
});
