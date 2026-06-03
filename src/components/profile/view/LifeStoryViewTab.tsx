import React from 'react';
import { Typography } from '@mui/material';
import type { ProfileViewTabProps } from '../../../types/profileView';

export const LifeStoryViewTab: React.FC<ProfileViewTabProps> = ({ profile }) => (
  <>
    <Typography variant="h6" gutterBottom>
      Life Story
    </Typography>
    {profile.life_story ? (
      <Typography variant="body1" paragraph>
        {profile.life_story}
      </Typography>
    ) : (
      <Typography variant="body2" color="text.secondary">
        No life story provided. Add your career journey, motivations, and aspirations to help the AI
        better understand you.
      </Typography>
    )}
  </>
);
