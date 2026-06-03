import { useQuery } from '@tanstack/react-query';
import { templateKeys } from '../lib/queryKeys';
import {
  getCoverLetterTemplates,
  getPreambles,
  getResumeTemplates,
} from '../services/templateService';

export const useCoverLetterTemplates = () =>
  useQuery({
    queryKey: templateKeys.coverLetters(),
    queryFn: getCoverLetterTemplates,
    staleTime: 10 * 60 * 1000,
  });

export const useResumeTemplates = () =>
  useQuery({
    queryKey: templateKeys.resumes(),
    queryFn: getResumeTemplates,
    staleTime: 10 * 60 * 1000,
  });

export const usePreambles = () =>
  useQuery({
    queryKey: templateKeys.preambles(),
    queryFn: getPreambles,
    staleTime: 10 * 60 * 1000,
  });
