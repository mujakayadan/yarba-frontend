import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { profileKeys } from '../lib/queryKeys';
import { queryClient } from '../providers/QueryProvider';
import { getUserProfile } from '../services/profileService';
import { Profile } from '../types/models';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<Profile | null>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: false,
  error: null,
  refreshProfile: async () => null,
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { data, isLoading, error, isFetching } = useUserProfile();

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user) {
      return null;
    }
    try {
      return await queryClient.fetchQuery({
        queryKey: profileKeys.me(),
        queryFn: getUserProfile,
      });
    } catch (err: unknown) {
      console.error('Failed to refresh profile:', err);
      return null;
    }
  }, [user]);

  const errorMessage =
    error instanceof Error ? error.message : error ? 'Failed to load profile data' : null;

  return (
    <ProfileContext.Provider
      value={{
        profile: data ?? null,
        loading: isLoading || (!!user && isFetching && !data),
        error: errorMessage,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
