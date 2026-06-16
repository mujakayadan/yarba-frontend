import Grid from '../mui/Grid';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Typography,
  Container,
  Paper,
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Link,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline, Language, Refresh } from '@mui/icons-material';
import {
  createPortfolioWebsite,
  checkSubdomainAvailability,
  deployPortfolioWebsite,
  deletePortfolioWebsite,
  getDeploymentStatus,
  getPortfolioWebsite,
} from '../services/websiteService';
import {
  PortfolioWebsiteResponse,
  PortfolioWebsiteConfig,
  DeploymentStatus,
} from '../types/models';
import debounce from 'lodash/debounce';
import { usePortfolioWebsite } from '../hooks/useWebsite';
import { websiteKeys } from '../lib/queryKeys';
import { queryClient } from '../providers/QueryProvider';
import { defaultWebsiteColors } from '../theme/tokens';

const THEMES = [
  {
    name: 'Modern',
    value: 'modern',
    previewImage: '/assets/modern_preview.png',
    description: 'A clean and professional look for your portfolio.',
  },
  {
    name: 'Three.js',
    value: 'threejs',
    previewImage: '/assets/threejs_preview.png',
    description: 'An interactive 3D experience for your portfolio.',
  },
  // Add more themes here as they become available
];

const DEFAULT_CONFIG: PortfolioWebsiteConfig = {
  theme: 'modern',
  primary_color: defaultWebsiteColors.primary_color,
  secondary_color: defaultWebsiteColors.secondary_color,
  social_media_enabled: true,
  enabled_sections: ['about', 'experience', 'education', 'skills', 'projects', 'contact'],
  section_order: ['about', 'experience', 'education', 'skills', 'projects', 'contact'],
  contact_form_enabled: true,
};

const SUPPORT_EMAIL = 'admin@yarba.app';
const WEBSITE_ACTION_ERROR = `Something went wrong. Please try again. If the problem persists, contact ${SUPPORT_EMAIL}.`;
const DEPLOYMENT_FAILED_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=Portfolio%20Website%20Deployment%20Error`;

function logWebsiteActionError(context: string, err: unknown) {
  const detail =
    err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
      : undefined;
  console.error(context, detail ?? err);
}

const WebsitePage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<string>(THEMES[0].value);
  const [subdomain, setSubdomain] = useState<string>('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [suggestedSubdomains, setSuggestedSubdomains] = useState<string[]>([]);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState<boolean>(false);
  const {
    data: website,
    isLoading: websiteQueryLoading,
    isFetching: websiteQueryFetching,
    error: websiteQueryError,
  } = usePortfolioWebsite();
  const [actionLoading, setActionLoading] = useState(false);
  const isLoading = websiteQueryLoading || actionLoading;
  const isRefreshingWebsite = websiteQueryFetching && !websiteQueryLoading;
  const showManageWebsiteLoading =
    activeStep === 2 && !website && (isLoading || isRefreshingWebsite || actionLoading);
  const [error, setError] = useState<string | null>(null);

  const setWebsite = useCallback((value: PortfolioWebsiteResponse | null) => {
    queryClient.setQueryData(websiteKeys.portfolio(), value);
  }, []);

  const updateWebsite = useCallback(
    (
      updater: (
        prev: PortfolioWebsiteResponse | null | undefined
      ) => PortfolioWebsiteResponse | null
    ) => {
      queryClient.setQueryData(websiteKeys.portfolio(), updater);
    },
    []
  );
  const deploymentPollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRetryCountRef = useRef<number>(0);

  const MAX_POLL_RETRIES = 120;
  const MIN_POLL_INTERVAL = 2000;
  const DEFAULT_POLL_INTERVAL = 5000;

  const fetchUserWebsite = useCallback(async () => {
    const previousWebsite = queryClient.getQueryData<PortfolioWebsiteResponse | null>(
      websiteKeys.portfolio()
    );

    const existingWebsite = await getPortfolioWebsite();

    if (existingWebsite) {
      setWebsite(existingWebsite);
      setActiveStep(2);
      setSelectedTheme(existingWebsite.config.theme);
      setSubdomain(existingWebsite.subdomain);
      return;
    }

    if (previousWebsite) {
      setWebsite(previousWebsite);
      return;
    }

    setWebsite(null);
  }, [setWebsite]);

  useEffect(() => {
    if (website) {
      setActiveStep(2);
      setSelectedTheme(website.config.theme);
      setSubdomain(website.subdomain);
      if (isDeploymentInProgress(website.deployment_status)) {
        pollDeploymentStatus();
      }
    }
  }, [website?.subdomain]);

  useEffect(() => {
    if (websiteQueryError) {
      console.error('Failed to fetch website data:', websiteQueryError);
      setError(WEBSITE_ACTION_ERROR);
    }
  }, [websiteQueryError]);

  useEffect(() => {
    const message = website?.deployment_status?.error_message;
    if (website?.deployment_status?.status === 'failed' && message) {
      console.error('Portfolio deployment failed:', message);
    }
  }, [website?.deployment_status?.status, website?.deployment_status?.error_message]);

  useEffect(() => {
    return () => {
      if (deploymentPollTimeoutRef.current) clearTimeout(deploymentPollTimeoutRef.current);
    };
  }, []);

  const debouncedCheckSubdomain = useCallback(
    debounce(async (name: string) => {
      if (!name || name.length < 3) {
        setSubdomainAvailable(null);
        setSubdomainError('Subdomain must be at least 3 characters long.');
        setSuggestedSubdomains([]);
        return;
      }
      setIsCheckingSubdomain(true);
      setSubdomainError(null);
      try {
        const response = await checkSubdomainAvailability(name);
        setSubdomainAvailable(response.available);
        if (!response.available) {
          setSubdomainError('This subdomain is not available.');
          setSuggestedSubdomains(response.suggested_alternatives || []);
        } else {
          setSuggestedSubdomains([]);
        }
      } catch (err: any) {
        setSubdomainAvailable(null);
        setSubdomainError(err.message || 'Error checking subdomain.');
        setSuggestedSubdomains([]);
      } finally {
        setIsCheckingSubdomain(false);
      }
    }, 500), // 500ms debounce time
    []
  );

  const handleSubdomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSubdomain = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(newSubdomain);
    if (newSubdomain) {
      debouncedCheckSubdomain(newSubdomain);
    }
  };

  const stopPolling = useCallback(() => {
    if (deploymentPollTimeoutRef.current) {
      clearTimeout(deploymentPollTimeoutRef.current);
      deploymentPollTimeoutRef.current = null;
    }
    pollRetryCountRef.current = 0;
  }, []);

  const handleCreateAndDeploy = async () => {
    if (!subdomain || !subdomainAvailable) {
      setError('Please enter a valid and available subdomain.');
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const config: PortfolioWebsiteConfig = { ...DEFAULT_CONFIG, theme: selectedTheme };
      const newWebsite = await createPortfolioWebsite(config, subdomain);
      setWebsite(newWebsite);
      setActiveStep(2);
      if (isDeploymentInProgress(newWebsite.deployment_status)) {
        pollDeploymentStatus();
      }
    } catch (err: unknown) {
      logWebsiteActionError('Failed to create website:', err);
      setError(WEBSITE_ACTION_ERROR);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedeploy = async () => {
    if (!website) return;

    if (
      !window.confirm(
        'Redeploy will delete all existing files and regenerate your website from scratch. Continue?'
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const updatedWebsite = await deployPortfolioWebsite(true, true);
      setWebsite(updatedWebsite);
      if (isDeploymentInProgress(updatedWebsite.deployment_status)) {
        pollDeploymentStatus();
      }
    } catch (err: unknown) {
      logWebsiteActionError('Failed to redeploy website:', err);
      setError(WEBSITE_ACTION_ERROR);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!website) return;
    if (
      !window.confirm(
        'Are you sure you want to delete your portfolio website? This action cannot be undone.'
      )
    )
      return;
    setActionLoading(true);
    setError(null);
    try {
      await deletePortfolioWebsite();
      setWebsite(null);
      setActiveStep(0);
      setSubdomain('');
      setSelectedTheme(THEMES[0].value);
      setSubdomainAvailable(null);
      setSubdomainError(null);
      stopPolling();
    } catch (err: unknown) {
      logWebsiteActionError('Failed to delete website:', err);
      setError(WEBSITE_ACTION_ERROR);
    } finally {
      setActionLoading(false);
    }
  };

  const pollDeploymentStatus = useCallback(() => {
    if (deploymentPollTimeoutRef.current) clearTimeout(deploymentPollTimeoutRef.current);

    const performPoll = async () => {
      if (pollRetryCountRef.current >= MAX_POLL_RETRIES) {
        stopPolling();
        return;
      }

      try {
        const statusData = await getDeploymentStatus();

        updateWebsite((prev) => {
          if (!prev) {
            return null;
          }

          const next: PortfolioWebsiteResponse = {
            ...prev,
            deployment_status: statusData,
          };

          if (statusData.status === 'success' && statusData.deployment_url) {
            next.website_url = statusData.deployment_url;
          }

          return next;
        });

        if (!isDeploymentInProgress(statusData)) {
          stopPolling();
          void fetchUserWebsite();
          return;
        }

        let nextInterval = DEFAULT_POLL_INTERVAL;
        if (statusData.status === 'building') {
          nextInterval = Math.max(MIN_POLL_INTERVAL, 3000);
        } else if (statusData.status === 'pending') {
          nextInterval = Math.max(MIN_POLL_INTERVAL, 5000);
        }

        pollRetryCountRef.current += 1;
        deploymentPollTimeoutRef.current = setTimeout(performPoll, nextInterval);
      } catch (err: any) {
        if (err.response?.status === 429) {
          const backoffInterval = Math.max(10000, MIN_POLL_INTERVAL * 5);
          pollRetryCountRef.current += 1;

          if (pollRetryCountRef.current < MAX_POLL_RETRIES) {
            deploymentPollTimeoutRef.current = setTimeout(performPoll, backoffInterval);
          } else {
            stopPolling();
          }
          return;
        }

        const backoffInterval = Math.min(
          30000,
          DEFAULT_POLL_INTERVAL * Math.pow(2, Math.min(pollRetryCountRef.current, 5))
        );
        pollRetryCountRef.current += 1;

        if (pollRetryCountRef.current < MAX_POLL_RETRIES) {
          deploymentPollTimeoutRef.current = setTimeout(performPoll, backoffInterval);
        } else {
          stopPolling();
        }
      }
    };

    pollRetryCountRef.current = 0;
    performPoll();
  }, [fetchUserWebsite, stopPolling]);

  const isDeploymentInProgress = (status: DeploymentStatus | undefined): boolean => {
    return !!status && (status.status === 'pending' || status.status === 'building');
  };

  const steps = [
    {
      label: 'Select Theme',
      content: (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {THEMES.map((theme) => (
            <Grid item xs={12} sm={6} md={4} key={theme.value}>
              <Card
                sx={{
                  border: selectedTheme === theme.value ? '2px solid' : '2px solid transparent',
                  borderColor: selectedTheme === theme.value ? 'primary.main' : 'transparent',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onClick={() => setSelectedTheme(theme.value)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={theme.previewImage}
                  alt={theme.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {theme.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {theme.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12} sx={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => setActiveStep(1)} disabled={!selectedTheme}>
              Next
            </Button>
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Choose Subdomain & Deploy',
      content: (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Subdomain"
            variant="outlined"
            value={subdomain}
            onChange={handleSubdomainChange}
            helperText={
              subdomainError ||
              (subdomainAvailable === false && suggestedSubdomains.length > 0
                ? `Try: ${suggestedSubdomains.join(', ')}`
                : 'e.g., yourname.yarba.app (min 3 chars, a-z, 0-9, - allowed)')
            }
            error={subdomainAvailable === false || !!subdomainError}
            InputProps={{
              endAdornment: isCheckingSubdomain ? (
                <CircularProgress size={20} />
              ) : subdomainAvailable === true ? (
                <CheckCircleOutline color="success" />
              ) : subdomainAvailable === false ? (
                <ErrorOutline color="error" />
              ) : null,
            }}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleCreateAndDeploy}
            disabled={isLoading || !subdomain || subdomainAvailable !== true}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Language />}
          >
            {isLoading ? 'Creating Website...' : 'Create & Deploy Website'}
          </Button>
        </Box>
      ),
    },
    {
      label: 'Manage Website',
      content: (
        <Box sx={{ mt: 2 }}>
          {showManageWebsiteLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Setting up your website...</Typography>
            </Box>
          ) : website ? (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Your Portfolio Website is Live!
              </Typography>
              <Typography variant="body1" gutterBottom>
                Access it at:{' '}
                <Link href={website.website_url} target="_blank" rel="noopener">
                  {website.website_url}
                </Link>
              </Typography>
              <Chip
                label={`Deployment: ${website.deployment_status.status}`}
                color={
                  website.deployment_status.status === 'success'
                    ? 'success'
                    : isDeploymentInProgress(website.deployment_status)
                      ? 'info'
                      : 'error'
                }
                icon={
                  isDeploymentInProgress(website.deployment_status) ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={{ my: 1 }}
              />
              {website.deployment_status.status === 'failed' && (
                <Alert severity="error" sx={{ my: 1 }}>
                  We could not complete your website deployment. Please try Redeploy, or{' '}
                  <Link href={DEPLOYMENT_FAILED_MAILTO}>{SUPPORT_EMAIL}</Link> if the problem
                  persists.
                </Alert>
              )}
              {isDeploymentInProgress(website.deployment_status) && (
                <Alert severity="info" sx={{ my: 1 }}>
                  Your website is currently {website.deployment_status.status}. This page will
                  update automatically.
                </Alert>
              )}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleRedeploy}
                  disabled={isLoading || isDeploymentInProgress(website.deployment_status)}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <Refresh />}
                >
                  {isLoading ? 'Redeploying...' : 'Redeploy'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  disabled={isLoading || isDeploymentInProgress(website.deployment_status)}
                >
                  Delete Website
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                <strong>Redeploy:</strong> Deletes all files and rebuilds your website from scratch.
              </Typography>
            </Paper>
          ) : (
            <Alert severity="info">No website found. Please go back to create one.</Alert>
          )}
        </Box>
      ),
    },
  ];

  if (isLoading && !website && activeStep === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading website information...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Portfolio Website Management
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label} expanded={index === activeStep}>
              <StepLabel
                onClick={() => (!website || index < activeStep ? setActiveStep(index) : null)}
                sx={{ cursor: !website || index < activeStep ? 'pointer' : 'default' }}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                {index === activeStep && step.content}
                {index === activeStep && (
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <div>
                      {index > 0 && activeStep !== 2 && (
                        <Button
                          disabled={index === 0 || isLoading}
                          onClick={() => setActiveStep((prev) => prev - 1)}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      )}
                    </div>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default WebsitePage;
