import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { websiteKeys } from '../lib/queryKeys';
import { getPortfolioWebsite } from '../services/websiteService';

export const usePortfolioWebsite = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: websiteKeys.portfolio(),
    queryFn: getPortfolioWebsite,
    enabled: !!user,
    staleTime: 0,
  });
};
