import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { UiButton, UiSurface, UiText, uiBorder, uiColors, uiRadius, uiSpace, uiTypography } from '@/components/ui';
import { useAuth } from '@/src/auth';
import { loadUserProfile, saveUsername, type UserProfileRecord } from '@/src/auth/profile';

const EMPTY_FORM_ERROR = 'Enter your email and password to continue.';
const INVALID_EMAIL_ERROR = 'Enter a valid email address.';
const EMPTY_PASSWORD_UPDATE_ERROR = 'Enter a new password before saving.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_PENDING_MESSAGE =
  'Email change submitted. Confirm the change from your email inbox before it fully takes effect.';
const EMAIL_SUCCESS_MESSAGE = 'Email updated.';
const PASSWORD_SUCCESS_MESSAGE = 'Password updated.';
const USERNAME_SUCCESS_MESSAGE = 'Username saved.';

type InlineFeedback = {
  message: string;
  tone: 'error' | 'success';
};

export default function ProfileScreen() {
  const {
    clearAuthError,
    disabledReason,
    isConfigured,
    lastError,
    signInWithPassword,
    signOut,
    status,
    updateUserEmail,
    updateUserPassword,
    user,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [usernameFeedback, setUsernameFeedback] = useState<InlineFeedback | null>(null);
  const [emailUpdateFeedback, setEmailUpdateFeedback] = useState<InlineFeedback | null>(null);
  const [passwordUpdateFeedback, setPasswordUpdateFeedback] = useState<InlineFeedback | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const inlineError = signOutError ?? formError ?? lastError ?? null;
  const authDisabledMessage = !isConfigured ? disabledReason ?? 'Supabase mobile auth is not configured.' : null;
  const isAuthRestoring = status === 'restoring';
  const isBusy = isSubmitting || isSigningOut || isAuthRestoring;
  const currentUserId = user?.id ?? null;
  const currentUserEmail = user?.email?.trim() ?? '';
  const userEmail = user?.email?.trim() || 'Email unavailable';
  const pendingEmail = user?.new_email?.trim() || null;
  const usernameHasChanges = username.trim() !== (profile?.username ?? '');
  const emailChanged = newEmail.trim().toLowerCase() !== currentUserEmail.toLowerCase();

  useEffect(() => {
    if (!currentUserId) {
      setProfile(null);
      setProfileError(null);
      setUsername('');
      setUsernameFeedback(null);
      setEmailUpdateFeedback(null);
      setPasswordUpdateFeedback(null);
      setNewEmail('');
      setNewPassword('');
      return;
    }

    setPassword('');
    setFormError(null);
    setSignOutError(null);
    setProfileError(null);
    setUsernameFeedback(null);
    setEmailUpdateFeedback(null);
    setPasswordUpdateFeedback(null);
    setNewEmail(currentUserEmail);
    setNewPassword('');
  }, [currentUserEmail, currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    let isActive = true;

    setIsLoadingProfile(true);
    setProfileError(null);

    void loadUserProfile(currentUserId)
      .then(({ profile: loadedProfile }) => {
        if (!isActive) {
          return;
        }

        setProfile(loadedProfile);
        setUsername(loadedProfile.username ?? '');
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        setProfile(null);
        setProfileError(error instanceof Error ? error.message : 'Unable to load profile right now.');
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingProfile(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentUserId]);

  const resetInlineErrors = () => {
    setFormError(null);
    setSignOutError(null);
    clearAuthError();
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    resetInlineErrors();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    resetInlineErrors();
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameFeedback(null);
    setProfileError(null);
  };

  const handleEmailUpdateChange = (value: string) => {
    setNewEmail(value);
    setEmailUpdateFeedback(null);
  };

  const handlePasswordUpdateChange = (value: string) => {
    setNewPassword(value);
    setPasswordUpdateFeedback(null);
  };

  const handleSignIn = async () => {
    if (isBusy) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setFormError(EMPTY_FORM_ERROR);
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFormError(INVALID_EMAIL_ERROR);
      return;
    }

    resetInlineErrors();
    setIsSubmitting(true);

    try {
      await signInWithPassword({
        email: trimmedEmail,
        password,
      });
      setEmail(trimmedEmail);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (isBusy) {
      return;
    }

    resetInlineErrors();
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out right now.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!user || isSavingUsername) {
      return;
    }

    setProfileError(null);
    setUsernameFeedback(null);
    setIsSavingUsername(true);

    try {
      const updatedProfile = await saveUsername(user.id, username);
      setProfile(updatedProfile);
      setUsername(updatedProfile.username ?? '');
      setUsernameFeedback({
        message: USERNAME_SUCCESS_MESSAGE,
        tone: 'success',
      });
    } catch (error) {
      setUsernameFeedback({
        message: error instanceof Error ? error.message : 'Unable to save username right now.',
        tone: 'error',
      });
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user || isUpdatingEmail) {
      return;
    }

    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail) {
      setEmailUpdateFeedback({
        message: EMPTY_FORM_ERROR,
        tone: 'error',
      });
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailUpdateFeedback({
        message: INVALID_EMAIL_ERROR,
        tone: 'error',
      });
      return;
    }

    setEmailUpdateFeedback(null);
    setIsUpdatingEmail(true);

    try {
      const result = await updateUserEmail({
        email: trimmedEmail,
      });

      setNewEmail(trimmedEmail);
      setEmailUpdateFeedback({
        message: result.emailChangePending ? EMAIL_PENDING_MESSAGE : EMAIL_SUCCESS_MESSAGE,
        tone: 'success',
      });
    } catch (error) {
      setEmailUpdateFeedback({
        message: error instanceof Error ? error.message : 'Unable to update email right now.',
        tone: 'error',
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (isUpdatingPassword) {
      return;
    }

    if (!newPassword) {
      setPasswordUpdateFeedback({
        message: EMPTY_PASSWORD_UPDATE_ERROR,
        tone: 'error',
      });
      return;
    }

    setPasswordUpdateFeedback(null);
    setIsUpdatingPassword(true);

    try {
      await updateUserPassword({
        password: newPassword,
      });
      setPasswordUpdateFeedback({
        message: PASSWORD_SUCCESS_MESSAGE,
        tone: 'success',
      });
    } catch (error) {
      setPasswordUpdateFeedback({
        message: error instanceof Error ? error.message : 'Unable to update password right now.',
        tone: 'error',
      });
    } finally {
      setNewPassword('');
      setIsUpdatingPassword(false);
    }
  };

  const renderFeedbackCard = (feedback: InlineFeedback | null, testID: string) => {
    if (!feedback) {
      return null;
    }

    const isError = feedback.tone === 'error';

    return (
      <UiSurface style={[styles.feedbackCard, isError ? styles.errorCard : styles.successCard]} testID={testID}>
        <UiText selectable style={isError ? styles.errorText : styles.successText} variant="body">
          {feedback.message}
        </UiText>
      </UiSurface>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
      testID="profile-screen">
      {status === 'restoring' ? (
        <UiSurface style={styles.infoCard} testID="profile-restoring-state">
          <UiText selectable variant="label">
            Restoring account session...
          </UiText>
          <UiText selectable variant="bodyMuted">
            The profile route will switch to the correct signed-in state as soon as auth bootstrap completes.
          </UiText>
        </UiSurface>
      ) : null}

      {authDisabledMessage ? (
        <UiSurface style={styles.warningCard} testID="profile-auth-disabled-card" variant="panelMuted">
          <UiText selectable variant="label">
            Auth setup required
          </UiText>
          <UiText selectable style={styles.warningText} variant="body">
            {authDisabledMessage}
          </UiText>
        </UiSurface>
      ) : null}

      {!user ? (
        <UiSurface style={styles.card} testID="profile-signed-out-card">
          <View style={styles.sectionHeader}>
            <UiText selectable variant="labelStrong">
              Sign in
            </UiText>
            <UiText selectable variant="bodyMuted">
              Use your provisioned email and password to unlock account management without affecting local-only tracker flows.
            </UiText>
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.fieldBlock}>
              <UiText selectable variant="subtitle">
                Email
              </UiText>
              <TextInput
                accessibilityLabel="Email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={handleEmailChange}
                placeholder="you@example.com"
                placeholderTextColor={uiColors.textDisabled}
                style={styles.input}
                testID="profile-email-input"
                textContentType="emailAddress"
                value={email}
              />
            </View>

            <View style={styles.fieldBlock}>
              <UiText selectable variant="subtitle">
                Password
              </UiText>
              <TextInput
                accessibilityLabel="Password"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={handlePasswordChange}
                placeholder="Enter password"
                placeholderTextColor={uiColors.textDisabled}
                secureTextEntry
                style={styles.input}
                testID="profile-password-input"
                textContentType="password"
                value={password}
              />
            </View>
          </View>

          {inlineError ? (
            <UiSurface style={[styles.feedbackCard, styles.errorCard]} testID="profile-inline-error">
              <UiText selectable style={styles.errorText} variant="body">
                {inlineError}
              </UiText>
            </UiSurface>
          ) : null}

          <UiButton
            accessibilityLabel="Sign in to profile"
            disabled={!isConfigured || isBusy}
            label={isSubmitting ? 'Signing In...' : 'Sign In'}
            onPress={() => {
              void handleSignIn();
            }}
            testID="profile-sign-in-button"
          />
        </UiSurface>
      ) : (
        <View style={styles.signedInStack}>
          <UiSurface style={styles.card} testID="profile-signed-in-card">
            <View style={styles.sectionHeader}>
              <UiText selectable variant="labelStrong">
                Account summary
              </UiText>
              <UiText selectable variant="bodyMuted">
                Manage your app username plus authenticated email/password updates without affecting local-only tracker flows.
              </UiText>
            </View>

            <View style={styles.readOnlyRow}>
              <UiText selectable variant="subtitle">
                Signed-in email
              </UiText>
              <UiText selectable style={styles.readOnlyValue} variant="label">
                {userEmail}
              </UiText>
            </View>

            {pendingEmail ? (
              <View style={styles.readOnlyRow}>
                <UiText selectable variant="subtitle">
                  Pending email change
                </UiText>
                <UiText selectable style={styles.readOnlyValue} variant="label">
                  {pendingEmail}
                </UiText>
              </View>
            ) : null}
          </UiSurface>

          <UiSurface style={styles.card} variant="panelMuted">
            <View style={styles.sectionHeader}>
              <UiText selectable variant="labelStrong">
                Username
              </UiText>
              <UiText selectable variant="bodyMuted">
                Your app profile row is provisioned lazily the first time this screen loads or saves.
              </UiText>
            </View>

            <View style={styles.fieldBlock}>
              <UiText selectable variant="subtitle">
                Username
              </UiText>
              <TextInput
                accessibilityLabel="Username"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={handleUsernameChange}
                placeholder="Add a username"
                placeholderTextColor={uiColors.textDisabled}
                style={styles.input}
                testID="profile-username-input"
                value={username}
              />
            </View>

            {isLoadingProfile ? (
              <UiText selectable variant="bodyMuted">
                Loading profile...
              </UiText>
            ) : null}

            {profileError ? (
              <UiSurface style={[styles.feedbackCard, styles.errorCard]} testID="profile-load-error">
                <UiText selectable style={styles.errorText} variant="body">
                  {profileError}
                </UiText>
              </UiSurface>
            ) : null}

            {renderFeedbackCard(usernameFeedback, 'profile-username-feedback')}

            <UiButton
              accessibilityLabel="Save username"
              disabled={isSavingUsername || isLoadingProfile || !usernameHasChanges}
              label={isSavingUsername ? 'Saving Username...' : 'Save Username'}
              onPress={() => {
                void handleSaveUsername();
              }}
              testID="profile-username-save-button"
            />
          </UiSurface>

          <UiSurface style={styles.card} variant="panelMuted">
            <View style={styles.sectionHeader}>
              <UiText selectable variant="labelStrong">
                Email
              </UiText>
              <UiText selectable variant="bodyMuted">
                Email updates run through Supabase Auth and may require inbox confirmation before the address fully changes.
              </UiText>
            </View>

            <View style={styles.fieldBlock}>
              <UiText selectable variant="subtitle">
                New email
              </UiText>
              <TextInput
                accessibilityLabel="New email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={handleEmailUpdateChange}
                placeholder="you@example.com"
                placeholderTextColor={uiColors.textDisabled}
                style={styles.input}
                testID="profile-email-update-input"
                textContentType="emailAddress"
                value={newEmail}
              />
            </View>

            {renderFeedbackCard(emailUpdateFeedback, 'profile-email-feedback')}

            <UiButton
              accessibilityLabel="Update email"
              disabled={isUpdatingEmail || !emailChanged}
              label={isUpdatingEmail ? 'Updating Email...' : 'Update Email'}
              onPress={() => {
                void handleUpdateEmail();
              }}
              testID="profile-email-update-button"
            />
          </UiSurface>

          <UiSurface style={styles.card} variant="panelMuted">
            <View style={styles.sectionHeader}>
              <UiText selectable variant="labelStrong">
                Password
              </UiText>
              <UiText selectable variant="bodyMuted">
                Passwords are handled only for the immediate authenticated update flow and are cleared after submit.
              </UiText>
            </View>

            <View style={styles.fieldBlock}>
              <UiText selectable variant="subtitle">
                New password
              </UiText>
              <TextInput
                accessibilityLabel="New password"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={handlePasswordUpdateChange}
                placeholder="Enter a new password"
                placeholderTextColor={uiColors.textDisabled}
                secureTextEntry
                style={styles.input}
                testID="profile-password-update-input"
                textContentType="newPassword"
                value={newPassword}
              />
            </View>

            {renderFeedbackCard(passwordUpdateFeedback, 'profile-password-feedback')}

            <UiButton
              accessibilityLabel="Update password"
              disabled={isUpdatingPassword}
              label={isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
              onPress={() => {
                void handleUpdatePassword();
              }}
              testID="profile-password-update-button"
            />
          </UiSurface>

          {inlineError ? (
            <UiSurface style={[styles.feedbackCard, styles.errorCard]} testID="profile-inline-error">
              <UiText selectable style={styles.errorText} variant="body">
                {inlineError}
              </UiText>
            </UiSurface>
          ) : null}

          <UiButton
            accessibilityLabel="Sign out of profile"
            disabled={isBusy}
            label={isSigningOut ? 'Signing Out...' : 'Sign Out'}
            onPress={() => {
              void handleSignOut();
            }}
            testID="profile-sign-out-button"
            variant="secondary"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.surfacePage,
  },
  content: {
    padding: uiSpace.screen,
    gap: uiSpace.xxl,
  },
  card: {
    padding: uiSpace.xxl,
    gap: uiSpace.xxl,
  },
  signedInStack: {
    gap: uiSpace.xxl,
  },
  infoCard: {
    padding: uiSpace.xxl,
    gap: uiSpace.sm,
    backgroundColor: uiColors.surfaceInfo,
    borderColor: uiColors.actionPrimarySubtleBorder,
  },
  warningCard: {
    padding: uiSpace.xxl,
    gap: uiSpace.sm,
    borderColor: uiColors.borderWarning,
    backgroundColor: uiColors.surfaceWarning,
  },
  warningText: {
    color: uiColors.textWarning,
  },
  sectionHeader: {
    gap: uiSpace.sm,
  },
  fieldGroup: {
    gap: uiSpace.xl,
  },
  fieldBlock: {
    gap: uiSpace.sm,
  },
  input: {
    borderWidth: uiBorder.width,
    borderColor: uiColors.borderInputStrong,
    borderRadius: uiRadius.md,
    backgroundColor: uiColors.surfaceDefault,
    color: uiColors.textPrimary,
    minHeight: 48,
    paddingHorizontal: uiSpace.xxl,
    paddingVertical: uiSpace.lg,
    fontSize: uiTypography.size.base,
  },
  feedbackCard: {
    paddingHorizontal: uiSpace.xxl,
    paddingVertical: uiSpace.xl,
  },
  errorCard: {
    borderColor: uiColors.actionDangerSubtleBorder,
    backgroundColor: uiColors.actionDangerSubtleBg,
  },
  successCard: {
    borderColor: uiColors.borderSuccess,
    backgroundColor: uiColors.surfaceSuccess,
  },
  errorText: {
    color: uiColors.actionDangerText,
  },
  successText: {
    color: uiColors.textSuccess,
  },
  readOnlyRow: {
    gap: uiSpace.sm,
    borderWidth: uiBorder.width,
    borderColor: uiColors.borderMuted,
    borderRadius: uiRadius.md,
    backgroundColor: uiColors.surfaceReadOnly,
    paddingHorizontal: uiSpace.xxl,
    paddingVertical: uiSpace.xl,
  },
  readOnlyValue: {
    color: uiColors.textAccentStrong,
  },
});
