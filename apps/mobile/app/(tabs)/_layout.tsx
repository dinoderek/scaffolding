import { Tabs } from 'expo-router';

/**
 * Tab group layout.
 *
 * - Tab roots (`stats-history`, `session-recorder`, `exercise-catalog`) have no native header;
 *   the existing in-screen `TopLevelTabs` continues to provide the bottom tab bar until the
 *   `bottom-tray` task replaces it with `BottomTray`.
 * - `settings` lives inside the group so it shares the layout, but is reached via the cog
 *   (not a tab) — `href: null` keeps it off the system tab bar.
 * - The system tab bar is hidden (`tabBar={() => null}`) to avoid double-rendering with the
 *   current in-screen `TopLevelTabs`. The `bottom-tray` task swaps this for the real tray.
 *
 * Route-coupling note: `/session-recorder` URL is preserved (route groups don't appear in URLs),
 * so `apps/mobile/src/sync/scheduler.ts` (`SESSION_RECORDER_ROUTE_SEGMENT`) keeps working.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => null}>
      <Tabs.Screen name="stats-history" options={{ title: 'Stats/History' }} />
      <Tabs.Screen name="session-recorder" options={{ title: 'Session Recorder' }} />
      <Tabs.Screen name="exercise-catalog" options={{ title: 'Exercise Catalog' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', href: null }} />
    </Tabs>
  );
}
