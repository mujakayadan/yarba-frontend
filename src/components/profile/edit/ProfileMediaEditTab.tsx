import React from 'react';
import { env } from '../../../config/env';
import { Box, Typography, Button, Paper, Avatar } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { ProfileEditTabProps } from '../../../types/profileEdit';

export const ProfileMediaEditTab: React.FC<ProfileEditTabProps> = ({
  profile,
  userEmail,
  imageVersion,
  onOpenUploadDialog,
  onDeleteProfilePicture,
  onDeleteSignature,
}) => {
  if (!profile || !onOpenUploadDialog || !onDeleteProfilePicture || !onDeleteSignature) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Profile Picture
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          {profile.profile_picture_key ? (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <img
                src={`${env.cloudfrontUrl}${profile.profile_picture_key}?v=${imageVersion}`}
                alt={profile.personal_information?.full_name || 'User profile'}
                style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: '50%' }}
              />
            </Box>
          ) : (
            <Avatar sx={{ width: 150, height: 150, fontSize: 60, mb: 2 }}>
              {profile.personal_information?.full_name?.charAt(0) ||
                userEmail?.charAt(0)?.toUpperCase() ||
                '?'}
            </Avatar>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<PhotoCameraIcon />}
              onClick={() => onOpenUploadDialog('profile')}
            >
              {profile.profile_picture_key ? 'Change Picture' : 'Upload Picture'}
            </Button>

            {profile.profile_picture_key && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDeleteProfilePicture}
              >
                Remove
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Signature
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          {profile.signature_key ? (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <img
                src={`${env.cloudfrontUrl}${profile.signature_key}?v=${imageVersion}`}
                alt="Signature"
                style={{ maxWidth: '100%', maxHeight: 150 }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No signature uploaded
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<PhotoCameraIcon />}
              onClick={() => onOpenUploadDialog('signature')}
            >
              {profile.signature_key ? 'Change Signature' : 'Upload Signature'}
            </Button>

            {profile.signature_key && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDeleteSignature}
              >
                Remove
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
