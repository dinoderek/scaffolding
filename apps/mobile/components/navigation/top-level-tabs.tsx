import { StyleSheet } from 'react-native';

import { UiButton, UiSurface, uiColors, uiRadius, uiSpace } from '@/components/ui';

export type TopLevelTabKey = 'sessions' | 'exercises';

type TopLevelTabsProps = {
  activeTab: TopLevelTabKey;
  onPressSessions: () => void;
  onPressExercises: () => void;
};

export function TopLevelTabs({ activeTab, onPressSessions, onPressExercises }: TopLevelTabsProps) {
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
    borderColor: uiColors.borderTabShell,
    backgroundColor: uiColors.surfaceDefault,
  },
});
