import React, { useState, Suspense } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../types/models';
import { createDebugger } from '../../utils/debug';
import { useDeferredTabs } from '../../hooks/useDeferredTabs';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useProfileMutations } from '../../hooks/useProfileMutations';
import { TabPanelFallback } from '../../components/common/DeferredTabPanel';
import { PROFILE_VIEW_TABS } from '../../components/profile/view/profileViewTabs';

const debug = createDebugger('ProfilePage');

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tabValue, renderedTab, isTabPending, handleTabChange } = useDeferredTabs(0);
  const { data: profile, isLoading, isError, error: queryError } = useUserProfile();
  const {
    uploadPicture,
    deletePicture,
    uploadSignatureMutation,
    deleteSignatureMutation,
  } = useProfileMutations();

  const [error, setError] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'profile' | 'signature' | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageVersion, setImageVersion] = useState<number>(Date.now());

  const handleEditClick = () => {
    navigate('/profile/edit');
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
    if (!selectedFile || !uploadType) return;

    setError(null);
    try {
      if (uploadType === 'profile') {
        await uploadPicture.mutateAsync(selectedFile);
      } else {
        await uploadSignatureMutation.mutateAsync(selectedFile);
      }
      setImageVersion(Date.now());
      handleCloseUploadDialog();
    } catch (err) {
      debug.error(
        `Failed to upload ${uploadType === 'profile' ? 'profile picture' : 'signature'}:`,
        err
      );
      setError(
        `Failed to upload ${uploadType === 'profile' ? 'profile picture' : 'signature'}. Please try again.`
      );
    }
  };

  const handleDeleteProfilePicture = async () => {
    setError(null);
    try {
      await deletePicture.mutateAsync();
      setImageVersion(Date.now());
    } catch (err) {
      debug.error('Failed to delete profile picture:', err);
      setError('Failed to delete profile picture. Please try again.');
    }
  };

  const handleDeleteSignature = async () => {
    setError(null);
    try {
      await deleteSignatureMutation.mutateAsync();
      setImageVersion(Date.now());
    } catch (err) {
      debug.error('Failed to delete signature:', err);
      setError('Failed to delete signature. Please try again.');
    }
  };

  const ActiveTab = PROFILE_VIEW_TABS[renderedTab]?.Tab;
  const uploading = uploadPicture.isPending || uploadSignatureMutation.isPending;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Profile Information
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error ||
              (queryError instanceof Error
                ? queryError.message
                : 'Unable to load your profile information. Please try refreshing the page.')}
          </Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3, pl: 2, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'right', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={handleEditClick}
        >
          Edit Profile
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={1} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            {PROFILE_VIEW_TABS.map((tab, index) => (
              <Tab
                key={tab.label}
                label={tab.label}
                id={`profile-tab-${index}`}
                aria-controls={`profile-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        <div
          role="tabpanel"
          id={`profile-tabpanel-${renderedTab}`}
          aria-labelledby={`profile-tab-${renderedTab}`}
          aria-busy={isTabPending}
        >
          <Box
            sx={{
              p: 3,
              minHeight: 80,
              opacity: isTabPending ? 0.6 : 1,
              transition: 'opacity 150ms',
            }}
          >
            {ActiveTab && (
              <Suspense fallback={<TabPanelFallback />}>
                <ActiveTab
                  profile={profile}
                  userEmail={user?.email}
                  imageVersion={imageVersion}
                  onOpenUploadDialog={handleOpenUploadDialog}
                  onDeleteProfilePicture={handleDeleteProfilePicture}
                  onDeleteSignature={handleDeleteSignature}
                />
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
              id="file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
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
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
