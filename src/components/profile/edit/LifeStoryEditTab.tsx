import React from 'react';
import { Typography, TextField, Divider } from '@mui/material';
import type { ProfileEditTabProps } from '../../../types/profileEdit';

export const LifeStoryEditTab: React.FC<ProfileEditTabProps> = ({
  lifeStory,
  onLifeStoryChange,
}) => (
  <>
    <Typography variant="subtitle1" gutterBottom>
      Life Story
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <Typography variant="body2" color="text.secondary" paragraph>
      Your life story helps build better resume content and cover letters. Share your career
      journey, motivations, and aspirations. This information helps the AI better understand you
      when generating documents.
    </Typography>

    <TextField
      fullWidth
      label="Life Story"
      name="life_story"
      value={lifeStory}
      onChange={onLifeStoryChange}
      margin="normal"
      multiline
      rows={10}
      placeholder="Tell us about your career journey, professional interests, and aspirations..."
    />
  </>
);
