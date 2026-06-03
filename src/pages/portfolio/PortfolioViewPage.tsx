import React, { Suspense, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { ViewPortfolio } from '../../types/portfolioView';
import { getPortfolioViewSortedData } from '../../utils/portfolioViewSorted';
import { useDeferredTabs } from '../../hooks/useDeferredTabs';
import { usePortfolioById, useUserPortfolio } from '../../hooks/usePortfolio';
import { TabPanelFallback } from '../../components/common/DeferredTabPanel';
import { PORTFOLIO_VIEW_TABS } from '../../components/portfolio/view/portfolioViewTabs';

const PortfolioViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tabValue, renderedTab, isTabPending, handleTabChange } = useDeferredTabs(0);

  const portfolioByIdQuery = usePortfolioById(id);
  const userPortfolioQuery = useUserPortfolio();

  const activeQuery = id ? portfolioByIdQuery : userPortfolioQuery;
  const portfolio = activeQuery.data as ViewPortfolio | undefined;
  const loading = activeQuery.isLoading;
  const error = activeQuery.isError
    ? 'Failed to load portfolio. Please try again later.'
    : null;

  const sorted = useMemo(
    () => (portfolio ? getPortfolioViewSortedData(portfolio) : null),
    [portfolio]
  );

  const handleEditClick = () => {
    if (portfolio?._id) {
      navigate(`/portfolio/${portfolio._id}/edit`);
    } else if (id) {
      navigate(`/portfolio/${id}/edit`);
    } else {
      navigate('/portfolio');
    }
  };

  const handleCreateClick = () => {
    navigate('/portfolio/create');
  };

  const ActiveTab = PORTFOLIO_VIEW_TABS[renderedTab]?.Tab;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
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
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Create New Portfolio
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3, pl: 2, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'right', alignItems: 'center', mb: 3 }}>
        <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={handleEditClick}>
          Edit Portfolio
        </Button>
      </Box>

      <Paper elevation={1} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="portfolio tabs"
            variant="fullWidth"
            centered
          >
            {PORTFOLIO_VIEW_TABS.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.label}
                  icon={<Icon />}
                  label={tab.label}
                  id={`portfolio-tab-${index}`}
                  aria-controls={`portfolio-tabpanel-${index}`}
                />
              );
            })}
          </Tabs>
        </Box>

        <div
          role="tabpanel"
          id={`portfolio-tabpanel-${renderedTab}`}
          aria-labelledby={`portfolio-tab-${renderedTab}`}
          aria-busy={isTabPending}
        >
          <Box sx={{ p: 3, minHeight: 120, opacity: isTabPending ? 0.6 : 1, transition: 'opacity 150ms' }}>
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
