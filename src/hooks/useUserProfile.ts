import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { profileKeys } from '../lib/queryKeys';
import { getUserProfile } from '../services/profileService';

const PROFILE_STALE_TIME = 5 * 60 * 1000;

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: getUserProfile,
    enabled: !!user,
    staleTime: PROFILE_STALE_TIME,
  });
};
