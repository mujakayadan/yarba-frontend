import { lazy, type ComponentType } from 'react';
import type { ProfileViewTabProps } from '../../../types/profileView';

export interface ProfileViewTabConfig {
  label: string;
  Tab: ComponentType<ProfileViewTabProps>;
}

const lazyTab = (
  loader: () => Promise<{ [key: string]: ComponentType<ProfileViewTabProps> }>,
  name: string
) => lazy(() => loader().then((module) => ({ default: module[name] })));

export const PROFILE_VIEW_TABS: readonly ProfileViewTabConfig[] = [
  {
    label: 'Personal Information',
    Tab: lazyTab(() => import('./PersonalInfoViewTab'), 'PersonalInfoViewTab'),
  },
  {
    label: 'Preferences',
    Tab: lazyTab(() => import('./PreferencesViewTab'), 'PreferencesViewTab'),
  },
  {
    label: 'Life Story',
    Tab: lazyTab(() => import('./LifeStoryViewTab'), 'LifeStoryViewTab'),
  },
  {
    label: 'Profile Picture & Signature',
    Tab: lazyTab(() => import('./ProfileMediaViewTab'), 'ProfileMediaViewTab'),
  },
];
