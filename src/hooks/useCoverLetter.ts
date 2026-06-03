import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { coverLetterKeys } from '../lib/queryKeys';
import { getCoverLetterById } from '../services/coverLetterService';

export const useCoverLetter = (id: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: coverLetterKeys.detail(id ?? ''),
    queryFn: () => getCoverLetterById(id!),
    enabled: !!user && !!id,
    staleTime: 2 * 60 * 1000,
  });
};
