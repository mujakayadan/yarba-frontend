import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import type { ProfileEditTabProps } from '../../../types/profileEdit';
import { EditSectionHeader } from './EditSectionHeader';

export const PersonalInfoEditTab: React.FC<ProfileEditTabProps> = ({
  personalInfo,
  onPersonalInfoChange,
}) => (
  <>
    <Typography variant="body2" color="text.secondary" paragraph>
      This information appears on your resumes and cover letters. Keep it accurate and up to date.
    </Typography>

    <EditSectionHeader
      first
      title="Basic Information"
      description="Your primary contact details used in document headers and application forms."
    />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="Full Name"
          name="full_name"
          value={personalInfo.full_name}
          onChange={onPersonalInfoChange}
          margin="normal"
          required
          helperText="Displayed as your name on generated documents"
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={personalInfo.email}
          onChange={onPersonalInfoChange}
          margin="normal"
          required
          helperText="Primary contact email for applications"
        />
      </Box>
    </Stack>

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={personalInfo.phone}
          onChange={onPersonalInfoChange}
          margin="normal"
          helperText="Optional. Included on resumes when provided"
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={personalInfo.address}
          onChange={onPersonalInfoChange}
          margin="normal"
          helperText="Optional. City and region are often enough"
        />
      </Box>
    </Stack>

    <EditSectionHeader
      title="Professional Links"
      description="Links to your professional profiles. Only filled links appear on your documents."
    />

    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="LinkedIn"
          name="linkedin"
          value={personalInfo.linkedin}
          onChange={onPersonalInfoChange}
          margin="normal"
          placeholder="https://linkedin.com/in/username"
          helperText="Full URL to your LinkedIn profile"
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="GitHub"
          name="github"
          value={personalInfo.github}
          onChange={onPersonalInfoChange}
          margin="normal"
          placeholder="https://github.com/username"
          helperText="Full URL to your GitHub profile"
        />
      </Box>
    </Stack>

    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 4px)' } }}>
        <TextField
          fullWidth
          label="Personal Website"
          name="website"
          value={personalInfo.website}
          onChange={onPersonalInfoChange}
          margin="normal"
          placeholder="https://example.com"
          helperText="Portfolio, blog, or personal site"
        />
      </Box>
    </Stack>
  </>
);
