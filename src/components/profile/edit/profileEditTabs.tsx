import type { ComponentType } from 'react';
import {
  AccountCircle as PersonalIcon,
  AutoStories as StoryIcon,
  Image as MediaIcon,
  Settings as PreferencesIcon,
  Work as ApplicationsIcon,
} from '@mui/icons-material';
import type { ProfileEditTabProps } from '../../../types/profileEdit';
import type { IconTabBarItem } from '../../common/IconTabBar';
import { PersonalInfoEditTab } from './PersonalInfoEditTab';
import { PreferencesEditTab } from './PreferencesEditTab';
import { LifeStoryEditTab } from './LifeStoryEditTab';
import { ProfileMediaEditTab } from './ProfileMediaEditTab';
import { ApplicationPreferencesEditTab } from './ApplicationPreferencesEditTab';

export interface ProfileEditTabConfig extends IconTabBarItem {
  Tab: ComponentType<ProfileEditTabProps>;
}

export const PROFILE_EDIT_TABS: readonly ProfileEditTabConfig[] = [
  {
    label: 'Personal information',
    icon: PersonalIcon,
    Tab: PersonalInfoEditTab,
  },
  {
    label: 'AI & document defaults',
    icon: PreferencesIcon,
    Tab: PreferencesEditTab,
  },
  {
    label: 'Story & voice',
    icon: StoryIcon,
    Tab: LifeStoryEditTab,
  },
  {
    label: 'Picture & signature',
    icon: MediaIcon,
    Tab: ProfileMediaEditTab,
  },
  {
    label: 'Application automation',
    icon: ApplicationsIcon,
    Tab: ApplicationPreferencesEditTab,
  },
];
