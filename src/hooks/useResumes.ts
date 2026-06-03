import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { resumeKeys, type ResumeListParams } from '../lib/queryKeys';
import { getResumes, getResumesForSelection } from '../services/resumeService';

export const useResumes = (params: ResumeListParams = {}) => {
  const { user } = useAuth();
  const { skip = 0, limit = 10, search_term, template_id, sort_by = 'updated_desc' } = params;

  return useQuery({
    queryKey: resumeKeys.list(params),
    queryFn: () => getResumes(skip, limit, search_term, template_id, sort_by),
    enabled: !!user,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

export const useResumesForSelection = (sortBy: string = 'updated_desc') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: resumeKeys.selection(sortBy),
    queryFn: () => getResumesForSelection(sortBy),
    enabled: !!user,
    staleTime: 60 * 1000,
  });
};
