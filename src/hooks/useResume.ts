import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { resumeKeys } from '../lib/queryKeys';
import { getResumeById } from '../services/resumeService';

export const useResume = (id: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: resumeKeys.detail(id ?? ''),
    queryFn: () => getResumeById(id!),
    enabled: !!user && !!id,
    staleTime: 2 * 60 * 1000,
  });
};
