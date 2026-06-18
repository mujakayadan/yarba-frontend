import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Save as SaveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { ProfileEditTabProps } from '../../../types/profileEdit';
import { EditSectionHeader } from './EditSectionHeader';
import { useToast } from '../../../contexts/ToastContext';
import {
  useApplicationPreferences,
  useApplicationPreferencesMutations,
  useApplyCredentialsStatus,
  useDemographics,
} from '../../../hooks/useApplicationPreferences';
import { extractApiErrorMessage } from '../../../utils/apiErrors';
import type {
  Demographics,
  DisabilityStatus,
  GenderIdentity,
  LogisticsPreferences,
  VeteranStatus,
  WorkEligibility,
} from '../../../types/application';

type TriState = '' | 'true' | 'false';

const triStateToBool = (value: TriState): boolean | null => {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return null;
};

const boolToTriState = (value: boolean | null | undefined): TriState => {
  if (value === true) {
    return 'true';
  }
  if (value === false) {
    return 'false';
  }
  return '';
};

const TriStateSelect: React.FC<{
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
  helperText?: string;
}> = ({ label, value, onChange, helperText }) => (
  <FormControl fullWidth margin="normal">
    <InputLabel id={`${label}-label`}>{label}</InputLabel>
    <Select
      labelId={`${label}-label`}
      value={value}
      label={label}
      onChange={(e) => onChange(e.target.value as TriState)}
    >
      <MenuItem value="">Not specified</MenuItem>
      <MenuItem value="true">Yes</MenuItem>
      <MenuItem value="false">No</MenuItem>
    </Select>
    {helperText && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
);

const emptyDemographics = (): Demographics => ({
  gender: 'decline_to_answer',
  race_ethnicity: [],
  veteran_status: 'decline_to_answer',
  disability_status: 'decline_to_answer',
});

export const ApplicationPreferencesEditTab: React.FC<ProfileEditTabProps> = () => {
  const { showSuccess, showError } = useToast();
  const { data: preferences, isLoading } = useApplicationPreferences();
  const consented = preferences?.demographic_consent.consented ?? false;
  const { data: demographicsData } = useDemographics(consented);
  const { data: applyCredentialsStatus } = useApplyCredentialsStatus();
  const {
    updatePreferencesMutation,
    updateConsentMutation,
    updateDemographicsMutation,
    deleteDemographicsMutation,
    updateApplyCredentialsMutation,
    deleteApplyCredentialsMutation,
  } = useApplicationPreferencesMutations();

  const [workEligibility, setWorkEligibility] = useState<WorkEligibility>({
    authorized_to_work: null,
    requires_sponsorship: null,
    over_18: null,
    willing_to_relocate: null,
  });
  const [logistics, setLogistics] = useState<LogisticsPreferences>({
    desired_salary: null,
    earliest_start_date: null,
    notice_period: null,
    referral_source: null,
  });
  const [demographics, setDemographics] = useState<Demographics>(emptyDemographics());
  const [raceEthnicityText, setRaceEthnicityText] = useState('');
  const [applyPassword, setApplyPassword] = useState('');
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (preferences && !seeded) {
      setWorkEligibility(preferences.work_eligibility);
      setLogistics(preferences.logistics);
      setSeeded(true);
    }
  }, [preferences, seeded]);

  useEffect(() => {
    if (demographicsData) {
      setDemographics(demographicsData);
      setRaceEthnicityText(demographicsData.race_ethnicity.join(', '));
    } else if (!consented) {
      setDemographics(emptyDemographics());
      setRaceEthnicityText('');
    }
  }, [demographicsData, consented]);

  const handleSaveEligibilityAndLogistics = async () => {
    try {
      await updatePreferencesMutation.mutateAsync({
        work_eligibility: workEligibility,
        logistics,
      });
      showSuccess('Application preferences saved');
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to save application preferences'));
    }
  };

  const handleConsentChange = async (checked: boolean) => {
    try {
      await updateConsentMutation.mutateAsync(checked);
      showSuccess(checked ? 'Demographic consent granted' : 'Demographic consent withdrawn');
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to update consent'));
    }
  };

  const handleSaveDemographics = async () => {
    try {
      await updateDemographicsMutation.mutateAsync({
        ...demographics,
        race_ethnicity: raceEthnicityText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      showSuccess('Demographics saved');
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to save demographics'));
    }
  };

  const handleDeleteDemographics = async () => {
    try {
      await deleteDemographicsMutation.mutateAsync();
      setDemographics(emptyDemographics());
      setRaceEthnicityText('');
      showSuccess('Demographics deleted');
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to delete demographics'));
    }
  };

  const handleSaveApplyCredentials = async () => {
    if (applyPassword.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }
    try {
      await updateApplyCredentialsMutation.mutateAsync(applyPassword);
      setApplyPassword('');
      showSuccess('Careers-site password saved');
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to save apply credentials'));
    }
  };

  const handleDeleteApplyCredentials = async () => {
    try {
      await deleteApplyCredentialsMutation.mutateAsync();
      setApplyPassword('');
      showSuccess('Careers-site password removed');
    } catch (err) {
      showError(extractApiErrorMessage(err, 'Failed to remove apply credentials'));
    }
  };

  if (isLoading || !preferences) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const savingPrefs = updatePreferencesMutation.isPending;
  const savingDemographics = updateDemographicsMutation.isPending;
  const savingApplyCredentials = updateApplyCredentialsMutation.isPending;
  const applyCredentialsConfigured = applyCredentialsStatus?.configured ?? false;

  return (
    <>
      <Typography variant="body2" color="text.secondary" paragraph>
        These answers are used when automation agents fill job applications. Only provide truthful
        information — agents will never invent legal, eligibility, or EEO answers.
      </Typography>

      <EditSectionHeader
        first
        title="Work eligibility"
        description="Common yes/no questions on application forms."
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <TriStateSelect
            label="Authorized to work"
            value={boolToTriState(workEligibility.authorized_to_work)}
            onChange={(value) =>
              setWorkEligibility((prev) => ({
                ...prev,
                authorized_to_work: triStateToBool(value),
              }))
            }
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TriStateSelect
            label="Requires sponsorship"
            value={boolToTriState(workEligibility.requires_sponsorship)}
            onChange={(value) =>
              setWorkEligibility((prev) => ({
                ...prev,
                requires_sponsorship: triStateToBool(value),
              }))
            }
          />
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <TriStateSelect
            label="Over 18"
            value={boolToTriState(workEligibility.over_18)}
            onChange={(value) =>
              setWorkEligibility((prev) => ({
                ...prev,
                over_18: triStateToBool(value),
              }))
            }
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TriStateSelect
            label="Willing to relocate"
            value={boolToTriState(workEligibility.willing_to_relocate)}
            onChange={(value) =>
              setWorkEligibility((prev) => ({
                ...prev,
                willing_to_relocate: triStateToBool(value),
              }))
            }
          />
        </Box>
      </Stack>

      <EditSectionHeader
        title="Logistics"
        description="Salary expectations, start date, and similar non-sensitive details."
      />

      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Desired salary"
          value={logistics.desired_salary ?? ''}
          onChange={(e) =>
            setLogistics((prev) => ({ ...prev, desired_salary: e.target.value || null }))
          }
          fullWidth
        />
        <TextField
          label="Earliest start date"
          value={logistics.earliest_start_date ?? ''}
          onChange={(e) =>
            setLogistics((prev) => ({ ...prev, earliest_start_date: e.target.value || null }))
          }
          fullWidth
          placeholder="e.g. 2026-07-01 or 2 weeks notice"
        />
        <TextField
          label="Notice period"
          value={logistics.notice_period ?? ''}
          onChange={(e) =>
            setLogistics((prev) => ({ ...prev, notice_period: e.target.value || null }))
          }
          fullWidth
        />
        <TextField
          label="Referral source"
          value={logistics.referral_source ?? ''}
          onChange={(e) =>
            setLogistics((prev) => ({ ...prev, referral_source: e.target.value || null }))
          }
          fullWidth
        />
      </Stack>

      <Button
        variant="contained"
        startIcon={savingPrefs ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
        onClick={handleSaveEligibilityAndLogistics}
        disabled={savingPrefs}
        sx={{ mb: 4 }}
      >
        Save eligibility & logistics
      </Button>

      <EditSectionHeader
        title="Careers-site password"
        description="Password used when automation creates or signs in to employer accounts (e.g. Workday). Stored encrypted. Agent tokens need the apply-credentials scope to use it."
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        {applyCredentialsConfigured
          ? 'A password is saved. Enter a new one below to replace it.'
          : 'No careers-site password saved yet.'}
      </Alert>

      <TextField
        label="Careers-site password"
        type="password"
        value={applyPassword}
        onChange={(e) => setApplyPassword(e.target.value)}
        fullWidth
        autoComplete="new-password"
        helperText="Minimum 8 characters. Used for automated account creation and sign-in."
      />

      <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={
            savingApplyCredentials ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />
          }
          onClick={handleSaveApplyCredentials}
          disabled={savingApplyCredentials || applyPassword.length === 0}
        >
          Save password
        </Button>
        {applyCredentialsConfigured && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteApplyCredentials}
            disabled={deleteApplyCredentialsMutation.isPending}
          >
            Remove password
          </Button>
        )}
      </Stack>

      <EditSectionHeader
        title="EEO / demographics"
        description="Optional self-identification data, stored encrypted on the server. Agents only receive this if you consent and grant the demographics scope on an agent token."
      />

      <Alert severity="warning" sx={{ mb: 2 }}>
        Demographic data is sensitive. Enable consent only if you want automation agents to autofill
        EEO questions on your behalf.
      </Alert>

      <FormControlLabel
        control={
          <Switch
            checked={consented}
            onChange={(e) => handleConsentChange(e.target.checked)}
            disabled={updateConsentMutation.isPending}
          />
        }
        label="I consent to storing encrypted demographic data for job application autofill"
      />

      {consented && (
        <Box sx={{ mt: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                value={demographics.gender}
                label="Gender"
                onChange={(e) =>
                  setDemographics((prev) => ({
                    ...prev,
                    gender: e.target.value as GenderIdentity,
                  }))
                }
              >
                <MenuItem value="decline_to_answer">Decline to answer</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="nonbinary">Non-binary</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="veteran-label">Veteran status</InputLabel>
              <Select
                labelId="veteran-label"
                value={demographics.veteran_status}
                label="Veteran status"
                onChange={(e) =>
                  setDemographics((prev) => ({
                    ...prev,
                    veteran_status: e.target.value as VeteranStatus,
                  }))
                }
              >
                <MenuItem value="decline_to_answer">Decline to answer</MenuItem>
                <MenuItem value="not_a_veteran">Not a veteran</MenuItem>
                <MenuItem value="veteran">Veteran</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <FormControl fullWidth margin="normal">
            <InputLabel id="disability-label">Disability status</InputLabel>
            <Select
              labelId="disability-label"
              value={demographics.disability_status}
              label="Disability status"
              onChange={(e) =>
                setDemographics((prev) => ({
                  ...prev,
                  disability_status: e.target.value as DisabilityStatus,
                }))
              }
            >
              <MenuItem value="decline_to_answer">Decline to answer</MenuItem>
              <MenuItem value="no">No</MenuItem>
              <MenuItem value="yes">Yes</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Race / ethnicity"
            value={raceEthnicityText}
            onChange={(e) => setRaceEthnicityText(e.target.value)}
            fullWidth
            margin="normal"
            helperText="Comma-separated values if a form allows multiple selections"
          />

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={
                savingDemographics ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />
              }
              onClick={handleSaveDemographics}
              disabled={savingDemographics}
            >
              Save demographics
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteDemographics}
              disabled={deleteDemographicsMutation.isPending}
            >
              Delete demographics
            </Button>
          </Stack>
        </Box>
      )}
    </>
  );
};
