import type { Profile } from './models';

export interface ProfileViewTabProps {
  profile: Profile;
  userEmail?: string;
  imageVersion: string | number;
}
