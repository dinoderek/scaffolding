import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { runLocalDataRuntimeSmoke } from '@/src/data';

type RuntimeSmokeUiState =
  | { phase: 'idle' }
  | { phase: 'running' }
  | { phase: 'success'; latestValue: string; totalRecords: number }
  | { phase: 'error'; message: string };

export default function IndexScreen() {
  const [runtimeSmokeState, setRuntimeSmokeState] = useState<RuntimeSmokeUiState>({ phase: 'idle' });

  const runRuntimeSmoke = async () => {
    setRuntimeSmokeState({ phase: 'running' });

    try {
      const result = await runLocalDataRuntimeSmoke();
      setRuntimeSmokeState({
        phase: 'success',
        latestValue: result.latestValue,
        totalRecords: result.totalRecords,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown runtime smoke failure';
      setRuntimeSmokeState({ phase: 'error', message });
    }
  };

  return (
    <View style={styles.container}>
      <Text selectable testID="home-foundation-ready">
        Milestone 0 foundation ready
      </Text>
      <Link asChild href="/session-recorder">
        <Pressable
          accessibilityLabel="Open session recorder"
          accessibilityRole="button"
          style={styles.button}
          testID="open-session-recorder-button">
          <Text style={styles.buttonText}>Open Session Recorder</Text>
        </Pressable>
      </Link>

      <Pressable
        accessibilityLabel="Run data runtime smoke"
        accessibilityRole="button"
        style={styles.button}
        testID="run-data-runtime-smoke-button"
        onPress={() => {
          void runRuntimeSmoke();
        }}>
        <Text style={styles.buttonText}>Run Data Runtime Smoke</Text>
      </Pressable>

      <View style={styles.runtimeSmokePanel} testID="data-runtime-smoke-panel">
        <Text style={styles.runtimeSmokeLabel} testID="data-runtime-smoke-status">
          Data runtime smoke: {runtimeSmokeState.phase}
        </Text>
        {runtimeSmokeState.phase === 'success' ? (
          <Text style={styles.runtimeSmokeLabel} testID="data-runtime-smoke-last-value">
            Last value: {runtimeSmokeState.latestValue}
          </Text>
        ) : null}
        {runtimeSmokeState.phase === 'success' ? (
          <Text style={styles.runtimeSmokeLabel} testID="data-runtime-smoke-record-count">
            Total records: {runtimeSmokeState.totalRecords}
          </Text>
        ) : null}
        {runtimeSmokeState.phase === 'error' ? (
          <Text style={styles.runtimeSmokeError} testID="data-runtime-smoke-error">
            Error: {runtimeSmokeState.message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0f5cc0',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  runtimeSmokePanel: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d4d4d4',
    padding: 12,
    gap: 4,
    backgroundColor: '#f7f7f7',
  },
  runtimeSmokeLabel: {
    color: '#1e1e1e',
    fontSize: 14,
  },
  runtimeSmokeError: {
    color: '#a31621',
    fontSize: 14,
    fontWeight: '600',
  },
});
