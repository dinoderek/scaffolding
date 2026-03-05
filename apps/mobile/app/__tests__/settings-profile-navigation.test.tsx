/* eslint-disable import/first */

const mockPush = jest.fn();
const mockUseAuth = jest.fn();
const mockLoadUserProfile = jest.fn();
const mockSaveUsername = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/src/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/src/auth/profile', () => ({
  loadUserProfile: (...args: unknown[]) => mockLoadUserProfile(...args),
  saveUsername: (...args: unknown[]) => mockSaveUsername(...args),
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import ProfileRoute from '../profile';
import SettingsRoute from '../settings';

type MockUseAuthValue = {
  clearAuthError: jest.Mock;
  disabledReason: string | null;
  isConfigured: boolean;
  lastError: string | null;
  session: null;
  signInWithPassword: jest.Mock;
  signOut: jest.Mock;
  status: 'idle' | 'restoring' | 'ready';
  updateUserEmail: jest.Mock;
  updateUserPassword: jest.Mock;
  user: { email?: string | null; id: string } | null;
};

const createAuthValue = (overrides: Partial<MockUseAuthValue> = {}): MockUseAuthValue => ({
  clearAuthError: jest.fn(),
  disabledReason: null,
  isConfigured: true,
  lastError: null,
  session: null,
  signInWithPassword: jest.fn().mockResolvedValue({}),
  signOut: jest.fn().mockResolvedValue(undefined),
  status: 'ready',
  updateUserEmail: jest.fn().mockResolvedValue({
    emailChangePending: false,
    user: {
      id: 'user-1',
      email: 'member@example.test',
    },
  }),
  updateUserPassword: jest.fn().mockResolvedValue({
    user: {
      id: 'user-1',
      email: 'member@example.test',
    },
  }),
  user: null,
  ...overrides,
});

const createProfileRecord = (overrides: Partial<{ createdAt: string; id: string; updatedAt: string; username: string | null }> = {}) => ({
  createdAt: '2026-03-04T12:00:00.000Z',
  id: 'user-1',
  updatedAt: '2026-03-04T12:05:00.000Z',
  username: 'member-lifter',
  ...overrides,
});

describe('settings and profile routes', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseAuth.mockReset();
    mockLoadUserProfile.mockReset();
    mockSaveUsername.mockReset();
  });

  it('opens the profile route from settings', () => {
    render(<SettingsRoute />);

    fireEvent.press(screen.getByTestId('settings-profile-row'));

    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('renders logged-out profile state and submits email/password sign in', async () => {
    const authValue = createAuthValue();
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    fireEvent.changeText(screen.getByTestId('profile-email-input'), ' user@example.test ');
    fireEvent.changeText(screen.getByTestId('profile-password-input'), 'secret-pass');
    fireEvent.press(screen.getByTestId('profile-sign-in-button'));

    await waitFor(() => {
      expect(authValue.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.test',
        password: 'secret-pass',
      });
    });
    expect(screen.getByTestId('profile-signed-out-card')).toBeTruthy();
  });

  it('blocks sign in when the email address is not valid', () => {
    const authValue = createAuthValue();
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    fireEvent.changeText(screen.getByTestId('profile-email-input'), 'not-an-email');
    fireEvent.changeText(screen.getByTestId('profile-password-input'), 'secret-pass');
    fireEvent.press(screen.getByTestId('profile-sign-in-button'));

    expect(authValue.signInWithPassword).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  });

  it('surfaces inline auth failure feedback near the sign-in form and clears stale errors on input', () => {
    const authValue = createAuthValue({
      lastError: 'Invalid login credentials',
    });
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    expect(screen.getByTestId('profile-inline-error')).toBeTruthy();
    expect(screen.getByText('Invalid login credentials')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('profile-email-input'), 'next@example.test');

    expect(authValue.clearAuthError).toHaveBeenCalledTimes(1);
  });

  it('shows submit-time sign-in failures inline without leaving the logged-out state', async () => {
    const authValue = createAuthValue({
      signInWithPassword: jest.fn().mockRejectedValue(new Error('Invalid login credentials')),
    });
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    fireEvent.changeText(screen.getByTestId('profile-email-input'), 'user@example.test');
    fireEvent.changeText(screen.getByTestId('profile-password-input'), 'WrongPassword!999');
    fireEvent.press(screen.getByTestId('profile-sign-in-button'));

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeTruthy();
    });
    expect(screen.getByTestId('profile-signed-out-card')).toBeTruthy();
  });

  it('renders logged-in profile state with account email and sign-out action', async () => {
    const authValue = createAuthValue({
      user: {
        id: 'user-1',
        email: 'member@example.test',
      },
    });
    mockLoadUserProfile.mockResolvedValue({
      profile: createProfileRecord(),
      wasProvisioned: false,
    });
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    await waitFor(() => {
      expect(mockLoadUserProfile).toHaveBeenCalledWith('user-1');
    });
    expect(screen.getByTestId('profile-signed-in-card')).toBeTruthy();
    expect(screen.getByText('member@example.test')).toBeTruthy();
    expect(screen.getByDisplayValue('member-lifter')).toBeTruthy();
    expect(screen.getByTestId('profile-username-save-button')).toBeTruthy();
    expect(screen.getByTestId('profile-email-update-button')).toBeTruthy();
    expect(screen.getByTestId('profile-password-update-button')).toBeTruthy();

    fireEvent.press(screen.getByTestId('profile-sign-out-button'));

    await waitFor(() => {
      expect(authValue.signOut).toHaveBeenCalledTimes(1);
    });
  });

  it('saves username changes with inline success feedback', async () => {
    const authValue = createAuthValue({
      user: {
        id: 'user-1',
        email: 'member@example.test',
      },
    });
    mockLoadUserProfile.mockResolvedValue({
      profile: createProfileRecord({
        username: 'old-name',
      }),
      wasProvisioned: false,
    });
    mockSaveUsername.mockResolvedValue(
      createProfileRecord({
        updatedAt: '2026-03-04T12:10:00.000Z',
        username: 'new-name',
      })
    );
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('old-name')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('profile-username-input'), ' new-name ');
    fireEvent.press(screen.getByTestId('profile-username-save-button'));

    await waitFor(() => {
      expect(mockSaveUsername).toHaveBeenCalledWith('user-1', ' new-name ');
    });
    expect(screen.getByText('Username saved.')).toBeTruthy();
  });

  it('shows inline username save failures while keeping the signed-in shell active', async () => {
    const authValue = createAuthValue({
      user: {
        id: 'user-1',
        email: 'member@example.test',
      },
    });
    mockLoadUserProfile.mockResolvedValue({
      profile: createProfileRecord({
        username: 'old-name',
      }),
      wasProvisioned: false,
    });
    mockSaveUsername.mockRejectedValue(new Error('Unable to save username right now.'));
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('old-name')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('profile-username-input'), 'new-name');
    fireEvent.press(screen.getByTestId('profile-username-save-button'));

    await waitFor(() => {
      expect(screen.getByText('Unable to save username right now.')).toBeTruthy();
    });
    expect(screen.getByTestId('profile-signed-in-card')).toBeTruthy();
  });

  it('shows inline profile load failures without dropping the signed-in account shell', async () => {
    const authValue = createAuthValue({
      user: {
        id: 'user-1',
        email: 'member@example.test',
      },
    });
    mockLoadUserProfile.mockRejectedValue(new Error('Unable to load profile right now.'));
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load profile right now.')).toBeTruthy();
    });
    expect(screen.getByTestId('profile-signed-in-card')).toBeTruthy();
    expect(screen.getByText('member@example.test')).toBeTruthy();
  });

  it('submits authenticated email updates and distinguishes pending confirmation messaging', async () => {
    const authValue = createAuthValue({
      updateUserEmail: jest.fn().mockResolvedValue({
        emailChangePending: true,
        user: {
          id: 'user-1',
          email: 'member@example.test',
          new_email: 'next@example.test',
        },
      }),
      user: {
        id: 'user-1',
        email: 'member@example.test',
      },
    });
    mockLoadUserProfile.mockResolvedValue({
      profile: createProfileRecord(),
      wasProvisioned: false,
    });
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-email-update-input')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('profile-email-update-input'), ' next@example.test ');
    fireEvent.press(screen.getByTestId('profile-email-update-button'));

    await waitFor(() => {
      expect(authValue.updateUserEmail).toHaveBeenCalledWith({
        email: 'next@example.test',
      });
    });
    expect(screen.getByText('Email change submitted. Confirm the change from your email inbox before it fully takes effect.')).toBeTruthy();
  });

  it('blocks email updates when the new email is invalid', async () => {
    const authValue = createAuthValue({
      user: {
        id: 'user-1',
        email: 'member@example.test',
      },
    });
    mockLoadUserProfile.mockResolvedValue({
      profile: createProfileRecord(),
      wasProvisioned: false,
    });
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-email-update-input')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('profile-email-update-input'), 'not-an-email');
    fireEvent.press(screen.getByTestId('profile-email-update-button'));

    expect(authValue.updateUserEmail).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  });

  it('submits password updates, clears the field, and shows success feedback', async () => {
    const authValue = createAuthValue({
      user: {
        id: 'user-1',
        email: 'member@example.test',
      },
    });
    mockLoadUserProfile.mockResolvedValue({
      profile: createProfileRecord(),
      wasProvisioned: false,
    });
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-password-update-input')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('profile-password-update-input'), 'StrongPassword!234');
    fireEvent.press(screen.getByTestId('profile-password-update-button'));

    await waitFor(() => {
      expect(authValue.updateUserPassword).toHaveBeenCalledWith({
        password: 'StrongPassword!234',
      });
    });
    expect(screen.getByText('Password updated.')).toBeTruthy();
    expect(screen.getByTestId('profile-password-update-input').props.value).toBe('');
  });

  it('shows inline password update failures and still clears the input field after submit', async () => {
    const authValue = createAuthValue({
      updateUserPassword: jest.fn().mockRejectedValue(new Error('Unable to update password right now.')),
      user: {
        id: 'user-1',
        email: 'member@example.test',
      },
    });
    mockLoadUserProfile.mockResolvedValue({
      profile: createProfileRecord(),
      wasProvisioned: false,
    });
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-password-update-input')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('profile-password-update-input'), 'StrongPassword!234');
    fireEvent.press(screen.getByTestId('profile-password-update-button'));

    await waitFor(() => {
      expect(screen.getByText('Unable to update password right now.')).toBeTruthy();
    });
    expect(screen.getByTestId('profile-password-update-input').props.value).toBe('');
  });
});
