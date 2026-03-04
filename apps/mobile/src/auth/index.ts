export { AuthProvider, useAuth, type AuthContextValue } from './provider';
export { getAuthStorageAdapter, type AuthStorageAdapter } from './storage';
export { getMobileAuthRuntimeConfig, getRequiredSupabaseMobileClient, getSupabaseMobileClient } from './supabase';
export {
  loadUserProfile,
  saveUsername,
  type LoadUserProfileResult,
  type UserProfileRecord,
} from './profile';
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
  type UpdateUserEmailInput,
  type UpdateUserEmailResult,
  type UpdateUserPasswordInput,
  type UpdateUserPasswordResult,
  updateUserEmail,
  updateUserPassword,
} from './service';
