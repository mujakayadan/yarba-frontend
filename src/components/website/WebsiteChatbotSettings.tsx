import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Link,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { SmartToy } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { PortfolioWebsiteConfig, PortfolioWebsiteResponse } from '../../types/models';
import { updateWebsiteConfig } from '../../services/websiteService';
import { useToast } from '../../contexts/ToastContext';

interface WebsiteChatbotSettingsProps {
  website: PortfolioWebsiteResponse;
  disabled?: boolean;
  onUpdated: (website: PortfolioWebsiteResponse) => void;
  onDeploymentStarted?: () => void;
}

const defaultWelcomePreview = (fullName?: string) =>
  `Hi! I'm ${fullName || 'your'} AI assistant. Feel free to ask me anything about my experience, skills, or projects!`;

export const WebsiteChatbotSettings: React.FC<WebsiteChatbotSettingsProps> = ({
  website,
  disabled = false,
  onUpdated,
  onDeploymentStarted,
}) => {
  const { showSuccess, showError } = useToast();
  const [chatbotEnabled, setChatbotEnabled] = useState(website.config.chatbot_enabled ?? false);
  const [storeConversations, setStoreConversations] = useState(
    website.config.chatbot_store_conversations ?? false
  );
  const [welcomeMessage, setWelcomeMessage] = useState(
    website.config.chatbot_welcome_message ?? ''
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setChatbotEnabled(website.config.chatbot_enabled ?? false);
    setStoreConversations(website.config.chatbot_store_conversations ?? false);
    setWelcomeMessage(website.config.chatbot_welcome_message ?? '');
  }, [
    website.config.chatbot_enabled,
    website.config.chatbot_store_conversations,
    website.config.chatbot_welcome_message,
  ]);

  const hasChanges =
    chatbotEnabled !== (website.config.chatbot_enabled ?? false) ||
    storeConversations !== (website.config.chatbot_store_conversations ?? false) ||
    (welcomeMessage.trim() || null) !== (website.config.chatbot_welcome_message ?? null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextConfig: PortfolioWebsiteConfig = {
        ...website.config,
        chatbot_enabled: chatbotEnabled,
        chatbot_store_conversations: storeConversations,
        chatbot_welcome_message: welcomeMessage.trim() || null,
      };
      const updated = await updateWebsiteConfig(nextConfig);
      onUpdated(updated);
      showSuccess(
        chatbotEnabled
          ? 'Chatbot settings saved. Your site will rebuild shortly.'
          : 'Chatbot settings saved.'
      );
      if (
        updated.deployment_status.status === 'pending' ||
        updated.deployment_status.status === 'building'
      ) {
        onDeploymentStarted?.();
      }
    } catch {
      showError('Failed to save chatbot settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          mb: 1,
        }}
      >
        <SmartToy color="primary" />
        <Typography variant="h6" component="h2">
          Portfolio chatbot
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          marginBottom: '16px',
        }}
      >
        Add an AI assistant to your live portfolio site. Visitors can ask about your experience,
        skills, and projects. The assistant uses your portfolio data and{' '}
        <Link component={RouterLink} to="/settings/story">
          life story
        </Link>
        .
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={chatbotEnabled}
            onChange={(e) => setChatbotEnabled(e.target.checked)}
            disabled={disabled || saving}
          />
        }
        label="Enable chatbot on my portfolio website"
      />

      {chatbotEnabled && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Welcome message"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            disabled={disabled || saving}
            placeholder={defaultWelcomePreview()}
            helperText="Optional. Shown when visitors open the chat. Leave blank for the default greeting."
            sx={{ mb: 2 }}
          />
          <Alert severity="info" sx={{ mb: 2 }}>
            For scheduling requests, add a{' '}
            <Link component={RouterLink} to="/settings/personal">
              Calendly link
            </Link>{' '}
            in your profile. Your profile picture is used as the chat avatar.
          </Alert>
          <FormControlLabel
            control={
              <Switch
                checked={storeConversations}
                onChange={(e) => setStoreConversations(e.target.checked)}
                disabled={disabled || saving}
              />
            }
            label="Store visitor conversations (90 days)"
          />
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              ml: 7,
              mb: 2,
            }}
          >
            Lets you review chat history on this page. Visitors see a short privacy notice in the
            widget.
          </Typography>
        </Box>
      )}

      <Button
        variant="outlined"
        onClick={handleSave}
        disabled={disabled || saving || !hasChanges}
        startIcon={saving ? <CircularProgress size={18} /> : undefined}
      >
        {saving ? 'Saving...' : 'Save Chatbot Settings'}
      </Button>
    </Box>
  );
};

export default WebsiteChatbotSettings;
