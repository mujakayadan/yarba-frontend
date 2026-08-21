import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Language, Refresh } from '@mui/icons-material';
import Grid from '../../mui/Grid';
import { PortfolioWebsiteResponse } from '../../types/models';
import WebsiteChatbotSettings from './WebsiteChatbotSettings';
import WebsiteChatInsights from './WebsiteChatInsights';

export type WebsiteManageSection = 'overview' | 'chatbot' | 'conversations';
export type WebsiteConfirmAction = 'redeploy' | 'delete';

const SUPPORT_EMAIL = 'admin@yarba.app';
const DEPLOYMENT_FAILED_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=Portfolio%20Website%20Deployment%20Error`;

interface WebsiteManagementPanelProps {
  website: PortfolioWebsiteResponse;
  section: WebsiteManageSection;
  isLoading: boolean;
  actionLoading: boolean;
  onSectionChange: (section: WebsiteManageSection) => void;
  onConfirmAction: (action: WebsiteConfirmAction) => void;
  onWebsiteUpdated: (website: PortfolioWebsiteResponse) => void;
  onDeploymentStarted: () => void;
}

export const WebsiteManagementPanel: React.FC<WebsiteManagementPanelProps> = ({
  website,
  section,
  isLoading,
  actionLoading,
  onSectionChange,
  onConfirmAction,
  onWebsiteUpdated,
  onDeploymentStarted,
}) => {
  const deploymentStatus = website.deployment_status.status;
  const deploymentInProgress = deploymentStatus === 'pending' || deploymentStatus === 'building';
  const moderationStatus = website.moderation_status ?? 'under_review';
  const moderationRestricted = moderationStatus !== 'active';
  const deploymentTitle =
    deploymentStatus === 'success'
      ? 'Your website is live'
      : deploymentStatus === 'failed'
        ? 'Deployment needs attention'
        : deploymentStatus === 'building'
          ? 'Building your website'
          : 'Preparing your website';
  const deploymentColor: 'default' | 'success' | 'info' | 'error' =
    deploymentStatus === 'success'
      ? 'success'
      : deploymentInProgress
        ? 'info'
        : deploymentStatus === 'failed'
          ? 'error'
          : 'default';

  return (
    <>
      {moderationRestricted ? (
        <Alert severity={moderationStatus === 'suspended' ? 'error' : 'warning'} sx={{ mb: 3 }}>
          {website.moderation_message ??
            (moderationStatus === 'suspended'
              ? 'This website is suspended and cannot be published or use public chat. Contact support to request review.'
              : 'This website is under content review and cannot be republished until review is complete.')}
        </Alert>
      ) : null}
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Language />
            </Box>
            <Box>
              <Typography variant="h5" component="h2">
                {deploymentTitle}
              </Typography>
              <Link
                href={website.website_url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ wordBreak: 'break-word' }}
              >
                {website.website_url}
              </Link>
            </Box>
          </Stack>
          <Chip
            label={deploymentStatus || 'Unknown'}
            color={deploymentColor}
            icon={deploymentInProgress ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ textTransform: 'capitalize' }}
          />
        </Stack>

        {deploymentStatus === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            We could not complete your deployment. Open Overview to redeploy, or{' '}
            <Link href={DEPLOYMENT_FAILED_MAILTO}>{SUPPORT_EMAIL}</Link> if the problem persists.
          </Alert>
        )}
        {deploymentInProgress && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This page updates automatically while your website is {deploymentStatus}.
          </Alert>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Tabs
          value={section}
          onChange={(_, value: WebsiteManageSection) => onSectionChange(value)}
          aria-label="Portfolio website management sections"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: { xs: 1, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="overview" label="Overview" />
          <Tab value="chatbot" label="AI chatbot" />
          <Tab value="conversations" label="Conversations" />
        </Tabs>

        <Box role="tabpanel" aria-label={`${section} settings`} sx={{ p: { xs: 2, md: 3 } }}>
          {section === 'overview' && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">
                      Web address
                    </Typography>
                    <Typography sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                      {website.subdomain}.yarba.app
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">
                      Theme
                    </Typography>
                    <Typography sx={{ mt: 0.5, textTransform: 'capitalize' }}>
                      {website.config.theme}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">
                      Last updated
                    </Typography>
                    <Typography sx={{ mt: 0.5 }}>
                      {new Date(website.last_updated).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="h6">Rebuild your website</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  Publish the latest portfolio information and regenerate all website files.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => onConfirmAction('redeploy')}
                  disabled={isLoading || deploymentInProgress || moderationRestricted}
                  startIcon={actionLoading ? <CircularProgress size={18} /> : <Refresh />}
                >
                  Redeploy website
                </Button>
              </Box>

              <Paper
                variant="outlined"
                sx={{ p: 2, borderColor: 'error.main', bgcolor: 'action.hover' }}
              >
                <Typography variant="h6" color="error.main">
                  Delete website
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  Permanently remove the live website and its deployment.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => onConfirmAction('delete')}
                  disabled={isLoading || deploymentInProgress}
                >
                  Delete website
                </Button>
              </Paper>
            </Stack>
          )}

          {section === 'chatbot' && (
            <WebsiteChatbotSettings
              website={website}
              disabled={isLoading || deploymentInProgress || moderationRestricted}
              onUpdated={onWebsiteUpdated}
              onDeploymentStarted={onDeploymentStarted}
            />
          )}

          {section === 'conversations' &&
            (!(website.config.chatbot_enabled ?? false) ||
            !(website.config.chatbot_store_conversations ?? false) ? (
              <Alert severity="info">
                Enable the chatbot and conversation storage to review visitor conversations.
              </Alert>
            ) : (
              <WebsiteChatInsights
                enabled={website.config.chatbot_enabled ?? false}
                storageEnabled={website.config.chatbot_store_conversations ?? false}
              />
            ))}
        </Box>
      </Paper>
    </>
  );
};

export default WebsiteManagementPanel;
