import { StyleSheet } from 'react-native';

import { UiButton, UiSurface, uiColors, uiRadius, uiSpace } from '@/components/ui';

export type TopLevelTabKey = 'sessions' | 'exercises' | 'sync-status';

type TopLevelTabsProps = {
  activeTab: TopLevelTabKey;
  onPressSessions: () => void;
  onPressExercises: () => void;
  onPressSyncStatus: () => void;
};

export function TopLevelTabs({ activeTab, onPressSessions, onPressExercises, onPressSyncStatus }: TopLevelTabsProps) {
  return (
    <UiSurface accessibilityRole="tablist" style={styles.shell} testID="top-level-bottom-tabs">
      <UiButton
        accessibilityLabel="Open Sessions"
        accessibilityRole="tab"
        active={activeTab === 'sessions'}
        label="Sessions"
        onPress={onPressSessions}
        variant="tab"
      />
      <UiButton
        accessibilityLabel="Open Exercises"
        accessibilityRole="tab"
        active={activeTab === 'exercises'}
        label="Exercises"
        onPress={onPressExercises}
        variant="tab"
      />
      <UiButton
        accessibilityLabel="Open Sync Status"
        accessibilityRole="tab"
        active={activeTab === 'sync-status'}
        label="⚙"
        onPress={onPressSyncStatus}
        style={styles.syncButton}
        testID="top-level-tab-sync-status"
        textStyle={styles.syncButtonText}
        variant="tab"
      />
    </UiSurface>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiSpace.sm,
    padding: uiSpace.sm,
    borderRadius: uiRadius.xl,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
  },
  syncButton: {
    flex: 0,
    width: 44,
    minWidth: 44,
    height: 44,
    paddingHorizontal: 0,
  },
  syncButtonText: {
    fontSize: 18,
    lineHeight: 20,
  },
});
