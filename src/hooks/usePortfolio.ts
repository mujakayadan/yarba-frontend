import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { portfolioKeys } from '../lib/queryKeys';
import { queryClient } from '../providers/QueryProvider';
import { getPortfolioById, getUserPortfolio } from '../services/portfolioService';
import { Portfolio } from '../types/models';

const PORTFOLIO_STALE_TIME = 2 * 60 * 1000;

const seedPortfolioDetailCache = (portfolio: Portfolio) => {
  if (portfolio._id) {
    queryClient.setQueryData(portfolioKeys.detail(portfolio._id), portfolio);
  }
};

export const useUserPortfolio = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: portfolioKeys.user(),
    queryFn: async () => {
      const data = await getUserPortfolio();
      seedPortfolioDetailCache(data);
      return data;
    },
    enabled: !!user,
    staleTime: PORTFOLIO_STALE_TIME,
  });
};

export const usePortfolioById = (id: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: portfolioKeys.detail(id ?? ''),
    queryFn: () => getPortfolioById(id!),
    enabled: !!user && !!id,
    staleTime: PORTFOLIO_STALE_TIME,
  });
};
