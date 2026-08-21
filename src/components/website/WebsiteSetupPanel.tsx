import React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline, Language } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '../../mui/Grid';
import { PagePrimaryButton } from '../common/PagePrimaryButton';
import WebsiteThemeSelector, { WEBSITE_THEMES } from './WebsiteThemeSelector';

const SETUP_STEP_COUNT = 2;

interface WebsiteSetupPanelProps {
  activeStep: number;
  selectedTheme: string;
  subdomain: string;
  subdomainAvailable: boolean | null;
  subdomainError: string | null;
  suggestedSubdomains: string[];
  isCheckingSubdomain: boolean;
  isLoading: boolean;
  error: string | null;
  policyConfirmed: boolean;
  onThemeChange: (theme: string) => void;
  onSubdomainChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSuggestedSubdomain: (suggestion: string) => void;
  onStepChange: (step: number) => void;
  onPolicyConfirmedChange: (confirmed: boolean) => void;
  onPublish: () => void;
}

export const WebsiteSetupPanel: React.FC<WebsiteSetupPanelProps> = ({
  activeStep,
  selectedTheme,
  subdomain,
  subdomainAvailable,
  subdomainError,
  suggestedSubdomains,
  isCheckingSubdomain,
  isLoading,
  error,
  policyConfirmed,
  onThemeChange,
  onSubdomainChange,
  onSuggestedSubdomain,
  onStepChange,
  onPolicyConfirmedChange,
  onPublish,
}) => {
  const selectedThemeOption =
    WEBSITE_THEMES.find((theme) => theme.value === selectedTheme) ?? WEBSITE_THEMES[0];

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="overline" color="primary.main">
              Step {activeStep + 1} of {SETUP_STEP_COUNT}
            </Typography>
            <Typography variant="h5" component="h2">
              {activeStep === 0 ? 'Choose your website style' : 'Choose your web address'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {activeStep === 0
                ? 'Select the design that best represents your work. You can preview every option below.'
                : 'Pick a memorable address for your portfolio. We will check it before publishing.'}
            </Typography>
          </Box>
          <Chip
            label={activeStep === 0 ? 'Design' : 'Web address'}
            color="primary"
            variant="outlined"
          />
        </Stack>

        {activeStep === 0 ? (
          <>
            <WebsiteThemeSelector selectedTheme={selectedTheme} onChange={onThemeChange} />
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <PagePrimaryButton onClick={() => onStepChange(1)}>Continue</PagePrimaryButton>
            </Stack>
          </>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                autoFocus
                label="Portfolio address"
                value={subdomain}
                onChange={onSubdomainChange}
                helperText={
                  subdomainError ??
                  'Use at least 3 letters, numbers, or hyphens. Enter only the first part of the address.'
                }
                error={subdomainAvailable === false || Boolean(subdomainError)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography color="text.secondary">.yarba.app</Typography>
                        {isCheckingSubdomain ? (
                          <CircularProgress size={18} />
                        ) : subdomainAvailable === true ? (
                          <CheckCircleOutline color="success" fontSize="small" />
                        ) : subdomainAvailable === false ? (
                          <ErrorOutline color="error" fontSize="small" />
                        ) : null}
                      </Stack>
                    </InputAdornment>
                  ),
                }}
              />

              {suggestedSubdomains.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Available alternatives
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {suggestedSubdomains.map((suggestion) => (
                      <Chip
                        key={suggestion}
                        label={`${suggestion}.yarba.app`}
                        onClick={() => onSuggestedSubdomain(suggestion)}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              <Alert severity="info" sx={{ mt: 3 }}>
                Publishing makes selected portfolio information public and may allow search engines
                and other people to copy it.
              </Alert>
              <FormControlLabel
                sx={{ mt: 1, alignItems: 'flex-start' }}
                control={
                  <Checkbox
                    checked={policyConfirmed}
                    onChange={(event) => onPolicyConfirmedChange(event.target.checked)}
                    disabled={isLoading}
                  />
                }
                label={
                  <>
                    I confirm this site follows the{' '}
                    <Link
                      component={RouterLink}
                      to="/acceptable-use"
                      target="_blank"
                      rel="noopener"
                    >
                      Acceptable Use Policy
                    </Link>{' '}
                    and I have permission to publish its content.
                  </>
                }
              />

              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                <Button onClick={() => onStepChange(0)} disabled={isLoading}>
                  Back
                </Button>
                <PagePrimaryButton
                  onClick={onPublish}
                  disabled={
                    isLoading || !subdomain || subdomainAvailable !== true || !policyConfirmed
                  }
                  startIcon={isLoading ? <CircularProgress size={18} /> : <Language />}
                >
                  {isLoading ? 'Publishing…' : 'Publish website'}
                </PagePrimaryButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'action.hover' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Publishing summary
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {selectedThemeOption.name} theme
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {selectedThemeOption.description}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  {subdomain ? `${subdomain}.yarba.app` : 'Your address will appear here'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>
    </>
  );
};

export default WebsiteSetupPanel;
