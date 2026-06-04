import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import { usePortfolioEditForm } from '../../hooks/usePortfolioEditForm';
import { PORTFOLIO_EDIT_TABS } from '../../components/portfolio/edit/portfolioEditTabs';
import { PortfolioTabBar } from '../../components/portfolio/PortfolioTabBar';
import { EditPageActionBar } from '../../components/common/EditPageActionBar';
import { ViewPageHeader } from '../../components/common/ViewPageHeader';
import { PageLoadingState, PageErrorState } from '../../components/common/PageState';
import { TabPanelFallback, TAB_PANEL_MIN_HEIGHT } from '../../components/common/DeferredTabPanel';

const PortfolioEditPage: React.FC = () => {
  const navigate = useNavigate();
  const form = usePortfolioEditForm();
  const ActiveTab = PORTFOLIO_EDIT_TABS[form.renderedTab]?.Tab;

  if (form.loading) {
    return <PageLoadingState />;
  }

  if (form.error && !form.portfolio) {
    return (
      <PageErrorState
        title="Edit Portfolio"
        message={form.error}
        backLabel="Back to Portfolios"
        onBack={() => navigate('/portfolio')}
      />
    );
  }

  if (!form.portfolio) {
    return (
      <PageErrorState
        title="Edit Portfolio"
        message="Portfolio not found. Please try again or create a new portfolio."
        backLabel="Back to Portfolios"
        onBack={() => navigate('/portfolio')}
      />
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <ViewPageHeader title="Edit Portfolio" />

      <EditPageActionBar
        backLabel="Back to Portfolio"
        onBack={form.handleCancel}
        onSave={form.handleSave}
        saving={form.saving}
      />

      <Paper elevation={1} sx={{ mb: 4 }}>
        <PortfolioTabBar
          tabValue={form.tabValue}
          onChange={form.handleTabChange}
          tabs={PORTFOLIO_EDIT_TABS}
          idPrefix="portfolio-edit"
          ariaLabel="portfolio edit tabs"
        />

        <div
          role="tabpanel"
          id={`portfolio-edit-tabpanel-${form.renderedTab}`}
          aria-labelledby={`portfolio-edit-tab-${form.renderedTab}`}
          aria-busy={form.isTabPending}
        >
          <Box
            sx={{
              p: 3,
              minHeight: TAB_PANEL_MIN_HEIGHT,
              opacity: form.isTabPending ? 0.6 : 1,
              transition: 'opacity 150ms',
            }}
          >
            {ActiveTab && (
              <Suspense fallback={<TabPanelFallback />}>
                <ActiveTab form={form} />
              </Suspense>
            )}
          </Box>
        </div>
      </Paper>
    </Box>
  );
};

export default PortfolioEditPage;
