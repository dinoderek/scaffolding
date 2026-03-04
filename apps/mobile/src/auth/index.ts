export { AuthProvider, useAuth, type AuthContextValue } from './provider';
export { getAuthStorageAdapter, type AuthStorageAdapter } from './storage';
export { getMobileAuthRuntimeConfig, getSupabaseMobileClient } from './supabase';
export {
  __resetAuthForTests,
  bootstrapAuthState,
  clearAuthError,
  getAuthSnapshot,
  signInWithPassword,
  signOut,
  subscribeToAuthState,
  type AuthBootstrapStatus,
  type AuthSnapshot,
  type SignInWithPasswordCredentials,
} from './service';
