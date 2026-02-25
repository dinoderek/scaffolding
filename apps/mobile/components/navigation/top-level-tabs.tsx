import { Pressable, StyleSheet, Text, View } from 'react-native';

export type TopLevelTabKey = 'sessions' | 'exercises';

type TopLevelTabsProps = {
  activeTab: TopLevelTabKey;
  onPressSessions: () => void;
  onPressExercises: () => void;
};

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Open ${label}`}
      onPress={onPress}
      style={[styles.tabButton, active ? styles.tabButtonActive : null]}>
      <Text selectable={false} style={[styles.tabButtonText, active ? styles.tabButtonTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TopLevelTabs({ activeTab, onPressSessions, onPressExercises }: TopLevelTabsProps) {
  return (
    <View accessibilityRole="tablist" style={styles.shell} testID="top-level-bottom-tabs">
      <TabButton label="Sessions" active={activeTab === 'sessions'} onPress={onPressSessions} />
      <TabButton label="Exercises" active={activeTab === 'exercises'} onPress={onPressExercises} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cfd8e6',
    backgroundColor: '#ffffff',
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#f4f7fb',
  },
  tabButtonActive: {
    borderColor: '#0f5cc0',
    backgroundColor: '#eaf2ff',
  },
  tabButtonText: {
    color: '#22344f',
    fontWeight: '600',
    fontSize: 13,
  },
  tabButtonTextActive: {
    color: '#0f5cc0',
    fontWeight: '700',
  },
});
