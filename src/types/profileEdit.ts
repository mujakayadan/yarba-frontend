import type { SelectChangeEvent } from '@mui/material';
import type { Profile } from './models';

export interface ProfilePersonalInfoForm {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface ProfilePreferencesForm {
  career_summary_min_words: string;
  career_summary_max_words: string;
  work_experience_max_jobs: string;
  work_experience_bullet_points_per_job: string;
  project_max_projects: string;
  project_bullet_points_per_project: string;
  cover_letter_paragraphs: string;
  cover_letter_target_age: string;
  skills_max_categories: string;
  skills_min_per_category: string;
  skills_max_per_category: string;
  education_max_entries: string;
  education_max_courses: string;
  awards_max_awards: string;
  publications_max_publications: string;
  feature_check_clearance: boolean;
  feature_auto_save: boolean;
  feature_dark_mode: boolean;
  default_resume_template_id: string;
  default_cover_letter_template_id: string;
  llm_model_name: string;
  llm_temperature: string;
}

export interface ProfileEditTabProps {
  personalInfo: ProfilePersonalInfoForm;
  onPersonalInfoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lifeStory: string;
  onLifeStoryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  preferences: ProfilePreferencesForm;
  onPreferenceChange: (e: SelectChangeEvent) => void;
  onNumberInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profile?: Profile;
  userEmail?: string;
  imageVersion?: string | number;
  onOpenUploadDialog?: (type: 'profile' | 'signature') => void;
  onDeleteProfilePicture?: () => void;
  onDeleteSignature?: () => void;
}
