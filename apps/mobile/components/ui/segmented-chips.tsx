import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { uiColors } from '@/components/ui/tokens';

export type SegmentedChipOption<TValue extends string | number> = {
  /** The stable value identifying this option. */
  value: TValue;
  /** User-visible label rendered inside the chip. */
  label: string;
  /**
   * Optional accessibility label override. Defaults to `label`.
   */
  accessibilityLabel?: string;
};

export type SegmentedChipsProps<TValue extends string | number> = {
  /** Options to render, in display order (left-to-right). */
  options: readonly SegmentedChipOption<TValue>[];
  /** Currently selected option value. */
  value: TValue;
  /** Invoked when the user picks a different chip. */
  onChange: (next: TValue) => void;
  /**
   * Stable prefix used to build per-chip `testID`s (`<prefix>-<value>`)
   * and to derive the row's `accessibilityLabel` when none is provided.
   */
  testIDPrefix: string;
  /** Optional override for the surrounding row's `accessibilityLabel`. */
  accessibilityLabel?: string;
  /** Extra style applied to the chip row container. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Pill-shaped segmented chip row.
 *
 * Used by the Stats/History top toggle and by the period selector inside the
 * Stats sub-view. The styling matches the previous inline period chips so the
 * visual treatment stays consistent across both call sites.
 */
export function SegmentedChips<TValue extends string | number>({
  options,
  value,
  onChange,
  testIDPrefix,
  accessibilityLabel,
  style,
}: SegmentedChipsProps<TValue>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.row, style]}
      testID={`${testIDPrefix}-row`}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            onPress={() => {
              if (!selected) {
                onChange(option.value);
              }
            }}
            style={[styles.chip, selected && styles.chipSelected]}
            testID={`${testIDPrefix}-${option.value}`}>
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: uiColors.borderMuted,
    backgroundColor: uiColors.surfaceDefault,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    borderColor: uiColors.actionPrimary,
    backgroundColor: uiColors.actionPrimarySubtleBg,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: uiColors.textSecondary,
  },
  chipTextSelected: {
    color: uiColors.actionPrimary,
  },
});
