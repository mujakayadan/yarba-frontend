import type { Profile } from '../types/models';
import type { ProfilePreferencesForm } from '../types/profileEdit';

export const emptyPersonalInfo = () => ({
  full_name: '',
  email: '',
  phone: '',
  address: '',
  linkedin: '',
  github: '',
  website: '',
});

export const seedPersonalInfoFromProfile = (profileData: Profile) => {
  if (!profileData.personal_information) {
    return emptyPersonalInfo();
  }
  const pi = profileData.personal_information;
  return {
    full_name: pi.full_name || '',
    email: pi.email || '',
    phone: pi.phone || '',
    address: pi.address || '',
    linkedin: pi.linkedin || '',
    github: pi.github || '',
    website: pi.website || '',
  };
};

export const seedPreferencesFromProfile = (profileData: Profile): ProfilePreferencesForm => ({
  career_summary_min_words:
    profileData.prompt_preferences?.career_summary?.min_words?.toString() || '',
  career_summary_max_words:
    profileData.prompt_preferences?.career_summary?.max_words?.toString() || '',
  work_experience_max_jobs:
    profileData.prompt_preferences?.work_experience?.max_jobs?.toString() || '',
  work_experience_bullet_points_per_job:
    profileData.prompt_preferences?.work_experience?.bullet_points_per_job?.toString() || '',
  project_max_projects: profileData.prompt_preferences?.project?.max_projects?.toString() || '',
  project_bullet_points_per_project:
    profileData.prompt_preferences?.project?.bullet_points_per_project?.toString() || '',
  cover_letter_paragraphs:
    profileData.prompt_preferences?.cover_letter?.paragraphs?.toString() || '',
  cover_letter_target_age:
    profileData.prompt_preferences?.cover_letter?.target_age?.toString() || '',
  skills_max_categories: profileData.prompt_preferences?.skills?.max_categories?.toString() || '',
  skills_min_per_category:
    profileData.prompt_preferences?.skills?.min_per_category?.toString() || '',
  skills_max_per_category:
    profileData.prompt_preferences?.skills?.max_per_category?.toString() || '',
  education_max_entries: profileData.prompt_preferences?.education?.max_entries?.toString() || '',
  education_max_courses: profileData.prompt_preferences?.education?.max_courses?.toString() || '',
  awards_max_awards: profileData.prompt_preferences?.awards?.max_awards?.toString() || '',
  publications_max_publications:
    profileData.prompt_preferences?.publications?.max_publications?.toString() || '',
  feature_check_clearance:
    profileData.system_preferences?.features?.check_clearance !== undefined
      ? profileData.system_preferences.features.check_clearance
      : true,
  feature_auto_save:
    profileData.system_preferences?.features?.auto_save !== undefined
      ? profileData.system_preferences.features.auto_save
      : true,
  feature_dark_mode:
    profileData.system_preferences?.features?.dark_mode !== undefined
      ? profileData.system_preferences.features.dark_mode
      : false,
  llm_model_name: profileData.system_preferences?.llm?.model_name || '',
  llm_temperature: profileData.system_preferences?.llm?.temperature?.toString() || '0.1',
  default_resume_template_id:
    profileData.system_preferences?.templates?.default_resume_template_id || 'classic',
  default_cover_letter_template_id:
    profileData.system_preferences?.templates?.default_cover_letter_template_id || 'standard',
});
