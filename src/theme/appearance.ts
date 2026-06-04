import type { Profile } from '../types/models';

export type AppearanceMode = 'default' | 'light' | 'dark';

export const APPEARANCE_MODE_LABELS: Record<AppearanceMode, string> = {
  default: 'Default',
  light: 'Light',
  dark: 'Dark',
};

export type NavVariant = 'gradient' | 'neutral';

const isAppearanceMode = (value: unknown): value is AppearanceMode =>
  value === 'default' || value === 'light' || value === 'dark';

export const resolveAppearanceMode = (
  features?: NonNullable<Profile['system_preferences']>['features']
): AppearanceMode => {
  if (features && isAppearanceMode(features.theme_mode)) {
    return features.theme_mode;
  }
  if (features?.dark_mode) {
    return 'dark';
  }
  return 'default';
};

export const getPaletteMode = (appearance: AppearanceMode): 'light' | 'dark' =>
  appearance === 'dark' ? 'dark' : 'light';

export const getNavVariant = (appearance: AppearanceMode): NavVariant =>
  appearance === 'default' ? 'gradient' : 'neutral';

export const buildAppearanceFeaturesPatch = (
  current: NonNullable<Profile['system_preferences']>['features'] | undefined,
  theme_mode: AppearanceMode
) => ({
  check_clearance: current?.check_clearance ?? true,
  auto_save: current?.auto_save ?? true,
  theme_mode,
  dark_mode: theme_mode === 'dark',
});
