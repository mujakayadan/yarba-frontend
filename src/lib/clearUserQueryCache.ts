import { queryClient } from '../providers/QueryProvider';
import {
  accountKeys,
  coverLetterKeys,
  legalKeys,
  portfolioKeys,
  profileKeys,
  resumeKeys,
  websiteKeys,
} from './queryKeys';

/** Drop cached server state when the authenticated user changes or signs out. */
export const clearAuthenticatedUserCache = (): void => {
  queryClient.removeQueries({ queryKey: profileKeys.all });
  queryClient.removeQueries({ queryKey: portfolioKeys.all });
  queryClient.removeQueries({ queryKey: resumeKeys.all });
  queryClient.removeQueries({ queryKey: coverLetterKeys.all });
  queryClient.removeQueries({ queryKey: websiteKeys.all });
  queryClient.removeQueries({ queryKey: legalKeys.all });
  queryClient.removeQueries({ queryKey: accountKeys.all });
};
