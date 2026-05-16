import * as Application from 'expo-application';

const DEV_BUNDLE_ID = 'com.phano.boga3.dev';

/**
 * True when the current build is a developer build:
 *   - Metro dev bundle (`__DEV__ === true`), OR
 *   - The EAS `dev` build profile (native bundle id `com.phano.boga3.dev`),
 *     which is what TestFlight ships for internal/developer testing.
 *
 * Use this as the gate for developer-only UI and unsafe escape hatches that
 * must remain available on dev TestFlight builds but never on the production
 * `com.phano.boga3` bundle.
 */
export const isDevMode = (): boolean => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return true;
  }
  return Application.applicationId === DEV_BUNDLE_ID;
};
