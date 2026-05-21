import { cleanup } from '@testing-library/react-native';

afterEach(() => {
  cleanup();
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const passthrough = ({ children }: { children?: unknown }) => children;
  const viewWrap = ({ children, ...props }: { children?: unknown }) =>
    React.createElement(View, props, children);
  return {
    SafeAreaProvider: passthrough,
    SafeAreaConsumer: ({ children }: { children: (insets: object) => unknown }) =>
      children({ top: 0, right: 0, bottom: 0, left: 0 }),
    SafeAreaView: viewWrap,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    },
  };
});
