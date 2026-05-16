// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const NO_DEV_GLOBAL_MESSAGE =
  'Do not use `__DEV__` directly. Use `isDevMode()` from `@/src/utils/isDevMode` instead — it also returns true in the `com.phano.boga3.dev` build (TestFlight dev), where `__DEV__` is false.';

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    settings: {
      'import/core-modules': [
        '@supabase/supabase-js',
        'expo-application',
        'expo-secure-store',
        'react-native-url-polyfill/auto',
      ],
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Identifier[name='__DEV__']",
          message: NO_DEV_GLOBAL_MESSAGE,
        },
      ],
    },
  },
  {
    // The utility itself is the one place where `__DEV__` is legitimate.
    files: ['src/utils/isDevMode.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
]);
