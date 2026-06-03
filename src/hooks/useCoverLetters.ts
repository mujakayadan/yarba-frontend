import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { coverLetterKeys, type CoverLetterListParams } from '../lib/queryKeys';
import { getCoverLetters } from '../services/coverLetterService';

export const useCoverLetters = (params: CoverLetterListParams = {}) => {
  const { user } = useAuth();
  const { skip = 0, limit = 10, template_id, resume_id, sort_by = 'updated_desc' } = params;

  return useQuery({
    queryKey: coverLetterKeys.list(params),
    queryFn: () => getCoverLetters(template_id, resume_id, skip, limit, sort_by),
    enabled: !!user,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};
