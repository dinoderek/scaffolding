import { Redirect } from 'expo-router';

/**
 * Root `/` route — redirects to the merged Stats/History tab.
 *
 * Previously this re-exported `./session-list`. As part of the navigation redesign the home
 * destination is the Stats/History tab. `/session-list` itself is still a live route during
 * this migration so the `session-list-decompose` task can extract reusable pieces; the
 * `maestro-and-tests` task will retire it once nothing else hits the legacy path.
 */
export default function IndexRedirect() {
  return <Redirect href="/stats-history" />;
}
