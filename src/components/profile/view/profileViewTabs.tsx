import { lazy, type ComponentType } from 'react';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  AutoStories as LifeStoryIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import type { ProfileViewTabProps } from '../../../types/profileView';

export interface ProfileViewTabItem {
  label: string;
  icon: ComponentType;
}

export interface ProfileViewTabConfig extends ProfileViewTabItem {
  Tab: ComponentType<ProfileViewTabProps>;
}

const lazyTab = (
  loader: () => Promise<{ [key: string]: ComponentType<ProfileViewTabProps> }>,
  name: string
) => lazy(() => loader().then((module) => ({ default: module[name] })));

export const PROFILE_VIEW_TAB_ITEMS: readonly ProfileViewTabItem[] = [
  { label: 'Personal Information', icon: PersonIcon },
  { label: 'Preferences', icon: SettingsIcon },
  { label: 'Life Story', icon: LifeStoryIcon },
  { label: 'Profile Picture & Signature', icon: PhotoCameraIcon },
];

export const PROFILE_VIEW_TABS: readonly ProfileViewTabConfig[] = [
  {
    label: PROFILE_VIEW_TAB_ITEMS[0].label,
    icon: PROFILE_VIEW_TAB_ITEMS[0].icon,
    Tab: lazyTab(() => import('./PersonalInfoViewTab'), 'PersonalInfoViewTab'),
  },
  {
    label: PROFILE_VIEW_TAB_ITEMS[1].label,
    icon: PROFILE_VIEW_TAB_ITEMS[1].icon,
    Tab: lazyTab(() => import('./PreferencesViewTab'), 'PreferencesViewTab'),
  },
  {
    label: PROFILE_VIEW_TAB_ITEMS[2].label,
    icon: PROFILE_VIEW_TAB_ITEMS[2].icon,
    Tab: lazyTab(() => import('./LifeStoryViewTab'), 'LifeStoryViewTab'),
  },
  {
    label: PROFILE_VIEW_TAB_ITEMS[3].label,
    icon: PROFILE_VIEW_TAB_ITEMS[3].icon,
    Tab: lazyTab(() => import('./ProfileMediaViewTab'), 'ProfileMediaViewTab'),
  },
];
