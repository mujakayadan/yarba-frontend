import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Profile } from '../../types/models';
import { useAuth } from '../../contexts/AuthContext';
import { useDeferredTabs } from '../../hooks/useDeferredTabs';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useProfileMutations } from '../../hooks/useProfileMutations';
import { TabPanelFallback, TAB_PANEL_MIN_HEIGHT } from '../../components/common/DeferredTabPanel';
import { EditPageActionBar } from '../../components/common/EditPageActionBar';
import { IconTabBar } from '../../components/common/IconTabBar';
import { PageLoadingState, PageErrorState } from '../../components/common/PageState';
import { useToast } from '../../contexts/ToastContext';
import { PROFILE_EDIT_TABS } from '../../components/profile/edit/profileEditTabs';
import type { ProfileEditTabProps, ProfilePreferencesForm } from '../../types/profileEdit';
import {
  emptyPersonalInfo,
  seedPersonalInfoFromProfile,
  seedPreferencesFromProfile,
} from '../../utils/profileFormSeed';
import { buildAppearanceFeaturesPatch } from '../../theme/appearance';
import { parseTabIndex, tabSearchParam } from '../../utils/tabUrl';
import { extractApiErrorMessage } from '../../utils/apiErrors';
import { createDebugger } from '../../utils/debug';
import type { ProfilePersonalInfoForm } from '../../types/profileEdit';

const debug = createDebugger('ProfileEditPage');

const MEDIA_TAB_INDEX = PROFILE_EDIT_TABS.length - 2;
const APPLICATION_TAB_INDEX = PROFILE_EDIT_TABS.length - 1;

interface ProfileEditPageProps {
  embedded?: boolean;
  sectionIndex?: number;
  onDirtyChange?: (dirty: boolean) => void;
}

const ProfileEditPage: React.FC<ProfileEditPageProps> = ({
  embedded = false,
  sectionIndex,
  onDirtyChange,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const initialTab = parseTabIndex(searchParams.get('tab'), PROFILE_EDIT_TABS.length - 1);
  const { tabValue, renderedTab, isTabPending, handleTabChange } = useDeferredTabs(initialTab);
  const { data: profile, isLoading: profileLoading, isError } = useUserProfile();
  const {
    updatePersonalInfo,
    updateLifeStoryMutation,
    updatePromptPrefs,
    updateSystemPrefs,
    uploadPicture,
    deletePicture,
    uploadSignatureMutation,
    deleteSignatureMutation,
  } = useProfileMutations();

  const [loading, setLoading] = useState(false);
  const [formSeeded, setFormSeeded] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'profile' | 'signature' | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageVersion, setImageVersion] = useState<number>(Date.now());
  const [isDirty, setIsDirty] = useState(false);
  const [pendingMediaDelete, setPendingMediaDelete] = useState<'profile' | 'signature' | null>(
    null
  );
  const [personalInfoErrors, setPersonalInfoErrors] = useState<
    Partial<Record<keyof ProfilePersonalInfoForm, string>>
  >({});

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

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    setPersonalInfoErrors((prev) => ({ ...prev, [name]: undefined }));
    setIsDirty(true);
  };

  const handleLifeStoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLifeStory(e.target.value);
    setIsDirty(true);
  };

  const handlePreferenceChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: checked }));
    setIsDirty(true);
  };

  const handleOpenUploadDialog = (type: 'profile' | 'signature') => {
    setUploadType(type);
    setOpenDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadType) {
      return;
    }

    setMediaError(null);
    try {
      if (uploadType === 'profile') {
        await uploadPicture.mutateAsync(selectedFile);
        showSuccess('Profile picture updated successfully!');
      } else {
        await uploadSignatureMutation.mutateAsync(selectedFile);
        showSuccess('Signature updated successfully!');
      }
      setImageVersion(Date.now());
      handleCloseUploadDialog();
    } catch (err) {
      debug.error(
        `Failed to upload ${uploadType === 'profile' ? 'profile picture' : 'signature'}:`,
        err
      );
      setMediaError(
        `Failed to upload ${uploadType === 'profile' ? 'profile picture' : 'signature'}. Please try again.`
      );
    }
  };

  const handleDeleteProfilePicture = async () => {
    setMediaError(null);
    try {
      await deletePicture.mutateAsync();
      setImageVersion(Date.now());
      showSuccess('Profile picture removed successfully!');
    } catch (err) {
      debug.error('Failed to delete profile picture:', err);
      setMediaError('Failed to delete profile picture. Please try again.');
    }
  };

  const handleDeleteSignature = async () => {
    setMediaError(null);
    try {
      await deleteSignatureMutation.mutateAsync();
      setImageVersion(Date.now());
      showSuccess('Signature removed successfully!');
    } catch (err) {
      debug.error('Failed to delete signature:', err);
      setMediaError('Failed to delete signature. Please try again.');
    }
  };

  const tabProps: ProfileEditTabProps = {
    personalInfo,
    personalInfoErrors,
    onPersonalInfoChange: handlePersonalInfoChange,
    lifeStory,
    onLifeStoryChange: handleLifeStoryChange,
    preferences,
    onPreferenceChange: handlePreferenceChange,
    onNumberInputChange: handleNumberInputChange,
    onSwitchChange: handleSwitchChange,
    profile: profile ?? undefined,
    userEmail: user?.email,
    imageVersion,
    onOpenUploadDialog: handleOpenUploadDialog,
    onDeleteProfilePicture: () => setPendingMediaDelete('profile'),
    onDeleteSignature: () => setPendingMediaDelete('signature'),
  };

  const activeTabValue = sectionIndex ?? tabValue;
  const activeRenderedTab = sectionIndex ?? renderedTab;
  const ActiveTab = PROFILE_EDIT_TABS[activeRenderedTab]?.Tab;
  const uploading = uploadPicture.isPending || uploadSignatureMutation.isPending;
  const isMediaTab = activeTabValue === MEDIA_TAB_INDEX;
  const isSelfSavingTab = isMediaTab || activeTabValue === APPLICATION_TAB_INDEX;

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
        ...buildAppearanceFeaturesPatch(
          {
            check_clearance: preferences.feature_check_clearance,
            auto_save: preferences.feature_auto_save,
            dark_mode: preferences.theme_mode === 'dark',
          },
          preferences.theme_mode
        ),
      },
      templates: {
        default_resume_template_id: preferences.default_resume_template_id,
        default_cover_letter_template_id: preferences.default_cover_letter_template_id,
      },
      ...(profile?.system_preferences?.llm && { llm: profile.system_preferences.llm }),
      ...(profile?.system_preferences?.privacy && {
        privacy: profile.system_preferences.privacy,
      }),
      ...(profile?.system_preferences?.notifications && {
        notifications: profile.system_preferences.notifications,
      }),
    };

    await updatePromptPrefs.mutateAsync(promptPreferencesData);
    await updateSystemPrefs.mutateAsync(systemPreferencesData);
    showSuccess('Preferences updated successfully!');
  };

  const handleSave = async () => {
    if (isSelfSavingTab) {
      return;
    }

    setLoading(true);

    try {
      if (activeTabValue === 0) {
        const nextErrors: Partial<Record<keyof ProfilePersonalInfoForm, string>> = {};
        if (!personalInfo.full_name.trim()) {
          nextErrors.full_name = 'Enter the name you want shown on applications.';
        }
        if (!personalInfo.email.trim()) {
          nextErrors.email = 'Enter your primary contact email.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
          nextErrors.email = 'Enter a valid email address.';
        }
        if (Object.keys(nextErrors).length > 0) {
          setPersonalInfoErrors(nextErrors);
          setLoading(false);
          return;
        }
        await updatePersonalInfo.mutateAsync({
          full_name: personalInfo.full_name,
          email: personalInfo.email,
          phone: personalInfo.phone,
          address: personalInfo.address,
          linkedin: personalInfo.linkedin,
          github: personalInfo.github,
          website: personalInfo.website,
          calendly_url: personalInfo.calendly_url || undefined,
        });
        showSuccess('Personal information updated successfully!');
        setIsDirty(false);
        if (!embedded) {
          navigate(`/profile${tabSearchParam(activeTabValue)}`);
        }
      } else if (activeTabValue === 1) {
        await handleSavePreferences();
        setIsDirty(false);
        if (!embedded) {
          navigate(`/profile${tabSearchParam(activeTabValue)}`);
        }
      } else if (activeTabValue === 2) {
        await updateLifeStoryMutation.mutateAsync(lifeStory);
        showSuccess('Life story updated successfully!');
        setIsDirty(false);
        if (!embedded) {
          navigate(`/profile${tabSearchParam(activeTabValue)}`);
        }
      }
    } catch (err: unknown) {
      debug.error('Failed to update profile:', err);
      showError(extractApiErrorMessage(err, 'Failed to update profile. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(embedded ? '/settings/personal' : `/profile${tabSearchParam(activeTabValue)}`);
  };

  if (profileLoading) {
    return <PageLoadingState />;
  }

  if (isError || !profile) {
    return (
      <PageErrorState
        title="Edit Profile"
        message="Unable to load profile information. Please try again later."
        backLabel="Back to Profile"
        onBack={handleCancel}
      />
    );
  }

  return (
    <Box sx={{ width: '100%', p: embedded ? 0 : 3 }}>
      {!embedded && (
        <EditPageActionBar
          backLabel="Back to Profile"
          onBack={handleCancel}
          onSave={handleSave}
          saving={loading}
          showSave={!isSelfSavingTab}
        />
      )}

      {embedded && !isSelfSavingTab && (
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            p: 1.5,
            mb: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Changes in this section are saved together.
          </Typography>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || !isDirty}
            sx={{ minWidth: 152 }}
          >
            {loading ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'}
          </Button>
        </Box>
      )}

      {isMediaTab && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Profile picture and signature uploads save immediately. Use the upload and delete controls
          in this tab.
        </Alert>
      )}

      {activeTabValue === APPLICATION_TAB_INDEX && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Application settings save using the buttons within this tab.
        </Alert>
      )}

      {mediaError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {mediaError}
        </Alert>
      )}

      <Paper
        elevation={embedded ? 0 : 1}
        variant={embedded ? 'outlined' : undefined}
        sx={{ mb: embedded ? 2 : 4, borderRadius: 2, overflow: 'hidden' }}
      >
        {!embedded && (
          <IconTabBar
            tabValue={tabValue}
            onChange={handleTabChange}
            tabs={PROFILE_EDIT_TABS}
            idPrefix="profile-edit"
            ariaLabel="profile edit tabs"
          />
        )}

        <div
          role="tabpanel"
          id={`profile-edit-tabpanel-${activeRenderedTab}`}
          aria-labelledby={embedded ? undefined : `profile-edit-tab-${activeRenderedTab}`}
          aria-busy={embedded ? false : isTabPending}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              minHeight: embedded ? 0 : TAB_PANEL_MIN_HEIGHT,
              opacity: !embedded && isTabPending ? 0.6 : 1,
              transition: 'opacity 150ms',
              '& .MuiFormHelperText-root': {
                fontSize: '0.75rem',
                lineHeight: 1.4,
              },
            }}
          >
            {ActiveTab && (
              <Suspense fallback={<TabPanelFallback />}>
                <ActiveTab {...tabProps} />
              </Suspense>
            )}
          </Box>
        </div>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseUploadDialog}>
        <DialogTitle>
          {uploadType === 'profile' ? 'Upload Profile Picture' : 'Upload Signature'}
          <IconButton
            aria-label="close"
            onClick={handleCloseUploadDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="profile-file-upload">
              <Button variant="outlined" component="span">
                Choose File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            variant="contained"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={pendingMediaDelete !== null} onClose={() => setPendingMediaDelete(null)}>
        <DialogTitle>
          Remove {pendingMediaDelete === 'profile' ? 'profile picture' : 'signature'}?
        </DialogTitle>
        <DialogContent>
          <Typography>
            This removes the image from Yarba and from future generated documents. You can upload a
            replacement later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingMediaDelete(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (pendingMediaDelete === 'profile') {
                await handleDeleteProfilePicture();
              } else if (pendingMediaDelete === 'signature') {
                await handleDeleteSignature();
              }
              setPendingMediaDelete(null);
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileEditPage;
