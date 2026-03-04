import * as SecureStore from 'expo-secure-store';

export type AuthStorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  setItem: (key: string, value: string) => Promise<void>;
};

const secureStoreAuthStorage: AuthStorageAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
};

export const getAuthStorageAdapter = () => secureStoreAuthStorage;
