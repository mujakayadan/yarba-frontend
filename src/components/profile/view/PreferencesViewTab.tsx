import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import type { ProfileViewTabProps } from '../../../types/profileView';

export const PreferencesViewTab: React.FC<ProfileViewTabProps> = ({ profile }) => (
  <Box sx={{ width: '100%' }}>
    <Typography variant="h6" gutterBottom>
      Career Summary (Prompt Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Minimum Words:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.career_summary?.min_words || 'Not set'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Maximum Words:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.career_summary?.max_words || 'Not set'}
        </Typography>
      </Box>
    </Box>

    <Typography variant="h6" gutterBottom>
      Work Experience (Prompt Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Maximum Jobs:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.work_experience?.max_jobs || 'Not set'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Bullet Points Per Job:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.work_experience?.bullet_points_per_job || 'Not set'}
        </Typography>
      </Box>
    </Box>

    <Typography variant="h6" gutterBottom>
      Projects (Prompt Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Maximum Projects:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.project?.max_projects || 'Not set'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Bullet Points Per Project:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.project?.bullet_points_per_project || 'Not set'}
        </Typography>
      </Box>
    </Box>

    <Typography variant="h6" gutterBottom>
      Skills (Prompt Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Maximum Categories:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.skills?.max_categories || 'Not set'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Min Skills Per Category:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.skills?.min_per_category || 'Not set'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Max Skills Per Category:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.skills?.max_per_category || 'Not set'}
        </Typography>
      </Box>
    </Box>

    <Typography variant="h6" gutterBottom>
      Education (Prompt Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Maximum Entries:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.education?.max_entries || 'Not set'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Maximum Courses:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.education?.max_courses || 'Not set'}
        </Typography>
      </Box>
    </Box>

    <Typography variant="h6" gutterBottom>
      Cover Letter (Prompt Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Paragraphs:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.cover_letter?.paragraphs || 'Not set'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Target Age:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.cover_letter?.target_age || 'Not set'}
        </Typography>
      </Box>
    </Box>

    <Typography variant="h6" gutterBottom>
      Awards & Publications (Prompt Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Maximum Awards:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.awards?.max_awards || 'Not set'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Maximum Publications:
        </Typography>
        <Typography variant="body2">
          {profile.prompt_preferences?.publications?.max_publications || 'Not set'}
        </Typography>
      </Box>
    </Box>

    <Typography variant="h6" gutterBottom>
      Default Templates (System Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Resume Template:
        </Typography>
        <Typography variant="body2">
          {profile.system_preferences?.templates?.default_resume_template_id || 'Not set'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Cover Letter Template:
        </Typography>
        <Typography variant="body2">
          {profile.system_preferences?.templates?.default_cover_letter_template_id || 'Not set'}
        </Typography>
      </Box>
    </Box>

    <Typography variant="h6" gutterBottom>
      Privacy Settings (System Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Typography variant="body2" color="text.secondary">
        {Object.keys(profile.system_preferences?.privacy || {}).length > 0
          ? 'Custom privacy settings configured'
          : 'No privacy settings configured'}
      </Typography>
    </Box>

    <Typography variant="h6" gutterBottom>
      Notification Settings (System Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Typography variant="body2" color="text.secondary">
        {Object.keys(profile.system_preferences?.notifications || {}).length > 0
          ? 'Custom notification settings configured'
          : 'No notification settings configured'}
      </Typography>
    </Box>

    <Typography variant="h6" gutterBottom>
      AI Settings (System Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Model Name:
        </Typography>
        <Typography variant="body2">
          {profile.system_preferences?.llm?.model_name || 'Not set'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Temperature:
        </Typography>
        <Typography variant="body2">
          {profile.system_preferences?.llm?.temperature || 'Not set'}
        </Typography>
      </Box>
    </Box>

    <Typography variant="h6" gutterBottom>
      Feature Preferences (System Preferences)
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Dark Mode:
        </Typography>
        <Typography variant="body2">
          {profile.system_preferences?.features?.dark_mode ? 'Enabled' : 'Disabled'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Auto Save:
        </Typography>
        <Typography variant="body2">
          {profile.system_preferences?.features?.auto_save ? 'Enabled' : 'Disabled'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ width: 200, fontWeight: 'bold' }}>
          Check Clearance:
        </Typography>
        <Typography variant="body2">
          {profile.system_preferences?.features?.check_clearance ? 'Enabled' : 'Disabled'}
        </Typography>
      </Box>
    </Box>
  </Box>
);
