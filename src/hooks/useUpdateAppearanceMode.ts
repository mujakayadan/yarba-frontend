import { useMutation } from '@tanstack/react-query';
import { profileKeys } from '../lib/queryKeys';
import { queryClient } from '../providers/QueryProvider';
import { updateSystemPreferences } from '../services/profileService';
import { Profile } from '../types/models';
import { type AppearanceMode, buildAppearanceFeaturesPatch } from '../theme/appearance';
import { useToast } from '../contexts/ToastContext';

export const useUpdateAppearanceMode = () => {
  const { showError } = useToast();

  return useMutation({
    mutationFn: async ({
      profile,
      theme_mode,
    }: {
      profile: Profile;
      theme_mode: AppearanceMode;
    }) => {
      const features = buildAppearanceFeaturesPatch(
        profile.system_preferences?.features,
        theme_mode
      );
      return updateSystemPreferences({
        features,
        ...(profile.system_preferences?.llm && { llm: profile.system_preferences.llm }),
        ...(profile.system_preferences?.templates && {
          templates: profile.system_preferences.templates,
        }),
        ...(profile.system_preferences?.privacy && {
          privacy: profile.system_preferences.privacy,
        }),
        ...(profile.system_preferences?.notifications && {
          notifications: profile.system_preferences.notifications,
        }),
      });
    },
    onMutate: async ({ profile, theme_mode }) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me() });
      const previous = queryClient.getQueryData<Profile>(profileKeys.me());
      if (previous) {
        queryClient.setQueryData<Profile>(profileKeys.me(), {
          ...previous,
          system_preferences: {
            ...previous.system_preferences,
            features: buildAppearanceFeaturesPatch(
              previous.system_preferences?.features,
              theme_mode
            ),
          },
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(profileKeys.me(), context.previous);
      }
      showError('Failed to update appearance. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
};
