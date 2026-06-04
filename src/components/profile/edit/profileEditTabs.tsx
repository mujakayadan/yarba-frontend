import { lazy, type ComponentType } from 'react';
import type { ProfileEditTabProps } from '../../../types/profileEdit';
import {
  PROFILE_VIEW_TAB_ITEMS,
  PROFILE_VIEW_TABS,
  type ProfileViewTabItem,
} from '../view/profileViewTabs';

export interface ProfileEditTabConfig extends ProfileViewTabItem {
  Tab: ComponentType<ProfileEditTabProps>;
}

const lazyTab = (
  loader: () => Promise<{ [key: string]: ComponentType<ProfileEditTabProps> }>,
  name: string
) => lazy(() => loader().then((module) => ({ default: module[name] })));

export const PROFILE_EDIT_TABS: readonly ProfileEditTabConfig[] = [
  {
    label: PROFILE_VIEW_TAB_ITEMS[0].label,
    icon: PROFILE_VIEW_TAB_ITEMS[0].icon,
    Tab: lazyTab(() => import('./PersonalInfoEditTab'), 'PersonalInfoEditTab'),
  },
  {
    label: PROFILE_VIEW_TAB_ITEMS[1].label,
    icon: PROFILE_VIEW_TAB_ITEMS[1].icon,
    Tab: lazyTab(() => import('./PreferencesEditTab'), 'PreferencesEditTab'),
  },
  {
    label: PROFILE_VIEW_TAB_ITEMS[2].label,
    icon: PROFILE_VIEW_TAB_ITEMS[2].icon,
    Tab: lazyTab(() => import('./LifeStoryEditTab'), 'LifeStoryEditTab'),
  },
  {
    label: PROFILE_VIEW_TAB_ITEMS[3].label,
    icon: PROFILE_VIEW_TAB_ITEMS[3].icon,
    Tab: lazyTab(() => import('./ProfileMediaEditTab'), 'ProfileMediaEditTab'),
  },
];

export { PROFILE_VIEW_TABS };
