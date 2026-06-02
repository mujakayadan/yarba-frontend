import { useQuery } from '@tanstack/react-query';
import { getResumes } from '../services/resumeService';

export const resumeKeys = {
  all: ['resumes'] as const,
  list: () => [...resumeKeys.all, 'list'] as const,
};

export const useResumes = () =>
  useQuery({
    queryKey: resumeKeys.list(),
    queryFn: () => getResumes(),
  });
