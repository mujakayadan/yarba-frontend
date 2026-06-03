import React from 'react';
import { env } from '../../../config/env';
import { Box, Typography, Avatar, Divider, Chip } from '@mui/material';
import type { ProfileViewTabProps } from '../../../types/profileView';

export const PersonalInfoViewTab: React.FC<ProfileViewTabProps> = ({
  profile,
  userEmail,
  imageVersion,
}) => (
  <>
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mb: 3 }}>
      <Box sx={{ mr: { md: 4 }, mb: { xs: 3, md: 0 }, textAlign: 'center' }}>
        {profile.profile_picture_key ? (
          <img
            src={`${env.cloudfrontUrl}${profile.profile_picture_key}?v=${imageVersion}`}
            alt={profile.personal_information?.full_name || 'User profile picture'}
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Avatar
            sx={{
              width: 100,
              height: 100,
              fontSize: 40,
              bgcolor: 'primary.main',
              mx: 'auto',
            }}
          >
            {profile.personal_information?.full_name?.charAt(0) ||
              userEmail?.charAt(0)?.toUpperCase() ||
              '?'}
          </Avatar>
        )}
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h5" gutterBottom>
          {profile.personal_information?.full_name}
        </Typography>

        <Typography variant="body1" gutterBottom color="text.secondary">
          {profile.personal_information?.email}
        </Typography>

        {profile.personal_information?.phone && (
          <Typography variant="body1" gutterBottom>
            📱 {profile.personal_information.phone}
          </Typography>
        )}

        {profile.personal_information?.address && (
          <Typography variant="body1" gutterBottom>
            📍 {profile.personal_information.address}
          </Typography>
        )}
      </Box>
    </Box>

    <Divider sx={{ my: 3 }} />

    <Typography variant="h6" gutterBottom>
      Professional Links
    </Typography>

    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {profile.personal_information?.linkedin ? (
        <Chip
          label="LinkedIn"
          component="a"
          href={profile.personal_information.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          clickable
        />
      ) : (
        <Chip label="LinkedIn" disabled variant="outlined" />
      )}

      {profile.personal_information?.github ? (
        <Chip
          label="GitHub"
          component="a"
          href={profile.personal_information.github}
          target="_blank"
          rel="noopener noreferrer"
          clickable
        />
      ) : (
        <Chip label="GitHub" disabled variant="outlined" />
      )}

      {profile.personal_information?.website ? (
        <Chip
          label="Website"
          component="a"
          href={profile.personal_information.website}
          target="_blank"
          rel="noopener noreferrer"
          clickable
        />
      ) : (
        <Chip label="Website" disabled variant="outlined" />
      )}
    </Box>
  </>
);
