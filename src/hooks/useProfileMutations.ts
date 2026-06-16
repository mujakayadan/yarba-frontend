import { useMutation } from '@tanstack/react-query';
import { profileKeys } from '../lib/queryKeys';
import { queryClient } from '../providers/QueryProvider';
import {
  deleteProfilePicture,
  deleteSignature,
  updateLifeStory,
  updatePersonalInformation,
  updatePromptPreferences,
  updateSystemPreferences,
  uploadProfilePicture,
  uploadSignature,
} from '../services/profileService';
import { Profile } from '../types/models';

const invalidateProfile = () => {
  queryClient.invalidateQueries({ queryKey: profileKeys.all });
};

export const useProfileMutations = () => {
  const updatePersonalInfo = useMutation({
    mutationFn: updatePersonalInformation,
    onSuccess: invalidateProfile,
  });

  const updateLifeStoryMutation = useMutation({
    mutationFn: updateLifeStory,
    onSuccess: invalidateProfile,
  });

  const updatePromptPrefs = useMutation({
    mutationFn: (prefs: Partial<NonNullable<Profile['prompt_preferences']>>) =>
      updatePromptPreferences(prefs),
    onSuccess: invalidateProfile,
  });

  const updateSystemPrefs = useMutation({
    mutationFn: (prefs: Partial<NonNullable<Profile['system_preferences']>>) =>
      updateSystemPreferences(prefs),
    onSuccess: invalidateProfile,
  });

  const uploadPicture = useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: invalidateProfile,
  });

  const deletePicture = useMutation({
    mutationFn: deleteProfilePicture,
    onSuccess: invalidateProfile,
  });

  const uploadSignatureMutation = useMutation({
    mutationFn: uploadSignature,
    onSuccess: invalidateProfile,
  });

  const deleteSignatureMutation = useMutation({
    mutationFn: deleteSignature,
    onSuccess: invalidateProfile,
  });

  return {
    updatePersonalInfo,
    updateLifeStoryMutation,
    updatePromptPrefs,
    updateSystemPrefs,
    uploadPicture,
    deletePicture,
    uploadSignatureMutation,
    deleteSignatureMutation,
  };
};
