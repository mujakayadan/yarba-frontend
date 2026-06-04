import React, { Suspense, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { ViewPortfolio } from '../../types/portfolioView';
import { getPortfolioViewSortedData } from '../../utils/portfolioViewSorted';
import { useDeferredTabs } from '../../hooks/useDeferredTabs';
import { usePortfolioById, useUserPortfolio } from '../../hooks/usePortfolio';
import { TabPanelFallback, TAB_PANEL_MIN_HEIGHT } from '../../components/common/DeferredTabPanel';
import { PagePrimaryButton } from '../../components/common/PagePrimaryButton';
import { ViewPageHeader } from '../../components/common/ViewPageHeader';
import { PageLoadingState, PageErrorState } from '../../components/common/PageState';
import { PORTFOLIO_VIEW_TABS } from '../../components/portfolio/view/portfolioViewTabs';
import { PortfolioTabBar } from '../../components/portfolio/PortfolioTabBar';
import { parsePortfolioTabIndex, portfolioTabSearchParam } from '../../utils/portfolioTabUrl';

const PortfolioViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = parsePortfolioTabIndex(
    searchParams.get('tab'),
    PORTFOLIO_VIEW_TABS.length - 1
  );
  const { tabValue, renderedTab, isTabPending, handleTabChange } = useDeferredTabs(initialTab);

  const portfolioByIdQuery = usePortfolioById(id);
  const userPortfolioQuery = useUserPortfolio();

  const activeQuery = id ? portfolioByIdQuery : userPortfolioQuery;
  const portfolio = activeQuery.data as ViewPortfolio | undefined;
  const loading = activeQuery.isLoading;
  const error = activeQuery.isError ? 'Failed to load portfolio. Please try again later.' : null;

  const sorted = useMemo(
    () => (portfolio ? getPortfolioViewSortedData(portfolio) : null),
    [portfolio]
  );

  const handleEditClick = () => {
    navigate(`/portfolio/edit${portfolioTabSearchParam(tabValue)}`);
  };

  const handleCreateClick = () => {
    navigate('/portfolio/create');
  };

  const ActiveTab = PORTFOLIO_VIEW_TABS[renderedTab]?.Tab;

  if (loading) {
    return <PageLoadingState />;
  }

  if (error) {
    return <PageErrorState title="Portfolio" message={error} />;
  }

  if (!portfolio) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Portfolio
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            You don't have a portfolio yet. Creating a portfolio is essential for organizing your
            professional information and generating targeted resumes and cover letters.
          </Alert>

          <Box sx={{ textAlign: 'center', py: 2 }}>
            <PagePrimaryButton size="large" startIcon={<AddIcon />} onClick={handleCreateClick}>
              Create New Portfolio
            </PagePrimaryButton>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <ViewPageHeader
        title="Portfolio"
        action={
          <PagePrimaryButton startIcon={<EditIcon />} onClick={handleEditClick}>
            Edit Portfolio
          </PagePrimaryButton>
        }
      />

      <Paper elevation={1} sx={{ mb: 4 }}>
        <PortfolioTabBar
          tabValue={tabValue}
          onChange={handleTabChange}
          tabs={PORTFOLIO_VIEW_TABS}
          idPrefix="portfolio"
          ariaLabel="portfolio tabs"
        />

        <div
          role="tabpanel"
          id={`portfolio-tabpanel-${renderedTab}`}
          aria-labelledby={`portfolio-tab-${renderedTab}`}
          aria-busy={isTabPending}
        >
          <Box
            sx={{
              p: 3,
              minHeight: TAB_PANEL_MIN_HEIGHT,
              opacity: isTabPending ? 0.6 : 1,
              transition: 'opacity 150ms',
            }}
          >
            {ActiveTab && sorted && (
              <Suspense fallback={<TabPanelFallback />}>
                <ActiveTab portfolio={portfolio} sorted={sorted} />
              </Suspense>
            )}
          </Box>
        </div>
      </Paper>
    </Box>
  );
};

export default PortfolioViewPage;
