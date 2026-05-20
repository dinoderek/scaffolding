import { Redirect } from 'expo-router';

/**
 * Legacy `/stats` route — redirects to the merged Stats/History tab.
 *
 * The previous Stats screen body now lives at `app/(tabs)/stats-history.tsx`. Callers that
 * still navigate to `/stats` (e.g. the current `TopLevelTabs` bar) land here and bounce.
 * The follow-up `bottom-tray` task updates `TopLevelTabs` callers to point at `/stats-history`
 * directly and this shim can be removed by `maestro-and-tests` once nothing still hits `/stats`.
 */
export default function StatsRedirect() {
  return <Redirect href="/stats-history" />;
}
