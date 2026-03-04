import { createContext, type PropsWithChildren, useContext, useSyncExternalStore } from 'react';

import {
  bootstrapAuthState,
  clearAuthError,
  getAuthSnapshot,
  signInWithPassword,
  signOut,
  subscribeToAuthState,
  type AuthSnapshot,
  type SignInWithPasswordCredentials,
  type UpdateUserEmailInput,
  type UpdateUserEmailResult,
  type UpdateUserPasswordInput,
  type UpdateUserPasswordResult,
  updateUserEmail,
  updateUserPassword,
} from './service';

export type AuthContextValue = AuthSnapshot & {
  bootstrapAuthState: () => Promise<AuthSnapshot>;
  clearAuthError: () => void;
  signInWithPassword: (credentials: SignInWithPasswordCredentials) => Promise<unknown>;
  signOut: () => Promise<void>;
  updateUserEmail: (input: UpdateUserEmailInput) => Promise<UpdateUserEmailResult>;
  updateUserPassword: (input: UpdateUserPasswordInput) => Promise<UpdateUserPasswordResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const snapshot = useSyncExternalStore(subscribeToAuthState, getAuthSnapshot, getAuthSnapshot);

  return (
    <AuthContext.Provider
      value={{
        ...snapshot,
        bootstrapAuthState,
        clearAuthError,
        signInWithPassword,
        signOut,
        updateUserEmail,
        updateUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
};
