import React, { useRef, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Typography } from '@mui/material';
import { Delete as DeleteIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { env } from '../../config/env';
import { pickProfileImage } from '../../platform/nativeFilePicker';
import { isNativeRuntime } from '../../platform/nativeRuntime';
import { extractApiErrorMessage } from '../../utils/apiErrors';
import { validateImageFile } from '../../utils/uploadFiles';

interface ProfilePictureUploadSectionProps {
  profilePictureKey?: string;
  displayName?: string;
  userEmail?: string;
  imageVersion: number;
  disabled?: boolean;
  uploading?: boolean;
  removing?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onError?: (message: string) => void;
}

export const ProfilePictureUploadSection: React.FC<ProfilePictureUploadSectionProps> = ({
  profilePictureKey,
  displayName,
  userEmail,
  imageVersion,
  disabled = false,
  uploading = false,
  removing = false,
  onUpload,
  onRemove,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const isBusy = disabled || uploading || removing || picking;
  const avatarInitial =
    displayName?.trim().charAt(0)?.toUpperCase() || userEmail?.charAt(0)?.toUpperCase() || '?';

  const applySelectedFile = (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }
    onUpload(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      applySelectedFile(file);
    }
    event.target.value = '';
  };

  const handleChoosePicture = async () => {
    if (!isNativeRuntime()) {
      fileInputRef.current?.click();
      return;
    }

    setPicking(true);
    try {
      const file = await pickProfileImage();
      if (file) {
        applySelectedFile(file);
      }
    } catch (error: unknown) {
      onError?.(extractApiErrorMessage(error, 'Could not open that photo. Please try again.'));
    } finally {
      setPicking(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        px: 1,
      }}
    >
      <Typography variant="h6" gutterBottom align="center">
        Profile Picture (Optional)
      </Typography>
      <Typography
        variant="body2"
        align="center"
        sx={{
          color: 'text.secondary',
          mb: 2,
          maxWidth: 420,
        }}
      >
        Shown in the app navigation and on your profile. You can skip this and add one later. JPG,
        PNG, WEBP, or GIF, up to 5 MB.
      </Typography>

      {profilePictureKey ? (
        <Box sx={{ mb: 2 }}>
          <img
            src={`${env.cloudfrontUrl}${profilePictureKey}?v=${imageVersion}`}
            alt={displayName || 'Profile picture'}
            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%' }}
          />
        </Box>
      ) : (
        <Avatar sx={{ width: 120, height: 120, fontSize: 48, mb: 2 }}>{avatarInitial}</Avatar>
      )}

      <input
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        type="file"
        hidden
        onChange={handleFileChange}
        disabled={isBusy}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={
            uploading || picking ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PhotoCameraIcon />
            )
          }
          onClick={() => {
            void handleChoosePicture();
          }}
          disabled={isBusy}
          sx={{ minHeight: 44 }}
        >
          {picking
            ? 'Opening photos…'
            : uploading
              ? 'Uploading…'
              : profilePictureKey
                ? 'Change Picture'
                : 'Upload Picture'}
        </Button>

        {profilePictureKey && (
          <Button
            variant="outlined"
            color="error"
            startIcon={removing ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            onClick={onRemove}
            disabled={isBusy}
            sx={{ minHeight: 44 }}
          >
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        )}
      </Box>
    </Box>
  );
};
