import { getRequiredSupabaseMobileClient } from './supabase';

export type UserProfileRecord = {
  createdAt: string;
  id: string;
  updatedAt: string;
  username: string | null;
};

export type LoadUserProfileResult = {
  profile: UserProfileRecord;
  wasProvisioned: boolean;
};

type UserProfileRow = {
  created_at: string;
  id: string;
  updated_at: string;
  username: string | null;
};

const USER_PROFILE_COLUMNS = 'id, username, created_at, updated_at';

const createUserProfilesTable = () => getRequiredSupabaseMobileClient().schema('app_public').from('user_profiles');

const mapUserProfileRow = (row: UserProfileRow): UserProfileRecord => ({
  createdAt: row.created_at,
  id: row.id,
  updatedAt: row.updated_at,
  username: row.username,
});

const normalizeUsername = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const selectUserProfile = async (userId: string) => {
  const { data, error } = await createUserProfilesTable()
    .select(USER_PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle<UserProfileRow>();

  if (error) {
    throw new Error(error.message || 'Unable to load profile right now.');
  }

  return data ? mapUserProfileRow(data) : null;
};

const provisionUserProfile = async (userId: string) => {
  const { data, error } = await createUserProfilesTable()
    .insert({
      id: userId,
    })
    .select(USER_PROFILE_COLUMNS)
    .single<UserProfileRow>();

  if (error) {
    if (error.code === '23505') {
      const existingProfile = await selectUserProfile(userId);

      if (existingProfile) {
        return existingProfile;
      }
    }

    throw new Error(error.message || 'Unable to create profile right now.');
  }

  return mapUserProfileRow(data);
};

const ensureUserProfile = async (userId: string): Promise<LoadUserProfileResult> => {
  const existingProfile = await selectUserProfile(userId);

  if (existingProfile) {
    return {
      profile: existingProfile,
      wasProvisioned: false,
    };
  }

  return {
    profile: await provisionUserProfile(userId),
    wasProvisioned: true,
  };
};

export const loadUserProfile = async (userId: string): Promise<LoadUserProfileResult> => ensureUserProfile(userId);

export const saveUsername = async (userId: string, username: string): Promise<UserProfileRecord> => {
  await ensureUserProfile(userId);

  const { data, error } = await createUserProfilesTable()
    .update({
      username: normalizeUsername(username),
    })
    .eq('id', userId)
    .select(USER_PROFILE_COLUMNS)
    .single<UserProfileRow>();

  if (error) {
    throw new Error(error.message || 'Unable to save username right now.');
  }

  return mapUserProfileRow(data);
};
