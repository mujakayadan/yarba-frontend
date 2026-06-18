import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../contexts/AuthContext';

import { applicationPreferencesKeys } from '../lib/queryKeys';

import {
  deleteApplyCredentials,
  deleteDemographics,
  getApplicationPreferences,
  getApplyCredentialsStatus,
  getDemographics,
  updateApplicationPreferences,
  updateApplyCredentials,
  updateDemographicConsent,
  updateDemographics,
} from '../services/profileService';

import type { Demographics, LogisticsPreferences, WorkEligibility } from '../types/application';

export const useApplicationPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: applicationPreferencesKeys.me(),

    queryFn: getApplicationPreferences,

    enabled: !!user,
  });
};

export const useDemographics = (enabled: boolean) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: applicationPreferencesKeys.demographics(),

    queryFn: getDemographics,

    enabled: !!user && enabled,

    retry: false,
  });
};

export const useApplyCredentialsStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: applicationPreferencesKeys.applyCredentials(),

    queryFn: getApplyCredentialsStatus,

    enabled: !!user,
  });
};

export const useApplicationPreferencesMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: applicationPreferencesKeys.all });
  };

  const updatePreferencesMutation = useMutation({
    mutationFn: (payload: {
      work_eligibility?: WorkEligibility;

      logistics?: LogisticsPreferences;
    }) => updateApplicationPreferences(payload),

    onSuccess: invalidate,
  });

  const updateConsentMutation = useMutation({
    mutationFn: (consented: boolean) => updateDemographicConsent(consented),

    onSuccess: invalidate,
  });

  const updateDemographicsMutation = useMutation({
    mutationFn: (payload: Demographics) => updateDemographics(payload),

    onSuccess: invalidate,
  });

  const deleteDemographicsMutation = useMutation({
    mutationFn: deleteDemographics,

    onSuccess: invalidate,
  });

  const updateApplyCredentialsMutation = useMutation({
    mutationFn: (password: string) => updateApplyCredentials(password),

    onSuccess: invalidate,
  });

  const deleteApplyCredentialsMutation = useMutation({
    mutationFn: deleteApplyCredentials,

    onSuccess: invalidate,
  });

  return {
    updatePreferencesMutation,

    updateConsentMutation,

    updateDemographicsMutation,

    deleteDemographicsMutation,

    updateApplyCredentialsMutation,

    deleteApplyCredentialsMutation,
  };
};
