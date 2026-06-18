import React from 'react';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import type { ProfileViewTabProps } from '../../../types/profileView';
import {
  useApplicationPreferences,
  useApplyCredentialsStatus,
  useDemographics,
} from '../../../hooks/useApplicationPreferences';

const formatBool = (value: boolean | null | undefined) => {
  if (value === true) {
    return 'Yes';
  }
  if (value === false) {
    return 'No';
  }
  return 'Not specified';
};

const formatValue = (value: string | null | undefined) => value?.trim() || 'Not specified';

const FieldRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

const formatEnum = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export const ApplicationPreferencesViewTab: React.FC<ProfileViewTabProps> = () => {
  const { data: preferences, isLoading } = useApplicationPreferences();
  const consented = preferences?.demographic_consent.consented ?? false;
  const { data: demographics, isLoading: demographicsLoading } = useDemographics(consented);
  const { data: applyCredentialsStatus } = useApplyCredentialsStatus();

  if (isLoading || !preferences) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { work_eligibility, logistics, demographic_consent } = preferences;

  return (
    <>
      <Typography variant="body2" color="text.secondary" paragraph>
        Eligibility and logistics answers used when automation agents fill applications on your
        behalf.
      </Typography>

      <Typography variant="h6" gutterBottom>
        Work eligibility
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <FieldRow
            label="Authorized to work"
            value={formatBool(work_eligibility.authorized_to_work)}
          />
          <FieldRow label="Over 18" value={formatBool(work_eligibility.over_18)} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldRow
            label="Requires sponsorship"
            value={formatBool(work_eligibility.requires_sponsorship)}
          />
          <FieldRow
            label="Willing to relocate"
            value={formatBool(work_eligibility.willing_to_relocate)}
          />
        </Box>
      </Stack>

      <Typography variant="h6" gutterBottom>
        Logistics
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <FieldRow label="Desired salary" value={formatValue(logistics.desired_salary)} />
          <FieldRow label="Notice period" value={formatValue(logistics.notice_period)} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldRow
            label="Earliest start date"
            value={formatValue(logistics.earliest_start_date)}
          />
          <FieldRow label="Referral source" value={formatValue(logistics.referral_source)} />
        </Box>
      </Stack>

      <Typography variant="h6" gutterBottom>
        Careers-site password
      </Typography>
      <FieldRow
        label="Status"
        value={applyCredentialsStatus?.configured ? 'Configured' : 'Not set'}
      />

      <Typography variant="h6" gutterBottom>
        EEO / demographics
      </Typography>

      {!demographic_consent.consented ? (
        <Alert severity="info">
          Demographic autofill is disabled. Enable consent on the edit tab if you want agents to use
          encrypted EEO data.
        </Alert>
      ) : demographicsLoading ? (
        <CircularProgress size={24} />
      ) : demographics ? (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <FieldRow label="Gender" value={formatEnum(demographics.gender)} />
            <FieldRow
              label="Race / ethnicity"
              value={
                demographics.race_ethnicity.length > 0
                  ? demographics.race_ethnicity.join(', ')
                  : 'Not specified'
              }
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <FieldRow label="Veteran status" value={formatEnum(demographics.veteran_status)} />
            <FieldRow
              label="Disability status"
              value={formatEnum(demographics.disability_status)}
            />
          </Box>
        </Stack>
      ) : (
        <Alert severity="info">
          Consent is enabled but no demographic data has been saved yet.
        </Alert>
      )}
    </>
  );
};
