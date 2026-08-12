import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, OpenInNew, Refresh } from '@mui/icons-material';
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
import { usePortfolioWebsite } from '../hooks/useWebsite';
import { websiteKeys } from '../lib/queryKeys';
import { queryClient } from '../providers/QueryProvider';
import { defaultWebsiteColors } from '../theme/tokens';
import { WEBSITE_THEMES } from '../components/website/WebsiteThemeSelector';
import WebsiteSetupPanel from '../components/website/WebsiteSetupPanel';
import WebsiteManagementPanel, {
  WebsiteConfirmAction,
  WebsiteManageSection,
} from '../components/website/WebsiteManagementPanel';
import { ViewPageHeader } from '../components/common/ViewPageHeader';
import { PagePrimaryButton } from '../components/common/PagePrimaryButton';
import { PageLoadingState } from '../components/common/PageState';
import { extractApiErrorMessage } from '../utils/apiErrors';

const DEFAULT_CONFIG: PortfolioWebsiteConfig = {
  theme: 'modern',
  primary_color: defaultWebsiteColors.primary_color,
  secondary_color: defaultWebsiteColors.secondary_color,
  social_media_enabled: true,
  enabled_sections: ['about', 'experience', 'education', 'skills', 'projects', 'contact'],
  section_order: ['about', 'experience', 'education', 'skills', 'projects', 'contact'],
  contact_form_enabled: true,
  chatbot_enabled: false,
};

const SUPPORT_EMAIL = 'admin@yarba.app';
const WEBSITE_ACTION_ERROR = `Something went wrong. Please try again. If the problem persists, contact ${SUPPORT_EMAIL}.`;

const getHttpStatus = (error: unknown): number | undefined =>
  error && typeof error === 'object' && 'response' in error
    ? (error as { response?: { status?: number } }).response?.status
    : undefined;

const WebsitePage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<string>(WEBSITE_THEMES[0].value);
  const [manageSection, setManageSection] = useState<WebsiteManageSection>('overview');
  const [subdomain, setSubdomain] = useState<string>('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [suggestedSubdomains, setSuggestedSubdomains] = useState<string[]>([]);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState<boolean>(false);
  const {
    data: website,
    isLoading: websiteQueryLoading,
    error: websiteQueryError,
  } = usePortfolioWebsite();
  const [actionLoading, setActionLoading] = useState(false);
  const isLoading = websiteQueryLoading || actionLoading;
  const hasWebsite = Boolean(website);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<WebsiteConfirmAction | null>(null);

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
    if (websiteQueryError) {
      setError(WEBSITE_ACTION_ERROR);
    }
  }, [websiteQueryError]);

  useEffect(() => {
    return () => {
      if (deploymentPollTimeoutRef.current) clearTimeout(deploymentPollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (hasWebsite) {
      return;
    }

    if (!subdomain) {
      setSubdomainAvailable(null);
      setSubdomainError(null);
      setSuggestedSubdomains([]);
      setIsCheckingSubdomain(false);
      return;
    }

    if (subdomain.length < 3) {
      setSubdomainAvailable(null);
      setSubdomainError('Subdomain must be at least 3 characters long.');
      setSuggestedSubdomains([]);
      setIsCheckingSubdomain(false);
      return;
    }

    let ignoreResult = false;
    setIsCheckingSubdomain(true);
    setSubdomainError(null);

    const timeout = setTimeout(async () => {
      try {
        const response = await checkSubdomainAvailability(subdomain);
        if (ignoreResult) {
          return;
        }

        setSubdomainAvailable(response.available);
        if (!response.available) {
          setSubdomainError('This subdomain is not available.');
          setSuggestedSubdomains(response.suggested_alternatives || []);
        } else {
          setSuggestedSubdomains([]);
        }
      } catch (err: unknown) {
        if (ignoreResult) {
          return;
        }

        setSubdomainAvailable(null);
        setSubdomainError(extractApiErrorMessage(err, 'Unable to check this address.'));
        setSuggestedSubdomains([]);
      } finally {
        if (!ignoreResult) {
          setIsCheckingSubdomain(false);
        }
      }
    }, 500);

    return () => {
      ignoreResult = true;
      clearTimeout(timeout);
    };
  }, [hasWebsite, subdomain]);

  const handleSubdomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSubdomain = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(newSubdomain);
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
      setError(extractApiErrorMessage(err, WEBSITE_ACTION_ERROR));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedeploy = async () => {
    if (!website) return;

    setActionLoading(true);
    setError(null);
    try {
      const updatedWebsite = await deployPortfolioWebsite(true, true);
      setWebsite(updatedWebsite);
      if (isDeploymentInProgress(updatedWebsite.deployment_status)) {
        pollDeploymentStatus();
      }
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, WEBSITE_ACTION_ERROR));
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async () => {
    if (!website) return;

    setActionLoading(true);
    setError(null);
    try {
      await deletePortfolioWebsite();
      setWebsite(null);
      setActiveStep(0);
      setSubdomain('');
      setSelectedTheme(WEBSITE_THEMES[0].value);
      setSubdomainAvailable(null);
      setSubdomainError(null);
      stopPolling();
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, WEBSITE_ACTION_ERROR));
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleConfirmAction = async () => {
    if (confirmAction === 'redeploy') {
      await handleRedeploy();
      return;
    }

    if (confirmAction === 'delete') {
      await handleDelete();
    }
  };

  const handleConfirmCancel = () => {
    if (actionLoading) {
      return;
    }
    setConfirmAction(null);
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
      } catch (err: unknown) {
        if (getHttpStatus(err) === 429) {
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
  }, [fetchUserWebsite, stopPolling, updateWebsite]);

  const isDeploymentInProgress = (status: DeploymentStatus | undefined): boolean => {
    return !!status && (status.status === 'pending' || status.status === 'building');
  };

  const websiteSubdomain = website?.subdomain;
  const websiteTheme = website?.config.theme;
  const websiteDeploymentState = website?.deployment_status.status;

  useEffect(() => {
    if (!websiteSubdomain || !websiteTheme) {
      return;
    }

    setActiveStep(2);
    setSelectedTheme(websiteTheme);
    setSubdomain(websiteSubdomain);
    if (websiteDeploymentState === 'pending' || websiteDeploymentState === 'building') {
      pollDeploymentStatus();
    }
  }, [pollDeploymentStatus, websiteDeploymentState, websiteSubdomain, websiteTheme]);

  const deploymentStatus = website?.deployment_status.status;

  const handleSuggestedSubdomain = (suggestion: string) => {
    setSubdomain(suggestion);
  };

  if (isLoading && !website && activeStep === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <PageLoadingState label="Loading your portfolio website…" />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <ViewPageHeader
        title="Portfolio website"
        description={
          website
            ? 'Manage your live portfolio, AI chatbot, and visitor conversations.'
            : 'Publish a professional website from your Yarba portfolio in two quick steps.'
        }
        action={
          website?.website_url && deploymentStatus === 'success' ? (
            <PagePrimaryButton
              component="a"
              href={website.website_url}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNew />}
            >
              Open website
            </PagePrimaryButton>
          ) : undefined
        }
      />

      {!website ? (
        <WebsiteSetupPanel
          activeStep={activeStep}
          selectedTheme={selectedTheme}
          subdomain={subdomain}
          subdomainAvailable={subdomainAvailable}
          subdomainError={subdomainError}
          suggestedSubdomains={suggestedSubdomains}
          isCheckingSubdomain={isCheckingSubdomain}
          isLoading={isLoading}
          error={error}
          onThemeChange={setSelectedTheme}
          onSubdomainChange={handleSubdomainChange}
          onSuggestedSubdomain={handleSuggestedSubdomain}
          onStepChange={setActiveStep}
          onPublish={handleCreateAndDeploy}
        />
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          <WebsiteManagementPanel
            website={website}
            section={manageSection}
            isLoading={isLoading}
            actionLoading={actionLoading}
            onSectionChange={setManageSection}
            onConfirmAction={setConfirmAction}
            onWebsiteUpdated={(updated) => {
              setWebsite(updated);
              if (isDeploymentInProgress(updated.deployment_status)) {
                pollDeploymentStatus();
              }
            }}
            onDeploymentStarted={pollDeploymentStatus}
          />
        </>
      )}
      <Dialog
        open={confirmAction !== null}
        onClose={handleConfirmCancel}
        maxWidth="sm"
        fullWidth
        aria-labelledby="website-confirm-dialog-title"
      >
        <DialogTitle id="website-confirm-dialog-title">
          {confirmAction === 'redeploy' ? 'Redeploy website?' : 'Delete website?'}
        </DialogTitle>
        <DialogContent>
          {confirmAction === 'redeploy' ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                This will delete all existing files and regenerate your website from scratch. Your
                subdomain and live URL will stay the same.
              </DialogContentText>
              <Alert severity="warning">
                Redeploy can take a few minutes. The site may be briefly unavailable while it
                rebuilds.
              </Alert>
            </>
          ) : (
            <DialogContentText>
              Are you sure you want to delete your portfolio website? This action cannot be undone
              and will remove your live site.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleConfirmCancel} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={confirmAction === 'delete' ? 'error' : 'primary'}
            disabled={actionLoading}
            startIcon={
              actionLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : confirmAction === 'redeploy' ? (
                <Refresh />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {actionLoading
              ? confirmAction === 'redeploy'
                ? 'Redeploying...'
                : 'Deleting...'
              : confirmAction === 'redeploy'
                ? 'Redeploy'
                : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WebsitePage;
