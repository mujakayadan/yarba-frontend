import type { Profile } from './models';

export interface ProfileViewTabProps {
  profile: Profile;
  userEmail?: string;
  imageVersion: number;
  onOpenUploadDialog: (type: 'profile' | 'signature') => void;
  onDeleteProfilePicture: () => void;
  onDeleteSignature: () => void;
}
