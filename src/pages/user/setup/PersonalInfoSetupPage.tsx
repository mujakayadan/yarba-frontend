import Grid from '../../../mui/Grid';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { ProfilePictureUploadSection } from '../../../components/profile/ProfilePictureUploadSection';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../../contexts/ProfileContext';
import { useProfileMutations } from '../../../hooks/useProfileMutations';
import { extractApiErrorMessage } from '../../../utils/apiErrors';

interface PersonalInfoFormData {
  fullName: string;
  phone: string;
  address: string;
  website: string;
  linkedin: string;
  github: string;
}

const PersonalInfoSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updateUserSetupProgress } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const { uploadPicture, deletePicture } = useProfileMutations();
  const [formData, setFormData] = useState<PersonalInfoFormData>({
    fullName: user?.full_name || user?.username || '',
    phone: '',
    address: '',
    website: '',
    linkedin: '',
    github: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState(Date.now());

  const isFullNameEmpty = formData.fullName.trim() === '';
  const isMediaBusy = uploadPicture.isPending || deletePicture.isPending;
  const isFormBusy = saving || isMediaBusy;

  useEffect(() => {
    if (!profile || !user || profile.user_id !== user.id || !profile.personal_information) {
      return;
    }

    setFormData({
      fullName: profile.personal_information.full_name || user.full_name || '',
      phone: profile.personal_information.phone || '',
      address: profile.personal_information.address || '',
      website: profile.personal_information.website || '',
      linkedin: profile.personal_information.linkedin || '',
      github: profile.personal_information.github || '',
    });
  }, [profile, user]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const profileUpdateData = {
        personal_information: {
          full_name: formData.fullName,
          email: user?.email, // Email is usually not changed here
          phone: formData.phone,
          address: formData.address,
          website: formData.website,
          linkedin: formData.linkedin,
          github: formData.github,
        },
      };
      await updateProfile(profileUpdateData);
      await refreshProfile();
      return true;
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Failed to save personal information.'));
      setSaving(false);
      return false;
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    setError(null);
    try {
      await uploadPicture.mutateAsync(file);
      await refreshProfile();
      setImageVersion(Date.now());
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Failed to upload profile picture.'));
    }
  };

  const handleProfilePictureRemove = async () => {
    setError(null);
    try {
      await deletePicture.mutateAsync();
      await refreshProfile();
      setImageVersion(Date.now());
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Failed to remove profile picture.'));
    }
  };

  const handleSaveAndNext = async () => {
    setError(null); // Clear previous errors
    if (isFullNameEmpty) {
      setError('Full Name is required.');
      return;
    }
    setSaving(true); // Indicate that an operation is starting
    const savedSuccessfully = await handleSave(); // handleSave already sets setSaving(false) on error

    if (savedSuccessfully) {
      try {
        await updateUserSetupProgress({ current_setup_step: 2 });
        navigate('/user/setup/prompt-preferences'); // Navigate to the new prompt preferences page
      } catch (err: unknown) {
        setError(extractApiErrorMessage(err, 'Failed to proceed to the next step.'));
      } finally {
        setSaving(false); // Ensure saving is set to false after this operation too
      }
    } else {
      setSaving(false); // Ensure saving is set to false if initial save failed
    }
  };

  if (profileLoading) {
    return (
      <Container component="main" maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your information...</Typography>
      </Container>
    );
  }

  return (
    <Container
      component="main"
      maxWidth={false}
      sx={{
        mt: 8,
        mb: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          maxWidth: '900px',
          boxSizing: 'border-box',
        }}
      >
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Tell Us About Yourself
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
          This information will be used in building your resume.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="fullName"
                required
                fullWidth
                id="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isFormBusy}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                fullWidth
                id="email"
                label="Email Address"
                value={user?.email || ''}
                disabled // Email is generally not editable here
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                fullWidth
                id="phone"
                label="Phone Number (Optional)"
                value={formData.phone}
                onChange={handleChange}
                disabled={isFormBusy}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="address"
                fullWidth
                id="address"
                label="Address (Optional)"
                value={formData.address}
                onChange={handleChange}
                disabled={isFormBusy}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="website"
                fullWidth
                id="website"
                label="Personal Website/Portfolio URL (Optional)"
                value={formData.website}
                onChange={handleChange}
                disabled={isFormBusy}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="linkedin"
                fullWidth
                id="linkedin"
                label="LinkedIn Profile URL (Optional)"
                value={formData.linkedin}
                onChange={handleChange}
                disabled={isFormBusy}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="github"
                fullWidth
                id="github"
                label="GitHub Profile URL (Optional)"
                value={formData.github}
                onChange={handleChange}
                disabled={isFormBusy}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <ProfilePictureUploadSection
                profilePictureKey={profile?.profile_picture_key}
                displayName={formData.fullName}
                userEmail={user?.email}
                imageVersion={imageVersion}
                disabled={isFormBusy}
                uploading={uploadPicture.isPending}
                removing={deletePicture.isPending}
                onUpload={handleProfilePictureUpload}
                onRemove={handleProfilePictureRemove}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
            <Button
              variant="contained"
              onClick={handleSaveAndNext}
              disabled={isFormBusy}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {saving ? 'Saving...' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PersonalInfoSetupPage;
