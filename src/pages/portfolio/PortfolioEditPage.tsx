import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Tabs, Tab, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { usePortfolioEditForm } from '../../hooks/usePortfolioEditForm';
import {
  PortfolioEditTabPanel,
  CareerSummaryEditTab,
  SkillsEditTab,
  WorkExperienceEditTab,
  EducationEditTab,
  ProjectsEditTab,
  AwardsEditTab,
  PublicationsEditTab,
  CertificationsEditTab,
} from '../../components/portfolio/edit';

const PortfolioEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const form = usePortfolioEditForm(id);

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
        <Alert severity="error">Portfolio not found. Please try again or create a new portfolio.</Alert>
        <Button variant="contained" color="primary" onClick={() => navigate('/portfolio')} sx={{ mt: 2 }}>
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
            <Tab label="Career Summary" />
            <Tab label="Skills" />
            <Tab label="Work Experience" />
            <Tab label="Education" />
            <Tab label="Projects" />
            <Tab label="Awards" />
            <Tab label="Publications" />
            <Tab label="Certifications" />
          </Tabs>
        </Box>

        <PortfolioEditTabPanel value={form.tabValue} index={0}>
          <CareerSummaryEditTab form={form} />
        </PortfolioEditTabPanel>
        <PortfolioEditTabPanel value={form.tabValue} index={1}>
          <SkillsEditTab form={form} />
        </PortfolioEditTabPanel>
        <PortfolioEditTabPanel value={form.tabValue} index={2}>
          <WorkExperienceEditTab form={form} />
        </PortfolioEditTabPanel>
        <PortfolioEditTabPanel value={form.tabValue} index={3}>
          <EducationEditTab form={form} />
        </PortfolioEditTabPanel>
        <PortfolioEditTabPanel value={form.tabValue} index={4}>
          <ProjectsEditTab form={form} />
        </PortfolioEditTabPanel>
        <PortfolioEditTabPanel value={form.tabValue} index={5}>
          <AwardsEditTab form={form} />
        </PortfolioEditTabPanel>
        <PortfolioEditTabPanel value={form.tabValue} index={6}>
          <PublicationsEditTab form={form} />
        </PortfolioEditTabPanel>
        <PortfolioEditTabPanel value={form.tabValue} index={7}>
          <CertificationsEditTab form={form} />
        </PortfolioEditTabPanel>
      </Paper>
    </Box>
  );
};

export default PortfolioEditPage;