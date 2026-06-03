import { lazy, type ComponentType } from 'react';
import type { ProfileEditTabProps } from '../../../types/profileEdit';

export interface ProfileEditTabConfig {
  label: string;
  Tab: ComponentType<ProfileEditTabProps>;
}

const lazyTab = (
  loader: () => Promise<{ [key: string]: ComponentType<ProfileEditTabProps> }>,
  name: string
) => lazy(() => loader().then((module) => ({ default: module[name] })));

export const PROFILE_EDIT_TABS: readonly ProfileEditTabConfig[] = [
  {
    label: 'Personal Information',
    Tab: lazyTab(() => import('./PersonalInfoEditTab'), 'PersonalInfoEditTab'),
  },
  {
    label: 'Life Story',
    Tab: lazyTab(() => import('./LifeStoryEditTab'), 'LifeStoryEditTab'),
  },
  {
    label: 'Preferences',
    Tab: lazyTab(() => import('./PreferencesEditTab'), 'PreferencesEditTab'),
  },
];
