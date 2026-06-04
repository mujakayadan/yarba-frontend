import React from 'react';
import { Typography, TextField } from '@mui/material';
import type { ProfileEditTabProps } from '../../../types/profileEdit';
import { EditSectionHeader } from './EditSectionHeader';

export const LifeStoryEditTab: React.FC<ProfileEditTabProps> = ({
  lifeStory,
  onLifeStoryChange,
}) => (
  <>
    <EditSectionHeader
      first
      title="Life Story"
      description="Share your career journey, motivations, and aspirations. The AI uses this background when tailoring resumes and cover letters to specific roles, so the more context you provide, the more personalized your documents will be."
    />

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
      helperText="Include highlights, transitions, and goals you want reflected in generated content"
    />
  </>
);
