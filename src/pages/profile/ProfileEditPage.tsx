import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  SelectChangeEvent,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Profile } from '../../types/models';
import { useDeferredTabs } from '../../hooks/useDeferredTabs';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useProfileMutations } from '../../hooks/useProfileMutations';
import { TabPanelFallback } from '../../components/common/DeferredTabPanel';
import { PROFILE_EDIT_TABS } from '../../components/profile/edit/profileEditTabs';
import type { ProfileEditTabProps, ProfilePreferencesForm } from '../../types/profileEdit';
import {
  emptyPersonalInfo,
  seedPersonalInfoFromProfile,
  seedPreferencesFromProfile,
} from '../../utils/profileFormSeed';

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { tabValue, renderedTab, isTabPending, handleTabChange } = useDeferredTabs(0);
  const { data: profile, isLoading: profileLoading, isError } = useUserProfile();
  const { updatePersonalInfo, updateLifeStoryMutation, updatePromptPrefs, updateSystemPrefs } =
    useProfileMutations();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formSeeded, setFormSeeded] = useState(false);

  const [personalInfo, setPersonalInfo] = useState(emptyPersonalInfo());
  const [lifeStory, setLifeStory] = useState('');
  const [preferences, setPreferences] = useState<ProfilePreferencesForm>(
    seedPreferencesFromProfile({} as Profile)
  );

  const parseNumberOrDefault = (value: string, defaultValue: number = 0): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  useEffect(() => {
    if (profile && !formSeeded) {
      setPersonalInfo(seedPersonalInfoFromProfile(profile));
      setLifeStory(profile.life_story || '');
      setPreferences(seedPreferencesFromProfile(profile));
      setFormSeeded(true);
    }
  }, [profile, formSeeded]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleLifeStoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLifeStory(e.target.value);
  };

  const handlePreferenceChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: checked }));
  };

  const tabProps: ProfileEditTabProps = {
    personalInfo,
    onPersonalInfoChange: handlePersonalInfoChange,
    lifeStory,
    onLifeStoryChange: handleLifeStoryChange,
    preferences,
    onPreferenceChange: handlePreferenceChange,
    onNumberInputChange: handleNumberInputChange,
    onSwitchChange: handleSwitchChange,
  };

  const ActiveTab = PROFILE_EDIT_TABS[renderedTab]?.Tab;

  const handleSavePreferences = async () => {
    const promptPreferencesData: Partial<NonNullable<Profile['prompt_preferences']>> = {
      career_summary: {
        min_words: parseNumberOrDefault(preferences.career_summary_min_words),
        max_words: parseNumberOrDefault(preferences.career_summary_max_words),
      },
      work_experience: {
        max_jobs: parseNumberOrDefault(preferences.work_experience_max_jobs),
        bullet_points_per_job: parseNumberOrDefault(
          preferences.work_experience_bullet_points_per_job
        ),
      },
      project: {
        max_projects: parseNumberOrDefault(preferences.project_max_projects),
        bullet_points_per_project: parseNumberOrDefault(
          preferences.project_bullet_points_per_project
        ),
      },
      skills: {
        max_categories: parseNumberOrDefault(preferences.skills_max_categories),
        min_per_category: parseNumberOrDefault(preferences.skills_min_per_category),
        max_per_category: parseNumberOrDefault(preferences.skills_max_per_category),
      },
      education: {
        max_entries: parseNumberOrDefault(preferences.education_max_entries),
        max_courses: parseNumberOrDefault(preferences.education_max_courses),
      },
      cover_letter: {
        paragraphs: parseNumberOrDefault(preferences.cover_letter_paragraphs),
        target_age: parseNumberOrDefault(preferences.cover_letter_target_age),
      },
      awards: {
        max_awards: parseNumberOrDefault(preferences.awards_max_awards),
      },
      publications: {
        max_publications: parseNumberOrDefault(preferences.publications_max_publications),
      },
    };

    const systemPreferencesData: Partial<NonNullable<Profile['system_preferences']>> = {
      features: {
        check_clearance: preferences.feature_check_clearance,
        auto_save: preferences.feature_auto_save,
        dark_mode: preferences.feature_dark_mode,
      },
      llm: {
        model_name: preferences.llm_model_name,
        temperature: parseFloat(preferences.llm_temperature),
      },
      templates: {
        default_resume_template_id: preferences.default_resume_template_id,
        default_cover_letter_template_id: preferences.default_cover_letter_template_id,
      },
    };

    if (profile?.system_preferences?.privacy) {
      systemPreferencesData.privacy = profile.system_preferences.privacy;
    }
    if (profile?.system_preferences?.notifications) {
      systemPreferencesData.notifications = profile.system_preferences.notifications;
    }

    await updatePromptPrefs.mutateAsync(promptPreferencesData);
    await updateSystemPrefs.mutateAsync(systemPreferencesData);
    setSuccess('Preferences updated successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (tabValue === 0) {
        await updatePersonalInfo.mutateAsync({
          full_name: personalInfo.full_name,
          email: personalInfo.email,
          phone: personalInfo.phone,
          address: personalInfo.address,
          linkedin: personalInfo.linkedin,
          github: personalInfo.github,
          website: personalInfo.website,
        });
        setSuccess('Personal information updated successfully!');
        navigate('/profile');
      } else if (tabValue === 1) {
        await updateLifeStoryMutation.mutateAsync(lifeStory);
        setSuccess('Life story updated successfully!');
        navigate('/profile');
      } else if (tabValue === 2) {
        await handleSavePreferences();
      }
    } catch (err: unknown) {
      console.error('Failed to update profile:', err);
      const apiErr = err as { response?: { data?: { detail?: string } } };
      setError(apiErr.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (profileLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Unable to load profile information. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile edit tabs">
            {PROFILE_EDIT_TABS.map((tab, index) => (
              <Tab
                key={tab.label}
                label={tab.label}
                id={`profile-tab-${index}`}
                aria-controls={`profile-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <div
            role="tabpanel"
            id={`profile-tabpanel-${renderedTab}`}
            aria-labelledby={`profile-tab-${renderedTab}`}
            aria-busy={isTabPending}
          >
            <Box
              sx={{
                p: { xs: 1, sm: 2 },
                minHeight: 80,
                opacity: isTabPending ? 0.6 : 1,
                transition: 'opacity 150ms',
              }}
            >
              {ActiveTab && (
                <Suspense fallback={<TabPanelFallback />}>
                  <ActiveTab {...tabProps} />
                </Suspense>
              )}
            </Box>
          </div>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileEditPage;
