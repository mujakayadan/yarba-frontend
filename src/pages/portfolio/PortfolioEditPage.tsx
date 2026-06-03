import React, { Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Tabs, Tab, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { usePortfolioEditForm } from '../../hooks/usePortfolioEditForm';
import { PORTFOLIO_EDIT_TABS } from '../../components/portfolio/edit/portfolioEditTabs';

const PortfolioEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const form = usePortfolioEditForm(id);
  const ActiveTab = PORTFOLIO_EDIT_TABS[form.renderedTab]?.Tab;

  if (form.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (form.error && !form.portfolio) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {form.error}
      </Alert>
    );
  }

  if (!form.portfolio) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Portfolio not found. Please try again or create a new portfolio.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/portfolio')}
          sx={{ mt: 2 }}
        >
          Back to Portfolios
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={form.handleCancel} sx={{ mb: 2 }}>
        Back to Portfolio
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={form.handleSave}
          disabled={form.saving}
        >
          {form.saving ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </Box>

      {form.success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {form.success}
        </Alert>
      )}

      {form.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {form.error}
        </Alert>
      )}

      <Paper elevation={1} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={form.tabValue}
            onChange={form.handleTabChange}
            aria-label="portfolio edit tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {PORTFOLIO_EDIT_TABS.map((tab, index) => (
              <Tab
                key={tab.label}
                label={tab.label}
                id={`portfolio-edit-tab-${index}`}
                aria-controls={`portfolio-edit-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        <div
          role="tabpanel"
          id={`portfolio-edit-tabpanel-${form.renderedTab}`}
          aria-labelledby={`portfolio-edit-tab-${form.renderedTab}`}
          aria-busy={form.isTabPending}
        >
          <Box
            sx={{
              p: 3,
              minHeight: 120,
              opacity: form.isTabPending ? 0.6 : 1,
              transition: 'opacity 150ms',
            }}
          >
            {ActiveTab && (
              <Suspense
                fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={32} />
                  </Box>
                }
              >
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
