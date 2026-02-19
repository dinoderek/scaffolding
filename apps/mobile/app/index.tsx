import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text selectable>Milestone 0 foundation ready</Text>
      <Link asChild href="/session-recorder">
        <Pressable accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>Open Session Recorder</Text>
        </Pressable>
      </Link>
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
});
