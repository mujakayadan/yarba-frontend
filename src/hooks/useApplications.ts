import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { applicationKeys, type ApplicationListParams } from '../lib/queryKeys';
import { listApplications } from '../services/applicationService';

export const useApplications = (params: ApplicationListParams = {}) => {
  const { user } = useAuth();
  const { skip = 0, limit = 20, status } = params;

  return useQuery({
    queryKey: applicationKeys.list(params),
    queryFn: () => listApplications({ skip, limit, status }),
    enabled: !!user,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};
